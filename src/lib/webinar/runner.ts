// Jádro scheduleru: projde registrace, zjistí co má odejít, a odešle to.
// Volá ho cron endpoint. Idempotenci drží unikátní index na message_log,
// takže souběžné běhy si zprávy nepřepíšou ani nepošlou dvakrát.

import { czVocative, plunkSendEmail } from '@/lib/plunk';
import {
    claimStep,
    countWhatsAppSentToday,
    finishStep,
    getEdition,
    listDoneSteps,
    listRegistrations,
    type Edition,
    type Registration,
} from './db';
import { STEPS, stepDueAt, stepMissed, type Step, type StepContext } from './schedule';
import { OPT_OUT_HINT, pickVariant, sendText, sessionWorking, sleep, WA_DAILY_CAP } from './waha';

const SITE = process.env.NEXT_PUBLIC_BASE_URL || 'https://growbeyond.cz';

/** Kolik času smí jeden běh cronu zabrat, ať HTTP volání nevyprší. */
const RUN_BUDGET_MS = Number(process.env.WEBINAR_CRON_BUDGET_MS || 50000);

/** Rozestup u první zprávy člověku. Nové konverzace jsou to citlivé, co WhatsApp hlídá. */
const GAP_FIRST_MIN = 20000;
const GAP_FIRST_MAX = 40000;
/** Rozestup u dalších zpráv do už otevřené konverzace. */
const GAP_FOLLOWUP_MIN = 3000;
const GAP_FOLLOWUP_MAX = 8000;

const rand = (min: number, max: number) => min + Math.floor(Math.random() * Math.max(1, max - min));

function buildContext(edition: Edition, reg: Registration): StepContext {
    const start = new Date(edition.starts_at);
    const fmt = new Intl.DateTimeFormat('cs-CZ', {
        weekday: 'long',
        day: 'numeric',
        month: 'numeric',
        timeZone: edition.timezone || 'Europe/Prague',
    });
    const timeLabel = new Intl.DateTimeFormat('cs-CZ', {
        hour: '2-digit',
        minute: '2-digit',
        timeZone: edition.timezone || 'Europe/Prague',
    }).format(start);

    return {
        edition,
        reg,
        vocative: czVocative(reg.name || undefined) || '',
        pageUrl: `${SITE}/webinar/dekujeme?t=${reg.token}`,
        joinUrl: reg.zoom_join_url || edition.zoom_join_url || `${SITE}/webinar/dekujeme?t=${reg.token}`,
        groupUrl: edition.wa_group_invite_url || '',
        applyUrl: `${SITE}/webinar/prihlaska?t=${reg.token}`,
        whenLabel: `v ${fmt.format(start)} v ${timeLabel}`,
        timeLabel,
    };
}

export type RunSummary = {
    ok: boolean;
    reason?: string;
    emailsSent: number;
    waSent: number;
    skipped: number;
    failed: number;
    pendingAfterRun: number;
};

type Job = { reg: Registration; step: Step; ctx: StepContext; due: Date };

/**
 * Zapíše krok jako přeskočený, aby se k němu scheduler už nevracel.
 * Zabrání se přes stejný unikátní index jako u odeslání, takže souběžný
 * běh nemůže krok zapsat dvakrát.
 */
async function markSkipped(reg: Registration, step: Step, due: Date): Promise<void> {
    const claimed = await claimStep({
        registration_id: reg.id,
        step_key: step.key,
        channel: step.channel,
        scheduled_for: due.toISOString(),
    });
    if (claimed) await finishStep(reg.id, step.key, { status: 'skipped' });
}

export async function runScheduler(opts: { dryRun?: boolean } = {}): Promise<RunSummary> {
    const summary: RunSummary = { ok: true, emailsSent: 0, waSent: 0, skipped: 0, failed: 0, pendingAfterRun: 0 };
    const startedAt = Date.now();

    const edition = await getEdition();
    if (!edition) return { ...summary, ok: false, reason: 'edice nenalezena' };

    const [registrations, doneSteps] = await Promise.all([listRegistrations(edition.id), listDoneSteps()]);

    const now = Date.now();
    const emailJobs: Job[] = [];
    const waJobs: Job[] = [];

    for (const reg of registrations) {
        const done = doneSteps.get(reg.id) || new Set<string>();
        const ctx = buildContext(edition, reg);

        for (const step of STEPS) {
            if (done.has(step.key)) continue;

            const due = stepDueAt(step, edition, reg);
            if (due.getTime() > now) continue;

            // Krok, který registrace propásla (přihlásila se až po jeho čase),
            // zapíšeme jako přeskočený, ať se k němu scheduler nevrací.
            if (stepMissed(step, edition, reg)) {
                if (!opts.dryRun) await markSkipped(reg, step, due);
                summary.skipped++;
                continue;
            }

            if (step.when && !step.when(ctx)) {
                // Podmínka zatím neplatí. U kroků po webináři se může splnit
                // později (až doběhne synchronizace účasti), proto nezapisujeme
                // skip a necháme krok na příští běh.
                if (!step.key.startsWith('post-')) {
                    if (!opts.dryRun) await markSkipped(reg, step, due);
                    summary.skipped++;
                }
                continue;
            }

            (step.channel === 'email' ? emailJobs : waJobs).push({ reg, step, ctx, due });
        }
    }

    // Nejdřív to, co mělo odejít nejdávněji.
    emailJobs.sort((a, b) => a.due.getTime() - b.due.getTime());
    waJobs.sort((a, b) => a.due.getTime() - b.due.getTime());

    if (opts.dryRun) {
        return {
            ...summary,
            pendingAfterRun: emailJobs.length + waJobs.length,
            emailsSent: emailJobs.length,
            waSent: waJobs.length,
        };
    }

    /* ------------------------------------------------------------- emaily */
    for (const job of emailJobs) {
        if (Date.now() - startedAt > RUN_BUDGET_MS) break;

        const claimed = await claimStep({
            registration_id: job.reg.id,
            step_key: job.step.key,
            channel: 'email',
            scheduled_for: job.due.toISOString(),
        });
        if (!claimed) continue;

        const subject = job.step.subject?.(job.ctx) || job.ctx.edition.title;
        const ok = await plunkSendEmail({ to: job.reg.email, subject, body: job.step.body(job.ctx) });

        await finishStep(job.reg.id, job.step.key, {
            status: ok ? 'sent' : 'failed',
            ...(ok ? {} : { error: 'Plunk odmítl zprávu' }),
        });
        if (ok) summary.emailsSent++;
        else summary.failed++;
    }

    /* ---------------------------------------------------------- WhatsApp */
    if (waJobs.length) {
        const working = await sessionWorking();
        if (!working) {
            summary.reason = 'WAHA session neběží, WhatsApp přeskočen';
        } else {
            const sentToday = await countWhatsAppSentToday();
            let budgetLeft = Math.max(0, WA_DAILY_CAP - sentToday);

            for (const job of waJobs) {
                if (budgetLeft <= 0) {
                    summary.reason = `denní strop WhatsApp zpráv ${WA_DAILY_CAP} vyčerpán`;
                    break;
                }
                if (Date.now() - startedAt > RUN_BUDGET_MS) break;
                if (!job.reg.phone) continue;

                const claimed = await claimStep({
                    registration_id: job.reg.id,
                    step_key: job.step.key,
                    channel: 'whatsapp',
                    scheduled_for: job.due.toISOString(),
                });
                if (!claimed) continue;

                const variants = job.step.variants || [job.step.body];
                const variant = pickVariant(job.reg.id, variants.length);
                const isFirstContact = job.step.key === 'confirm-wa';
                const text = variants[variant](job.ctx) + (isFirstContact ? `\n\n${OPT_OUT_HINT}` : '');

                const res = await sendText(job.reg.phone, text);
                await finishStep(job.reg.id, job.step.key, {
                    status: res.ok ? 'sent' : 'failed',
                    variant,
                    ...(res.ok ? {} : { error: res.error.slice(0, 400) }),
                });

                if (res.ok) {
                    summary.waSent++;
                    budgetLeft--;
                } else {
                    summary.failed++;
                }

                // Rozestup. První kontakt je pro WhatsApp citlivý, tam jdeme pomalu.
                await sleep(
                    isFirstContact ? rand(GAP_FIRST_MIN, GAP_FIRST_MAX) : rand(GAP_FOLLOWUP_MIN, GAP_FOLLOWUP_MAX),
                );
            }
        }
    }

    summary.pendingAfterRun =
        emailJobs.length + waJobs.length - summary.emailsSent - summary.waSent - summary.failed;
    return summary;
}

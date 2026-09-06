// Otevření registračního popupu z libovolného CTA na /webinar (stejný vzor jako /strategie).
export const WEBINAR_FORM_EVENT = 'open-webinar-form';

export function openWebinarForm() {
    if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event(WEBINAR_FORM_EVENT));
    }
}

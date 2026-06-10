// Všechna CTA na /strategie scrollují k opt-in formuláři (e-mail + IG).
export function openStrategieForm() {
    if (typeof window !== 'undefined') {
        document.getElementById('optin')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
}

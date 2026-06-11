// Event-based otevření opt-in popupu z libovolného CTA na /strategie.
export const STRATEGIE_FORM_EVENT = 'open-strategie-form';

export function openStrategieForm() {
    if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event(STRATEGIE_FORM_EVENT));
    }
}

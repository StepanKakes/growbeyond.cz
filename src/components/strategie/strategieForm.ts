// Jednoduchá event-based brána pro otevření formulářového popupu z libovolného
// CTA na stránce /strategie, bez prop-drillingu nebo kontextu.
export const STRATEGIE_FORM_EVENT = 'open-strategie-form';

export function openStrategieForm() {
    if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event(STRATEGIE_FORM_EVENT));
    }
}

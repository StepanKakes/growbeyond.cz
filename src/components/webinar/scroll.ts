export const REGISTRATION_ID = 'registrace';

export function scrollToRegistration() {
    if (typeof document === 'undefined') return;
    document.getElementById(REGISTRATION_ID)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

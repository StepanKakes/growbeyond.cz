export interface Resource {
    id: string;
    name: string; // Title
    slug: string;
    publicTitle: string;
    subtitle: string;
    buttonText: string;
    plunkEvent: string;
    kitFormId: string;
    kitTagId: string;
    kitSequenceId?: string;
    coverTitle: string;
    coverSubtitle: string;
    redirectUrl?: string;
}

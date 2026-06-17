import { MetaPixel } from '@/components/strategie/MetaPixel';

// Wrapuje /strategie i /strategie/[id] → Meta Pixel běží jen na strategie funnelu.
export default function StrategieLayout({ children }: { children: React.ReactNode }) {
    return (
        <>
            {children}
            <MetaPixel />
        </>
    );
}

import { getResourceBySlug, getAllResourceSlugs } from '@/lib/notion';
import { instrumentSerif } from "@/app/fonts";
import { notFound } from 'next/navigation';
import { CssBook } from '@/components/CssBook';
import { ResourceForm } from '@/components/ResourceForm';

export const revalidate = 60;

export async function generateStaticParams() {
    const slugs = await getAllResourceSlugs();
    return slugs.map((slug) => ({
        slug: slug,
    }));
}

function parseHeadline(text: string) {
    // Split by * to find emphasized parts
    const parts = text.split('*');
    return parts.map((part, index) => {
        if (index % 2 === 1) {
            return (
                <span key={index} className={`${instrumentSerif.className} italic font-normal text-[#B5B5B5]`}>
                    {part}
                </span>
            );
        }
        return <span key={index}>{part}</span>;
    });
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    const resource = await getResourceBySlug(slug);

    if (!resource) {
        notFound();
    }

    return (
        <div className="min-h-screen relative flex items-center justify-center p-6 lg:p-20">
            <div className="max-w-7xl w-full grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24 items-center">

                {/* Left Column: Content */}
                <div className="space-y-5 flex flex-col order-1 lg:order-none relative">
                    {/* Top Logo - Mobile: standard block, Desktop: absolute top left of container */}
                    <div className="w-full text-left mb-4 lg:mb-0 lg:absolute lg:-top-24 lg:left-0">
                        <span className={`${instrumentSerif.className} italic text-white text-3xl tracking-wide`}>Beyond</span>
                    </div>

                    <h1 className="text-4xl lg:text-6xl font-bold tracking-[-0.05em] leading-[1.1] text-white">
                        {parseHeadline(resource.publicTitle || resource.name)}
                    </h1>

                    <p className="text-white leading-tight text-sm lg:text-lg max-w-none">
                        {resource.subtitle}
                    </p>

                    {/* Form */}
                    <ResourceForm />
                </div>

                {/* Right Column: 3D Book */}
                {/* On mobile, standard flow puts this second (below content). This is desired. */}
                <div className="flex justify-center perspective-1000 order-2 lg:order-none mt-8 lg:mt-0">
                    <CssBook
                        title={resource.name}
                        coverTitle={resource.coverTitle}
                        coverSubtitle={resource.coverSubtitle}
                    />
                </div>
            </div>
        </div>
    );
}

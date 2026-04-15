import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'SOP Knihovna - Beyond',
  description: 'Knihovna materiálů, postupů a návodů pro kouče, podnikatele a tvůrce.',
};

export default function SOPLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import MemberProfile from "@/components/MemberProfile";
import { getPublishedMember } from "@/lib/data";

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const member = await getPublishedMember(slug);
  if (!member) return { title: "Not Found" };

  return {
    title: member.seoTitle || member.name,
    description: member.seoDescription || member.headline || member.role,
    robots: member.noindex
      ? { index: false, follow: false }
      : { index: true, follow: true },
    openGraph: {
      title: member.seoTitle || member.name,
      description: member.seoDescription || member.headline || member.role,
      images: member.image ? [{ url: member.image }] : undefined,
    },
  };
}

export default async function MemberPage({ params }: Props) {
  const { slug } = await params;
  const member = await getPublishedMember(slug);
  if (!member) notFound();
  return <MemberProfile member={member} />;
}

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import MemberProfile from "@/components/MemberProfile";
import { getEntriesByIds, getPublishedMember } from "@/lib/data";

export async function generateMetadata(): Promise<Metadata> {
  const member = await getPublishedMember("el");
  if (!member) {
    return {
      title: "EL Bonuan",
      robots: { index: false, follow: false },
    };
  }

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

export default async function ELBonuanPage() {
  const member = await getPublishedMember("el");
  if (!member) notFound();
  const selectedWork = await getEntriesByIds(member.selectedWorkIds || []);
  return <MemberProfile member={member} selectedWork={selectedWork} />;
}

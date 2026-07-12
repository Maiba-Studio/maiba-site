"use client";

import { use } from "react";
import MemberEditor from "@/components/admin/MemberEditor";

export default function EditMemberPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  return <MemberEditor memberId={id} />;
}

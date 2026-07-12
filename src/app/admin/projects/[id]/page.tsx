"use client";

import { use } from "react";
import ProjectEditor from "@/components/admin/ProjectEditor";

export default function EditProjectPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  return <ProjectEditor projectId={id} />;
}

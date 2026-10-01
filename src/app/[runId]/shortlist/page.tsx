import { redirect } from "next/navigation";

export default async function ShortlistPage({ params }: { params: Promise<{ runId: string }> }) {
  const { runId } = await params;
  redirect(`/${runId}/pass2`);
}

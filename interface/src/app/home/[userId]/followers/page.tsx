import type { Metadata } from "next";
import FollowersList from "@/components/follow/FollowersList";

interface PageProps {
  params: Promise<{ userId: string }>;
  searchParams?: { [key: string]: string | string[] | undefined };
}

export default async function Page({ params }: PageProps) {
  const { userId } = await params;
  return <FollowersList userId={userId} />;
}

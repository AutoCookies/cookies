// app/home/[userId]/followers/page.tsx

import FollowersList from "@/components/follow/FollowersList";

export default async function Page({ params }: { params: { userId: string }}) {
  const { userId } = await params;

  console.log(`Followers Page - User ID: ${userId}`);

  return <FollowersList userId={userId} />;
}

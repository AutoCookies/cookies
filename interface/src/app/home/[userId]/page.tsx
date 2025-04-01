export default async function PersonalPage({ params }: { params: { userId: string } }) {
  const { userId } = await params;

  return (
    <div>
      <div>This is {userId} personal page</div>
    </div>
  );
}

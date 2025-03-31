export default function PersonalPage({ params }: { params: { userId: string } }) {
  return (
    <div>
      <div>This is {params.userId} personal page</div>
    </div>
  );
}

import UserPostPage from "@/components/user/UserPostPage";
import styles from "@/styles/user/PersonalPage.module.css"; 

export default async function PersonalPage({ params }: { params: { userId: string } }) {
  const { userId } = await params;

  return (
    <div className={styles.personalPageContainer}>
      <div className={styles.personalPageHeader}>
        <h1>Trang cá nhân</h1>
      </div>
      <UserPostPage userId={userId} />
    </div>
  );
}

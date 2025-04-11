import { handleGetUserImagePage } from "@/utils/user/handleGetUserImagePage";
import styles from "@/styles/user/UserProfile.module.css";
import { handleAuthMe } from "@/utils/me/handleAuthMe";
import UserProfileHeader from "@/components/user/UserProfileHeader";

export default async function UserLayout({ params, children }: { params: { userId: string }, children: React.ReactNode }) {
  const { userId } = await params;
  const { data, error } = await handleGetUserImagePage(userId);
  const { authData: authUser } = await handleAuthMe();

  // console.log(`User Profile Layout - User ID: ${userId}`);
  // console.log("Auth User Data:", authUser._id);
  // console.log("User Data:", data);

  return (
    <div className={styles.container}>
      {error ? (
        <div className={styles.error}>Error: {error}</div>
      ) : (
        <UserProfileHeader
          data={data}
          profileUserId={userId?.toString() ?? ""}
          currentUserId={authUser?._id ?? ""}
        />
      )}
      {/* User Content */}
      <div className={styles.content}>
        {children}
        </div>
    </div>
  );
}

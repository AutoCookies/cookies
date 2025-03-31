import { handleGetUserImagePage } from "@/utils/user/handleGetUserImagePage";
import styles from "@/styles/user/UserProfile.module.css";

export default async function Layout({ params, children }: { params: { userId: string }, children: React.ReactNode }) {
  const { data, error } = await handleGetUserImagePage(params.userId);

  return (
    <div className={styles.container}>
      {error ? (
        <div className={styles.error}>Error: {error}</div>
      ) : (
        <>
          {/* Cover Photo */}
          <div className={styles.coverPhoto}>
            <img
              src={data?.coverPhoto ?? "/default/default-cover.jpg"}
              alt="Cover Photo"
              className={styles.coverImage}
            />
          </div>

          {/* Profile Info */}
          <div className={styles.profileSection}>
            {/* Profile Picture */}
            <div className={styles.profilePicture}>
              <img
                src={data?.profilePicture ?? "/default/default-profile.jpeg"}
                alt="Profile Picture"
                className={styles.profileImage}
              />
            </div>

            {/* Username */}
            <h2 className={styles.username}>{data?.username ?? "Unknown User"}</h2>
          </div>
        </>
      )}

      {/* User Content */}
      <div className={styles.content}>{children}</div>
    </div>
  );
}

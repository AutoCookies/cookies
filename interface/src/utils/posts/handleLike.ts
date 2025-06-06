import { ENV_VARS } from "@/lib/envVars";
import { handleRefreshToken } from "@/utils/auth/handleRefreshToken";

export const handleLike = async (
  postId: string,
  liked: boolean,
  onSuccess: () => void
) => {
  let retried = false;

  while (true) {
    try {
      console.debug(`[handleLike] postId=${postId}, liked=${liked}, retried=${retried}`);

      const response = await fetch(
        `${ENV_VARS.API_ROUTE}/likes/post/${postId}/like`,
        {
          method: liked ? "DELETE" : "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
        }
      );

      // Nếu token hết hạn (status 401) thì thử refresh và retry
      if (response.status === 401 && !retried) {
        console.debug("[handleLike] Nhận 401. Đang refresh token...");
        const refreshed = await handleRefreshToken();
        if (refreshed) {
          retried = true;
          console.debug("[handleLike] Refresh token thành công, retry lại like.");
          continue;
        } else {
          console.debug("[handleLike] Refresh token thất bại, buộc logout.");
          throw new Error("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
        }
      }

      if (!response.ok) {
        const errorData = await response.json();
        console.debug("[handleLike] Response not ok:", errorData);
        throw new Error(errorData?.message || "Không thể like bài viết!");
      }

      console.debug("[handleLike] Like/Unlike thành công!");
      onSuccess();
      break;
    } catch (error: any) {
      console.error("Lỗi khi like bài viết:", error);
      break;
    }
  }
};

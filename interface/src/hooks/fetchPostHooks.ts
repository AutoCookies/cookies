import { useEffect } from "react";
import { io, Socket } from "socket.io-client";

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:3001";

export function useFetchPosts(onNewPost: (post: any) => void) {
  useEffect(() => {
    const socket = io(SOCKET_URL, { withCredentials: true });

    socket.on("new-post", (post: any) => {
      onNewPost(post);
    });

    return () => {
      socket.disconnect();
    };
  }, [onNewPost]);
}
import { useEffect } from "react";
import { io, Socket } from "socket.io-client";
import { ENV_VARS } from "@/lib/envVars";

const SOCKET_URL = ENV_VARS.PUBLIC_SOCKET_URL;

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
// components/UserContext.tsx
"use client";
import React, { createContext, useContext } from "react";

interface UserContextType {
  userId: string;
  username: string;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({
  userId,
  username,
  children,
}: {
  userId: string;
  username: string;
  children: React.ReactNode;
}) => {
  return (
    <UserContext.Provider value={{ userId, username }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
};

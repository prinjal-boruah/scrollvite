"use client";

import { GoogleOAuthProvider } from "@react-oauth/google";

export default function Providers({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <GoogleOAuthProvider clientId="425155079942-a82q3nlgnpu7ulghp7dqp98effirdi2l.apps.googleusercontent.com">
      {children}
    </GoogleOAuthProvider>
  );
}

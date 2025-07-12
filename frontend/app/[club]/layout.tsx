import type React from "react";
import SystemStatusFooter from "@/components/SystemStatusFooter";

export default function ClubLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {children}
      <SystemStatusFooter />
    </>
  );
}

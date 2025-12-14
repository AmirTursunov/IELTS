// components/ConditionalLayout.tsx
"use client";

import { usePathname } from "next/navigation";
import Navbar from "./Navbar";
import Footer from "./Footer";

export default function ConditionalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  // Paths where navbar and footer should be hidden
  const hideLayoutPaths = ["/sign-in", "/sign-up"];
  const isAdminPath = pathname?.startsWith("/admin");

  const shouldHideLayout =
    hideLayoutPaths.includes(pathname || "") || isAdminPath;

  return (
    <>
      {!shouldHideLayout && <Navbar />}
      {children}
      {!shouldHideLayout && <Footer />}
    </>
  );
}

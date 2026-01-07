// app/components/ConditionalLayout.tsx
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

  // Navbar va Footer ko'rinmaydigan sahifalar ro'yxati
  const hideLayoutPaths = [
    "/admin",
    "/sign-in",
    "/sign-up",
    "/forgot-password",
    "/reset-password",
    "/dashboard", // /dashboard uchun
    "/leaderboard",
    "/listening/", // /listening/[id] uchun
    "/reading/", // /reading/[id] uchun (kelajakda)
    "/writing/", // /writing/[id] uchun (kelajakda)
    "/speaking/", // /speaking/[id] uchun (kelajakda)
  ];

  // Agar pathname ro'yxatdagi path bilan boshlanayotgan bo'lsa, layout ko'rsatilmasin
  const shouldHideLayout = hideLayoutPaths.some((path) =>
    pathname?.startsWith(path)
  );

  // Agar /listening yoki /reading page bo'lsa (ID siz), layout ko'rsatilsin
  const isListPage =
    pathname === "/listening" ||
    pathname === "/reading" ||
    pathname === "/writing" ||
    pathname === "/speaking";

  if (shouldHideLayout && !isListPage) {
    return <>{children}</>;
  }

  return (
    <>
      <Navbar />
      {children}
      <Footer />
    </>
  );
}

import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Talentscope｜面試協作平台",
  description: "串起招募、出題、作答與技術審核的三角色面試協作平台。",
  icons: { icon: "/favicon.svg" },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="zh-Hant">
      <body>{children}</body>
    </html>
  );
}

import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "水晶定制",
  description: "基于完整命理分析的水晶手串定制体验",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}

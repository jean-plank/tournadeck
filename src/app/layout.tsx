import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ChildrenFC } from "./models/ChildrenFC";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "tournadeck",
  description: "WIP",
};

const RootLayout: ChildrenFC = ({ children }) => {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  );
};

export default RootLayout;

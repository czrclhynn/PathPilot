import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = {
  title: "PathPilot — Your next chapter starts here",
  description:
    "Personalized career roadmaps, learning plans, and skill guidance for students.",
};
export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

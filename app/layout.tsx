import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Critical Thinking Check",
  description:
    "A free, typed 16-question assessment with response-grounded feedback on assumptions, evidence, alternatives, and uncertainty.",
  robots: {
    index: false,
    follow: false,
  },
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en-US">
      <body className="antialiased">{children}</body>
    </html>
  );
}

import type { Metadata } from "next";
import { Inter, Manrope } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
});

const manrope = Manrope({
  variable: "--font-headline",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Media Commerce Platform",
  description: "The Cinematic Canvas",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`dark ${inter.variable} ${manrope.variable} h-full antialiased`}
      style={{ colorScheme: "dark" }}
    >
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />
        <style>{`
          .material-symbols-outlined {
            font-variation-settings: "FILL" 0, "wght" 400, "GRAD" 0, "opsz" 24;
          }
        `}</style>
      </head>
      <body className="min-h-full flex flex-col bg-[#0e0e10] text-[#f9f5f8]">
        {children}
      </body>
    </html>
  );
}

import { PlayerProvider } from "@/lib/context/player-context";
import { GoogleOAuthProvider } from "@react-oauth/google";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Musikfy - Pemutar Musik",
  description: "Aplikasi pemutar musik ringkas dan bebas distraksi",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="id"
      className={`${geistSans.variable} ${geistMono.variable} dark h-full overflow-hidden antialiased`}
    >
      <body className="h-full overflow-hidden bg-[#080c14] text-slate-100">
        <GoogleOAuthProvider clientId={process.env.NEXT_PUBLIC_CLIENT_ID ?? ""}>
          <PlayerProvider>{children}</PlayerProvider>
        </GoogleOAuthProvider>
      </body>
    </html>
  );
}

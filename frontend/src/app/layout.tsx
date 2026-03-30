import type { Metadata } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import "./globals.css";
import { Web3Provider } from "@/components/Web3Provider";
import { ThemeProvider } from "@/context/ThemeProvider";
import { AuthProvider } from "@/context/AuthContext";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-heading",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "FrethiX | AI-Powered Hiring with Smart Contract Escrow",
  description:
    "AI that hires and pays freelancers automatically using blockchain smart contracts. Describe your project, get matched instantly, pay securely.",
  keywords: ["AI hiring", "freelance", "blockchain escrow", "smart contracts", "Web3"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${inter.variable} ${spaceGrotesk.variable} antialiased min-h-screen font-[family-name:var(--font-sans)]`}
      >
        <AuthProvider>
          <ThemeProvider>
            <Web3Provider>
              {children}
            </Web3Provider>
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}

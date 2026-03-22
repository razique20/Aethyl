import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Outfit, Dancing_Script } from "next/font/google";
import "./globals.css";
import { Web3Provider } from "@/components/Web3Provider";
import { ThemeProvider } from "@/context/ThemeProvider";
import Footer from "@/components/Footer";

const sans = Plus_Jakarta_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
});

const outfit = Outfit({
  variable: "--font-heading",
  subsets: ["latin"],
});

const cursive = Dancing_Script({
  variable: "--font-cursive",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "FrethiX | Decentralized Freelance Marketplace",
  description: "Secure escrow-backed freelance platform by Aethyl using Web3.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${sans.variable} ${outfit.variable} ${cursive.variable} antialiased bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 min-h-screen transition-colors duration-300 flex flex-col text-[14px] leading-relaxed`}
      >
        <ThemeProvider>
          <Web3Provider>
            <div className="flex-grow">
              {children}
            </div>
            <Footer />
          </Web3Provider>
        </ThemeProvider>
      </body>
    </html>
  );
}

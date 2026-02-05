import type { Metadata } from "next";
import { League_Spartan, Space_Grotesk } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/Providers";
import { Header, Footer } from "@/components/layout";

// Rayavriti fonts
const leagueSpartan = League_Spartan({
  variable: "--font-heading",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: {
    default: "Rayavriti Learning | Technology & Networking Training",
    template: "%s | Rayavriti Learning",
  },
  description:
    "Enterprise-grade training and certification programs in technology, networking, and cybersecurity. Learn from industry experts and accelerate your career.",
  keywords: ["training", "courses", "certification", "networking", "cybersecurity", "technology"],
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
    apple: "/images/Icon-color.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${leagueSpartan.variable} ${spaceGrotesk.variable} antialiased min-h-screen flex flex-col`}
        style={{ fontFamily: "var(--font-body), system-ui, sans-serif" }}
      >
        <Providers>
          <Header />
          <main className="flex-1 pt-16">{children}</main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}

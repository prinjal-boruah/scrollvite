import "./globals.css";
import { Playfair_Display, Inter } from "next/font/google";
import Providers from "./providers";

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${playfair.variable} ${inter.variable} font-inter`}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}

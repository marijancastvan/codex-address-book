import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = { title: "Address Book", description: "Lični adresar kontakata" };
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="sr"><body>{children}</body></html>;
}

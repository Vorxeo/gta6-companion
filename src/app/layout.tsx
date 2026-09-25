import type { Metadata } from "next";
import "./globals.css";
import "./product.css";
export const metadata: Metadata = {
  description:
    "Plan your next Leonida adventure. An independent fan companion in English, Spanish and Brazilian Portuguese.",
};
export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

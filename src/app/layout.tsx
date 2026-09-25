import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = {
  title: "VI Companion — Seu próximo mundo",
  description:
    "Seu espaço para planejar a próxima aventura em Leonida. Projeto independente de fãs.",
};
export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}

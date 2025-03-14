// src/app/layout.tsx
import "./globals.css";
import { Providers } from "./providers";
import Link from "next/link";
import { Button } from "@/components/ui/button"; // Adjust the import based on your file structure

export const metadata = {
  title: "My Shadcn Store",
  description: "A modern store styled with shadcn UI",
  viewport: "width=device-width, initial-scale=1",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-gray-50 text-gray-900">
        <Providers>
          <header className="bg-white shadow-sm">
            <div className="mx-auto max-w-6xl px-4 py-4 flex items-center justify-between">
              <Link href="/" className="text-xl font-bold">
                My Shadcn Store
              </Link>
              <nav className="space-x-4">
                <Link href="/products" className="hover:text-blue-500">
                  Products
                </Link>
                <Link href="/cart" className="hover:text-blue-500">
                  Cart
                </Link>
              </nav>
            </div>
          </header>

          <main className="mx-auto max-w-6xl px-4 py-8">{children}</main>

          <footer className="bg-white mt-8 py-4">
            <div className="mx-auto max-w-6xl px-4 text-center text-sm text-gray-500">
              &copy; {new Date().getFullYear()} My Shadcn Store. All rights reserved.
            </div>
          </footer>
        </Providers>
      </body>
    </html>
  );
}

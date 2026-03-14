import "./globals.css";
import React from "react";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi" suppressHydrationWarning>
      <body
        suppressHydrationWarning
        className="bg-slate-100 p-6 text-slate-900 sm:p-10"
      >
        {children}
      </body>
    </html>
  );
}

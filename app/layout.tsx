import type { Metadata } from "next";
import { Providers } from "@/components/providers";
import { ConditionalLayout } from "@/components/conditional-layout";
import "./globals.css";

export const metadata: Metadata = {
  title: "Caza - Your Dream. Our Masterpice." ,
  description:
    " We care about your dream home same as you .",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inclusive+Sans&display=swap"
          rel="stylesheet"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Fredoka:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body
        className="antialiased font-sans"
        style={{ fontFamily: '"Inclusive Sans", system-ui, sans-serif' }}
        suppressHydrationWarning
      >
        <Providers>
          <ConditionalLayout>{children}</ConditionalLayout>
        </Providers>
      </body>
    </html>
  );
}

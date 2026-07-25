import type { Metadata } from "next";
import "./globals.css";

const description =
  "The Carrier: OpenE2EE brand identity, design tokens, theming, and diagram grammar.";

const noFlashTheme = `
  (() => {
    try {
      const preference = localStorage.getItem("oe-theme") ?? "system";
      const systemDark = matchMedia("(prefers-color-scheme: dark)").matches;
      const dark = preference === "dark" || (preference === "system" && systemDark);
      document.documentElement.classList.toggle("dark", dark);
      document.documentElement.style.colorScheme = dark ? "dark" : "light";
    } catch {}
  })();
`;

export const metadata: Metadata = {
  title: "OpenE2EE Design",
  description,
  metadataBase: new URL("https://design.open-e2ee.dev"),
  icons: {
    icon: "/brand/open-e2ee-favicon.svg",
  },
  openGraph: {
    type: "website",
    title: "OpenE2EE Design",
    description,
    images: ["/brand/social/open-e2ee-design-og.png"],
  },
  twitter: {
    card: "summary_large_image",
    title: "OpenE2EE Design",
    description,
    images: ["/brand/social/open-e2ee-design-og.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: noFlashTheme }} />
      </head>
      <body>{children}</body>
    </html>
  );
}

import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { LayoutWrapper } from "./components/LayoutWrapper";

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-plus-jakarta",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Lumio Consórcios",
    template: "%s | Lumio Consórcios",
  },
  description: "Consórcio imobiliário e veicular com as melhores condições. Realize seus sonhos com a Lumio Consórcios.",
  keywords: ["consórcio", "imóveis", "consórcio imobiliário", "consórcio veicular", "carta de crédito", "investimento"],
  authors: [{ name: "Lumio Consórcios" }],
  creator: "Lumio Consórcios",
  publisher: "Lumio Consórcios",
  metadataBase: new URL("https://lumioconsorcios.com.br"),
  icons: {
    icon: "/favicon.ico",
    apple: "/img/Lumio-icon.png",
    shortcut: "/favicon.ico",
  },
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "pt_BR",
    url: "https://lumioconsorcios.com.br",
    siteName: "Lumio Consórcios",
    title: "Lumio Consórcios",
    description: "Consórcio imobiliário e veicular com as melhores condições.",
    images: [
      {
        url: "https://lumioconsorcios.com.br/img/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Lumio Consórcios",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Lumio Consórcios",
    description: "Consórcio imobiliário e veicular com as melhores condições.",
    images: ["https://lumioconsorcios.com.br/img/og-image.jpg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className={plusJakartaSans.variable}>
      <head>
        <link rel="stylesheet" href="/css/style.css" />
      </head>
      <body className={plusJakartaSans.className}>
        <LayoutWrapper>{children}</LayoutWrapper>
      </body>
    </html>
  );
}

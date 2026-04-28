import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Simulador de Consórcio de Imóvel e Carro | Lumio Consórcios Juiz de Fora",
  description:
    "Simule seu consórcio de imóvel ou veículo em Juiz de Fora. Descubra o valor da parcela e escolha o melhor plano. Taxa única a partir de 13%, sem juros. Credenciado ao Itaú.",
  keywords: [
    "Lumio Consórcios",
    "Lumio",
    "simulador Lumio",
    "simulador consórcio",
    "simular consórcio imóvel",
    "simular consórcio carro",
    "calculadora consórcio",
    "consórcio Juiz de Fora",
    "parcela consórcio",
  ],
  robots: {
    index: true,
    follow: true,
  },
  authors: [{ name: "Lumio Consórcios" }],
  alternates: {
    canonical: "https://lumioconsorcios.com.br/simulador",
  },
  openGraph: {
    type: "website",
    url: "https://lumioconsorcios.com.br/simulador",
    title: "Simulador de Consórcio | Lumio Consórcios",
    description: "Simule seu consórcio de imóvel ou veículo. Taxa única a partir de 13%, sem juros.",
    locale: "pt_BR",
    siteName: "Lumio Consórcios",
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
    title: "Simulador de Consórcio | Lumio Consórcios",
    description: "Simule seu consórcio de imóvel ou veículo. Taxa única a partir de 13%.",
    images: ["https://lumioconsorcios.com.br/img/og-image.jpg"],
  },
  other: {
    "geo.region": "BR-MG",
    "geo.placename": "Juiz de Fora",
  },
};

export default function SimuladorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

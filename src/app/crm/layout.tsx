import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "CRM - Gestão de Leads | Lumio Consórcios",
  description: "Sistema interno de gestão de leads",
  robots: {
    index: false,
    follow: false,
    googleBot: {
      index: false,
      follow: false,
    },
  },
};

export default function CRMLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

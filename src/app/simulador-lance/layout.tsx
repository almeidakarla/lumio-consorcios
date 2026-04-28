import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Simulador de Lance | Uso Interno",
  robots: {
    index: false,
    follow: false,
  },
};

export default function SimuladorLanceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

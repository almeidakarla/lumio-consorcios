import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/simulador-lance", "/crm", "/login"],
      },
    ],
    sitemap: "https://lumioconsorcios.com.br/sitemap.xml",
  };
}

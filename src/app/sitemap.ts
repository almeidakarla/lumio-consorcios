import { MetadataRoute } from "next";
import { client } from "@/sanity/client";

const POSTS_QUERY = `*[_type == "post" && defined(slug.current)] | order(publishedAt desc) {
  slug,
  publishedAt
}`;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const posts = await client.fetch<Array<{ slug: { current: string }; publishedAt: string }>>(
    POSTS_QUERY,
    {},
    { next: { revalidate: 3600 } }
  );

  const blogPosts = posts.map((post) => ({
    url: `https://lumioconsorcios.com.br/blog/${post.slug.current}`,
    lastModified: new Date(post.publishedAt),
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  return [
    {
      url: "https://lumioconsorcios.com.br",
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: "https://lumioconsorcios.com.br/blog",
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.9,
    },
    ...blogPosts,
  ];
}

import { PortableText, type SanityDocument } from "next-sanity";
import type { PortableTextComponents } from "@portabletext/react";
import imageUrlBuilder from "@sanity/image-url";
import { client } from "@/sanity/client";
import Link from "next/link";
import Image from "next/image";
import TableOfContents from "../../components/TableOfContents";
import type { Metadata } from "next";

const POST_QUERY = `*[_type == "post" && slug.current == $slug][0]{
  _id,
  title,
  subtitle,
  slug,
  publishedAt,
  image,
  body
}`;

const { projectId, dataset } = client.config();
const builder = imageUrlBuilder({ projectId: projectId!, dataset: dataset! });
const urlFor = (source: Parameters<typeof builder.image>[0]) =>
  builder.image(source);

const options = { next: { revalidate: 30 } };

// Generate dynamic metadata for SEO
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await client.fetch<SanityDocument>(POST_QUERY, { slug }, options);

  if (!post) {
    return {
      title: "Artigo não encontrado",
    };
  }

  const postImageUrl = post.image
    ? urlFor(post.image).width(1200).height(630).url()
    : "https://lumioconsorcios.com.br/assets/img/og-image.jpg";

  const description = post.subtitle || `Leia o artigo "${post.title}" no blog da Lumio Consórcios.`;

  return {
    title: post.title,
    description,
    alternates: {
      canonical: `/blog/${post.slug.current}`,
    },
    openGraph: {
      title: post.title,
      description,
      type: "article",
      publishedTime: post.publishedAt,
      url: `https://lumioconsorcios.com.br/blog/${post.slug.current}`,
      siteName: "Lumio Consórcios",
      images: [
        {
          url: postImageUrl,
          width: 1200,
          height: 630,
          alt: post.title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description,
      images: [postImageUrl],
    },
  };
}

// Generate slug from text
function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

// Extract headings from portable text body
function extractHeadings(body: Array<{ _type: string; style?: string; children?: Array<{ text: string }> }>) {
  const headings: Array<{ id: string; text: string; level: number }> = [];

  if (!body) return headings;

  body.forEach((block) => {
    if (block._type === "block" && (block.style === "h2" || block.style === "h3")) {
      const text = block.children?.map((child) => child.text).join("") || "";
      if (text) {
        headings.push({
          id: generateSlug(text),
          text,
          level: block.style === "h2" ? 2 : 3,
        });
      }
    }
  });

  return headings;
}

// Helper to extract text from portable text children
function getTextFromChildren(children: unknown[]): string {
  return children
    .map((child) => {
      if (typeof child === "object" && child !== null && "text" in child) {
        return (child as { text: string }).text;
      }
      return "";
    })
    .join("");
}

// Custom PortableText components with IDs for headings
const portableTextComponents: PortableTextComponents = {
  block: {
    h2: ({ children, value }) => {
      const text = getTextFromChildren(value.children || []);
      const id = generateSlug(text);
      return <h2 id={id}>{children}</h2>;
    },
    h3: ({ children, value }) => {
      const text = getTextFromChildren(value.children || []);
      const id = generateSlug(text);
      return <h3 id={id}>{children}</h3>;
    },
  },
};

export default async function PostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const post = await client.fetch<SanityDocument>(POST_QUERY, await params, options);
  const postImageUrl = post.image
    ? urlFor(post.image).width(600).height(400).url()
    : null;
  const ogImageUrl = post.image
    ? urlFor(post.image).width(1200).height(630).url()
    : "https://lumioconsorcios.com.br/assets/img/og-image.jpg";

  const headings = extractHeadings(post.body || []);

  // Article Schema.org structured data
  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.subtitle || `Leia o artigo "${post.title}" no blog da Lumio Consórcios.`,
    image: ogImageUrl,
    datePublished: post.publishedAt,
    dateModified: post.publishedAt,
    author: {
      "@type": "Organization",
      name: "Lumio Consórcios",
      url: "https://lumioconsorcios.com.br",
    },
    publisher: {
      "@type": "Organization",
      name: "Lumio Consórcios",
      logo: {
        "@type": "ImageObject",
        url: "https://lumioconsorcios.com.br/assets/img/Lumio.png",
      },
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `https://lumioconsorcios.com.br/blog/${post.slug.current}`,
    },
  };

  return (
    <main className="post-page">
      {/* Article Schema.org JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />
      {/* Hero Section - Title Left, Image Right */}
      <section className="post-hero">
        <div className="container">
          <div className="post-hero-grid">
            <div className="post-hero-content">
              <Link href="/blog" className="post-back">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M19 12H5M12 19l-7-7 7-7" />
                </svg>
                Voltar para o blog
              </Link>
              <h1 className="post-title">{post.title}</h1>
              {post.subtitle && <p className="post-excerpt">{post.subtitle}</p>}
              <p className="post-meta">
                {new Date(post.publishedAt).toLocaleDateString("pt-BR", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </p>
            </div>
            <div className="post-hero-image">
              {postImageUrl ? (
                <Image
                  src={postImageUrl}
                  alt={post.title}
                  width={600}
                  height={400}
                  priority
                />
              ) : (
                <div className="post-hero-placeholder" />
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Content Section - Article Left, TOC Right */}
      <section className="post-body">
        <div className="container">
          <div className="post-body-grid">
            <article className="post-content">
              {Array.isArray(post.body) && (
                <PortableText value={post.body} components={portableTextComponents} />
              )}
            </article>

            <TableOfContents headings={headings} />
          </div>
        </div>
      </section>
    </main>
  );
}

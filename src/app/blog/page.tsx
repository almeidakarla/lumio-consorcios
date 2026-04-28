import { type SanityDocument } from "next-sanity";
import imageUrlBuilder from "@sanity/image-url";
import { client } from "@/sanity/client";
import BlogGrid from "../components/BlogGrid";

const POSTS_QUERY = `*[
  _type == "post"
  && defined(slug.current)
]|order(publishedAt desc)[0...30]{_id, title, slug, publishedAt, image}`;

const { projectId, dataset } = client.config();
const builder = imageUrlBuilder({ projectId: projectId!, dataset: dataset! });

const options = { next: { revalidate: 30 } };

export default async function BlogPage() {
  const rawPosts = await client.fetch<SanityDocument[]>(POSTS_QUERY, {}, options);

  const posts = rawPosts.map((post) => ({
    _id: post._id,
    title: post.title,
    slug: post.slug,
    publishedAt: post.publishedAt,
    imageUrl: post.image ? builder.image(post.image).width(400).height(250).url() : null,
  }));

  return (
    <main className="blog-page">
      {/* Hero Section */}
      <section className="blog-hero">
        <div className="container">
          <h1>Blog</h1>
          <p>Dicas e conteúdos sobre consórcio de imóveis</p>
        </div>
      </section>

      {/* Search & Grid */}
      <BlogGrid posts={posts} />
    </main>
  );
}

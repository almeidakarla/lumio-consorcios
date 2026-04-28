"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";

interface Post {
  _id: string;
  title: string;
  slug: { current: string };
  publishedAt: string;
  imageUrl: string | null;
}

export default function BlogGrid({ posts }: { posts: Post[] }) {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredPosts = posts.filter((post) =>
    post.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <>
      {/* Search Bar */}
      <div className="search-container">
        <div className="search-bar">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8" />
            <path d="M21 21l-4.35-4.35" />
          </svg>
          <input
            type="text"
            placeholder="O que você está procurando?"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Blog Grid */}
      <div className="container">
        {filteredPosts.length > 0 ? (
          <div className="blog-grid">
            {filteredPosts.map((post) => (
              <Link href={`/${post.slug.current}`} key={post._id} className="blog-card">
                <div className="blog-card-image">
                  {post.imageUrl ? (
                    <Image
                      src={post.imageUrl}
                      alt={post.title}
                      width={400}
                      height={250}
                      style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    />
                  ) : (
                    <div style={{ width: "100%", height: "100%", background: "var(--border)" }} />
                  )}
                  <div className="blog-card-overlay">
                    <span>
                      CONTINUE LENDO
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M5 12h14M12 5l7 7-7 7" />
                      </svg>
                    </span>
                  </div>
                </div>
                <div className="blog-card-content">
                  <p className="blog-card-date">
                    {new Date(post.publishedAt).toLocaleDateString("pt-BR", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </p>
                  <h2 className="blog-card-title">{post.title}</h2>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="blog-empty">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <circle cx="11" cy="11" r="8" />
              <path d="M21 21l-4.35-4.35" />
            </svg>
            <p>
              {searchTerm
                ? `Nenhum post encontrado para "${searchTerm}"`
                : "Nenhum post publicado ainda. Volte em breve!"}
            </p>
          </div>
        )}
      </div>
    </>
  );
}

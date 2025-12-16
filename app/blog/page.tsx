// app/blog/page.tsx
import Link from "next/link";

type BlogPost = {
  id: number;
  title: string;
  description: string;
  category: "Reading" | "Listening" | "Writing" | "Speaking" | "General";
  slug: string;
};

const posts: BlogPost[] = [
  {
    id: 1,
    title: "How to Get Band 7+ in IELTS Reading",
    description:
      "Learn proven strategies to improve your IELTS Reading score and avoid common traps.",
    category: "Reading",
    slug: "band-7-ielts-reading",
  },
  {
    id: 2,
    title: "Top 10 IELTS Listening Mistakes",
    description:
      "Most students lose easy points in Listening. Here’s how to avoid it.",
    category: "Listening",
    slug: "ielts-listening-mistakes",
  },
  {
    id: 3,
    title: "Writing Task 2 Structure Explained",
    description:
      "A simple and effective structure for IELTS Writing Task 2 essays.",
    category: "Writing",
    slug: "writing-task-2-structure",
  },
  {
    id: 4,
    title: "Speaking Part 2: Sample Answers",
    description:
      "High-scoring sample answers and examiner tips for Speaking Part 2.",
    category: "Speaking",
    slug: "speaking-part-2-samples",
  },
  {
    id: 5,
    title: "IELTS Preparation Tips for Beginners",
    description:
      "New to IELTS? Start your preparation the right way with these tips.",
    category: "General",
    slug: "ielts-prep-for-beginners",
  },
];

const categoryColor = (category: BlogPost["category"]) => {
  switch (category) {
    case "Reading":
      return "#9C74FF";
    case "Listening":
      return "#55BE9D";
    case "Writing":
      return "#F8CB47";
    case "Speaking":
      return "#55BE9D";
    default:
      return "#9C74FF";
  }
};

export default function BlogPage() {
  return (
    <section className="bg-white">
      {/* HERO */}
      <div className="max-w-7xl mx-auto px-6 py-20 text-center">
        <span
          className="inline-block px-4 py-1.5 rounded-full text-sm font-bold mb-4"
          style={{ backgroundColor: "#F8CB47", color: "#2A2A2A" }}
        >
          IELTS MOCK EXAM BLOG
        </span>

        <h1
          className="text-4xl md:text-5xl font-black mb-6"
          style={{ color: "#2A2A2A" }}
        >
          IELTS Tips, Strategies & Practice Guides
        </h1>

        <p className="max-w-2xl mx-auto text-lg" style={{ color: "#2A2A2A" }}>
          Learn how to boost your IELTS score with expert strategies, common
          mistakes, and real exam insights.
        </p>
      </div>

      {/* BLOG GRID */}
      <div className="max-w-7xl mx-auto px-6 pb-24">
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {posts.map((post) => (
            <article
              key={post.id}
              className="rounded-2xl border border-gray-200 p-6 shadow-sm hover:shadow-xl transition-all"
            >
              {/* Category */}
              <span
                className="inline-block text-xs font-bold px-3 py-1 rounded-full mb-4"
                style={{
                  backgroundColor: categoryColor(post.category),
                  color: "#fff",
                }}
              >
                {post.category}
              </span>

              <h2
                className="text-xl font-black mb-3"
                style={{ color: "#2A2A2A" }}
              >
                {post.title}
              </h2>

              <p className="text-sm mb-6" style={{ color: "#2A2A2A" }}>
                {post.description}
              </p>

              <Link
                href={`/blog/${post.slug}`}
                className="inline-flex items-center gap-2 font-bold transition-colors"
                style={{ color: "#9C74FF" }}
              >
                Read Article →
              </Link>
            </article>
          ))}
        </div>

        {/* CTA */}
        <div className="mt-20 text-center">
          <h3 className="text-3xl font-black mb-4" style={{ color: "#2A2A2A" }}>
            Ready to Test Your IELTS Level?
          </h3>
          <p className="mb-8 text-lg" style={{ color: "#2A2A2A" }}>
            Try our realistic IELTS mock exams and track your progress.
          </p>

          <Link
            href="/listening"
            className="inline-block px-10 py-4 rounded-xl font-black text-lg shadow-lg transition-all hover:scale-105"
            style={{
              backgroundColor: "#9C74FF",
              color: "#fff",
            }}
          >
            Start Mock Exam
          </Link>
        </div>
      </div>
    </section>
  );
}

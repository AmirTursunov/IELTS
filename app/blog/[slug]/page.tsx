import Link from "next/link";
import { notFound } from "next/navigation";

type BlogArticle = {
  title: string;
  category: "Reading" | "Listening" | "Writing" | "Speaking" | "General";
  content: string[];
};

const articles: Record<string, BlogArticle> = {
  "band-7-ielts-reading": {
    title: "How to Get Band 7+ in IELTS Reading",
    category: "Reading",
    content: [
      "Getting Band 7 or higher in IELTS Reading requires more than just good English. You need strategy, speed, and accuracy.",
      "One of the biggest mistakes students make is reading the whole passage carefully. In the real exam, time is your enemy.",
      "Instead, you should skim the passage first to understand the main idea, then scan for keywords related to the question.",
      "True / False / Not Given questions are especially tricky. Always rely only on the text, never on your own knowledge.",
      "Practice with realistic mock exams to train your brain for exam pressure.",
    ],
  },

  "ielts-listening-mistakes": {
    title: "Top 10 IELTS Listening Mistakes",
    category: "Listening",
    content: [
      "Many students lose easy points in the Listening section due to poor concentration.",
      "One common mistake is reading questions too slowly before the audio starts.",
      "Another big issue is spelling. Incorrect spelling means no score, even if you understood the answer.",
      "You should always listen for synonyms. The audio rarely repeats the exact words from the question.",
      "Practicing under exam conditions is the fastest way to improve your listening score.",
    ],
  },

  "writing-task-2-structure": {
    title: "Writing Task 2 Structure Explained",
    category: "Writing",
    content: [
      "A clear structure is essential for scoring high in IELTS Writing Task 2.",
      "Your essay should have 4 paragraphs: Introduction, Body 1, Body 2, and Conclusion.",
      "The introduction should paraphrase the question and state your position clearly.",
      "Each body paragraph should focus on one main idea with examples and explanations.",
      "The conclusion should summarize your main points without introducing new ideas.",
    ],
  },

  "speaking-part-2-samples": {
    title: "Speaking Part 2: Sample Answers",
    category: "Speaking",
    content: [
      "Speaking Part 2 requires you to speak for 1-2 minutes on a given topic.",
      "The key is to structure your answer: Introduction, Main points, and Conclusion.",
      "Use a variety of vocabulary and grammar structures to showcase your English level.",
      "Don't worry about perfect grammar - fluency and coherence are more important.",
      "Practice recording yourself to identify areas for improvement.",
    ],
  },

  "ielts-prep-for-beginners": {
    title: "IELTS Preparation Tips for Beginners",
    category: "General",
    content: [
      "Starting IELTS preparation can feel overwhelming, but with the right approach, you can succeed.",
      "First, take a diagnostic test to understand your current level and weak areas.",
      "Create a study schedule that covers all four sections: Reading, Writing, Listening, and Speaking.",
      "Use official IELTS materials and practice tests for the most accurate preparation.",
      "Consider joining a study group or finding a study partner for motivation and support.",
    ],
  },
};

const categoryColor = (category: BlogArticle["category"]) => {
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

// ✅ FIXED: Added async and await for params
export default async function BlogArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  // ✅ Await the params
  const { slug } = await params;
  const article = articles[slug];

  if (!article) return notFound();

  return (
    <article className="bg-white">
      {/* HEADER */}
      <div className="max-w-4xl mx-auto px-6 pt-20 pb-12">
        <span
          className="inline-block px-4 py-1.5 rounded-full text-sm font-bold mb-6"
          style={{
            backgroundColor: categoryColor(article.category),
            color: "#fff",
          }}
        >
          {article.category}
        </span>

        <h1
          className="text-4xl md:text-5xl font-black mb-6"
          style={{ color: "#2A2A2A" }}
        >
          {article.title}
        </h1>

        <p className="text-sm" style={{ color: "#2A2A2A" }}>
          IELTS MOCK EXAM · Expert Preparation Guide
        </p>
      </div>

      {/* CONTENT */}
      <div className="max-w-4xl mx-auto px-6 pb-24">
        <div className="space-y-6 text-lg leading-relaxed">
          {article.content.map((paragraph, index) => (
            <p key={index} style={{ color: "#2A2A2A" }}>
              {paragraph}
            </p>
          ))}
        </div>

        {/* CTA */}
        <div
          className="mt-16 p-8 rounded-2xl text-center"
          style={{ backgroundColor: "#F8CB47" }}
        >
          <h3 className="text-2xl font-black mb-4" style={{ color: "#2A2A2A" }}>
            Test Your IELTS Level Now
          </h3>
          <p className="mb-6" style={{ color: "#2A2A2A" }}>
            Practice with real exam-style questions and track your progress.
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

        {/* BACK */}
        <div className="mt-10">
          <Link href="/blog" className="font-bold" style={{ color: "#9C74FF" }}>
            ← Back to Blog
          </Link>
        </div>
      </div>
    </article>
  );
}

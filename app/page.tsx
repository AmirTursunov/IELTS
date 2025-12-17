import Link from "next/link";
import { Award, ArrowRight, Star, Calendar } from "lucide-react";
import UseDemoButton from "./components/useDemoBtn";

export default function HomePage() {
  const stats = [
    { label: "Active Students", value: "2,500+", icon: "👥" },
    { label: "Practice Tests", value: "50+", icon: "📝" },
    { label: "Study Hours", value: "10K+", icon: "⏱️" },
    { label: "Countries", value: "30+", icon: "🌍" },
  ];

  const features = [
    {
      icon: "📚",
      title: "Complete IELTS Modules",
      desc: "Practice all 4 skills: Listening, Reading, Writing, Speaking",
      color: "bg-[#9C74FF]",
    },
    {
      icon: "🎯",
      title: "Real Test Experience",
      desc: "Practice with authentic IELTS format tests and get instant results",
      color: "bg-[#55BE9D]",
    },
    {
      icon: "⏰",
      title: "Flexible Learning",
      desc: "Study at your own pace with 24/7 access to materials",
      color: "bg-[#F8CB47]",
    },
    {
      icon: "🏆",
      title: "Expert Guidance",
      desc: "Learn from certified IELTS instructors with proven track records",
      color: "bg-[#9C74FF]",
    },
  ];

  const recentResults = [
    { name: "Shohruh M.", from: "6.5", to: "8.0", days: 45 },
    { name: "Dilnoza A.", from: "5.5", to: "7.5", days: 60 },
    { name: "Bobur K.", from: "6.0", to: "7.5", days: 50 },
    { name: "Malika S.", from: "5.0", to: "7.0", days: 90 },
  ];

  const testimonials = [
    {
      name: "Alisher Karimov",
      score: "Band 8.0",
      image: "https://i.pravatar.cc/100?img=12",
      text: "I improved from 6.5 to 8.0 in just 3 months! The practice tests are incredibly helpful.",
      country: "Uzbekistan",
    },
    {
      name: "Maria Garcia",
      score: "Band 7.5",
      image: "https://i.pravatar.cc/100?img=9",
      text: "The speaking practice sessions with real examiners made all the difference for me.",
      country: "Spain",
    },
    {
      name: "Ahmed Hassan",
      score: "Band 8.5",
      image: "https://i.pravatar.cc/100?img=14",
      text: "Best IELTS preparation platform! The writing feedback is detailed and really helpful.",
      country: "Egypt",
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-[#F8CB47] text-white">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-96 h-96 bg-[#9C74FF] rounded-full -mr-48 -mt-48"></div>
          <div className="absolute bottom-0 left-0 w-72 h-72 bg-[#55BE9D] rounded-full -ml-36 -mb-36"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-6 py-24">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 bg-[#9C74FF] px-5 py-2.5 rounded-full mb-6 shadow-lg">
                <Star className="w-4 h-4 fill-white text-white" />
                <span className="text-sm font-bold text-white">
                  Rated 4.9/5 by 2000+ students
                </span>
              </div>

              <h1 className="text-5xl lg:text-6xl font-black mb-6 leading-tight">
                Achieve Your Dream
                <span className="block text-white mt-2">IELTS Score</span>
              </h1>

              <p className="text-xl text-white mb-8 leading-relaxed">
                Join 2,500+ successful students who achieved their target IELTS
                band score with our proven preparation methods and expert
                guidance.
              </p>

              <div className="flex flex-wrap gap-4">
                <UseDemoButton />
              </div>
            </div>

            <div className="relative">
              <div className="relative bg-white/5 backdrop-blur-sm rounded-2xl p-8 border-2 border-white/30 shadow-2xl">
                <div className="absolute -top-6 -right-4 bg-white text-[#2A2A2A] px-6 py-3 rounded-full font-black shadow-lg">
                  🔥 2,500+ Active Students
                </div>

                <img
                  src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800"
                  alt="Students studying"
                  className="rounded-xl shadow-2xl"
                />

                <div className="absolute -bottom-6 -left-6 bg-white text-[#2A2A2A] px-6 py-4 rounded-xl shadow-2xl">
                  <div className="flex items-center gap-3">
                    <div className="bg-[#FFA500]/20 p-3 rounded-lg">
                      <Calendar className="w-6 h-6 text-[#FFA500]" />
                    </div>
                    <div>
                      <div className="text-2xl font-black text-[#FFA500]">
                        50+
                      </div>
                      <div className="text-sm text-gray-600 font-semibold">
                        Upcoming Tests
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 bg-gray-50 border-b-2 border-gray-100">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, idx) => (
              <div
                key={idx}
                className="text-center group hover:scale-105 transition-transform"
              >
                <div
                  className={`inline-flex items-center justify-center w-16 h-16 ${
                    idx === 0
                      ? "bg-[#9C74FF]"
                      : idx === 1
                      ? "bg-[#55BE9D]"
                      : idx === 2
                      ? "bg-[#F8CB47]"
                      : "bg-[#9C74FF]"
                  } rounded-2xl mb-4 shadow-lg text-3xl`}
                >
                  {stat.icon}
                </div>
                <div className="text-4xl font-black text-[#2A2A2A] mb-2">
                  {stat.value}
                </div>
                <div className="text-gray-600 font-bold">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <div className="inline-block bg-[#9C74FF]/10 text-[#9C74FF] px-5 py-2.5 rounded-full font-bold mb-4 border-2 border-[#9C74FF]/20">
              Why Choose Us
            </div>
            <h2 className="text-4xl lg:text-5xl font-black text-[#2A2A2A] mb-4">
              Everything You Need to Succeed
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Comprehensive IELTS preparation with real exam experience
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, idx) => (
              <div
                key={idx}
                className="bg-white rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-all border-2 border-gray-100 group hover:-translate-y-2"
              >
                <div
                  className={`inline-flex items-center justify-center w-16 h-16 ${feature.color} rounded-2xl mb-6 group-hover:scale-110 transition-transform shadow-lg text-3xl`}
                >
                  {feature.icon}
                </div>
                <h3 className="text-xl font-black text-[#2A2A2A] mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Study Paths Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <div className="inline-block bg-[#F8CB47]/20 text-[#2A2A2A] px-5 py-2.5 rounded-full font-bold mb-4 border-2 border-[#F8CB47]/30">
              Learning Paths
            </div>
            <h2 className="text-4xl lg:text-5xl font-black text-[#2A2A2A] mb-4">
              Choose Your IELTS Module
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Start practicing with our comprehensive test modules
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Listening Module */}
            <Link
              href="/listening"
              className="group bg-white rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-all border-2 border-[#9C74FF]/20 hover:border-[#9C74FF] hover:-translate-y-2"
            >
              <div className="flex items-start justify-between mb-6">
                <div className="bg-[#9C74FF] p-4 rounded-2xl shadow-lg group-hover:scale-110 transition-transform">
                  <svg
                    className="w-8 h-8 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"
                    />
                  </svg>
                </div>
                <span className="bg-[#55BE9D] text-white text-xs font-bold px-3 py-1 rounded-full">
                  Available
                </span>
              </div>

              <h3 className="text-2xl font-black text-[#2A2A2A] mb-3">
                Listening Practice
              </h3>
              <p className="text-gray-600 mb-4 leading-relaxed">
                Master IELTS listening with real exam format tests. Practice all
                question types and improve your score.
              </p>

              <div className="flex items-center gap-4 pt-4 border-t border-gray-200">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <span className="font-bold text-[#9C74FF]">15+</span>
                  <span>Tests</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <span className="font-bold text-[#9C74FF]">4</span>
                  <span>Sections</span>
                </div>
              </div>
            </Link>

            {/* Reading Module */}
            <Link
              href="/reading"
              className="group bg-white rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-all border-2 border-[#55BE9D]/20 hover:border-[#55BE9D] hover:-translate-y-2"
            >
              <div className="flex items-start justify-between mb-6">
                <div className="bg-[#55BE9D] p-4 rounded-2xl shadow-lg group-hover:scale-110 transition-transform">
                  <svg
                    className="w-8 h-8 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                    />
                  </svg>
                </div>
                <span className="bg-[#55BE9D] text-white text-xs font-bold px-3 py-1 rounded-full">
                  Available
                </span>
              </div>

              <h3 className="text-2xl font-black text-[#2A2A2A] mb-3">
                Reading Practice
              </h3>
              <p className="text-gray-600 mb-4 leading-relaxed">
                Improve your reading comprehension with authentic passages.
                Practice time management and accuracy.
              </p>

              <div className="flex items-center gap-4 pt-4 border-t border-gray-200">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <span className="font-bold text-[#55BE9D]">10+</span>
                  <span>Tests</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <span className="font-bold text-[#55BE9D]">3</span>
                  <span>Passages</span>
                </div>
              </div>
            </Link>

            {/* Writing Module - Coming Soon */}
            <div className="group bg-white rounded-2xl p-8 shadow-xl transition-all border-2 border-gray-200 opacity-60">
              <div className="flex items-start justify-between mb-6">
                <div className="bg-gray-300 p-4 rounded-2xl shadow-lg">
                  <svg
                    className="w-8 h-8 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                    />
                  </svg>
                </div>
                <span className="bg-[#F8CB47] text-[#2A2A2A] text-xs font-bold px-3 py-1 rounded-full">
                  Coming Soon
                </span>
              </div>

              <h3 className="text-2xl font-black text-[#2A2A2A] mb-3">
                Writing Practice
              </h3>
              <p className="text-gray-600 mb-4 leading-relaxed">
                Practice Task 1 and Task 2 writing with detailed feedback and
                band score predictions.
              </p>

              <div className="flex items-center gap-4 pt-4 border-t border-gray-200">
                <div className="text-sm text-gray-500 font-semibold">
                  🚀 Expected: Q1 2025
                </div>
              </div>
            </div>

            {/* Speaking Module - Coming Soon */}
            <div className="group bg-white rounded-2xl p-8 shadow-xl transition-all border-2 border-gray-200 opacity-60">
              <div className="flex items-start justify-between mb-6">
                <div className="bg-gray-300 p-4 rounded-2xl shadow-lg">
                  <svg
                    className="w-8 h-8 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
                    />
                  </svg>
                </div>
                <span className="bg-[#F8CB47] text-[#2A2A2A] text-xs font-bold px-3 py-1 rounded-full">
                  Coming Soon
                </span>
              </div>

              <h3 className="text-2xl font-black text-[#2A2A2A] mb-3">
                Speaking Practice
              </h3>
              <p className="text-gray-600 mb-4 leading-relaxed">
                Practice with AI examiner and get instant feedback on fluency,
                pronunciation, and coherence.
              </p>

              <div className="flex items-center gap-4 pt-4 border-t border-gray-200">
                <div className="text-sm text-gray-500 font-semibold">
                  🚀 Expected: Q1 2025
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Results Section */}
      <section className="py-20 bg-[#2A2A2A] text-white relative overflow-hidden">
        <div className="absolute top-0 left-0 w-96 h-96 bg-[#9C74FF]/20 rounded-full -ml-48 -mt-48"></div>
        <div className="absolute bottom-0 right-0 w-72 h-72 bg-[#55BE9D]/20 rounded-full -mr-36 -mb-36"></div>

        <div className="relative max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <div className="inline-block bg-[#F8CB47] text-[#2A2A2A] px-5 py-2.5 rounded-full font-bold mb-4 shadow-lg">
              Success Stories
            </div>
            <h2 className="text-4xl lg:text-5xl font-black mb-4">
              Recent Student Results
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Real students, real results - see how our students improved their
              scores
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {recentResults.map((result, idx) => (
              <div
                key={idx}
                className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border-2 border-[#9C74FF]/30 hover:bg-white/10 transition-all hover:scale-105"
              >
                <div className="text-center">
                  <div className="w-16 h-16 bg-[#F8CB47] rounded-full mx-auto mb-4 flex items-center justify-center shadow-lg">
                    <Award className="w-8 h-8 text-[#2A2A2A]" />
                  </div>
                  <h3 className="text-xl font-black mb-2">{result.name}</h3>
                  <div className="flex items-center justify-center gap-3 mb-3">
                    <span className="text-2xl font-black text-gray-400">
                      {result.from}
                    </span>
                    <ArrowRight className="w-5 h-5 text-[#55BE9D]" />
                    <span className="text-3xl font-black text-[#F8CB47]">
                      {result.to}
                    </span>
                  </div>
                  <p className="text-gray-400 text-sm font-semibold">
                    in {result.days} days
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <div className="inline-block bg-[#55BE9D]/10 text-[#55BE9D] px-5 py-2.5 rounded-full font-bold mb-4 border-2 border-[#55BE9D]/20">
              Student Reviews
            </div>
            <h2 className="text-4xl lg:text-5xl font-black text-[#2A2A2A] mb-4">
              What Our Students Say
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Join thousands of satisfied students who achieved their goals
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, idx) => (
              <div
                key={idx}
                className="bg-gray-50 rounded-2xl p-8 shadow-xl border-2 border-gray-100 hover:shadow-2xl transition-all"
              >
                <div className="flex mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className="w-5 h-5 fill-[#F8CB47] text-[#F8CB47]"
                    />
                  ))}
                </div>

                <p className="text-gray-700 mb-6 leading-relaxed italic font-medium">
                  "{testimonial.text}"
                </p>

                <div className="flex items-center gap-4 pt-4 border-t-2 border-gray-200">
                  <img
                    src={testimonial.image}
                    alt={testimonial.name}
                    className="w-12 h-12 rounded-full border-2 border-[#9C74FF]"
                  />
                  <div>
                    <div className="font-black text-[#2A2A2A]">
                      {testimonial.name}
                    </div>
                    <div className="text-sm text-gray-600 font-semibold">
                      {testimonial.country}
                    </div>
                  </div>
                  <div className="ml-auto bg-[#55BE9D] text-white px-3 py-1.5 rounded-full font-black text-sm">
                    {testimonial.score}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-[#9C74FF] text-white">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-4xl lg:text-5xl font-black mb-6">
            Ready to Start Your IELTS Journey?
          </h2>
          <p className="text-xl text-purple-100 mb-8">
            Join 2,500+ students and start practicing today with our free trial
          </p>

          <div className="flex flex-wrap gap-4 justify-center">
            <Link
              href="/listening"
              className="px-10 py-5 bg-[#F8CB47] text-[#2A2A2A] rounded-xl font-black text-lg hover:bg-[#E6BA3A] transition-all shadow-2xl flex items-center gap-2"
            >
              Get Started Free
              <ArrowRight className="w-5 h-5" />
            </Link>
            <button className="px-10 py-5 bg-white/10 backdrop-blur-sm border-2 border-white/30 text-white rounded-xl font-black text-lg hover:bg-white/20 transition-all">
              Contact Support
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}

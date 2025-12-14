// app/page.tsx
"use client";

import React from "react";
import Link from "next/link";
import {
  BookOpen,
  Users,
  Award,
  TrendingUp,
  Target,
  Clock,
  Globe,
  ArrowRight,
  Star,
  CheckCircle,
} from "lucide-react";

export default function HomePage() {
  const stats = [
    { label: "Active Students", value: "2,500+", icon: "👥" },
    { label: "Success Rate", value: "95%", icon: "📈" },
    { label: "Expert Teachers", value: "50+", icon: "🎓" },
    { label: "Countries", value: "30+", icon: "🌍" },
  ];

  const features = [
    {
      icon: "📚",
      title: "Complete IELTS Modules",
      desc: "Practice all 4 skills: Listening, Reading, Writing, Speaking",
      color: "from-cyan-500 to-blue-600",
    },
    {
      icon: "🎯",
      title: "Real Test Experience",
      desc: "Practice with authentic IELTS format tests and get instant results",
      color: "from-blue-500 to-indigo-600",
    },
    {
      icon: "⏰",
      title: "Flexible Learning",
      desc: "Study at your own pace with 24/7 access to materials",
      color: "from-indigo-500 to-purple-600",
    },
    {
      icon: "🏆",
      title: "Expert Guidance",
      desc: "Learn from certified IELTS instructors with proven track records",
      color: "from-purple-500 to-pink-600",
    },
  ];

  const teachers = [
    {
      name: "Sarah Johnson",
      role: "IELTS Expert & Lead Instructor",
      band: "Band 9 Holder",
      students: "500+",
      image: "https://i.pravatar.cc/150?img=1",
      specialization: "Writing & Speaking",
    },
    {
      name: "Michael Chen",
      role: "Senior IELTS Trainer",
      band: "Band 8.5 Holder",
      students: "450+",
      image: "https://i.pravatar.cc/150?img=3",
      specialization: "Reading & Listening",
    },
    {
      name: "Emma Wilson",
      role: "IELTS Specialist",
      band: "Band 9 Holder",
      students: "380+",
      image: "https://i.pravatar.cc/150?img=5",
      specialization: "Grammar & Vocabulary",
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
    <div className="min-h-screen bg-linear-to-br from-cyan-50 via-blue-50 to-indigo-50">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-linear-to-r from-cyan-500 via-blue-600 to-indigo-600 text-white">
        <div className="absolute inset-0 bg-black/10"></div>

        {/* Decorative circles */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full -mr-48 -mt-48"></div>
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-white/10 rounded-full -ml-36 -mb-36"></div>

        <div className="relative max-w-7xl mx-auto px-6 py-24">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-5 py-2.5 rounded-full mb-6 border border-white/30">
                <Star className="w-4 h-4 fill-yellow-300 text-yellow-300" />
                <span className="text-sm font-bold">
                  Rated 4.9/5 by 2000+ students
                </span>
              </div>

              <h1 className="text-5xl lg:text-6xl font-black mb-6 leading-tight">
                Achieve Your Dream
                <span className="block text-yellow-300 mt-2">IELTS Score</span>
              </h1>

              <p className="text-xl text-cyan-50 mb-8 leading-relaxed">
                Join 2,500+ successful students who achieved their target IELTS
                band score with our proven preparation methods and expert
                guidance.
              </p>

              <div className="flex flex-wrap gap-4">
                <Link
                  href="/listening"
                  className="px-8 py-4 bg-white text-blue-600 rounded-xl font-bold text-lg hover:bg-blue-50 transition-all shadow-xl flex items-center gap-2 group"
                >
                  Start Free Trial
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
                <button className="px-8 py-4 bg-white/10 backdrop-blur-sm border-2 border-white/30 text-white rounded-xl font-bold text-lg hover:bg-white/20 transition-all">
                  Watch Demo
                </button>
              </div>
            </div>

            <div className="relative">
              <div className="relative bg-white/10 backdrop-blur-sm rounded-2xl p-8 border-2 border-white/20 shadow-2xl">
                <div className="absolute -top-4 -right-4 bg-yellow-400 text-gray-900 px-6 py-3 rounded-full font-black shadow-lg animate-pulse">
                  🔥 2,500+ Active Students
                </div>

                <img
                  src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800"
                  alt="Students studying"
                  className="rounded-xl shadow-2xl"
                />

                <div className="absolute -bottom-6 -left-6 bg-white text-gray-900 px-6 py-4 rounded-xl shadow-2xl">
                  <div className="flex items-center gap-3">
                    <div className="bg-green-100 p-3 rounded-lg">
                      <TrendingUp className="w-6 h-6 text-green-600" />
                    </div>
                    <div>
                      <div className="text-2xl font-black text-green-600">
                        95%
                      </div>
                      <div className="text-sm text-gray-600 font-semibold">
                        Success Rate
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
      <section className="py-12 bg-white border-b-2 border-gray-100">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, idx) => (
              <div
                key={idx}
                className="text-center group hover:scale-105 transition-transform"
              >
                <div className="inline-flex items-center justify-center w-16 h-16 bg-linear-to-br from-cyan-500 to-blue-600 rounded-2xl mb-4 shadow-lg text-3xl">
                  {stat.icon}
                </div>
                <div className="text-4xl font-black text-gray-900 mb-2">
                  {stat.value}
                </div>
                <div className="text-gray-600 font-bold">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-linear-to-b from-white to-gray-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <div className="inline-block bg-blue-100 text-blue-700 px-5 py-2.5 rounded-full font-bold mb-4 border-2 border-blue-200">
              Why Choose Us
            </div>
            <h2 className="text-4xl lg:text-5xl font-black text-gray-900 mb-4">
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
                  className={`inline-flex items-center justify-center w-16 h-16 bg-linear-to-br ${feature.color} rounded-2xl mb-6 group-hover:scale-110 transition-transform shadow-lg text-3xl`}
                >
                  {feature.icon}
                </div>
                <h3 className="text-xl font-black text-gray-900 mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Teachers Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <div className="inline-block bg-purple-100 text-purple-700 px-5 py-2.5 rounded-full font-bold mb-4 border-2 border-purple-200">
              Our Expert Team
            </div>
            <h2 className="text-4xl lg:text-5xl font-black text-gray-900 mb-4">
              Learn From IELTS Experts
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              All our instructors are certified IELTS trainers with Band 8.5+
              scores
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {teachers.map((teacher, idx) => (
              <div
                key={idx}
                className="bg-linear-to-br from-cyan-50 to-blue-100 rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-all border-2 border-cyan-200 group"
              >
                <div className="relative mb-6">
                  <img
                    src={teacher.image}
                    alt={teacher.name}
                    className="w-32 h-32 rounded-full mx-auto border-4 border-white shadow-xl group-hover:scale-105 transition-transform"
                  />
                  <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-linear-to-r from-yellow-400 to-orange-400 text-white px-4 py-1.5 rounded-full font-black text-sm shadow-lg">
                    {teacher.band}
                  </div>
                </div>

                <div className="text-center">
                  <h3 className="text-2xl font-black text-gray-900 mb-2">
                    {teacher.name}
                  </h3>
                  <p className="text-blue-600 font-bold mb-1">{teacher.role}</p>
                  <p className="text-gray-600 text-sm mb-4">
                    {teacher.specialization}
                  </p>

                  <div className="flex items-center justify-center gap-2 text-gray-600 text-sm">
                    <Users className="w-4 h-4" />
                    <span className="font-semibold">
                      {teacher.students} Students Taught
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Results Section */}
      <section className="py-20 bg-linear-to-br from-cyan-500 via-blue-600 to-indigo-600 text-white relative overflow-hidden">
        <div className="absolute top-0 left-0 w-96 h-96 bg-white/10 rounded-full -ml-48 -mt-48"></div>
        <div className="absolute bottom-0 right-0 w-72 h-72 bg-white/10 rounded-full -mr-36 -mb-36"></div>

        <div className="relative max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <div className="inline-block bg-white/20 backdrop-blur-sm px-5 py-2.5 rounded-full font-bold mb-4 border border-white/30">
              Success Stories
            </div>
            <h2 className="text-4xl lg:text-5xl font-black mb-4">
              Recent Student Results
            </h2>
            <p className="text-xl text-cyan-100 max-w-3xl mx-auto">
              Real students, real results - see how our students improved their
              scores
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {recentResults.map((result, idx) => (
              <div
                key={idx}
                className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border-2 border-white/20 hover:bg-white/20 transition-all hover:scale-105"
              >
                <div className="text-center">
                  <div className="w-16 h-16 bg-linear-to-br from-yellow-400 to-orange-400 rounded-full mx-auto mb-4 flex items-center justify-center shadow-lg">
                    <Award className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-black mb-2">{result.name}</h3>
                  <div className="flex items-center justify-center gap-3 mb-3">
                    <span className="text-2xl font-black text-red-200">
                      {result.from}
                    </span>
                    <ArrowRight className="w-5 h-5" />
                    <span className="text-3xl font-black text-yellow-300">
                      {result.to}
                    </span>
                  </div>
                  <p className="text-cyan-100 text-sm font-semibold">
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
            <div className="inline-block bg-green-100 text-green-700 px-5 py-2.5 rounded-full font-bold mb-4 border-2 border-green-200">
              Student Reviews
            </div>
            <h2 className="text-4xl lg:text-5xl font-black text-gray-900 mb-4">
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
                className="bg-linear-to-br from-gray-50 to-white rounded-2xl p-8 shadow-xl border-2 border-gray-100 hover:shadow-2xl transition-all"
              >
                <div className="flex mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className="w-5 h-5 fill-yellow-400 text-yellow-400"
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
                    className="w-12 h-12 rounded-full border-2 border-cyan-400"
                  />
                  <div>
                    <div className="font-black text-gray-900">
                      {testimonial.name}
                    </div>
                    <div className="text-sm text-gray-600 font-semibold">
                      {testimonial.country}
                    </div>
                  </div>
                  <div className="ml-auto bg-green-100 text-green-700 px-3 py-1.5 rounded-full font-black text-sm">
                    {testimonial.score}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-linear-to-r from-cyan-500 via-blue-600 to-indigo-600 text-white">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-4xl lg:text-5xl font-black mb-6">
            Ready to Start Your IELTS Journey?
          </h2>
          <p className="text-xl text-cyan-100 mb-8">
            Join 2,500+ students and start practicing today with our free trial
          </p>

          <div className="flex flex-wrap gap-4 justify-center">
            <Link
              href="/listening"
              className="px-10 py-5 bg-white text-blue-600 rounded-xl font-black text-lg hover:bg-blue-50 transition-all shadow-2xl flex items-center gap-2"
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

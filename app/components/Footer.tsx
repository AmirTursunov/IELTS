import Link from "next/link";
import {
  Facebook,
  Twitter,
  Instagram,
  Youtube,
  Mail,
  Phone,
  MapPin,
} from "lucide-react";

export default function Footer() {
  const quickLinks = [
    { name: "Listening Tests", href: "/listening" },
    { name: "Reading Tests", href: "/reading" },
    { name: "Writing Tests", href: "/writing" },
    { name: "Speaking Tests", href: "/speaking" },
  ];

  const resources = [
    { name: "Study Materials", href: "/materials" },
    { name: "Practice Tests", href: "/reading" },
    { name: "Blog", href: "/blog" },
    { name: "FAQ", href: "/faq" },
  ];

  const company = [
    { name: "About Us", href: "/about" },
    { name: "Our Teachers", href: "/teachers" },
    { name: "Success Stories", href: "/success" },
    { name: "Contact", href: "/contact" },
  ];

  const socialLinks = [
    {
      name: "Facebook",
      icon: Facebook,
      href: "#",
      color: "hover:text-blue-600",
    },
    { name: "Twitter", icon: Twitter, href: "#", color: "hover:text-cyan-500" },
    {
      name: "Instagram",
      icon: Instagram,
      href: "#",
      color: "hover:text-pink-600",
    },
    { name: "Youtube", icon: Youtube, href: "#", color: "hover:text-red-600" },
  ];

  return (
    <footer className="bg-linear-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
      {/* Main Footer */}
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-12">
          {/* Brand */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-[#9C74FF] px-5 py-2.5 rounded-xl font-black text-2xl shadow-lg">
                IELTS
              </div>
              <span className="text-xl font-black">Mock Exam</span>
            </div>
            <p className="text-gray-400 mb-6 leading-relaxed">
              Your trusted partner for IELTS preparation. Join 2,500+ students
              who achieved their dream scores with our expert guidance.
            </p>

            {/* Contact Info */}
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-gray-400">
                <Mail className="w-5 h-5 text-cyan-400" />
                <span>support@ieltsmock.com</span>
              </div>
              <div className="flex items-center gap-3 text-gray-400">
                <Phone className="w-5 h-5 text-cyan-400" />
                <span>+998 90 123 45 67</span>
              </div>
              <div className="flex items-center gap-3 text-gray-400">
                <MapPin className="w-5 h-5 text-cyan-400" />
                <span>Tashkent, Uzbekistan</span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-black mb-6">Quick Links</h3>
            <ul className="space-y-3">
              {quickLinks.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-gray-400 hover:text-cyan-400 transition-colors font-semibold"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="text-lg font-black mb-6">Resources</h3>
            <ul className="space-y-3">
              {resources.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-gray-400 hover:text-cyan-400 transition-colors font-semibold"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="text-lg font-black mb-6">Company</h3>
            <ul className="space-y-3">
              {company.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-gray-400 hover:text-cyan-400 transition-colors font-semibold"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Newsletter */}
        {/* <div className="mt-12 pt-12 border-t border-gray-700">
          <div className="max-w-2xl mx-auto text-center">
            <h3 className="text-2xl font-black mb-4">
              Subscribe to Our Newsletter
            </h3>
            <p className="text-gray-400 mb-6">
              Get study tips, practice tests, and IELTS updates directly to your
              inbox
            </p>
            <div className="flex gap-3 max-w-md mx-auto">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-6 py-3 rounded-xl bg-gray-800 border-2 border-gray-700 focus:border-cyan-500 focus:outline-none text-white"
              />
              <button className="px-8 py-3 bg-linear-to-r bg-[#9C74FF] rounded-xl font-bold hover:bg-[#5e2ae0] transition-all shadow-lg">
                Subscribe
              </button>
            </div>
          </div>
        </div> */}
      </div>

      {/* Bottom Footer */}
      <div className="border-t border-gray-700">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            {/* Copyright */}
            <p className="text-gray-400 text-sm">
              © 2024 IELTS Mock Exam. All rights reserved.
            </p>

            {/* Social Links */}
            <div className="flex items-center gap-4">
              {socialLinks.map((social) => (
                <a
                  key={social.name}
                  href={social.href}
                  className={`p-2 bg-gray-800 rounded-lg ${social.color} transition-all hover:scale-110`}
                  aria-label={social.name}
                >
                  <social.icon className="w-5 h-5" />
                </a>
              ))}
            </div>

            {/* Legal Links */}
            <div className="flex items-center gap-6 text-sm">
              <Link
                href="/privacy"
                className="text-gray-400 hover:text-cyan-400 transition-colors font-semibold"
              >
                Privacy Policy
              </Link>
              <Link
                href="/terms"
                className="text-gray-400 hover:text-cyan-400 transition-colors font-semibold"
              >
                Terms of Service
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

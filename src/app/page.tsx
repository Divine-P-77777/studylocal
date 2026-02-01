import Link from 'next/link';
import { Search, MapPin, BookOpen, GraduationCap, CheckCircle } from 'lucide-react';

export default function Home() {
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-green-50 via-white to-emerald-50 py-24 px-4 sm:px-6 lg:px-8">
        <div className="absolute top-0 right-0 -mt-20 -mr-20 w-80 h-80 bg-green-200 rounded-full blur-3xl opacity-20 animate-pulse"></div>
        <div className="absolute bottom-0 left-0 -mb-20 -ml-20 w-80 h-80 bg-teal-200 rounded-full blur-3xl opacity-20 animate-pulse"></div>

        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-12 relative z-10">
          <div className="flex-1 text-center md:text-left">
            <div className="inline-block px-4 py-1.5 mb-6 rounded-full bg-green-100 text-green-700 font-semibold text-sm">
              🚀 #1 Hyper-local Tutoring Platform
            </div>
            <h1 className="text-5xl md:text-7xl font-extrabold text-gray-900 tracking-tight leading-1.1 mb-6">
              Find the Best <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-teal-500">Local Tutors</span> for Your Child
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 mb-10 max-w-2xl mx-auto md:mx-0 leading-relaxed">
              Connect with verified neighbourhood tutors for 1-on-1 home or online tuition.
              <span className="font-semibold text-gray-800"> No commissions. Direct contact.</span>
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
              <Link
                href="/tutors"
                className="inline-flex items-center justify-center px-8 py-4 border border-transparent text-lg font-bold rounded-xl text-white bg-green-600 hover:bg-green-700 shadow-lg hover:shadow-green-500/30 transition-all hover:scale-105"
              >
                <Search className="w-5 h-5 mr-2" />
                Find a Tutor
              </Link>
              <Link
                href="/tutor-registration"
                className="inline-flex items-center justify-center px-8 py-4 border-2 border-green-600 text-lg font-bold rounded-xl text-green-700 bg-white hover:bg-green-50 transition-all hover:scale-105"
              >
                Become a Tutor
              </Link>
            </div>

            <div className="mt-10 flex items-center justify-center md:justify-start gap-8 text-sm font-medium text-gray-600">
              <span className="flex items-center gap-2"><div className="bg-green-100 p-1 rounded-full"><CheckCircle className="w-4 h-4 text-green-600" /></div> Verified Profiles</span>
              <span className="flex items-center gap-2"><div className="bg-green-100 p-1 rounded-full"><CheckCircle className="w-4 h-4 text-green-600" /></div> Direct Contact</span>
              <span className="flex items-center gap-2"><div className="bg-green-100 p-1 rounded-full"><CheckCircle className="w-4 h-4 text-green-600" /></div> Community Trusted</span>
            </div>
          </div>

          <div className="flex-1 relative w-full flex justify-center">
            <div className="relative z-10 bg-white/80 backdrop-blur-sm p-6 rounded-3xl shadow-2xl border border-white/50 transform rotate-3 hover:rotate-0 transition-transform duration-500 ease-in-out max-w-sm w-full">
              <div className="absolute -top-4 -right-4 bg-yellow-400 text-yellow-900 text-xs font-bold px-3 py-1 rounded-full shadow-lg">top rated</div>
              <div className="flex items-center gap-5 mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg text-white">
                  <GraduationCap className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="font-bold text-xl text-gray-900">Maths & Science</h3>
                  <p className="text-gray-500">Popular Subjects</p>
                  <div className="flex text-yellow-500 text-xs mt-1">★★★★★ (4.9)</div>
                </div>
              </div>
              <div className="space-y-4">
                <div className="h-3 bg-gray-100 rounded-full w-3/4"></div>
                <div className="h-3 bg-gray-100 rounded-full w-full"></div>
                <div className="h-3 bg-gray-100 rounded-full w-5/6"></div>
              </div>
              <div className="mt-6 pt-6 border-t border-gray-100 flex justify-between items-center">
                <span className="text-2xl font-bold text-gray-900">₹500<span className="text-sm text-gray-400 font-normal">/hr</span></span>
                <button className="bg-gray-900 text-white px-4 py-2 rounded-lg text-sm font-medium">Book Demo</button>
              </div>
            </div>

            <div className="absolute -top-10 -right-10 w-40 h-40 bg-green-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
            <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-teal-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
            <div className="absolute -bottom-20 right-20 w-40 h-40 bg-yellow-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
          </div>
        </div>
      </section>

      {/* Stats/Trust Section (Optional) */}
      <section className="bg-white py-16 border-y border-gray-100">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-8 text-center divide-x divide-gray-100">
          <div className="p-4 group cursor-pointer">
            <div className="text-4xl font-extrabold text-green-600 mb-2 group-hover:scale-110 transition-transform">500+</div>
            <div className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Active Tutors</div>
          </div>
          <div className="p-4 group cursor-pointer">
            <div className="text-4xl font-extrabold text-green-600 mb-2 group-hover:scale-110 transition-transform">1200+</div>
            <div className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Students Connected</div>
          </div>
          <div className="p-4 group cursor-pointer">
            <div className="text-4xl font-extrabold text-green-600 mb-2 group-hover:scale-110 transition-transform">15+</div>
            <div className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Local Areas</div>
          </div>
          <div className="p-4 group cursor-pointer">
            <div className="text-4xl font-extrabold text-green-600 mb-2 group-hover:scale-110 transition-transform">₹0</div>
            <div className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Commission Fees</div>
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section className="py-24 bg-gray-50/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <span className="text-green-600 font-bold tracking-wider uppercase text-sm">Simple Process</span>
            <h2 className="text-4xl font-extrabold text-gray-900 mt-2">How StudyLocal Works</h2>
            <p className="mt-4 text-xl text-gray-500 max-w-2xl mx-auto">We keep it simple, transparent, and user-friendly for the community.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-10">
            <div className="bg-white p-10 rounded-2xl shadow-lg border border-gray-100 hover:-translate-y-2 transition-transform duration-300 relative overflow-hidden group">
              <div className="absolute top-0 right-0 bg-blue-50 w-24 h-24 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-150"></div>
              <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center mb-8 relative z-10 shadow-sm">
                <Search className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">1. Search Locally</h3>
              <p className="text-gray-600 leading-relaxed">Enter your specific neighbourhood and subject to find tutors who actually live nearby and understand local school curriculum.</p>
            </div>

            <div className="bg-white p-10 rounded-2xl shadow-lg border border-gray-100 hover:-translate-y-2 transition-transform duration-300 relative overflow-hidden group">
              <div className="absolute top-0 right-0 bg-green-50 w-24 h-24 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-150"></div>
              <div className="w-16 h-16 bg-green-100 text-green-600 rounded-2xl flex items-center justify-center mb-8 relative z-10 shadow-sm">
                <BookOpen className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">2. Review Profiles</h3>
              <p className="text-gray-600 leading-relaxed">Check authentic profiles with experience details, fee ranges, and short bios to find the perfect match for your requirements.</p>
            </div>

            <div className="bg-white p-10 rounded-2xl shadow-lg border border-gray-100 hover:-translate-y-2 transition-transform duration-300 relative overflow-hidden group">
              <div className="absolute top-0 right-0 bg-purple-50 w-24 h-24 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-150"></div>
              <div className="w-16 h-16 bg-purple-100 text-purple-600 rounded-2xl flex items-center justify-center mb-8 relative z-10 shadow-sm">
                <MapPin className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">3. Connect Directly</h3>
              <p className="text-gray-600 leading-relaxed">Get valid contact details instantly. Call, WhatsApp, or meet them. No middleman, no hidden charges, full transparency.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 bg-gradient-to-r from-green-700 to-green-600 text-white text-center px-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10"></div>
        <div className="relative z-10 max-w-4xl mx-auto">
          <h2 className="text-3xl md:text-5xl font-extrabold mb-8 tracking-tight">Ready to improve your grades?</h2>
          <p className="text-green-100 text-xl mb-10 max-w-2xl mx-auto">Start your search today and find a mentor who understands your learning needs.</p>
          <Link
            href="/tutors"
            className="inline-flex items-center justify-center px-10 py-5 bg-white text-green-700 text-lg font-bold rounded-full hover:bg-gray-50 transition shadow-2xl hover:scale-105"
          >
            Start Searching Now
          </Link>
        </div>
      </section>
    </div>
  );
}

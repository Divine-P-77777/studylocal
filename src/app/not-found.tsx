"use client"
import Link from 'next/link';
import Image from 'next/image';
import { Home, Search } from 'lucide-react';

export default function NotFound() {
    return (
        <div className="min-h-screen bg-white flex flex-col items-center justify-center p-4 text-center">
            <div className="relative w-64 h-64 sm:w-80 sm:h-80 mb-8 animate-float">
                <Image
                    src="/notfound.png"
                    alt="Confused Owl"
                    fill
                    className="object-contain"
                    priority
                />
            </div>

            <h1 className="text-4xl sm:text-5xl font-extrabold text-green-800 mb-4 tracking-tight">
                Whoooops!
            </h1>

            <p className="text-xl text-gray-600 mb-8 max-w-md mx-auto">
                It seems we can't find the page you're looking for. Our diligent owl is just as confused as you are.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center w-full max-w-sm">
                <Link
                    href="/"
                    className="flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-xl text-white bg-green-600 hover:bg-green-700 shadow-lg hover:shadow-green-500/30 transition-all hover:-translate-y-1"
                >
                    <Home className="w-5 h-5 mr-2" />
                    Go Home
                </Link>
                <Link
                    href="/tutors"
                    className="flex items-center justify-center px-6 py-3 border-2 border-green-100 text-base font-medium rounded-xl text-green-700 bg-green-50 hover:bg-green-100 transition-all hover:-translate-y-1"
                >
                    <Search className="w-5 h-5 mr-2" />
                    Find Tutors
                </Link>
            </div>

            <style jsx global>{`
        @keyframes float {
          0% { transform: translateY(0px); }
          50% { transform: translateY(-15px); }
          100% { transform: translateY(0px); }
        }
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
      `}</style>
        </div>
    );
}

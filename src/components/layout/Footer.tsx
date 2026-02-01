'use client';

import Link from 'next/link';
import { Home, Search, PlusCircle, User, AlertCircle, MessageCircle, FileText } from 'lucide-react';
import { usePathname } from 'next/navigation';
import clsx from 'clsx';
export default function Footer() {
    const pathname = usePathname();

    if (pathname?.startsWith('/chat')) return null;

    const navItems = [
        { name: 'Home', href: '/', icon: Home },
        { name: 'Search', href: '/tutors', icon: Search },

        { name: 'Chat', href: '/chat', icon: MessageCircle },
    ];

    return (
        <>
            {/* Main Footer (Hidden on Mobile) */}
            <footer className="hidden sm:block bg-gradient-to-br from-green-50 via-white to-emerald-50 text-gray-700 py-12 mt-auto border-t border-green-100">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col sm:flex-row justify-between items-center gap-6">
                        <div className="text-center sm:text-left">
                            <Link href="/" className="inline-block">
                                <div className="flex items-center gap-2 justify-center sm:justify-start">
                                    <div className="bg-green-600 p-1.5 rounded-lg shadow-sm">
                                        <b className="text-xl text-white">SL</b>
                                    </div>
                                    <span className="font-bold text-xl tracking-tight text-gray-900">Study<span className="text-green-600">Local</span></span>
                                </div>
                            </Link>
                            <p className="text-sm text-gray-500 mt-3 max-w-xs mx-auto sm:mx-0">
                                Connecting neighbours for better learning. Verified tutors, zero commissions.
                            </p>
                        </div>

                        <div className="flex flex-wrap justify-center gap-x-8 gap-y-4">
                            <Link href="/privacy" className="text-gray-500 hover:text-green-600 text-sm transition font-medium">
                                Privacy Policy
                            </Link>
                            <Link href="/terms" className="text-gray-500 hover:text-green-600 text-sm transition font-medium">
                                Terms & Conditions
                            </Link>
                            <Link href="/complaints" className="text-gray-500 hover:text-green-600 text-sm transition font-medium flex items-center gap-1">
                                <AlertCircle className="w-4 h-4" />
                                Raise Issue
                            </Link>
                        </div>
                    </div>

                    <div className="mt-10 pt-8 border-t border-gray-200 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-gray-400">
                        <p>&copy; {new Date().getFullYear()} StudyLocal. A Non-profit Community Initiative.</p>
                        <p>Made with ❤️ for Local Education</p>
                    </div>
                </div>
                {/* Spacer for mobile bottom nav so content isn't covered */}
                <div className="h-20 sm:hidden"></div>
            </footer>

            {/* Mobile Bottom Navigation (Fixed) */}
            <div className="sm:hidden fixed bottom-4 left-4 right-4 bg-white/95 backdrop-blur-md border border-green-100 shadow-2xl rounded-2xl pb-safe z-50 overflow-hidden">
                <div className="flex justify-around items-center h-16">
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.name}
                                href={item.href}
                                className={clsx(
                                    "flex flex-col items-center justify-center w-full h-full space-y-1 transition-all duration-300",
                                    isActive ? "text-green-600 scale-110" : "text-gray-400 hover:text-green-500"
                                )}
                            >
                                <div className={clsx("p-1 rounded-lg transition-colors mb-0.5", isActive ? "bg-green-100 text-green-600" : "bg-transparent")}>
                                    <Icon className={clsx("h-5 w-5", isActive && "fill-current")} strokeWidth={isActive ? 2.5 : 2} />
                                </div>
                                <span className="text-[10px] font-medium leading-none">{item.name}</span>
                            </Link>
                        );
                    })}
                </div>
            </div>
        </>
    );
}

'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth0 } from '@/hooks/useAuth0';
import { Menu, X, Download, User as UserIcon, LogOut, MessageCircle, AlertCircle, FileText, Search } from 'lucide-react';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import { io } from 'socket.io-client';

export default function Navbar() {
    const { user, isLoading, loginWithRedirect, logout } = useAuth0();
    const [isOpen, setIsOpen] = useState(false);
    const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
    const [unreadCount, setUnreadCount] = useState(0);
    const pathname = usePathname();

    useEffect(() => {
        if (!user) return;

        // Initialize socket for notifications
        const socket = io({
            path: '/api/socket/io',
            addTrailingSlash: false,
            transports: ['websocket', 'polling'],
        });

        socket.on('connect', () => {
            if (user.sub) socket.emit('user-online', user.sub);
        });

        socket.on('notification', (data) => {
            setUnreadCount(prev => prev + 1);
        });

        return () => {
            socket.disconnect();
        };
    }, [user]);

    const handleInstallClick = async () => {
        if (deferredPrompt) {
            deferredPrompt.prompt();
            const { outcome } = await deferredPrompt.userChoice;
            if (outcome === 'accepted') {
                setDeferredPrompt(null);
            }
        }
    };

    // Hide Navbar on chat pages
    if (pathname?.startsWith('/chat')) return null;

    return (
        <nav className="bg-white border-b border-gray-100 shadow-sm sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                    <div className="flex">
                        <Link href="/" className="flex-shrink-0 flex items-center gap-2">
                            {/* Logo Icon can go here */}
                            <div className="bg-green-600 text-white p-1.5 rounded-lg shadow-sm">
                                <b className="text-xl">SL</b>
                            </div>
                            <span className="font-bold text-xl text-gray-900 tracking-tight">Study<span className="text-green-600">Local</span></span>
                        </Link>
                    </div>

                    <div className="hidden sm:ml-6 sm:items-center sm:flex space-x-6">
                        <Link href="/tutors" className="text-gray-600 hover:text-green-600 font-medium transition flex items-center gap-1">
                            Find Tutors
                        </Link>

                        {!isLoading && !user && (
                            <Link href="/auth/login" className="flex items-center gap-2 text-sm font-medium text-gray-900 hover:text-green-600 transition">
                                <UserIcon className="w-4 h-4" />
                                Login
                            </Link>
                        )}

                        {!isLoading && user && (
                            <div className="relative flex items-center gap-3 pl-3 border-l border-gray-200">
                                <Link
                                    href="/chat"
                                    onClick={() => setUnreadCount(0)}
                                    className="text-gray-600 hover:text-green-600 transition relative mr-2"
                                >
                                    <MessageCircle className="w-6 h-6" />
                                    {unreadCount > 0 && (
                                        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] w-4 h-4 flex items-center justify-center rounded-full animate-bounce">
                                            {unreadCount > 9 ? '9+' : unreadCount}
                                        </span>
                                    )}
                                </Link>
                                <Link href="/dashboard" className="text-sm font-medium text-gray-700 hover:text-green-600 transition">
                                    Profile
                                </Link>

                                <div className="flex items-center gap-2">
                                    {user.picture ? (
                                        <Image
                                            src={user.picture}
                                            alt={user.name || 'User'}
                                            width={32}
                                            height={32}
                                            className="h-8 w-8 rounded-full border border-gray-200 object-cover"
                                        />
                                    ) : (
                                        <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                                            <UserIcon className="h-4 w-4" />
                                        </div>
                                    )}
                                    <Link href="/auth/logout" className="text-gray-400 hover:text-red-500 transition">
                                        <LogOut className="h-4 w-4" />
                                    </Link>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="-mr-2 flex items-center sm:hidden gap-2">
                        {deferredPrompt && (
                            <button
                                onClick={handleInstallClick}
                                className="p-2 rounded-md text-brand-600 hover:bg-brand-50 focus:outline-none"
                                aria-label="Install App"
                            >
                                <Download className="h-6 w-6" />
                            </button>
                        )}

                        <button
                            onClick={() => setIsOpen(!isOpen)}
                            className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none"
                        >
                            {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile menu */}
            {isOpen && (
                <div className="sm:hidden bg-white border-t border-gray-100">
                    <div className="pt-2 pb-3 space-y-1 px-2">
                        <Link href="/tutors" className="flex items-center gap-2 px-3 py-2 text-base font-medium text-gray-700 hover:text-green-600 hover:bg-green-50 rounded-md">
                            <Search className="w-5 h-5" />
                            Find Tutors
                        </Link>
                        <Link href="/dashboard" className="flex items-center gap-2 px-3 py-2 text-base font-medium text-gray-700 hover:text-green-600 hover:bg-green-50 rounded-md">
                            <UserIcon className="w-5 h-5" />
                            Profile
                        </Link>
                        <Link href="/chat" className="flex items-center gap-2 px-3 py-2 text-base font-medium text-gray-700 hover:text-green-600 hover:bg-green-50 rounded-md">
                            <MessageCircle className="w-5 h-5" />
                            Chat
                        </Link>
                        <Link href="/complaints" className="flex items-center gap-2 px-3 py-2 text-base font-medium text-gray-700 hover:text-green-600 hover:bg-green-50 rounded-md">
                            <AlertCircle className="w-5 h-5" />
                            Complaint
                        </Link>
                        <Link href="/terms" className="flex items-center gap-2 px-3 py-2 text-base font-medium text-gray-700 hover:text-green-600 hover:bg-green-50 rounded-md">
                            <FileText className="w-5 h-5" />
                            Terms & Conditions
                        </Link>
                        {!isLoading && !user && (
                            <Link href="/auth/login"
                                className="w-full text-left flex items-center gap-2 px-3 py-2 text-base font-medium text-gray-700 hover:text-green-600 hover:bg-green-50 rounded-md"
                            >
                                <UserIcon className="w-4 h-4" />
                                Login
                            </Link>
                        )}
                        {!isLoading && user && (
                            <Link href="/auth/logout"
                                className="w-full text-left flex items-center gap-2 px-3 py-2 text-base font-medium text-red-600 hover:bg-red-50 rounded-md"
                            >
                                <LogOut className="w-5 h-5" />
                                Logout
                            </Link>
                        )}
                    </div>
                </div>
            )}
        </nav>
    );
}

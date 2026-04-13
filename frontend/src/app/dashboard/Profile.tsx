"use client"
import { useState, useEffect } from 'react';
import Image from 'next/image';
import { User, LogOut } from 'lucide-react';
import { useUser } from "@auth0/nextjs-auth0/client";
import { getUser } from '@/lib/actions/user';
import { getMyTutorProfile } from '@/lib/actions/tutor';
import { useRouter } from 'next/navigation';
import TutorProfileEditor from './TutorProfileEditor';
import SupportSection from './SupportSection';

export default function Profile() {
    const { user, isLoading } = useUser();
    const [dbUser, setDbUser] = useState<any>(null);
    const [tutorProfile, setTutorProfile] = useState<any>(null);

    useEffect(() => {
        const fetchData = async () => {
            if (user?.sub) {
                const [userData, tutorData] = await Promise.all([
                    getUser(user.sub),
                    getMyTutorProfile()
                ]);
                setDbUser(userData);
                setTutorProfile(tutorData);
            }
        };
        if (user) fetchData();
    }, [user]);

    const router = useRouter();
    // ... same as before ...
    const getLogoutUrl = () => {
        const returnTo = typeof window !== 'undefined'
            ? `${window.location.origin}/`
            : (process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000') + '/';
        return `/auth/logout?returnTo=${encodeURIComponent(returnTo)}`;
    };

    const displayName = dbUser?.fullName || user?.name || 'Welcome!';
    const displayImage = dbUser?.photoUrl || user?.picture;
    const displayEmail = dbUser?.email || user?.email;

    return (
        <div className="max-w-2xl mx-auto w-full px-4">
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100 w-full mb-8">
                <div className="bg-gradient-to-r from-green-600 to-teal-500 h-32 relative">
                    <div className="absolute -bottom-16 left-1/2 transform -translate-x-1/2 p-1.5 bg-white rounded-full">
                        <div className="relative h-32 w-32 rounded-full overflow-hidden border-4 border-white shadow-md bg-gray-100">
                            {displayImage ? (
                                <Image
                                    src={displayImage}
                                    alt={displayName}
                                    fill
                                    className="object-cover"
                                />
                            ) : (
                                <div className="h-full w-full flex items-center justify-center bg-gray-100 text-gray-400">
                                    <User className="h-16 w-16" />
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="pt-20 pb-8 px-8 text-center">
                    <h1 className="text-2xl font-bold text-gray-900 mb-1">{displayName}</h1>
                    <p className="text-gray-500 font-medium mb-6">{displayEmail}</p>

                    <div className="space-y-4">
                        <div className="bg-green-50 rounded-xl p-4 border border-green-100 text-left flex justify-between items-center">
                            <div>
                                <h3 className="text-xs font-semibold text-green-800 uppercase tracking-wide mb-1">Account Role</h3>
                                <div className="flex items-center gap-2 text-green-700 font-bold capitalize">
                                    <span className="h-2 w-2 rounded-full bg-green-500"></span>
                                    {dbUser?.role || 'Member'}
                                </div>
                            </div>
                            <a
                                href={getLogoutUrl()}
                                onClick={(e) => {
                                    e.preventDefault();
                                    if (window.confirm('Are you sure you want to log out?')) {
                                        window.location.href = getLogoutUrl();
                                    }
                                }}
                                className="text-gray-400 hover:text-red-500 transition-colors p-2"
                                title="Logout"
                            >
                                <LogOut className="h-5 w-5" />
                            </a>
                        </div>
                    </div>
                </div>
            </div>

            {/* Support & Feedback Section */}
            <div className="animate-in fade-in slide-in-from-bottom-8 duration-700 delay-100 mb-10">
                <SupportSection />
            </div>

            {/* Tutor Specific Editor */}
            {tutorProfile && (
                <div className="animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200">
                    <TutorProfileEditor tutor={tutorProfile} onUpdate={() => router.refresh()} />
                </div>
            )}
            
            {/* Student Notice if no tutor profile and role isn't tutor */}
            {!tutorProfile && dbUser?.role !== 'tutor' && (
                <div className="bg-indigo-50 rounded-2xl p-6 border border-indigo-100 flex items-center justify-between">
                    <div>
                        <h4 className="font-bold text-indigo-900">Sharing your knowledge?</h4>
                        <p className="text-sm text-indigo-600">Register as a tutor to help local students.</p>
                    </div>
                    <button 
                        onClick={() => router.push('/tutor-registration')}
                        className="bg-indigo-600 text-white px-4 py-2 rounded-xl font-bold hover:bg-indigo-700 transition"
                    >
                        Learn More
                    </button>
                </div>
            )}
        </div>
    );
}


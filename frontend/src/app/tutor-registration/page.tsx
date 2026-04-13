'use client';

import { useUser } from '@auth0/nextjs-auth0/client';
import TutorRegistrationForm from './TutorRegistrationForm';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';

export default function TutorRegistrationPage() {
    const { user, isLoading } = useUser();
    const router = useRouter();
    const [isRedirecting, setIsRedirecting] = useState(false);

    useEffect(() => {
        if (!isLoading && !user && !isRedirecting) {
            setIsRedirecting(true);
            toast.info("Please login to register as a tutor");

            const returnTo = typeof window !== 'undefined'
                ? `${window.location.origin}/tutor-registration`
                : `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/tutor-registration`;
            window.location.href = `/auth/login`;
        }
    }, [user, isLoading, router, isRedirecting]);

    if (isLoading || isRedirecting) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
                <div className="w-12 h-12 border-4 border-green-600 border-t-transparent rounded-full animate-spin mb-4"></div>
                <p className="text-gray-600 font-medium">Checking authentication...</p>
            </div>
        );
    }

    if (!user) return null;

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto">
                <div className="mb-10 text-center animate-in fade-in slide-in-from-bottom-3 duration-500">
                    <h1 className="text-4xl sm:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-green-600 via-teal-600 to-green-800 tracking-tight mb-3 px-2">
                        Become a Tutor
                    </h1>
                    <p className="mt-4 text-base sm:text-lg text-gray-600 max-w-2xl mx-auto font-medium">
                        Join our community of local educators. Help students in your neighbourhood excel while growing your independent teaching business.
                    </p>
                </div>

                <TutorRegistrationForm user={user} />
            </div>
        </div>
    );
}


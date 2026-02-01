"use client"
import { useState, useEffect } from 'react';
import Image from 'next/image';
import { User, LogOut } from 'lucide-react';
import { useUser } from "@auth0/nextjs-auth0/client";
import { getUser } from '@/lib/actions/user';


interface ProfileProps {
    user: {
        name?: string | null;
        email?: string | null;
        picture?: string | null;
        [key: string]: any;
    };
}

export default function Profile() {
    const { user, isLoading } = useUser();
    const [dbUser, setDbUser] = useState<any>(null);

    useEffect(() => {
        const fetchUser = async () => {
            if (user?.sub) {
                const data = await getUser(user.sub);
                setDbUser(data);
            }
        };
        if (user) fetchUser();
    }, [user]);

    const displayName = dbUser?.fullName || user?.name || 'Welcome!';
    const displayImage = dbUser?.photoUrl || user?.picture;
    const displayEmail = dbUser?.email || user?.email;

    return (
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100 max-w-md w-full mx-auto">
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
                    <div className="bg-green-50 rounded-xl p-4 border border-green-100 text-left">
                        <h3 className="text-xs font-semibold text-green-800 uppercase tracking-wide mb-2">Account Status</h3>
                        <div className="flex items-center gap-2 text-green-700 font-medium">
                            <span className="h-2 w-2 rounded-full bg-green-500"></span>
                            Active Member
                        </div>
                    </div>

                </div>

                <div className="mt-8 pt-6 border-t border-gray-100">
                    <a
                        href="/api/auth/logout"
                        className="inline-flex items-center justify-center w-full px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
                    >
                        <LogOut className="mr-2 h-4 w-4" />
                        Log Out
                    </a>
                </div>
            </div>
        </div>
    );
}

'use client';

import TutorCard from '@/app/tutors/TutorCard';
import { Search } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useTransition, useEffect } from 'react';
import { getCurrentUser } from '@/lib/actions/user';

interface Tutor {
    _id: string;
    fullName: string;
    photoUrl?: string;
    subjects: string[];
    classRange: string;
    area: string;
    monthlyFee: number;
    marketingStatus: string;
    [key: string]: any;
}

import SearchNearby from '@/components/search/SearchNearby';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface TutorsListProps {
    tutors: Tutor[];
    initialSubject: string;
    initialArea: string;
    pagination: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    };
}

export default function TutorsList({ tutors, initialSubject, initialArea, pagination }: TutorsListProps) {
    const router = useRouter();
    const [subject, setSubject] = useState(initialSubject);
    const [area, setArea] = useState(initialArea);
    const [currentUserRole, setCurrentUserRole] = useState<'student' | 'tutor' | null>(null);
    const searchParams = useSearchParams();

    useEffect(() => {
        const fetchRole = async () => {
            const user = await getCurrentUser();
            if (user) {
                setCurrentUserRole(user.role as 'student' | 'tutor');
            }
        };
        fetchRole();
    }, []);

    // Sync state with URL params
    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        updateUrl(subject, area, 1); // Reset to page 1 on new search
    };

    const updateUrl = (sub: string, ar: string, pg: number) => {
        const params = new URLSearchParams();
        if (sub) params.set('subject', sub);
        if (ar) params.set('area', ar);
        if (pg > 1) params.set('page', pg.toString());
        router.push(`/tutors?${params.toString()}`);
    };

    const handlePageChange = (newPage: number) => {
        if (newPage < 1 || newPage > pagination.totalPages) return;
        updateUrl(subject, area, newPage);
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Search Header */}
            <div className="bg-white shadow-sm border-b border-gray-200 sticky top-16 z-40">
                <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col md:flex-row gap-4 items-center">
                        <form onSubmit={handleSearch} className="flex-grow flex flex-col sm:flex-row gap-2 w-full">
                            <div className="relative flex-grow">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Search className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    type="text"
                                    value={subject}
                                    onChange={(e) => setSubject(e.target.value)}
                                    placeholder="Subject (e.g. Maths)"
                                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-green-500 focus:border-green-500 sm:text-sm"
                                />
                            </div>
                            <div className="relative flex-grow">
                                <input
                                    type="text"
                                    value={area}
                                    onChange={(e) => setArea(e.target.value)}
                                    placeholder="Area (e.g. Koramangala)"
                                    className="block w-full px-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-green-500 focus:border-green-500 sm:text-sm"
                                />
                            </div>
                            <button type="submit" className="bg-green-600 text-white px-6 py-2 rounded-md font-medium text-sm hover:bg-green-700 whitespace-nowrap">
                                Search
                            </button>
                        </form>

                        <div className="flex-shrink-0">
                            <SearchNearby />
                        </div>
                    </div>
                </div>
            </div>

            {/* Results */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-lg font-semibold text-gray-900">
                        {pagination.total > 0
                            ? `Found ${pagination.total} Tutors ${initialArea ? `in ${initialArea}` : 'nearby'}`
                            : 'No tutors found matching your criteria.'}
                    </h2>
                    {pagination.total > 0 && (
                        <span className="text-sm text-gray-500">
                            Page {pagination.page} of {pagination.totalPages}
                        </span>
                    )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {tutors.map((tutor) => (
                        <TutorCard
                            key={tutor._id}
                            tutor={tutor}
                            currentUserRole={currentUserRole}
                        />
                    ))}
                </div>

                {/* Pagination Controls */}
                {pagination.totalPages > 1 && (
                    <div className="mt-8 flex justify-center gap-2">
                        <button
                            onClick={() => handlePageChange(pagination.page - 1)}
                            disabled={pagination.page === 1}
                            className="p-2 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <ChevronLeft className="w-5 h-5" />
                        </button>

                        {/* Simple generic pages for now */}
                        {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((p) => (
                            <button
                                key={p}
                                onClick={() => handlePageChange(p)}
                                className={`px-4 py-2 border rounded-md text-sm font-medium ${p === pagination.page
                                    ? 'bg-green-600 text-white border-green-600'
                                    : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                                    }`}
                            >
                                {p}
                            </button>
                        ))}

                        <button
                            onClick={() => handlePageChange(pagination.page + 1)}
                            disabled={pagination.page === pagination.totalPages}
                            className="p-2 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <ChevronRight className="w-5 h-5" />
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}

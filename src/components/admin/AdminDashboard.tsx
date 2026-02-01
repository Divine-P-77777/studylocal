'use client';

import Image from 'next/image';
import AdminStats from '@/components/admin/AdminStats';
import TutorActions from '@/components/admin/TutorActions';

interface Tutor {
    _id: string;
    fullName: string;
    photoUrl?: string;
    contactInfo: {
        email: string;
        phone: string;
    };
    subjects: string[];
    classRange: string;
    area: string;
    monthlyFee: number;
    bio?: string;
}

interface AdminDashboardProps {
    pendingTutors: Tutor[];
    stats: {
        total: number;
        approved: number;
        pending: number;
        complaints: number;
    };
}

export default function AdminDashboard({ pendingTutors, stats }: AdminDashboardProps) {
    return (
        <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-6">Pending Approvals</h1>

            <AdminStats
                totalTutors={stats.total}
                approvedTutors={stats.approved}
                pendingTutors={stats.pending}
                complaints={stats.complaints}
            />

            {pendingTutors.length === 0 ? (
                <div className="bg-white rounded-lg shadow-sm p-8 text-center text-gray-500">
                    No pending tutor applications.
                </div>
            ) : (
                <div className="grid gap-6">
                    {pendingTutors.map((tutor) => (
                        <div key={tutor._id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 flex flex-col md:flex-row items-center md:items-start gap-6">
                            <div className="relative h-20 w-20 flex-shrink-0">
                                {tutor.photoUrl ? (
                                    <Image src={tutor.photoUrl} alt={tutor.fullName} fill className="object-cover rounded-full" />
                                ) : (
                                    <div className="h-full w-full bg-gray-200 rounded-full" />
                                )}
                            </div>

                            <div className="flex-grow text-center md:text-left">
                                <h3 className="text-lg font-semibold text-gray-900">{tutor.fullName}</h3>
                                <div className="text-sm text-gray-500 mb-2">{tutor.contactInfo?.email} | {tutor.contactInfo?.phone}</div>
                                <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm text-gray-600 mb-3">
                                    <div><span className="font-medium">Subject:</span> {tutor.subjects.join(', ')}</div>
                                    <div><span className="font-medium">Class:</span> {tutor.classRange}</div>
                                    <div><span className="font-medium">Area:</span> {tutor.area}</div>
                                    <div><span className="font-medium">Fee:</span> ₹{tutor.monthlyFee}/pm</div>
                                </div>
                                <p className="text-sm text-gray-600 italic">"{tutor.bio}"</p>
                            </div>

                            <TutorActions tutorId={tutor._id} />
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

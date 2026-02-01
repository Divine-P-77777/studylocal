import dbConnect from '@/lib/db/connect';
import TutorProfile from '@/lib/models/TutorProfile';
import AdminTutorManagement from '@/components/admin/AdminTutorManagement';
import { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export const metadata: Metadata = {
    title: 'Manage Tutors | Admin Dashboard',
    description: 'Search, filter, and manage tutor applications.',
};

export default async function AdminTutorPage() {
    await dbConnect();

    // Fetch all tutors, sorted by newest
    const tutorProfiles = await TutorProfile.find({}).sort({ createdAt: -1 }).lean();

    const plainTutors = tutorProfiles.map(tutor => ({
        ...tutor,
        _id: (tutor as any)._id.toString(),
        createdAt: (tutor as any).createdAt?.toISOString(),
        updatedAt: (tutor as any).updatedAt?.toISOString(),
    }));

    return (
        <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto space-y-6">
                <div className="flex items-center gap-4">
                    <Link
                        href="/admin"
                        className="p-2 bg-white rounded-lg border border-gray-200 text-gray-400 hover:text-green-600 hover:border-green-100 transition shadow-sm"
                    >
                        <ArrowLeft className="h-5 w-5" />
                    </Link>
                    <div>
                        <nav className="text-sm text-gray-500 mb-1">
                            <Link href="/admin" className="hover:text-green-600">Admin</Link>
                            <span className="mx-2">/</span>
                            <span className="text-gray-900 font-medium">Tutors</span>
                        </nav>
                        <h1 className="text-3xl font-bold text-gray-900">Platform Tutors</h1>
                    </div>
                </div>

                <AdminTutorManagement initialTutors={plainTutors as any} />
            </div>
        </div>
    );
}

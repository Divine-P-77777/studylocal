import dbConnect from '@/lib/db/connect';
import Complaint from '@/lib/models/Complaint';
import AdminComplaintsDashboard from '@/components/admin/AdminComplaintsDashboard';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Admin Complaints | StudyLocal',
    description: 'Review and manage user complaints and issues.',
    robots: {
        index: false,
        follow: false,
    },
};

export default async function AdminComplaintsPage() {
    await dbConnect();

    const complaints = await Complaint.find({}).sort({ createdAt: -1 }).lean();

    const plainComplaints = complaints.map(c => ({
        ...c,
        _id: (c as any)._id.toString(),
        createdAt: (c as any).createdAt?.toISOString(),
        updatedAt: (c as any).updatedAt?.toISOString(),
    }));

    return (
        <AdminComplaintsDashboard complaints={plainComplaints as any} />
    );
}

import dbConnect from '@/lib/db/connect';
import Complaint from '@/lib/models/Complaint';
import User from '@/lib/models/User';
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

    const complaints = await Complaint.find({})
        .sort({ createdAt: -1 })
        .lean();

    // Fetch user details for all reporters
    const reporterIds = [...new Set(complaints.map(c => (c as any).reporterId).filter(id => id && id !== 'anonymous'))];
    const users = await User.find({ auth0Id: { $in: reporterIds } }).lean();
    
    // Create a map for quick lookup
    const userMap = users.reduce((acc: any, user: any) => {
        acc[user.auth0Id] = {
            fullName: user.fullName,
            email: user.email
        };
        return acc;
    }, {});

    const plainComplaints = complaints.map(c => {
        const reporterId = (c as any).reporterId ?? 'anonymous';
        const userDetails = userMap[reporterId] || { fullName: 'Unknown User', email: '' };

        return {
            _id: (c as any)._id.toString(),
            reporterId,
            reporterName: userDetails.fullName,
            reporterEmail: userDetails.email,
            type: (c as any).type ?? 'complaint',
            status: (c as any).status ?? 'pending',
            description: (c as any).description ?? '',
            reason: (c as any).reason ?? '',
            createdAt: (c as any).createdAt?.toISOString() ?? new Date().toISOString(),
            updatedAt: (c as any).updatedAt?.toISOString() ?? null,
        };
    });

    return (
        <AdminComplaintsDashboard complaints={plainComplaints as any} />
    );
}

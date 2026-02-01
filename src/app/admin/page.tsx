import dbConnect from '@/lib/db/connect';
import TutorProfile from '@/lib/models/TutorProfile';
import AdminDashboard from '@/components/admin/AdminDashboard';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Admin Dashboard | StudyLocal',
  description: 'Manage tutor applications and platform statistics.',
  robots: {
    index: false,
    follow: false,
  },
};

export default async function AdminPage() {
  await dbConnect();


  const pendingTutors = await TutorProfile.find({ marketingStatus: 'pending' }).sort({ createdAt: -1 }).lean();

  const total = await TutorProfile.countDocuments();
  const approved = await TutorProfile.countDocuments({ marketingStatus: 'approved' });
  const pending = await TutorProfile.countDocuments({ marketingStatus: 'pending' });
  const complaints = 0;


  const plainPendingTutors = pendingTutors.map(tutor => ({
    ...tutor,
    _id: (tutor as any)._id.toString(),
    createdAt: (tutor as any).createdAt?.toISOString(),
    updatedAt: (tutor as any).updatedAt?.toISOString(),
  }));

  const stats = {
    total,
    approved,
    pending,
    complaints
  };

  return (
    <AdminDashboard pendingTutors={plainPendingTutors as any} stats={stats} />
  );
}

import { auth0 } from '@/lib/auth0';
import Profile from '@/app/dashboard/Profile';
import { redirect } from 'next/navigation';

export const metadata = {
    title: 'Dashboard | StudyLocal',
};

export default async function DashboardPage() {
    const session = await auth0.getSession();

    if (!session || !session.user) {
        redirect('/api/auth/login?returnTo=/dashboard');
    }

    const { user } = session;

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 flex flex-col items-center justify-center">
            <div className="w-full max-w-md mb-8 text-center">
                <h2 className="text-3xl font-extrabold text-gray-900">Welcome Back</h2>
                <p className="mt-2 text-gray-600">Manage your profile and account settings.</p>
            </div>

            <Profile />
        </div>
    );
}

import { auth0 } from '@/lib/auth0';
import TutorRegistrationForm from './TutorRegistrationForm';
import { redirect } from 'next/navigation';

export const metadata = {
    title: 'Register as Tutor | StudyLocal',
};

export default async function TutorRegistrationPage() {
    const session = await auth0.getSession();
    const user = session?.user;

    if (!user) {
        redirect('/api/auth/login?returnTo=/tutor-registration');
    }

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto">
                <div className="mb-8 text-center">
                    <h1 className="text-3xl font-extrabold text-gray-900">Become a Tutor</h1>
                    <p className="mt-2 text-sm text-gray-600">
                        Join our community of local educators. Help students in your neighbourhood excel.
                    </p>
                </div>

                <TutorRegistrationForm user={user} />
            </div>
        </div>
    );
}

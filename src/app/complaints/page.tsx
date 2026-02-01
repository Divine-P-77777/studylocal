import ComplaintForm from './ComplaintForm';

export const metadata = {
    title: 'Report Issue | StudyLocal',
    description: 'Report any issues or concerns regarding tutors or the platform. We value safety and community standards.',
    keywords: ['report issue', 'complaint', 'studylocal help', 'support'],
};

export default function ComplaintPage() {
    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md mx-auto bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
                <div className="bg-red-50 p-6 border-b border-red-100">
                    <h1 className="text-2xl font-bold text-red-800">Report an Issue</h1>
                    <p className="mt-2 text-sm text-red-600">
                        We take your safety and satisfaction seriously. Let us know what went wrong.
                    </p>
                </div>
                <div className="p-6">
                    <ComplaintForm />
                </div>
            </div>
        </div>
    );
}

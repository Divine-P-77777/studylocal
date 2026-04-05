import { getTutors } from '@/lib/actions/search';
import TutorsList from './TutorsList';
import { Metadata } from 'next';
import { Suspense } from 'react';

// ISR: Revalidate every 30 seconds so approved tutors appear without a full re-deploy.
// The first request after 30s triggers a background re-fetch; users never see a loading state.
export const revalidate = 30;

export async function generateMetadata(props: {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}): Promise<Metadata> {
    const searchParams = await props.searchParams;
    const subject = typeof searchParams.subject === 'string' ? searchParams.subject : '';
    const area = typeof searchParams.area === 'string' ? searchParams.area : '';

    const title = subject && area
        ? `${subject} Tutors in ${area} | StudyLocal`
        : subject
            ? `${subject} Tutors | StudyLocal`
            : area
                ? `Tutors in ${area} | StudyLocal`
                : 'Find Tutors Nearby | StudyLocal';

    return {
        title,
        description: `Find the best local ${subject || ''} tutors in ${area || 'your neighbourhood'}. Verified profiles, no commission, direct contact.`,
    };
}

async function TutorsFetcher(props: {
    subject: string;
    area: string;
    page: number;
}) {
    const { subject, area, page } = props;
    const limit = 10;
    const { tutors, pagination } = await getTutors({ subject, area }, page, limit);
    return (
        <TutorsList
            tutors={tutors}
            initialSubject={subject}
            initialArea={area}
            pagination={pagination}
        />
    );
}

function TutorsLoadingSkeleton() {
    return (
        <div className="max-w-7xl mx-auto px-4 py-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="rounded-2xl border border-gray-100 bg-white p-5 animate-pulse shadow-sm">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="h-14 w-14 rounded-full bg-gray-200" />
                            <div className="flex-1 space-y-2">
                                <div className="h-4 bg-gray-200 rounded w-3/4" />
                                <div className="h-3 bg-gray-100 rounded w-1/2" />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <div className="h-3 bg-gray-100 rounded" />
                            <div className="h-3 bg-gray-100 rounded w-5/6" />
                        </div>
                        <div className="mt-4 h-10 bg-gray-100 rounded-xl" />
                    </div>
                ))}
            </div>
        </div>
    );
}

export default async function TutorsPage(props: {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
    const searchParams = await props.searchParams;
    const subject = typeof searchParams.subject === 'string' ? searchParams.subject : '';
    const area = typeof searchParams.area === 'string' ? searchParams.area : '';
    const page = typeof searchParams.page === 'string' ? parseInt(searchParams.page) : 1;

    return (
        <Suspense fallback={<TutorsLoadingSkeleton />}>
            <TutorsFetcher subject={subject} area={area} page={page} />
        </Suspense>
    );
}

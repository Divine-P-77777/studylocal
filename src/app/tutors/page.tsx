import { getTutors } from '@/lib/actions/search';
import TutorsList from './TutorsList';
import { Metadata } from 'next';

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

export default async function TutorsPage(props: {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
    const searchParams = await props.searchParams;
    const subject = typeof searchParams.subject === 'string' ? searchParams.subject : '';
    const area = typeof searchParams.area === 'string' ? searchParams.area : '';

    const page = typeof searchParams.page === 'string' ? parseInt(searchParams.page) : 1;
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

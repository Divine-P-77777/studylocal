import { MetadataRoute } from 'next';
import dbConnect from '@/lib/db/connect';
import TutorProfile from '@/lib/models/TutorProfile';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const baseUrl = 'http://localhost:3000'; // Replace with env var in prod

    await dbConnect();
    const tutors = await TutorProfile.find({}, '_id updatedAt').lean();

    const tutorUrls = tutors.map((tutor) => ({
        url: `${baseUrl}/tutor/${tutor._id}`,
        lastModified: (tutor as any).updatedAt || new Date(),
        changeFrequency: 'weekly' as const,
        priority: 0.8,
    }));

    return [
        {
            url: baseUrl,
            lastModified: new Date(),
            changeFrequency: 'daily',
            priority: 1,
        },
        {
            url: `${baseUrl}/tutors`,
            lastModified: new Date(),
            changeFrequency: 'daily',
            priority: 0.9,
        },
        {
            url: `${baseUrl}/tutor-registration`,
            lastModified: new Date(),
            changeFrequency: 'monthly',
            priority: 0.7,
        },
        ...tutorUrls,
    ];
}

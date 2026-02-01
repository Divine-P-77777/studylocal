import { getTutorById } from '@/lib/actions/search';
import { Metadata } from 'next';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { MapPin, BookOpen, Clock, Banknote, Phone, Mail, Award, CheckCircle, MessageCircle } from 'lucide-react';
import { auth0 } from '@/lib/auth0';
import { getUser } from '@/lib/actions/user';

interface Props {
    params: Promise<{ id: string }>;
}

export async function generateMetadata(props: Props): Promise<Metadata> {
    const params = await props.params;
    const tutor = await getTutorById(params.id);
    if (!tutor) return { title: 'Tutor Not Found' };

    return {
        title: `${tutor.fullName} - ${tutor.subjects.join(', ')} Tutor in ${tutor.area}`,
        description: `Connect with ${tutor.fullName} for ${tutor.classRange} tuitions in ${tutor.area}. Monthly fee starts from ₹${tutor.monthlyFee}.`,
        openGraph: {
            images: [tutor.photoUrl || '/og-default.jpg'],
        },
    };
}

export async function generateViewport(): Promise<import("next").Viewport> {
    return {
        themeColor: '#059669',
    };
}

export default async function TutorDetailPage(props: Props) {
    const params = await props.params;
    const tutor = await getTutorById(params.id);

    if (!tutor) {
        notFound();
    }

    // Check if user is logged in to see contact info
    const session = await auth0.getSession();
    const isLoggedIn = !!session?.user;

    let currentUserRole = 'student';
    if (session?.user?.sub) {
        const currentUser = await getUser(session.user.sub);
        if (currentUser) {
            currentUserRole = currentUser.role;
        }
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">

                    {/* Header / Banner */}
                    <div className="h-32 bg-gradient-to-r from-green-500 to-green-600"></div>

                    <div className="px-8 pb-8">
                        <div className="relative flex justify-between items-end -mt-12">
                            <div className="relative h-24 w-24 sm:h-32 sm:w-32 rounded-full ring-4 ring-white overflow-hidden bg-white">
                                {tutor.photoUrl ? (
                                    <Image src={tutor.photoUrl} alt={tutor.fullName} fill className="object-cover" />
                                ) : (
                                    <div className="h-full w-full bg-gray-100 flex items-center justify-center text-gray-400">
                                        No Photo
                                    </div>
                                )}
                            </div>

                            <div className="hidden sm:block mb-2">
                                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                    <CheckCircle className="w-3 h-3 mr-1" />
                                    Verified Tutor
                                </span>
                            </div>
                        </div>

                        <div className="mt-6">
                            <h1 className="text-3xl font-bold text-gray-900">{tutor.fullName}</h1>
                            <div className="flex flex-wrap items-center gap-4 mt-2 text-gray-600">
                                <div className="flex items-center">
                                    <MapPin className="h-4 w-4 mr-1" />
                                    {tutor.area}
                                </div>
                                <div className="flex items-center">
                                    <Banknote className="h-4 w-4 mr-1" />
                                    ₹{tutor.monthlyFee}/month (Starts from)
                                </div>
                            </div>
                        </div>

                        {/* Main Content Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-8">
                            {/* Left Column - Info */}
                            <div className="md:col-span-2 space-y-8">
                                <section>
                                    <h2 className="text-xl font-semibold text-gray-900 mb-3 flex items-center">
                                        <BookOpen className="h-5 w-5 mr-2 text-green-600" />
                                        Subjects & Classes
                                    </h2>
                                    <div className="bg-gray-50 rounded-lg p-4">
                                        <p className="font-medium text-gray-900 mb-2">Teaches: {tutor.classRange}</p>
                                        <div className="flex flex-wrap gap-2">
                                            {tutor.subjects.map((sub: string) => (
                                                <span key={sub} className="bg-white border border-gray-200 text-gray-700 px-3 py-1 rounded-md text-sm">
                                                    {sub}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                </section>

                                <section>
                                    <h2 className="text-xl font-semibold text-gray-900 mb-3 flex items-center">
                                        <Award className="h-5 w-5 mr-2 text-green-600" />
                                        Experience & Bio
                                    </h2>
                                    <div className="prose text-gray-600 text-sm">
                                        <p className="font-medium mb-1">Experience: {tutor.experience}</p>
                                        <p>{tutor.bio}</p>
                                    </div>
                                </section>

                                <section>
                                    <h2 className="text-xl font-semibold text-gray-900 mb-3 flex items-center">
                                        <Clock className="h-5 w-5 mr-2 text-green-600" />
                                        Tuition Mode
                                    </h2>
                                    <div className="flex gap-4">
                                        {/* Show only relevant mode active */}
                                        <div className={`px-4 py-2 rounded-lg border ${tutor.tuitionMode === 'Home' ? 'bg-green-50 border-green-200 text-green-700 font-medium ring-1 ring-green-500' : 'bg-gray-50 border-gray-100 text-gray-400 opacity-60'}`}>
                                            Student's Home
                                        </div>
                                        <div className={`px-4 py-2 rounded-lg border ${tutor.tuitionMode === 'Tutor Home' ? 'bg-green-50 border-green-200 text-green-700 font-medium ring-1 ring-green-500' : 'bg-gray-50 border-gray-100 text-gray-400 opacity-60'}`}>
                                            Tutor's Home
                                        </div>
                                        <div className={`px-4 py-2 rounded-lg border ${tutor.tuitionMode === 'Online' ? 'bg-green-50 border-green-200 text-green-700 font-medium ring-1 ring-green-500' : 'bg-gray-50 border-gray-100 text-gray-400 opacity-60'}`}>
                                            Online
                                        </div>
                                    </div>
                                    <p className="text-xs text-gray-500 mt-2 bg-yellow-50 p-2 rounded border border-yellow-100 italic">
                                        Note: For online tuitions, tutors manage their own tools (Zoom/Meet). The platform does not facilitate video calls.
                                    </p>
                                </section>
                            </div>

                            {/* Right Column - Contact Card */}
                            <div className="md:col-span-1">
                                <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6 sticky top-24">
                                    <h3 className="text-lg font-bold text-gray-900 mb-4">Contact Tutor</h3>

                                    {isLoggedIn ? (
                                        <div className="space-y-4">
                                            <div className="flex items-start">
                                                <Phone className="h-5 w-5 text-green-600 mt-1 mr-3" />
                                                <div>
                                                    <p className="text-xs text-gray-500">Phone</p>
                                                    <p className="font-medium text-gray-900">{tutor.contactInfo?.phone}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-start">
                                                <Mail className="h-5 w-5 text-green-600 mt-1 mr-3 flex-shrink-0" />
                                                <div className="min-w-0">
                                                    <p className="text-xs text-gray-500">Email</p>
                                                    <a href={`mailto:${tutor.contactInfo?.email}`} className="font-medium text-green-600 hover:underline break-all">
                                                        {tutor.contactInfo?.email}
                                                    </a>
                                                </div>
                                            </div>

                                            {/* Chat Button */}
                                            <div className="pt-4">
                                                {currentUserRole === 'tutor' ? (
                                                    <div className="w-full bg-gray-100 text-gray-500 text-center py-2.5 rounded-xl font-medium text-sm border border-gray-200 cursor-not-allowed">
                                                        Tutors cannot message other tutors
                                                    </div>
                                                ) : (
                                                    <a
                                                        href={`/chat/${tutor._id}-${session.user.sub?.replace(/\|/g, '_')}`}
                                                        className="block w-full bg-green-600 text-white text-center py-2.5 rounded-xl font-semibold hover:bg-green-700 transition flex items-center justify-center gap-2"
                                                    >
                                                        <MessageCircle className="w-4 h-4" />
                                                        Chat with Tutor
                                                    </a>
                                                )}
                                            </div>

                                            <div className="pt-4 border-t border-gray-100">
                                                <p className="text-xs text-center text-gray-500">
                                                    Payment is COD (Cash on Delivery) directly to the tutor after classes.
                                                </p>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="text-center space-y-4">
                                            <p className="text-sm text-gray-600">
                                                Please login to view contact details and connect with this tutor.
                                            </p>
                                            <a
                                                href={`/api/auth/login?returnTo=/tutor/${tutor._id}`}
                                                className="block w-full bg-green-600 text-white text-center py-2 rounded-md font-medium hover:bg-green-700 transition"
                                            >
                                                Login to View
                                            </a>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
}

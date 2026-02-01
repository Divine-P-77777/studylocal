import Image from 'next/image';
import Link from 'next/link';
import { MapPin, BookOpen, GraduationCap, Banknote, CheckCircle } from 'lucide-react';

interface TutorCardProps {
    tutor: any;
    currentUserRole?: 'student' | 'tutor' | null;
}

export default function TutorCard({ tutor, currentUserRole }: TutorCardProps) {
    return (
        <Link href={`/tutor/${tutor._id}`} className="block group">
            <div className="bg-white rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-all duration-200 overflow-hidden h-full flex flex-col">
                <div className="p-4 flex gap-4">
                    <div className="relative h-20 w-20 flex-shrink-0">
                        {tutor.photoUrl ? (
                            <Image
                                src={tutor.photoUrl}
                                alt={tutor.fullName}
                                fill
                                className="object-cover rounded-full group-hover:scale-105 transition-transform"
                            />
                        ) : (
                            <div className="h-full w-full bg-gray-200 rounded-full flex items-center justify-center text-xs text-gray-500">
                                No Photo
                            </div>
                        )}
                    </div>

                    <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-bold text-gray-900 truncate group-hover:text-brand-600 transition-colors">
                            {tutor.fullName}
                        </h3>
                        <div className="flex items-center text-sm text-gray-500 mt-1">
                            <MapPin className="h-4 w-4 mr-1 text-gray-400" />
                            <span className="truncate">{tutor.area}</span>
                        </div>
                        <div className="mt-2 flex flex-wrap gap-1">
                            {tutor.subjects.slice(0, 3).map((sub: string) => (
                                <span key={sub} className="inline-block bg-brand-50 text-brand-700 text-xs px-2 py-1 rounded-md">
                                    {sub}
                                </span>
                            ))}
                            {tutor.subjects.length > 3 && (
                                <span className="text-xs text-gray-400 px-1">+{tutor.subjects.length - 3}</span>
                            )}
                        </div>
                    </div>
                </div>

                <div className="mt-auto border-t border-gray-100 p-3 bg-gray-50 flex justify-between items-center text-xs text-gray-600">
                    <div className="flex items-center gap-1">
                        <GraduationCap className="h-4 w-4 text-gray-400" />
                        {tutor.classRange}
                    </div>
                    <div className="flex items-center gap-1 font-semibold text-gray-800">
                        <Banknote className="h-4 w-4 text-gray-400" />
                        ₹{tutor.monthlyFee}
                    </div>
                </div>

                <div className="px-3 py-1 bg-green-50 text-center text-[10px] text-green-700 font-medium">
                    COD Only • Verified
                </div>
            </div>
        </Link>
    );
}

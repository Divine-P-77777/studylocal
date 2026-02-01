'use client';

import { Check, Clock, GraduationCap, User } from 'lucide-react';
import Image from 'next/image';

interface EnrolmentListProps {
    enrolments: {
        asStudent: any[];
        asTutor: any[];
    };
}

export default function EnrolmentList({ enrolments }: EnrolmentListProps) {
    const { asStudent, asTutor } = enrolments;

    if (asStudent.length === 0 && asTutor.length === 0) {
        return null;
    }

    return (
        <div className="w-full max-w-4xl mt-12 space-y-8">
            {asStudent.length > 0 && (
                <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <GraduationCap className="h-6 w-6 text-green-600" />
                        My Tutors
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {asStudent.map((enrol) => (
                            <div key={enrol._id} className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
                                <div className="h-12 w-12 rounded-full bg-green-50 overflow-hidden relative">
                                    {enrol.tutorId.photoUrl ? (
                                        <Image src={enrol.tutorId.photoUrl} alt={enrol.tutorId.fullName} fill className="object-cover" />
                                    ) : (
                                        <div className="flex items-center justify-center h-full text-green-600 font-bold uppercase">
                                            {enrol.tutorId.fullName.charAt(0)}
                                        </div>
                                    )}
                                </div>
                                <div className="flex-1">
                                    <h4 className="font-semibold text-gray-900">{enrol.tutorId.fullName}</h4>
                                    <p className="text-sm text-gray-500">{enrol.tutorId.subjects?.join(', ')}</p>
                                </div>
                                <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${enrol.status === 'confirmed' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'
                                    }`}>
                                    {enrol.status === 'confirmed' ? <Check className="h-3 w-3" /> : <Clock className="h-3 w-3" />}
                                    {enrol.status === 'confirmed' ? 'Active Deal' : 'Pending Confirmation'}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {asTutor.length > 0 && (
                <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <User className="h-6 w-6 text-blue-600" />
                        My Students
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {asTutor.map((enrol) => (
                            <div key={enrol._id} className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
                                <div className="flex-1">
                                    <h4 className="font-semibold text-gray-900">Student ID: {enrol.studentId.split('|')[1]?.substring(0, 8) || 'User'}</h4>
                                    <p className="text-sm text-gray-500">Joined on {new Date(enrol.createdAt).toLocaleDateString()}</p>
                                </div>
                                <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${enrol.status === 'confirmed' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'
                                    }`}>
                                    {enrol.status === 'confirmed' ? <Check className="h-3 w-3" /> : <Clock className="h-3 w-3" />}
                                    {enrol.status === 'confirmed' ? 'Active' : 'Awaiting Confirmation'}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

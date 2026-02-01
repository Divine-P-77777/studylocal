'use client';

import { AlertCircle, CheckCircle, Clock } from 'lucide-react';
import ComplaintActions from '@/components/admin/ComplaintActions';

interface Complaint {
    _id: string;
    type: string;
    status: 'open' | 'resolved' | 'in progress';
    description: string;
    contact: string;
    createdAt: string;
    updatedAt: string;
}

interface AdminComplaintsDashboardProps {
    complaints: Complaint[];
}

export default function AdminComplaintsDashboard({ complaints }: AdminComplaintsDashboardProps) {
    return (
        <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-6 font">Complaints & Issues</h1>

            <div className="bg-white shadow-sm rounded-lg border border-gray-200 overflow-hidden">
                <ul className="divide-y divide-gray-200">
                    {complaints.length === 0 ? (
                        <li className="p-6 text-center text-gray-500">No complaints reported.</li>
                    ) : (
                        complaints.map((c) => (
                            <li key={c._id} className="p-6 hover:bg-gray-50 transition">
                                <div className="flex flex-col md:flex-row gap-4 justify-between">
                                    <div className="flex-grow">
                                        <div className="flex items-center gap-2 mb-2">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium 
                        ${c.type === 'Tutor' ? 'bg-orange-100 text-orange-800' :
                                                    c.type === 'Payment' ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'}`}>
                                                {c.type}
                                            </span>
                                            <span className={`inline-flex items-center text-xs text-gray-500`}>
                                                {new Date(c.createdAt).toLocaleDateString()}
                                            </span>
                                        </div>

                                        <p className="text-gray-900 text-sm md:text-base mb-2">{c.description}</p>

                                        <div className="text-xs text-gray-500">
                                            <strong>Contact:</strong> {c.contact}
                                        </div>
                                    </div>

                                    <div className="flex-shrink-0 flex items-center gap-2">
                                        {c.status === 'open' && (
                                            <span className="flex items-center text-red-600 text-sm font-medium">
                                                <AlertCircle className="w-4 h-4 mr-1" /> Open
                                            </span>
                                        )}
                                        {c.status === 'resolved' && (
                                            <span className="flex items-center text-green-600 text-sm font-medium">
                                                <CheckCircle className="w-4 h-4 mr-1" /> Resolved
                                            </span>
                                        )}
                                        {c.status === 'in progress' && (
                                            <span className="flex items-center text-yellow-600 text-sm font-medium">
                                                <Clock className="w-4 h-4 mr-1" /> In Progress
                                            </span>
                                        )}
                                        <div className="ml-4 pl-4 border-l border-gray-100">
                                            <ComplaintActions complaintId={c._id} currentStatus={c.status} />
                                        </div>
                                    </div>
                                </div>
                            </li>
                        ))
                    )}
                </ul>
            </div>
        </div>
    );
}

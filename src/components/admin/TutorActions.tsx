'use client';

import { Check, X, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

interface TutorActionsProps {
    tutorId: string;
}

export default function TutorActions({ tutorId }: TutorActionsProps) {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState<string | null>(null);

    const handleStatusUpdate = async (status: 'approved' | 'rejected') => {
        setIsLoading(status);
        try {
            const res = await fetch(`/api/admin/tutors/${tutorId}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ status }),
            });

            if (!res.ok) {
                throw new Error('Failed to update status');
            }

            router.refresh();
        } catch (error) {
            alert('Something went wrong');
        } finally {
            setIsLoading(null);
        }
    };

    return (
        <div className="flex gap-3">
            <button
                onClick={() => handleStatusUpdate('approved')}
                disabled={!!isLoading}
                className="flex items-center gap-1 bg-green-100 text-green-700 px-4 py-2 rounded-lg hover:bg-green-200 transition disabled:opacity-50"
            >
                {isLoading === 'approved' ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                    <Check className="h-4 w-4" />
                )}
                Approve
            </button>

            <button
                onClick={() => handleStatusUpdate('rejected')}
                disabled={!!isLoading}
                className="flex items-center gap-1 bg-red-100 text-red-700 px-4 py-2 rounded-lg hover:bg-red-200 transition disabled:opacity-50"
            >
                {isLoading === 'rejected' ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                    <X className="h-4 w-4" />
                )}
                Reject
            </button>
        </div>
    );
}

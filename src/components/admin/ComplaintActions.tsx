'use client';

import { CheckCircle, Clock, Loader2, AlertCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

interface ComplaintActionsProps {
    complaintId: string;
    currentStatus: string;
}

export default function ComplaintActions({ complaintId, currentStatus }: ComplaintActionsProps) {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState<string | null>(null);

    const handleStatusUpdate = async (status: 'resolved' | 'in progress' | 'open') => {
        setIsLoading(status);
        try {
            const res = await fetch(`/api/admin/complaints/${complaintId}`, {
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
        <div className="flex gap-2">
            {/* Show buttons typically not available for current status, or just show all for flexibility */}
            {currentStatus !== 'resolved' && (
                <button
                    onClick={() => handleStatusUpdate('resolved')}
                    disabled={!!isLoading}
                    className="flex items-center gap-1 text-xs bg-green-50 text-green-700 px-3 py-1.5 rounded hover:bg-green-100 transition disabled:opacity-50 border border-green-200"
                >
                    {isLoading === 'resolved' ? <Loader2 className="h-3 w-3 animate-spin" /> : <CheckCircle className="h-3 w-3" />}
                    Resolve
                </button>
            )}

            {currentStatus !== 'in progress' && currentStatus !== 'resolved' && (
                <button
                    onClick={() => handleStatusUpdate('in progress')}
                    disabled={!!isLoading}
                    className="flex items-center gap-1 text-xs bg-yellow-50 text-yellow-700 px-3 py-1.5 rounded hover:bg-yellow-100 transition disabled:opacity-50 border border-yellow-200"
                >
                    {isLoading === 'in progress' ? <Loader2 className="h-3 w-3 animate-spin" /> : <Clock className="h-3 w-3" />}
                    Mark In Progress
                </button>
            )}
        </div>
    );
}

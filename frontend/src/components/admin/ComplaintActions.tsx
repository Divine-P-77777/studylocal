'use client';

import { CheckCircle, Clock, Loader2, RotateCcw } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'react-toastify';

type Status = 'pending' | 'open' | 'in progress' | 'resolved';

interface ComplaintActionsProps {
    complaintId: string;
    currentStatus: string;
}

export default function ComplaintActions({ complaintId, currentStatus }: ComplaintActionsProps) {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState<Status | null>(null);

    const handleStatusUpdate = async (status: Status) => {
        if (isLoading) return; // Prevent duplicate clicks
        
        setIsLoading(status);
        try {
            const res = await fetch(`/api/admin/complaints/${complaintId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status }),
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.message || 'Failed to update status');
            }
            
            toast.success(`Status updated to ${status}`);
            router.refresh();
        } catch (error: any) {
            toast.error(error.message || 'Something went wrong. Please try again.');
        } finally {
            setIsLoading(null);
        }
    };

    const isCurrent = (status: Status) => currentStatus?.toLowerCase() === status;

    return (
        <div className="flex flex-wrap gap-2">
            {!isCurrent('in progress') && !isCurrent('resolved') && (
                <button
                    onClick={() => handleStatusUpdate('in progress')}
                    disabled={!!isLoading}
                    className="flex items-center gap-1.5 text-xs bg-amber-50 text-amber-700 px-3 py-1.5 rounded-lg hover:bg-amber-100 transition disabled:opacity-50 border border-amber-200 font-semibold"
                >
                    {isLoading === 'in progress' ? <Loader2 className="h-3 w-3 animate-spin" /> : <Clock className="h-3 w-3" />}
                    Mark In Progress
                </button>
            )}

            {!isCurrent('resolved') && (
                <button
                    onClick={() => handleStatusUpdate('resolved')}
                    disabled={!!isLoading}
                    className="flex items-center gap-1.5 text-xs bg-green-50 text-green-700 px-3 py-1.5 rounded-lg hover:bg-green-100 transition disabled:opacity-50 border border-green-200 font-semibold"
                >
                    {isLoading === 'resolved' ? <Loader2 className="h-3 w-3 animate-spin" /> : <CheckCircle className="h-3 w-3" />}
                    Resolve
                </button>
            )}

            {isCurrent('resolved') && (
                <button
                    onClick={() => handleStatusUpdate('pending')}
                    disabled={!!isLoading}
                    className="flex items-center gap-1.5 text-xs bg-gray-50 text-gray-600 px-3 py-1.5 rounded-lg hover:bg-gray-100 transition disabled:opacity-50 border border-gray-200 font-semibold"
                >
                    {isLoading === 'pending' ? <Loader2 className="h-3 w-3 animate-spin" /> : <RotateCcw className="h-3 w-3" />}
                    Reopen
                </button>
            )}
        </div>
    );
}

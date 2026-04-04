'use client';

import { useLoading } from '@/context/LoadingContext';
import { Loader2 } from 'lucide-react';

export default function LoadingOverlay() {
    const { isLoading } = useLoading();

    if (!isLoading) return null;

    return (
        <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-white/60 backdrop-blur-md animate-in fade-in duration-300">
            <div className="relative">
                {/* Outer Glow */}
                <div className="absolute inset-0 bg-green-200 rounded-full blur-2xl opacity-50 animate-pulse"></div>
                
                {/* Spinner */}
                <div className="relative bg-white p-6 rounded-3xl shadow-2xl border border-green-50 flex flex-col items-center gap-4">
                    <Loader2 className="w-12 h-12 text-green-600 animate-spin" />
                    <div className="flex flex-col items-center">
                        <span className="text-gray-900 font-bold text-lg tracking-tight">Processing</span>
                        <span className="text-gray-400 text-xs font-medium animate-pulse">Please wait a moment</span>
                    </div>
                </div>
            </div>
            
            {/* Minimal Progress Bar (Purely Visual) */}
            <div className="mt-8 w-48 h-1 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-green-600 w-1/3 rounded-full animate-[loading_2s_ease-in-out_infinite]"></div>
            </div>

            <style jsx>{`
                @keyframes loading {
                    0% { transform: translateX(-100%); }
                    100% { transform: translateX(300%); }
                }
            `}</style>
        </div>
    );
}

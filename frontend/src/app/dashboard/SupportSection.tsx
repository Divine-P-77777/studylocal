'use client';

import { useState } from 'react';
import { MessageSquareHeart, Wrench, Megaphone, Send, CheckCircle2, Loader2, X } from 'lucide-react';
import { submitSupportRequest } from '@/lib/actions/complaint';
import { toast } from 'react-toastify';

type SupportType = 'feedback' | 'issue' | 'complaint' | null;

export default function SupportSection() {
    const [selectedType, setSelectedType] = useState<SupportType>(null);
    const [description, setDescription] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    const categories = [
        {
            id: 'feedback',
            label: 'Feedback',
            description: 'Love the app or have suggestions?',
            icon: <MessageSquareHeart className="w-6 h-6 outline-none" />,
            color: 'text-pink-600',
            bg: 'bg-pink-50',
            border: 'border-pink-100',
            activeBorder: 'border-pink-500'
        },
        {
            id: 'issue',
            label: 'Technical Issue',
            description: 'Something not working correctly?',
            icon: <Wrench className="w-6 h-6 outline-none" />,
            color: 'text-amber-600',
            bg: 'bg-amber-50',
            border: 'border-amber-100',
            activeBorder: 'border-amber-500'
        },
        {
            id: 'complaint',
            label: 'Complaint',
            description: 'Report an issue with a user or service.',
            icon: <Megaphone className="w-6 h-6 outline-none" />,
            color: 'text-indigo-600',
            bg: 'bg-indigo-50',
            border: 'border-indigo-100',
            activeBorder: 'border-indigo-500'
        }
    ];

    const handleSubmit = async () => {
        if (!selectedType || !description.trim()) return;

        if (description.trim().length < 10) {
            toast.error("Please provide at least 10 characters.");
            return;
        }

        setIsSubmitting(true);
        const res = await submitSupportRequest(selectedType, description);
        setIsSubmitting(false);

        if (res.success) {
            setIsSuccess(true);
            toast.success("Thank you! Your request has been received.");
            setTimeout(() => {
                setIsSuccess(false);
                setSelectedType(null);
                setDescription('');
            }, 3000);
        } else {
            toast.error(res.message);
        }
    };

    return (
        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8 mt-10 transition-all duration-500">
            <div className="mb-8">
                <h2 className="text-xl font-bold text-gray-900">Support & Feedback</h2>
                <p className="text-sm text-gray-500 mt-1">Found a bug or want to suggest an improvement? We're all ears.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {categories.map((cat) => (
                    <button
                        key={cat.id}
                        onClick={() => setSelectedType(cat.id as SupportType)}
                        className={`text-left p-5 rounded-2xl border-2 transition-all duration-300 group ${
                            selectedType === cat.id 
                            ? `${cat.activeBorder} ${cat.bg} shadow-md` 
                            : `${cat.border} hover:border-gray-300 hover:bg-gray-50 bg-white`
                        }`}
                    >
                        <div className={`p-3 rounded-xl inline-block mb-4 transition-transform group-hover:scale-110 ${cat.bg} ${cat.color}`}>
                            {cat.icon}
                        </div>
                        <h4 className="font-bold text-gray-900 leading-tight">{cat.label}</h4>
                        <p className="text-xs text-gray-500 mt-2 leading-relaxed">{cat.description}</p>
                    </button>
                ))}
            </div>

            {selectedType && !isSuccess && (
                <div className="mt-8 animate-in fade-in slide-in-from-top-4 duration-500">
                    <div className="flex justify-between items-center mb-4">
                        <label className="text-sm font-bold text-gray-700 uppercase tracking-wider">
                            Describe the {selectedType}
                        </label>
                        <button 
                            onClick={() => setSelectedType(null)}
                            className="text-gray-400 hover:text-gray-600 p-1"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                    
                    <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value.slice(0, 2000))}
                        placeholder={`Tell us more about the ${selectedType}...`}
                        rows={4}
                        className="w-full px-5 py-4 rounded-2xl border-2 border-gray-100 focus:border-indigo-600 focus:ring-0 transition outline-none text-gray-700 placeholder:text-gray-400"
                    />
                    <div className="flex justify-between items-center mt-1">
                        <span className={`text-xs font-medium ${description.trim().length < 10 ? 'text-red-400' : 'text-green-500'}`}>
                            {description.trim().length < 10
                                ? `${10 - description.trim().length} more character${10 - description.trim().length === 1 ? '' : 's'} required`
                                : '✓ Length OK'}
                        </span>
                        <span className="text-xs text-gray-400">{description.length}/2000</span>
                    </div>

                    <button
                        onClick={handleSubmit}
                        disabled={!description.trim() || isSubmitting}
                        className="mt-4 w-full md:w-auto px-8 py-3.5 bg-gray-900 text-white rounded-xl font-bold hover:bg-black transition flex items-center justify-center gap-2 shadow-lg disabled:opacity-50"
                    >
                        {isSubmitting ? (
                            <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                            <Send className="w-4 h-4" />
                        )}
                        Submit {selectedType.charAt(0).toUpperCase() + selectedType.slice(1)}
                    </button>
                </div>
            )}

            {isSuccess && (
                <div className="mt-8 p-10 bg-green-50 rounded-2xl border border-green-100 flex flex-col items-center justify-center text-center animate-in zoom-in-95 duration-500">
                    <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-4">
                        <CheckCircle2 className="w-10 h-10" />
                    </div>
                    <h3 className="text-xl font-bold text-green-900">Message Received!</h3>
                    <p className="text-green-700 mt-2">Our team will review your {selectedType} shortly. Thanks for helping us grow!</p>
                </div>
            )}
        </div>
    );
}

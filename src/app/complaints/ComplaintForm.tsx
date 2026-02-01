'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ComplaintSchema, ComplaintInput } from '@/lib/validations/complaint';
import { submitComplaint } from '@/lib/actions/complaint';
import { useState } from 'react';
import { AlertCircle, Loader2 } from 'lucide-react';

export default function ComplaintForm() {
    const [successMsg, setSuccessMsg] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm<ComplaintInput>({
        resolver: zodResolver(ComplaintSchema) as any,
    });

    const onSubmit = async (data: ComplaintInput) => {
        setIsSubmitting(true);
        const formData = new FormData();
        formData.append('type', data.type);
        formData.append('description', data.description);
        formData.append('contact', data.contact);

        const result = await submitComplaint(null, formData);

        if (result.success) {
            setSuccessMsg(result.message || 'Submitted');
            reset();
        } else {
            alert(result.message);
        }
        setIsSubmitting(false);
    };

    if (successMsg) {
        return (
            <div className="bg-green-50 border border-green-200 text-green-700 p-6 rounded-lg text-center">
                <h3 className="text-lg font-bold mb-2">Issue Reported</h3>
                <p>{successMsg}</p>
                <button onClick={() => setSuccessMsg('')} className="mt-4 text-sm underline text-green-800">
                    Report another issue
                </button>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div>
                <label className="block text-sm font-medium text-gray-700">Issue Type</label>
                <select {...register('type')} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500 sm:text-sm p-2 border">
                    <option value="Tutor">Tutor Related</option>
                    <option value="Platform">Platform Bug</option>
                    <option value="Payment">Payment Dispute</option>
                    <option value="Other">Other</option>
                </select>
                {errors.type && <p className="text-red-500 text-xs mt-1">{errors.type.message}</p>}
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700">Contact Details (Phone/Email)</label>
                <input {...register('contact')} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500 sm:text-sm p-2 border" placeholder="How can we reach you?" />
                {errors.contact && <p className="text-red-500 text-xs mt-1">{errors.contact.message}</p>}
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700">Description</label>
                <textarea {...register('description')} rows={4} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500 sm:text-sm p-2 border" placeholder="Describe the issue..." />
                {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description.message}</p>}
            </div>

            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
                <div className="flex">
                    <div className="flex-shrink-0">
                        <AlertCircle className="h-5 w-5 text-yellow-400" aria-hidden="true" />
                    </div>
                    <div className="ml-3">
                        <p className="text-sm text-yellow-700">
                            For immediate emergencies, please contact local authorities. Investigating issues may take up to 48 hours.
                        </p>
                    </div>
                </div>
            </div>

            <button
                type="submit"
                disabled={isSubmitting}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
            >
                {isSubmitting ? (
                    <>
                        <Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4" />
                        Submitting...
                    </>
                ) : (
                    'Submit Complaint'
                )}
            </button>
        </form>
    );
}

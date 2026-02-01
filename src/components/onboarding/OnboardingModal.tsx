'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@auth0/nextjs-auth0/client';
import { toast } from 'react-toastify';
import { User, GraduationCap, School, Camera, Upload, Loader2 } from 'lucide-react';
import { updateUser, getUser } from '@/lib/actions/user';
import Image from 'next/image';

export default function OnboardingModal() {
    const { user, isLoading } = useUser();
    const [isOpen, setIsOpen] = useState(false);
    const [step, setStep] = useState<1 | 2 | 3>(1); // Added Step 3
    const [role, setRole] = useState<'student' | 'tutor' | null>(null);
    const [fullName, setFullName] = useState('');
    const [photoUrl, setPhotoUrl] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isUploading, setIsUploading] = useState(false);

    useEffect(() => {
        const checkUser = async () => {
            if (user?.sub) {
                const dbUser = await getUser(user.sub);

                // If user doesn't exist or profile not complete, open modal
                if (!dbUser || !dbUser.isProfileComplete) {
                    setIsOpen(true);
                    if (user.name) setFullName(user.name);
                    if (user.picture) setPhotoUrl(user.picture);
                }
            }
        };

        if (!isLoading && user) {
            checkUser();
        }
    }, [user, isLoading]);

    const uploadToCloudinary = async (file: File) => {
        const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
        const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

        if (!cloudName || !uploadPreset) {
            toast.error('Cloudinary config missing');
            return null;
        }

        setIsUploading(true);
        try {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('upload_preset', uploadPreset);

            const res = await fetch(
                `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
                { method: 'POST', body: formData }
            );

            const data = await res.json();
            if (!res.ok) throw new Error(data.error?.message || 'Upload failed');

            return data.secure_url;
        } catch (error) {
            console.error(error);
            toast.error("Failed to upload image");
            return null;
        } finally {
            setIsUploading(false);
        }
    };

    const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const url = await uploadToCloudinary(file);
        if (url) {
            setPhotoUrl(url);
        }
    };

    const handleSubmit = async () => {
        if (!role || !fullName.trim()) return;

        setIsSubmitting(true);
        try {
            await updateUser(user!.sub!, {
                email: user!.email!,
                fullName: fullName,
                photoUrl: photoUrl || user!.picture || undefined,
                role: role,
                isProfileComplete: true
            });

            toast.success("Welcome to StudyLocal!");
            setIsOpen(false);

            // If tutor, redirect could happen here or just let them navigate
            if (role === 'tutor') {
                window.location.href = '/tutor-registration';
            } else {
                // Refresh to update server components if needed
                window.location.reload();
            }

        } catch (error) {
            console.error(error);
            toast.error("Failed to save profile");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden animate-in fade-in zoom-in duration-300">
                <div className="p-8">

                    {/* Header */}
                    <div className="text-center mb-8">
                        <h2 className="text-2xl font-bold text-gray-900">
                            {step === 1 ? "Choose your role" : step === 2 ? "Your Name" : "Profile Photo"}
                        </h2>
                        <p className="text-gray-500 mt-2 text-sm">
                            {step === 1
                                ? "How will you be using StudyLocal?"
                                : step === 2
                                    ? "How should we address you?"
                                    : "Add a face to your name (Optional)"}
                        </p>
                    </div>

                    {/* Step 1: Role Selection */}
                    {step === 1 && (
                        <div className="space-y-4">
                            <button
                                onClick={() => setRole('student')}
                                className={`w-full flex items-center p-4 border-2 rounded-xl transition-all ${role === 'student'
                                    ? 'border-green-600 bg-green-50'
                                    : 'border-gray-200 hover:border-green-200'
                                    }`}
                            >
                                <div className={`p-3 rounded-full ${role === 'student' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                                    <School className="w-6 h-6" />
                                </div>
                                <div className="ml-4 text-left">
                                    <h3 className="font-semibold text-gray-900">I am a Student/Parent</h3>
                                    <p className="text-xs text-gray-500">Looking for tutors nearby</p>
                                </div>
                            </button>

                            <button
                                onClick={() => setRole('tutor')}
                                className={`w-full flex items-center p-4 border-2 rounded-xl transition-all ${role === 'tutor'
                                    ? 'border-green-600 bg-green-50'
                                    : 'border-gray-200 hover:border-green-200'
                                    }`}
                            >
                                <div className={`p-3 rounded-full ${role === 'tutor' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                                    <GraduationCap className="w-6 h-6" />
                                </div>
                                <div className="ml-4 text-left">
                                    <h3 className="font-semibold text-gray-900">I am a Tutor</h3>
                                    <p className="text-xs text-gray-500">Want to offer tuition services</p>
                                </div>
                            </button>

                            <button
                                disabled={!role}
                                onClick={() => setStep(2)}
                                className="w-full mt-6 bg-green-600 text-white py-3 rounded-xl font-medium hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
                            >
                                Continue
                            </button>
                        </div>
                    )}

                    {/* Step 2: Name */}
                    {step === 2 && (
                        <div className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Full Name
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <User className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <input
                                        type="text"
                                        value={fullName}
                                        onChange={(e) => setFullName(e.target.value)}
                                        className="pl-10 w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                                        placeholder="John Doe"
                                    />
                                </div>
                            </div>

                            <div className="flex gap-3">
                                <button
                                    onClick={() => setStep(1)}
                                    className="flex-1 py-3 border border-gray-300 rounded-xl font-medium text-gray-700 hover:bg-gray-50"
                                >
                                    Back
                                </button>
                                <button
                                    onClick={() => setStep(3)}
                                    disabled={!fullName.trim()}
                                    className="flex-1 bg-green-600 text-white py-3 rounded-xl font-medium hover:bg-green-700 disabled:opacity-50"
                                >
                                    Next
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Step 3: Photo */}
                    {step === 3 && (
                        <div className="space-y-6">
                            <div className="flex flex-col items-center">
                                <div className="relative h-32 w-32 rounded-full overflow-hidden border-4 border-gray-100 shadow-md mb-4 bg-gray-100">
                                    {photoUrl ? (
                                        <Image src={photoUrl} alt="Profile" fill className="object-cover" />
                                    ) : (
                                        <div className="flex h-full w-full items-center justify-center text-gray-400">
                                            <User className="h-16 w-16" />
                                        </div>
                                    )}

                                    {isUploading && (
                                        <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                                            <Loader2 className="h-8 w-8 text-white animate-spin" />
                                        </div>
                                    )}
                                </div>

                                <label className="cursor-pointer inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
                                    <Camera className="w-4 h-4 mr-2" />
                                    Change Photo
                                    <input type="file" className="hidden" accept="image/*" onChange={handleImageChange} />
                                </label>
                            </div>

                            <div className="bg-blue-50 p-4 rounded-lg flex gap-3 text-sm text-blue-700 text-left">
                                <div className="shrink-0 font-bold">ℹ️</div>
                                <p>
                                    Your profile photo helps build trust with {role === 'student' ? 'tutors' : 'students'}.
                                </p>
                            </div>

                            <div className="flex gap-3">
                                <button
                                    onClick={() => setStep(2)}
                                    className="flex-1 py-3 border border-gray-300 rounded-xl font-medium text-gray-700 hover:bg-gray-50"
                                >
                                    Back
                                </button>
                                <button
                                    onClick={handleSubmit}
                                    disabled={isSubmitting || isUploading}
                                    className="flex-1 bg-green-600 text-white py-3 rounded-xl font-medium hover:bg-green-700 disabled:opacity-50"
                                >
                                    {isSubmitting ? 'Finishing...' : 'Complete Profile'}
                                </button>
                            </div>
                        </div>
                    )}

                </div>
            </div>
        </div>
    );
}

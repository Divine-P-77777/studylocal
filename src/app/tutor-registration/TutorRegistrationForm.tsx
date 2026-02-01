'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { TutorRegistrationSchema, TutorRegistrationInput } from '@/lib/validations/tutor';
import { registerTutor } from '@/lib/actions/tutor';
import { useState } from 'react';
import { Upload, Loader2 } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import SubjectInput from './SubjectInput';

export default function TutorRegistrationForm({ user }: { user: any }) {
    const [serverError, setServerError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [preview, setPreview] = useState<string | null>(null);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const router = useRouter();

    const {
        register,
        handleSubmit,
        formState: { errors },
        setValue,
    } = useForm<TutorRegistrationInput>({
        resolver: zodResolver(TutorRegistrationSchema) as any,
        defaultValues: {
            fullName: user?.name || '',
            email: user?.email || '',
        } as any,
    });

    const uploadToCloudinary = async (file: File) => {
        const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
        const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

        if (!cloudName || !uploadPreset) {
            throw new Error('Cloudinary config missing');
        }

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
    };

    const onSubmit = async (data: TutorRegistrationInput) => {
        setIsSubmitting(true);
        setServerError(null);

        try {
            if (!selectedFile) {
                setServerError('Please upload a profile photo.');
                setIsSubmitting(false);
                return;
            }

            const photoUrl = await uploadToCloudinary(selectedFile);

            const formData = new FormData();
            Object.entries(data).forEach(([key, value]) => {
                formData.append(key, key === 'photo' ? photoUrl : String(value));
            });

            const result = await registerTutor(null, formData);

            if (result.success) {
                router.push('/dashboard?registered=true');
            } else {
                setServerError(result.message || 'Something went wrong');
            }
        } catch (err: any) {
            setServerError(err.message || 'Registration failed');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setSelectedFile(file);
        setValue('photo', 'valid');

        const reader = new FileReader();
        reader.onloadend = () => setPreview(reader.result as string);
        reader.readAsDataURL(file);
    };

    const inputBase =
        'mt-1 w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-base focus:border-brand-500 focus:ring-2 focus:ring-brand-200';

    return (
        <div className="max-w-xl mx-auto px-4 pb-32">
            <form
                onSubmit={handleSubmit(onSubmit)}
                className="space-y-10 bg-white rounded-2xl sm:rounded-3xl sm:border sm:shadow-sm p-5 sm:p-8"
            >
                {/* Header */}
                <div>
                    <h1 className="text-xl font-semibold text-gray-900">
                        Tutor Registration
                    </h1>
                    <p className="text-sm text-gray-500 mt-1">
                        Fill in your details to start getting students
                    </p>
                </div>

                {/* Profile Photo */}
                <div>
                    <p className="text-sm font-medium text-gray-700 mb-3">
                        Profile Photo
                    </p>
                    <div className="flex items-center gap-4">
                        <div className="relative h-24 w-24 rounded-full bg-gray-100 overflow-hidden border">
                            {preview ? (
                                <Image src={preview} alt="Preview" fill className="object-cover" />
                            ) : (
                                <div className="flex h-full w-full items-center justify-center text-gray-400">
                                    <Upload className="h-7 w-7" />
                                </div>
                            )}
                        </div>

                        <label className="flex-1">
                            <span className="inline-block rounded-full bg-brand-50 px-4 py-2 text-sm font-semibold text-brand-700">
                                Choose Photo
                            </span>
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleImageChange}
                                className="hidden"
                            />
                        </label>
                    </div>
                    {errors.photo && (
                        <p className="mt-2 text-sm text-red-600">{errors.photo.message}</p>
                    )}
                </div>

                {/* Basic Details */}
                <section className="space-y-6">
                    <h2 className="text-lg font-semibold text-gray-900">
                        Basic Details
                    </h2>

                    <div>
                        <label className="text-sm font-medium">Full Name</label>
                        <input {...register('fullName')} className={inputBase} />
                        {errors.fullName && (
                            <p className="text-sm text-red-600 mt-1">
                                {errors.fullName.message}
                            </p>
                        )}
                    </div>

                    <div>
                        <label className="text-sm font-medium">Phone</label>
                        <input
                            {...register('phone')}
                            inputMode="numeric"
                            className={inputBase}
                        />
                        {errors.phone && (
                            <p className="text-sm text-red-600 mt-1">
                                {errors.phone.message}
                            </p>
                        )}
                    </div>

                    <div>
                        <label className="text-sm font-medium">Email</label>
                        <input
                            {...register('email')}
                            inputMode="email"
                            className={inputBase}
                        />
                    </div>

                    <div>
                        <label className="text-sm font-medium">Area</label>
                        <input {...register('area')} className={inputBase} />
                    </div>
                </section>

                {/* Teaching Info */}
                <section className="space-y-6">
                    <h2 className="text-lg font-semibold text-gray-900">
                        Teaching Details
                    </h2>

                    <div>
                        <label className="text-sm font-medium">Subjects</label>
                        <SubjectInput
                            initialValue={""}
                            onChange={(val) => {
                                setValue('subjects', val);
                            }}
                        />
                        <input type="hidden" {...register('subjects')} />
                        {errors.subjects && (
                            <p className="text-sm text-red-600 mt-1">
                                {errors.subjects.message}
                            </p>
                        )}
                    </div>

                    <div>
                        <label className="text-sm font-medium">Class Range</label>
                        <select {...register('classRange')} className={inputBase}>
                            <option value="">Select range</option>
                            <option value="Class 1-5">Class 1–5</option>
                            <option value="Class 6-8">Class 6–8</option>
                            <option value="Class 9-10">Class 9–10</option>
                            <option value="Class 11-12">Class 11–12</option>
                            <option value="Degree/Other">Degree / Other</option>
                        </select>
                    </div>

                    <div>
                        <label className="text-sm font-medium">Tuition Mode</label>
                        <select {...register('tuitionMode')} className={inputBase}>
                            <option value="Home">Student's Home</option>
                            <option value="Tutor Home">Tutor's Home</option>
                            <option value="Online">Online</option>
                        </select>
                    </div>

                    <div>
                        <label className="text-sm font-medium">Monthly Fee</label>
                        <input
                            type="number"
                            {...register('monthlyFee')}
                            inputMode="numeric"
                            className={inputBase}
                        />
                    </div>
                </section>

                {/* Bio */}
                <section className="space-y-4">
                    <h2 className="text-lg font-semibold text-gray-900">
                        About You
                    </h2>

                    <textarea
                        {...register('bio')}
                        rows={4}
                        className={inputBase}
                        placeholder="Your experience, teaching style..."
                    />

                    <input
                        {...register('experience')}
                        className={inputBase}
                        placeholder="e.g. 5 years experience"
                    />
                </section>

                {serverError && (
                    <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
                        {serverError}
                    </div>
                )}
                <div className="fixed bottom-0 left-0 right-0 bg-white border-t px-4 py-3 sm:static sm:border-0 sm:p-0">
                    <button
                        type="submit"
                        onClick={handleSubmit(onSubmit)}
                        disabled={isSubmitting}
                        className="
      w-full
      rounded-xl
      py-4
      text-lg
      font-semibold
      bg-green-300
      hover:bg-green-500
      active:scale-[0.98]
      transition
      disabled:opacity-50
    "
                    >
                        {isSubmitting ? (
                            <span className="flex items-center justify-center gap-2">
                                <Loader2 className="h-5 w-5 animate-spin" />
                                Submitting…
                            </span>
                        ) : (
                            'Submit Application'
                        )}
                    </button>

                </div>

            </form>
        </div>
    );
}


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

export default function TutorRegistrationForm({ user, dbUser }: { user: any, dbUser?: any }) {
    const [serverError, setServerError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [preview, setPreview] = useState<string | null>(dbUser?.photoUrl || user?.picture || null);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const router = useRouter();

    const {
        register,
        handleSubmit,
        formState: { errors },
        setValue,
        watch,
    } = useForm<TutorRegistrationInput>({
        resolver: zodResolver(TutorRegistrationSchema) as any,
        defaultValues: {
            fullName: dbUser?.fullName || user?.name || '',
            email: dbUser?.email || user?.email || '',
            photo: (dbUser?.photoUrl || user?.picture) ? 'valid' : '',
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
            if (!selectedFile && !dbUser?.photoUrl && !user?.picture) {
                setServerError('Please upload a profile photo.');
                setIsSubmitting(false);
                return;
            }

            const photoUrl = selectedFile ? await uploadToCloudinary(selectedFile) : (dbUser?.photoUrl || user.picture);

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
        'mt-1 w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-base outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-colors duration-200';

    return (
        <div className="max-w-xl mx-auto px-4 pb-32">
            <form
                onSubmit={handleSubmit(onSubmit)}
                className="space-y-10 bg-white rounded-2xl sm:rounded-3xl sm:border sm:shadow-sm p-5 sm:p-8"
            >
                {/* Header */}
                <div className="text-center sm:text-left mb-8 pb-6 border-b border-gray-100">
                    <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600 tracking-tight">
                        Tutor Registration
                    </h1>
                    <p className="text-sm text-gray-500 mt-2">
                        Complete your profile to start receiving student inquiries.
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

                        <label className="flex-1 cursor-pointer group">
                            <div className="inline-flex items-center justify-center rounded-xl bg-indigo-50 border border-indigo-100 px-5 py-3 text-sm font-semibold text-indigo-600 transition-all duration-300 hover:bg-indigo-600 hover:text-white shadow-sm hover:shadow-md">
                                <Upload className="mr-2 h-4 w-4" />
                                Choose Photo
                            </div>
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
                        {watch('classRange') === 'Degree/Other' && (
                            <div className="mt-3 animate-in fade-in slide-in-from-top-2 duration-300">
                                <label className="text-xs font-semibold text-indigo-600 mb-1 uppercase tracking-wider">Specify Range</label>
                                <input 
                                    {...register('customRange')} 
                                    placeholder="e.g. B.Tech, UPSC, Music" 
                                    className={`${inputBase} border-indigo-200 bg-indigo-50/30`} 
                                />
                                {errors.customRange && (
                                    <p className="text-xs text-red-500 mt-1">{errors.customRange.message}</p>
                                )}
                            </div>
                        )}
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
                    <div className="rounded-xl bg-red-50/50 backdrop-blur-sm border border-red-200 px-5 py-4 text-sm text-red-700 font-medium flex items-center shadow-sm animate-in fade-in zoom-in duration-300">
                        <span className="mr-2">⚠️</span> {serverError}
                    </div>
                )}
                <div className="mt-8 pt-6 border-t border-gray-100">
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
      text-white
      bg-gradient-to-r from-indigo-600 to-indigo-700
      hover:from-indigo-500 hover:to-indigo-600
      shadow-lg hover:shadow-indigo-500/25
      active:scale-[0.98]
      transition-all duration-200
      disabled:opacity-70 disabled:cursor-not-allowed
    "
                    >
                        {isSubmitting ? (
                            <span className="flex items-center justify-center gap-2">
                                <Loader2 className="h-5 w-5 animate-spin" />
                                Submitting Application…
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


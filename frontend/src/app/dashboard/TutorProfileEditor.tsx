'use client';

import { useState, useEffect, useRef } from 'react';
import { Shield, Clock, CheckCircle, XCircle, AlertTriangle, Edit3, Send, Check, Info } from 'lucide-react';
import { Loader2 } from 'lucide-react';
import { toast } from 'react-toastify';
import { sendTutorOTP, verifyTutorOTP, updateTutor } from '@/lib/actions/tutor';
import { useRouter } from 'next/navigation';

interface TutorProfileEditorProps {
    tutor: any;
    onUpdate?: () => void;
}

export default function TutorProfileEditor({ tutor, onUpdate }: TutorProfileEditorProps) {
    const [showOTPModal, setShowOTPModal] = useState(false);
    const [otp, setOtp] = useState('');
    const [isVerifying, setIsVerifying] = useState(false);
    const [isUnlocked, setIsUnlocked] = useState(false);
    const [timeLeft, setTimeLeft] = useState(0);
    const [isSaving, setIsSaving] = useState(false);
    const [remainingAttempts, setRemainingAttempts] = useState<number | null>(null);
    const timerRef = useRef<NodeJS.Timeout | null>(null);
    const router = useRouter();

    const [formData, setFormData] = useState({
        bio: tutor.bio || '',
        monthlyFee: tutor.monthlyFee || 0,
        area: tutor.area || '',
        experience: tutor.experience || '',
        tuitionMode: tutor.tuitionMode || 'Online',
        classRange: tutor.classRange || '',
        subjects: Array.isArray(tutor.subjects) ? tutor.subjects.join(', ') : (tutor.subjects || '')
    });

    // Dynamic Sync: keep formData in sync when tutor prop changes via router.refresh()
    useEffect(() => {
        setFormData({
            bio: tutor.bio || '',
            monthlyFee: tutor.monthlyFee || 0,
            area: tutor.area || '',
            experience: tutor.experience || '',
            tuitionMode: tutor.tuitionMode || 'Online',
            classRange: tutor.classRange || '',
            subjects: Array.isArray(tutor.subjects) ? tutor.subjects.join(', ') : (tutor.subjects || '')
        });
    }, [tutor]);

    // Countdown timer for the unlock session
    useEffect(() => {
        if (timeLeft > 0) {
            timerRef.current = setInterval(() => {
                setTimeLeft((prev) => prev - 1);
            }, 1000);
        } else if (timeLeft === 0 && isUnlocked) {
            setIsUnlocked(false);
            toast.info('Session expired. Profile locked for security.');
        }
        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, [timeLeft, isUnlocked]);

    const formatTime = (seconds: number) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m}:${s < 10 ? '0' : ''}${s}`;
    };

    const handleStartEdit = async () => {
        if (tutor.marketingStatus === 'rejected') {
            toast.error('Rejected profiles cannot be edited. Contact support.');
            return;
        }
        const res = await sendTutorOTP();
        if (res.success) {
            setRemainingAttempts(res.remainingAttempts ?? null);
            toast.success('OTP sent to your registered email.');
            setShowOTPModal(true);
        } else {
            toast.error(res.message);
        }
    };

    const handleVerify = async () => {
        setIsVerifying(true);
        const res = await verifyTutorOTP(otp);
        setIsVerifying(false);
        if (res.success) {
            setIsUnlocked(true);
            setShowOTPModal(false);
            setOtp('');
            setTimeLeft(20 * 60);
            toast.success('Profile unlocked for 20 minutes!');
        } else {
            toast.error(res.message);
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        const subjectsStr = String(formData.subjects || '');
        const payload = {
            ...formData,
            subjects: subjectsStr.split(',').map(s => s.trim()).filter(Boolean)
        };
        const res = await updateTutor(tutor._id, payload);
        setIsSaving(false);
        if (res.success) {
            toast.success('Profile updated successfully!');
            setIsUnlocked(false);
            setTimeLeft(0);
            if (onUpdate) onUpdate();
            router.refresh();
        } else {
            toast.error(res.message);
        }
    };

    const getStatusStyles = () => {
        switch (tutor.marketingStatus) {
            case 'approved': return { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200', icon: <CheckCircle className="w-4 h-4" /> };
            case 'rejected': return { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200', icon: <XCircle className="w-4 h-4" /> };
            default: return { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200', icon: <Clock className="w-4 h-4" /> };
        }
    };

    const styles = getStatusStyles();

    return (
        <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100 mt-10 transition-all duration-300">
            {/* Header / Status Section */}
            <div className="p-8 border-b border-gray-50 bg-gray-50/30">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                            <Shield className="w-5 h-5 text-indigo-600" />
                            Tutor Profile Settings
                        </h2>
                        <div className={`mt-2 inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-semibold border ${styles.bg} ${styles.text} ${styles.border}`}>
                            {styles.icon}
                            {tutor.marketingStatus?.toUpperCase() || 'PENDING'}
                        </div>
                    </div>

                    {!isUnlocked ? (
                        <button
                            onClick={handleStartEdit}
                            disabled={tutor.marketingStatus === 'rejected'}
                            className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition shadow-lg shadow-indigo-200 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <Edit3 className="w-4 h-4" />
                            Unlock to Edit
                        </button>
                    ) : (
                        <div className="flex items-center gap-3 px-4 py-2 bg-amber-50 rounded-xl border border-amber-200">
                            <Clock className="w-5 h-5 text-amber-600 animate-pulse" />
                            <span className="text-sm font-bold text-amber-700">
                                Unlocked: {formatTime(timeLeft)} left
                            </span>
                        </div>
                    )}
                </div>
            </div>

            {/* Content Section */}
            <div className="p-8">
                {!isUnlocked ? (
                    <div className="space-y-6">
                        <div className="flex items-start gap-4 p-5 bg-indigo-50/50 rounded-2xl border border-indigo-100">
                            <div className="p-2 bg-indigo-100 rounded-lg text-indigo-600">
                                <Shield className="w-5 h-5" />
                            </div>
                            <div>
                                <h4 className="font-bold text-indigo-900 leading-tight">Secure Profile Editing</h4>
                                <p className="text-sm text-indigo-600 mt-1">To ensure your profile remains safe, you must verify your identity via a one-time passcode sent to your registered email before making changes.</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 opacity-60">
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Bio Preview</label>
                                <p className="text-sm text-gray-800 line-clamp-2 italic">"{tutor.bio || 'No bio set'}"</p>
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Rate Preview</label>
                                <p className="text-sm text-gray-800 font-bold text-xl">₹{tutor.monthlyFee || 0}</p>
                            </div>
                        </div>
                    </div>
                ) : (
                    <form onSubmit={handleSave} className="space-y-6 animate-in fade-in slide-in-from-bottom-5 duration-500">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-gray-700">Area / Location</label>
                                <input
                                    type="text"
                                    value={formData.area}
                                    onChange={(e) => setFormData({ ...formData, area: e.target.value })}
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-100 focus:border-indigo-600 transition"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-gray-700">Monthly Fee (₹)</label>
                                <input
                                    type="number"
                                    value={formData.monthlyFee}
                                    onChange={(e) => setFormData({ ...formData, monthlyFee: parseInt(e.target.value) })}
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-100 focus:border-indigo-600 transition"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-gray-700">Tuition Mode</label>
                                <select
                                    value={formData.tuitionMode}
                                    onChange={(e) => setFormData({ ...formData, tuitionMode: e.target.value })}
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-100 focus:border-indigo-600 transition"
                                >
                                    <option value="Online">Online</option>
                                    <option value="Home">Student's Home</option>
                                    <option value="Tutor Home">Tutor's Home</option>
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-gray-700">Experience</label>
                                <input
                                    type="text"
                                    value={formData.experience}
                                    onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-100 focus:border-indigo-600 transition"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-bold text-gray-700">Subjects (comma separated)</label>
                            <input
                                type="text"
                                value={formData.subjects}
                                onChange={(e) => setFormData({ ...formData, subjects: e.target.value })}
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-100 focus:border-indigo-600 transition"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-bold text-gray-700">Biography / Style</label>
                            <textarea
                                value={formData.bio}
                                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                                rows={4}
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-100 focus:border-indigo-600 transition"
                            />
                        </div>

                        <div className="bg-gray-50 p-4 rounded-xl flex items-start gap-3 border border-gray-100">
                            <Info className="w-5 h-5 text-gray-400 mt-0.5" />
                            <p className="text-xs text-gray-500">
                                Fields like <span className="font-bold">Full Name</span>, <span className="font-bold">Email</span>, and <span className="font-bold">Phone</span> are protected. To update these, please submit a <a href="/complaints" className="text-indigo-600 underline font-semibold">Change Request Form</a>.
                            </p>
                        </div>

                        <div className="flex gap-4 pt-4">
                            <button
                                type="submit"
                                disabled={isSaving}
                                className="flex-1 bg-indigo-600 text-white py-3 rounded-xl font-bold hover:bg-indigo-700 transition flex items-center justify-center gap-2 shadow-xl shadow-indigo-100"
                            >
                                {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Check className="w-5 h-5" />}
                                Save Changes
                            </button>
                            <button
                                type="button"
                                onClick={() => { setIsUnlocked(false); setTimeLeft(0); }}
                                className="px-6 py-3 border border-gray-200 text-gray-600 rounded-xl font-bold hover:bg-gray-50 transition"
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                )}
            </div>

            {/* OTP Modal */}
            {showOTPModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-8 animate-in zoom-in-95 duration-300">
                        <div className="text-center space-y-3 mb-8">
                            <div className="mx-auto w-16 h-16 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center">
                                <Send className="w-8 h-8" />
                            </div>
                            <h3 className="text-2xl font-bold text-gray-900">Verify Identity</h3>
                            <p className="text-gray-500">We've sent a 6-digit code to your registered email.</p>

                            {remainingAttempts === 0 && (
                                <div className="flex items-center gap-2 px-4 py-2 bg-amber-50 text-amber-700 border border-amber-200 rounded-xl text-sm font-bold justify-center">
                                    <AlertTriangle className="w-4 h-4" />
                                    Final attempt for today — use it wisely!
                                </div>
                            )}
                        </div>

                        <div className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-gray-700 uppercase tracking-widest text-center block">Enter Code</label>
                                <input
                                    type="text"
                                    maxLength={6}
                                    value={otp}
                                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                                    className="w-full text-center text-4xl font-black tracking-[1rem] py-4 rounded-2xl border-2 border-indigo-100 focus:border-indigo-600 transition outline-none"
                                    placeholder="——————"
                                    autoFocus
                                />
                            </div>

                            <div className="flex flex-col gap-3">
                                <button
                                    onClick={handleVerify}
                                    disabled={otp.length !== 6 || isVerifying}
                                    className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-700 transition flex items-center justify-center gap-2 disabled:opacity-50"
                                >
                                    {isVerifying ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Verify and Unlock'}
                                </button>
                                <button
                                    onClick={() => setShowOTPModal(false)}
                                    className="w-full py-3 text-gray-500 font-semibold hover:text-gray-700 transition"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

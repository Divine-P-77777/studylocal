import Link from 'next/link';
import { ArrowLeft, ShieldCheck, FileText, Zap, Info } from 'lucide-react';

export default function TermsPage() {
    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto">
                <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-green-600 to-emerald-600 px-8 py-10 text-white relative">
                        <Link href="/" className="absolute top-6 left-6 p-2 bg-white/20 hover:bg-white/30 rounded-full transition backdrop-blur-sm">
                            <ArrowLeft className="h-5 w-5" />
                        </Link>
                        <div className="flex flex-col items-center text-center mt-4">
                            <div className="bg-white/20 p-3 rounded-2xl mb-4 backdrop-blur-md">
                                <FileText className="h-8 w-8 text-white" />
                            </div>
                            <h1 className="text-3xl font-bold">Terms & Conditions</h1>
                            <p className="mt-2 text-green-50 text-sm max-w-sm">
                                Effective Date: February 1, 2026. Please read these terms carefully before using StudyLocal.
                            </p>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="p-8 sm:p-12 space-y-10">
                        {/* 1. Introduction */}
                        <section>
                            <h2 className="flex items-center gap-2 text-xl font-bold text-gray-900 mb-4">
                                <span className="bg-green-100 text-green-700 w-8 h-8 rounded-lg flex items-center justify-center text-sm">1</span>
                                Introduction
                            </h2>
                            <p className="text-gray-600 leading-relaxed">
                                Welcome to StudyLocal. By accessing or using our platform, you agree to comply with and be bound by these Terms and Conditions. Our platform is a community initiative designed to connect students with local tutors without any commission or middleman fees.
                            </p>
                        </section>

                        {/* 2. User Responsibilities */}
                        <section>
                            <h2 className="flex items-center gap-2 text-xl font-bold text-gray-900 mb-4">
                                <span className="bg-green-100 text-green-700 w-8 h-8 rounded-lg flex items-center justify-center text-sm">2</span>
                                User Responsibilities
                            </h2>
                            <div className="space-y-3">
                                <p className="text-gray-600 leading-relaxed">
                                    As a user (Student or Tutor) of StudyLocal, you agree to:
                                </p>
                                <ul className="list-disc pl-6 text-gray-600 space-y-2">
                                    <li>Provide accurate and truthful information during registration.</li>
                                    <li>Maintain the confidentiality of your account credentials.</li>
                                    <li>Use the platform only for legitimate educational purposes.</li>
                                    <li>Treat other community members with respect and professionalism.</li>
                                </ul>
                            </div>
                        </section>

                        {/* 3. Tutor Verification & Trust */}
                        <section>
                            <div className="bg-emerald-50 rounded-2xl p-6 border border-emerald-100">
                                <h2 className="flex items-center gap-2 text-xl font-bold text-emerald-900 mb-3">
                                    <ShieldCheck className="h-6 w-6" />
                                    Tutor Verification
                                </h2>
                                <p className="text-emerald-800 text-sm leading-relaxed">
                                    StudyLocal performs primary background checks on tutors based on the data provided during registration. However, we strongly encourage students and parents to perform their own due diligence before starting tuition or sharing sensitive personal information.
                                </p>
                            </div>
                        </section>

                        {/* 4. Payment Policy (COD) */}
                        <section>
                            <h2 className="flex items-center gap-2 text-xl font-bold text-gray-900 mb-4">
                                <span className="bg-green-100 text-green-700 w-8 h-8 rounded-lg flex items-center justify-center text-sm">3</span>
                                No-Commission & Payment
                            </h2>
                            <p className="text-gray-600 leading-relaxed mb-4">
                                StudyLocal is a **non-profit platform**. We do not collect any commission from payments between tutors and students.
                            </p>
                            <div className="bg-gray-50 rounded-xl p-5 border border-gray-200">
                                <p className="text-sm font-bold text-gray-900 mb-1 flex items-center gap-2">
                                    <Zap className="h-4 w-4 text-green-600" />
                                    Cash on Delivery (COD) Only
                                </p>
                                <p className="text-xs text-gray-500">
                                    All financial transactions occur directly between the student and tutor. We recommend a "pay-per-class" or "pay-after-session" model for the first few interactions to build trust.
                                </p>
                            </div>
                        </section>

                        {/* 5. Limitation of Liability */}
                        <section>
                            <h2 className="flex items-center gap-2 text-xl font-bold text-gray-900 mb-4">
                                <span className="bg-green-100 text-green-700 w-8 h-8 rounded-lg flex items-center justify-center text-sm">4</span>
                                Limitation of Liability
                            </h2>
                            <p className="text-gray-600 leading-relaxed italic border-l-4 border-gray-200 pl-4 py-2 bg-gray-50/50">
                                StudyLocal acts solely as a connecting platform. We are not responsible for the quality of tuition, any disputes between parties, or any loss/harm arising from interactions facilitated by the platform.
                            </p>
                        </section>

                        {/* Footer Info */}
                        <div className="pt-8 border-t border-gray-100 flex flex-col items-center gap-4">
                            <Link href="/complaints" className="text-sm text-green-600 hover:text-green-700 font-bold flex items-center gap-1.5 transition">
                                <Info className="h-4 w-4" />
                                Report an issue or violation
                            </Link>
                            <p className="text-[10px] text-gray-400">
                                &copy; 2026 StudyLocal Community Initiative. All rights reserved.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

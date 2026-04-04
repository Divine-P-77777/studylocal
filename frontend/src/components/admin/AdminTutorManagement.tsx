'use client';

import { useState } from 'react';
import {
    Search,
    ChevronLeft,
    ChevronRight,
    Eye,
    CheckCircle,
    XCircle,
    Clock,
    X,
    Edit3,
    Save,
    RotateCcw,
    Users,
    Activity
} from 'lucide-react';
import { updateTutor } from '@/lib/actions/tutor';
import { toast } from 'react-toastify';
import Image from 'next/image';

interface Tutor {
    _id: string;
    fullName: string;
    photoUrl: string;
    subjects: string[];
    classRange: string;
    area: string;
    marketingStatus: 'pending' | 'approved' | 'rejected';
    experience: string;
    bio: string;
    monthlyFee: string;
    tuitionMode: string;
    contactInfo: {
        phone: string;
        email: string;
    };
    createdAt: string;
}

interface AdminTutorManagementProps {
    initialTutors: Tutor[];
}

export default function AdminTutorManagement({ initialTutors }: AdminTutorManagementProps) {
    const [tutors, setTutors] = useState<Tutor[]>(initialTutors);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedTutor, setSelectedTutor] = useState<Tutor | null>(null);
    const [isStatusUpdating, setIsStatusUpdating] = useState<string | null>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [editForm, setEditForm] = useState<Partial<Tutor>>({});

    const itemsPerPage = 8;

    // Metrics calculation
    const stats = {
        total: tutors.length,
        approved: tutors.filter(t => t.marketingStatus === 'approved').length,
        pending: tutors.filter(t => t.marketingStatus === 'pending').length,
        rejected: tutors.filter(t => t.marketingStatus === 'rejected').length
    };

    // Calculate percentages for the bar (with minimum width for visibility)
    const getPercent = (count: number) => {
        if (stats.total === 0) return 0;
        const raw = (count / stats.total) * 100;
        return count > 0 ? Math.max(raw, 5) : 0; // Ensure at least 5% width if count > 0
    };

    // Filter tutors based on search term
    const filteredTutors = tutors.filter(tutor =>
        tutor.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tutor.contactInfo?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tutor.subjects?.some(s => s.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    // Pagination logic
    const totalPages = Math.ceil(filteredTutors.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedTutors = filteredTutors.slice(startIndex, startIndex + itemsPerPage);

    const handleStatusUpdate = async (tutorId: string, status: 'pending' | 'approved' | 'rejected') => {
        setIsStatusUpdating(tutorId);
        try {
            const res = await updateTutor(tutorId, { marketingStatus: status });
            if (res.success) {
                setTutors(prev => prev.map(t => t._id === tutorId ? { ...t, marketingStatus: status } : t));
                if (selectedTutor?._id === tutorId) {
                    setSelectedTutor(prev => prev ? { ...prev, marketingStatus: status } : null);
                }
                toast.success(res.message);
            } else {
                toast.error(res.message);
            }
        } catch (error) {
            toast.error('Failed to update status');
        } finally {
            setIsStatusUpdating(null);
        }
    };

    const handleSaveProfile = async () => {
        if (!selectedTutor) return;
        setIsStatusUpdating(selectedTutor._id);
        try {
            const res = await updateTutor(selectedTutor._id, editForm);
            if (res.success) {
                setTutors(prev => prev.map(t => t._id === selectedTutor._id ? { ...t, ...editForm } : t));
                setSelectedTutor(prev => prev ? { ...prev, ...editForm } : null);
                setIsEditing(false);
                toast.success('Profile updated successfully');
            } else {
                toast.error(res.message);
            }
        } catch (error) {
            toast.error('Failed to save changes');
        } finally {
            setIsStatusUpdating(null);
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Metrics Dashboard */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-green-50 rounded-lg text-green-600">
                            <Activity className="h-5 w-5" />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-gray-900">Application Metrics</h3>
                            <p className="text-xs text-gray-500">Overview of all tutor registrations</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-6">
                        <div className="text-right">
                            <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Total Tutors</p>
                        </div>
                    </div>
                </div>

                {/* Distribution Bar */}
                <div className="space-y-3">
                    <div className="h-4 w-full bg-gray-100 rounded-full overflow-hidden flex shadow-inner">
                        <div
                            style={{ width: `${getPercent(stats.approved)}%` }}
                            className="bg-green-500 h-full transition-all duration-1000 ease-out"
                            title={`Approved: ${stats.approved}`}
                        />
                        <div
                            style={{ width: `${getPercent(stats.pending)}%` }}
                            className="bg-orange-400 h-full transition-all duration-1000 ease-out border-x border-white/20"
                            title={`Pending: ${stats.pending}`}
                        />
                        <div
                            style={{ width: `${getPercent(stats.rejected)}%` }}
                            className="bg-red-500 h-full transition-all duration-1000 ease-out"
                            title={`Rejected: ${stats.rejected}`}
                        />
                    </div>
                    <div className="flex items-center gap-6 text-xs transition-opacity duration-300">
                        <div className="flex items-center gap-1.5 font-medium text-gray-600">
                            <span className="w-2.5 h-2.5 rounded-full bg-green-500" />
                            Approved ({stats.approved})
                        </div>
                        <div className="flex items-center gap-1.5 font-medium text-gray-600">
                            <span className="w-2.5 h-2.5 rounded-full bg-orange-400" />
                            Pending ({stats.pending})
                        </div>
                        <div className="flex items-center gap-1.5 font-medium text-gray-600">
                            <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
                            Rejected ({stats.rejected})
                        </div>
                    </div>
                </div>
            </div>

            {/* Header & Search */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-white rounded-lg shadow-sm border border-gray-100">
                        <Users className="h-6 w-6 text-green-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Tutor Directory</h2>
                </div>
                <div className="relative max-w-sm w-full">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search name, email, or subject..."
                        className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 transition"
                        value={searchTerm}
                        onChange={(e) => {
                            setSearchTerm(e.target.value);
                            setCurrentPage(1);
                        }}
                    />
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 border-b border-gray-100">
                            <tr>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Tutor</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Subjects</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Area</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {paginatedTutors.map((tutor) => (
                                <tr key={tutor._id} className="hover:bg-gray-50/50 transition">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center gap-3">
                                            <div className="h-10 w-10 rounded-full bg-green-100 flex-shrink-0 overflow-hidden relative border border-green-50">
                                                {tutor.photoUrl ? (
                                                    <Image src={tutor.photoUrl} alt={tutor.fullName} fill className="object-cover" />
                                                ) : (
                                                    <div className="flex items-center justify-center h-full text-green-600 font-bold">
                                                        {tutor.fullName.charAt(0)}
                                                    </div>
                                                )}
                                            </div>
                                            <div>
                                                <div className="text-sm font-medium text-gray-900">{tutor.fullName}</div>
                                                <div className="text-xs text-gray-500">{tutor.contactInfo?.email || 'No email provided'}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex flex-wrap gap-1">
                                            {tutor.subjects.slice(0, 2).map((s, i) => (
                                                <span key={i} className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-[10px]">
                                                    {s}
                                                </span>
                                            ))}
                                            {tutor.subjects.length > 2 && (
                                                <span className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-[10px]">
                                                    +{tutor.subjects.length - 2}
                                                </span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                        {tutor.area}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium inline-flex items-center gap-1.5 ${tutor.marketingStatus === 'approved' ? 'bg-green-100 text-green-700' :
                                                tutor.marketingStatus === 'rejected' ? 'bg-red-100 text-red-700' :
                                                    'bg-orange-100 text-orange-700'
                                            }`}>
                                            {tutor.marketingStatus === 'approved' ? <CheckCircle className="h-3 w-3" /> :
                                                tutor.marketingStatus === 'rejected' ? <XCircle className="h-3 w-3" /> :
                                                    <Clock className="h-3 w-3" />}
                                            {tutor.marketingStatus}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                                        <button
                                            onClick={() => setSelectedTutor(tutor)}
                                            className="p-2 text-gray-400 hover:text-green-600 transition"
                                            title="View Details"
                                        >
                                            <Eye className="h-5 w-5" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Empty State */}
                {filteredTutors.length === 0 && (
                    <div className="py-12 text-center text-gray-500">
                        No tutors found matching your search.
                    </div>
                )}

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
                        <span className="text-sm text-gray-500">
                            Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredTutors.length)} of {filteredTutors.length}
                        </span>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                disabled={currentPage === 1}
                                className="p-2 border border-gray-200 rounded hover:bg-white disabled:opacity-50 transition"
                            >
                                <ChevronLeft className="h-4 w-4" />
                            </button>
                            <button
                                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                disabled={currentPage === totalPages}
                                className="p-2 border border-gray-200 rounded hover:bg-white disabled:opacity-50 transition"
                            >
                                <ChevronRight className="h-4 w-4" />
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Detail Modal */}
            {selectedTutor && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col scale-in duration-200">
                        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between shrink-0">
                            <h3 className="text-lg font-bold text-gray-900">Tutor Details</h3>
                            <button onClick={() => setSelectedTutor(null)} className="p-2 hover:bg-gray-100 rounded-full transition">
                                <X className="h-5 w-5 text-gray-500" />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-6 space-y-6">
                            {/* Basic Info */}
                            <div className="flex items-start gap-6 pb-6 border-b border-gray-50">
                                <div className="h-24 w-24 rounded-2xl bg-green-100 overflow-hidden relative shadow-sm shrink-0">
                                    {selectedTutor.photoUrl ? (
                                        <Image src={selectedTutor.photoUrl} alt={selectedTutor.fullName} fill className="object-cover" />
                                    ) : (
                                        <div className="flex items-center justify-center h-full text-green-600 font-bold text-3xl">
                                            {selectedTutor.fullName.charAt(0)}
                                        </div>
                                    )}
                                </div>
                                <div className="flex-1">
                                    {isEditing ? (
                                        <div className="space-y-3">
                                            <input
                                                type="text"
                                                className="w-full text-2xl font-bold text-gray-900 border-b-2 border-green-500 focus:outline-none bg-transparent"
                                                value={editForm.fullName || ''}
                                                onChange={(e) => setEditForm({ ...editForm, fullName: e.target.value })}
                                                placeholder="Full Name"
                                            />
                                            <div className="grid grid-cols-1 gap-2">
                                                <input
                                                    type="email"
                                                    className="w-full text-sm text-gray-600 border border-gray-200 rounded px-2 py-1 focus:ring-1 focus:ring-green-500"
                                                    value={editForm.contactInfo?.email || ''}
                                                    onChange={(e) => setEditForm({ ...editForm, contactInfo: { ...editForm.contactInfo!, email: e.target.value } })}
                                                    placeholder="Admin/Contact Email"
                                                />
                                                <input
                                                    type="tel"
                                                    className="w-full text-sm text-gray-600 border border-gray-200 rounded px-2 py-1 focus:ring-1 focus:ring-green-500"
                                                    value={editForm.contactInfo?.phone || ''}
                                                    onChange={(e) => setEditForm({ ...editForm, contactInfo: { ...editForm.contactInfo!, phone: e.target.value } })}
                                                    placeholder="Phone Number"
                                                />
                                            </div>
                                        </div>
                                    ) : (
                                        <>
                                            <h4 className="text-2xl font-bold text-gray-900">{selectedTutor.fullName}</h4>
                                            <div className="mt-1 flex flex-col gap-1">
                                                <p className="text-gray-500 flex items-center gap-2 text-sm">
                                                    <span className="font-medium text-gray-700">Email:</span> {selectedTutor.contactInfo?.email || 'N/A'}
                                                </p>
                                                <p className="text-gray-500 flex items-center gap-2 text-sm">
                                                    <span className="font-medium text-gray-700">Phone:</span> {selectedTutor.contactInfo?.phone || 'N/A'}
                                                </p>
                                            </div>
                                        </>
                                    )}
                                </div>
                                <button
                                    onClick={() => {
                                        if (isEditing) {
                                            setIsEditing(false);
                                        } else {
                                            setIsEditing(true);
                                            setEditForm(selectedTutor);
                                        }
                                    }}
                                    className={`p-2 rounded-lg transition-colors ${isEditing ? 'bg-orange-50 text-orange-600 hover:bg-orange-100' : 'bg-gray-50 text-gray-400 hover:text-green-600 hover:bg-green-50'}`}
                                    title={isEditing ? 'Cancel Edit' : 'Edit Profile'}
                                >
                                    {isEditing ? <RotateCcw className="h-5 w-5" /> : <Edit3 className="h-5 w-5" />}
                                </button>
                            </div>

                            {/* Details Grid */}
                            <div className="grid grid-cols-2 gap-6">
                                <div>
                                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Teaching Scope</p>
                                    <div className="space-y-3">
                                        {isEditing ? (
                                            <>
                                                <div>
                                                    <label className="text-[10px] text-gray-400 font-bold uppercase">Class Range</label>
                                                    <input
                                                        className="w-full text-sm border-b border-gray-200 focus:border-green-500 outline-none"
                                                        value={editForm.classRange || ''}
                                                        onChange={(e) => setEditForm({ ...editForm, classRange: e.target.value })}
                                                    />
                                                </div>
                                                <div>
                                                    <label className="text-[10px] text-gray-400 font-bold uppercase">Mode</label>
                                                    <input
                                                        className="w-full text-sm border-b border-gray-200 focus:border-green-500 outline-none"
                                                        value={editForm.tuitionMode || ''}
                                                        onChange={(e) => setEditForm({ ...editForm, tuitionMode: e.target.value })}
                                                    />
                                                </div>
                                                <div>
                                                    <label className="text-[10px] text-gray-400 font-bold uppercase">Monthly Fee</label>
                                                    <input
                                                        className="w-full text-sm border-b border-gray-200 focus:border-green-500 outline-none font-medium text-green-600"
                                                        value={editForm.monthlyFee || ''}
                                                        onChange={(e) => setEditForm({ ...editForm, monthlyFee: e.target.value })}
                                                    />
                                                </div>
                                            </>
                                        ) : (
                                            <>
                                                <p className="text-sm font-medium text-gray-800">Classes: <span className="text-gray-600 font-normal">{selectedTutor.classRange}</span></p>
                                                <p className="text-sm font-medium text-gray-800">Mode: <span className="text-gray-600 font-normal">{selectedTutor.tuitionMode}</span></p>
                                                <p className="text-sm font-medium text-gray-800 font-bold text-green-600">Fee: <span className="text-gray-600 font-normal">{selectedTutor.monthlyFee}</span></p>
                                            </>
                                        )}
                                    </div>
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Location & Experience</p>
                                    <div className="space-y-3">
                                        {isEditing ? (
                                            <>
                                                <div>
                                                    <label className="text-[10px] text-gray-400 font-bold uppercase">Area</label>
                                                    <input
                                                        className="w-full text-sm border-b border-gray-200 focus:border-green-500 outline-none"
                                                        value={editForm.area || ''}
                                                        onChange={(e) => setEditForm({ ...editForm, area: e.target.value })}
                                                    />
                                                </div>
                                                <div>
                                                    <label className="text-[10px] text-gray-400 font-bold uppercase">Experience (Years)</label>
                                                    <input
                                                        className="w-full text-sm border-b border-gray-200 focus:border-green-500 outline-none"
                                                        value={editForm.experience || ''}
                                                        onChange={(e) => setEditForm({ ...editForm, experience: e.target.value })}
                                                    />
                                                </div>
                                            </>
                                        ) : (
                                            <>
                                                <p className="text-sm font-medium text-gray-800">Area: <span className="text-gray-600 font-normal">{selectedTutor.area}</span></p>
                                                <p className="text-sm font-medium text-gray-800">Exp: <span className="text-gray-600 font-normal">{selectedTutor.experience}</span></p>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Subjects */}
                            <div>
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Subjects</p>
                                {isEditing ? (
                                    <input
                                        className="w-full text-sm border border-gray-200 rounded p-2 focus:ring-1 focus:ring-green-500 outline-none"
                                        value={editForm.subjects?.join(', ') || ''}
                                        onChange={(e) => setEditForm({ ...editForm, subjects: e.target.value.split(',').map(s => s.trim()) })}
                                        placeholder="Comma separated subjects"
                                    />
                                ) : (
                                    <div className="flex flex-wrap gap-2">
                                        {selectedTutor.subjects.map((s, i) => (
                                            <span key={i} className="px-3 py-1 bg-green-50 text-green-700 rounded-lg text-xs font-medium border border-green-100">
                                                {s}
                                            </span>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Bio */}
                            <div>
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Biography</p>
                                {isEditing ? (
                                    <textarea
                                        rows={4}
                                        className="w-full text-sm border border-gray-200 rounded p-4 focus:ring-1 focus:ring-green-500 outline-none"
                                        value={editForm.bio || ''}
                                        onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
                                    />
                                ) : (
                                    <p className="text-sm text-gray-600 leading-relaxed bg-gray-50 p-4 rounded-xl italic">
                                        "{selectedTutor.bio}"
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Status/Save Management */}
                        <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex items-center justify-between shrink-0">
                            <div>
                                <p className="text-xs text-gray-500 mb-1">Current Status: <span className="font-bold text-gray-900 uppercase">{selectedTutor.marketingStatus}</span></p>
                            </div>
                            <div className="flex items-center gap-2">
                                {isEditing ? (
                                    <button
                                        onClick={handleSaveProfile}
                                        disabled={isStatusUpdating === selectedTutor._id}
                                        className="px-6 py-2 bg-green-600 text-white rounded-lg text-sm font-bold hover:bg-green-700 transition shadow-sm disabled:opacity-50 flex items-center gap-2"
                                    >
                                        <Save className="h-4 w-4" />
                                        Save Changes
                                    </button>
                                ) : (
                                    <>
                                        <button
                                            onClick={() => handleStatusUpdate(selectedTutor._id, 'rejected')}
                                            disabled={isStatusUpdating === selectedTutor._id || selectedTutor.marketingStatus === 'rejected'}
                                            className="px-4 py-2 bg-red-100 text-red-700 rounded-lg text-xs font-bold hover:bg-red-200 transition disabled:opacity-50"
                                        >
                                            Reject
                                        </button>
                                        <button
                                            onClick={() => handleStatusUpdate(selectedTutor._id, 'pending')}
                                            disabled={isStatusUpdating === selectedTutor._id || selectedTutor.marketingStatus === 'pending'}
                                            className="px-4 py-2 bg-orange-100 text-orange-700 rounded-lg text-xs font-bold hover:bg-orange-200 transition disabled:opacity-50"
                                        >
                                            Wait
                                        </button>
                                        <button
                                            onClick={() => handleStatusUpdate(selectedTutor._id, 'approved')}
                                            disabled={isStatusUpdating === selectedTutor._id || selectedTutor.marketingStatus === 'approved'}
                                            className="px-4 py-2 bg-green-600 text-white rounded-lg text-xs font-bold hover:bg-green-700 transition shadow-sm disabled:opacity-50 flex items-center gap-2"
                                        >
                                            <CheckCircle className="h-4 w-4" />
                                            Approve
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

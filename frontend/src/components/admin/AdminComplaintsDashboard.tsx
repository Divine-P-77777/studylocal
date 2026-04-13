'use client';

import React from 'react';

import { useState, useMemo } from 'react';
import { 
    Search, Filter, Eye, CheckCircle, Clock, AlertCircle, 
    MessageSquareHeart, Wrench, Megaphone, ChevronLeft, ChevronRight,
    X, User, Calendar, Tag, ArrowUpDown
} from 'lucide-react';
import ComplaintActions from '@/components/admin/ComplaintActions';

interface Complaint {
    _id: string;
    reporterId: string;   // Auth0 user ID
    reporterName?: string;
    reporterEmail?: string;
    type: 'feedback' | 'issue' | 'complaint' | string;
    status: 'pending' | 'open' | 'in progress' | 'resolved';
    description: string;
    reason?: string;
    createdAt: string;
    updatedAt?: string;
}

interface AdminComplaintsDashboardProps {
    complaints: Complaint[];
}

const TYPE_CONFIG: Record<string, { label: string; icon: React.ReactNode; bg: string; text: string; border: string }> = {
    feedback: {
        label: 'Feedback',
        icon: <MessageSquareHeart className="w-3.5 h-3.5" />,
        bg: 'bg-pink-50', text: 'text-pink-700', border: 'border-pink-200'
    },
    issue: {
        label: 'Issue',
        icon: <Wrench className="w-3.5 h-3.5" />,
        bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200'
    },
    complaint: {
        label: 'Complaint',
        icon: <Megaphone className="w-3.5 h-3.5" />,
        bg: 'bg-indigo-50', text: 'text-indigo-700', border: 'border-indigo-200'
    },
};

const STATUS_CONFIG: Record<string, { label: string; icon: React.ReactNode; bg: string; text: string; dot: string }> = {
    pending: { label: 'Pending', icon: <AlertCircle className="w-3.5 h-3.5" />, bg: 'bg-red-50', text: 'text-red-600', dot: 'bg-red-500' },
    open: { label: 'Open', icon: <AlertCircle className="w-3.5 h-3.5" />, bg: 'bg-red-50', text: 'text-red-600', dot: 'bg-red-500' },
    'in progress': { label: 'In Progress', icon: <Clock className="w-3.5 h-3.5" />, bg: 'bg-amber-50', text: 'text-amber-700', dot: 'bg-amber-500' },
    resolved: { label: 'Resolved', icon: <CheckCircle className="w-3.5 h-3.5" />, bg: 'bg-green-50', text: 'text-green-600', dot: 'bg-green-500' },
};

const PAGE_SIZE = 5;

export default function AdminComplaintsDashboard({ complaints }: AdminComplaintsDashboardProps) {
    const [search, setSearch] = useState('');
    const [typeFilter, setTypeFilter] = useState<string>('all');
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [page, setPage] = useState(1);
    const [selected, setSelected] = useState<Complaint | null>(null);
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

    const filtered = useMemo(() => {
        let result = [...complaints];

        // Search by reporterId (user ID / email substring)
        if (search.trim()) {
            const q = search.trim().toLowerCase();
            result = result.filter(c =>
                c.reporterId?.toLowerCase().includes(q) ||
                c.description?.toLowerCase().includes(q) ||
                c.reason?.toLowerCase().includes(q)
            );
        }

        // Type filter
        if (typeFilter !== 'all') {
            result = result.filter(c => c.type?.toLowerCase() === typeFilter);
        }

        // Status filter
        if (statusFilter !== 'all') {
            result = result.filter(c => c.status?.toLowerCase() === statusFilter);
        }

        // Sort
        result.sort((a, b) => {
            const da = new Date(a.createdAt).getTime();
            const db = new Date(b.createdAt).getTime();
            return sortOrder === 'desc' ? db - da : da - db;
        });

        return result;
    }, [complaints, search, typeFilter, statusFilter, sortOrder]);

    const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
    const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

    const typeCounts = useMemo(() => {
        const counts: Record<string, number> = { all: complaints.length, feedback: 0, issue: 0, complaint: 0 };
        complaints.forEach(c => { const k = c.type?.toLowerCase(); if (k && k in counts) counts[k]++; });
        return counts;
    }, [complaints]);

    const handlePageChange = (newPage: number) => {
        setPage(Math.max(1, Math.min(newPage, totalPages)));
    };

    const getTypeConfig = (type: string) => TYPE_CONFIG[type?.toLowerCase()] ?? { label: type, icon: null, bg: 'bg-gray-50', text: 'text-gray-700', border: 'border-gray-200' };
    const getStatusConfig = (status: string) => STATUS_CONFIG[status?.toLowerCase()] ?? STATUS_CONFIG['pending'];

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Complaints & Issues</h1>
                    <p className="text-sm text-gray-500 mt-1">{complaints.length} total submissions</p>
                </div>
                {/* Stats Row */}
                <div className="flex gap-3">
                    {(['feedback', 'issue', 'complaint'] as const).map(t => {
                        const cfg = TYPE_CONFIG[t];
                        return (
                            <div key={t} className={`px-3 py-1.5 rounded-lg border text-xs font-bold flex items-center gap-1.5 ${cfg.bg} ${cfg.text} ${cfg.border}`}>
                                {cfg.icon} {typeCounts[t]}
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Filters Row */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex flex-col sm:flex-row gap-4">
                {/* Search */}
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search by user ID, email or message..."
                        value={search}
                        onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                        className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 outline-none text-sm transition"
                    />
                </div>

                {/* Type Filter */}
                <div className="flex items-center gap-2">
                    <Filter className="w-4 h-4 text-gray-400 shrink-0" />
                    <select
                        value={typeFilter}
                        onChange={(e) => { setTypeFilter(e.target.value); setPage(1); }}
                        className="border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-700 focus:border-indigo-600 outline-none bg-white"
                    >
                        <option value="all">All Types</option>
                        <option value="feedback">Feedback</option>
                        <option value="issue">Issue</option>
                        <option value="complaint">Complaint</option>
                    </select>
                </div>

                {/* Status Filter */}
                <select
                    value={statusFilter}
                    onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
                    className="border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-700 focus:border-indigo-600 outline-none bg-white"
                >
                    <option value="all">All Statuses</option>
                    <option value="pending">Pending</option>
                    <option value="in progress">In Progress</option>
                    <option value="resolved">Resolved</option>
                </select>

                {/* Sort */}
                <button
                    onClick={() => setSortOrder(s => s === 'desc' ? 'asc' : 'desc')}
                    className="flex items-center gap-1.5 border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition whitespace-nowrap"
                >
                    <ArrowUpDown className="w-4 h-4" />
                    {sortOrder === 'desc' ? 'Newest first' : 'Oldest first'}
                </button>
            </div>

            {/* Table */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                {/* Table Header */}
                <div className="grid grid-cols-[1fr_2.5fr_1fr_1fr_1fr_auto] gap-4 px-6 py-3 bg-gray-50 border-b border-gray-100 text-xs font-bold text-gray-500 uppercase tracking-wider">
                    <span>From</span>
                    <span>Message</span>
                    <span>Type</span>
                    <span>Status</span>
                    <span>Date</span>
                    <span>Action</span>
                </div>

                {paginated.length === 0 ? (
                    <div className="py-24 text-center">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <MessageSquareHeart className="w-8 h-8 text-gray-300" />
                        </div>
                        <p className="text-gray-500 font-medium">No submissions match your filters.</p>
                    </div>
                ) : (
                    paginated.map((c, i) => {
                        const typeCfg = getTypeConfig(c.type);
                        const statusCfg = getStatusConfig(c.status);
                        const shortId = c.reporterId?.split('|')[1]?.slice(-8) || c.reporterId?.slice(-8) || '—';

                        return (
                            <div
                                key={c._id}
                                className={`grid grid-cols-[1fr_2.5fr_1fr_1fr_1fr_auto] gap-4 px-6 py-4 items-center border-b border-gray-50 hover:bg-gray-50/70 transition group ${i % 2 === 0 ? '' : 'bg-gray-50/30'}`}
                            >
                                {/* From */}
                                <div className="flex items-center gap-3 min-w-0">
                                    <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center shrink-0">
                                        <User className="w-4 h-4" />
                                    </div>
                                    <div className="flex flex-col min-w-0">
                                        <span className="text-sm font-bold text-gray-900 truncate">{c.reporterName || 'Unknown'}</span>
                                        <span className="text-[10px] font-mono text-gray-400 truncate" title={c.reporterId}>...{shortId}</span>
                                    </div>
                                </div>

                                {/* Message */}
                                <p className="text-sm text-gray-700 line-clamp-2 leading-snug">{c.description}</p>

                                {/* Type Badge */}
                                <div>
                                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold border ${typeCfg.bg} ${typeCfg.text} ${typeCfg.border}`}>
                                        {typeCfg.icon}
                                        {typeCfg.label}
                                    </span>
                                </div>

                                {/* Status */}
                                <div>
                                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${statusCfg.bg} ${statusCfg.text}`}>
                                        <span className={`w-1.5 h-1.5 rounded-full ${statusCfg.dot}`} />
                                        {statusCfg.label}
                                    </span>
                                </div>

                                {/* Date */}
                                <span className="text-xs text-gray-400 flex items-center gap-1">
                                    <Calendar className="w-3 h-3" />
                                    {new Date(c.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                                </span>

                                {/* Actions */}
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => setSelected(c)}
                                        className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition"
                                        title="View details"
                                    >
                                        <Eye className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between">
                <p className="text-sm text-gray-500">
                    Showing <span className="font-bold">{filtered.length === 0 ? 0 : (page - 1) * PAGE_SIZE + 1}</span>–<span className="font-bold">{Math.min(page * PAGE_SIZE, filtered.length)}</span> of <span className="font-bold">{filtered.length}</span>
                </p>
                <div className="flex items-center gap-2">
                    <button onClick={() => handlePageChange(page - 1)} disabled={page === 1} className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 transition disabled:opacity-40">
                        <ChevronLeft className="w-4 h-4" />
                    </button>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).filter(p => p === 1 || p === totalPages || Math.abs(p - page) <= 1).map((p, i, arr) => (
                        <React.Fragment key={p}>
                            {i > 0 && arr[i - 1] !== p - 1 && <span className="text-gray-400 text-sm px-1">…</span>}
                            <button
                                onClick={() => handlePageChange(p)}
                                className={`w-8 h-8 rounded-lg text-sm font-semibold transition ${p === page ? 'bg-indigo-600 text-white' : 'border border-gray-200 hover:bg-gray-50 text-gray-700'}`}
                            >
                                {p}
                            </button>
                        </React.Fragment>
                    ))}
                    <button onClick={() => handlePageChange(page + 1)} disabled={page === totalPages} className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 transition disabled:opacity-40">
                        <ChevronRight className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* Detail Popup Modal */}
            {selected && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-gray-900/70 backdrop-blur-sm animate-in fade-in duration-200 scroll-chain-auto">
                    <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full p-8 animate-in zoom-in-95 duration-200 relative">
                        <button
                            onClick={() => setSelected(null)}
                            className="absolute top-5 right-5 p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-xl transition"
                        >
                            <X className="w-5 h-5" />
                        </button>

                        <div className="flex items-center gap-3 mb-6">
                            <div className={`p-2.5 rounded-xl ${getTypeConfig(selected.type).bg}`}>
                                <span className={getTypeConfig(selected.type).text}>{getTypeConfig(selected.type).icon}</span>
                            </div>
                            <div>
                                <h2 className="text-lg font-bold text-gray-900">
                                    {getTypeConfig(selected.type).label} Report
                                </h2>
                                <p className="text-xs text-gray-400">ID: {selected._id}</p>
                            </div>
                        </div>

                        <div className="space-y-5">
                            {/* Sender Info */}
                            <div className="bg-gray-50 rounded-2xl p-4 space-y-2">
                                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Submitted By</p>
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center shrink-0">
                                        <User className="w-5 h-5" />
                                    </div>
                                    <div className="min-w-0 overflow-hidden">
                                        <p className="text-sm font-bold text-gray-800 truncate">{selected.reporterName || 'Unknown User'}</p>
                                        <p className="text-xs text-gray-500 truncate">{selected.reporterEmail}</p>
                                        <p className="text-[10px] font-mono text-gray-400 mt-1 truncate" title={selected.reporterId}>
                                            ID: {selected.reporterId}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Tags Row */}
                            <div className="flex gap-2 flex-wrap">
                                <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border ${getTypeConfig(selected.type).bg} ${getTypeConfig(selected.type).text} ${getTypeConfig(selected.type).border}`}>
                                    <Tag className="w-3 h-3" /> {getTypeConfig(selected.type).label}
                                </span>
                                <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold ${getStatusConfig(selected.status).bg} ${getStatusConfig(selected.status).text}`}>
                                    <span className={`w-2 h-2 rounded-full ${getStatusConfig(selected.status).dot}`} />
                                    {getStatusConfig(selected.status).label}
                                </span>
                            </div>

                            {/* Message */}
                            <div>
                                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Message</p>
                                <div className="bg-indigo-50/50 rounded-2xl p-5 border border-indigo-100 max-h-48 overflow-y-auto custom-scrollbar scroll-chain-auto">
                                    <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{selected.description}</p>
                                </div>
                            </div>

                            {/* Admin Actions */}
                            <div className="pt-2">
                                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Update Status</p>
                                <ComplaintActions complaintId={selected._id} currentStatus={selected.status} />
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

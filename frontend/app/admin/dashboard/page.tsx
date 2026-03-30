'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    LayoutDashboard, 
    LogOut, 
    Filter, 
    Trash2, 
    ChevronDown, 
    AlertCircle, 
    Loader2, 
    Search,
    RefreshCcw,
    BarChart3,
    CheckCircle2,
    Clock,
    CircleDot
} from 'lucide-react';

interface Feedback {
    _id: string;
    title: string;
    description: string;
    category: string;
    status: 'New' | 'In Review' | 'Resolved';
    aiAnalysis?: {
        sentiment: 'positive' | 'neutral' | 'negative';
        suggestedCategory: string;
        priorityScore: number;
        tags: string[];
        summary: string;
    };
    createdAt: string;
}

const CATEGORIES = ['All', 'Bug', 'Feature', 'UI/UX', 'Performance', 'Other'];
const STATUSES = ['All', 'New', 'In Review', 'Resolved'];

export default function AdminDashboard() {
    const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isUpdating, setIsUpdating] = useState<string | null>(null);
    const [filterCategory, setFilterCategory] = useState('All');
    const [filterStatus, setFilterStatus] = useState('All');
    const [searchQuery, setSearchQuery] = useState('');
    const router = useRouter();

    useEffect(() => {
        const token = localStorage.getItem('adminToken');
        if (!token) {
            router.push('/admin/login');
        } else {
            fetchFeedbacks();
        }
    }, [router]);

    const fetchFeedbacks = async () => {
        setIsLoading(true);
        try {
            const token = localStorage.getItem('adminToken');
            let url = 'http://localhost:4000/api/feedback?';
            if (filterCategory !== 'All') url += `category=${filterCategory}&`;
            if (filterStatus !== 'All') url += `status=${filterStatus}&`;

            const response = await fetch(url, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (response.status === 401) {
                localStorage.removeItem('adminToken');
                router.push('/admin/login');
                return;
            }

            const data = await response.json();
            setFeedbacks(data);
        } catch (err) {
            console.error('Failed to fetch feedbacks', err);
        } finally {
            setIsLoading(false);
        }
    };

    // Re-fetch when filters change
    useEffect(() => {
        if (localStorage.getItem('adminToken')) {
            fetchFeedbacks();
        }
    }, [filterCategory, filterStatus]);

    const handleUpdateStatus = async (id: string, newStatus: string) => {
        setIsUpdating(id);
        try {
            const token = localStorage.getItem('adminToken');
            const response = await fetch(`http://localhost:4000/api/feedback/${id}/status`, {
                method: 'PATCH',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ status: newStatus }),
            });

            if (response.ok) {
                setFeedbacks(feedbacks.map(f => f._id === id ? { ...f, status: newStatus as any } : f));
            }
        } catch (err) {
            console.error('Failed to update status', err);
        } finally {
            setIsUpdating(null);
        }
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm('Are you sure you want to delete this feedback?')) return;

        try {
            const token = localStorage.getItem('adminToken');
            const response = await fetch(`http://localhost:4000/api/feedback/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (response.ok) {
                setFeedbacks(feedbacks.filter(f => f._id !== id));
            }
        } catch (err) {
            console.error('Failed to delete feedback', err);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('adminToken');
        router.push('/admin/login');
    };

    const filteredFeedbacks = feedbacks.filter(f => 
        f.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
        f.description.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const getSentimentColor = (sentiment: string) => {
        switch (sentiment) {
            case 'positive': return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
            case 'negative': return 'text-red-400 bg-red-500/10 border-red-500/20';
            default: return 'text-zinc-400 bg-zinc-500/10 border-zinc-500/20';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'New': return <CircleDot className="w-4 h-4 text-emerald-400" />;
            case 'In Review': return <Clock className="w-4 h-4 text-amber-400" />;
            case 'Resolved': return <CheckCircle2 className="w-4 h-4 text-zinc-400" />;
            default: return null;
        }
    };

    return (
        <div className="min-h-screen bg-[#0a0a0a] text-white">
            {/* Sidebar/TopNav mockup */}
            <div className="fixed top-0 left-0 right-0 h-20 bg-zinc-900 border-zinc-800 border-b flex items-center justify-between px-8 z-30">
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/20">
                        <LayoutDashboard className="w-6 h-6 text-black font-bold" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold tracking-tight">Admin Dashboard</h1>
                        <p className="text-zinc-500 text-[10px] uppercase font-bold tracking-widest leading-none">FeedPulse Moderation</p>
                    </div>
                </div>

                <button 
                    onClick={handleLogout}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 transition-all text-xs font-medium text-zinc-300 hover:text-white"
                >
                    <LogOut className="w-4 h-4" />
                    Logout
                </button>
            </div>

            <main className="pt-32 pb-24 px-8 max-w-7xl mx-auto">
                {/* Stats Bar */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
                    {[
                        { label: 'Total Feedbacks', value: feedbacks.length, icon: BarChart3, color: 'text-zinc-400' },
                        { label: 'New', value: feedbacks.filter(f => f.status === 'New').length, icon: CircleDot, color: 'text-emerald-400' },
                        { label: 'In Review', value: feedbacks.filter(f => f.status === 'In Review').length, icon: Clock, color: 'text-amber-400' },
                        { label: 'Resolved', value: feedbacks.filter(f => f.status === 'Resolved').length, icon: CheckCircle2, color: 'text-zinc-400' },
                    ].map((stat, i) => (
                        <div key={i} className="bg-zinc-900 border border-zinc-800 p-6 rounded-3xl flex items-center justify-between">
                            <div>
                                <p className="text-zinc-500 mb-1 text-[10px] uppercase font-bold tracking-wider">{stat.label}</p>
                                <p className="text-3xl font-bold">{stat.value}</p>
                            </div>
                            <stat.icon className={`w-8 h-8 ${stat.color} opacity-20`} />
                        </div>
                    ))}
                </div>

                {/* Filter Bar */}
                <div className="flex flex-col md:flex-row gap-4 mb-8">
                    <div className="relative flex-1 group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600 transition-colors group-focus-within:text-emerald-400" />
                        <input 
                            type="text" 
                            placeholder="Search feedback..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl pl-12 pr-4 py-4 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all placeholder:text-zinc-700" 
                        />
                    </div>

                    <div className="flex gap-2 min-w-fit">
                        <div className="relative">
                            <select 
                                value={filterCategory}
                                onChange={(e) => setFilterCategory(e.target.value)}
                                className="appearance-none bg-zinc-900 border border-zinc-800 rounded-2xl pl-10 pr-10 py-4 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all text-sm font-medium cursor-pointer"
                            >
                                {CATEGORIES.map(c => <option key={c} value={c}>{c} Category</option>)}
                            </select>
                            <Filter className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 pointer-events-none" />
                            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 pointer-events-none" />
                        </div>

                        <div className="relative">
                            <select 
                                value={filterStatus}
                                onChange={(e) => setFilterStatus(e.target.value)}
                                className="appearance-none bg-zinc-900 border border-zinc-800 rounded-2xl pl-10 pr-10 py-4 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all text-sm font-medium cursor-pointer"
                            >
                                {STATUSES.map(s => <option key={s} value={s}>{s} Status</option>)}
                            </select>
                            <CircleDot className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 pointer-events-none" />
                            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 pointer-events-none" />
                        </div>

                        <button 
                            onClick={fetchFeedbacks}
                            className="bg-zinc-800 hover:bg-zinc-700 p-4 rounded-2xl transition-all"
                            title="Refresh Data"
                        >
                            <RefreshCcw className={`w-5 h-5 text-zinc-400 ${isLoading ? 'animate-spin' : ''}`} />
                        </button>
                    </div>
                </div>

                {/* Feedback List */}
                {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-24 gap-4">
                        <Loader2 className="w-12 h-12 text-emerald-500 animate-spin" />
                        <p className="text-zinc-500 font-medium">Crunching feedback data...</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-6">
                        <AnimatePresence>
                            {filteredFeedbacks.length === 0 ? (
                                <motion.div 
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="text-center py-24 bg-zinc-900/50 border border-dashed border-zinc-800 rounded-3xl"
                                >
                                    <AlertCircle className="w-12 h-12 text-zinc-700 mx-auto mb-4" />
                                    <p className="text-zinc-500">No feedback found matching your criteria.</p>
                                </motion.div>
                            ) : (
                                filteredFeedbacks.map((f) => (
                                    <motion.div
                                        key={f._id}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, scale: 0.95 }}
                                        className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8 hover:border-zinc-700/50 transition-all group"
                                    >
                                        <div className="flex flex-col lg:flex-row gap-8">
                                            {/* AI Info Sidebar */}
                                            <div className="lg:w-64 shrink-0 flex flex-col gap-4 border-r border-zinc-800/50 pr-8">
                                                <div className="flex items-center gap-2">
                                                    {getStatusIcon(f.status)}
                                                    <span className="text-xs font-bold uppercase tracking-widest text-zinc-300">{f.status}</span>
                                                </div>
                                                
                                                {f.aiAnalysis && (
                                                    <div className="space-y-4">
                                                        <div className={`text-[10px] font-bold px-3 py-1 rounded-full border w-fit uppercase tracking-tighter ${getSentimentColor(f.aiAnalysis.sentiment)}`}>
                                                            {f.aiAnalysis.sentiment} Sentiment
                                                        </div>
                                                        <div className="bg-zinc-800/50 p-4 rounded-2xl border border-zinc-700/50">
                                                            <div className="text-[10px] text-zinc-500 uppercase font-bold mb-2">AI Priority Score</div>
                                                            <div className="flex items-end gap-1">
                                                                <span className="text-2xl font-black text-white leading-none">{f.aiAnalysis.priorityScore}</span>
                                                                <span className="text-xs text-zinc-600 font-bold">/10</span>
                                                            </div>
                                                            <div className="w-full bg-zinc-800 h-1 rounded-full mt-3 overflow-hidden">
                                                                <div 
                                                                    className="bg-emerald-500 h-full transition-all duration-1000" 
                                                                    style={{ width: `${f.aiAnalysis.priorityScore * 10}%` }}
                                                                />
                                                            </div>
                                                        </div>
                                                        <div className="flex flex-wrap gap-2">
                                                            {f.aiAnalysis.tags.map((tag, i) => (
                                                                <span key={i} className="text-[9px] bg-zinc-800 text-zinc-400 px-2 py-1 rounded-md border border-zinc-700/50 uppercase font-bold">#{tag}</span>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Content */}
                                            <div className="flex-1 min-w-0">
                                                <div className="flex justify-between items-start mb-4">
                                                    <h3 className="text-xl font-bold truncate pr-4">{f.title}</h3>
                                                    <span className="text-[10px] text-zinc-600 font-mono shrink-0">{new Date(f.createdAt).toLocaleDateString()}</span>
                                                </div>
                                                <p className="text-zinc-400 leading-relaxed text-sm mb-6 whitespace-pre-wrap">{f.description}</p>
                                                
                                                {f.aiAnalysis?.summary && (
                                                    <div className="bg-zinc-800/30 border border-zinc-800 p-4 rounded-2xl mb-8">
                                                        <div className="text-[10px] text-emerald-500/50 uppercase font-bold mb-1 flex items-center gap-1">
                                                            <BarChart3 className="w-3 h-3" />
                                                            AI Executive Summary
                                                        </div>
                                                        <p className="text-zinc-300 text-xs italic">"{f.aiAnalysis.summary}"</p>
                                                    </div>
                                                )}

                                                <div className="flex flex-wrap items-center justify-between gap-4 pt-6 border-t border-zinc-800/50">
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-xs text-zinc-500 font-medium">Update Mode:</span>
                                                        <div className="flex gap-1">
                                                            {STATUSES.slice(1).map(s => (
                                                                <button
                                                                    key={s}
                                                                    disabled={f.status === s || isUpdating === f._id}
                                                                    onClick={() => handleUpdateStatus(f._id, s)}
                                                                    className={`text-[10px] font-bold px-3 py-1.5 rounded-lg border transition-all ${
                                                                        f.status === s 
                                                                            ? 'bg-zinc-100 text-black border-zinc-100' 
                                                                            : 'bg-zinc-800 text-zinc-500 border-zinc-700/50 hover:text-white hover:border-zinc-500'
                                                                    } disabled:opacity-50`}
                                                                >
                                                                    {isUpdating === f._id && f.status !== s ? <Loader2 className="w-3 h-3 animate-spin" /> : s}
                                                                </button>
                                                            ))}
                                                        </div>
                                                    </div>

                                                    <button 
                                                        onClick={() => handleDelete(f._id)}
                                                        className="text-red-900 group-hover:text-red-500 flex items-center gap-2 transition-colors py-2 px-4 rounded-xl hover:bg-red-500/10"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                        <span className="text-xs font-bold uppercase tracking-widest">Delete</span>
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))
                            )}
                        </AnimatePresence>
                    </div>
                )}
            </main>
        </div>
    );
}

'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, CheckCircle2, AlertCircle, Loader2, Sparkles } from 'lucide-react';

const CATEGORIES = ['Bug', 'Feature Request', 'Improvement', 'Other'];
const MIN_CHARS = 20;
const MAX_CHARS = 500;

export default function FeedbackForm() {
    const [title, setTitle] = useState('');
    const [showTitleError, setShowTitleError] = useState(false);
    const [category, setCategory] = useState(CATEGORIES[0]);
    const [description, setDescription] = useState('');
    const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
    const [errorMessage, setErrorMessage] = useState('');

    // Title validation: No numbers or symbols
    const isTitleValid = title.trim().length > 0 && /^[a-zA-Z\s]*$/.test(title);
    const isDescriptionValid = description.trim().length >= MIN_CHARS && description.length <= MAX_CHARS;
    const canSubmit = isTitleValid && isDescriptionValid && status === 'idle';

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!canSubmit) return;

        setStatus('submitting');
        setErrorMessage('');

        try {
            const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
            const response = await fetch(`${apiBaseUrl}/api/feedback`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ title, description, category }),
            });

            if (!response.ok) {
                throw new Error('Something went wrong. Please try again.');
            }

            setStatus('success');
            // Reset form after success
            setTimeout(() => {
                setStatus('idle');
                setTitle('');
                setDescription('');
                setCategory(CATEGORIES[0]);
            }, 5000);
        } catch (err: any) {
            setStatus('error');
            setErrorMessage(err.message || 'Failed to submit feedback');
        }
    };

    return (
        <div className="w-full max-w-lg mx-auto">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-zinc-900/50 backdrop-blur-xl border border-zinc-800 p-8 rounded-3xl shadow-2xl relative overflow-hidden"
            >
                {/* Subtle Glow Header */}
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent" />

                <div className="mb-8 text-center sm:text-left">
                    <h2 className="text-2xl font-bold text-white mb-2 flex items-center justify-center sm:justify-start gap-2">
                        <Sparkles className="w-6 h-6 text-emerald-400" />
                        Share Your Feedback
                    </h2>
                    <p className="text-zinc-400 text-sm">Help us grow with FeedPulse. Your feedback is analyzed by AI to prioritize improvements.</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Title Input */}
                    <div>
                        <div className="flex justify-between items-end mb-2">
                            <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wider">Title</label>
                            {showTitleError && (
                                <span className="text-[10px] text-red-500 font-bold uppercase animate-pulse">Letters only, please</span>
                            )}
                        </div>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => {
                                const val = e.target.value;
                                const filteredVal = val.replace(/[^a-zA-Z\s]/g, '');
                                
                                if (val !== filteredVal) {
                                    setShowTitleError(true);
                                    setTimeout(() => setShowTitleError(false), 2000);
                                }
                                
                                setTitle(filteredVal);
                            }}
                            placeholder="What's on your mind?"
                            disabled={status === 'submitting'}
                            className={`w-full bg-zinc-800/50 border rounded-xl px-4 py-3 focus:outline-none transition-all placeholder:text-zinc-600 ${
                                showTitleError 
                                    ? 'border-red-500/50 focus:ring-2 focus:ring-red-500/20' 
                                    : 'border-zinc-700/50 focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50'
                            }`}
                        />
                    </div>

                    {/* Category Selector */}
                    <div>
                        <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">Category</label>
                        <div className="flex flex-wrap gap-2">
                            {CATEGORIES.map((cat) => (
                                <button
                                    key={cat}
                                    type="button"
                                    onClick={() => setCategory(cat)}
                                    disabled={status === 'submitting'}
                                    className={`px-4 py-2 rounded-full text-xs font-medium transition-all ${
                                        category === cat
                                            ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20'
                                            : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-white border border-zinc-700/50'
                                    }`}
                                >
                                    {cat}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Description Textarea */}
                    <div>
                        <div className="flex justify-between items-end mb-2">
                            <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wider">Description</label>
                            <span className={`text-[10px] font-mono ${
                                description.length > 0 && description.length < MIN_CHARS || description.length > MAX_CHARS 
                                    ? 'text-red-400' 
                                    : 'text-zinc-500'
                            }`}>
                                {description.length < MIN_CHARS && description.length > 0 ? `Min ${MIN_CHARS}: ` : ''}
                                {description.length}/{MAX_CHARS}
                            </span>
                        </div>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Please provide as much detail as possible (Min 20 characters)..."
                            rows={4}
                            disabled={status === 'submitting'}
                            className={`w-full bg-zinc-800/50 border rounded-xl px-4 py-3 focus:outline-none transition-all placeholder:text-zinc-600 resize-none ${
                                description.length > 0 && description.length < MIN_CHARS
                                    ? 'border-red-500/50 focus:ring-2 focus:ring-red-500/20'
                                    : 'border-zinc-700/50 focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50'
                            }`}
                        />
                    </div>

                    {/* Submit Button & Messages */}
                    <div className="pt-2">
                        <AnimatePresence mode="wait">
                            {status === 'idle' || status === 'submitting' ? (
                                <motion.button
                                    key="submit-btn"
                                    type="submit"
                                    disabled={!canSubmit}
                                    className="w-full relative group h-12 rounded-xl bg-white text-black font-bold flex items-center justify-center gap-2 overflow-hidden hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:grayscale disabled:scale-100 transition-all shadow-xl"
                                >
                                    {status === 'submitting' ? (
                                        <div className="flex items-center gap-2">
                                            <Loader2 className="w-5 h-5 animate-spin text-emerald-600" />
                                            <span>Analyzing Feedback...</span>
                                            {/* Pulsing AI Glow effect */}
                                            <motion.div 
                                                animate={{ opacity: [0.2, 0.5, 0.2] }}
                                                transition={{ repeat: Infinity, duration: 1.5 }}
                                                className="absolute inset-0 bg-emerald-500/10 pointer-events-none" 
                                            />
                                        </div>
                                    ) : (
                                        <>
                                            <span>Send Feedback</span>
                                            <Send className="w-4 h-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                                        </>
                                    )}
                                </motion.button>
                            ) : status === 'success' ? (
                                <motion.div
                                    key="success-msg"
                                    initial={{ scale: 0.9, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    className="w-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 p-4 rounded-xl flex items-center gap-3"
                                >
                                    <CheckCircle2 className="w-6 h-6 shrink-0" />
                                    <div className="text-sm">
                                        <p className="font-bold">Sent Successfully!</p>
                                        <p className="opacity-80">Our AI magic is processing your feedback now.</p>
                                    </div>
                                </motion.div>
                            ) : (
                                <motion.div
                                    key="error-msg"
                                    initial={{ scale: 0.9, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    className="w-full bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl flex items-center gap-3"
                                >
                                    <AlertCircle className="w-6 h-6 shrink-0" />
                                    <div className="text-sm">
                                        <p className="font-bold">Submission Failed</p>
                                        <p className="opacity-80">{errorMessage}</p>
                                    </div>
                                    <button 
                                        type="button" 
                                        onClick={() => setStatus('idle')}
                                        className="ml-auto text-xs underline underline-offset-4"
                                    >
                                        Try Again
                                    </button>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </form>
            </motion.div>
        </div>
    );
}

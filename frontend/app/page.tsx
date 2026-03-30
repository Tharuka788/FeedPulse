import FeedbackForm from "@/components/FeedbackForm";

export default function Home() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white selection:bg-emerald-500/30">
      {/* Background Orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-emerald-500/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/10 blur-[120px] rounded-full" />
      </div>

      <main className="relative z-10 flex flex-col items-center justify-center min-h-screen p-6 sm:p-24">
        {/* Logo/Header Section */}
        <div className="mb-12 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-xs font-medium text-emerald-400 mb-6">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            AI-Powered Feedback System
          </div>
          
          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight mb-4 bg-clip-text text-transparent bg-gradient-to-b from-white to-zinc-500">
            FeedPulse
          </h1>
          <p className="text-zinc-500 text-lg max-w-lg mx-auto leading-relaxed">
            The heart of your product growth. Submit your ideas, report bugs, and let our AI prioritize what matters most to your users.
          </p>
        </div>

        {/* Feedback Form Card */}
        <FeedbackForm />

        {/* Footer info */}
        <footer className="mt-16 text-zinc-600 text-sm flex flex-col items-center gap-4">
          <p>© 2026 FeedPulse. Built with ❤️ for better products.</p>
          <div className="flex gap-4">
            <a href="#" className="hover:text-zinc-400 transition-colors">Documentation</a>
            <a href="#" className="hover:text-zinc-400 transition-colors">Privacy Policy</a>
          </div>
        </footer>
      </main>
    </div>
  );
}

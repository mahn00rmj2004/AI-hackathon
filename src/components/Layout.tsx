import { Link, useLocation } from "react-router";
import { Mail, BarChart3, Sparkles, ArrowLeft } from "lucide-react";

export default function Layout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const isHome = location.pathname === "/";

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50/30">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 backdrop-blur-lg bg-white/80 border-b border-slate-200/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center gap-2 group">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-200 group-hover:shadow-indigo-300 transition-shadow">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-xl bg-gradient-to-r from-violet-700 to-indigo-700 bg-clip-text text-transparent">
                OpportunityAI
              </span>
            </Link>

            <div className="flex items-center gap-2">
              {!isHome && (
                <Link
                  to="/"
                  className="flex items-center gap-2 px-4 py-2 rounded-lg text-slate-600 hover:text-violet-700 hover:bg-violet-50 transition-colors text-sm font-medium"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back
                </Link>
              )}
              <Link
                to="/"
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isHome
                    ? "bg-violet-100 text-violet-700"
                    : "text-slate-600 hover:text-violet-700 hover:bg-violet-50"
                }`}
              >
                <Mail className="w-4 h-4" />
                Analyze
              </Link>
              <Link
                to="/dashboard"
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  location.pathname === "/dashboard"
                    ? "bg-violet-100 text-violet-700"
                    : "text-slate-600 hover:text-violet-700 hover:bg-violet-50"
                }`}
              >
                <BarChart3 className="w-4 h-4" />
                Results
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
}

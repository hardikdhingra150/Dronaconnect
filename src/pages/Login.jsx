import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { loginWithEmail, signupWithEmail, loginWithGoogle } from "../firebase/auth";

export default function Login() {
  const [tab, setTab] = useState("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const navigate = useNavigate();

  const handleEmailAuth = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      if (tab === "login") {
        await loginWithEmail(email, password);
      } else {
        if (!name.trim()) { setError("Name is required"); setLoading(false); return; }
        await signupWithEmail(email, password, name);
      }
      navigate("/dashboard");
    } catch (err) {
      switch (err.code) {
        case "auth/user-not-found":
        case "auth/invalid-credential":
        case "auth/wrong-password":
          setError("Invalid email or password"); break;
        case "auth/email-already-in-use":
          setError("Email already registered — please login"); break;
        case "auth/weak-password":
          setError("Password needs at least 6 characters"); break;
        default:
          setError("Something went wrong. Try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setError("");
    setGoogleLoading(true);
    try {
      await loginWithGoogle();
      navigate("/dashboard");
    } catch (err) {
      setError(err.code || "Google sign-in failed.");
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">

      {/* ── Hero Banner ─────────────────────────────────── */}
      <div className="relative min-h-screen flex items-center justify-center overflow-hidden">

        {/* Campus Background */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `url('/DRONA.jpg')`,
          }
        }
        />

        {/* Gradient overlay — deep maroon/crimson */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#6b0f1a]/95 via-[#8b1a2a]/80 to-[#6b0f1a]/60" />

        {/* Gold shimmer top bar */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#c9a84c] via-[#f0d080] to-[#c9a84c]" />

        {/* Content */}
        <div className="relative z-10 w-full max-w-6xl mx-auto px-6 py-12 flex flex-col lg:flex-row items-center justify-between gap-12">

          {/* ── Left — College Branding ── */}
          <div className="flex-1 text-white space-y-6">

            {/* Logo + Name */}
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#c9a84c] to-[#f0d080] flex items-center justify-center shadow-2xl shadow-black/40 flex-shrink-0">
                <svg className="w-10 h-10 text-[#6b0f1a]" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 3L1 9l4 2.18v6L12 21l7-3.82v-6l2-1.09V17h2V9L12 3zm6.82 6L12 12.72 5.18 9 12 5.28 18.82 9zM17 15.99l-5 2.73-5-2.73v-3.72L12 15l5-2.73v3.72z"/>
                </svg>
              </div>
              <div>
                <h1 className="text-4xl lg:text-5xl font-black tracking-tight leading-none">
                  DRONA
                  <span className="text-[#f0d080]">CONNECT</span>
                </h1>
                <p className="text-white/60 text-sm tracking-[0.2em] uppercase mt-1">
                  Academic ERP Portal
                </p>
              </div>
            </div>

            {/* Tagline */}
            <div className="space-y-2">
              <h2 className="text-2xl lg:text-3xl font-bold text-white leading-snug">
                Your Academic Journey,<br />
                <span className="text-[#f0d080]">Seamlessly Connected.</span>
              </h2>
              <p className="text-white/60 text-base leading-relaxed max-w-md">
                Manage attendance, track performance, and stay connected with your institution — all from one unified platform.
              </p>
            </div>

            {/* Feature pills */}
            <div className="flex flex-wrap gap-2">
              {["Attendance Tracking", "Monthly Reports", "Defaulter Alerts", "Role-based Access", "Real-time Sync"].map((f) => (
                <span key={f} className="bg-white/10 border border-[#c9a84c]/30 text-white/80 text-xs px-3 py-1.5 rounded-full backdrop-blur-sm">
                  {f}
                </span>
              ))}
            </div>

            {/* Stats */}
            <div className="flex gap-6">
              {[
                { val: "3", label: "User Roles" },
                { val: "75%", label: "Min Attendance" },
                { val: "Live", label: "Real-time Data" },
              ].map((s) => (
                <div key={s.label} className="text-center">
                  <p className="text-2xl font-black text-[#f0d080]">{s.val}</p>
                  <p className="text-white/50 text-xs mt-0.5">{s.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* ── Right — Login Card ── */}
          <div className="w-full max-w-md flex-shrink-0">
            <div className="bg-white rounded-3xl shadow-2xl shadow-black/40 overflow-hidden">

              {/* Card Header */}
              <div className="bg-gradient-to-r from-[#6b0f1a] to-[#8b1a2a] px-7 py-5">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-2 h-2 rounded-full bg-[#f0d080]" />
                  <p className="text-[#f0d080] text-xs font-bold uppercase tracking-widest">
                    Secure Portal Login
                  </p>
                </div>
                <p className="text-white/60 text-xs">
                  Use your institutional credentials
                </p>
              </div>

              <div className="px-7 py-6 space-y-5">

                {/* Tabs */}
                <div className="flex bg-gray-100 rounded-xl p-1">
                  {["login", "signup"].map((t) => (
                    <button
                      key={t}
                      onClick={() => { setTab(t); setError(""); }}
                      className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all capitalize ${
                        tab === t
                          ? "bg-[#6b0f1a] text-white shadow"
                          : "text-gray-400 hover:text-gray-600"
                      }`}
                    >
                      {t === "login" ? "Sign In" : "Register"}
                    </button>
                  ))}
                </div>

                {/* Error */}
                {error && (
                  <div className="bg-red-50 border border-red-100 text-red-600 px-4 py-3 rounded-xl text-sm flex items-center gap-2">
                    <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    {error}
                  </div>
                )}

                {/* Form */}
                <form onSubmit={handleEmailAuth} className="space-y-4">
                  {tab === "signup" && (
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">
                        Full Name
                      </label>
                      <input
                        type="text"
                        placeholder="Your full name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#8b1a2a] focus:border-transparent transition"
                      />
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">
                      Email / Student ID
                    </label>
                    <div className="relative">
                      <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      <input
                        type="email"
                        placeholder="you@college.ac.in"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#8b1a2a] focus:border-transparent transition"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">
                      Password
                    </label>
                    <div className="relative">
                      <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                      <input
                        type={showPass ? "text" : "password"}
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-10 pr-12 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#8b1a2a] focus:border-transparent transition"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPass(!showPass)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-500 transition"
                      >
                        {showPass ? (
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                          </svg>
                        ) : (
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        )}
                      </button>
                    </div>
                  </div>

                  {tab === "login" && (
                    <div className="flex justify-end">
                      <button type="button" className="text-xs text-[#8b1a2a] hover:underline font-medium">
                        Forgot Password?
                      </button>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-[#6b0f1a] to-[#8b1a2a] hover:from-[#7a1020] hover:to-[#9b2030] text-white py-3 rounded-xl text-sm font-bold transition-all shadow-lg shadow-[#6b0f1a]/30 disabled:opacity-50 flex items-center justify-center gap-2 uppercase tracking-wide"
                  >
                    {loading ? (
                      <>
                        <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                        Please wait...
                      </>
                    ) : tab === "login" ? "Login →" : "Register →"}
                  </button>
                </form>

                {/* Divider */}
                <div className="flex items-center gap-3">
                  <div className="flex-1 h-px bg-gray-100" />
                  <span className="text-gray-300 text-xs uppercase tracking-widest">or</span>
                  <div className="flex-1 h-px bg-gray-100" />
                </div>

                {/* Google */}
                <button
                  onClick={handleGoogle}
                  disabled={googleLoading}
                  className="w-full flex items-center justify-center gap-3 border border-gray-200 hover:bg-gray-50 text-gray-600 py-3 rounded-xl text-sm font-medium transition disabled:opacity-50"
                >
                  {googleLoading ? (
                    <svg className="w-4 h-4 animate-spin text-gray-400" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                  )}
                  {googleLoading ? "Connecting..." : "Continue with Google"}
                </button>

                {/* Switch */}
                <p className="text-center text-sm text-gray-400">
                  {tab === "login" ? "New User? " : "Already registered? "}
                  <button
                    onClick={() => { setTab(tab === "login" ? "signup" : "login"); setError(""); }}
                    className="text-[#8b1a2a] font-bold hover:underline"
                  >
                    {tab === "login" ? "Register here" : "Sign In"}
                  </button>
                </p>
              </div>
            </div>

            {/* Bottom note */}
            <p className="text-center text-white/30 text-xs mt-4">
              © 2026 DronaConnect · Secure Academic Portal
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

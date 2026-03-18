import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../firebase/config";
import { useAuth } from "../../context/AuthContext";
import { Link } from "react-router-dom";

function CountUp({ target, suffix = "" }) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!target) return;
    let current = 0;
    const end = parseFloat(target);
    const step = Math.max(0.5, end / 40);
    const timer = setInterval(() => {
      current = Math.min(parseFloat((current + step).toFixed(1)), end);
      setCount(current);
      if (current >= end) clearInterval(timer);
    }, 30);
    return () => clearInterval(timer);
  }, [target]);
  return <span>{count}{suffix}</span>;
}

function CircleProgress({ percent }) {
  const r = 36;
  const circ = 2 * Math.PI * r;
  const safe = parseFloat(percent) >= 75;
  const offset = circ - (Math.min(parseFloat(percent), 100) / 100) * circ;
  return (
    <svg width="88" height="88" className="-rotate-90">
      <circle cx="44" cy="44" r={r} fill="none" stroke="#f3f4f6" strokeWidth="8" />
      <circle
        cx="44" cy="44" r={r} fill="none"
        stroke={safe ? "#10b981" : "#ef4444"}
        strokeWidth="8"
        strokeDasharray={circ}
        strokeDashoffset={offset}
        strokeLinecap="round"
        style={{ transition: "stroke-dashoffset 1s ease" }}
      />
    </svg>
  );
}

export default function StudentDashboard() {
  const { user, userData } = useAuth();
  const [report, setReport] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const subSnap = await getDocs(collection(db, "subjects"));
      const results = [];
      for (const subDoc of subSnap.docs) {
        const recSnap = await getDocs(collection(db, "attendance", subDoc.id, "records"));
        let present = 0, total = 0;
        recSnap.forEach((r) => {
          const data = r.data();
          if (data.students?.[user.uid] !== undefined) {
            total++;
            if (data.students[user.uid] === "present") present++;
          }
        });
        if (total > 0) {
          results.push({
            subject: subDoc.data().name,
            department: subDoc.data().department,
            present,
            total,
            absent: total - present,
            percent: ((present / total) * 100).toFixed(1),
          });
        }
      }
      setReport(results);
      setLoading(false);
    };
    fetchData();
  }, [user]);

  const overallPercent = report.length
    ? (report.reduce((a, r) => a + parseFloat(r.percent), 0) / report.length).toFixed(1)
    : 0;
  const safe = report.filter((r) => parseFloat(r.percent) >= 75).length;
  const atRisk = report.filter((r) => parseFloat(r.percent) < 75).length;
  const totalPresent = report.reduce((a, r) => a + r.present, 0);
  const totalClasses = report.reduce((a, r) => a + r.total, 0);

  const overallSafe = parseFloat(overallPercent) >= 75;

  return (
    <div className="min-h-full bg-[#f5f6fa]">

      {/* ── Hero Header ── */}
      <div className="relative bg-gradient-to-br from-[#6b0f1a] via-[#7a1222] to-[#4a0a12] px-8 py-8 overflow-hidden">
        <div className="absolute -right-10 -top-10 w-56 h-56 rounded-full bg-white/5" />
        <div className="absolute right-32 -bottom-8 w-36 h-36 rounded-full bg-[#f0d080]/10 translate-y-1/2" />
        <div className="absolute inset-0 bg-cover bg-center opacity-10 mix-blend-overlay"
          style={{ backgroundImage: "url('/campus.jpg')" }} />

        <div className="relative z-10 flex items-center justify-between flex-wrap gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-1.5 h-4 bg-[#f0d080] rounded-full" />
              <span className="text-[#f0d080] text-xs font-bold uppercase tracking-[0.2em]">
                Student Portal
              </span>
            </div>
            <h1 className="text-3xl font-black text-white leading-tight">
              Welcome, {userData?.name?.split(" ")[0]} 🎓
            </h1>
            <div className="flex items-center gap-3 mt-1 flex-wrap">
              {userData?.rollNo && (
                <span className="text-white/50 text-sm flex items-center gap-1">
                  🪪 {userData.rollNo}
                </span>
              )}
              {userData?.department && (
                <span className="text-white/50 text-sm flex items-center gap-1">
                  🏛️ {userData.department}
                </span>
              )}
              <span className="text-white/50 text-sm">
                📅 {new Date().toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
              </span>
            </div>
          </div>
          <Link
            to="/profile"
            className="flex items-center gap-2 bg-white/15 hover:bg-white/25 border border-white/20 text-white font-bold text-sm px-4 py-2.5 rounded-xl transition-all duration-200 backdrop-blur-sm"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            My Profile
          </Link>
        </div>
      </div>

      <div className="p-8 space-y-8">

        {/* ── Overall Summary ── */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-5">

          {/* Big Overall Card */}
          <div className={`lg:col-span-1 relative overflow-hidden rounded-2xl p-6 shadow-lg hover:-translate-y-1 transition-all duration-300 ${overallSafe ? "bg-gradient-to-br from-emerald-500 to-teal-600 shadow-emerald-200" : "bg-gradient-to-br from-red-500 to-rose-600 shadow-red-200"}`}>
            <div className="absolute -right-6 -top-6 w-28 h-28 rounded-full bg-white/10" />
            <div className="absolute -right-2 -bottom-8 w-20 h-20 rounded-full bg-white/10" />
            <div className="relative z-10 text-center">
              <p className="text-white/70 text-xs font-bold uppercase tracking-widest mb-3">Overall</p>
              <div className="relative inline-flex items-center justify-center mb-2">
                <CircleProgress percent={overallPercent} />
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-white font-black text-lg">{overallPercent}%</span>
                </div>
              </div>
              <p className="text-white/60 text-xs">Avg across all subjects</p>
              <div className={`mt-3 inline-block px-3 py-1 rounded-full text-xs font-black ${overallSafe ? "bg-white/20 text-white" : "bg-white/20 text-white"}`}>
                {overallSafe ? "✅ On Track" : "⚠️ At Risk"}
              </div>
            </div>
          </div>

          {/* Other Stats */}
          <div className="lg:col-span-3 grid grid-cols-3 gap-5">
            {[
              {
                title: "Safe Subjects",
                value: safe,
                sub: "Above 75%",
                gradient: "from-indigo-500 to-violet-600",
                shadow: "shadow-indigo-200",
                icon: "🛡️",
              },
              {
                title: "At Risk",
                value: atRisk,
                sub: "Below 75%",
                gradient: atRisk > 0 ? "from-red-500 to-rose-600" : "from-gray-400 to-gray-500",
                shadow: atRisk > 0 ? "shadow-red-200" : "shadow-gray-200",
                icon: "⚠️",
              },
              {
                title: "Classes Attended",
                value: totalPresent,
                sub: `Out of ${totalClasses} total`,
                gradient: "from-amber-500 to-orange-500",
                shadow: "shadow-amber-200",
                icon: "🏫",
              },
            ].map((card) => (
              <div
                key={card.title}
                className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${card.gradient} p-5 shadow-lg ${card.shadow} hover:-translate-y-1 hover:shadow-xl transition-all duration-300 cursor-default`}
              >
                <div className="absolute -right-4 -top-4 w-20 h-20 rounded-full bg-white/10" />
                <div className="relative z-10">
                  <span className="text-2xl">{card.icon}</span>
                  <p className="text-3xl font-black text-white mt-2">
                    {card.value}
                  </p>
                  <p className="text-white/70 text-xs font-bold uppercase tracking-widest mt-1">{card.title}</p>
                  <p className="text-white/50 text-[11px] mt-0.5">{card.sub}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Subject Table ── */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-gray-50 to-white">
            <div className="flex items-center gap-2.5">
              <div className="w-1 h-5 bg-[#6b0f1a] rounded-full" />
              <h2 className="font-bold text-gray-900 text-sm">Subject-wise Attendance</h2>
              <span className="bg-gray-100 text-gray-500 text-xs font-semibold px-2 py-0.5 rounded-full">
                {report.length} subjects
              </span>
            </div>
          </div>

          {loading ? (
            <div className="py-16 text-center">
              <div className="w-10 h-10 border-4 border-[#6b0f1a]/20 border-t-[#6b0f1a] rounded-full animate-spin mx-auto" />
              <p className="text-gray-400 text-sm mt-3">Loading attendance data...</p>
            </div>
          ) : report.length === 0 ? (
            <div className="py-16 text-center">
              <div className="text-5xl mb-3">📋</div>
              <p className="text-gray-500 font-semibold">No attendance records yet</p>
              <p className="text-gray-400 text-sm mt-1">Your teacher hasn't marked attendance yet</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {report.map((r, i) => {
                const pct = parseFloat(r.percent);
                const isSafe = pct >= 75;
                return (
                  <div
                    key={i}
                    className={`px-6 py-4 flex items-center gap-4 hover:bg-gray-50/70 transition-colors group ${!isSafe ? "bg-red-50/20" : ""}`}
                  >
                    {/* Subject Icon */}
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${isSafe ? "bg-gradient-to-br from-indigo-500 to-violet-600" : "bg-gradient-to-br from-red-500 to-rose-600"}`}>
                      <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                      </svg>
                    </div>

                    {/* Subject Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-bold text-gray-900 text-sm group-hover:text-[#6b0f1a] transition-colors truncate">
                          {r.subject}
                        </p>
                        {r.department && (
                          <span className="text-[10px] bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full font-semibold flex-shrink-0">
                            {r.department}
                          </span>
                        )}
                      </div>
                      {/* Progress bar */}
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-gray-100 rounded-full h-2 overflow-hidden">
                          <div
                            className={`h-2 rounded-full transition-all duration-1000 ${isSafe ? "bg-gradient-to-r from-emerald-400 to-teal-500" : "bg-gradient-to-r from-red-400 to-rose-500"}`}
                            style={{ width: `${Math.min(pct, 100)}%` }}
                          />
                        </div>
                        <span className={`text-xs font-black w-10 text-right flex-shrink-0 ${isSafe ? "text-emerald-600" : "text-red-600"}`}>
                          {r.percent}%
                        </span>
                      </div>
                    </div>

                    {/* Stats */}
                    <div className="hidden md:flex items-center gap-4 flex-shrink-0">
                      <div className="text-center">
                        <p className="text-sm font-black text-gray-800">{r.present}</p>
                        <p className="text-[10px] text-gray-400 uppercase tracking-wide">Present</p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm font-black text-gray-800">{r.absent}</p>
                        <p className="text-[10px] text-gray-400 uppercase tracking-wide">Absent</p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm font-black text-gray-800">{r.total}</p>
                        <p className="text-[10px] text-gray-400 uppercase tracking-wide">Total</p>
                      </div>
                    </div>

                    {/* Status badge */}
                    <span className={`px-3 py-1.5 rounded-full text-xs font-black flex-shrink-0 ${isSafe ? "bg-emerald-100 text-emerald-700 border border-emerald-200" : "bg-red-100 text-red-700 border border-red-200"}`}>
                      {isSafe ? "✅ Safe" : "⚠️ Low"}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* ── At Risk Warning ── */}
        {atRisk > 0 && (
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-red-500 to-rose-600 p-6 shadow-lg shadow-red-200">
            <div className="absolute -right-6 -top-6 w-32 h-32 rounded-full bg-white/10" />
            <div className="relative z-10 flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center flex-shrink-0 text-2xl">
                🚨
              </div>
              <div className="flex-1">
                <h3 className="text-white font-black text-lg">
                  You're at risk in {atRisk} subject{atRisk > 1 ? "s" : ""}!
                </h3>
                <p className="text-white/70 text-sm mt-1">
                  You need minimum 75% attendance to appear in exams. Contact your subject teacher immediately and try to attend all upcoming classes.
                </p>
              </div>
              <Link
                to="/profile"
                className="flex-shrink-0 bg-white/20 hover:bg-white/30 border border-white/20 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-all backdrop-blur-sm"
              >
                Contact Info →
              </Link>
            </div>
          </div>
        )}

        {/* ── All Clear Banner ── */}
        {!loading && report.length > 0 && atRisk === 0 && (
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 p-6 shadow-lg shadow-emerald-200">
            <div className="absolute -right-6 -top-6 w-32 h-32 rounded-full bg-white/10" />
            <div className="relative z-10 flex items-center gap-4">
              <div className="text-4xl">🎉</div>
              <div>
                <h3 className="text-white font-black text-lg">You're all clear!</h3>
                <p className="text-white/70 text-sm mt-0.5">
                  All subjects above 75%. Keep it up and never miss a class!
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ── Campus Banner ── */}
        <div className="relative rounded-2xl overflow-hidden shadow-lg">
          <div className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: "url('/campus.jpg')" }} />
          <div className="absolute inset-0 bg-gradient-to-r from-[#6b0f1a]/95 via-[#6b0f1a]/80 to-[#6b0f1a]/30" />
          <div className="relative z-10 px-8 py-6 flex items-center justify-between flex-wrap gap-4">
            <div>
              <p className="text-[#f0d080] text-xs font-bold uppercase tracking-[0.2em] mb-1">
                Dronacharya College of Engineering
              </p>
              <h3 className="text-white text-xl font-black">Your future starts here 🚀</h3>
              <p className="text-white/50 text-sm mt-1">Sector 43, Gurugram · NAAC Accredited</p>
            </div>
            <div className="flex gap-3">
              {[{ val: "75%", label: "Min Attendance" }, { val: "A+", label: "NAAC Grade" }, { val: "2003", label: "Est." }].map((s) => (
                <div key={s.label} className="bg-white/10 backdrop-blur-sm rounded-xl px-4 py-3 border border-white/15 text-center">
                  <p className="text-[#f0d080] font-black text-lg">{s.val}</p>
                  <p className="text-white/50 text-[10px] uppercase tracking-wide mt-0.5">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

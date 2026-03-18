import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../firebase/config";
import { useAuth } from "../../context/AuthContext";
import { Link } from "react-router-dom";

function CountUp({ target }) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!target) return;
    let current = 0;
    const step = Math.max(1, Math.floor(target / 30));
    const timer = setInterval(() => {
      current = Math.min(current + step, target);
      setCount(current);
      if (current >= target) clearInterval(timer);
    }, 40);
    return () => clearInterval(timer);
  }, [target]);
  return <span>{count}</span>;
}

export default function TeacherDashboard() {
  const { user, userData } = useAuth();
  const [subjects, setSubjects] = useState([]);
  const [totalStudents, setTotalStudents] = useState(0);
  const [attendanceCount, setAttendanceCount] = useState(0);
  const [loaded, setLoaded] = useState(false);

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return "Good morning";
    if (h < 17) return "Good afternoon";
    return "Good evening";
  };

  useEffect(() => {
    const fetchData = async () => {
      const subSnap = await getDocs(collection(db, "subjects"));
      const mySubjects = subSnap.docs
        .map((d) => ({ id: d.id, ...d.data() }))
        .filter((s) => s.teacherId === user.uid);
      setSubjects(mySubjects);

      const usersSnap = await getDocs(collection(db, "users"));
      let students = 0;
      usersSnap.forEach((d) => { if (d.data().role === "student") students++; });
      setTotalStudents(students);

      let totalRecords = 0;
      for (const sub of mySubjects) {
        const recSnap = await getDocs(collection(db, "attendance", sub.id, "records"));
        totalRecords += recSnap.size;
      }
      setAttendanceCount(totalRecords);
      setLoaded(true);
    };
    fetchData();
  }, [user]);

  const statCards = [
    {
      title: "My Subjects",
      value: subjects.length,
      sub: "Assigned to you",
      gradient: "from-[#6b0f1a] to-[#9b2030]",
      shadow: "shadow-red-200",
      icon: (
        <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
      ),
    },
    {
      title: "Total Students",
      value: totalStudents,
      sub: "In your college",
      gradient: "from-indigo-500 to-violet-600",
      shadow: "shadow-indigo-200",
      icon: (
        <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
    },
    {
      title: "Classes Taken",
      value: attendanceCount,
      sub: "Attendance records",
      gradient: "from-emerald-500 to-teal-600",
      shadow: "shadow-emerald-200",
      icon: (
        <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
        </svg>
      ),
    },
  ];

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
                Faculty Portal
              </span>
            </div>
            <h1 className="text-3xl font-black text-white leading-tight">
              {greeting()}, {userData?.name?.split(" ")[0]} 👋
            </h1>
            <p className="text-white/50 text-sm mt-1">
              {new Date().toLocaleDateString("en-IN", {
                weekday: "long", year: "numeric", month: "long", day: "numeric",
              })}
            </p>
          </div>
          <Link
            to="/mark-attendance"
            className="flex items-center gap-2 bg-[#f0d080] hover:bg-[#f5dd6a] text-[#6b0f1a] font-black text-sm px-5 py-3 rounded-xl transition-all duration-200 shadow-lg hover:-translate-y-0.5 hover:shadow-xl"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
            </svg>
            Mark Attendance
          </Link>
        </div>
      </div>

      <div className="p-8 space-y-8">

        {/* ── Stat Cards ── */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          {statCards.map((card) => (
            <div
              key={card.title}
              className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${card.gradient} p-6 shadow-lg ${card.shadow} hover:-translate-y-1 hover:shadow-xl transition-all duration-300 cursor-default`}
            >
              <div className="absolute -right-6 -top-6 w-28 h-28 rounded-full bg-white/10" />
              <div className="absolute -right-2 -bottom-8 w-20 h-20 rounded-full bg-white/10" />
              <div className="relative z-10 flex items-start justify-between">
                <div>
                  <p className="text-white/70 text-xs font-bold uppercase tracking-widest mb-2">{card.title}</p>
                  <p className="text-4xl font-black text-white">
                    {loaded ? <CountUp target={card.value} /> : "0"}
                  </p>
                  <p className="text-white/50 text-xs mt-1.5">{card.sub}</p>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center flex-shrink-0">
                  {card.icon}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* ── My Subjects ── */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-gray-50 to-white">
            <div className="flex items-center gap-2.5">
              <div className="w-1 h-5 bg-[#6b0f1a] rounded-full" />
              <h2 className="font-bold text-gray-900 text-sm">My Subjects</h2>
              <span className="bg-gray-100 text-gray-500 text-xs font-semibold px-2 py-0.5 rounded-full">
                {subjects.length}
              </span>
            </div>
            <Link to="/mark-attendance" className="text-[#8b1a2a] text-xs font-bold hover:underline flex items-center gap-1">
              Mark attendance
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>

          {subjects.length === 0 ? (
            <div className="py-16 text-center">
              <div className="text-5xl mb-3">📚</div>
              <p className="text-gray-500 font-semibold">No subjects assigned yet</p>
              <p className="text-gray-400 text-sm mt-1">Contact your admin to assign subjects</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 p-5">
              {subjects.map((s, i) => (
                <div
                  key={s.id}
                  className="group relative overflow-hidden rounded-2xl border border-gray-100 hover:border-[#6b0f1a]/20 hover:shadow-md transition-all duration-200 bg-gradient-to-br from-white to-gray-50 p-5 cursor-default hover:-translate-y-0.5"
                >
                  <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-[#6b0f1a] to-[#9b2030] rounded-l-2xl" />
                  <div className="flex items-start justify-between mb-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#6b0f1a] to-[#9b2030] flex items-center justify-center shadow-sm">
                      <svg className="w-5 h-5 text-[#f0d080]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                      </svg>
                    </div>
                    <span className="text-xs bg-indigo-50 text-indigo-600 font-semibold px-2 py-0.5 rounded-full border border-indigo-100">
                      {s.department || "General"}
                    </span>
                  </div>
                  <p className="font-bold text-gray-900 text-sm mb-1 group-hover:text-[#6b0f1a] transition-colors">
                    {s.name}
                  </p>
                  <p className="text-xs text-gray-400 mb-4">{s.department || "No department"}</p>
                  <Link
                    to="/mark-attendance"
                    className="w-full flex items-center justify-center gap-1.5 bg-[#6b0f1a] hover:bg-[#8b1a2a] text-white text-xs font-bold py-2 rounded-xl transition-all duration-200"
                  >
                    Mark Attendance →
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── Bottom Row ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* Quick Actions */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white flex items-center gap-2.5">
              <div className="w-1 h-5 bg-[#6b0f1a] rounded-full" />
              <h2 className="font-bold text-gray-900 text-sm">Quick Actions</h2>
            </div>
            <div className="p-4 grid grid-cols-2 gap-2.5">
              {[
                { label: "Mark Attendance", sub: "Record today's class", to: "/mark-attendance", emoji: "✅", color: "bg-emerald-50 border-emerald-100 hover:border-emerald-300" },
                { label: "View Defaulters", sub: "Below 75%", to: "/defaulters", emoji: "⚠️", color: "bg-amber-50 border-amber-100 hover:border-amber-300" },
                { label: "Monthly Report", sub: "Export CSV", to: "/mark-attendance", emoji: "📊", color: "bg-blue-50 border-blue-100 hover:border-blue-300" },
                { label: "My Profile", sub: "Update info", to: "/profile", emoji: "👤", color: "bg-red-50 border-red-100 hover:border-red-300" },
              ].map((a) => (
                <Link
                  key={a.label}
                  to={a.to}
                  className={`flex flex-col items-center gap-2 p-3.5 rounded-xl border ${a.color} transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md group text-center`}
                >
                  <span className="text-2xl group-hover:scale-110 transition-transform duration-200">{a.emoji}</span>
                  <div>
                    <p className="text-xs font-bold text-gray-700 leading-tight">{a.label}</p>
                    <p className="text-[10px] text-gray-400 mt-0.5">{a.sub}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Reminder Banner */}
          <div className="relative overflow-hidden rounded-2xl shadow-sm">
            <div className="absolute inset-0 bg-cover bg-center"
              style={{ backgroundImage: "url('/campus.jpg')" }} />
            <div className="absolute inset-0 bg-gradient-to-br from-[#6b0f1a]/95 to-[#6b0f1a]/75" />
            <div className="relative z-10 p-6 h-full flex flex-col justify-between">
              <div>
                <p className="text-[#f0d080] text-xs font-bold uppercase tracking-widest mb-2">
                  Daily Reminder
                </p>
                <h3 className="text-white text-xl font-black leading-tight mb-2">
                  Did you mark attendance today?
                </h3>
                <p className="text-white/60 text-sm leading-relaxed">
                  Keeping attendance updated ensures students are aware of their progress and helps avoid defaulter issues at month end.
                </p>
              </div>
              <Link
                to="/mark-attendance"
                className="mt-4 self-start flex items-center gap-2 bg-white/15 hover:bg-white/25 border border-white/20 text-white text-sm font-bold px-4 py-2.5 rounded-xl transition-all duration-200 backdrop-blur-sm"
              >
                Mark Now →
              </Link>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../firebase/config";
import { Link } from "react-router-dom";

const roleColor = (role) => {
  if (role === "admin") return "bg-violet-100 text-violet-600 border border-violet-200";
  if (role === "teacher") return "bg-blue-100 text-blue-600 border border-blue-200";
  return "bg-emerald-100 text-emerald-700 border border-emerald-200";
};

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

export default function AdminDashboard() {
  const [stats, setStats] = useState({ students: 0, teachers: 0, subjects: 0, admins: 0 });
  const [recentUsers, setRecentUsers] = useState([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      const usersSnap = await getDocs(collection(db, "users"));
      const subSnap = await getDocs(collection(db, "subjects"));
      let students = 0, teachers = 0, admins = 0;
      const users = [];
      usersSnap.forEach((d) => {
        const data = { id: d.id, ...d.data() };
        users.push(data);
        if (data.role === "student") students++;
        else if (data.role === "teacher") teachers++;
        else if (data.role === "admin") admins++;
      });
      setStats({ students, teachers, subjects: subSnap.size, admins });
      setRecentUsers(users.slice(0, 6));
      setLoaded(true);
    };
    fetchData();
  }, []);

  const statCards = [
    {
      title: "Students",
      value: stats.students,
      sub: "Total enrolled",
      gradient: "from-indigo-500 to-violet-600",
      shadow: "shadow-indigo-200",
      icon: (
        <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
    },
    {
      title: "Teachers",
      value: stats.teachers,
      sub: "Active faculty",
      gradient: "from-[#6b0f1a] to-[#9b2030]",
      shadow: "shadow-red-200",
      icon: (
        <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      ),
    },
    {
      title: "Subjects",
      value: stats.subjects,
      sub: "All departments",
      gradient: "from-sky-500 to-blue-600",
      shadow: "shadow-blue-200",
      icon: (
        <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
      ),
    },
    {
      title: "Admins",
      value: stats.admins,
      sub: "System managers",
      gradient: "from-amber-500 to-orange-600",
      shadow: "shadow-amber-200",
      icon: (
        <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      ),
    },
  ];

  const quickActions = [
    { label: "Add New Teacher", sub: "Create teacher account", to: "/admin", emoji: "👨‍🏫", color: "bg-violet-50 border-violet-100 hover:border-violet-300" },
    { label: "Add New Student", sub: "Enroll a student", to: "/admin", emoji: "🎓", color: "bg-red-50 border-red-100 hover:border-red-300" },
    { label: "Create Subject", sub: "Add a new subject", to: "/admin", emoji: "📚", color: "bg-blue-50 border-blue-100 hover:border-blue-300" },
    { label: "Mark Attendance", sub: "Record today's class", to: "/mark-attendance", emoji: "✅", color: "bg-emerald-50 border-emerald-100 hover:border-emerald-300" },
    { label: "View Defaulters", sub: "Students below 75%", to: "/defaulters", emoji: "⚠️", color: "bg-amber-50 border-amber-100 hover:border-amber-300" },
    { label: "Analytics", sub: "View attendance trends", to: "/analytics", emoji: "📊", color: "bg-indigo-50 border-indigo-100 hover:border-indigo-300" },
  ];

  return (
    <div className="min-h-full bg-[#f5f6fa]">

      {/* ── Hero Header ── */}
      <div className="relative bg-gradient-to-br from-[#6b0f1a] via-[#7a1222] to-[#4a0a12] px-8 py-8 overflow-hidden">
        {/* Decorative blobs */}
        <div className="absolute right-0 top-0 w-64 h-64 rounded-full bg-white/5 -translate-y-1/2 translate-x-1/4" />
        <div className="absolute right-32 bottom-0 w-32 h-32 rounded-full bg-[#f0d080]/10 translate-y-1/2" />
        <div className="absolute left-1/3 top-0 w-20 h-20 rounded-full bg-white/5" />
        {/* Campus bg faint */}
        <div
          className="absolute inset-0 bg-cover bg-center opacity-10 mix-blend-overlay"
          style={{ backgroundImage: "url('/campus.jpg')" }}
        />
        <div className="relative z-10 flex items-center justify-between flex-wrap gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-1.5 h-4 bg-[#f0d080] rounded-full" />
              <span className="text-[#f0d080] text-xs font-bold uppercase tracking-[0.2em]">Admin Dashboard</span>
            </div>
            <h1 className="text-3xl font-black text-white leading-tight">
              Welcome back, Admin 👋
            </h1>
            <p className="text-white/50 text-sm mt-1">
              {new Date().toLocaleDateString("en-IN", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
            </p>
          </div>
          <Link
            to="/admin"
            className="flex items-center gap-2 bg-[#f0d080] hover:bg-[#f5dd6a] text-[#6b0f1a] font-black text-sm px-5 py-3 rounded-xl transition-all duration-200 shadow-lg hover:-translate-y-0.5 hover:shadow-xl"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            Add User
          </Link>
        </div>
      </div>

      <div className="p-8 space-y-8">

        {/* ── Stat Cards ── */}
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-5">
          {statCards.map((card) => (
            <div
              key={card.title}
              className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${card.gradient} p-6 shadow-lg ${card.shadow} hover:-translate-y-1 hover:shadow-xl transition-all duration-300 cursor-default`}
            >
              {/* Decorative rings */}
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
                <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center flex-shrink-0">
                  {card.icon}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* ── Middle Row ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Recent Users Table */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-gray-50 to-white">
              <div className="flex items-center gap-2.5">
                <div className="w-1 h-5 bg-[#6b0f1a] rounded-full" />
                <h2 className="font-bold text-gray-900 text-sm">Recent Users</h2>
                <span className="bg-gray-100 text-gray-500 text-xs font-semibold px-2 py-0.5 rounded-full">
                  {recentUsers.length}
                </span>
              </div>
              <Link to="/admin" className="text-[#8b1a2a] text-xs font-bold hover:underline flex items-center gap-1">
                View all
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>

            {recentUsers.length === 0 ? (
              <div className="py-16 text-center">
                <div className="text-4xl mb-3">👥</div>
                <p className="text-gray-500 font-semibold">No users yet</p>
                <p className="text-gray-400 text-sm mt-1">Go to Admin Panel to add users</p>
              </div>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="text-left px-6 py-3 text-xs font-bold text-gray-400 uppercase tracking-widest">Name</th>
                    <th className="text-left px-6 py-3 text-xs font-bold text-gray-400 uppercase tracking-widest hidden md:table-cell">Email</th>
                    <th className="px-6 py-3 text-xs font-bold text-gray-400 uppercase tracking-widest text-center">Role</th>
                  </tr>
                </thead>
                <tbody>
                  {recentUsers.map((u, i) => (
                    <tr key={u.id} className="border-t border-gray-50 hover:bg-[#6b0f1a]/[0.02] transition-colors group">
                      <td className="px-6 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#6b0f1a] to-[#9b2030] flex items-center justify-center text-[#f0d080] font-black text-xs flex-shrink-0">
                            {u.name?.charAt(0)?.toUpperCase() || "U"}
                          </div>
                          <div>
                            <p className="font-semibold text-gray-800 group-hover:text-[#6b0f1a] transition-colors text-sm">
                              {u.name}
                            </p>
                            {u.rollNo && <p className="text-xs text-gray-400">{u.rollNo}</p>}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-3.5 text-gray-400 text-xs hidden md:table-cell">{u.email}</td>
                      <td className="px-6 py-3.5 text-center">
                        <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold capitalize ${roleColor(u.role)}`}>
                          {u.role}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white flex items-center gap-2.5">
              <div className="w-1 h-5 bg-[#6b0f1a] rounded-full" />
              <h2 className="font-bold text-gray-900 text-sm">Quick Actions</h2>
            </div>
            <div className="p-4 grid grid-cols-2 gap-2.5">
              {quickActions.map((a) => (
                <Link
                  key={a.label}
                  to={a.to}
                  className={`flex flex-col items-center gap-2 p-3.5 rounded-xl border ${a.color} transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md group text-center`}
                >
                  <span className="text-2xl group-hover:scale-110 transition-transform duration-200">
                    {a.emoji}
                  </span>
                  <div>
                    <p className="text-xs font-bold text-gray-700 leading-tight">{a.label}</p>
                    <p className="text-[10px] text-gray-400 mt-0.5 leading-tight">{a.sub}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* ── Bottom Campus Banner ── */}
        <div className="relative rounded-2xl overflow-hidden shadow-lg">
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: "url('/campus.jpg')" }}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#6b0f1a]/95 via-[#6b0f1a]/80 to-[#6b0f1a]/30" />
          <div className="relative z-10 px-8 py-7 flex items-center justify-between flex-wrap gap-6">
            <div>
              <p className="text-[#f0d080] text-xs font-bold uppercase tracking-[0.2em] mb-1">
                Dronacharya College of Engineering
              </p>
              <h3 className="text-white text-2xl font-black leading-tight">
                Shaping Engineers,<br />Building Tomorrow.
              </h3>
              <p className="text-white/50 text-sm mt-2 flex items-center gap-1.5">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Sector 43, Gurugram, Haryana — NAAC Accredited
              </p>
            </div>
            <div className="flex gap-3 flex-wrap">
              {[
                { val: "2003", label: "Est. Year" },
                { val: "20+", label: "Years Legacy" },
                { val: "5000+", label: "Alumni" },
                { val: "50+", label: "Faculty" },
              ].map((s) => (
                <div key={s.label} className="bg-white/10 backdrop-blur-sm rounded-xl px-4 py-3 border border-white/15 text-center min-w-[70px]">
                  <p className="text-[#f0d080] font-black text-xl">{s.val}</p>
                  <p className="text-white/50 text-[10px] uppercase tracking-wide mt-0.5">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── System Status Bar ── */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-6 py-4 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-sm font-semibold text-gray-700">System Status</span>
            <span className="text-xs text-emerald-600 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-full font-semibold">
              All Systems Operational
            </span>
          </div>
          <div className="flex gap-6">
            {[
              { label: "Firebase", status: "Online", color: "text-emerald-500" },
              { label: "Firestore", status: "Online", color: "text-emerald-500" },
              { label: "Auth", status: "Online", color: "text-emerald-500" },
              { label: "Hosting", status: "Online", color: "text-emerald-500" },
            ].map((s) => (
              <div key={s.label} className="flex items-center gap-1.5">
                <div className={`w-1.5 h-1.5 rounded-full bg-emerald-500`} />
                <span className="text-xs text-gray-400">{s.label}</span>
                <span className={`text-xs font-semibold ${s.color}`}>{s.status}</span>
              </div>
            ))}
          </div>
          <p className="text-xs text-gray-400">
            Last updated: {new Date().toLocaleTimeString("en-IN")}
          </p>
        </div>

      </div>
    </div>
  );
}

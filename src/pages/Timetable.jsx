import { useEffect, useState } from "react";
import { collection, getDocs, addDoc, deleteDoc, doc, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase/config";
import { useAuth } from "../context/AuthContext";

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const PERIODS = ["9:00–10:00", "10:00–11:00", "11:00–12:00", "12:00–1:00", "1:00–2:00 (Break)", "2:00–3:00", "3:00–4:00", "4:00–5:00"];
const COLORS = [
  "bg-indigo-100 text-indigo-700 border-indigo-200",
  "bg-[#6b0f1a]/10 text-[#6b0f1a] border-[#6b0f1a]/20",
  "bg-emerald-100 text-emerald-700 border-emerald-200",
  "bg-amber-100 text-amber-700 border-amber-200",
  "bg-sky-100 text-sky-700 border-sky-200",
  "bg-violet-100 text-violet-700 border-violet-200",
  "bg-pink-100 text-pink-700 border-pink-200",
  "bg-teal-100 text-teal-700 border-teal-200",
];

export default function Timetable() {
  const { user, userData } = useAuth();
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ day: "Monday", period: "9:00–10:00", subject: "", teacher: "", room: "", classGroup: "" });
  const [msg, setMsg] = useState("");
  const [subjects, setSubjects] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [filterClass, setFilterClass] = useState("all");

  const isAdmin = userData?.role === "admin";
  const today = new Date().toLocaleDateString("en-IN", { weekday: "long" });

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    setLoading(true);
    const [ttSnap, subSnap, userSnap] = await Promise.all([
      getDocs(collection(db, "timetable")),
      getDocs(collection(db, "subjects")),
      getDocs(collection(db, "users")),
    ]);
    setEntries(ttSnap.docs.map(d => ({ id: d.id, ...d.data() })));
    setSubjects(subSnap.docs.map(d => ({ id: d.id, ...d.data() })));
    setTeachers(userSnap.docs.map(d => ({ id: d.id, ...d.data() })).filter(u => u.role === "teacher"));
    setLoading(false);
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    await addDoc(collection(db, "timetable"), { ...form, createdAt: serverTimestamp(), addedBy: user.uid });
    setMsg("✅ Timetable entry added!");
    setForm({ day: "Monday", period: "9:00–10:00", subject: "", teacher: "", room: "", classGroup: form.classGroup });
    setShowForm(false);
    fetchAll();
    setTimeout(() => setMsg(""), 3000);
  };

  const handleDelete = async (id) => {
    await deleteDoc(doc(db, "timetable", id));
    fetchAll();
  };

  // Get unique class groups
  const classGroups = ["all", ...new Set(entries.map(e => e.classGroup).filter(Boolean))];

  // Filter entries
  const filtered = entries.filter(e => filterClass === "all" || e.classGroup === filterClass);

  // Build timetable grid: { day: { period: entry } }
  const grid = {};
  DAYS.forEach(d => { grid[d] = {}; });
  filtered.forEach(entry => {
    if (!grid[entry.day]) grid[entry.day] = {};
    grid[entry.day][entry.period] = entry;
  });

  // Color map for subjects
  const subjectColors = {};
  [...new Set(entries.map(e => e.subject))].forEach((sub, i) => {
    subjectColors[sub] = COLORS[i % COLORS.length];
  });

  return (
    <div className="min-h-full bg-[#f5f6fa]">

      {/* Hero */}
      <div className="relative bg-gradient-to-br from-[#6b0f1a] via-[#7a1222] to-[#4a0a12] px-8 py-8 overflow-hidden">
        <div className="absolute -right-10 -top-10 w-56 h-56 rounded-full bg-white/5" />
        <div className="absolute inset-0 bg-cover bg-center opacity-10 mix-blend-overlay"
          style={{ backgroundImage: "url('/campus.jpg')" }} />
        <div className="relative z-10 flex items-center justify-between flex-wrap gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-1.5 h-4 bg-[#f0d080] rounded-full" />
              <span className="text-[#f0d080] text-xs font-bold uppercase tracking-[0.2em]">Class Schedule</span>
            </div>
            <h1 className="text-3xl font-black text-white">Timetable 📅</h1>
            <p className="text-white/50 text-sm mt-1">Weekly class schedule by group</p>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl px-4 py-2.5 border border-white/15">
              <p className="text-[#f0d080] text-xs font-bold uppercase tracking-widest">Today</p>
              <p className="text-white font-black text-sm">{today}</p>
            </div>
            {isAdmin && (
              <button onClick={() => setShowForm(!showForm)}
                className="flex items-center gap-2 bg-[#f0d080] hover:bg-[#f5dd6a] text-[#6b0f1a] font-black text-sm px-5 py-2.5 rounded-xl transition shadow-lg hover:-translate-y-0.5">
                {showForm ? "✕ Cancel" : "➕ Add Entry"}
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="p-8 space-y-6">
        {msg && <div className="bg-emerald-50 border border-emerald-100 text-emerald-700 px-4 py-3 rounded-xl text-sm font-medium">{msg}</div>}

        {/* Add Form */}
        {showForm && isAdmin && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="bg-gradient-to-r from-[#6b0f1a] to-[#9b2030] px-6 py-4">
              <h3 className="text-white font-black">Add Timetable Entry</h3>
            </div>
            <form onSubmit={handleAdd} className="p-6 grid grid-cols-2 md:grid-cols-3 gap-4">
              {[
                { label: "Class / Group", key: "classGroup", type: "text", placeholder: "CSE-3A" },
                { label: "Day", key: "day", type: "select", options: DAYS },
                { label: "Period", key: "period", type: "select", options: PERIODS },
                { label: "Subject", key: "subject", type: "text", placeholder: "Data Structures" },
                { label: "Teacher", key: "teacher", type: "text", placeholder: "Prof. Sharma" },
                { label: "Room / Lab", key: "room", type: "text", placeholder: "B-204" },
              ].map(f => (
                <div key={f.key}>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">{f.label}</label>
                  {f.type === "select" ? (
                    <select value={form[f.key]} onChange={e => setForm({ ...form, [f.key]: e.target.value })}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#6b0f1a]">
                      {f.options.map(o => <option key={o} value={o}>{o}</option>)}
                    </select>
                  ) : (
                    <input type="text" placeholder={f.placeholder} value={form[f.key]}
                      onChange={e => setForm({ ...form, [f.key]: e.target.value })}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#6b0f1a]" />
                  )}
                </div>
              ))}
              <div className="col-span-full">
                <button type="submit"
                  className="bg-[#6b0f1a] hover:bg-[#8b1a2a] text-white font-bold text-sm px-6 py-2.5 rounded-xl transition shadow-sm">
                  Add to Timetable
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Class Filter */}
        <div className="flex items-center gap-2 flex-wrap">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Filter Class:</p>
          {classGroups.map(g => (
            <button key={g} onClick={() => setFilterClass(g)}
              className={`px-3 py-1.5 rounded-full text-xs font-bold transition ${
                filterClass === g
                  ? "bg-[#6b0f1a] text-white shadow-sm"
                  : "bg-white border border-gray-200 text-gray-500 hover:border-[#6b0f1a] hover:text-[#6b0f1a]"
              }`}>
              {g === "all" ? "All Classes" : g}
            </button>
          ))}
        </div>

        {/* Today's Classes Highlight */}
        {(() => {
          const todayEntries = filtered.filter(e => e.day === today);
          if (todayEntries.length === 0) return null;
          return (
            <div className="bg-gradient-to-r from-[#6b0f1a] to-[#9b2030] rounded-2xl p-5 shadow-lg">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-2 h-2 rounded-full bg-[#f0d080] animate-pulse" />
                <p className="text-[#f0d080] font-black text-sm uppercase tracking-widest">Today's Classes — {today}</p>
              </div>
              <div className="flex gap-3 flex-wrap">
                {todayEntries
                  .sort((a, b) => PERIODS.indexOf(a.period) - PERIODS.indexOf(b.period))
                  .map((e, i) => (
                    <div key={e.id} className="bg-white/15 backdrop-blur-sm rounded-xl px-4 py-3 border border-white/20 min-w-[140px]">
                      <p className="text-[#f0d080] text-[10px] font-bold uppercase tracking-wide">{e.period}</p>
                      <p className="text-white font-black text-sm mt-1">{e.subject}</p>
                      <p className="text-white/60 text-xs mt-0.5">{e.teacher}</p>
                      <p className="text-white/40 text-[10px] mt-0.5">🚪 {e.room || "—"}</p>
                    </div>
                  ))}
              </div>
            </div>
          );
        })()}

        {/* Full Timetable Grid */}
        {loading ? (
          <div className="py-16 text-center bg-white rounded-2xl border border-gray-100">
            <div className="w-8 h-8 border-4 border-[#6b0f1a]/20 border-t-[#6b0f1a] rounded-full animate-spin mx-auto" />
          </div>
        ) : entries.length === 0 ? (
          <div className="py-20 text-center bg-white rounded-2xl border border-gray-100">
            <p className="text-5xl mb-3">📅</p>
            <p className="text-gray-500 font-semibold">No timetable entries yet</p>
            {isAdmin && <p className="text-gray-400 text-sm mt-1">Click "Add Entry" to get started</p>}
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white flex items-center gap-2.5">
              <div className="w-1 h-5 bg-[#6b0f1a] rounded-full" />
              <h2 className="font-bold text-gray-900 text-sm">Weekly Schedule</h2>
              {filterClass !== "all" && (
                <span className="bg-[#6b0f1a]/10 text-[#6b0f1a] text-xs font-bold px-2.5 py-0.5 rounded-full">
                  {filterClass}
                </span>
              )}
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[900px]">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    <th className="px-4 py-3 text-left text-xs font-bold text-gray-400 uppercase tracking-widest w-36">
                      Period / Time
                    </th>
                    {DAYS.map(day => (
                      <th key={day} className={`px-3 py-3 text-center text-xs font-bold uppercase tracking-widest ${
                        day === today ? "text-[#6b0f1a] bg-[#6b0f1a]/5" : "text-gray-400"
                      }`}>
                        <div className="flex flex-col items-center gap-0.5">
                          {day === today && <div className="w-1.5 h-1.5 rounded-full bg-[#6b0f1a]" />}
                          {day.slice(0, 3)}
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {PERIODS.map((period, pi) => {
                    const isBreak = period.includes("Break");
                    return (
                      <tr key={period} className={`border-b border-gray-50 ${isBreak ? "bg-gray-50/80" : "hover:bg-gray-50/50"} transition`}>
                        <td className="px-4 py-3">
                          <p className="text-xs font-bold text-gray-500">{isBreak ? "☕ Break" : `P${pi + 1}`}</p>
                          <p className="text-[10px] text-gray-400 mt-0.5 leading-tight">{period}</p>
                        </td>
                        {DAYS.map(day => {
                          const entry = grid[day]?.[period];
                          const isToday = day === today;
                          return (
                            <td key={day} className={`px-2 py-2 text-center ${isToday ? "bg-[#6b0f1a]/[0.02]" : ""}`}>
                              {isBreak ? (
                                <div className="text-gray-300 text-xs py-1">—</div>
                              ) : entry ? (
                                <div className={`relative group rounded-xl p-2.5 border text-left ${subjectColors[entry.subject] || COLORS[0]} hover:shadow-sm transition`}>
                                  <p className="font-black text-xs leading-tight line-clamp-1">{entry.subject}</p>
                                  <p className="text-[10px] opacity-70 mt-0.5 line-clamp-1">{entry.teacher}</p>
                                  {entry.room && <p className="text-[9px] opacity-50 mt-0.5">🚪 {entry.room}</p>}
                                  {entry.classGroup && (
                                    <p className="text-[9px] opacity-50">👥 {entry.classGroup}</p>
                                  )}
                                  {isAdmin && (
                                    <button
                                      onClick={() => handleDelete(entry.id)}
                                      className="absolute top-1 right-1 w-4 h-4 rounded-full bg-red-500 text-white text-[8px] hidden group-hover:flex items-center justify-center transition">
                                      ✕
                                    </button>
                                  )}
                                </div>
                              ) : (
                                <div className="h-10 rounded-xl border border-dashed border-gray-100" />
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Legend */}
        {Object.keys(subjectColors).length > 0 && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Subject Legend</p>
            <div className="flex gap-2 flex-wrap">
              {Object.entries(subjectColors).map(([subject, color]) => (
                <span key={subject} className={`px-3 py-1.5 rounded-full text-xs font-bold border ${color}`}>
                  {subject}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

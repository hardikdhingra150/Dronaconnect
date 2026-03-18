import { useState, useEffect } from "react";
import { collection, getDocs, doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase/config";
import { useAuth } from "../context/AuthContext";
import { exportToCSV } from "../utils/exportCSV";


export default function MarkAttendance() {
    const { user } = useAuth();
    const [students, setStudents] = useState([]);
    const [filtered, setFiltered] = useState([]);
    const [attendance, setAttendance] = useState({});
    const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
    const [subject, setSubject] = useState("");
    const [subjects, setSubjects] = useState([]);
    const [search, setSearch] = useState("");
    const [saved, setSaved] = useState(false);
    const [alreadyMarked, setAlreadyMarked] = useState(false);
    const [month, setMonth] = useState(new Date().toISOString().slice(0, 7));
    const [monthlyReport, setMonthlyReport] = useState([]);
    const [reportView, setReportView] = useState(false);

    useEffect(() => {
        const fetchSubjects = async () => {
            const snap = await getDocs(collection(db, "subjects"));
            setSubjects(snap.docs.map((d) => ({ id: d.id, ...d.data() })).filter((s) => s.teacherId === user.uid));
        };
        fetchSubjects();
    }, [user]);

    useEffect(() => {
        if (!subject) return;
        const fetchStudents = async () => {
            const snap = await getDocs(collection(db, "users"));
            const list = snap.docs.map((d) => ({ id: d.id, ...d.data() })).filter((u) => u.role === "student");
            setStudents(list);
            setFiltered(list);
            const initial = {};
            list.forEach((s) => (initial[s.id] = "present"));
            setAttendance(initial);

            // Check if already marked
            const ref = doc(db, "attendance", subject, "records", date);
            const snap2 = await getDoc(ref);
            if (snap2.exists()) {
                setAttendance(snap2.data().students);
                setAlreadyMarked(true);
            } else {
                setAlreadyMarked(false);
            }
        };
        fetchStudents();
    }, [subject, date]);

    useEffect(() => {
        const q = search.toLowerCase();
        setFiltered(students.filter((s) =>
            s.name?.toLowerCase().includes(q) || s.rollNo?.toLowerCase().includes(q)
        ));
    }, [search, students]);

    const toggle = (id) => {
        setAttendance((prev) => ({
            ...prev,
            [id]: prev[id] === "present" ? "absent" : "present",
        }));
    };

    const markAll = (status) => {
        const updated = {};
        students.forEach((s) => (updated[s.id] = status));
        setAttendance(updated);
    };

    const handleSubmit = async () => {
        if (!subject || !date) return alert("Select subject and date");
        const ref = doc(db, "attendance", subject, "records", date);
        await setDoc(ref, { markedBy: user.uid, date: serverTimestamp(), students: attendance });
        setSaved(true);
        setAlreadyMarked(true);
        setTimeout(() => setSaved(false), 3000);
    };

    const generateMonthlyReport = async () => {
        if (!subject) return alert("Select a subject first");
        const recSnap = await getDocs(collection(db, "attendance", subject, "records"));
        const monthRecords = recSnap.docs.filter((d) => d.id.startsWith(month));
        const totals = {};
        students.forEach((s) => { totals[s.id] = { present: 0, total: 0 }; });
        monthRecords.forEach((r) => {
            const data = r.data().students;
            Object.keys(data).forEach((uid) => {
                if (!totals[uid]) totals[uid] = { present: 0, total: 0 };
                totals[uid].total++;
                if (data[uid] === "present") totals[uid].present++;
            });
        });
        const report = students.map((s) => {
            const t = totals[s.id] || { present: 0, total: 0 };
            return {
                Name: s.name,
                "Roll No": s.rollNo || "—",
                Department: s.department || "—",
                Present: t.present,
                Total: t.total,
                Percentage: t.total ? ((t.present / t.total) * 100).toFixed(1) + "%" : "N/A",
                Status: t.total && (t.present / t.total) * 100 >= 75 ? "Safe" : "Defaulter",
            };
        });
        setMonthlyReport(report);
        setReportView(true);
    };

    const presentCount = Object.values(attendance).filter((v) => v === "present").length;
    const absentCount = Object.values(attendance).filter((v) => v === "absent").length;

    return (
        <div className="p-8 space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Mark Attendance</h1>
                <p className="text-gray-400 text-sm mt-0.5">Select a subject and date to record attendance</p>
            </div>

            {/* Controls */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex flex-wrap gap-4">
                <div className="flex-1 min-w-[180px]">
                    <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1.5">Subject</label>
                    <select
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                        value={subject}
                        onChange={(e) => setSubject(e.target.value)}
                    >
                        <option value="">-- Select Subject --</option>
                        {subjects.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                    </select>
                </div>
                <div className="flex-1 min-w-[160px]">
                    <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1.5">Date</label>
                    <input
                        type="date"
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                    />
                </div>
                <div className="flex-1 min-w-[160px]">
                    <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1.5">Month Report</label>
                    <input
                        type="month"
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                        value={month}
                        onChange={(e) => setMonth(e.target.value)}
                    />
                </div>
                <div className="flex items-end">
                    <button
                        onClick={generateMonthlyReport}
                        className="bg-violet-600 hover:bg-violet-700 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition shadow-sm"
                    >
                        Generate Report
                    </button>
                </div>
            </div>

            {/* Already marked notice */}
            {alreadyMarked && (
                <div className="bg-amber-50 border border-amber-100 text-amber-700 text-sm px-4 py-3 rounded-xl flex items-center gap-2">
                    ⚠️ Attendance already marked for this date. You can update it below.
                </div>
            )}

            {/* Attendance Sheet */}
            {students.length > 0 && !reportView && (
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-100 flex flex-wrap items-center gap-3">
                        <input
                            type="text"
                            placeholder="Search by name or roll no..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="flex-1 min-w-[200px] bg-gray-50 border border-gray-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                        />
                        <div className="flex gap-2">
                            <span className="bg-emerald-100 text-emerald-700 text-xs font-semibold px-3 py-1.5 rounded-full">✅ {presentCount} Present</span>
                            <span className="bg-red-100 text-red-600 text-xs font-semibold px-3 py-1.5 rounded-full">❌ {absentCount} Absent</span>
                        </div>
                        <div className="flex gap-2">
                            <button onClick={() => markAll("present")} className="text-xs bg-emerald-50 hover:bg-emerald-100 text-emerald-700 px-3 py-1.5 rounded-lg font-medium transition">All Present</button>
                            <button onClick={() => markAll("absent")} className="text-xs bg-red-50 hover:bg-red-100 text-red-600 px-3 py-1.5 rounded-lg font-medium transition">All Absent</button>
                        </div>
                    </div>

                    <table className="w-full text-sm">
                        <thead className="bg-gray-50">
                            <tr>
                                {["#", "Student", "Roll No", "Department", "Status"].map((h) => (
                                    <th key={h} className="text-left px-6 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.map((s, i) => (
                                <tr key={s.id} className="border-t border-gray-50 hover:bg-gray-50 transition">
                                    <td className="px-6 py-3 text-gray-400 text-xs">{i + 1}</td>
                                    <td className="px-6 py-3">
                                        <div className="flex items-center gap-2.5">
                                            <div className="w-7 h-7 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-xs">
                                                {s.name?.charAt(0)?.toUpperCase()}
                                            </div>
                                            <span className="font-medium text-gray-800">{s.name}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-3 text-gray-500 text-xs">{s.rollNo || "—"}</td>
                                    <td className="px-6 py-3 text-gray-500 text-xs">{s.department || "—"}</td>
                                    <td className="px-6 py-3">
                                        <button
                                            onClick={() => toggle(s.id)}
                                            className={`px-4 py-1.5 rounded-full text-xs font-semibold transition ${attendance[s.id] === "present"
                                                    ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-200"
                                                    : "bg-red-100 text-red-600 hover:bg-red-200"
                                                }`}
                                        >
                                            {attendance[s.id] === "present" ? "✅ Present" : "❌ Absent"}
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    <div className="px-6 py-4 border-t border-gray-100 flex justify-end">
                        <button
                            onClick={handleSubmit}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-xl text-sm font-semibold transition shadow-sm"
                        >
                            {saved ? "✅ Saved!" : alreadyMarked ? "Update Attendance" : "Save Attendance"}
                        </button>
                    </div>
                </div>
            )}

            {/* Monthly Report View */}
            {reportView && monthlyReport.length > 0 && (
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
                        <div>
                            <h2 className="font-semibold text-gray-800">Monthly Report — {month}</h2>
                            <p className="text-xs text-gray-400 mt-0.5">{monthlyReport.filter(r => r.Status === "Defaulter").length} defaulters found</p>
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={() => exportToCSV(monthlyReport, `attendance-${month}.csv`)}
                                className="bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition shadow-sm"
                            >
                                ⬇️ Export CSV
                            </button>

                            <button
                                onClick={() => setReportView(false)}
                                className="bg-gray-100 hover:bg-gray-200 text-gray-600 text-sm font-semibold px-4 py-2.5 rounded-xl transition"
                            >
                                ← Back
                            </button>
                        </div>
                    </div>
                    <table className="w-full text-sm">
                        <thead className="bg-gray-50">
                            <tr>
                                {["Name", "Roll No", "Dept", "Present", "Total", "Percentage", "Status"].map((h) => (
                                    <th key={h} className="text-left px-6 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {monthlyReport.map((r, i) => (
                                <tr key={i} className={`border-t border-gray-50 hover:bg-gray-50 transition ${r.Status === "Defaulter" ? "bg-red-50/30" : ""}`}>
                                    <td className="px-6 py-3 font-medium text-gray-800">{r.Name}</td>
                                    <td className="px-6 py-3 text-gray-400 text-xs">{r["Roll No"]}</td>
                                    <td className="px-6 py-3 text-gray-400 text-xs">{r.Department}</td>
                                    <td className="px-6 py-3 text-center font-medium text-gray-700">{r.Present}</td>
                                    <td className="px-6 py-3 text-center text-gray-400">{r.Total}</td>
                                    <td className="px-6 py-3 text-center font-semibold text-gray-800">{r.Percentage}</td>
                                    <td className="px-6 py-3">
                                        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${r.Status === "Safe" ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-600"}`}>
                                            {r.Status === "Safe" ? "✅ Safe" : "⚠️ Defaulter"}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}

import { useEffect, useState } from "react";
import { collection, getDocs, addDoc, query, where, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase/config";
import { useAuth } from "../context/AuthContext";

export default function Examination() {
  const { user, userData } = useAuth();
  const [tab, setTab] = useState("admit");
  const [admitCards, setAdmitCards] = useState([]);
  const [results, setResults] = useState([]);
  const [reappears, setReappears] = useState([]);
  const [loading, setLoading] = useState(true);
  const isAdmin = userData?.role === "admin";
  const [form, setForm] = useState({ studentId: "", studentName: "", rollNo: "", semester: "", examType: "Mid Term", subjects: "", examCenter: "", examDate: "", status: "issued" });
  const [resultForm, setResultForm] = useState({ studentId: "", semester: "", subject: "", marks: "", maxMarks: "100", grade: "", status: "pass" });
  const [students, setStudents] = useState([]);
  const [msg, setMsg] = useState("");

  useEffect(() => { fetchAll(); if (isAdmin) fetchStudents(); }, []);

  const fetchStudents = async () => {
    const snap = await getDocs(collection(db, "users"));
    setStudents(snap.docs.map(d => ({ id: d.id, ...d.data() })).filter(u => u.role === "student"));
  };

  const fetchAll = async () => {
    setLoading(true);
    const admitQ = isAdmin ? collection(db, "admitCards") : query(collection(db, "admitCards"), where("studentId", "==", user.uid));
    const resultQ = isAdmin ? collection(db, "results") : query(collection(db, "results"), where("studentId", "==", user.uid));
    const reappearQ = isAdmin ? collection(db, "reappears") : query(collection(db, "reappears"), where("studentId", "==", user.uid));
    const [a, r, re] = await Promise.all([getDocs(admitQ), getDocs(resultQ), getDocs(reappearQ)]);
    setAdmitCards(a.docs.map(d => ({ id: d.id, ...d.data() })));
    setResults(r.docs.map(d => ({ id: d.id, ...d.data() })));
    setReappears(re.docs.map(d => ({ id: d.id, ...d.data() })));
    setLoading(false);
  };

  const downloadAdmitCard = (card) => {
    const content = [
      "============================================",
      "          DRONACONNECT ADMIT CARD",
      "     Dronacharya College of Engineering",
      "============================================",
      `Student Name : ${card.studentName}`,
      `Roll No      : ${card.rollNo}`,
      `Semester     : ${card.semester}`,
      `Exam Type    : ${card.examType}`,
      `Exam Center  : ${card.examCenter}`,
      `Exam Date    : ${card.examDate}`,
      `Subjects     : ${card.subjects}`,
      `Status       : ${card.status?.toUpperCase()}`,
      "============================================",
      "Instructions:",
      "1. Carry this admit card to exam hall.",
      "2. No electronic devices allowed.",
      "3. Report 30 mins before exam time.",
      "============================================",
    ].join("\n");
    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `admit-card-${card.rollNo}.txt`; a.click();
    URL.revokeObjectURL(url);
  };

  const handleAddAdmitCard = async (e) => {
    e.preventDefault();
    const student = students.find(s => s.id === form.studentId);
    await addDoc(collection(db, "admitCards"), {
      ...form, studentName: student?.name || form.studentName,
      rollNo: student?.rollNo || form.rollNo, createdAt: serverTimestamp(),
    });
    setMsg("✅ Admit card issued!"); fetchAll();
    setTimeout(() => setMsg(""), 3000);
  };

  const handleAddResult = async (e) => {
    e.preventDefault();
    const student = students.find(s => s.id === resultForm.studentId);
    await addDoc(collection(db, "results"), {
      ...resultForm, studentName: student?.name,
      percentage: ((parseFloat(resultForm.marks) / parseFloat(resultForm.maxMarks)) * 100).toFixed(1),
      createdAt: serverTimestamp(),
    });
    setMsg("✅ Result added!"); fetchAll();
    setTimeout(() => setMsg(""), 3000);
  };

  const handleReappear = async (resultId, subject, semester) => {
    await addDoc(collection(db, "reappears"), {
      studentId: user.uid, studentName: userData?.name,
      rollNo: userData?.rollNo, subject, semester,
      appliedAt: serverTimestamp(), status: "pending",
    });
    setMsg("✅ Reappear application submitted!"); fetchAll();
    setTimeout(() => setMsg(""), 3000);
  };

  const gradeColor = (g) => {
    if (["A+", "A"].includes(g)) return "bg-emerald-100 text-emerald-700 border-emerald-200";
    if (["B+", "B"].includes(g)) return "bg-blue-100 text-blue-600 border-blue-200";
    if (["C", "D"].includes(g)) return "bg-amber-100 text-amber-700 border-amber-200";
    return "bg-red-100 text-red-600 border-red-200";
  };

  const TABS = [
    { key: "admit", label: "🪪 Admit Card" },
    { key: "results", label: "📊 Results" },
    { key: "reappear", label: "🔄 Reappear" },
    ...(isAdmin ? [{ key: "issue", label: "➕ Issue Card" }, { key: "addresult", label: "📝 Add Result" }] : []),
  ];

  return (
    <div className="min-h-full bg-[#f5f6fa]">
      <div className="relative bg-gradient-to-br from-[#6b0f1a] via-[#7a1222] to-[#4a0a12] px-8 py-8 overflow-hidden">
        <div className="absolute -right-10 -top-10 w-56 h-56 rounded-full bg-white/5" />
        <div className="absolute inset-0 bg-cover bg-center opacity-10 mix-blend-overlay" style={{ backgroundImage: "url('/campus.jpg')" }} />
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-1.5 h-4 bg-[#f0d080] rounded-full" />
            <span className="text-[#f0d080] text-xs font-bold uppercase tracking-[0.2em]">Examination Cell</span>
          </div>
          <h1 className="text-3xl font-black text-white">Examination Portal 📝</h1>
          <p className="text-white/50 text-sm mt-1">Admit cards, results and reappear applications</p>
        </div>
      </div>

      <div className="p-8 space-y-6">
        {msg && <div className="bg-emerald-50 border border-emerald-100 text-emerald-700 px-4 py-3 rounded-xl text-sm font-medium">{msg}</div>}

        <div className="flex gap-2 border-b border-gray-200 pb-0 flex-wrap">
          {TABS.map(t => (
            <button key={t.key} onClick={() => setTab(t.key)}
              className={`px-4 py-2.5 text-sm font-bold border-b-2 transition -mb-px ${tab === t.key ? "border-[#6b0f1a] text-[#6b0f1a]" : "border-transparent text-gray-400 hover:text-gray-600"}`}>
              {t.label}
            </button>
          ))}
        </div>

        {/* Admit Cards */}
        {tab === "admit" && (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {loading ? <div className="col-span-3 py-16 text-center"><div className="w-8 h-8 border-4 border-[#6b0f1a]/20 border-t-[#6b0f1a] rounded-full animate-spin mx-auto" /></div>
              : admitCards.length === 0 ? (
                <div className="col-span-3 py-16 text-center"><p className="text-4xl mb-3">🪪</p><p className="text-gray-500 font-semibold">No admit cards issued yet</p></div>
              ) : admitCards.map(card => (
                <div key={card.id} className="bg-white rounded-2xl border-2 border-[#6b0f1a]/10 shadow-sm overflow-hidden hover:-translate-y-1 hover:shadow-md transition-all duration-200">
                  <div className="bg-gradient-to-r from-[#6b0f1a] to-[#9b2030] px-5 py-4">
                    <div className="flex items-center gap-2">
                      <div className="w-1 h-4 bg-[#f0d080] rounded-full" />
                      <p className="text-[#f0d080] text-xs font-bold uppercase tracking-widest">Admit Card</p>
                    </div>
                    <p className="text-white font-black text-lg mt-1">{card.studentName}</p>
                    <p className="text-white/60 text-xs">{card.rollNo}</p>
                  </div>
                  <div className="p-5 space-y-2">
                    {[
                      { label: "Exam Type", val: card.examType },
                      { label: "Semester", val: card.semester },
                      { label: "Exam Center", val: card.examCenter },
                      { label: "Exam Date", val: card.examDate },
                      { label: "Subjects", val: card.subjects },
                    ].map(r => (
                      <div key={r.label} className="flex justify-between text-sm">
                        <span className="text-gray-400 text-xs font-semibold uppercase tracking-wide">{r.label}</span>
                        <span className="text-gray-800 font-semibold text-xs">{r.val || "—"}</span>
                      </div>
                    ))}
                    <div className="pt-3 flex gap-2">
                      <button onClick={() => downloadAdmitCard(card)}
                        className="flex-1 bg-[#6b0f1a] hover:bg-[#8b1a2a] text-white text-xs font-bold py-2.5 rounded-xl transition flex items-center justify-center gap-1.5">
                        ⬇️ Download
                      </button>
                      <span className={`px-3 py-2.5 rounded-xl text-xs font-bold border ${card.status === "issued" ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-amber-50 text-amber-700 border-amber-200"}`}>
                        {card.status}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        )}

        {/* Results */}
        {tab === "results" && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white flex items-center gap-2.5">
              <div className="w-1 h-5 bg-[#6b0f1a] rounded-full" />
              <h2 className="font-bold text-gray-900 text-sm">Examination Results</h2>
            </div>
            {results.length === 0 ? (
              <div className="py-16 text-center"><p className="text-4xl mb-3">📊</p><p className="text-gray-500 font-semibold">No results published yet</p></div>
            ) : (
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>{["Subject", "Semester", "Marks", "Grade", "Status", "Action"].map(h => (
                    <th key={h} className="text-left px-6 py-3 text-xs font-bold text-gray-400 uppercase tracking-widest">{h}</th>
                  ))}</tr>
                </thead>
                <tbody>
                  {results.map(r => (
                    <tr key={r.id} className="border-t border-gray-50 hover:bg-gray-50 transition">
                      <td className="px-6 py-4 font-semibold text-gray-800">{r.subject}</td>
                      <td className="px-6 py-4 text-gray-500 text-xs">Sem {r.semester}</td>
                      <td className="px-6 py-4 font-black text-gray-900">{r.marks}/{r.maxMarks} <span className="text-xs text-gray-400">({r.percentage}%)</span></td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-black border ${gradeColor(r.grade)}`}>{r.grade}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${r.status === "pass" ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-600"}`}>
                          {r.status === "pass" ? "✅ Pass" : "❌ Fail"}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {r.status === "fail" && !isAdmin && (
                          <button onClick={() => handleReappear(r.id, r.subject, r.semester)}
                            className="text-xs bg-amber-50 hover:bg-amber-100 text-amber-700 px-3 py-1.5 rounded-lg font-bold transition border border-amber-200">
                            Apply Reappear
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* Reappear */}
        {tab === "reappear" && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white flex items-center gap-2.5">
              <div className="w-1 h-5 bg-[#6b0f1a] rounded-full" />
              <h2 className="font-bold text-gray-900 text-sm">Reappear Applications</h2>
            </div>
            {reappears.length === 0 ? (
              <div className="py-16 text-center"><p className="text-4xl mb-3">🔄</p><p className="text-gray-500 font-semibold">No reappear applications</p><p className="text-gray-400 text-sm mt-1">Apply from Results tab for failed subjects</p></div>
            ) : (
              <div className="divide-y divide-gray-50">
                {reappears.map(r => (
                  <div key={r.id} className="px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition">
                    <div>
                      <p className="font-bold text-gray-900 text-sm">{r.subject}</p>
                      <p className="text-xs text-gray-400">Semester {r.semester} · {r.studentName} ({r.rollNo})</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${r.status === "approved" ? "bg-emerald-100 text-emerald-700" : r.status === "rejected" ? "bg-red-100 text-red-600" : "bg-amber-100 text-amber-700"}`}>
                      {r.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Issue Admit Card (Admin) */}
        {tab === "issue" && isAdmin && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 max-w-xl">
            <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2"><div className="w-1 h-5 bg-[#6b0f1a] rounded-full" /> Issue Admit Card</h3>
            <form onSubmit={handleAddAdmitCard} className="space-y-4">
              {[
                { label: "Student", key: "studentId", type: "studentSelect" },
                { label: "Semester", key: "semester", type: "text", placeholder: "5" },
                { label: "Exam Type", key: "examType", type: "select", options: ["Mid Term", "End Term", "Practical", "Sessional"] },
                { label: "Subjects", key: "subjects", type: "text", placeholder: "DSA, OS, DBMS" },
                { label: "Exam Center", key: "examCenter", type: "text", placeholder: "Block A, Room 101" },
                { label: "Exam Date", key: "examDate", type: "date" },
              ].map(f => (
                <div key={f.key}>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">{f.label}</label>
                  {f.type === "studentSelect" ? (
                    <select className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#6b0f1a]"
                      value={form.studentId} onChange={e => setForm({ ...form, studentId: e.target.value })} required>
                      <option value="">-- Select Student --</option>
                      {students.map(s => <option key={s.id} value={s.id}>{s.name} ({s.rollNo})</option>)}
                    </select>
                  ) : f.type === "select" ? (
                    <select className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#6b0f1a]"
                      value={form[f.key]} onChange={e => setForm({ ...form, [f.key]: e.target.value })}>
                      {f.options.map(o => <option key={o} value={o}>{o}</option>)}
                    </select>
                  ) : (
                    <input type={f.type} placeholder={f.placeholder} value={form[f.key]}
                      onChange={e => setForm({ ...form, [f.key]: e.target.value })}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#6b0f1a]" />
                  )}
                </div>
              ))}
              <button type="submit" className="w-full bg-[#6b0f1a] hover:bg-[#8b1a2a] text-white py-2.5 rounded-xl font-bold text-sm transition shadow-sm">Issue Admit Card</button>
            </form>
          </div>
        )}

        {/* Add Result (Admin) */}
        {tab === "addresult" && isAdmin && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 max-w-xl">
            <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2"><div className="w-1 h-5 bg-[#6b0f1a] rounded-full" /> Add Result</h3>
            <form onSubmit={handleAddResult} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Student</label>
                <select className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#6b0f1a]"
                  value={resultForm.studentId} onChange={e => setResultForm({ ...resultForm, studentId: e.target.value })} required>
                  <option value="">-- Select Student --</option>
                  {students.map(s => <option key={s.id} value={s.id}>{s.name} ({s.rollNo})</option>)}
                </select>
              </div>
              {[
                { label: "Subject", key: "subject", type: "text", placeholder: "Data Structures" },
                { label: "Semester", key: "semester", type: "text", placeholder: "5" },
                { label: "Marks Obtained", key: "marks", type: "number", placeholder: "78" },
                { label: "Max Marks", key: "maxMarks", type: "number", placeholder: "100" },
                { label: "Grade", key: "grade", type: "select", options: ["A+", "A", "B+", "B", "C", "D", "F"] },
                { label: "Status", key: "status", type: "select", options: ["pass", "fail"] },
              ].map(f => (
                <div key={f.key}>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">{f.label}</label>
                  {f.type === "select" ? (
                    <select className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#6b0f1a]"
                      value={resultForm[f.key]} onChange={e => setResultForm({ ...resultForm, [f.key]: e.target.value })}>
                      {f.options.map(o => <option key={o} value={o}>{o}</option>)}
                    </select>
                  ) : (
                    <input type={f.type} placeholder={f.placeholder} value={resultForm[f.key]}
                      onChange={e => setResultForm({ ...resultForm, [f.key]: e.target.value })}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#6b0f1a]" />
                  )}
                </div>
              ))}
              <button type="submit" className="w-full bg-[#6b0f1a] hover:bg-[#8b1a2a] text-white py-2.5 rounded-xl font-bold text-sm transition shadow-sm">Publish Result</button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}

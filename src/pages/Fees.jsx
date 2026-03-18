import { useEffect, useState } from "react";
import { collection, getDocs, addDoc, query, where, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase/config";
import { useAuth } from "../context/AuthContext";
import { exportToCSV } from "../utils/exportCSV";

const FEE_TYPES = ["Semester Fee", "Examination Fee", "Transport Fee", "Library Fee", "Hostel Fee", "Development Fee", "Other"];

export default function Fees() {
  const { user, userData } = useAuth();
  const [fees, setFees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("records");
  const [form, setForm] = useState({ studentId: "", studentName: "", type: "Semester Fee", amount: "", semester: "", dueDate: "", status: "paid", remarks: "" });
  const [msg, setMsg] = useState("");
  const [students, setStudents] = useState([]);

  const isAdmin = userData?.role === "admin";

  useEffect(() => { fetchFees(); if (isAdmin) fetchStudents(); }, []);

  const fetchStudents = async () => {
    const snap = await getDocs(collection(db, "users"));
    setStudents(snap.docs.map(d => ({ id: d.id, ...d.data() })).filter(u => u.role === "student"));
  };

  const fetchFees = async () => {
    setLoading(true);
    let snap;
    if (isAdmin) {
      snap = await getDocs(collection(db, "fees"));
    } else {
      const q = query(collection(db, "fees"), where("studentId", "==", user.uid));
      snap = await getDocs(q);
    }
    setFees(snap.docs.map(d => ({ id: d.id, ...d.data() })).sort((a, b) => b.createdAt?.seconds - a.createdAt?.seconds));
    setLoading(false);
  };

  const handleAddFee = async (e) => {
    e.preventDefault();
    const student = students.find(s => s.id === form.studentId);
    await addDoc(collection(db, "fees"), {
      ...form,
      studentName: student?.name || form.studentName,
      amount: parseFloat(form.amount),
      createdAt: serverTimestamp(),
      addedBy: user.uid,
    });
    setMsg("✅ Fee record added!");
    setForm({ studentId: "", studentName: "", type: "Semester Fee", amount: "", semester: "", dueDate: "", status: "paid", remarks: "" });
    fetchFees();
    setTimeout(() => setMsg(""), 3000);
  };

  const downloadReceipt = (fee) => {
    const lines = [
      "========================================",
      "        DRONACONNECT FEE RECEIPT",
      "  Dronacharya College of Engineering",
      "       Sector 43, Gurugram",
      "========================================",
      `Receipt ID   : ${fee.id.slice(0, 8).toUpperCase()}`,
      `Student Name : ${fee.studentName}`,
      `Fee Type     : ${fee.type}`,
      `Semester     : ${fee.semester || "—"}`,
      `Amount       : ₹${fee.amount?.toLocaleString()}`,
      `Status       : ${fee.status?.toUpperCase()}`,
      `Due Date     : ${fee.dueDate || "—"}`,
      `Remarks      : ${fee.remarks || "—"}`,
      "========================================",
      "  Thank you for your payment.",
      "========================================",
    ].join("\n");
    const blob = new Blob([lines], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `receipt-${fee.id.slice(0, 8)}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const totalPaid = fees.filter(f => f.status === "paid").reduce((a, f) => a + (f.amount || 0), 0);
  const totalPending = fees.filter(f => f.status === "pending").reduce((a, f) => a + (f.amount || 0), 0);

  const statusColor = (s) => {
    if (s === "paid") return "bg-emerald-100 text-emerald-700 border border-emerald-200";
    if (s === "pending") return "bg-amber-100 text-amber-700 border border-amber-200";
    return "bg-red-100 text-red-700 border border-red-200";
  };

  return (
    <div className="min-h-full bg-[#f5f6fa]">
      {/* Hero */}
      <div className="relative bg-gradient-to-br from-[#6b0f1a] via-[#7a1222] to-[#4a0a12] px-8 py-8 overflow-hidden">
        <div className="absolute -right-10 -top-10 w-56 h-56 rounded-full bg-white/5" />
        <div className="absolute inset-0 bg-cover bg-center opacity-10 mix-blend-overlay" style={{ backgroundImage: "url('/campus.jpg')" }} />
        <div className="relative z-10 flex items-center justify-between flex-wrap gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-1.5 h-4 bg-[#f0d080] rounded-full" />
              <span className="text-[#f0d080] text-xs font-bold uppercase tracking-[0.2em]">Finance Portal</span>
            </div>
            <h1 className="text-3xl font-black text-white">Fee Details 💰</h1>
            <p className="text-white/50 text-sm mt-1">Track, manage and download fee records</p>
          </div>
          {!isAdmin && (
            <div className="flex gap-3">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl px-4 py-3 border border-white/15 text-center">
                <p className="text-[#f0d080] font-black text-xl">₹{totalPaid.toLocaleString()}</p>
                <p className="text-white/50 text-[10px] uppercase tracking-wide mt-0.5">Total Paid</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl px-4 py-3 border border-white/15 text-center">
                <p className="text-red-300 font-black text-xl">₹{totalPending.toLocaleString()}</p>
                <p className="text-white/50 text-[10px] uppercase tracking-wide mt-0.5">Pending</p>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="p-8 space-y-6">
        {msg && <div className="bg-emerald-50 border border-emerald-100 text-emerald-700 px-4 py-3 rounded-xl text-sm font-medium">{msg}</div>}

        {/* Tabs */}
        <div className="flex gap-2 border-b border-gray-200 pb-0">
          {[{ key: "records", label: "📋 Fee Records" }, ...(isAdmin ? [{ key: "add", label: "➕ Add Fee" }] : []), { key: "summary", label: "📊 Summary" }].map(t => (
            <button key={t.key} onClick={() => setTab(t.key)}
              className={`px-4 py-2.5 text-sm font-bold border-b-2 transition -mb-px ${tab === t.key ? "border-[#6b0f1a] text-[#6b0f1a]" : "border-transparent text-gray-400 hover:text-gray-600"}`}>
              {t.label}
            </button>
          ))}
        </div>

        {/* Fee Records Tab */}
        {tab === "records" && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
              <div className="flex items-center gap-2.5">
                <div className="w-1 h-5 bg-[#6b0f1a] rounded-full" />
                <h2 className="font-bold text-gray-900 text-sm">All Fee Records</h2>
              </div>
              <button onClick={() => exportToCSV(fees.map(f => ({ Name: f.studentName, Type: f.type, Amount: f.amount, Semester: f.semester, Status: f.status, Due: f.dueDate })), "fee-records.csv")}
                className="text-xs bg-[#6b0f1a] hover:bg-[#8b1a2a] text-white px-3 py-1.5 rounded-lg font-bold transition">
                ⬇️ Export CSV
              </button>
            </div>
            {loading ? (
              <div className="py-16 text-center"><div className="w-8 h-8 border-4 border-[#6b0f1a]/20 border-t-[#6b0f1a] rounded-full animate-spin mx-auto" /></div>
            ) : fees.length === 0 ? (
              <div className="py-16 text-center"><p className="text-4xl mb-3">💸</p><p className="text-gray-500 font-semibold">No fee records found</p></div>
            ) : (
              <div className="divide-y divide-gray-50">
                {fees.map((fee) => (
                  <div key={fee.id} className="px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition group">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#6b0f1a] to-[#9b2030] flex items-center justify-center text-[#f0d080] font-black text-lg flex-shrink-0">
                        💰
                      </div>
                      <div>
                        <p className="font-bold text-gray-900 text-sm group-hover:text-[#6b0f1a] transition-colors">
                          {fee.type} {fee.semester && `— Sem ${fee.semester}`}
                        </p>
                        <p className="text-xs text-gray-400 mt-0.5">{isAdmin ? fee.studentName : ""} {fee.dueDate ? `· Due: ${fee.dueDate}` : ""}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <p className="font-black text-gray-900 text-lg">₹{fee.amount?.toLocaleString()}</p>
                      <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold capitalize ${statusColor(fee.status)}`}>{fee.status}</span>
                      <button onClick={() => downloadReceipt(fee)}
                        className="text-xs bg-indigo-50 hover:bg-indigo-100 text-indigo-600 px-3 py-1.5 rounded-lg font-bold transition">
                        🧾 Receipt
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Add Fee Tab (Admin only) */}
        {tab === "add" && isAdmin && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 max-w-xl">
            <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
              <div className="w-1 h-5 bg-[#6b0f1a] rounded-full" /> Add Fee Record
            </h3>
            <form onSubmit={handleAddFee} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Select Student</label>
                <select className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#6b0f1a]"
                  value={form.studentId} onChange={e => setForm({ ...form, studentId: e.target.value })} required>
                  <option value="">-- Select Student --</option>
                  {students.map(s => <option key={s.id} value={s.id}>{s.name} ({s.rollNo || s.email})</option>)}
                </select>
              </div>
              {[
                { label: "Fee Type", key: "type", type: "select", options: FEE_TYPES },
                { label: "Amount (₹)", key: "amount", type: "number", placeholder: "15000" },
                { label: "Semester", key: "semester", type: "text", placeholder: "3" },
                { label: "Due Date", key: "dueDate", type: "date" },
                { label: "Status", key: "status", type: "select", options: ["paid", "pending", "overdue"] },
                { label: "Remarks", key: "remarks", type: "text", placeholder: "Optional note..." },
              ].map(f => (
                <div key={f.key}>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">{f.label}</label>
                  {f.type === "select" ? (
                    <select className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#6b0f1a]"
                      value={form[f.key]} onChange={e => setForm({ ...form, [f.key]: e.target.value })}>
                      {f.options.map(o => <option key={o} value={o.toLowerCase()}>{o}</option>)}
                    </select>
                  ) : (
                    <input type={f.type} placeholder={f.placeholder} value={form[f.key]}
                      onChange={e => setForm({ ...form, [f.key]: e.target.value })}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#6b0f1a]" />
                  )}
                </div>
              ))}
              <button type="submit" className="w-full bg-[#6b0f1a] hover:bg-[#8b1a2a] text-white py-2.5 rounded-xl font-bold text-sm transition shadow-sm">
                Add Fee Record
              </button>
            </form>
          </div>
        )}

        {/* Summary Tab */}
        {tab === "summary" && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {FEE_TYPES.map(type => {
              const typeFees = fees.filter(f => f.type === type);
              const total = typeFees.reduce((a, f) => a + (f.amount || 0), 0);
              if (total === 0) return null;
              return (
                <div key={type} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">{type}</p>
                  <p className="text-2xl font-black text-gray-900">₹{total.toLocaleString()}</p>
                  <p className="text-xs text-gray-400 mt-1">{typeFees.length} record{typeFees.length !== 1 ? "s" : ""}</p>
                  <div className="flex gap-2 mt-2">
                    <span className="text-xs bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full font-semibold">
                      Paid: {typeFees.filter(f => f.status === "paid").length}
                    </span>
                    <span className="text-xs bg-amber-50 text-amber-700 px-2 py-0.5 rounded-full font-semibold">
                      Pending: {typeFees.filter(f => f.status === "pending").length}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

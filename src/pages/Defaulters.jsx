import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase/config";
import { exportToCSV } from "../utils/exportCSV";


export default function Defaulters() {
  const [defaulters, setDefaulters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [month, setMonth] = useState(new Date().toISOString().slice(0, 7));

  useEffect(() => {
    fetchDefaulters();
  }, [month]);

  const fetchDefaulters = async () => {
    setLoading(true);
    const subSnap = await getDocs(collection(db, "subjects"));
    const usersSnap = await getDocs(collection(db, "users"));
    const students = usersSnap.docs
      .map((d) => ({ id: d.id, ...d.data() }))
      .filter((u) => u.role === "student");

    const totals = {};
    students.forEach((s) => {
      totals[s.id] = { present: 0, total: 0 };
    });

    for (const subDoc of subSnap.docs) {
      const recSnap = await getDocs(
        collection(db, "attendance", subDoc.id, "records")
      );
      const monthRecs = recSnap.docs.filter((d) => d.id.startsWith(month));
      monthRecs.forEach((r) => {
        const data = r.data().students;
        Object.keys(data).forEach((uid) => {
          if (!totals[uid]) totals[uid] = { present: 0, total: 0 };
          totals[uid].total++;
          if (data[uid] === "present") totals[uid].present++;
        });
      });
    }

    const list = students
      .map((s) => {
        const t = totals[s.id] || { present: 0, total: 0 };
        const pct = t.total ? (t.present / t.total) * 100 : 100;
        return {
          ...s,
          present: t.present,
          total: t.total,
          percent: pct.toFixed(1),
        };
      })
      .filter((s) => s.total > 0 && parseFloat(s.percent) < 75)
      .sort((a, b) => parseFloat(a.percent) - parseFloat(b.percent));

    setDefaulters(list);
    setLoading(false);
  };

  const csvData = defaulters.map((d) => ({
    Name: d.name,
    "Roll No": d.rollNo || "—",
    Department: d.department || "—",
    Present: d.present,
    Total: d.total,
    Percentage: d.percent + "%",
  }));

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Defaulter List ⚠️</h1>
          <p className="text-gray-400 text-sm mt-0.5">
            Students with attendance below 75%
          </p>
        </div>
        <div className="flex items-center gap-3">
          <input
            type="month"
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            className="bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
          />
          {defaulters.length > 0 && (
           <button
           onClick={() => exportToCSV(csvData, `defaulters-${month}.csv`)}
           className="bg-red-500 hover:bg-red-600 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition shadow-sm"
         >
           ⬇️ Export CSV
         </button>
         
          )}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          {
            label: "Total Defaulters",
            value: defaulters.length,
            color: "text-red-500",
            bg: "bg-red-50",
            border: "border-red-100",
          },
          {
            label: "Below 50%",
            value: defaulters.filter((d) => parseFloat(d.percent) < 50).length,
            color: "text-red-700",
            bg: "bg-red-100",
            border: "border-red-200",
          },
          {
            label: "50% – 74%",
            value: defaulters.filter(
              (d) =>
                parseFloat(d.percent) >= 50 && parseFloat(d.percent) < 75
            ).length,
            color: "text-amber-600",
            bg: "bg-amber-50",
            border: "border-amber-100",
          },
        ].map((s) => (
          <div
            key={s.label}
            className={`rounded-2xl p-5 border ${s.border} ${s.bg}`}
          >
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest">
              {s.label}
            </p>
            <p className={`text-4xl font-bold mt-2 ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-16 text-center">
            <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto" />
            <p className="text-gray-400 text-sm mt-3">Loading defaulters...</p>
          </div>
        ) : defaulters.length === 0 ? (
          <div className="py-16 text-center">
            <p className="text-5xl mb-3">🎉</p>
            <p className="text-gray-700 font-semibold text-lg">
              No defaulters this month!
            </p>
            <p className="text-gray-400 text-sm mt-1">
              All students have above 75% attendance.
            </p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                {[
                  "#",
                  "Student",
                  "Roll No",
                  "Department",
                  "Present",
                  "Total",
                  "Attendance",
                  "Risk Level",
                ].map((h) => (
                  <th
                    key={h}
                    className="text-left px-6 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {defaulters.map((d, i) => {
                const pct = parseFloat(d.percent);
                const risk = pct < 50 ? "Critical" : "Warning";
                return (
                  <tr
                    key={d.id}
                    className="border-t border-gray-50 hover:bg-red-50/30 transition"
                  >
                    <td className="px-6 py-3 text-gray-400 text-xs">{i + 1}</td>
                    <td className="px-6 py-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center text-red-500 font-bold text-xs flex-shrink-0">
                          {d.name?.charAt(0)?.toUpperCase()}
                        </div>
                        <span className="font-medium text-gray-800">
                          {d.name}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-3 text-gray-400 text-xs">
                      {d.rollNo || "—"}
                    </td>
                    <td className="px-6 py-3 text-gray-400 text-xs">
                      {d.department || "—"}
                    </td>
                    <td className="px-6 py-3 text-center font-medium text-gray-700">
                      {d.present}
                    </td>
                    <td className="px-6 py-3 text-center text-gray-400">
                      {d.total}
                    </td>
                    <td className="px-6 py-4 min-w-[140px]">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-gray-100 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full transition-all ${
                              pct < 50 ? "bg-red-500" : "bg-amber-400"
                            }`}
                            style={{ width: `${Math.min(pct, 100)}%` }}
                          />
                        </div>
                        <span
                          className={`text-xs font-bold w-10 text-right ${
                            pct < 50 ? "text-red-600" : "text-amber-600"
                          }`}
                        >
                          {d.percent}%
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-3">
                      <span
                        className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                          risk === "Critical"
                            ? "bg-red-100 text-red-700"
                            : "bg-amber-100 text-amber-700"
                        }`}
                      >
                        {risk === "Critical" ? "🔴 Critical" : "🟡 Warning"}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

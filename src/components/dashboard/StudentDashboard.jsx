import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../firebase/config";
import { useAuth } from "../../context/AuthContext";

export default function StudentDashboard() {
  const { user, userData } = useAuth();
  const [report, setReport] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
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
            percent: ((present / total) * 100).toFixed(1),
          });
        }
      }
      setReport(results);
      setLoading(false);
    };
    fetch();
  }, [user]);

  const overallPercent = report.length
    ? (report.reduce((a, r) => a + parseFloat(r.percent), 0) / report.length).toFixed(1)
    : 0;

  const safe = report.filter((r) => parseFloat(r.percent) >= 75).length;
  const atRisk = report.filter((r) => parseFloat(r.percent) < 75).length;

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          My Attendance 📊
        </h1>
        <p className="text-gray-400 text-sm mt-0.5">
          {userData?.rollNo ? `Roll No: ${userData.rollNo} · ` : ""}
          {userData?.department || "College ERP"}
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm text-center">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-2">Overall</p>
          <p className={`text-4xl font-bold ${parseFloat(overallPercent) >= 75 ? "text-emerald-600" : "text-red-500"}`}>
            {overallPercent}%
          </p>
          <p className="text-xs text-gray-400 mt-1">Average across all subjects</p>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm text-center">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-2">Safe Subjects</p>
          <p className="text-4xl font-bold text-emerald-600">{safe}</p>
          <p className="text-xs text-gray-400 mt-1">Above 75% attendance</p>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm text-center">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-2">At Risk</p>
          <p className="text-4xl font-bold text-red-500">{atRisk}</p>
          <p className="text-xs text-gray-400 mt-1">Below 75% attendance</p>
        </div>
      </div>

      {/* Subject Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="font-semibold text-gray-800 text-sm">Subject-wise Attendance</h2>
        </div>
        {loading ? (
          <div className="px-6 py-12 text-center text-gray-300 text-sm">Loading...</div>
        ) : report.length === 0 ? (
          <div className="px-6 py-12 text-center text-gray-400 text-sm">
            No attendance records found yet.
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">Subject</th>
                <th className="px-6 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">Present</th>
                <th className="px-6 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">Total</th>
                <th className="px-6 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">Progress</th>
                <th className="px-6 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">Status</th>
              </tr>
            </thead>
            <tbody>
              {report.map((r, i) => {
                const pct = parseFloat(r.percent);
                const safe = pct >= 75;
                return (
                  <tr key={i} className="border-t border-gray-50 hover:bg-gray-50 transition">
                    <td className="px-6 py-4">
                      <p className="font-semibold text-gray-800">{r.subject}</p>
                      <p className="text-xs text-gray-400">{r.department}</p>
                    </td>
                    <td className="px-6 py-4 text-center font-medium text-gray-700">{r.present}</td>
                    <td className="px-6 py-4 text-center text-gray-400">{r.total}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-gray-100 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full transition-all ${safe ? "bg-emerald-500" : "bg-red-400"}`}
                            style={{ width: `${Math.min(pct, 100)}%` }}
                          />
                        </div>
                        <span className={`text-xs font-bold w-10 text-right ${safe ? "text-emerald-600" : "text-red-500"}`}>
                          {r.percent}%
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${safe ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-600"}`}>
                        {safe ? "✅ Safe" : "⚠️ Low"}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Tip */}
      {atRisk > 0 && (
        <div className="bg-red-50 border border-red-100 rounded-2xl px-5 py-4 flex gap-3 items-start">
          <span className="text-red-400 text-lg">⚠️</span>
          <div>
            <p className="text-sm font-semibold text-red-700">You're at risk in {atRisk} subject{atRisk > 1 ? "s" : ""}!</p>
            <p className="text-xs text-red-500 mt-0.5">
              You need 75% attendance to appear in exams. Contact your teacher immediately.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

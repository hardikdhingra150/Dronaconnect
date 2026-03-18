import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase/config";
import { useAuth } from "../context/AuthContext";

export default function StudentPanel() {
  const { user } = useAuth();
  const [report, setReport] = useState([]);

  useEffect(() => {
    const fetchAttendance = async () => {
      const subjectsSnap = await getDocs(collection(db, "subjects"));
      const results = [];

      for (const subDoc of subjectsSnap.docs) {
        const recordsSnap = await getDocs(
          collection(db, "attendance", subDoc.id, "records")
        );
        let present = 0, total = 0;
        recordsSnap.forEach((r) => {
          const data = r.data();
          if (data.students && data.students[user.uid] !== undefined) {
            total++;
            if (data.students[user.uid] === "present") present++;
          }
        });
        if (total > 0) {
          results.push({
            subject: subDoc.data().name,
            present,
            total,
            percent: ((present / total) * 100).toFixed(1),
          });
        }
      }
      setReport(results);
    };
    fetchAttendance();
  }, [user]);

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-3xl mx-auto">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">📊 My Attendance</h2>
        <div className="bg-white rounded-2xl shadow overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-indigo-50 text-indigo-700">
              <tr>
                <th className="text-left px-6 py-3">Subject</th>
                <th className="px-6 py-3">Present</th>
                <th className="px-6 py-3">Total</th>
                <th className="px-6 py-3">Percentage</th>
                <th className="px-6 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {report.map((r, i) => (
                <tr key={i} className="border-t text-center">
                  <td className="text-left px-6 py-3 font-medium">{r.subject}</td>
                  <td className="px-6 py-3">{r.present}</td>
                  <td className="px-6 py-3">{r.total}</td>
                  <td className="px-6 py-3">{r.percent}%</td>
                  <td className="px-6 py-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      parseFloat(r.percent) >= 75
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-600"
                    }`}>
                      {parseFloat(r.percent) >= 75 ? "✅ Safe" : "⚠️ Low"}
                    </span>
                  </td>
                </tr>
              ))}
              {report.length === 0 && (
                <tr>
                  <td colSpan={5} className="text-center py-8 text-gray-400">
                    No attendance records found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

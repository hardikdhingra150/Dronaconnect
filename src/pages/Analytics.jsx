import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase/config";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";

const COLORS = ["#6366f1", "#8b5cf6", "#3b82f6", "#10b981", "#f59e0b", "#ef4444"];

export default function Analytics() {
  const [subjectData, setSubjectData] = useState([]);
  const [roleData, setRoleData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      const usersSnap = await getDocs(collection(db, "users"));
      const subSnap = await getDocs(collection(db, "subjects"));
      const users = usersSnap.docs.map((d) => ({ id: d.id, ...d.data() }));

      // Role distribution
      let students = 0, teachers = 0, admins = 0;
      users.forEach((u) => {
        if (u.role === "student") students++;
        else if (u.role === "teacher") teachers++;
        else admins++;
      });
      setRoleData([
        { name: "Students", value: students },
        { name: "Teachers", value: teachers },
        { name: "Admins", value: admins },
      ]);

      // Subject-wise average attendance
      const studentList = users.filter((u) => u.role === "student");
      const results = [];
      for (const subDoc of subSnap.docs) {
        const recSnap = await getDocs(collection(db, "attendance", subDoc.id, "records"));
        let totalPresent = 0, totalPossible = 0;
        recSnap.forEach((r) => {
          const data = r.data().students;
          studentList.forEach((s) => {
            if (data[s.id] !== undefined) {
              totalPossible++;
              if (data[s.id] === "present") totalPresent++;
            }
          });
        });
        if (totalPossible > 0) {
          results.push({
            subject: subDoc.data().name,
            attendance: parseFloat(((totalPresent / totalPossible) * 100).toFixed(1)),
            classes: recSnap.size,
          });
        }
      }
      setSubjectData(results);
      setLoading(false);
    };
    fetch();
  }, []);

  if (loading) return <div className="p-8 text-gray-400 text-sm">Loading analytics...</div>;

  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Analytics 📈</h1>
        <p className="text-gray-400 text-sm mt-0.5">College-wide attendance insights</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Subject Attendance Bar Chart */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h2 className="font-semibold text-gray-800 mb-1 text-sm">Subject-wise Attendance %</h2>
          <p className="text-xs text-gray-400 mb-4">Average across all students</p>
          {subjectData.length === 0 ? (
            <div className="h-48 flex items-center justify-center text-gray-300 text-sm">No data yet</div>
          ) : (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={subjectData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="subject" tick={{ fontSize: 11, fill: "#9ca3af" }} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: "#9ca3af" }} />
                <Tooltip
                  formatter={(val) => [`${val}%`, "Attendance"]}
                  contentStyle={{ borderRadius: "12px", border: "1px solid #e5e7eb", fontSize: 12 }}
                />
                <Bar dataKey="attendance" radius={[6, 6, 0, 0]}>
                  {subjectData.map((_, i) => (
                    <Cell key={i} fill={parseFloat(subjectData[i].attendance) >= 75 ? "#6366f1" : "#ef4444"} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
          <div className="flex gap-3 mt-3">
            <span className="flex items-center gap-1.5 text-xs text-gray-400"><span className="w-3 h-3 rounded-full bg-indigo-500 inline-block" /> Above 75%</span>
            <span className="flex items-center gap-1.5 text-xs text-gray-400"><span className="w-3 h-3 rounded-full bg-red-400 inline-block" /> Below 75%</span>
          </div>
        </div>

        {/* Role Pie Chart */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h2 className="font-semibold text-gray-800 mb-1 text-sm">User Distribution</h2>
          <p className="text-xs text-gray-400 mb-4">Students, Teachers & Admins</p>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie data={roleData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={4} dataKey="value">
                {roleData.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
              </Pie>
              <Tooltip contentStyle={{ borderRadius: "12px", border: "1px solid #e5e7eb", fontSize: 12 }} />
              <Legend iconType="circle" iconSize={10} wrapperStyle={{ fontSize: "12px" }} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Subject Stats Table */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <h2 className="font-semibold text-gray-800 text-sm">Subject Overview</h2>
          </div>
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                {["Subject", "Classes Held", "Avg Attendance", "Health"].map((h) => (
                  <th key={h} className="text-left px-6 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {subjectData.map((s, i) => (
                <tr key={i} className="border-t border-gray-50 hover:bg-gray-50 transition">
                  <td className="px-6 py-4 font-medium text-gray-800">{s.subject}</td>
                  <td className="px-6 py-4 text-gray-500">{s.classes}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className="w-24 bg-gray-100 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${s.attendance >= 75 ? "bg-indigo-500" : "bg-red-400"}`}
                          style={{ width: `${s.attendance}%` }}
                        />
                      </div>
                      <span className="text-xs font-semibold text-gray-700">{s.attendance}%</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${s.attendance >= 75 ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-600"}`}>
                      {s.attendance >= 75 ? "✅ Healthy" : "⚠️ Low"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../firebase/config";
import { useAuth } from "../../context/AuthContext";
import { Link } from "react-router-dom";

export default function TeacherDashboard() {
  const { user, userData } = useAuth();
  const [subjects, setSubjects] = useState([]);
  const [totalStudents, setTotalStudents] = useState(0);
  const [attendanceCount, setAttendanceCount] = useState(0);

  useEffect(() => {
    const fetch = async () => {
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
    };
    fetch();
  }, [user]);

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return "Good morning";
    if (h < 17) return "Good afternoon";
    return "Good evening";
  };

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {greeting()}, {userData?.name?.split(" ")[0]} 👋
          </h1>
          <p className="text-gray-400 text-sm mt-0.5">
            {new Date().toLocaleDateString("en-IN", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
          </p>
        </div>
        <Link
          to="/mark-attendance"
          className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition shadow-sm"
        >
          + Mark Attendance
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { title: "My Subjects", value: subjects.length, sub: "Assigned to you", bg: "bg-indigo-50", text: "text-indigo-600" },
          { title: "Total Students", value: totalStudents, sub: "In your college", bg: "bg-emerald-50", text: "text-emerald-600" },
          { title: "Classes Taken", value: attendanceCount, sub: "Attendance records", bg: "bg-violet-50", text: "text-violet-600" },
        ].map((s) => (
          <div key={s.title} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex items-center gap-4">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${s.bg}`}>
              <span className={`text-2xl font-bold ${s.text}`}>{s.value}</span>
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest">{s.title}</p>
              <p className="text-xs text-gray-400 mt-0.5">{s.sub}</p>
            </div>
          </div>
        ))}
      </div>

      {/* My Subjects */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
          <h2 className="font-semibold text-gray-800 text-sm">My Subjects</h2>
          <Link to="/mark-attendance" className="text-indigo-600 text-xs font-medium hover:underline">
            Mark attendance →
          </Link>
        </div>
        {subjects.length === 0 ? (
          <div className="px-6 py-12 text-center text-gray-400 text-sm">
            No subjects assigned yet. Contact your admin.
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {subjects.map((s) => (
              <div key={s.id} className="px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-indigo-50 flex items-center justify-center">
                    <svg className="w-4 h-4 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-800">{s.name}</p>
                    <p className="text-xs text-gray-400">{s.department || "No department"}</p>
                  </div>
                </div>
                <Link
                  to="/mark-attendance"
                  className="text-xs bg-indigo-50 hover:bg-indigo-100 text-indigo-600 font-semibold px-3 py-1.5 rounded-lg transition"
                >
                  Mark →
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Reminder Banner */}
      <div className="bg-amber-50 border border-amber-100 rounded-2xl px-5 py-4 flex items-center gap-4">
        <div className="w-9 h-9 bg-amber-100 rounded-xl flex items-center justify-center flex-shrink-0">
          <svg className="w-5 h-5 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <div>
          <p className="text-sm font-semibold text-amber-800">Don't forget!</p>
          <p className="text-xs text-amber-600">Mark attendance for all your subjects before end of day.</p>
        </div>
      </div>
    </div>
  );
}

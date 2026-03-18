// src/pages/Dashboard.jsx
import { useAuth } from "../context/AuthContext";
import AdminDashboard from "../components/dashboard/AdminDashboard";
import TeacherDashboard from "../components/dashboard/TeacherDashboard";
import StudentDashboard from "../components/dashboard/StudentDashboard";

export default function Dashboard() {
  const { userData } = useAuth();

  if (!userData) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto" />
          <p className="text-gray-400 text-sm mt-3">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (userData.role === "admin") return <AdminDashboard />;
  if (userData.role === "teacher") return <TeacherDashboard />;
  return <StudentDashboard />;
}

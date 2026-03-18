import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "../pages/Login";
import Dashboard from "../pages/Dashboard";
import MarkAttendance from "../pages/MarkAttendance";
import StudentPanel from "../pages/StudentPanel";
import AdminPanel from "../pages/AdminPanel";
import Defaulters from "../pages/Defaulters";
import Analytics from "../pages/Analytics";
import Profile from "../pages/Profile";
import Fees from "../pages/Fees";
import Examination from "../pages/Examination";
import Library from "../pages/Library";
import Research from "../pages/Research";
import LMS from "../pages/LMS";
import Timetable from "../pages/Timetable";
import ProtectedRoute from "../components/layout/ProtectedRoute";
import AppLayout from "../components/layout/AppLayout";


export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />

        <Route element={<ProtectedRoute />}>
          <Route element={<AppLayout />}>

            {/* ── General ── */}
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/profile" element={<Profile />} />

            {/* ── All Roles ── */}
            <Route path="/examination" element={<Examination />} />
            <Route path="/library" element={<Library />} />
            <Route path="/research" element={<Research />} />
            <Route path="/lms" element={<LMS />} />
            <Route path="/timetable" element={<Timetable />} /> {/* ✅ moved here */}

            {/* ── Teacher + Admin ── */}
            <Route element={<ProtectedRoute allowedRoles={["teacher", "admin"]} />}>
              <Route path="/mark-attendance" element={<MarkAttendance />} />
              <Route path="/defaulters" element={<Defaulters />} />
            </Route>

            {/* ── Student only ── */}
            <Route element={<ProtectedRoute allowedRoles={["student"]} />}>
              <Route path="/student" element={<StudentPanel />} />
            </Route>

            {/* ── Student + Admin ── */}
            <Route element={<ProtectedRoute allowedRoles={["student", "admin"]} />}>
              <Route path="/fees" element={<Fees />} />
            </Route>

            {/* ── Admin only ── */}
            <Route element={<ProtectedRoute allowedRoles={["admin"]} />}>
              <Route path="/admin" element={<AdminPanel />} />
              <Route path="/analytics" element={<Analytics />} />
            </Route>

          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

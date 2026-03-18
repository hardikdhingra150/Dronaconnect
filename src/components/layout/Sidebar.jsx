import { NavLink } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { logout } from "../../firebase/auth";
import { useNavigate } from "react-router-dom";


const navItems = [
  {
    label: "Dashboard",
    path: "/dashboard",
    roles: ["admin", "teacher", "student"],
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    ),
  },
  {
    label: "My Profile",
    path: "/profile",
    roles: ["admin", "teacher", "student"],
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
    ),
  },
  {
    label: "My Attendance",
    path: "/student",
    roles: ["student"],
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
  },
  {
    label: "Mark Attendance",
    path: "/mark-attendance",
    roles: ["admin", "teacher"],
    badge: "Live",
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
      </svg>
    ),
  },
  {
    label: "Defaulters",
    path: "/defaulters",
    roles: ["admin", "teacher"],
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
      </svg>
    ),
  },
  {
    label: "Analytics",
    path: "/analytics",
    roles: ["admin"],
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
  },
  {
    label: "LMS",
    path: "/lms",
    roles: ["admin", "teacher", "student"],
    badge: "New",
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
      </svg>
    ),
  },
  // ── NEW: Timetable ──────────────────────────────────────────
  {
    label: "Timetable",
    path: "/timetable",
    roles: ["admin", "teacher", "student"],
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
  },
  {
    label: "Examination",
    path: "/examination",
    roles: ["admin", "teacher", "student"],
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
  },
  {
    label: "Fee Details",
    path: "/fees",
    roles: ["admin", "student"],
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
    ),
  },
  {
    label: "Library",
    path: "/library",
    roles: ["admin", "teacher", "student"],
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z" />
      </svg>
    ),
  },
  {
    label: "Research",
    path: "/research",
    roles: ["admin", "teacher", "student"],
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
      </svg>
    ),
  },
  {
    label: "Admin Panel",
    path: "/admin",
    roles: ["admin"],
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
      </svg>
    ),
  },
];


const navGroups = [
  {
    label: "General",
    items: ["Dashboard", "My Profile", "My Attendance"],
  },
  {
    label: "Academic",
    // ── "Timetable" added after "LMS" ──
    items: ["Mark Attendance", "Defaulters", "Analytics", "LMS", "Timetable", "Examination"],
  },
  {
    label: "Finance & Library",
    items: ["Fee Details", "Library"],
  },
  {
    label: "Research",
    items: ["Research"],
  },
  {
    label: "Management",
    items: ["Admin Panel"],
  },
];


export default function Sidebar() {
  const { userData } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  const filtered = navItems.filter((n) => n.roles.includes(userData?.role));

  const getRoleLabel = (role) => {
    if (role === "admin") return "Administrator";
    if (role === "teacher") return "Faculty";
    return "Student";
  };

  const getRoleBadgeColor = (role) => {
    if (role === "admin") return "bg-[#f0d080] text-[#6b0f1a]";
    if (role === "teacher") return "bg-white/20 text-white";
    return "bg-white/20 text-white";
  };

  return (
    <aside className="w-64 min-h-screen bg-[#6b0f1a] flex flex-col shadow-2xl shadow-black/20 relative">

      {/* Gold top accent line */}
      <div className="h-1 w-full bg-gradient-to-r from-[#c9a84c] via-[#f0d080] to-[#c9a84c]" />

      {/* Logo */}
      <div className="px-5 py-5 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#c9a84c] to-[#f0d080] flex items-center justify-center shadow-lg flex-shrink-0">
            <svg className="w-5 h-5 text-[#6b0f1a]" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 3L1 9l4 2.18v6L12 21l7-3.82v-6l2-1.09V17h2V9L12 3zm6.82 6L12 12.72 5.18 9 12 5.28 18.82 9zM17 15.99l-5 2.73-5-2.73v-3.72L12 15l5-2.73v3.72z" />
            </svg>
          </div>
          <div>
            <p className="font-black text-sm leading-none tracking-wide text-white">
              DRONA<span className="text-[#f0d080]">CONNECT</span>
            </p>
            <p className="text-white/30 text-[10px] mt-1 uppercase tracking-[0.15em]">
              Academic ERP Portal
            </p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-5 overflow-y-auto">
        {navGroups.map((group) => {
          const groupItems = filtered.filter((item) =>
            group.items.includes(item.label)
          );
          if (groupItems.length === 0) return null;
          return (
            <div key={group.label}>
              <p className="text-[10px] font-bold text-white/25 uppercase tracking-[0.18em] px-3 mb-1.5">
                {group.label}
              </p>
              <div className="space-y-0.5">
                {groupItems.map((item) => (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 group ${
                        isActive
                          ? "bg-white/15 text-white border border-white/10 shadow-inner"
                          : "text-white/50 hover:bg-white/8 hover:text-white/90"
                      }`
                    }
                  >
                    {({ isActive }) => (
                      <>
                        <span
                          className={`flex-shrink-0 transition-colors ${
                            isActive
                              ? "text-[#f0d080]"
                              : "text-white/30 group-hover:text-white/60"
                          }`}
                        >
                          {item.icon}
                        </span>
                        <span className="flex-1">{item.label}</span>

                        {/* Badges */}
                        {item.badge && (
                          <span className="bg-[#f0d080] text-[#6b0f1a] text-[9px] font-black px-1.5 py-0.5 rounded-full uppercase tracking-wide">
                            {item.badge}
                          </span>
                        )}

                        {/* Active dot */}
                        {isActive && (
                          <span className="w-1.5 h-1.5 rounded-full bg-[#f0d080] flex-shrink-0" />
                        )}
                      </>
                    )}
                  </NavLink>
                ))}
              </div>
            </div>
          );
        })}
      </nav>

      {/* User Profile + Logout */}
      <div className="px-3 py-4 border-t border-white/10 space-y-2">
        <div className="flex items-center gap-3 px-3 py-3 rounded-xl bg-white/8 border border-white/10">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#c9a84c] to-[#f0d080] flex items-center justify-center text-[#6b0f1a] font-black text-sm flex-shrink-0 shadow-md">
            {userData?.name?.charAt(0)?.toUpperCase() || "U"}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-white truncate leading-none mb-1">
              {userData?.name || "User"}
            </p>
            <span
              className={`text-[10px] font-semibold px-2 py-0.5 rounded-full capitalize ${getRoleBadgeColor(userData?.role)}`}
            >
              {getRoleLabel(userData?.role)}
            </span>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-white/40 hover:bg-red-500/20 hover:text-red-300 transition-all duration-150 group"
        >
          <svg
            className="w-4 h-4 group-hover:text-red-300 transition-colors"
            fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          Log Out
        </button>
      </div>

      <div className="px-5 pb-3">
        <p className="text-white/15 text-[10px] text-center">
          DronaConnect v1.0 · © 2026
        </p>
      </div>
    </aside>
  );
}

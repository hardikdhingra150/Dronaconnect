import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";

export default function AppLayout() {
  return (
    <div className="flex min-h-screen bg-[#f5f6fa]">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-auto">

        {/* Top Bar */}
        <header className="bg-white border-b border-gray-100 px-8 py-3 flex items-center justify-between sticky top-0 z-10 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#c9a84c] to-[#f0d080] flex items-center justify-center shadow-sm">
              <svg className="w-4 h-4 text-[#6b0f1a]" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 3L1 9l4 2.18v6L12 21l7-3.82v-6l2-1.09V17h2V9L12 3zm6.82 6L12 12.72 5.18 9 12 5.28 18.82 9zM17 15.99l-5 2.73-5-2.73v-3.72L12 15l5-2.73v3.72z"/>
              </svg>
            </div>
            <div>
              <p className="text-sm font-black text-gray-900 leading-none">
                DRONA<span className="text-[#8b1a2a]">CONNECT</span>
              </p>
              <p className="text-[10px] text-gray-400 uppercase tracking-widest">
                Academic ERP Portal
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <span className="text-xs text-gray-400 hidden sm:block bg-gray-50 px-3 py-1.5 rounded-full border border-gray-100">
              📅 {new Date().toLocaleDateString("en-IN", {
                weekday: "short", day: "numeric",
                month: "short", year: "numeric",
              })}
            </span>
            <div className="relative w-8 h-8 rounded-full bg-[#6b0f1a] flex items-center justify-center cursor-pointer hover:bg-[#8b1a2a] transition-colors shadow-sm">
              <svg className="w-4 h-4 text-[#f0d080]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              <span className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-red-500 rounded-full border-2 border-white text-[7px] text-white flex items-center justify-center font-bold">
                3
              </span>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto">
          <Outlet />
        </main>

      </div>
    </div>
  );
}

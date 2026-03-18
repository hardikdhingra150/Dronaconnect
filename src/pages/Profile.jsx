import { useState, useEffect } from "react";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "../firebase/config";
import { useAuth } from "../context/AuthContext";

export default function Profile() {
  const { user, userData } = useAuth();
  const [form, setForm] = useState({
    name: "",
    rollNo: "",
    department: "",
    phone: "",
  });
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(false);

  // ✅ This is the fix — populate form when userData loads
  useEffect(() => {
    if (userData) {
      setForm({
        name: userData.name || "",
        rollNo: userData.rollNo || "",
        department: userData.department || "",
        phone: userData.phone || "",
      });
    }
  }, [userData]);

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await updateDoc(doc(db, "users", user.uid), form);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      console.error("Error updating profile:", err);
    } finally {
      setLoading(false);
    }
  };

  // Show loader while userData is still null
  if (!userData) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto" />
          <p className="text-gray-400 text-sm mt-3">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
        <p className="text-gray-400 text-sm mt-0.5">
          Update your personal information
        </p>
      </div>

      {/* Avatar */}
      <div className="flex items-center gap-4 mb-8">
        <div className="w-16 h-16 rounded-2xl bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-2xl">
          {userData?.name?.charAt(0)?.toUpperCase() || "U"}
        </div>
        <div>
          <p className="font-bold text-gray-900 text-lg">{userData?.name}</p>
          <p className="text-gray-400 text-sm">{user?.email}</p>
          <span className="inline-block mt-1 bg-indigo-100 text-indigo-600 text-xs font-semibold px-2.5 py-0.5 rounded-full capitalize">
            {userData?.role}
          </span>
        </div>
      </div>

      {saved && (
        <div className="bg-emerald-50 border border-emerald-100 text-emerald-700 px-4 py-3 rounded-xl text-sm mb-5">
          ✅ Profile updated successfully!
        </div>
      )}

      <form
        onSubmit={handleSave}
        className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4"
      >
        {[
          { label: "Full Name", key: "name", type: "text", placeholder: "Your full name" },
          { label: "Roll Number", key: "rollNo", type: "text", placeholder: "22CSE001" },
          { label: "Department", key: "department", type: "text", placeholder: "CSE" },
          { label: "Phone Number", key: "phone", type: "tel", placeholder: "+91 9876543210" },
        ].map((f) => (
          <div key={f.key}>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
              {f.label}
            </label>
            <input
              type={f.type}
              placeholder={f.placeholder}
              value={form[f.key]}
              onChange={(e) => setForm({ ...form, [f.key]: e.target.value })}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:bg-white transition"
            />
          </div>
        ))}

        {/* Read-only */}
        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
            Email Address
          </label>
          <input
            type="email"
            value={user?.email || ""}
            disabled
            className="w-full bg-gray-100 border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-400 cursor-not-allowed"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
            Role
          </label>
          <input
            type="text"
            value={userData?.role || ""}
            disabled
            className="w-full bg-gray-100 border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-400 cursor-not-allowed capitalize"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2.5 rounded-xl text-sm font-semibold transition shadow-sm disabled:opacity-50 flex items-center justify-center gap-2 mt-2"
        >
          {loading ? (
            <>
              <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Saving...
            </>
          ) : (
            "Save Changes"
          )}
        </button>
      </form>
    </div>
  );
}

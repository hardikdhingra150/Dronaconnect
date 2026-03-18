import { useState, useEffect } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc, collection, addDoc, getDocs, updateDoc, deleteDoc } from "firebase/firestore";
import { auth, db } from "../firebase/config";

const TABS = ["Users", "Add User", "Subjects"];

export default function AdminPanel() {
  const [tab, setTab] = useState("Users");
  const [users, setUsers] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [msg, setMsg] = useState({ text: "", type: "success" });
  const [search, setSearch] = useState("");
  const [editUser, setEditUser] = useState(null);
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "student", rollNo: "", department: "" });
  const [subject, setSubject] = useState({ name: "", teacherId: "", department: "" });

  const notify = (text, type = "success") => {
    setMsg({ text, type });
    setTimeout(() => setMsg({ text: "", type: "success" }), 3000);
  };

  const fetchUsers = async () => {
    const snap = await getDocs(collection(db, "users"));
    setUsers(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
  };

  const fetchSubjects = async () => {
    const snap = await getDocs(collection(db, "subjects"));
    setSubjects(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
  };

  useEffect(() => { fetchUsers(); fetchSubjects(); }, []);

  const handleCreateUser = async (e) => {
    e.preventDefault();
    try {
      const cred = await createUserWithEmailAndPassword(auth, form.email, form.password);
      await setDoc(doc(db, "users", cred.user.uid), {
        name: form.name, email: form.email, role: form.role,
        rollNo: form.rollNo, department: form.department,
      });
      notify(`✅ ${form.role} created!`);
      setForm({ name: "", email: "", password: "", role: "student", rollNo: "", department: "" });
      fetchUsers();
    } catch (err) { notify("❌ " + err.message, "error"); }
  };

  const handleUpdateRole = async (userId, newRole) => {
    await updateDoc(doc(db, "users", userId), { role: newRole });
    notify("✅ Role updated!");
    fetchUsers();
  };

  const handleDeleteUser = async (userId) => {
    if (!confirm("Delete this user? This cannot be undone.")) return;
    await deleteDoc(doc(db, "users", userId));
    notify("✅ User deleted!");
    fetchUsers();
  };

  const handleUpdateUser = async (e) => {
    e.preventDefault();
    await updateDoc(doc(db, "users", editUser.id), {
      name: editUser.name, role: editUser.role,
      rollNo: editUser.rollNo, department: editUser.department,
    });
    notify("✅ User updated!");
    setEditUser(null);
    fetchUsers();
  };

  const handleCreateSubject = async (e) => {
    e.preventDefault();
    await addDoc(collection(db, "subjects"), subject);
    notify("✅ Subject created!");
    setSubject({ name: "", teacherId: "", department: "" });
    fetchSubjects();
  };

  const handleDeleteSubject = async (id) => {
    if (!confirm("Delete this subject?")) return;
    await deleteDoc(doc(db, "subjects", id));
    notify("✅ Subject deleted!");
    fetchSubjects();
  };

  const roleColor = (role) => {
    if (role === "admin") return "bg-violet-100 text-violet-600";
    if (role === "teacher") return "bg-blue-100 text-blue-600";
    return "bg-emerald-100 text-emerald-600";
  };

  const filteredUsers = users.filter(
    (u) =>
      u.name?.toLowerCase().includes(search.toLowerCase()) ||
      u.email?.toLowerCase().includes(search.toLowerCase()) ||
      u.role?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Admin Panel</h1>
        <p className="text-gray-400 text-sm mt-0.5">Manage users, roles, and subjects</p>
      </div>

      {msg.text && (
        <div className={`px-4 py-3 rounded-xl text-sm font-medium ${msg.type === "error" ? "bg-red-50 text-red-600 border border-red-100" : "bg-emerald-50 text-emerald-700 border border-emerald-100"}`}>
          {msg.text}
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-100 pb-0">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2.5 text-sm font-semibold border-b-2 transition -mb-px ${tab === t ? "border-indigo-600 text-indigo-600" : "border-transparent text-gray-400 hover:text-gray-600"}`}
          >
            {t}
            {t === "Users" && <span className="ml-2 bg-gray-100 text-gray-500 text-xs px-1.5 py-0.5 rounded-full">{users.length}</span>}
          </button>
        ))}
      </div>

      {/* ── USERS TAB ── */}
      {tab === "Users" && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-3">
            <input
              type="text"
              placeholder="Search by name, email or role..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
            />
          </div>
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                {["Name", "Email", "Roll No", "Department", "Role", "Actions"].map((h) => (
                  <th key={h} className="text-left px-6 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((u) => (
                <tr key={u.id} className="border-t border-gray-50 hover:bg-gray-50 transition">
                  <td className="px-6 py-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-xs flex-shrink-0">
                        {u.name?.charAt(0)?.toUpperCase()}
                      </div>
                      <span className="font-medium text-gray-800">{u.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-3 text-gray-400 text-xs">{u.email}</td>
                  <td className="px-6 py-3 text-gray-500 text-xs">{u.rollNo || "—"}</td>
                  <td className="px-6 py-3 text-gray-500 text-xs">{u.department || "—"}</td>
                  <td className="px-6 py-3">
                    <select
                      value={u.role}
                      onChange={(e) => handleUpdateRole(u.id, e.target.value)}
                      className={`text-xs font-semibold px-2 py-1 rounded-lg border-0 cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-300 ${roleColor(u.role)}`}
                    >
                      <option value="student">Student</option>
                      <option value="teacher">Teacher</option>
                      <option value="admin">Admin</option>
                    </select>
                  </td>
                  <td className="px-6 py-3">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setEditUser(u)}
                        className="text-xs bg-indigo-50 hover:bg-indigo-100 text-indigo-600 px-3 py-1.5 rounded-lg font-medium transition"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteUser(u.id)}
                        className="text-xs bg-red-50 hover:bg-red-100 text-red-500 px-3 py-1.5 rounded-lg font-medium transition"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ── EDIT USER MODAL ── */}
      {editUser && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-md">
            <h3 className="font-bold text-gray-900 mb-4">Edit User</h3>
            <form onSubmit={handleUpdateUser} className="space-y-3">
              {[
                { label: "Name", key: "name", type: "text" },
                { label: "Roll No", key: "rollNo", type: "text" },
                { label: "Department", key: "department", type: "text" },
              ].map((f) => (
                <div key={f.key}>
                  <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wide">{f.label}</label>
                  <input
                    type={f.type}
                    value={editUser[f.key] || ""}
                    onChange={(e) => setEditUser({ ...editUser, [f.key]: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                  />
                </div>
              ))}
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wide">Role</label>
                <select
                  value={editUser.role}
                  onChange={(e) => setEditUser({ ...editUser, role: e.target.value })}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                >
                  <option value="student">Student</option>
                  <option value="teacher">Teacher</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div className="flex gap-2 pt-2">
                <button type="submit" className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white py-2.5 rounded-xl text-sm font-semibold transition">
                  Save Changes
                </button>
                <button type="button" onClick={() => setEditUser(null)} className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-600 py-2.5 rounded-xl text-sm font-semibold transition">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── ADD USER TAB ── */}
      {tab === "Add User" && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 max-w-lg">
          <h3 className="font-semibold text-gray-800 mb-4">Create New User</h3>
          <form onSubmit={handleCreateUser} className="space-y-4">
            {[
              { label: "Full Name", key: "name", type: "text", placeholder: "Rahul Sharma" },
              { label: "Email", key: "email", type: "email", placeholder: "rahul@college.com" },
              { label: "Password", key: "password", type: "password", placeholder: "••••••••" },
              { label: "Roll No (students)", key: "rollNo", type: "text", placeholder: "22CSE001" },
              { label: "Department", key: "department", type: "text", placeholder: "CSE" },
            ].map((f) => (
              <div key={f.key}>
                <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">{f.label}</label>
                <input
                  type={f.type}
                  placeholder={f.placeholder}
                  value={form[f.key]}
                  onChange={(e) => setForm({ ...form, [f.key]: e.target.value })}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                  required={["name", "email", "password"].includes(f.key)}
                />
              </div>
            ))}
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">Role</label>
              <select
                value={form.role}
                onChange={(e) => setForm({ ...form, role: e.target.value })}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
              >
                <option value="student">Student</option>
                <option value="teacher">Teacher</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2.5 rounded-xl text-sm font-semibold transition shadow-sm">
              Create User
            </button>
          </form>
        </div>
      )}

      {/* ── SUBJECTS TAB ── */}
      {tab === "Subjects" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Create Subject */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h3 className="font-semibold text-gray-800 mb-4">Create Subject</h3>
            <form onSubmit={handleCreateSubject} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">Subject Name</label>
                <input
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                  placeholder="Data Structures"
                  value={subject.name}
                  onChange={(e) => setSubject({ ...subject, name: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">Assign Teacher</label>
                <select
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                  value={subject.teacherId}
                  onChange={(e) => setSubject({ ...subject, teacherId: e.target.value })}
                  required
                >
                  <option value="">-- Select Teacher --</option>
                  {users.filter((u) => u.role === "teacher" || u.role === "admin").map((t) => (
                    <option key={t.id} value={t.id}>{t.name} ({t.email})</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">Department</label>
                <input
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                  placeholder="CSE"
                  value={subject.department}
                  onChange={(e) => setSubject({ ...subject, department: e.target.value })}
                />
              </div>
              <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2.5 rounded-xl text-sm font-semibold transition shadow-sm">
                Create Subject
              </button>
            </form>
          </div>

          {/* Subject List */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100">
              <h3 className="font-semibold text-gray-800 text-sm">All Subjects ({subjects.length})</h3>
            </div>
            <div className="divide-y divide-gray-50">
              {subjects.map((s) => {
                const teacher = users.find((u) => u.id === s.teacherId);
                return (
                  <div key={s.id} className="px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition">
                    <div>
                      <p className="text-sm font-semibold text-gray-800">{s.name}</p>
                      <p className="text-xs text-gray-400">
                        {teacher ? teacher.name : "No teacher"} · {s.department || "—"}
                      </p>
                    </div>
                    <button
                      onClick={() => handleDeleteSubject(s.id)}
                      className="text-xs bg-red-50 hover:bg-red-100 text-red-500 px-3 py-1.5 rounded-lg font-medium transition"
                    >
                      Delete
                    </button>
                  </div>
                );
              })}
              {subjects.length === 0 && (
                <div className="px-6 py-8 text-center text-gray-400 text-sm">No subjects yet</div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

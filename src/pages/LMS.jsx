import { useEffect, useState, useRef } from "react";
import {
  collection, getDocs, addDoc, updateDoc, doc,
  query, where, serverTimestamp,
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage } from "../firebase/config";
import { useAuth } from "../context/AuthContext";

// ── Fullscreen Assignment Card ──────────────────────────────
function AssignmentModal({ assign, onClose, onSubmit, submission, uploading, isStudent }) {
  const fileRef = useRef();
  const daysLeft = Math.ceil((new Date(assign.dueDate) - new Date()) / (1000 * 60 * 60 * 24));
  const isOverdue = daysLeft < 0;

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">

        {/* Header */}
        <div className="relative bg-gradient-to-br from-[#6b0f1a] to-[#9b2030] px-7 py-6 rounded-t-3xl overflow-hidden">
          <div className="absolute -right-8 -top-8 w-32 h-32 rounded-full bg-white/10" />
          <div className="absolute right-10 -bottom-6 w-20 h-20 rounded-full bg-[#f0d080]/10" />
          <button onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition text-white">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-3 flex-wrap">
              <span className="bg-indigo-400/30 text-white text-[10px] font-bold px-2.5 py-1 rounded-full border border-white/20">
                {assign.subject}
              </span>
              <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${
                isOverdue ? "bg-red-400/30 border-red-300/30 text-red-200"
                : daysLeft <= 2 ? "bg-amber-400/30 border-amber-300/30 text-amber-200"
                : "bg-emerald-400/30 border-emerald-300/30 text-emerald-200"
              }`}>
                {isOverdue ? `⏰ ${Math.abs(daysLeft)}d overdue` : `📅 ${daysLeft}d left`}
              </span>
            </div>
            <h2 className="text-white font-black text-2xl leading-tight">{assign.title}</h2>
            <p className="text-white/60 text-sm mt-1">by {assign.teacherName}</p>
          </div>
        </div>

        {/* Body */}
        <div className="p-7 space-y-5">

          {/* Description */}
          {assign.description && (
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Description</p>
              <p className="text-gray-700 text-sm leading-relaxed bg-gray-50 rounded-xl p-4 border border-gray-100">
                {assign.description}
              </p>
            </div>
          )}

          {/* Instructions */}
          {assign.instructions && (
            <div className="bg-amber-50 border border-amber-100 rounded-xl p-4">
              <p className="text-xs font-bold text-amber-600 uppercase tracking-widest mb-1">📋 Instructions</p>
              <p className="text-amber-800 text-sm leading-relaxed">{assign.instructions}</p>
            </div>
          )}

          {/* Details Grid */}
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: "Due Date", val: assign.dueDate, icon: "📅" },
              { label: "Max Marks", val: assign.maxMarks, icon: "🏆" },
              { label: "Subject", val: assign.subject, icon: "📚" },
              { label: "Teacher", val: assign.teacherName, icon: "👨‍🏫" },
            ].map(d => (
              <div key={d.label} className="bg-gray-50 rounded-xl p-3.5 border border-gray-100">
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{d.label}</p>
                <p className="text-gray-900 font-bold text-sm mt-1">{d.icon} {d.val || "—"}</p>
              </div>
            ))}
          </div>

          {/* Student Submit Section */}
          {isStudent && (
            <div className="border-t border-gray-100 pt-5">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Your Submission</p>
              {submission ? (
                <div className="space-y-3">
                  <div className={`flex items-center gap-3 p-4 rounded-xl border ${
                    submission.status === "graded"
                      ? "bg-emerald-50 border-emerald-200"
                      : "bg-blue-50 border-blue-200"
                  }`}>
                    <span className="text-2xl">{submission.status === "graded" ? "✅" : "📤"}</span>
                    <div className="flex-1">
                      <p className="font-bold text-gray-900 text-sm">{submission.fileName}</p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {submission.status === "graded"
                          ? `Graded: ${submission.marks}/${assign.maxMarks} marks`
                          : "Submitted — awaiting grade"}
                      </p>
                    </div>
                    <a href={submission.fileUrl} target="_blank" rel="noopener noreferrer"
                      className="text-xs bg-white border border-gray-200 hover:border-indigo-300 text-indigo-600 px-3 py-1.5 rounded-lg font-bold transition">
                      View →
                    </a>
                  </div>
                  {/* Allow resubmit if not graded */}
                  {submission.status !== "graded" && !isOverdue && (
                    <button onClick={() => fileRef.current?.click()}
                      className="w-full text-sm text-gray-500 border border-dashed border-gray-300 hover:border-[#6b0f1a] hover:text-[#6b0f1a] py-3 rounded-xl font-semibold transition">
                      🔄 Resubmit File
                    </button>
                  )}
                </div>
              ) : (
                <div className={`rounded-2xl border-2 border-dashed p-8 text-center transition ${
                  isOverdue ? "border-red-200 bg-red-50" : "border-gray-200 hover:border-[#6b0f1a] bg-gray-50"
                }`}>
                  {isOverdue ? (
                    <>
                      <p className="text-4xl mb-2">⏰</p>
                      <p className="font-bold text-red-600">Deadline Passed</p>
                      <p className="text-red-400 text-sm mt-1">You can no longer submit this assignment</p>
                    </>
                  ) : (
                    <>
                      <p className="text-4xl mb-3">📤</p>
                      <p className="font-bold text-gray-700 mb-1">Upload Your Assignment</p>
                      <p className="text-gray-400 text-xs mb-4">PDF, DOC, DOCX, PPT, PPTX, ZIP — Max 10MB</p>
                      <button onClick={() => fileRef.current?.click()}
                        disabled={uploading}
                        className="bg-[#6b0f1a] hover:bg-[#8b1a2a] text-white font-bold text-sm px-6 py-3 rounded-xl transition shadow-sm disabled:opacity-50 flex items-center gap-2 mx-auto">
                        {uploading ? (
                          <><svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg> Uploading...</>
                        ) : "📎 Choose File & Submit"}
                      </button>
                    </>
                  )}
                </div>
              )}
              <input type="file" ref={fileRef} className="hidden"
                accept=".pdf,.doc,.docx,.ppt,.pptx,.txt,.zip"
                onChange={e => { if (e.target.files[0]) onSubmit(assign.id, e.target.files[0]); }} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Research Paper Upload Modal ─────────────────────────────
function ResearchModal({ onClose, onSubmit, submitting }) {
  const fileRef = useRef();
  const [form, setForm] = useState({ title: "", authors: "", journal: "", year: new Date().getFullYear().toString(), doi: "", abstract: "", status: "published" });
  const [file, setFile] = useState(null);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="relative bg-gradient-to-br from-indigo-600 to-violet-700 px-7 py-6 rounded-t-3xl overflow-hidden">
          <div className="absolute -right-8 -top-8 w-32 h-32 rounded-full bg-white/10" />
          <button onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition text-white">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <div className="relative z-10">
            <p className="text-white/60 text-xs font-bold uppercase tracking-widest mb-1">Research Portal</p>
            <h2 className="text-white font-black text-xl">Submit Research Paper 🔬</h2>
          </div>
        </div>

        <div className="p-6 space-y-4">
          {[
            { label: "Paper Title", key: "title", placeholder: "Deep Learning for Medical Imaging..." },
            { label: "Authors", key: "authors", placeholder: "Your Name, Co-Author Name" },
            { label: "Journal / Conference", key: "journal", placeholder: "IEEE Transactions on..." },
            { label: "Year", key: "year", placeholder: "2026" },
            { label: "DOI (Optional)", key: "doi", placeholder: "10.1109/..." },
          ].map(f => (
            <div key={f.key}>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">{f.label}</label>
              <input type="text" placeholder={f.placeholder} value={form[f.key]}
                onChange={e => setForm({ ...form, [f.key]: e.target.value })}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>
          ))}

          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Status</label>
            <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
              <option value="published">Published</option>
              <option value="under_review">Under Review</option>
              <option value="draft">Draft</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Abstract</label>
            <textarea rows={3} placeholder="Brief abstract of your research..." value={form.abstract}
              onChange={e => setForm({ ...form, abstract: e.target.value })}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none" />
          </div>

          {/* File Upload */}
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">
              Upload Paper (Optional)
            </label>
            <div onClick={() => fileRef.current?.click()}
              className="border-2 border-dashed border-gray-200 hover:border-indigo-400 rounded-xl p-5 text-center cursor-pointer transition bg-gray-50 hover:bg-indigo-50">
              {file ? (
                <div className="flex items-center justify-center gap-2">
                  <span className="text-xl">📄</span>
                  <span className="text-sm font-semibold text-gray-700">{file.name}</span>
                </div>
              ) : (
                <>
                  <p className="text-2xl mb-1">📎</p>
                  <p className="text-sm text-gray-500 font-medium">Click to attach PDF</p>
                  <p className="text-xs text-gray-400 mt-0.5">PDF, DOC, DOCX supported</p>
                </>
              )}
            </div>
            <input type="file" ref={fileRef} className="hidden"
              accept=".pdf,.doc,.docx"
              onChange={e => setFile(e.target.files[0])} />
          </div>

          <button
            onClick={() => onSubmit(form, file)}
            disabled={!form.title || submitting}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-xl font-bold text-sm transition shadow-sm disabled:opacity-50 flex items-center justify-center gap-2">
            {submitting ? (
              <><svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg> Submitting...</>
            ) : "🚀 Submit Paper"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main LMS Page ───────────────────────────────────────────
export default function LMS() {
  const { user, userData } = useAuth();
  const [tab, setTab] = useState("assignments");
  const [assignments, setAssignments] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState({ text: "", type: "success" });
  const [uploading, setUploading] = useState({});
  const [selectedAssign, setSelectedAssign] = useState(null);
  const [showResearchModal, setShowResearchModal] = useState(false);
  const [researchSubmitting, setResearchSubmitting] = useState(false);
  const [form, setForm] = useState({ title: "", subjectId: "", description: "", dueDate: "", maxMarks: "100", instructions: "" });

  const isTeacher = userData?.role === "teacher" || userData?.role === "admin";
  const isStudent = userData?.role === "student";

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    setLoading(true);
    const assignQ = isTeacher
      ? query(collection(db, "assignments"), where("teacherId", "==", user.uid))
      : collection(db, "assignments");
    const subQ = isStudent
      ? query(collection(db, "submissions"), where("studentId", "==", user.uid))
      : collection(db, "submissions");

    const [aSnap, sSnap, subjectsSnap] = await Promise.all([
      getDocs(assignQ), getDocs(subQ), getDocs(collection(db, "subjects")),
    ]);

    setAssignments(aSnap.docs.map(d => ({ id: d.id, ...d.data() }))
      .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate)));
    setSubmissions(sSnap.docs.map(d => ({ id: d.id, ...d.data() })));
    setSubjects(subjectsSnap.docs.map(d => ({ id: d.id, ...d.data() }))
      .filter(s => !isTeacher || s.teacherId === user.uid));
    setLoading(false);
  };

  const notify = (text, type = "success") => {
    setMsg({ text, type });
    setTimeout(() => setMsg({ text: "", type: "success" }), 4000);
  };

  const handleFileSubmit = async (assignmentId, file) => {
    setUploading(prev => ({ ...prev, [assignmentId]: true }));
    try {
      const storageRef = ref(storage, `submissions/${user.uid}/${assignmentId}/${file.name}`);
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);
      const existing = submissions.find(s => s.assignmentId === assignmentId && s.studentId === user.uid);
      if (existing) {
        await updateDoc(doc(db, "submissions", existing.id), {
          fileUrl: url, fileName: file.name, submittedAt: serverTimestamp(), status: "submitted",
        });
      } else {
        await addDoc(collection(db, "submissions"), {
          assignmentId, studentId: user.uid, studentName: userData?.name,
          rollNo: userData?.rollNo, fileUrl: url, fileName: file.name,
          submittedAt: serverTimestamp(), status: "submitted", marks: null,
        });
      }
      notify("✅ Assignment submitted successfully!");
      fetchAll();
      setSelectedAssign(null);
    } catch {
      notify("❌ Upload failed. Check Firebase Storage rules.", "error");
    } finally {
      setUploading(prev => ({ ...prev, [assignmentId]: false }));
    }
  };

  const handleResearchSubmit = async (form, file) => {
    setResearchSubmitting(true);
    try {
      let fileUrl = null, fileName = null;
      if (file) {
        const storageRef = ref(storage, `research/${user.uid}/${Date.now()}_${file.name}`);
        await uploadBytes(storageRef, file);
        fileUrl = await getDownloadURL(storageRef);
        fileName = file.name;
      }
      await addDoc(collection(db, "research_papers"), {
        ...form, submittedBy: user.uid, submittedByName: userData?.name,
        fileUrl, fileName, createdAt: serverTimestamp(),
      });
      notify("✅ Research paper submitted!");
      setShowResearchModal(false);
    } catch {
      notify("❌ Submission failed.", "error");
    } finally {
      setResearchSubmitting(false);
    }
  };

  const handleCreateAssignment = async (e) => {
    e.preventDefault();
    const subject = subjects.find(s => s.id === form.subjectId);
    await addDoc(collection(db, "assignments"), {
      ...form, subject: subject?.name || "", teacherId: user.uid,
      teacherName: userData?.name, createdAt: serverTimestamp(), status: "active",
    });
    notify("✅ Assignment created!");
    setForm({ title: "", subjectId: "", description: "", dueDate: "", maxMarks: "100", instructions: "" });
    fetchAll();
    setTab("assignments");
  };

  const handleGrade = async (submissionId, marks, maxMarks) => {
    await updateDoc(doc(db, "submissions", submissionId), {
      marks: parseFloat(marks), status: "graded",
      gradedAt: serverTimestamp(), gradedBy: userData?.name,
    });
    notify("✅ Grade saved!");
    fetchAll();
  };

  const getSubmission = (assignmentId) =>
    submissions.find(s => s.assignmentId === assignmentId && s.studentId === user.uid);
  const getSubmissionsFor = (assignmentId) =>
    submissions.filter(s => s.assignmentId === assignmentId);

  const getDaysLeft = (dueDate) =>
    Math.ceil((new Date(dueDate) - new Date()) / (1000 * 60 * 60 * 24));

  const TABS = [
    { key: "assignments", label: "📋 Assignments" },
    ...(isStudent ? [{ key: "submitted", label: "✅ My Submissions" }] : [{ key: "submissions", label: "📥 All Submissions" }]),
    ...(isTeacher ? [{ key: "create", label: "➕ Create Assignment" }] : []),
  ];

  return (
    <div className="min-h-full bg-[#f5f6fa]">

      {/* Modals */}
      {selectedAssign && (
        <AssignmentModal
          assign={selectedAssign}
          onClose={() => setSelectedAssign(null)}
          onSubmit={handleFileSubmit}
          submission={isStudent ? getSubmission(selectedAssign.id) : null}
          uploading={uploading[selectedAssign.id]}
          isStudent={isStudent}
        />
      )}
      {showResearchModal && (
        <ResearchModal
          onClose={() => setShowResearchModal(false)}
          onSubmit={handleResearchSubmit}
          submitting={researchSubmitting}
        />
      )}

      {/* Hero */}
      <div className="relative bg-gradient-to-br from-[#6b0f1a] via-[#7a1222] to-[#4a0a12] px-8 py-8 overflow-hidden">
        <div className="absolute -right-10 -top-10 w-56 h-56 rounded-full bg-white/5" />
        <div className="absolute right-32 -bottom-8 w-36 h-36 rounded-full bg-[#f0d080]/10 translate-y-1/2" />
        <div className="absolute inset-0 bg-cover bg-center opacity-10 mix-blend-overlay"
          style={{ backgroundImage: "url('/campus.jpg')" }} />
        <div className="relative z-10 flex items-center justify-between flex-wrap gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-1.5 h-4 bg-[#f0d080] rounded-full" />
              <span className="text-[#f0d080] text-xs font-bold uppercase tracking-[0.2em]">
                Learning Management
              </span>
            </div>
            <h1 className="text-3xl font-black text-white">LMS Portal 🎓</h1>
            <p className="text-white/50 text-sm mt-1">
              Assignments, submissions and grading
            </p>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            {/* Research Paper Upload Button (all roles) */}
            <button
              onClick={() => setShowResearchModal(true)}
              className="flex items-center gap-2 bg-indigo-500/80 hover:bg-indigo-500 border border-indigo-400/30 text-white font-bold text-sm px-4 py-2.5 rounded-xl transition backdrop-blur-sm">
              🔬 Submit Research Paper
            </button>
            <div className="flex gap-2">
              {[
                { val: assignments.length, label: "Assignments" },
                { val: submissions.filter(s => s.status !== "graded").length, label: "Pending" },
              ].map(s => (
                <div key={s.label} className="bg-white/10 backdrop-blur-sm rounded-xl px-4 py-3 border border-white/15 text-center">
                  <p className="text-[#f0d080] font-black text-xl">{s.val}</p>
                  <p className="text-white/50 text-[10px] uppercase tracking-wide mt-0.5">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="p-8 space-y-6">
        {msg.text && (
          <div className={`px-4 py-3 rounded-xl text-sm font-medium ${
            msg.type === "error"
              ? "bg-red-50 border border-red-100 text-red-600"
              : "bg-emerald-50 border border-emerald-100 text-emerald-700"
          }`}>{msg.text}</div>
        )}

        {/* Tabs */}
        <div className="flex gap-2 border-b border-gray-200 flex-wrap">
          {TABS.map(t => (
            <button key={t.key} onClick={() => setTab(t.key)}
              className={`px-4 py-2.5 text-sm font-bold border-b-2 transition -mb-px ${
                tab === t.key
                  ? "border-[#6b0f1a] text-[#6b0f1a]"
                  : "border-transparent text-gray-400 hover:text-gray-600"
              }`}>
              {t.label}
            </button>
          ))}
        </div>

        {/* ── Assignments Tab ── */}
        {tab === "assignments" && (
          <div className="space-y-4">
            {loading ? (
              <div className="py-16 text-center bg-white rounded-2xl border border-gray-100">
                <div className="w-8 h-8 border-4 border-[#6b0f1a]/20 border-t-[#6b0f1a] rounded-full animate-spin mx-auto" />
              </div>
            ) : assignments.length === 0 ? (
              <div className="py-20 text-center bg-white rounded-2xl border border-gray-100">
                <p className="text-5xl mb-3">📋</p>
                <p className="text-gray-500 font-semibold">No assignments yet</p>
                {isTeacher && (
                  <button onClick={() => setTab("create")}
                    className="mt-4 bg-[#6b0f1a] hover:bg-[#8b1a2a] text-white text-sm font-bold px-5 py-2.5 rounded-xl transition">
                    ➕ Create First Assignment
                  </button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {assignments.map(assign => {
                  const daysLeft = getDaysLeft(assign.dueDate);
                  const isOverdue = daysLeft < 0;
                  const submission = isStudent ? getSubmission(assign.id) : null;
                  const subCount = isTeacher ? getSubmissionsFor(assign.id).length : 0;
                  const isSubmitted = !!submission;
                  const isGraded = submission?.status === "graded";

                  return (
                    <div
                      key={assign.id}
                      onClick={() => setSelectedAssign(assign)}
                      className={`bg-white rounded-2xl border shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-200 overflow-hidden cursor-pointer group ${
                        isOverdue ? "border-red-100" : isGraded ? "border-emerald-100" : "border-gray-100"
                      }`}
                    >
                      {/* Color bar */}
                      <div className={`h-1.5 ${
                        isGraded ? "bg-gradient-to-r from-emerald-400 to-teal-500"
                        : isOverdue ? "bg-gradient-to-r from-red-400 to-rose-500"
                        : daysLeft <= 2 ? "bg-gradient-to-r from-amber-400 to-orange-400"
                        : "bg-gradient-to-r from-[#6b0f1a] to-[#9b2030]"
                      }`} />

                      <div className="p-5">
                        <div className="flex items-start justify-between gap-2 mb-3">
                          <span className="bg-indigo-50 text-indigo-700 text-[10px] font-bold px-2 py-0.5 rounded-full border border-indigo-100">
                            {assign.subject}
                          </span>
                          {isStudent && (
                            isGraded ? <span className="bg-emerald-100 text-emerald-700 text-[10px] font-bold px-2 py-0.5 rounded-full">✅ {submission.marks}/{assign.maxMarks}</span>
                            : isSubmitted ? <span className="bg-blue-100 text-blue-700 text-[10px] font-bold px-2 py-0.5 rounded-full">📤 Submitted</span>
                            : isOverdue ? <span className="bg-red-100 text-red-600 text-[10px] font-bold px-2 py-0.5 rounded-full">⏰ Overdue</span>
                            : <span className="bg-amber-100 text-amber-700 text-[10px] font-bold px-2 py-0.5 rounded-full">📝 Pending</span>
                          )}
                          {isTeacher && (
                            <span className="bg-gray-100 text-gray-600 text-[10px] font-bold px-2 py-0.5 rounded-full">
                              {subCount} submitted
                            </span>
                          )}
                        </div>

                        <h3 className="font-black text-gray-900 text-sm leading-tight mb-1 group-hover:text-[#6b0f1a] transition-colors">
                          {assign.title}
                        </h3>
                        {assign.description && (
                          <p className="text-gray-400 text-xs leading-relaxed line-clamp-2 mb-3">
                            {assign.description}
                          </p>
                        )}

                        <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-50">
                          <div>
                            <p className="text-xs text-gray-400">
                              🏆 {assign.maxMarks} marks
                            </p>
                            <p className={`text-xs font-bold mt-0.5 ${
                              isOverdue ? "text-red-500"
                              : daysLeft <= 2 ? "text-amber-500"
                              : "text-gray-500"
                            }`}>
                              📅 {assign.dueDate}
                              {!isOverdue && ` · ${daysLeft}d left`}
                            </p>
                          </div>
                          <span className="text-xs text-[#6b0f1a] font-bold group-hover:gap-2 flex items-center gap-1 transition-all">
                            View
                            <svg className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                            </svg>
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ── Student Submissions ── */}
        {tab === "submitted" && isStudent && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white flex items-center gap-2.5">
              <div className="w-1 h-5 bg-[#6b0f1a] rounded-full" />
              <h2 className="font-bold text-gray-900 text-sm">My Submissions</h2>
              <span className="bg-gray-100 text-gray-500 text-xs font-semibold px-2 py-0.5 rounded-full">
                {submissions.length}
              </span>
            </div>
            {submissions.length === 0 ? (
              <div className="py-16 text-center">
                <p className="text-4xl mb-3">📭</p>
                <p className="text-gray-500 font-semibold">No submissions yet</p>
                <p className="text-gray-400 text-sm mt-1">Go to Assignments tab and submit</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-50">
                {submissions.map(s => {
                  const assign = assignments.find(a => a.id === s.assignmentId);
                  return (
                    <div key={s.id} className="px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition group">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg flex-shrink-0 ${
                          s.status === "graded" ? "bg-emerald-100" : "bg-blue-100"
                        }`}>
                          {s.status === "graded" ? "✅" : "📤"}
                        </div>
                        <div>
                          <p className="font-bold text-gray-900 text-sm group-hover:text-[#6b0f1a] transition-colors">
                            {assign?.title || "Assignment"}
                          </p>
                          <p className="text-xs text-gray-400 mt-0.5">📎 {s.fileName}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <a href={s.fileUrl} target="_blank" rel="noopener noreferrer"
                          className="text-xs bg-indigo-50 hover:bg-indigo-100 text-indigo-600 px-3 py-1.5 rounded-lg font-bold transition border border-indigo-100">
                          View →
                        </a>
                        <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                          s.status === "graded"
                            ? "bg-emerald-100 text-emerald-700 border border-emerald-200"
                            : "bg-blue-100 text-blue-700 border border-blue-200"
                        }`}>
                          {s.status === "graded" ? `✅ ${s.marks}/${assign?.maxMarks}` : "⏳ Pending Grade"}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ── Teacher All Submissions with Grading ── */}
        {tab === "submissions" && isTeacher && (
          <div className="space-y-6">
            {assignments.map(assign => {
              const assignSubs = getSubmissionsFor(assign.id);
              if (assignSubs.length === 0) return null;
              return (
                <div key={assign.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                  <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white flex items-center gap-2.5">
                    <div className="w-1 h-5 bg-[#6b0f1a] rounded-full" />
                    <div>
                      <h2 className="font-bold text-gray-900 text-sm">{assign.title}</h2>
                      <p className="text-xs text-gray-400">{assign.subject} · {assignSubs.length} submission{assignSubs.length !== 1 ? "s" : ""}</p>
                    </div>
                  </div>
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50">
                      <tr>{["Student", "Roll No", "File", "Submitted", "Marks", "Status"].map(h => (
                        <th key={h} className="text-left px-6 py-3 text-xs font-bold text-gray-400 uppercase tracking-widest">{h}</th>
                      ))}</tr>
                    </thead>
                    <tbody>
                      {assignSubs.map(s => (
                        <tr key={s.id} className="border-t border-gray-50 hover:bg-gray-50 transition">
                          <td className="px-6 py-3.5 font-semibold text-gray-800">{s.studentName}</td>
                          <td className="px-6 py-3.5 text-gray-400 text-xs">{s.rollNo || "—"}</td>
                          <td className="px-6 py-3.5">
                            <a href={s.fileUrl} target="_blank" rel="noopener noreferrer"
                              className="text-xs text-indigo-600 hover:underline font-semibold flex items-center gap-1">
                              📎 {s.fileName?.slice(0, 18)}{s.fileName?.length > 18 ? "..." : ""}
                            </a>
                          </td>
                          <td className="px-6 py-3.5 text-gray-400 text-xs">
                            {s.submittedAt?.toDate?.()?.toLocaleDateString("en-IN") || "—"}
                          </td>
                          <td className="px-6 py-3.5">
                            <div className="flex items-center gap-1">
                              <input type="number" placeholder="—"
                                defaultValue={s.marks || ""}
                                min="0" max={assign.maxMarks}
                                onBlur={e => { if (e.target.value) handleGrade(s.id, e.target.value, assign.maxMarks); }}
                                className="w-16 bg-gray-50 border border-gray-200 rounded-lg px-2 py-1 text-xs text-center focus:outline-none focus:ring-2 focus:ring-[#6b0f1a]" />
                              <span className="text-gray-400 text-xs">/{assign.maxMarks}</span>
                            </div>
                          </td>
                          <td className="px-6 py-3.5">
                            <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                              s.status === "graded"
                                ? "bg-emerald-100 text-emerald-700"
                                : "bg-amber-100 text-amber-700"
                            }`}>
                              {s.status === "graded" ? "✅ Graded" : "⏳ Pending"}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              );
            })}
            {assignments.every(a => getSubmissionsFor(a.id).length === 0) && (
              <div className="py-16 text-center bg-white rounded-2xl border border-gray-100">
                <p className="text-4xl mb-3">📭</p>
                <p className="text-gray-500 font-semibold">No submissions received yet</p>
              </div>
            )}
          </div>
        )}

        {/* ── Create Assignment (Teacher) ── */}
        {tab === "create" && isTeacher && (
          <div className="max-w-xl">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="bg-gradient-to-r from-[#6b0f1a] to-[#9b2030] px-6 py-5">
                <h3 className="text-white font-black text-lg">Create Assignment</h3>
                <p className="text-white/60 text-xs mt-0.5">Students will be notified instantly</p>
              </div>
              <form onSubmit={handleCreateAssignment} className="p-6 space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Subject</label>
                  <select
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#6b0f1a]"
                    value={form.subjectId}
                    onChange={e => setForm({ ...form, subjectId: e.target.value })}
                    required>
                    <option value="">-- Select Subject --</option>
                    {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                </div>
                {[
                  { label: "Assignment Title", key: "title", type: "text", placeholder: "Assignment 1 — Arrays & Sorting", required: true },
                  { label: "Description", key: "description", type: "text", placeholder: "Brief description of the task" },
                  { label: "Instructions for Students", key: "instructions", type: "text", placeholder: "Submit as PDF, max 10MB" },
                  { label: "Due Date", key: "dueDate", type: "date", required: true },
                  { label: "Max Marks", key: "maxMarks", type: "number", placeholder: "100" },
                ].map(f => (
                  <div key={f.key}>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">{f.label}</label>
                    <input type={f.type} placeholder={f.placeholder} value={form[f.key]}
                      onChange={e => setForm({ ...form, [f.key]: e.target.value })}
                      required={f.required}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#6b0f1a]" />
                  </div>
                ))}
                <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-3">
                  <p className="text-indigo-700 text-xs font-semibold">
                    📤 Students can upload PDF, DOC, PPT, ZIP files directly from the portal.
                  </p>
                </div>
                <button type="submit"
                  className="w-full bg-[#6b0f1a] hover:bg-[#8b1a2a] text-white py-3 rounded-xl font-bold text-sm transition shadow-sm">
                  🚀 Publish Assignment
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

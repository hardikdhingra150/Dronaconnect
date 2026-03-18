import { useEffect, useState } from "react";
import { collection, getDocs, addDoc, updateDoc, doc, query, where, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase/config";
import { useAuth } from "../context/AuthContext";

export default function Library() {
  const { user, userData } = useAuth();
  const [tab, setTab] = useState("books");
  const [books, setBooks] = useState([]);
  const [issued, setIssued] = useState([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState({ text: "", type: "success" });
  const [bookForm, setBookForm] = useState({ title: "", author: "", isbn: "", category: "", totalCopies: "", available: "", publisher: "", year: "" });
  const [issueForm, setIssueForm] = useState({ bookId: "", studentId: "", studentName: "" });
  const [students, setStudents] = useState([]);
  const isAdmin = userData?.role === "admin";

  useEffect(() => { fetchBooks(); fetchIssued(); if (isAdmin) fetchStudents(); }, []);

  const fetchStudents = async () => {
    const snap = await getDocs(collection(db, "users"));
    setStudents(snap.docs.map(d => ({ id: d.id, ...d.data() })).filter(u => u.role === "student"));
  };

  const fetchBooks = async () => {
    const snap = await getDocs(collection(db, "library_books"));
    setBooks(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    setLoading(false);
  };

  const fetchIssued = async () => {
    let snap;
    if (isAdmin) snap = await getDocs(collection(db, "library_issued"));
    else { const q = query(collection(db, "library_issued"), where("studentId", "==", user.uid)); snap = await getDocs(q); }
    setIssued(snap.docs.map(d => ({ id: d.id, ...d.data() })));
  };

  const notify = (text, type = "success") => { setMsg({ text, type }); setTimeout(() => setMsg({ text: "", type: "success" }), 3000); };

  const handleAddBook = async (e) => {
    e.preventDefault();
    await addDoc(collection(db, "library_books"), { ...bookForm, totalCopies: parseInt(bookForm.totalCopies), available: parseInt(bookForm.available), addedAt: serverTimestamp() });
    notify("✅ Book added to library!");
    setBookForm({ title: "", author: "", isbn: "", category: "", totalCopies: "", available: "", publisher: "", year: "" });
    fetchBooks();
  };

  const handleIssueBook = async (e) => {
    e.preventDefault();
    const book = books.find(b => b.id === issueForm.bookId);
    const student = students.find(s => s.id === issueForm.studentId);
    if (!book || book.available < 1) { notify("❌ No copies available!", "error"); return; }
    const issuedDate = new Date();
    const dueDate = new Date(issuedDate);
    dueDate.setDate(dueDate.getDate() + 30);
    await addDoc(collection(db, "library_issued"), {
      bookId: issueForm.bookId, bookTitle: book.title, bookAuthor: book.author,
      studentId: issueForm.studentId, studentName: student?.name,
      rollNo: student?.rollNo, issuedDate: issuedDate.toISOString().split("T")[0],
      dueDate: dueDate.toISOString().split("T")[0], status: "issued",
    });
    await updateDoc(doc(db, "library_books", issueForm.bookId), { available: book.available - 1 });
    notify("✅ Book issued successfully!");
    fetchBooks(); fetchIssued();
  };

  const handleReturn = async (issuedDoc) => {
    await updateDoc(doc(db, "library_issued", issuedDoc.id), { status: "returned", returnedDate: new Date().toISOString().split("T")[0] });
    const book = books.find(b => b.id === issuedDoc.bookId);
    if (book) await updateDoc(doc(db, "library_books", issuedDoc.bookId), { available: book.available + 1 });
    notify("✅ Book returned!");
    fetchBooks(); fetchIssued();
  };

  const getDaysLeft = (dueDate) => {
    const today = new Date();
    const due = new Date(dueDate);
    const diff = Math.ceil((due - today) / (1000 * 60 * 60 * 24));
    return diff;
  };

  const TABS = [
    { key: "books", label: "📚 All Books" },
    { key: "issued", label: "📖 Issued Books" },
    ...(isAdmin ? [{ key: "addbook", label: "➕ Add Book" }, { key: "issuebook", label: "📤 Issue Book" }] : []),
  ];

  return (
    <div className="min-h-full bg-[#f5f6fa]">
      <div className="relative bg-gradient-to-br from-[#6b0f1a] via-[#7a1222] to-[#4a0a12] px-8 py-8 overflow-hidden">
        <div className="absolute -right-10 -top-10 w-56 h-56 rounded-full bg-white/5" />
        <div className="absolute inset-0 bg-cover bg-center opacity-10 mix-blend-overlay" style={{ backgroundImage: "url('/campus.jpg')" }} />
        <div className="relative z-10 flex items-center justify-between flex-wrap gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-1.5 h-4 bg-[#f0d080] rounded-full" />
              <span className="text-[#f0d080] text-xs font-bold uppercase tracking-[0.2em]">Central Library</span>
            </div>
            <h1 className="text-3xl font-black text-white">Library Management 📚</h1>
            <p className="text-white/50 text-sm mt-1">Issue, track and return books</p>
          </div>
          <div className="flex gap-3">
            {[{ val: books.length, label: "Total Books" }, { val: issued.filter(i => i.status === "issued").length, label: "Issued" }, { val: books.reduce((a, b) => a + (b.available || 0), 0), label: "Available" }].map(s => (
              <div key={s.label} className="bg-white/10 backdrop-blur-sm rounded-xl px-4 py-3 border border-white/15 text-center">
                <p className="text-[#f0d080] font-black text-xl">{s.val}</p>
                <p className="text-white/50 text-[10px] uppercase tracking-wide mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="p-8 space-y-6">
        {msg.text && <div className={`px-4 py-3 rounded-xl text-sm font-medium ${msg.type === "error" ? "bg-red-50 border border-red-100 text-red-600" : "bg-emerald-50 border border-emerald-100 text-emerald-700"}`}>{msg.text}</div>}

        <div className="flex gap-2 border-b border-gray-200 pb-0 flex-wrap">
          {TABS.map(t => (
            <button key={t.key} onClick={() => setTab(t.key)}
              className={`px-4 py-2.5 text-sm font-bold border-b-2 transition -mb-px ${tab === t.key ? "border-[#6b0f1a] text-[#6b0f1a]" : "border-transparent text-gray-400 hover:text-gray-600"}`}>
              {t.label}
            </button>
          ))}
        </div>

        {/* All Books */}
        {tab === "books" && (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {loading ? <div className="col-span-3 py-16 text-center"><div className="w-8 h-8 border-4 border-[#6b0f1a]/20 border-t-[#6b0f1a] rounded-full animate-spin mx-auto" /></div>
              : books.length === 0 ? <div className="col-span-3 py-16 text-center"><p className="text-4xl mb-3">📚</p><p className="text-gray-500 font-semibold">No books in library yet</p></div>
              : books.map(book => (
                <div key={book.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 overflow-hidden">
                  <div className="bg-gradient-to-r from-[#6b0f1a] to-[#9b2030] px-5 py-3">
                    <span className="text-[#f0d080] text-[10px] font-bold uppercase tracking-widest">{book.category}</span>
                  </div>
                  <div className="p-5">
                    <h3 className="font-black text-gray-900 text-sm leading-tight mb-1">{book.title}</h3>
                    <p className="text-gray-500 text-xs mb-3">by {book.author} · {book.year}</p>
                    <p className="text-gray-400 text-xs mb-4">ISBN: {book.isbn || "—"} · {book.publisher}</p>
                    <div className="flex items-center justify-between">
                      <div className="flex gap-2">
                        <span className="bg-gray-100 text-gray-600 text-xs font-semibold px-2 py-1 rounded-full">Total: {book.totalCopies}</span>
                        <span className={`text-xs font-bold px-2 py-1 rounded-full ${book.available > 0 ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-600"}`}>
                          Available: {book.available}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        )}

        {/* Issued Books */}
        {tab === "issued" && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white flex items-center gap-2.5">
              <div className="w-1 h-5 bg-[#6b0f1a] rounded-full" />
              <h2 className="font-bold text-gray-900 text-sm">Issued Books</h2>
            </div>
            {issued.length === 0 ? (
              <div className="py-16 text-center"><p className="text-4xl mb-3">📖</p><p className="text-gray-500 font-semibold">No books issued yet</p></div>
            ) : (
              <div className="divide-y divide-gray-50">
                {issued.map(item => {
                  const daysLeft = getDaysLeft(item.dueDate);
                  const isOverdue = daysLeft < 0;
                  const isWarning = daysLeft >= 0 && daysLeft <= 5;
                  return (
                    <div key={item.id} className={`px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition group ${isOverdue ? "bg-red-50/30" : ""}`}>
                      <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0 ${isOverdue ? "bg-red-100" : isWarning ? "bg-amber-100" : "bg-indigo-100"}`}>
                          📖
                        </div>
                        <div>
                          <p className="font-bold text-gray-900 text-sm group-hover:text-[#6b0f1a] transition-colors">{item.bookTitle}</p>
                          <p className="text-xs text-gray-400">by {item.bookAuthor}</p>
                          {isAdmin && <p className="text-xs text-gray-400 mt-0.5">👤 {item.studentName} ({item.rollNo})</p>}
                        </div>
                      </div>
                      <div className="flex items-center gap-3 text-right">
                        <div>
                          <p className="text-xs text-gray-400">Issued: {item.issuedDate}</p>
                          <p className={`text-xs font-bold mt-0.5 ${isOverdue ? "text-red-600" : isWarning ? "text-amber-600" : "text-gray-600"}`}>
                            Due: {item.dueDate} {isOverdue ? `(${Math.abs(daysLeft)}d overdue)` : isWarning ? `(${daysLeft}d left)` : ""}
                          </p>
                        </div>
                        {item.status === "issued" ? (
                          isAdmin ? (
                            <button onClick={() => handleReturn(item)}
                              className="text-xs bg-emerald-50 hover:bg-emerald-100 text-emerald-700 px-3 py-1.5 rounded-lg font-bold transition border border-emerald-200">
                              ✅ Return
                            </button>
                          ) : (
                            <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${isOverdue ? "bg-red-100 text-red-700 border border-red-200" : "bg-blue-100 text-blue-700 border border-blue-200"}`}>
                              {isOverdue ? "Overdue" : "Issued"}
                            </span>
                          )
                        ) : (
                          <span className="bg-gray-100 text-gray-500 text-xs font-bold px-2.5 py-1 rounded-full">Returned</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Add Book (Admin) */}
        {tab === "addbook" && isAdmin && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 max-w-xl">
            <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2"><div className="w-1 h-5 bg-[#6b0f1a] rounded-full" /> Add Book to Library</h3>
            <form onSubmit={handleAddBook} className="space-y-4">
              {[
                { label: "Book Title", key: "title", type: "text", placeholder: "Introduction to Algorithms" },
                { label: "Author", key: "author", type: "text", placeholder: "Thomas H. Cormen" },
                { label: "ISBN", key: "isbn", type: "text", placeholder: "978-0-262-03384-8" },
                { label: "Category", key: "category", type: "text", placeholder: "Computer Science" },
                { label: "Publisher", key: "publisher", type: "text", placeholder: "MIT Press" },
                { label: "Year", key: "year", type: "text", placeholder: "2022" },
                { label: "Total Copies", key: "totalCopies", type: "number", placeholder: "5" },
                { label: "Available Copies", key: "available", type: "number", placeholder: "5" },
              ].map(f => (
                <div key={f.key}>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">{f.label}</label>
                  <input type={f.type} placeholder={f.placeholder} value={bookForm[f.key]}
                    onChange={e => setBookForm({ ...bookForm, [f.key]: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#6b0f1a]" />
                </div>
              ))}
              <button type="submit" className="w-full bg-[#6b0f1a] hover:bg-[#8b1a2a] text-white py-2.5 rounded-xl font-bold text-sm transition shadow-sm">Add Book</button>
            </form>
          </div>
        )}

        {/* Issue Book (Admin) */}
        {tab === "issuebook" && isAdmin && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 max-w-md">
            <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2"><div className="w-1 h-5 bg-[#6b0f1a] rounded-full" /> Issue Book to Student</h3>
            <form onSubmit={handleIssueBook} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Select Book</label>
                <select className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#6b0f1a]"
                  value={issueForm.bookId} onChange={e => setIssueForm({ ...issueForm, bookId: e.target.value })} required>
                  <option value="">-- Select Book --</option>
                  {books.filter(b => b.available > 0).map(b => <option key={b.id} value={b.id}>{b.title} (Available: {b.available})</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Select Student</label>
                <select className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#6b0f1a]"
                  value={issueForm.studentId} onChange={e => setIssueForm({ ...issueForm, studentId: e.target.value })} required>
                  <option value="">-- Select Student --</option>
                  {students.map(s => <option key={s.id} value={s.id}>{s.name} ({s.rollNo})</option>)}
                </select>
              </div>
              <div className="bg-amber-50 border border-amber-100 rounded-xl p-3">
                <p className="text-amber-700 text-xs font-semibold">📅 Due date will be automatically set to 30 days from today.</p>
              </div>
              <button type="submit" className="w-full bg-[#6b0f1a] hover:bg-[#8b1a2a] text-white py-2.5 rounded-xl font-bold text-sm transition shadow-sm">Issue Book</button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}

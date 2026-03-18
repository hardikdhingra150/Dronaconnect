import { useEffect, useState } from "react";
import { collection, getDocs, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase/config";
import { useAuth } from "../context/AuthContext";

export default function Research() {
  const { user, userData } = useAuth();
  const [tab, setTab] = useState("conferences");
  const [conferences, setConferences] = useState([]);
  const [papers, setPapers] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState("");
  const isAdmin = userData?.role === "admin" || userData?.role === "teacher";

  const [confForm, setConfForm] = useState({ title: "", organizer: "", date: "", venue: "", deadline: "", type: "National", fee: "", description: "" });
  const [paperForm, setPaperForm] = useState({ title: "", authors: "", journal: "", year: "", doi: "", abstract: "", status: "published" });

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    setLoading(true);
    const [c, p, pr] = await Promise.all([
      getDocs(collection(db, "conferences")),
      getDocs(collection(db, "research_papers")),
      getDocs(collection(db, "research_projects")),
    ]);
    setConferences(c.docs.map(d => ({ id: d.id, ...d.data() })));
    setPapers(p.docs.map(d => ({ id: d.id, ...d.data() })));
    setProjects(pr.docs.map(d => ({ id: d.id, ...d.data() })));
    setLoading(false);
  };

  const notify = (text) => { setMsg(text); setTimeout(() => setMsg(""), 3000); };

  const handleAddConf = async (e) => {
    e.preventDefault();
    await addDoc(collection(db, "conferences"), { ...confForm, addedBy: user.uid, addedByName: userData?.name, createdAt: serverTimestamp() });
    notify("✅ Conference added!");
    setConfForm({ title: "", organizer: "", date: "", venue: "", deadline: "", type: "National", fee: "", description: "" });
    fetchAll();
  };

  const handleAddPaper = async (e) => {
    e.preventDefault();
    await addDoc(collection(db, "research_papers"), { ...paperForm, submittedBy: user.uid, submittedByName: userData?.name, createdAt: serverTimestamp() });
    notify("✅ Paper submitted!");
    setPaperForm({ title: "", authors: "", journal: "", year: "", doi: "", abstract: "", status: "published" });
    fetchAll();
  };

  const typeColor = (type) => {
    if (type === "International") return "bg-indigo-100 text-indigo-700 border-indigo-200";
    if (type === "National") return "bg-blue-100 text-blue-700 border-blue-200";
    return "bg-gray-100 text-gray-600 border-gray-200";
  };

  const statusColor = (s) => {
    if (s === "published") return "bg-emerald-100 text-emerald-700";
    if (s === "under_review") return "bg-amber-100 text-amber-700";
    return "bg-gray-100 text-gray-600";
  };

  const TABS = [
    { key: "conferences", label: "🏛️ Conferences" },
    { key: "papers", label: "📄 Research Papers" },
    { key: "projects", label: "🔬 Projects" },
    ...(isAdmin ? [{ key: "addconf", label: "➕ Add Conference" }, { key: "addpaper", label: "📝 Submit Paper" }] : [{ key: "addpaper", label: "📝 Submit Paper" }]),
  ];

  return (
    <div className="min-h-full bg-[#f5f6fa]">
      <div className="relative bg-gradient-to-br from-[#6b0f1a] via-[#7a1222] to-[#4a0a12] px-8 py-8 overflow-hidden">
        <div className="absolute -right-10 -top-10 w-56 h-56 rounded-full bg-white/5" />
        <div className="absolute inset-0 bg-cover bg-center opacity-10 mix-blend-overlay" style={{ backgroundImage: "url('/campus.jpg')" }} />
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-1.5 h-4 bg-[#f0d080] rounded-full" />
            <span className="text-[#f0d080] text-xs font-bold uppercase tracking-[0.2em]">Research & Innovation</span>
          </div>
          <h1 className="text-3xl font-black text-white">Research Portal 🔬</h1>
          <p className="text-white/50 text-sm mt-1">Conferences, papers and research projects</p>
        </div>
      </div>

      <div className="p-8 space-y-6">
        {msg && <div className="bg-emerald-50 border border-emerald-100 text-emerald-700 px-4 py-3 rounded-xl text-sm font-medium">{msg}</div>}

        <div className="flex gap-2 border-b border-gray-200 pb-0 flex-wrap">
          {TABS.map(t => (
            <button key={t.key} onClick={() => setTab(t.key)}
              className={`px-4 py-2.5 text-sm font-bold border-b-2 transition -mb-px ${tab === t.key ? "border-[#6b0f1a] text-[#6b0f1a]" : "border-transparent text-gray-400 hover:text-gray-600"}`}>
              {t.label}
            </button>
          ))}
        </div>

        {/* Conferences */}
        {tab === "conferences" && (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {loading ? <div className="col-span-3 py-16 text-center"><div className="w-8 h-8 border-4 border-[#6b0f1a]/20 border-t-[#6b0f1a] rounded-full animate-spin mx-auto" /></div>
              : conferences.length === 0 ? <div className="col-span-3 py-16 text-center"><p className="text-4xl mb-3">🏛️</p><p className="text-gray-500 font-semibold">No conferences listed yet</p></div>
              : conferences.map(conf => (
                <div key={conf.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 overflow-hidden">
                  <div className="bg-gradient-to-r from-[#6b0f1a] to-[#9b2030] px-5 py-4">
                    <div className="flex items-center justify-between">
                      <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full border ${typeColor(conf.type)}`}>{conf.type}</span>
                      <span className="text-white/60 text-xs">{conf.date}</span>
                    </div>
                    <h3 className="text-white font-black text-sm mt-2 leading-tight">{conf.title}</h3>
                  </div>
                  <div className="p-5 space-y-2">
                    <p className="text-xs text-gray-500">🏢 {conf.organizer}</p>
                    <p className="text-xs text-gray-500">📍 {conf.venue}</p>
                    {conf.deadline && <p className="text-xs text-amber-600 font-semibold">⏰ Submission deadline: {conf.deadline}</p>}
                    {conf.fee && <p className="text-xs text-gray-500">💰 Registration: ₹{conf.fee}</p>}
                    {conf.description && <p className="text-xs text-gray-400 mt-2 line-clamp-2">{conf.description}</p>}
                    <div className="pt-2">
                      <span className="text-xs text-gray-400">Added by {conf.addedByName}</span>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        )}

        {/* Research Papers */}
        {tab === "papers" && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white flex items-center gap-2.5">
              <div className="w-1 h-5 bg-[#6b0f1a] rounded-full" />
              <h2 className="font-bold text-gray-900 text-sm">Research Papers</h2>
              <span className="bg-gray-100 text-gray-500 text-xs font-semibold px-2 py-0.5 rounded-full">{papers.length}</span>
            </div>
            {papers.length === 0 ? <div className="py-16 text-center"><p className="text-4xl mb-3">📄</p><p className="text-gray-500 font-semibold">No papers submitted yet</p></div> : (
              <div className="divide-y divide-gray-50">
                {papers.map(p => (
                  <div key={p.id} className="px-6 py-4 hover:bg-gray-50 transition">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <h3 className="font-bold text-gray-900 text-sm leading-tight mb-1">{p.title}</h3>
                        <p className="text-xs text-gray-500 mb-1">✍️ {p.authors} · {p.journal} · {p.year}</p>
                        {p.doi && <p className="text-xs text-indigo-500">DOI: {p.doi}</p>}
                        {p.abstract && <p className="text-xs text-gray-400 mt-2 line-clamp-2">{p.abstract}</p>}
                      </div>
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold flex-shrink-0 ${statusColor(p.status)}`}>
                        {p.status === "published" ? "✅ Published" : p.status === "under_review" ? "⏳ Under Review" : "📝 Draft"}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Projects */}
        {tab === "projects" && (
          <div className="py-16 text-center">
            <p className="text-4xl mb-3">🔬</p>
            <p className="text-gray-500 font-semibold">Research Projects coming soon</p>
            <p className="text-gray-400 text-sm mt-1">Contact admin to list your project</p>
          </div>
        )}

        {/* Add Conference (Admin/Teacher) */}
        {tab === "addconf" && isAdmin && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 max-w-xl">
            <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2"><div className="w-1 h-5 bg-[#6b0f1a] rounded-full" /> Add Conference</h3>
            <form onSubmit={handleAddConf} className="space-y-4">
              {[
                { label: "Conference Title", key: "title", type: "text", placeholder: "IEEE International Conference on..." },
                { label: "Organizer", key: "organizer", type: "text", placeholder: "IEEE India" },
                { label: "Type", key: "type", type: "select", options: ["National", "International", "State Level"] },
                { label: "Venue", key: "venue", type: "text", placeholder: "IIT Delhi / Online" },
                { label: "Conference Date", key: "date", type: "date" },
                { label: "Submission Deadline", key: "deadline", type: "date" },
                { label: "Registration Fee (₹)", key: "fee", type: "text", placeholder: "500" },
                { label: "Description", key: "description", type: "text", placeholder: "Brief description..." },
              ].map(f => (
                <div key={f.key}>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">{f.label}</label>
                  {f.type === "select" ? (
                    <select className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#6b0f1a]"
                      value={confForm[f.key]} onChange={e => setConfForm({ ...confForm, [f.key]: e.target.value })}>
                      {f.options.map(o => <option key={o} value={o}>{o}</option>)}
                    </select>
                  ) : (
                    <input type={f.type} placeholder={f.placeholder} value={confForm[f.key]}
                      onChange={e => setConfForm({ ...confForm, [f.key]: e.target.value })}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#6b0f1a]" />
                  )}
                </div>
              ))}
              <button type="submit" className="w-full bg-[#6b0f1a] hover:bg-[#8b1a2a] text-white py-2.5 rounded-xl font-bold text-sm transition shadow-sm">Add Conference</button>
            </form>
          </div>
        )}

        {/* Submit Paper */}
        {tab === "addpaper" && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 max-w-xl">
            <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2"><div className="w-1 h-5 bg-[#6b0f1a] rounded-full" /> Submit Research Paper</h3>
            <form onSubmit={handleAddPaper} className="space-y-4">
              {[
                { label: "Paper Title", key: "title", type: "text", placeholder: "Deep Learning for..." },
                { label: "Authors", key: "authors", type: "text", placeholder: "John Doe, Jane Smith" },
                { label: "Journal / Conference", key: "journal", type: "text", placeholder: "IEEE Transactions on..." },
                { label: "Year", key: "year", type: "text", placeholder: "2026" },
                { label: "DOI (Optional)", key: "doi", type: "text", placeholder: "10.1109/..." },
                { label: "Status", key: "status", type: "select", options: ["published", "under_review", "draft"] },
                { label: "Abstract", key: "abstract", type: "text", placeholder: "Brief abstract of the paper..." },
              ].map(f => (
                <div key={f.key}>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">{f.label}</label>
                  {f.type === "select" ? (
                    <select className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#6b0f1a]"
                      value={paperForm[f.key]} onChange={e => setPaperForm({ ...paperForm, [f.key]: e.target.value })}>
                      {f.options.map(o => <option key={o} value={o}>{o}</option>)}
                    </select>
                  ) : (
                    <input type={f.type} placeholder={f.placeholder} value={paperForm[f.key]}
                      onChange={e => setPaperForm({ ...paperForm, [f.key]: e.target.value })}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#6b0f1a]" />
                  )}
                </div>
              ))}
              <button type="submit" className="w-full bg-[#6b0f1a] hover:bg-[#8b1a2a] text-white py-2.5 rounded-xl font-bold text-sm transition shadow-sm">Submit Paper</button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}

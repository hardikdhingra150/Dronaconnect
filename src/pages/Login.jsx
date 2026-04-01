import { useState, useEffect } from "react";
import {
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  onAuthStateChanged,
} from "firebase/auth";
import { auth } from "../firebase/config";
import { useNavigate } from "react-router-dom";

const provider = new GoogleAuthProvider();
provider.setCustomParameters({ prompt: "select_account" });

export default function Login() {
  const [mode, setMode] = useState("student");
  const [tab, setTab] = useState("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      if (user) navigate("/dashboard");
    });
    return () => unsub();
  }, [navigate]);

  const getFriendlyError = (code) => {
    switch (code) {
      case "auth/invalid-credential":
      case "auth/wrong-password":
        return "Incorrect email or password.";
      case "auth/user-not-found":
        return "No account found with this email.";
      case "auth/too-many-requests":
        return "Too many attempts. Try again later.";
      case "auth/popup-closed-by-user":
        return "Sign-in popup was closed. Please try again.";
      case "auth/popup-blocked":
        return "Popup was blocked by the browser. Please allow popups.";
      default:
        return "Login failed. Please try again.";
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      // navigation handled by onAuthStateChanged
    } catch (err) {
      setError(getFriendlyError(err.code));
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setError("");
    setLoading(true);
    try {
      await signInWithPopup(auth, provider);
      
    } catch (err) {
      setError(getFriendlyError(err.code));
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: "100vh",
      backgroundColor: "#1a0508",
      position: "relative",
      overflow: "hidden",
      display: "flex",
      flexDirection: "column",
    }}>

      {/* Background */}
      <div style={{
        position: "absolute", inset: 0, zIndex: 0,
        backgroundImage: "url('/DRONA.jpg')",
        backgroundSize: "cover", backgroundPosition: "center",
        opacity: 0.3,
      }} />
      <div style={{
        position: "absolute", inset: 0, zIndex: 1,
        background: "linear-gradient(135deg, rgba(107,15,26,0.85) 0%, rgba(74,10,18,0.80) 50%, rgba(26,5,8,0.92) 100%)",
      }} />
      <div style={{
        position: "absolute", inset: 0, zIndex: 1,
        background: "linear-gradient(to top, rgba(0,0,0,0.45) 0%, transparent 55%)",
      }} />

      {/* Blobs */}
      <div style={{ position:"absolute", top:"-8rem", left:"-8rem", zIndex:1, width:"24rem", height:"24rem", borderRadius:"50%", background:"rgba(240,208,128,0.07)", filter:"blur(72px)" }} />
      <div style={{ position:"absolute", bottom:"-8rem", right:"-8rem", zIndex:1, width:"24rem", height:"24rem", borderRadius:"50%", background:"rgba(107,15,26,0.4)", filter:"blur(72px)" }} />
      <div style={{ position:"absolute", top:"30%", left:"40%", zIndex:1, width:"20rem", height:"20rem", borderRadius:"50%", background:"rgba(201,168,76,0.04)", filter:"blur(60px)" }} />

      {/* Gold top bar */}
      <div style={{ position:"relative", zIndex:10, height:"4px", width:"100%", background:"linear-gradient(90deg, #c9a84c, #f0d080, #c9a84c)", flexShrink:0 }} />

      {/* ══ GRID LAYOUT ══ */}
      <div style={{
        position: "relative", zIndex: 10,
        flex: 1,
        display: "grid",
        gridTemplateColumns: "1fr 500px",
        minHeight: 0,
      }}>

        {/* ══ LEFT PANEL ══ */}
        <div style={{
          display: "flex", flexDirection: "column", justifyContent: "space-between",
          padding: "3.5rem 4rem",
          minHeight: "calc(100vh - 4px)",
          boxSizing: "border-box",
        }}>
          <div>
            {/* Brand */}
            <div style={{ display:"flex", alignItems:"center", gap:"16px", marginBottom:"2.5rem" }}>
              <div style={{
                width:"48px", height:"48px", borderRadius:"14px", flexShrink:0,
                background:"linear-gradient(135deg, #c9a84c, #f0d080)",
                display:"flex", alignItems:"center", justifyContent:"center",
                boxShadow:"0 8px 24px rgba(0,0,0,0.4)",
              }}>
                <svg width="24" height="24" fill="#6b0f1a" viewBox="0 0 24 24">
                  <path d="M12 3L1 9l4 2.18v6L12 21l7-3.82v-6l2-1.09V17h2V9L12 3zm6.82 6L12 12.72 5.18 9 12 5.28 18.82 9zM17 15.99l-5 2.73-5-2.73v-3.72L12 15l5-2.73v3.72z"/>
                </svg>
              </div>
              <div>
                <p style={{ fontWeight:900, fontSize:"1.125rem", color:"#fff", letterSpacing:"0.05em", lineHeight:1, margin:0 }}>
                  DRONA<span style={{ color:"#f0d080" }}>CONNECT</span>
                </p>
                <p style={{ color:"rgba(255,255,255,0.3)", fontSize:"0.6rem", marginTop:"5px", letterSpacing:"0.22em", textTransform:"uppercase", margin:0 }}>
                  Academic ERP Portal
                </p>
              </div>
            </div>

           

            {/* Headline */}
            <h1 style={{ fontSize:"clamp(2.2rem, 3vw, 3.2rem)", fontWeight:900, color:"#fff", lineHeight:1.08, letterSpacing:"-0.02em", marginBottom:"1rem", marginTop:0 }}>
              Your Academic Journey,<br />
              <span style={{ color:"#f0d080" }}>Seamlessly Connected.</span>
            </h1>
            <p style={{ color:"rgba(255,255,255,0.5)", fontSize:"0.95rem", lineHeight:1.7, maxWidth:"400px", marginBottom:"2rem" }}>
              Manage attendance, track performance, and stay connected with your institution — all from one unified platform.
            </p>

            {/* Chips */}
            <div style={{ display:"flex", flexWrap:"wrap", gap:"8px", marginBottom:"2rem" }}>
              {["Attendance Tracking","Monthly Reports","Defaulter Alerts","Role-based Access","Real-time Sync"].map(f => (
                <span key={f} style={{
                  fontSize:"0.7rem", fontWeight:600, color:"rgba(255,255,255,0.6)",
                  border:"1px solid rgba(255,255,255,0.15)", padding:"5px 12px",
                  borderRadius:"9999px", background:"rgba(255,255,255,0.05)",
                  backdropFilter:"blur(8px)",
                }}>{f}</span>
              ))}
            </div>

            {/* Stats */}
            <div style={{ display:"flex", gap:"2.5rem", marginBottom:"2.5rem" }}>
              {[{val:"3",label:"User Roles"},{val:"75%",label:"Min Attendance"},{val:"Live",label:"Real-time Data"}].map(s => (
                <div key={s.label}>
                  <p style={{ color:"#f0d080", fontWeight:900, fontSize:"1.6rem", lineHeight:1, margin:0 }}>{s.val}</p>
                  <p style={{ color:"rgba(255,255,255,0.35)", fontSize:"0.65rem", marginTop:"4px", textTransform:"uppercase", letterSpacing:"0.08em", margin:0 }}>{s.label}</p>
                </div>
              ))}
            </div>

            {/* Extended info cards */}
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:"12px", marginBottom:"2rem" }}>
              {[
                { icon:"👨‍🎓", title:"Students", desc:"View attendance, marks, timetable & fee status in real-time" },
                { icon:"👨‍🏫", title:"Teachers", desc:"Mark attendance, upload marks and manage your classes" },
                { icon:"🛡️", title:"Admins", desc:"Manage users, generate reports and configure the system" },
              ].map(c => (
                <div key={c.title} style={{
                  padding:"16px", borderRadius:"14px",
                  background:"rgba(255,255,255,0.05)",
                  border:"1px solid rgba(255,255,255,0.09)",
                  backdropFilter:"blur(10px)",
                }}>
                  <div style={{ fontSize:"1.5rem", marginBottom:"8px" }}>{c.icon}</div>
                  <p style={{ color:"#f0d080", fontWeight:700, fontSize:"0.8rem", margin:"0 0 4px 0" }}>{c.title}</p>
                  <p style={{ color:"rgba(255,255,255,0.45)", fontSize:"0.7rem", lineHeight:1.5, margin:0 }}>{c.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Role selector — pinned to bottom */}
          <div style={{ paddingTop:"1.5rem", borderTop:"1px solid rgba(255,255,255,0.07)" }}>
            <p style={{ color:"rgba(255,255,255,0.3)", fontSize:"0.6rem", fontWeight:700, textTransform:"uppercase", letterSpacing:"0.22em", marginBottom:"12px" }}>
              I am logging in as
            </p>
            <div style={{ display:"flex", gap:"12px" }}>
              {[
                { key:"student", label:"Student / Teacher", sub:"Institutional login", icon:(color) => (
                  <svg width="17" height="17" fill="none" viewBox="0 0 24 24" stroke={color} strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 14l9-5-9-5-9 5 9 5z"/>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z"/>
                  </svg>
                )},
                { key:"admin", label:"Administrator", sub:"Restricted access", icon:(color) => (
                  <svg width="17" height="17" fill="none" viewBox="0 0 24 24" stroke={color} strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/>
                  </svg>
                )},
              ].map(btn => (
                <button key={btn.key} onClick={() => setMode(btn.key)} style={{
                  flex:1, display:"flex", alignItems:"center", gap:"12px",
                  padding:"14px 16px", borderRadius:"12px", textAlign:"left",
                  border: mode === btn.key ? "1px solid rgba(255,255,255,0.35)" : "1px solid rgba(255,255,255,0.1)",
                  background: mode === btn.key ? "rgba(255,255,255,0.15)" : "rgba(255,255,255,0.04)",
                  cursor:"pointer", transition:"all 0.2s",
                }}>
                  <div style={{
                    width:"34px", height:"34px", borderRadius:"9px", flexShrink:0,
                    display:"flex", alignItems:"center", justifyContent:"center",
                    background: mode === btn.key ? "#f0d080" : "rgba(255,255,255,0.1)",
                  }}>
                    {btn.icon(mode === btn.key ? "#6b0f1a" : "rgba(255,255,255,0.5)")}
                  </div>
                  <div style={{ flex:1 }}>
                    <p style={{ fontSize:"0.875rem", fontWeight:700, color: mode === btn.key ? "#fff" : "rgba(255,255,255,0.45)", lineHeight:1, margin:0 }}>{btn.label}</p>
                    <p style={{ fontSize:"0.625rem", marginTop:"3px", color: mode === btn.key ? "rgba(255,255,255,0.5)" : "rgba(255,255,255,0.25)", margin:0 }}>{btn.sub}</p>
                  </div>
                  {mode === btn.key && <div style={{ width:"8px", height:"8px", borderRadius:"50%", background:"#f0d080", flexShrink:0 }} />}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ══ RIGHT PANEL ══ */}
        <div style={{
          display:"flex", alignItems:"center", justifyContent:"center",
          padding:"3rem 3rem",
          minHeight:"calc(100vh - 4px)",
          boxSizing:"border-box",
        }}>
          <div style={{ width:"100%" }}>
            <div style={{
              background:"rgba(255,255,255,0.06)",
              backdropFilter:"blur(28px)", WebkitBackdropFilter:"blur(28px)",
              borderRadius:"24px", border:"1px solid rgba(255,255,255,0.14)",
              boxShadow:"0 24px 64px rgba(0,0,0,0.55)", overflow:"hidden",
            }}>

              {/* Admin banner */}
              {mode === "admin" && (
                <div style={{ background:"rgba(245,158,11,0.18)", borderBottom:"1px solid rgba(245,158,11,0.22)", padding:"12px 24px", display:"flex", alignItems:"center", gap:"8px" }}>
                  <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="#fcd34d" strokeWidth={2} style={{ flexShrink:0 }}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
                  </svg>
                  <p style={{ color:"#fde68a", fontSize:"0.75rem", fontWeight:600, margin:0 }}>Admin portal — restricted access only</p>
                </div>
              )}

              <div style={{ padding:"28px 28px 12px" }}>
                {/* Header */}
                <div style={{ marginBottom:"22px" }}>
                  <div style={{ display:"flex", alignItems:"center", gap:"8px", marginBottom:"8px" }}>
                    <div style={{ width:"5px", height:"16px", borderRadius:"9999px", background:"#f0d080" }} />
                    <p style={{ color:"#f0d080", fontSize:"0.6rem", fontWeight:700, textTransform:"uppercase", letterSpacing:"0.2em", margin:0 }}>
                      {mode === "admin" ? "Admin Portal" : "Secure Portal Login"}
                    </p>
                  </div>
                  <h2 style={{ color:"#fff", fontWeight:900, fontSize:"1.3rem", lineHeight:1.2, margin:0 }}>
                    {mode === "admin" ? "Administrator Login" : "Welcome Back"}
                  </h2>
                  <p style={{ color:"rgba(255,255,255,0.4)", fontSize:"0.75rem", marginTop:"4px", margin:0 }}>
                    {mode === "admin" ? "Use your admin credentials" : "Use your institutional credentials"}
                  </p>
                </div>

                {/* Tabs */}
                {mode === "student" && (
                  <div style={{ display:"flex", background:"rgba(255,255,255,0.07)", borderRadius:"12px", padding:"4px", marginBottom:"20px", border:"1px solid rgba(255,255,255,0.1)" }}>
                    {["signin","register"].map(t => (
                      <button key={t} onClick={() => setTab(t)} style={{
                        flex:1, padding:"8px", borderRadius:"9px",
                        fontSize:"0.875rem", fontWeight:700, cursor:"pointer",
                        border:"none", transition:"all 0.2s",
                        background: tab === t ? "#6b0f1a" : "transparent",
                        color: tab === t ? "#fff" : "rgba(255,255,255,0.4)",
                        boxShadow: tab === t ? "0 2px 8px rgba(0,0,0,0.3)" : "none",
                      }}>
                        {t === "signin" ? "Sign In" : "Register"}
                      </button>
                    ))}
                  </div>
                )}

                {/* Error */}
                {error && (
                  <div style={{ background:"rgba(239,68,68,0.15)", border:"1px solid rgba(239,68,68,0.25)", color:"#fca5a5", fontSize:"0.75rem", fontWeight:500, padding:"10px 12px", borderRadius:"12px", marginBottom:"16px", display:"flex", alignItems:"center", gap:"8px" }}>
                    <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} style={{ flexShrink:0 }}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/>
                    </svg>
                    {error}
                  </div>
                )}

                {/* Form */}
                <form onSubmit={handleLogin} style={{ display:"flex", flexDirection:"column", gap:"14px" }}>
                  <div>
                    <label style={{ display:"block", color:"rgba(255,255,255,0.5)", fontSize:"0.6rem", fontWeight:700, textTransform:"uppercase", letterSpacing:"0.15em", marginBottom:"6px" }}>
                      {mode === "admin" ? "Admin Email" : "Email / Student ID"}
                    </label>
                    <div style={{ position:"relative" }}>
                      <div style={{ position:"absolute", left:"13px", top:"50%", transform:"translateY(-50%)", color:"rgba(255,255,255,0.3)", pointerEvents:"none" }}>
                        <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                        </svg>
                      </div>
                      <input
                        type="email"
                        placeholder={mode === "admin" ? "admin@dronacharya.info" : "you@college.ac.in"}
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        required
                        style={{ width:"100%", background:"rgba(255,255,255,0.07)", border:"1px solid rgba(255,255,255,0.14)", borderRadius:"11px", paddingLeft:"38px", paddingRight:"14px", paddingTop:"11px", paddingBottom:"11px", color:"#fff", fontSize:"0.875rem", outline:"none", boxSizing:"border-box" }}
                        onFocus={e => { e.target.style.borderColor="rgba(240,208,128,0.55)"; e.target.style.boxShadow="0 0 0 3px rgba(240,208,128,0.1)"; }}
                        onBlur={e => { e.target.style.borderColor="rgba(255,255,255,0.14)"; e.target.style.boxShadow="none"; }}
                      />
                    </div>
                  </div>

                  <div>
                    <label style={{ display:"block", color:"rgba(255,255,255,0.5)", fontSize:"0.6rem", fontWeight:700, textTransform:"uppercase", letterSpacing:"0.15em", marginBottom:"6px" }}>
                      Password
                    </label>
                    <div style={{ position:"relative" }}>
                      <div style={{ position:"absolute", left:"13px", top:"50%", transform:"translateY(-50%)", color:"rgba(255,255,255,0.3)", pointerEvents:"none" }}>
                        <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
                        </svg>
                      </div>
                      <input
                        type={showPass ? "text" : "password"}
                        placeholder="••••••••"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        required
                        style={{ width:"100%", background:"rgba(255,255,255,0.07)", border:"1px solid rgba(255,255,255,0.14)", borderRadius:"11px", paddingLeft:"38px", paddingRight:"42px", paddingTop:"11px", paddingBottom:"11px", color:"#fff", fontSize:"0.875rem", outline:"none", boxSizing:"border-box" }}
                        onFocus={e => { e.target.style.borderColor="rgba(240,208,128,0.55)"; e.target.style.boxShadow="0 0 0 3px rgba(240,208,128,0.1)"; }}
                        onBlur={e => { e.target.style.borderColor="rgba(255,255,255,0.14)"; e.target.style.boxShadow="none"; }}
                      />
                      <button type="button" onClick={() => setShowPass(!showPass)} style={{ position:"absolute", right:"13px", top:"50%", transform:"translateY(-50%)", color:"rgba(255,255,255,0.35)", background:"none", border:"none", cursor:"pointer", padding:0 }}>
                        {showPass ? (
                          <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"/>
                          </svg>
                        ) : (
                          <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                          </svg>
                        )}
                      </button>
                    </div>
                  </div>

                  <div style={{ display:"flex", justifyContent:"flex-end" }}>
                    <button type="button" style={{ color:"#f0d080", fontSize:"0.75rem", fontWeight:600, background:"none", border:"none", cursor:"pointer" }}>
                      Forgot Password?
                    </button>
                  </div>

                  <button type="submit" disabled={loading} style={{
                    width:"100%", padding:"13px", borderRadius:"12px",
                    fontWeight:900, fontSize:"0.875rem", border:"none",
                    cursor: loading ? "not-allowed" : "pointer",
                    opacity: loading ? 0.6 : 1,
                    background: mode === "admin" ? "#f59e0b" : "#f0d080",
                    color:"#1a0508",
                    display:"flex", alignItems:"center", justifyContent:"center", gap:"8px",
                    boxShadow:"0 4px 20px rgba(0,0,0,0.35)",
                    transition:"all 0.2s", letterSpacing:"0.06em",
                  }}>
                    {loading ? (
                      <svg width="16" height="16" fill="none" viewBox="0 0 24 24" style={{ animation:"spin 1s linear infinite" }}>
                        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" style={{ opacity:0.25 }}/>
                        <path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" style={{ opacity:0.75 }}/>
                      </svg>
                    ) : (
                      <>
                        {mode === "admin" ? "🔐 Admin Login" : tab === "signin" ? "LOGIN" : "CREATE ACCOUNT"}
                        <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6"/>
                        </svg>
                      </>
                    )}
                  </button>
                </form>
              </div>

              {mode === "student" && (
                <div style={{ padding:"0 28px 28px" }}>
                  <div style={{ display:"flex", alignItems:"center", gap:"12px", margin:"14px 0" }}>
                    <div style={{ flex:1, height:"1px", background:"rgba(255,255,255,0.1)" }}/>
                    <span style={{ color:"rgba(255,255,255,0.25)", fontSize:"0.75rem" }}>OR</span>
                    <div style={{ flex:1, height:"1px", background:"rgba(255,255,255,0.1)" }}/>
                  </div>
                  <button onClick={handleGoogle} disabled={loading} style={{
                    width:"100%", display:"flex", alignItems:"center", justifyContent:"center", gap:"12px",
                    background:"#fff", color:"#1f2937", fontWeight:700, fontSize:"0.875rem",
                    padding:"11px", borderRadius:"12px", border:"none", cursor:"pointer",
                    boxShadow:"0 2px 8px rgba(0,0,0,0.2)", opacity: loading ? 0.5 : 1, transition:"all 0.2s",
                  }}>
                    <svg width="16" height="16" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                    Continue with Google
                  </button>
                  <p style={{ textAlign:"center", color:"rgba(255,255,255,0.3)", fontSize:"0.75rem", marginTop:"14px" }}>
                    New User?{" "}
                    <button onClick={() => setTab("register")} style={{ color:"#f0d080", fontWeight:700, background:"none", border:"none", cursor:"pointer" }}>
                      Register here
                    </button>
                  </p>
                </div>
              )}

              {mode === "admin" && (
                <div style={{ padding:"8px 28px 28px", textAlign:"center" }}>
                  <p style={{ color:"rgba(255,255,255,0.25)", fontSize:"0.75rem", lineHeight:1.6, margin:0 }}>
                    Admin accounts are managed by the institution.<br/>
                    Contact IT support for access issues.
                  </p>
                </div>
              )}
            </div>
            <p style={{ textAlign:"center", color:"rgba(255,255,255,0.2)", fontSize:"0.6rem", marginTop:"18px" }}>
              © 2026 DronaConnect · Secure Academic Portal
            </p>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        input::placeholder { color: rgba(255,255,255,0.25) !important; }
      `}</style>
    </div>
  );
}
import { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebaseConfig";
import bsfLogo from "../assets/bsflogo.png";

export default function Login() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    if (!form.email || !form.password) return alert("Enter email & password");
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, form.email, form.password);
      // App.jsx switches to Dashboard when auth state changes
    } catch (err) {
      console.error(err);
      alert("Login failed. Check credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="center-screen">
      <div className="card auth-card">
        <img src={bsfLogo} alt="BSF" className="logo" />
        <h1 className="title gold">BSF Admin Login</h1>
        <p className="muted small">Sign in with your admin email</p>

        <form className="vstack gap-12" onSubmit={submit}>
          <input
            className="input"
            type="email"
            placeholder="Admin email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
          <input
            className="input"
            type="password"
            placeholder="Password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
          />

          <button className="btn gold-btn" disabled={loading}>
            {loading ? "Logging in…" : "Login"}
          </button>
        </form>
      </div>
    </div>
  );
}

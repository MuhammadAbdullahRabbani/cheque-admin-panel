import { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebaseConfig";
import actor from "../assets/actor.png";
import { FaGoogle, FaFacebookF, FaApple, FaEye, FaEyeSlash } from "react-icons/fa";
import "../styles/Login.css";

export default function Login() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [showPwd, setShowPwd] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    if (!form.email || !form.password) return alert("Enter email & password");
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, form.email, form.password);
    } catch (err) {
      console.error(err);
      alert("Login failed. Check credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="logo-wrap">
          <img src={actor} alt="BSF Logo" className="logo-img" />
        </div>

        <h1 className="login-title">BSF Admin Login</h1>
        <p className="login-subtitle">Sign in with your admin email</p>

        <form onSubmit={submit} className="login-form" autoComplete="on">
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            required
            autoComplete="username"
          />

          {/* Password input with eye icon inside */}
<div className="password-wrapper">
  <input
    type={showPwd ? "text" : "password"}
    name="password"
    placeholder="Password"
    value={form.password}
    onChange={(e) => setForm({ ...form, password: e.target.value })}
    required
    autoComplete="current-password"
    aria-label="Password"
  />
  <span
    className="eye-icon"
    onClick={() => setShowPwd((s) => !s)}
    role="button"
    tabIndex={0}
    aria-label={showPwd ? "Hide password" : "Show password"}
    onKeyDown={(e) => e.key === "Enter" && setShowPwd((s) => !s)}
  >
    {showPwd ? <FaEyeSlash /> : <FaEye />}
  </span>
</div>


          <button type="submit" disabled={loading}>
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <p className="divider-text">or sign in with</p>

        <div className="social-login">
          <button aria-label="Sign in with Google"><FaGoogle /></button>
          <button aria-label="Sign in with Facebook"><FaFacebookF /></button>
          <button aria-label="Sign in with Apple"><FaApple /></button>
        </div>

        <p className="footer">© {new Date().getFullYear()} BlackStone Foods — Admin Access Only</p>
      </div>
    </div>
  );
}

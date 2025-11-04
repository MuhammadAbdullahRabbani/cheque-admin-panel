import { FaPowerOff } from "react-icons/fa";
import bsfLogo from "../assets/bsfLogo.svg";

export default function Header({ userEmail, onLogout }) {
  return (
    <header className="header-card">
      {/* Left Section: Logo + Text */}
      <div className="header-left">
        <div className="logo-wrap">
          <img src={bsfLogo} alt="BSF Logo" className="logo glow-logo" />
          <span className="logo-ripple" aria-hidden />
        </div>

        <div className="header-text">
          <h2 className="header-title">BSF Cheque Verification — Admin</h2>
          <p className="header-subtitle">
            Trusted digital verification by <span className="gold">Black Stone Foods</span>
          </p>
        </div>
      </div>

      {/* Right Section */}
      <div className="header-right">
        <div className="user-chip">
          <span className="pulse-dot" aria-hidden />
          <div className="chip-text">
            <span className="chip-email">{userEmail || "Guest Admin"}</span>
          </div>
        </div>

        <button className="btn logout-btn" onClick={onLogout}>
          <FaPowerOff size={16} /> Logout
        </button>
      </div>
    </header>
  );
}

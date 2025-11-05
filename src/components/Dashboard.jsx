import React, { useEffect, useMemo, useState } from "react";
import { signOut } from "firebase/auth";
import { auth, db } from "../firebaseConfig";
import Header from "./Header";
import ChequeForm from "./ChequeForm";
import ChequeTable from "./ChequeTable";
import VerificationLog from "./VerificationLog";
import "../styles/Dashboard.css";

import { collection, onSnapshot, orderBy, query } from "firebase/firestore";
import {
  FaClipboardList,
  FaCheckCircle,
  FaTimesCircle,
  FaMoneyBillWave,
  FaUserCheck,
} from "react-icons/fa";
import { FaFileInvoiceDollar, FaListCheck } from "react-icons/fa6";

export default function Dashboard({ user }) {
  const [cheques, setCheques] = useState([]);
  const [activeTab, setActiveTab] = useState("cheques"); // 👈 current tab

  // 🔄 Live Firestore listener for cheques
  useEffect(() => {
    const q = query(collection(db, "cheques"), orderBy("createdAt", "desc"));
    const unsub = onSnapshot(q, (snap) => {
      setCheques(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    });
    return () => unsub();
  }, []);

  // 🧾 Live listener for verifications count
  useEffect(() => {
    const q = query(collection(db, "verifications"));
    const unsub = onSnapshot(q, (snap) => {
      localStorage.setItem("verificationCount", snap.size);
    });
    return () => unsub();
  }, []);

  // 📊 Compute dashboard stats
  const stats = useMemo(() => {
    const total = cheques.length;
    const valid = cheques.filter((c) => c.status === "valid").length;
    const notValid = cheques.filter((c) => c.status === "not_valid").length;
    const paid = cheques.filter((c) => c.status === "paid").length;
    const verifications =
      parseInt(localStorage.getItem("verificationCount")) || 0;

    return { total, valid, notValid, paid, verifications };
  }, [cheques]);

  // 🚪 Logout
  const handleLogout = async () => {
    await signOut(auth);
  };

  return (
    <div className="dashboard-wrap">
      <Header userEmail={user?.email || "admin"} onLogout={handleLogout} />

      {/* === KPI CARDS === */}
      <div className="kpi-grid">
        <KPI title="Total Cheques" value={stats.total} />
        <KPI title="Valid" value={stats.valid} />
        <KPI title="Not Valid" value={stats.notValid} />
        <KPI title="Paid" value={stats.paid} />
        <KPI title="Verifications" value={stats.verifications || 0} />
      </div>

      {/* === TABS === */}
      <div className="tabs">
  <button
    className={`tab-btn ${activeTab === "cheques" ? "active" : ""}`}
    onClick={() => setActiveTab("cheques")}
  >
    <FaFileInvoiceDollar size={18} className="tab-icon" />
    Manage Cheques
  </button>

  <button
    className={`tab-btn ${activeTab === "verifications" ? "active" : ""}`}
    onClick={() => setActiveTab("verifications")}
  >
    <FaListCheck size={18} className="tab-icon" />
    Verification Logs
  </button>
</div>


      {/* === TAB CONTENT === */}
      {activeTab === "cheques" && (
        <>
          <ChequeForm currentUser={user} />
          <ChequeTable rows={cheques} />
        </>
      )}

      {activeTab === "verifications" && <VerificationLog />}
    </div>
  );
}

// 🧩 KPI Subcomponent (internal, not exported)
function KPI({ title, value }) {
  let Icon;
  let color;

  switch (title) {
    case "Total Cheques":
      Icon = FaClipboardList;
      color = "#3b82f6"; // Blue
      break;
    case "Valid":
      Icon = FaCheckCircle;
      color = "#22c55e"; // Green
      break;
    case "Not Valid":
      Icon = FaTimesCircle;
      color = "#ef4444"; // Red
      break;
    case "Paid":
      Icon = FaMoneyBillWave;
      color = "#eab308"; // Gold-Yellow
      break;
    case "Verifications":
      Icon = FaUserCheck;
      color = "#8b5cf6"; // Purple
      break;
    default:
      color = "#c5a019"; // fallback gold
  }

  return (
    <div className="kpi card">
      <div className="kpi-body">
        <span className="kpi-title">{title}</span>
        <div className="kpi-icon-wrap">
          <Icon className="kpi-icon" size={34} style={{ color }} />
        </div>
        <div className="kpi-value">{value}</div>
      </div>
    </div>
  );
}


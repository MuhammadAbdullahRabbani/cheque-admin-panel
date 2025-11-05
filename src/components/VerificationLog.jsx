import { useEffect, useState } from "react";
import { db } from "../firebaseConfig";
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  getDocs,
  writeBatch,
  doc,            // ✅ needed for deletes
} from "firebase/firestore";
import "../styles/VerificationLog.css";


export default function VerificationLog() {
  const [logs, setLogs] = useState([]);
  const [clearing, setClearing] = useState(false);

  useEffect(() => {
    const q = query(collection(db, "verifications"), orderBy("verifiedAt", "desc"));
    const unsub = onSnapshot(q, (snap) => {
      setLogs(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    });
    return () => unsub();
  }, []);

  const formatDateTime = (timestamp) => {
    if (!timestamp?.toDate) return "—";
    const date = timestamp.toDate();
    return `${date.toLocaleDateString()} ${date.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    })}`;
  };

  const statusClass = (s) => {
    if (s === "valid") return "pill valid";
    if (s === "not_valid") return "pill notvalid";
    if (s === "paid") return "pill paid";
    if (s === "not_found") return "pill notfound";
    return "pill";
  };

  const labelOf = (s) => {
    if (s === "valid") return "Valid";
    if (s === "not_valid") return "Not Valid";
    if (s === "paid") return "Paid";
     if (s === "not_found") return "Not Found"; 
    return "—";
  };

  // 🧹 Clear all logs (batched, fast, reliable)
  const clearLogs = async () => {
    if (!confirm("Clear ALL verification logs? This cannot be undone.")) return;
    setClearing(true);
    try {
      const snap = await getDocs(collection(db, "verifications"));
      if (snap.empty) return;

      const batch = writeBatch(db);
      snap.forEach((d) => batch.delete(doc(db, "verifications", d.id)));
      await batch.commit();          // ✅ actually deletes
      // onSnapshot will auto-refresh; this is just instant UI feedback:
      setLogs([]);
    } catch (e) {
      console.error("Clear logs failed:", e);
      alert("Failed to clear logs. Check console for details.");
    } finally {
      setClearing(false);
    }
  };

  return (
    <div className="card table-card">
      {/* centered title + button right */}
      <div className="table-header">
        <div /> {/* left spacer keeps title perfectly centered */}
        <h3 className="section-title m0">Verification Logs</h3>
        <button className="btn outline danger glow-clear" onClick={clearLogs} disabled={clearing}>
          {clearing ? "Clearing…" : "Clear Logs"}
        </button>
      </div>

      <div className="table-wrap">
        <table className="table">
          <thead>
            <tr>
              <th>BSF Cheque #</th>
              <th>Name</th>
              <th>Verified By</th>
              <th>Status</th>
              <th>Date & Time</th>
            </tr>
          </thead>
          <tbody>
            {logs.length === 0 ? (
              <tr>
                <td colSpan="5" className="center muted">No verifications yet</td>
              </tr>
            ) : (
              logs.map((log) => (
                <tr key={log.id}>
                  <td>{log.chequeId}</td>
                  <td>{log.name}</td>
                  <td>{log.verifiedBy}</td>
                  <td><span className={statusClass(log.status)}>{labelOf(log.status)}</span></td>
                  <td>{formatDateTime(log.verifiedAt)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

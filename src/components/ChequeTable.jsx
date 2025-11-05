import { useState } from "react";
import { db } from "../firebaseConfig";
import { labelOf } from "../utils/labelOf";
import {
  deleteDoc,
  doc,
  updateDoc,
  serverTimestamp,
  getDoc,
} from "firebase/firestore";
import {
  FaCheckCircle,
  FaTimesCircle,
  FaMoneyBillWave,
  FaEdit,
  FaTrash,
  FaSave,
} from "react-icons/fa";
import "../styles/ChequeTable.css";


export default function ChequeTable({ rows }) {
  const [editModal, setEditModal] = useState(false);
  const [editData, setEditData] = useState({
    id: "",
    chequeNo: "",
    name: "",
    phone: "",
    amount: "",
    status: "valid",
  });

  // 🧠 Open Edit Modal
  const startEdit = (r) => {
    setEditData({
      id: r.id,
      chequeNo: r.chequeNo || r.chequeId || "",
      name: r.name || "",
      phone: r.phone || "",
      amount: r.amount || "",
      status: r.status || "valid",
    });
    setEditModal(true);
  };

  // Close Modal
  const closeModal = () => setEditModal(false);

  // ✅ Save Edited Cheque
  const saveEdit = async () => {
    if (!editData.id) return;
    await updateDoc(doc(db, "cheques", editData.id), {
      name: editData.name,
      phone: editData.phone,
      amount: editData.amount,
      status: editData.status,
      updatedAt: serverTimestamp(),
    });
    setEditModal(false);
  };

  // 🗑 Delete Cheque
  const remove = async (id) => {
    if (!confirm("Delete this cheque?")) return;
    await deleteDoc(doc(db, "cheques", id));
  };

  // 🟢 Update Cheque Status (no verification log)
  const setStatus = async (id, status) => {
    await updateDoc(doc(db, "cheques", id), {
      status,
      updatedAt: serverTimestamp(),
    });
  };

  // 🎨 Status color classes
  const statusClass = (s) => {
    if (s === "valid") return "chip valid";
    if (s === "not_valid") return "chip notvalid";
    if (s === "paid") return "chip paid";
    return "chip";
  };

  return (
    <div className="card table-card">
      <h3 className="section-title center">Cheques</h3>
      <div className="table-wrap">
        <table className="table">
          <thead>
            <tr>
              <th>BSF Cheque #</th>
              <th>Name</th>
              <th>Phone</th>
              <th>Amount</th>
              <th>Status</th>
              <th className="center">Quick Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan="6" className="center muted">
                  No cheques yet
                </td>
              </tr>
            ) : (
              rows.map((r) => (
                <tr key={r.id}>
                  <td>{r.chequeNo || r.chequeId || "—"}</td>
                  <td>{r.name}</td>
                  <td>{r.phone}</td>
                  <td>{r.amount}</td>
                  <td>
                    <span className={statusClass(r.status)}>
                      {labelOf(r.status)}
                    </span>
                  </td>
                  <td>
                    <div className="action-grid">
                      {/* ✅ Quick Status Buttons */}
                      <div className="status-row">
                        <button
                          className="icon-btn valid"
                          onClick={() => setStatus(r.id, "valid")}
                          title="Mark as Valid"
                        >
                          <FaCheckCircle />
                        </button>
                        <button
                          className="icon-btn notvalid"
                          onClick={() => setStatus(r.id, "not_valid")}
                          title="Mark as Not Valid"
                        >
                          <FaTimesCircle />
                        </button>
                        <button
                          className="icon-btn paid"
                          onClick={() => setStatus(r.id, "paid")}
                          title="Mark as Paid"
                        >
                          <FaMoneyBillWave />
                        </button>
                      </div>

                      {/* ✏ Edit / Delete Buttons */}
                      <div className="action-bottom">
                        <button
                          className="icon-btn edit"
                          onClick={() => startEdit(r)}
                          title="Edit"
                        >
                          <FaEdit />
                        </button>
                        <button
                          className="icon-btn danger"
                          onClick={() => remove(r.id)}
                          title="Delete"
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* ✏ Edit Modal */}
      {editModal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <h3 className="modal-title">Edit Cheque</h3>

            <input
              className="input sm"
              value={editData.chequeNo}
              disabled
              readOnly
            />
            <input
              className="input sm"
              placeholder="Name"
              value={editData.name}
              onChange={(e) =>
                setEditData({ ...editData, name: e.target.value })
              }
            />
            <input
              className="input sm"
              placeholder="Phone"
              value={editData.phone}
              onChange={(e) =>
                setEditData({ ...editData, phone: e.target.value })
              }
            />
            <input
              className="input sm"
              placeholder="Amount"
              value={editData.amount}
              onChange={(e) =>
                setEditData({ ...editData, amount: e.target.value })
              }
            />
            <select
              className="input sm"
              value={editData.status}
              onChange={(e) =>
                setEditData({ ...editData, status: e.target.value })
              }
            >
              <option value="valid">Valid</option>
              <option value="not_valid">Not Valid</option>
              <option value="paid">Paid</option>
            </select>

            <div className="modal-actions">
              <button className="btn gold-btn" onClick={saveEdit}>
                <FaSave style={{ marginRight: 6 }} /> Save
              </button>
              <button className="btn outline danger" onClick={closeModal}>
                ✖ Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

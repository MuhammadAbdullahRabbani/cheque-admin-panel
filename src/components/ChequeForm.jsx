import { useEffect, useRef, useState } from "react";
import { db } from "../firebaseConfig";
import {
  addDoc,
  collection,
  serverTimestamp,
  getDocs,
  query,
  where,
} from "firebase/firestore";
import { FaSave, FaTimes } from "react-icons/fa";
import "../App.css";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { labelOf } from "../utils/labelOf";

const STATUS = ["valid", "not_valid", "paid"];

export default function ChequeForm({ currentUser }) {
  const [form, setForm] = useState({
    name: "",
    phone: "",
    amount: "",
    status: "valid",
  });

  const [fields, setFields] = useState({
    first: ["", "", ""],
    second: ["", "", "", "", "", ""],
    third: ["", "", "", ""],
  });

  const inputRefs = useRef([]);
  const [saving, setSaving] = useState(false);
  const [dupExists, setDupExists] = useState(false);
  const debounceRef = useRef(null);
  const [open, setOpen] = useState(false);

  // 🧠 For animation toggle
  const [shake, setShake] = useState(false);

  // Build formatted cheque number
  const formattedChequeNo = `BSF${fields.first.join("")}-${fields.second.join(
    ""
  )}-${fields.third.join("")}`;

  // handle number input typing
  const handleChange = (e, section, index) => {
    const val = e.target.value.replace(/[^0-9]/g, "");
    if (!val) return;

    // ✅ Unlock again when user starts editing
    setDupExists(false);

    const updated = { ...fields };
    updated[section][index] = val.slice(-1);
    setFields(updated);

    const flatIndex =
      (section === "first" ? 0 : section === "second" ? 3 : 9) + index;
    const nextIndex = flatIndex + 1;

    if (inputRefs.current[nextIndex]) {
      inputRefs.current[nextIndex].focus();
    }
  };

  // handle backspace movement
  const handleKeyDown = (e, section, index) => {
    if (e.key === "Backspace") {
      const updated = { ...fields };

      if (fields[section][index]) {
        updated[section][index] = "";
        setFields(updated);
        return;
      }

      const flatIndex =
        (section === "first" ? 0 : section === "second" ? 3 : 9) + index;
      const prevIndex = flatIndex - 1;

      if (prevIndex >= 0 && inputRefs.current[prevIndex]) {
        inputRefs.current[prevIndex].focus();

        const allSections = ["first", "second", "third"];
        let runningIndex = prevIndex;
        for (let s of allSections) {
          const len = fields[s].length;
          if (runningIndex < len) {
            updated[s][runningIndex] = "";
            break;
          } else {
            runningIndex -= len;
          }
        }
        setFields(updated);
      }
    }
  };

  // 🧠 Duplicate check
  useEffect(() => {
    if (formattedChequeNo === "BSF--") return;

    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      try {
        const qRef = query(
          collection(db, "cheques"),
          where("chequeId", "==", formattedChequeNo)
        );
        const snap = await getDocs(qRef);
        if (!snap.empty) {
          setDupExists(true);
          setShake(true);
          setTimeout(() => setShake(false), 600); // reset shake

          // 🔥 Beautiful toast
          toast.error(`🚨 Cheque ${formattedChequeNo} already exists!`, {
            position: "top-center",
            autoClose: 3000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            theme: "dark",
            style: {
              background: "linear-gradient(135deg, #ff3b3b 0%, #8b0000 100%)",
              color: "white",
              fontWeight: 600,
              borderRadius: "12px",
              boxShadow: "0 0 18px rgba(255,0,0,0.7)",
            },
          });
        } else {
          setDupExists(false); // ✅ Unlock if unique
        }
      } catch (err) {
        console.error("Duplicate check failed:", err);
      }
    }, 400);
  }, [formattedChequeNo]);

  // Form actions
  const change = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const clear = () => {
    setForm({ name: "", phone: "", amount: "", status: "valid" });
    setFields({
      first: ["", "", ""],
      second: ["", "", "", "", "", ""],
      third: ["", "", "", ""],
    });
    setDupExists(false);
  };

  const save = async (e) => {
    e.preventDefault();
    const { name, phone, amount, status } = form;
    if (dupExists)
      return toast.warn("⚠️ This cheque number already exists!", {
        position: "top-center",
        theme: "dark",
      });
    if (!name || !phone || !amount)
      return toast.info("ℹ️ Please complete all fields!", {
        position: "top-center",
        theme: "colored",
      });

    setSaving(true);
    try {
      await addDoc(collection(db, "cheques"), {
        chequeId: formattedChequeNo,
        name,
        phone,
        amount,
        status,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        createdBy: currentUser?.email || "unknown",
      });
      clear();
      toast.success("✅ Cheque saved successfully!", {
        position: "top-center",
        theme: "colored",
        style: {
          background: "linear-gradient(135deg, #0f9d58, #34a853)",
          color: "white",
          fontWeight: "600",
          boxShadow: "0 0 15px rgba(16,185,129,0.7)",
        },
      });
    } catch (err) {
      console.error(err);
      toast.error("❌ Failed to save cheque!", { position: "top-center" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className="card cheque-form sleek-card"
      style={{ maxWidth: "600px", margin: "0 auto" }}
    >
      <h3 className="section-title center gold-text">Add Cheque</h3>

      <form className="form-grid" onSubmit={save}>
        {/* Cheque Number Input */}
        <div className="cheque-input-wrapper">
          <label className="input-label">Cheque Number</label>
          <div className="digit-box-container">
            <div className="prefix">BSF</div>

            {fields.first.map((digit, i) => (
              <input
                key={`first-${i}`}
                ref={(el) => (inputRefs.current[i] = el)}
                className={`digit-box ${
                  dupExists ? "dup-glow" : ""
                } ${shake ? "shake" : ""}`}
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength="1"
                value={digit}
                onChange={(e) => handleChange(e, "first", i)}
                onKeyDown={(e) => handleKeyDown(e, "first", i)}
              />
            ))}

            <span className="hyphen">-</span>

            {fields.second.map((digit, i) => (
              <input
                key={`second-${i}`}
                ref={(el) => (inputRefs.current[3 + i] = el)}
                className={`digit-box ${
                  dupExists ? "dup-glow" : ""
                } ${shake ? "shake" : ""}`}
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength="1"
                value={digit}
                onChange={(e) => handleChange(e, "second", i)}
                onKeyDown={(e) => handleKeyDown(e, "second", i)}
              />
            ))}

            <span className="hyphen">-</span>

            {fields.third.map((digit, i) => (
              <input
                key={`third-${i}`}
                ref={(el) => (inputRefs.current[9 + i] = el)}
                className={`digit-box ${
                  dupExists ? "dup-glow" : ""
                } ${shake ? "shake" : ""}`}
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength="1"
                value={digit}
                onChange={(e) => handleChange(e, "third", i)}
                onKeyDown={(e) => handleKeyDown(e, "third", i)}
              />
            ))}
          </div>
        </div>

        {/* Other Inputs */}
        <input
          className="input modern-input"
          name="name"
          placeholder="Name"
          value={form.name}
          onChange={change}
          disabled={dupExists}
        />
        <input
          className="input modern-input"
          name="phone"
          placeholder="Phone Number"
          value={form.phone}
          onChange={change}
          disabled={dupExists}
        />
        <input
          className="input modern-input"
          name="amount"
          placeholder="Amount"
          value={form.amount}
          onChange={change}
          disabled={dupExists}
        />

        {/* Custom Styled Dropdown */}
        <div className={`dropdown-wrapper ${open ? "open" : ""}`}>
          <button
            type="button"
            className="dropdown-display"
            onClick={() => setOpen(!open)}
            disabled={dupExists}
          >
            {labelOf(form.status)}
            <span className={`arrow ${open ? "up" : "down"}`}>▼</span>
          </button>

          {open && (
            <ul className="dropdown-menu">
              {STATUS.map((s) => (
                <li
                  key={s}
                  className={`dropdown-item ${
                    form.status === s ? "active" : ""
                  }`}
                  onClick={() => {
                    setForm({ ...form, status: s });
                    setOpen(false);
                  }}
                >
                  {labelOf(s)}
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Buttons */}
        <div className="actions">
          <button
            className="btn gold-btn"
            type="submit"
            disabled={saving || dupExists}
          >
            <FaSave size={14} style={{ marginRight: 6 }} />
            {saving ? "Saving..." : "Save"}
          </button>
          <button
            type="button"
            className="btn outline danger-btn"
            onClick={clear}
            disabled={saving}
          >
            <FaTimes size={14} style={{ marginRight: 6 }} />
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./firebaseConfig";
import Login from "./components/Login";
import Dashboard from "./components/Dashboard";
import "@fortawesome/fontawesome-free/css/all.min.css";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";



export default function App() {
  const [user, setUser] = useState(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u || null);
      setChecking(false);
    });
    return () => unsub();
  }, []);

  if (checking) {
    return (
      <div className="center-screen">
        <div className="loader" />
        <p className="muted">Loading…</p>
      </div>
    );
  }

  return (
    <div className="app-shell">
      {user ? <Dashboard user={user} /> : <Login />}

      {/* ✅ React-Toastify mount */}
      <ToastContainer
        position="top-center"
        autoClose={2500}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="dark"
        toastStyle={{
          background: "linear-gradient(135deg, #ff3b3b 0%, #8b0000 100%)",
          color: "white",
          fontWeight: 600,
          borderRadius: "10px",
          boxShadow: "0 0 15px rgba(255,0,0,0.5)",
        }}
      />
    </div>
  );
}

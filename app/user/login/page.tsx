"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function UserLoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Credenciales de prueba
  const testEmail = "ituser@skillsforit.com";
  const testPassword = "testit123";
  const testToken = "token_user_001";

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    // Simular login
    setTimeout(() => {
      localStorage.setItem("user_token", testToken);
      localStorage.setItem("user_email", testEmail);
      router.push("/user/dashboard");
    }, 800);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950">
      <div className="bg-slate-900 p-8 rounded-lg shadow-lg w-full max-w-md">
        <h1 className="text-2xl font-bold mb-4 text-white">Login Usuario IT</h1>
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-slate-400 mb-1">Email de prueba</label>
            <input
              type="text"
              value={testEmail}
              readOnly
              className="w-full px-3 py-2 rounded bg-slate-800 text-white border border-slate-700"
            />
          </div>
          <div>
            <label className="block text-slate-400 mb-1">Contraseña de prueba</label>
            <input
              type="text"
              value={testPassword}
              readOnly
              className="w-full px-3 py-2 rounded bg-slate-800 text-white border border-slate-700"
            />
          </div>
          <button
            type="submit"
            className="w-full py-2 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold rounded-lg transition-colors"
            disabled={loading}
          >
            {loading ? "Ingresando..." : "Ingresar"}
          </button>
          {error && <p className="text-red-500 mt-2">{error}</p>}
        </form>
        <div className="mt-6 text-xs text-slate-400">
          <p>Usa las credenciales de prueba para acceder al dashboard IT.</p>
        </div>
      </div>
    </div>
  );
}

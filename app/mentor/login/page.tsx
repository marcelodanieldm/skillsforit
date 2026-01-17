"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@supabase/supabase-js";

export default function MentorLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Credenciales inválidas');
      }
      if (data.user.role !== 'mentor') {
        throw new Error('Solo usuarios con rol mentor pueden acceder a este dashboard');
      }
      localStorage.setItem('mentor_token', data.token);
      localStorage.setItem('mentor_user', JSON.stringify(data.user));
      router.push(`/mentor/dashboard?id=${data.user.id}`);
    } catch (err: any) {
      setError(err.message || 'Error de autenticación.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 px-4">
      <div className="max-w-md w-full">
        <form
          onSubmit={handleLogin}
          className="bg-slate-800 p-8 rounded-lg shadow-lg w-full"
        >
          <h2 className="text-2xl font-bold text-white mb-6 text-center">
            Login Mentor
          </h2>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full mb-4 px-4 py-2 rounded bg-slate-700 text-white"
            required
          />
          <input
            type="password"
            placeholder="Contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full mb-4 px-4 py-2 rounded bg-slate-700 text-white"
            required
          />
          {error && (
            <div className="text-red-400 mb-4 text-center">{error}</div>
          )}
          <button
            type="submit"
            className="w-full py-2 px-4 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded"
            disabled={loading}
          >
            {loading ? "Ingresando..." : "Ingresar"}
          </button>
        </form>
        {/* Credenciales de prueba */}
        <div className="mt-6 pt-6 border-t-2 border-slate-700">
          <p className="text-gray-400 text-sm mb-2 font-medium">Credenciales de Prueba:</p>
          <div className="bg-slate-700/50 rounded-lg p-3 space-y-1 text-xs">
            <p className="text-gray-300">
              <span className="text-green-400 font-semibold">Mentor:</span> mentor@skillsforit.com / mentor123
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

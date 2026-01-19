import { redirect } from 'next/navigation'

export default function MentorCheckoutSuccess() {
  // Aquí podrías mostrar un mensaje de éxito y redirigir al dashboard
  if (typeof window !== 'undefined') {
    setTimeout(() => {
      redirect('/mentor/dashboard')
    }, 3000)
  }
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="bg-slate-800 rounded-2xl p-8 border-2 border-green-500/50 shadow-xl text-center">
        <h1 className="text-3xl font-bold text-green-400 mb-4">¡Pago Exitoso!</h1>
        <p className="text-white mb-2">Tu sesión de mentoría ha sido reservada correctamente.</p>
        <p className="text-gray-300 mb-4">Serás redirigido al panel de mentoría en unos segundos...</p>
        <div className="mt-6 text-green-300">✅ ¡Gracias por tu compra!</div>
      </div>
    </div>
  )
}

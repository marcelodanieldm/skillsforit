import PaymentForm from '@/components/ebook/PaymentForm'

export default function MentorPaymentPage() {
  // Aquí puedes definir el monto, nombre y tipo de producto para la mentoría
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
      <div className="max-w-lg w-full bg-slate-800 rounded-2xl p-8 border-2 border-purple-500/50 shadow-xl">
        <h1 className="text-3xl font-bold text-white mb-4 text-center">Pagar Sesión de Mentoría</h1>
        <PaymentForm
          amount={1500} // 15 USD en centavos, ajusta según tarifa
          productName="Sesión de Mentoría"
          productType="mentoria"
          buttonText="Pagar Mentoría"
        />
      </div>
    </div>
  )
}

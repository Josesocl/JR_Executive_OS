export const dynamic = 'force-dynamic'

export default function PendingApprovalPage() {
  return (
    <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#f0ece4' }}>
      <div className="max-w-md text-center px-6">
        <h1 className="text-2xl font-semibold text-gray-900 mb-3">Acceso pendiente</h1>
        <p className="text-gray-600">
          Tu cuenta está registrada. Te avisaremos por email cuando tu acceso sea aprobado.
        </p>
      </div>
    </div>
  )
}

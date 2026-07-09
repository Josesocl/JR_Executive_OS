import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'

export default function PendingApprovalPage() {
  return (
    <Card className="w-full max-w-md mx-4 shadow-lg">
      <CardHeader className="text-center pb-2">
        <div className="flex items-center justify-center gap-1 mb-2">
          <span className="text-3xl font-bold tracking-tight" style={{ color: '#e8b86d' }}>
            IKIGAI
          </span>
          <span className="text-3xl font-light tracking-tight" style={{ color: '#1a1a2e' }}>
            Planner
          </span>
        </div>
        <CardTitle className="text-xl">Cuenta pendiente de aprobación</CardTitle>
        <CardDescription>
          Tu cuenta se creó correctamente, pero este es un piloto cerrado. Escríbele a JR
          (josesocl@yahoo.com) para que active tu acceso.
        </CardDescription>
      </CardHeader>
      <CardContent />
    </Card>
  )
}

import { getCurrentUser } from '@/actions/user'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default async function UserDashboardPage() {
  const current = await getCurrentUser()

  if (!current) {
    return null
  }

  return (
    <div className="container">
      <h1 className="text-3xl font-bold mb-8">
        Bienvenue, {current.name ?? current.email}
      </h1>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Statut de ma demande</CardTitle>
          </CardHeader>
          <CardContent>
            {/* Statut de la demande de l'utilisateur */}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Mes documents</CardTitle>
          </CardHeader>
          <CardContent>
            {/* Liste des documents de l'utilisateur */}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
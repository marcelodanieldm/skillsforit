"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  Activity, 
  TrendingUp, 
  Users, 
  CalendarDays, 
  Sparkles, 
  Check,
  CloudRain,
  Music,
  Heart,
  Building2,
  Utensils,
  ArrowRight,
  Zap
} from "lucide-react"

export function MerchantDashboard() {
  const [healthStatus, setHealthStatus] = useState<"green" | "yellow" | "red">("yellow")
  const [isPublishing, setIsPublishing] = useState(false)
  const [isPublished, setIsPublished] = useState(false)

  const handlePublish = () => {
    setIsPublishing(true)
    setTimeout(() => {
      setIsPublishing(false)
      setIsPublished(true)
      setHealthStatus("green")
      // Reset after 5 seconds for demo
      setTimeout(() => {
        setIsPublished(false)
      }, 5000)
    }, 2000)
  }

  const getHealthColor = () => {
    switch (healthStatus) {
      case "green":
        return "bg-success"
      case "yellow":
        return "bg-warning"
      case "red":
        return "bg-destructive"
    }
  }

  const getHealthText = () => {
    switch (healthStatus) {
      case "green":
        return { title: "Flujo Óptimo", description: "Afluencia equilibrada en el destino" }
      case "yellow":
        return { title: "Atención Requerida", description: "Capacidad al 70% - Oportunidad de acción" }
      case "red":
        return { title: "Alta Congestión", description: "Destino saturado - Activar dispersión" }
    }
  }

  const stats = [
    { label: "Visitantes Hoy", value: "1,247", change: "+12%", icon: Users },
    { label: "Reservas Activas", value: "89", change: "+8%", icon: CalendarDays },
    { label: "Ocupación Promedio", value: "72%", change: "+5%", icon: Activity },
    { label: "Ingresos del Día", value: "$4,850", change: "+15%", icon: TrendingUp },
  ]

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card px-4 py-6 md:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground md:text-3xl">Panel de Comerciante</h1>
              <p className="text-muted-foreground">La Bodega del Puerto - Dashboard Predictivo</p>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="gap-1">
                <div className="h-2 w-2 animate-pulse rounded-full bg-success" />
                En línea
              </Badge>
              <Badge variant="secondary">Restaurante</Badge>
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 py-8 md:px-8">
        <div className="mx-auto max-w-6xl space-y-6">
          {/* Stats Grid */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {stats.map((stat) => {
              const IconComponent = stat.icon
              return (
                <Card key={stat.label}>
                  <CardContent className="flex items-center gap-4 p-6">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                      <IconComponent className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">{stat.label}</p>
                      <div className="flex items-baseline gap-2">
                        <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                        <span className="text-xs font-medium text-success">{stat.change}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>

          {/* Main Content Grid */}
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Destination Health Indicator */}
            <Card className="lg:col-span-1">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Indicador de Salud
                </CardTitle>
                <CardDescription>Estado del destino en tiempo real</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Traffic Light */}
                <div className="flex justify-center">
                  <div className="flex flex-col gap-3 rounded-2xl bg-muted p-4">
                    <button
                      onClick={() => setHealthStatus("red")}
                      className={`h-16 w-16 rounded-full transition-all ${
                        healthStatus === "red"
                          ? "bg-destructive shadow-lg shadow-destructive/50"
                          : "bg-destructive/20 hover:bg-destructive/40"
                      }`}
                    />
                    <button
                      onClick={() => setHealthStatus("yellow")}
                      className={`h-16 w-16 rounded-full transition-all ${
                        healthStatus === "yellow"
                          ? "bg-warning shadow-lg shadow-warning/50"
                          : "bg-warning/20 hover:bg-warning/40"
                      }`}
                    />
                    <button
                      onClick={() => setHealthStatus("green")}
                      className={`h-16 w-16 rounded-full transition-all ${
                        healthStatus === "green"
                          ? "bg-success shadow-lg shadow-success/50"
                          : "bg-success/20 hover:bg-success/40"
                      }`}
                    />
                  </div>
                </div>

                {/* Status Text */}
                <div className="text-center">
                  <div className={`mx-auto mb-2 h-3 w-3 rounded-full ${getHealthColor()}`} />
                  <h3 className="text-lg font-semibold">{getHealthText().title}</h3>
                  <p className="text-sm text-muted-foreground">{getHealthText().description}</p>
                </div>

                {/* Quick Stats */}
                <div className="space-y-2 rounded-lg bg-secondary p-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Flujo actual</span>
                    <span className="font-medium">847 personas/hora</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Capacidad óptima</span>
                    <span className="font-medium">1,200 personas/hora</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Tiempo promedio visita</span>
                    <span className="font-medium">3.2 horas</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* AI Predictive Alert Box - Star Section */}
            <Card className="lg:col-span-2 border-2 border-primary/30 bg-gradient-to-br from-primary/5 via-card to-accent/5">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-accent">
                    <Sparkles className="h-6 w-6 text-primary-foreground" />
                  </div>
                  <div>
                    <CardTitle className="text-xl">Asistente IA Predictivo</CardTitle>
                    <CardDescription>Recomendaciones personalizadas basadas en datos</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* AI Insight Card */}
                <div className="rounded-xl border-2 border-warning/30 bg-warning/5 p-6">
                  <div className="mb-4 flex items-start gap-3">
                    <span className="text-3xl">🔮</span>
                    <div>
                      <h3 className="text-lg font-semibold text-foreground">Predicción para este Viernes</h3>
                      <p className="text-sm text-muted-foreground">Análisis basado en eventos, clima y patrones históricos</p>
                    </div>
                  </div>

                  {/* Prediction Details */}
                  <div className="mb-6 grid gap-4 md:grid-cols-3">
                    <div className="flex items-center gap-3 rounded-lg bg-card p-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent/20">
                        <Heart className="h-5 w-5 text-accent" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-foreground">+35%</p>
                        <p className="text-xs text-muted-foreground">Parejas esperadas</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 rounded-lg bg-card p-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/20">
                        <Music className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-foreground">Concierto Local</p>
                        <p className="text-xs text-muted-foreground">20:00 - Plaza Central</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 rounded-lg bg-card p-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-info/20">
                        <CloudRain className="h-5 w-5 text-info" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-foreground">70%</p>
                        <p className="text-xs text-muted-foreground">Prob. lluvia tarde</p>
                      </div>
                    </div>
                  </div>

                  {/* AI Recommendation */}
                  <div className="rounded-lg bg-gradient-to-r from-primary/10 to-accent/10 p-4">
                    <p className="text-base leading-relaxed text-foreground">
                      <span className="font-semibold">💡 Sugerencia:</span> Se espera un incremento del{" "}
                      <span className="font-bold text-primary">35% en parejas</span> este viernes debido al concierto
                      local, combinado con una{" "}
                      <span className="font-bold text-info">70% probabilidad de lluvia por la tarde</span>.
                    </p>
                    <p className="mt-2 text-base font-medium text-foreground">
                      Recomendamos crear un paquete de{" "}
                      <span className="text-accent">cena temprana (18:00-19:30)</span> + entrada al{" "}
                      <span className="text-accent">Museo de Arte Regional</span> vecino, ofreciendo un 15% de
                      descuento conjunto.
                    </p>
                  </div>
                </div>

                {/* Suggested Package Preview */}
                <div className="rounded-xl border bg-card p-4">
                  <h4 className="mb-3 font-semibold text-foreground">Vista Previa del Paquete Sugerido</h4>
                  <div className="flex flex-col gap-3 md:flex-row md:items-center">
                    <div className="flex flex-1 items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/20">
                        <Utensils className="h-5 w-5 text-accent" />
                      </div>
                      <div>
                        <p className="font-medium">Cena Romántica</p>
                        <p className="text-sm text-muted-foreground">La Bodega del Puerto</p>
                      </div>
                    </div>
                    <ArrowRight className="hidden h-5 w-5 text-muted-foreground md:block" />
                    <div className="flex flex-1 items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/20">
                        <Building2 className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">Entrada Museo</p>
                        <p className="text-sm text-muted-foreground">Museo de Arte Regional</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 rounded-lg bg-success/10 px-4 py-2">
                      <span className="text-sm text-muted-foreground">Precio paquete:</span>
                      <span className="text-xl font-bold text-success">$38</span>
                      <span className="text-sm text-muted-foreground line-through">$45</span>
                    </div>
                  </div>
                </div>

                {/* Unified Action Button */}
                <Button
                  size="lg"
                  className={`w-full gap-3 text-lg transition-all ${
                    isPublished
                      ? "bg-success hover:bg-success/90"
                      : "bg-gradient-to-r from-primary to-accent hover:opacity-90"
                  }`}
                  onClick={handlePublish}
                  disabled={isPublishing || isPublished}
                >
                  {isPublishing ? (
                    <>
                      <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
                      Publicando paquete...
                    </>
                  ) : isPublished ? (
                    <>
                      <Check className="h-5 w-5" />
                      Paquete Publicado con Éxito
                    </>
                  ) : (
                    <>
                      <Zap className="h-5 w-5" />
                      Aceptar sugerencia de precio y publicar paquete cooperativo
                    </>
                  )}
                </Button>

                {isPublished && (
                  <div className="animate-in fade-in slide-in-from-bottom-2 rounded-lg border border-success/30 bg-success/10 p-4 text-center">
                    <p className="font-medium text-success">
                      ✨ El paquete cooperativo ya está visible en la App del Turista
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Los visitantes pueden reservar inmediatamente
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Additional Insights */}
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Próximos Eventos</CardTitle>
                <CardDescription>Eventos que pueden afectar tu negocio</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  { name: "Concierto Jazz en la Plaza", date: "Viernes 20:00", impact: "Alto", type: "music" },
                  { name: "Festival Gastronómico", date: "Sábado - Domingo", impact: "Muy Alto", type: "food" },
                  { name: "Maratón Ciudad", date: "Domingo 08:00", impact: "Medio", type: "sport" },
                ].map((event) => (
                  <div key={event.name} className="flex items-center justify-between rounded-lg bg-secondary p-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                        {event.type === "music" && <Music className="h-5 w-5 text-primary" />}
                        {event.type === "food" && <Utensils className="h-5 w-5 text-primary" />}
                        {event.type === "sport" && <Activity className="h-5 w-5 text-primary" />}
                      </div>
                      <div>
                        <p className="font-medium">{event.name}</p>
                        <p className="text-sm text-muted-foreground">{event.date}</p>
                      </div>
                    </div>
                    <Badge
                      variant="secondary"
                      className={
                        event.impact === "Muy Alto"
                          ? "bg-success/20 text-success"
                          : event.impact === "Alto"
                            ? "bg-warning/20 text-warning-foreground"
                            : "bg-secondary"
                      }
                    >
                      {event.impact}
                    </Badge>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Comercios Colaboradores</CardTitle>
                <CardDescription>Negocios cercanos para paquetes conjuntos</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  { name: "Museo de Arte Regional", type: "Cultura", distance: "50m", status: "Activo" },
                  { name: "Bodega Don Carlos", type: "Enoturismo", distance: "200m", status: "Activo" },
                  { name: "Hotel Vista Mar", type: "Alojamiento", distance: "150m", status: "Pendiente" },
                ].map((partner) => (
                  <div key={partner.name} className="flex items-center justify-between rounded-lg bg-secondary p-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10">
                        <Building2 className="h-5 w-5 text-accent" />
                      </div>
                      <div>
                        <p className="font-medium">{partner.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {partner.type} · {partner.distance}
                        </p>
                      </div>
                    </div>
                    <Badge variant={partner.status === "Activo" ? "default" : "secondary"}>
                      {partner.status}
                    </Badge>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

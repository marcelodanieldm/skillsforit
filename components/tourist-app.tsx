"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Sun, CloudRain, Clock, Utensils, MapPin, Timer, ShoppingCart, Check, Sparkles, Building2, Palette, Wine, Mountain, Camera, Bike } from "lucide-react"

interface CartItem {
  id: string
  name: string
  price: number
  type: "activity" | "restaurant" | "excursion"
}

export function TouristApp() {
  const [weather, setWeather] = useState<"sunny" | "rainy">("sunny")
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string | null>(null)
  const [cart, setCart] = useState<CartItem[]>([])
  const [restaurantBooked, setRestaurantBooked] = useState(false)
  const [countdown, setCountdown] = useState({ hours: 23, minutes: 45, seconds: 30 })

  // Countdown timer effect
  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 }
        } else if (prev.minutes > 0) {
          return { ...prev, minutes: prev.minutes - 1, seconds: 59 }
        } else if (prev.hours > 0) {
          return { hours: prev.hours - 1, minutes: 59, seconds: 59 }
        }
        return prev
      })
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  const timeSlots = [
    { time: "09:00", price: 15, isPeak: false },
    { time: "10:00", price: 18, isPeak: false },
    { time: "11:00", price: 25, isPeak: true },
    { time: "12:00", price: 28, isPeak: true },
    { time: "13:00", price: 28, isPeak: true },
    { time: "14:00", price: 25, isPeak: true },
    { time: "15:00", price: 18, isPeak: false },
    { time: "16:00", price: 15, isPeak: false },
    { time: "17:00", price: 12, isPeak: false },
  ]

  const sunnyActivities = [
    { id: "beach", name: "Playa El Faro", description: "Playas cristalinas con deportes acuáticos", price: 35, icon: Sun },
    { id: "bike", name: "Ruta en Bicicleta", description: "Recorrido por viñedos locales", price: 45, icon: Bike },
    { id: "photo", name: "Tour Fotográfico", description: "Captura los paisajes más bellos", price: 55, icon: Camera },
  ]

  const rainyActivities = [
    { id: "museum", name: "Museo de Arte Regional", description: "Colección de arte contemporáneo", price: 12, originalPrice: 20, icon: Building2 },
    { id: "gallery", name: "Galería Cultural", description: "Exposición: Historia del Vino", price: 8, originalPrice: 15, icon: Palette },
    { id: "tasting", name: "Cata de Vinos Indoor", description: "Degustación premium bajo techo", price: 25, originalPrice: 40, icon: Wine },
  ]

  const activities = weather === "sunny" ? sunnyActivities : rainyActivities

  const flashDeals = [
    { id: "kayak", name: "Kayak al Atardecer", spotsLeft: 3, discount: 40, originalPrice: 60, finalPrice: 36 },
    { id: "hiking", name: "Senderismo Montaña", spotsLeft: 5, discount: 35, originalPrice: 45, finalPrice: 29 },
  ]

  const addToCart = (item: CartItem) => {
    if (!cart.find((i) => i.id === item.id)) {
      setCart([...cart, item])
    }
  }

  const removeFromCart = (id: string) => {
    setCart(cart.filter((item) => item.id !== id))
  }

  const getSelectedSlotPrice = () => {
    const slot = timeSlots.find((s) => s.time === selectedTimeSlot)
    return slot?.price || 0
  }

  // Calculate bundle discount
  const hasActivity = cart.some((item) => item.type === "activity" || item.type === "excursion")
  const hasRestaurant = restaurantBooked
  const bundleDiscount = hasActivity && hasRestaurant ? 0.15 : 0
  const subtotal = cart.reduce((sum, item) => sum + item.price, 0) + (selectedTimeSlot ? getSelectedSlotPrice() : 0) + (restaurantBooked ? 32 : 0)
  const discount = subtotal * bundleDiscount
  const total = subtotal - discount

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section with Weather Toggle */}
      <div className="relative overflow-hidden bg-gradient-to-br from-primary/10 via-background to-accent/10 px-4 py-8 md:px-8 md:py-12">
        <div className="mx-auto max-w-6xl">
          <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground md:text-4xl">
                {weather === "sunny" ? "Descubre Villa del Sol" : "Actividades para Hoy"}
              </h1>
              <p className="mt-2 text-muted-foreground">
                {weather === "sunny"
                  ? "Un día perfecto para explorar al aire libre"
                  : "Día lluvioso, ofertas especiales en actividades indoor"}
              </p>
            </div>

            {/* Weather Toggle */}
            <Card className="w-full md:w-auto">
              <CardContent className="flex items-center gap-4 p-4">
                <span className="text-sm font-medium text-muted-foreground">Simular clima:</span>
                <div className="flex gap-2">
                  <Button
                    variant={weather === "sunny" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setWeather("sunny")}
                    className="gap-2"
                  >
                    <Sun className="h-4 w-4" />
                    Soleado
                  </Button>
                  <Button
                    variant={weather === "rainy" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setWeather("rainy")}
                    className="gap-2"
                  >
                    <CloudRain className="h-4 w-4" />
                    Lluvioso
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Rainy Day Alert Banner */}
          {weather === "rainy" && (
            <Card className="mb-6 border-2 border-warning bg-warning/10">
              <CardContent className="flex items-center gap-4 p-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-warning/20">
                  <Sparkles className="h-6 w-6 text-warning-foreground" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">Combo Día Lluvioso Activado</h3>
                  <p className="text-sm text-muted-foreground">
                    Hasta 40% de descuento en museos, galerías y experiencias indoor
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Dynamic Activities Grid */}
          <div className="grid gap-4 md:grid-cols-3">
            {activities.map((activity) => {
              const IconComponent = activity.icon
              const isInCart = cart.find((item) => item.id === activity.id)
              return (
                <Card key={activity.id} className="overflow-hidden transition-all hover:shadow-lg">
                  <div className="aspect-video bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                    <IconComponent className="h-16 w-16 text-primary/60" />
                  </div>
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between">
                      <CardTitle className="text-lg">{activity.name}</CardTitle>
                      {weather === "rainy" && "originalPrice" in activity && (
                        <Badge variant="secondary" className="bg-success text-success-foreground">
                          -{Math.round((1 - activity.price / activity.originalPrice) * 100)}%
                        </Badge>
                      )}
                    </div>
                    <CardDescription>{activity.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <div className="flex items-baseline gap-2">
                        <span className="text-2xl font-bold text-primary">${activity.price}</span>
                        {weather === "rainy" && "originalPrice" in activity && (
                          <span className="text-sm text-muted-foreground line-through">
                            ${activity.originalPrice}
                          </span>
                        )}
                      </div>
                      <Button
                        size="sm"
                        variant={isInCart ? "secondary" : "default"}
                        onClick={() =>
                          isInCart
                            ? removeFromCart(activity.id)
                            : addToCart({ id: activity.id, name: activity.name, price: activity.price, type: "activity" })
                        }
                      >
                        {isInCart ? <Check className="mr-1 h-4 w-4" /> : null}
                        {isInCart ? "Agregado" : "Agregar"}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      </div>

      {/* Dynamic Ticketing Module */}
      <div className="px-4 py-8 md:px-8">
        <div className="mx-auto max-w-6xl">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <MapPin className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <CardTitle>Mirador del Valle - Entradas</CardTitle>
                  <CardDescription>Precios dinámicos según demanda horaria</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <div className="mb-2 flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full bg-success" />
                    <span>Valle (mejor precio)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full bg-destructive" />
                    <span>Pico (11:00-14:00)</span>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2 md:grid-cols-5 lg:grid-cols-9">
                {timeSlots.map((slot) => (
                  <Button
                    key={slot.time}
                    variant={selectedTimeSlot === slot.time ? "default" : "outline"}
                    className={`flex h-auto flex-col gap-1 py-3 ${
                      slot.isPeak
                        ? "border-destructive/50 hover:border-destructive"
                        : "border-success/50 hover:border-success"
                    } ${selectedTimeSlot === slot.time ? "" : slot.isPeak ? "bg-destructive/5" : "bg-success/5"}`}
                    onClick={() => setSelectedTimeSlot(slot.time)}
                  >
                    <Clock className="h-4 w-4" />
                    <span className="text-sm font-medium">{slot.time}</span>
                    <span className="text-lg font-bold">${slot.price}</span>
                  </Button>
                ))}
              </div>
              {selectedTimeSlot && (
                <div className="mt-4 flex items-center justify-between rounded-lg bg-secondary p-4">
                  <div>
                    <p className="font-medium">Horario seleccionado: {selectedTimeSlot}</p>
                    <p className="text-sm text-muted-foreground">
                      {timeSlots.find((s) => s.time === selectedTimeSlot)?.isPeak
                        ? "Horario pico - Alta demanda"
                        : "Horario valle - Ahorra dinero"}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-primary">${getSelectedSlotPrice()}</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Gastronomy Valley Hour Section */}
      <div className="bg-secondary/30 px-4 py-8 md:px-8">
        <div className="mx-auto max-w-6xl">
          <Card className="overflow-hidden border-2 border-accent/30">
            <div className="grid md:grid-cols-2">
              <div className="aspect-video bg-gradient-to-br from-accent/30 to-primary/20 flex items-center justify-center md:aspect-auto">
                <div className="text-center p-8">
                  <Utensils className="h-20 w-20 text-accent mx-auto mb-4" />
                  <Badge variant="secondary" className="bg-accent text-accent-foreground text-lg px-4 py-1">
                    Hora Valle
                  </Badge>
                </div>
              </div>
              <div className="p-6">
                <CardHeader className="p-0 pb-4">
                  <Badge className="w-fit mb-2 bg-success text-success-foreground">20% Descuento</Badge>
                  <CardTitle className="text-2xl">La Bodega del Puerto</CardTitle>
                  <CardDescription className="text-base">
                    Cocina mediterránea con productos locales de temporada
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="mb-4 space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <Clock className="h-4 w-4 text-accent" />
                      <span>Reserva antes de las 20:00 hs</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Wine className="h-4 w-4 text-accent" />
                      <span>Copa de vino local de cortesía</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between rounded-lg bg-accent/10 p-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Menú degustación</p>
                      <div className="flex items-baseline gap-2">
                        <span className="text-2xl font-bold text-primary">$32</span>
                        <span className="text-sm text-muted-foreground line-through">$40</span>
                      </div>
                    </div>
                    <Button
                      variant={restaurantBooked ? "secondary" : "default"}
                      onClick={() => setRestaurantBooked(!restaurantBooked)}
                      className="gap-2"
                    >
                      {restaurantBooked ? <Check className="h-4 w-4" /> : null}
                      {restaurantBooked ? "Reservado" : "Reservar 19:30"}
                    </Button>
                  </div>
                </CardContent>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Last-Minute Flash Deals */}
      <div className="px-4 py-8 md:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-foreground">Excursiones de Última Hora</h2>
              <p className="text-muted-foreground">Plazas limitadas con descuentos especiales</p>
            </div>
            <div className="flex items-center gap-2 rounded-lg bg-destructive/10 px-4 py-2">
              <Timer className="h-5 w-5 text-destructive" />
              <span className="font-mono text-lg font-bold text-destructive">
                {String(countdown.hours).padStart(2, "0")}:{String(countdown.minutes).padStart(2, "0")}:
                {String(countdown.seconds).padStart(2, "0")}
              </span>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {flashDeals.map((deal) => {
              const isInCart = cart.find((item) => item.id === deal.id)
              return (
                <Card key={deal.id} className="relative overflow-hidden border-2 border-destructive/30">
                  <div className="absolute right-0 top-0 bg-destructive px-3 py-1 text-sm font-bold text-destructive-foreground">
                    -{deal.discount}%
                  </div>
                  <CardContent className="flex items-center gap-4 p-6">
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-primary/20 to-accent/20">
                      <Mountain className="h-8 w-8 text-primary" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold">{deal.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        Solo quedan <span className="font-bold text-destructive">{deal.spotsLeft}</span> plazas
                      </p>
                      <div className="mt-1 flex items-baseline gap-2">
                        <span className="text-xl font-bold text-primary">${deal.finalPrice}</span>
                        <span className="text-sm text-muted-foreground line-through">${deal.originalPrice}</span>
                      </div>
                    </div>
                    <Button
                      variant={isInCart ? "secondary" : "default"}
                      onClick={() =>
                        isInCart
                          ? removeFromCart(deal.id)
                          : addToCart({ id: deal.id, name: deal.name, price: deal.finalPrice, type: "excursion" })
                      }
                    >
                      {isInCart ? <Check className="mr-1 h-4 w-4" /> : null}
                      {isInCart ? "Agregado" : "Reservar"}
                    </Button>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      </div>

      {/* Collaborative Checkout */}
      {(cart.length > 0 || selectedTimeSlot || restaurantBooked) && (
        <div className="sticky bottom-0 border-t bg-card px-4 py-4 shadow-lg md:px-8">
          <div className="mx-auto max-w-6xl">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                  <ShoppingCart className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="font-medium">Tu Paquete Turístico</p>
                  <p className="text-sm text-muted-foreground">
                    {cart.length + (selectedTimeSlot ? 1 : 0) + (restaurantBooked ? 1 : 0)} experiencias seleccionadas
                  </p>
                </div>
              </div>

              <div className="flex flex-1 flex-wrap items-center justify-end gap-4">
                {bundleDiscount > 0 && (
                  <Badge variant="secondary" className="bg-success/20 text-success">
                    <Sparkles className="mr-1 h-3 w-3" />
                    Combo -15%
                  </Badge>
                )}
                <div className="text-right">
                  {bundleDiscount > 0 && (
                    <p className="text-sm text-muted-foreground line-through">${subtotal.toFixed(2)}</p>
                  )}
                  <p className="text-2xl font-bold text-primary">${total.toFixed(2)}</p>
                </div>
                <Button size="lg" className="gap-2">
                  Confirmar Paquete
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

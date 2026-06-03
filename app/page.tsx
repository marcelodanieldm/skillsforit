"use client"

import { useState } from "react"
import { TouristApp } from "@/components/tourist-app"
import { MerchantDashboard } from "@/components/merchant-dashboard"
import { Button } from "@/components/ui/button"
import { 
  MapPin, 
  BarChart3, 
  Menu, 
  X, 
  Compass,
  Store,
  Sun,
  Moon
} from "lucide-react"

export default function Home() {
  const [activeView, setActiveView] = useState<"tourist" | "merchant">("tourist")
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [isDark, setIsDark] = useState(false)

  const toggleTheme = () => {
    setIsDark(!isDark)
    document.documentElement.classList.toggle("dark")
  }

  return (
    <div className="flex min-h-screen">
      {/* Mobile Menu Button */}
      <Button
        variant="outline"
        size="icon"
        className="fixed left-4 top-4 z-50 lg:hidden"
        onClick={() => setSidebarOpen(!sidebarOpen)}
      >
        {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </Button>

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-72 transform bg-sidebar text-sidebar-foreground transition-transform duration-300 lg:relative lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className="flex items-center gap-3 border-b border-sidebar-border px-6 py-5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-sidebar-primary to-accent">
              <Compass className="h-6 w-6 text-sidebar-primary-foreground" />
            </div>
            <div>
              <h1 className="font-bold text-sidebar-foreground">DestinoSmart</h1>
              <p className="text-xs text-sidebar-foreground/70">Gestión Inteligente</p>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-2 p-4">
            <p className="mb-3 px-3 text-xs font-semibold uppercase tracking-wider text-sidebar-foreground/50">
              Interfaces
            </p>
            
            <button
              onClick={() => {
                setActiveView("tourist")
                setSidebarOpen(false)
              }}
              className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left transition-all ${
                activeView === "tourist"
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
              }`}
            >
              <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${
                activeView === "tourist" ? "bg-sidebar-primary" : "bg-sidebar-accent"
              }`}>
                <MapPin className={`h-5 w-5 ${activeView === "tourist" ? "text-sidebar-primary-foreground" : ""}`} />
              </div>
              <div>
                <p className="font-medium">App del Turista</p>
                <p className="text-xs opacity-70">Experiencia B2C</p>
              </div>
            </button>

            <button
              onClick={() => {
                setActiveView("merchant")
                setSidebarOpen(false)
              }}
              className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left transition-all ${
                activeView === "merchant"
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
              }`}
            >
              <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${
                activeView === "merchant" ? "bg-sidebar-primary" : "bg-sidebar-accent"
              }`}>
                <BarChart3 className={`h-5 w-5 ${activeView === "merchant" ? "text-sidebar-primary-foreground" : ""}`} />
              </div>
              <div>
                <p className="font-medium">Dashboard Comerciante</p>
                <p className="text-xs opacity-70">Panel B2B Predictivo</p>
              </div>
            </button>
          </nav>

          {/* Theme Toggle */}
          <div className="border-t border-sidebar-border p-4">
            <Button
              variant="ghost"
              className="w-full justify-start gap-3 text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground"
              onClick={toggleTheme}
            >
              {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              {isDark ? "Modo Claro" : "Modo Oscuro"}
            </Button>
          </div>

          {/* Footer */}
          <div className="border-t border-sidebar-border p-4">
            <div className="rounded-xl bg-sidebar-accent/50 p-4">
              <div className="mb-2 flex items-center gap-2">
                <Store className="h-4 w-4 text-sidebar-primary" />
                <span className="text-sm font-medium">Villa del Sol</span>
              </div>
              <p className="text-xs text-sidebar-foreground/60">
                Plataforma de gestión turística municipal colaborativa
              </p>
            </div>
          </div>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        {activeView === "tourist" ? <TouristApp /> : <MerchantDashboard />}
      </main>
    </div>
  )
}

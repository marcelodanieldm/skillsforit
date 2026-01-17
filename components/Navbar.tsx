'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { FaUser, FaSignInAlt, FaChevronDown } from 'react-icons/fa'

export default function Navbar() {
  const [showAuthMenu, setShowAuthMenu] = useState(false)

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-slate-900/80 backdrop-blur-md border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <span className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              SkillsForIt
            </span>
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center gap-8">
            <Link href="/mentors" className="text-gray-300 hover:text-white transition-colors text-sm font-medium">
              Mentorías
            </Link>
            <Link href="/soft-skills-guide" className="text-gray-300 hover:text-white transition-colors text-sm font-medium">
              Guía Soft Skills
            </Link>
            <Link href="/library" className="text-gray-300 hover:text-white transition-colors text-sm font-medium">
              Biblioteca
            </Link>
              <Link href="/mentor/dashboard" className="text-gray-300 hover:text-white transition-colors text-sm font-medium">
                Panel Mentor
              </Link>
          </div>

          {/* Auth Section */}
          <div className="relative">
            <button
              onClick={() => setShowAuthMenu(!showAuthMenu)}
              className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-gray-300 hover:text-white transition-all"
              onBlur={() => setTimeout(() => setShowAuthMenu(false), 200)}
            >
              <FaUser className="text-sm" />
              <span className="text-sm font-medium">Acceder</span>
              <FaChevronDown className={`text-xs transition-transform ${showAuthMenu ? 'rotate-180' : ''}`} />
            </button>

            {/* Dropdown Menu */}
            <AnimatePresence>
              {showAuthMenu && (
                <motion.div
                                    {/* IT User Login */}
                                    <Link
                                      href="/user/login"
                                      className="flex items-center gap-3 px-4 py-3 hover:bg-slate-700 transition-colors border-b border-slate-700"
                                    >
                                      <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                                      <div>
                                        <div className="text-white text-sm font-medium">Login Usuario IT</div>
                                        <div className="text-gray-400 text-xs">Acceso IT de prueba</div>
                                      </div>
                                    </Link>
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="absolute right-0 mt-2 w-56 bg-slate-800 border border-slate-700 rounded-lg shadow-xl overflow-hidden"
                >
                  {/* General Login */}
                  <Link
                    href="/auth/signin"
                    className="flex items-center gap-3 px-4 py-3 hover:bg-slate-700 transition-colors border-b border-slate-700"
                  >
                    <FaSignInAlt className="text-blue-400" />
                    <div>
                      <div className="text-white text-sm font-medium">Iniciar Sesión</div>
                      <div className="text-gray-400 text-xs">Acceso general</div>
                    </div>
                  </Link>

                  {/* CEO Login */}
                  <Link
                    href="/ceo/login"
                    className="flex items-center gap-3 px-4 py-3 hover:bg-slate-700 transition-colors border-b border-slate-700"
                  >
                    <div className="w-2 h-2 rounded-full bg-purple-500"></div>
                    <div>
                      <div className="text-white text-sm font-medium">CEO Dashboard</div>
                      <div className="text-gray-400 text-xs">Panel ejecutivo</div>
                    </div>
                  </Link>

                    {/* Mentor Login */}
                    <Link
                      href="/mentor/login"
                      className="flex items-center gap-3 px-4 py-3 hover:bg-slate-700 transition-colors border-b border-slate-700"
                    >
                      <div className="w-2 h-2 rounded-full bg-green-500"></div>
                      <div>
                        <div className="text-white text-sm font-medium">Login Mentor</div>
                        <div className="text-gray-400 text-xs">Acceso mentor</div>
                      </div>
                    </Link>

                  {/* Mentor Access */}
                  <Link
                    href="/mentor/register"
                    className="flex items-center gap-3 px-4 py-3 hover:bg-slate-700 transition-colors border-b border-slate-700"
                  >
                    <div className="w-2 h-2 rounded-full bg-green-500"></div>
                    <div>
                      <div className="text-white text-sm font-medium">Soy Mentor</div>
                      <div className="text-gray-400 text-xs">Registrarme</div>
                    </div>
                  </Link>

                  {/* User Dashboard */}
                  <Link
                    href="/dashboard"
                    className="flex items-center gap-3 px-4 py-3 hover:bg-slate-700 transition-colors"
                  >
                    <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                    <div>
                      <div className="text-white text-sm font-medium">Mi Dashboard</div>
                      <div className="text-gray-400 text-xs">Panel personal</div>
                    </div>
                  </Link>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </nav>
  )
}

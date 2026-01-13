'use client'

import { FaGithub, FaLinkedin, FaTwitter, FaEnvelope } from 'react-icons/fa'

export default function Footer() {
  return (
    <footer className="bg-slate-950 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-2">
            <h3 className="text-2xl font-bold text-white mb-4">
              Skills<span className="text-blue-400">ForIT</span>
            </h3>
            <p className="text-gray-400 mb-4 max-w-md">
              La plataforma de optimización de CVs para profesionales IT. 
              Potenciado por IA para ayudarte a destacar en el mercado tech.
            </p>
            <div className="flex gap-4">
              <a href="#" className="text-gray-400 hover:text-blue-400 transition-colors">
                <FaLinkedin className="text-2xl" />
              </a>
              <a href="#" className="text-gray-400 hover:text-blue-400 transition-colors">
                <FaTwitter className="text-2xl" />
              </a>
              <a href="#" className="text-gray-400 hover:text-blue-400 transition-colors">
                <FaGithub className="text-2xl" />
              </a>
              <a href="mailto:contact@skillsforit.com" className="text-gray-400 hover:text-blue-400 transition-colors">
                <FaEnvelope className="text-2xl" />
              </a>
            </div>
          </div>

          {/* Links */}
          <div>
            <h4 className="text-white font-semibold mb-4">Producto</h4>
            <ul className="space-y-2">
              <li>
                <a href="#comparison" className="text-gray-400 hover:text-white transition-colors">
                  Cómo funciona
                </a>
              </li>
              <li>
                <a href="#pricing" className="text-gray-400 hover:text-white transition-colors">
                  Precios
                </a>
              </li>
              <li>
                <a href="/mentors" className="text-gray-400 hover:text-white transition-colors">
                  Mentorías
                </a>
              </li>
              <li>
                <a href="/soft-skills-guide" className="text-gray-400 hover:text-white transition-colors">
                  Guía Soft Skills
                </a>
              </li>
            </ul>
          </div>

          {/* Legal & Account */}
          <div>
            <h4 className="text-white font-semibold mb-4">Cuenta</h4>
            <ul className="space-y-2">
              <li>
                <a href="/auth/signin" className="text-gray-400 hover:text-blue-400 transition-colors">
                  Iniciar Sesión
                </a>
              </li>
              <li>
                <a href="/dashboard" className="text-gray-400 hover:text-white transition-colors">
                  Mi Dashboard
                </a>
              </li>
              <li>
                <a href="/privacy" className="text-gray-400 hover:text-white transition-colors">
                  Privacidad
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  Soporte
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 pt-8 border-t border-slate-800 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-gray-400 text-sm">
            © 2026 SkillsForIT. Todos los derechos reservados.
          </p>
          <p className="text-gray-400 text-sm">
            Hecho con 💙 para la comunidad IT
          </p>
        </div>
      </div>
    </footer>
  )
}

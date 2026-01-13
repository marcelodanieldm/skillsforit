'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  FaUsers, 
  FaPlus, 
  FaEdit, 
  FaTrash, 
  FaSearch,
  FaTimes,
  FaUserShield,
  FaUserTie,
  FaUser
} from 'react-icons/fa'

interface User {
  id: string
  email: string
  name: string
  role: 'ceo' | 'mentor' | 'user' | 'admin'
  createdAt: string
  lastLogin?: string
}

interface UserManagementProps {
  token: string
}

export default function UserManagement({ token }: UserManagementProps) {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create')
  const [selectedUser, setSelectedUser] = useState<User | null>(null)

  // Form state
  const [formData, setFormData] = useState({
    email: '',
    name: '',
    role: 'user' as User['role'],
    password: ''
  })

  useEffect(() => {
    loadUsers()
  }, [])

  const loadUsers = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/users/manage', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Error al cargar usuarios')
      }

      setUsers(data.users)
      setError(null)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = async () => {
    try {
      const response = await fetch('/api/users/manage', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Error al crear usuario')
      }

      setShowModal(false)
      resetForm()
      loadUsers()
    } catch (err: any) {
      alert(err.message)
    }
  }

  const handleUpdate = async () => {
    try {
      const response = await fetch('/api/users/manage', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: selectedUser?.email,
          ...formData
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Error al actualizar usuario')
      }

      setShowModal(false)
      resetForm()
      loadUsers()
    } catch (err: any) {
      alert(err.message)
    }
  }

  const handleDelete = async (email: string) => {
    if (!confirm(`¿Estás seguro de eliminar el usuario ${email}?`)) {
      return
    }

    try {
      const response = await fetch(`/api/users/manage?email=${encodeURIComponent(email)}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Error al eliminar usuario')
      }

      loadUsers()
    } catch (err: any) {
      alert(err.message)
    }
  }

  const openCreateModal = () => {
    setModalMode('create')
    resetForm()
    setShowModal(true)
  }

  const openEditModal = (user: User) => {
    setModalMode('edit')
    setSelectedUser(user)
    setFormData({
      email: user.email,
      name: user.name,
      role: user.role,
      password: ''
    })
    setShowModal(true)
  }

  const resetForm = () => {
    setFormData({
      email: '',
      name: '',
      role: 'user',
      password: ''
    })
    setSelectedUser(null)
  }

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'ceo':
        return <FaUserShield className="text-purple-500" />
      case 'mentor':
        return <FaUserTie className="text-blue-500" />
      case 'admin':
        return <FaUserShield className="text-red-500" />
      default:
        return <FaUser className="text-gray-500" />
    }
  }

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'ceo':
        return 'bg-purple-900/30 text-purple-300 border-purple-600'
      case 'mentor':
        return 'bg-blue-900/30 text-blue-300 border-blue-600'
      case 'admin':
        return 'bg-red-900/30 text-red-300 border-red-600'
      default:
        return 'bg-gray-700 text-gray-300 border-gray-600'
    }
  }

  const filteredUsers = users.filter(user =>
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.role.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-300">Cargando usuarios...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <FaUsers className="text-3xl text-indigo-400" />
          <div>
            <h2 className="text-2xl font-bold text-white">Gestión de Usuarios</h2>
            <p className="text-gray-400 text-sm">{users.length} usuarios registrados</p>
          </div>
        </div>
        <button
          onClick={openCreateModal}
          className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-6 py-3 rounded-lg font-semibold flex items-center gap-2 hover:from-purple-700 hover:to-indigo-700 transition-all"
        >
          <FaPlus /> Nuevo Usuario
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Buscar por email, nombre o rol..."
          className="w-full bg-slate-700 text-white border-2 border-slate-600 rounded-lg py-3 pl-12 pr-4 focus:outline-none focus:border-indigo-500 transition-all"
        />
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-900/30 border-l-4 border-red-500 rounded-r-lg p-4">
          <p className="text-red-200">{error}</p>
        </div>
      )}

      {/* Users Table */}
      <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-700">
              <tr>
                <th className="text-left px-6 py-4 text-gray-300 font-semibold">Usuario</th>
                <th className="text-left px-6 py-4 text-gray-300 font-semibold">Email</th>
                <th className="text-left px-6 py-4 text-gray-300 font-semibold">Rol</th>
                <th className="text-left px-6 py-4 text-gray-300 font-semibold">Último Login</th>
                <th className="text-right px-6 py-4 text-gray-300 font-semibold">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700">
              {filteredUsers.map((user) => (
                <motion.tr
                  key={user.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="hover:bg-slate-700/50 transition-colors"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      {getRoleIcon(user.role)}
                      <span className="text-white font-medium">{user.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-300">{user.email}</td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getRoleBadgeColor(user.role)}`}>
                      {user.role.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-400 text-sm">
                    {user.lastLogin 
                      ? new Date(user.lastLogin).toLocaleDateString('es-ES', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric'
                        })
                      : 'Nunca'}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => openEditModal(user)}
                        className="p-2 text-blue-400 hover:text-blue-300 hover:bg-blue-900/30 rounded-lg transition-all"
                        title="Editar"
                      >
                        <FaEdit />
                      </button>
                      <button
                        onClick={() => handleDelete(user.email)}
                        className="p-2 text-red-400 hover:text-red-300 hover:bg-red-900/30 rounded-lg transition-all"
                        title="Eliminar"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredUsers.length === 0 && (
          <div className="text-center py-12 text-gray-400">
            No se encontraron usuarios
          </div>
        )}
      </div>

      {/* Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-slate-800 rounded-2xl border border-slate-700 p-8 w-full max-w-md"
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-white">
                  {modalMode === 'create' ? 'Nuevo Usuario' : 'Editar Usuario'}
                </h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <FaTimes size={24} />
                </button>
              </div>

              {/* Form */}
              <div className="space-y-4">
                <div>
                  <label className="block text-gray-300 mb-2 font-medium">Email</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    disabled={modalMode === 'edit'}
                    className="w-full bg-slate-700 text-white border-2 border-slate-600 rounded-lg py-3 px-4 focus:outline-none focus:border-indigo-500 transition-all disabled:opacity-50"
                    placeholder="usuario@ejemplo.com"
                  />
                </div>

                <div>
                  <label className="block text-gray-300 mb-2 font-medium">Nombre</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-slate-700 text-white border-2 border-slate-600 rounded-lg py-3 px-4 focus:outline-none focus:border-indigo-500 transition-all"
                    placeholder="Nombre completo"
                  />
                </div>

                <div>
                  <label className="block text-gray-300 mb-2 font-medium">Rol</label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value as User['role'] })}
                    className="w-full bg-slate-700 text-white border-2 border-slate-600 rounded-lg py-3 px-4 focus:outline-none focus:border-indigo-500 transition-all"
                  >
                    <option value="user">Usuario IT</option>
                    <option value="mentor">Mentor</option>
                    <option value="ceo">CEO</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>

                <div>
                  <label className="block text-gray-300 mb-2 font-medium">
                    Contraseña {modalMode === 'edit' && '(dejar vacío para no cambiar)'}
                  </label>
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full bg-slate-700 text-white border-2 border-slate-600 rounded-lg py-3 px-4 focus:outline-none focus:border-indigo-500 transition-all"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 mt-6">
                <button
                  onClick={modalMode === 'create' ? handleCreate : handleUpdate}
                  className="flex-1 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold py-3 rounded-lg hover:from-purple-700 hover:to-indigo-700 transition-all"
                >
                  {modalMode === 'create' ? 'Crear Usuario' : 'Guardar Cambios'}
                </button>
                <button
                  onClick={() => setShowModal(false)}
                  className="flex-1 bg-slate-700 text-gray-300 font-semibold py-3 rounded-lg hover:bg-slate-600 transition-all"
                >
                  Cancelar
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

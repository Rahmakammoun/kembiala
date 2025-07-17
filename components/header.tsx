// components/header.tsx
'use client'

import { useSession, signOut } from 'next-auth/react'
import { useState, useRef, useEffect } from 'react'
import { FaUserCircle, FaChevronDown, FaUserEdit, FaSignOutAlt } from 'react-icons/fa'

export default function Header() {
  const { data: session } = useSession()
  const [menuOpen, setMenuOpen] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)

  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const menuRef = useRef<HTMLDivElement>(null)
  const modalRef = useRef<HTMLDivElement>(null)

  // Fermer le menu si clic à l'extérieur
 useEffect(() => {
  function handleClickOutside(event: MouseEvent) {
    const target = event.target as Node

    // Si modal ouvert et clic en dehors du modal => fermer modal + menu
    if (modalOpen) {
      if (modalRef.current && !modalRef.current.contains(target)) {
        setModalOpen(false)
        setMenuOpen(false)
        return
      }
    }

    // Sinon si menu ouvert et clic en dehors du menu => fermer menu
    if (menuOpen) {
      if (menuRef.current && !menuRef.current.contains(target)) {
        setMenuOpen(false)
      }
    }
  }

  document.addEventListener('mousedown', handleClickOutside)
  return () => {
    document.removeEventListener('mousedown', handleClickOutside)
  }
}, [menuOpen, modalOpen])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (!currentPassword || !newPassword || !confirmPassword) {
      setError('Tous les champs sont obligatoires.')
      return
    }
    if (newPassword !== confirmPassword) {
      setError('Le nouveau mot de passe et la confirmation ne correspondent pas.')
      return
    }
    if (newPassword.length < 8) {
      setError('Le nouveau mot de passe doit contenir au moins 8 caractères.')
      return
    }

    // Ici tu peux appeler une API pour changer le mot de passe
    // Exemple fictif :
    fetch('/api/users/change-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ currentPassword, newPassword }),
    })
      .then(async (res) => {
        if (res.ok) {
          setSuccess('Mot de passe modifié avec succès !')
          setCurrentPassword('')
          setNewPassword('')
          setConfirmPassword('')
          setModalOpen(false)
        } else {
          const data = await res.json()
          setError(data.error || 'Erreur lors de la modification du mot de passe.')
        }
      })
      .catch(() => {
        setError('Erreur réseau.')
      })
  }

  return (
    <header className="fixed top-0 left-64 right-0 bg-gray-100 shadow p-4 flex items-center z-50 h-16">
      {/* Titre ou logo à gauche (optionnel) */}

      {session?.user && (
        <div ref={menuRef} className="ms-auto mr-6 relative">
          <div
            onClick={() => setMenuOpen(!menuOpen)}
            className="flex items-center space-x-2 cursor-pointer select-none"
            >
            <FaUserCircle size={32} className="text-gray-700" />
            <span className="text-gray-800 font-medium">
                {session.user.email?.split('@')[0]}
            </span>
            <FaChevronDown size={14} className="text-gray-600" />
            </div>

          {menuOpen && (
            
            <div className="absolute right-0 mt-2 w-48 bg-white border rounded shadow-lg z-50">
              <button
                onClick={() => {
                  setModalOpen(true)
                  setMenuOpen(false)
                }}
                className="flex items-center space-x-2 w-full text-left px-4 py-2 hover:bg-gray-100"
              >
                <FaUserEdit className="text-gray-600" />
                <span>Modifier profil</span>
              </button>

              <button
                onClick={() => {
                  signOut({ callbackUrl: '/auth/login' })
                  setMenuOpen(false)
                }}
                className="flex items-center space-x-2 w-full text-left px-4 py-2 hover:bg-gray-100"
              >
                <FaSignOutAlt className="text-gray-600" />
                <span>Se déconnecter</span>
              </button>
            </div>
          )}

          {modalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm bg-black/40">
              <div
                ref={modalRef}
                className="bg-white rounded-lg shadow-lg p-6 w-96 relative"
              >
                <h2 className="text-xl font-bold mb-4">Modifier le mot de passe</h2>

                {error && <p className="mb-2 text-red-600">{error}</p>}
                {success && <p className="mb-2 text-green-600">{success}</p>}

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label htmlFor="currentPassword" className="block mb-1 font-medium">
                      Mot de passe actuel
                    </label>
                    <input
                      id="currentPassword"
                      type="password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      className="w-full px-3 py-2 border rounded"
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="newPassword" className="block mb-1 font-medium">
                      Nouveau mot de passe
                    </label>
                    <input
                      id="newPassword"
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full px-3 py-2 border rounded"
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="confirmPassword" className="block mb-1 font-medium">
                      Confirmer le nouveau mot de passe
                    </label>
                    <input
                      id="confirmPassword"
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full px-3 py-2 border rounded"
                      required
                    />
                  </div>

                  <div className="flex justify-end space-x-4 mt-6">
                    <button
                      type="button"
                      onClick={() => setModalOpen(false)}
                      className="px-4 py-2 rounded bg-gray-300 hover:bg-gray-400"
                    >
                      Annuler
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
                    >
                      Valider
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}
    </header>
  )
}

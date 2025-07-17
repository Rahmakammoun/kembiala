//pages/dashboard.tsx

import Sidebar from '../components/sidebar'
import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { FaEdit, FaTrashAlt, FaPlus } from 'react-icons/fa'
import { getSession } from 'next-auth/react'
import Header from '../components/header'
import { GetServerSideProps } from "next"
type User = {
  id: number
  email: string
  role: string
}
export const getServerSideProps: GetServerSideProps = async (context) => {
  const session = await getSession(context)
  if (!session) {
    return {
      redirect: {
        destination: '/auth/login',
        permanent: false,
      },
    }
  }
  return {
    props: { session },
  }
}
export default function Dashboard() {
    const [sidebarOpen, setSidebarOpen] = useState(false)

  const { data: session, status } = useSession()
  const router = useRouter()
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)

  const [searchTerm, setSearchTerm] = useState('')

  const [showModal, setShowModal] = useState(false)
 const [newUserEmail, setNewUserEmail] = useState('')

 const [popup, setPopup] = useState<{
  type: 'success' | 'error'
  title: string
  message: string
} | null>(null)

useEffect(() => {
  if (popup) {
    const timer = setTimeout(() => setPopup(null), 2000)
    return () => clearTimeout(timer)
  }
}, [popup])

const [userToDelete, setUserToDelete] = useState<User | null>(null)

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/auth/login')
    if (status === 'authenticated') fetchUsers()
  }, [status])

  const fetchUsers = async () => {
    const res = await fetch('/api/users/list')
    const data = await res.json()
    setUsers(data.users)
    setLoading(false)
  }

 const requestDelete = (user: User) => {
  setUserToDelete(user)
}

const confirmDelete = async () => {
  if (!userToDelete) return

  const res = await fetch('/api/users/delete', {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ id: userToDelete.id }),
  })

  if (res.ok) {
    setUsers(users.filter((u) => u.id !== userToDelete.id))
    setPopup({
      type: 'success',
      title: 'Succès!',
      message: 'Utilisateur supprimé avec succès.',
    })
  } else {
    const err = await res.json()
    setPopup({
      type: 'error',
      title: 'Erreur!',
      message: err.error || 'Échec de la suppression.',
    })
  }

  setUserToDelete(null)
}


const handleCreateUser = async (e: React.FormEvent) => {
  e.preventDefault()

  const res = await fetch('/api/users/create', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ email: newUserEmail }),
  })

  const result = await res.json()

  if (res.ok) {
    setShowModal(false)
    setNewUserEmail('')
    fetchUsers()
    setPopup({
      type: 'success',
      title: 'Succès!',
      message: 'Utilisateur ajouté avec succès.',
    })
  } else {
    setPopup({
      type: 'error',
      title: 'Erreur!',
      message: result.error || 'Ajout échoué.',
    })
  }
}



  return (
     <div className="flex min-h-screen bg-blue-50 text-gray-900">
    
          <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
    
          <main className={`flex-1 flex flex-col overflow-auto mt-12 p-2 transition-all duration-300
              ${sidebarOpen ? 'ml-64' : 'ml-0'} md:ml-64`}>
            <div className="shadow bg-white">
              <Header />
        </div>
        <div className="flex-1 p-6 overflow-auto">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Informations des utilisateurs</h1>
          {session?.user?.role === 'admin' && (
          <button
            onClick={() => setShowModal(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded"
          >
            <FaPlus />
          </button>
          
        )}
        </div>
        <input
          type="text"
          placeholder="🔍 Rechercher utilisateur..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="border p-2 rounded w-80 mb-4"
        />
        <table className="min-w-full border border-gray-300">
          <thead>
            <tr className="bg-gray-100">
              <th className="border px-4 py-2 text-left">Email</th>
              <th className="border px-4 py-2 text-left">Rôle</th>
              {session?.user?.role === 'admin' && (
                <th className="border px-4 py-2 text-left">Actions</th>
              )}
            </tr>
          </thead>
          <tbody>
            {users
              .filter((user) => {
                const query = searchTerm.toLowerCase()
                return (
                  user.email.toLowerCase().includes(query) ||
                  user.role.toLowerCase().includes(query)
                )
              })
              .map((user) => (
              <tr key={user.id} className="hover:bg-gray-50">
                <td className="border px-4 py-2">{user.email}</td>
                <td className="border px-4 py-2">{user.role}</td>
                {session?.user?.role === 'admin' && (
                    <td className="border px-4 py-2">
                      <div className="flex items-center space-x-4">
                        <button
                          aria-label="Supprimer"
                          className="text-red-900 hover:text-red-800"
                          onClick={() => requestDelete(user)}
                        >
                          <FaTrashAlt size={20} />
                        </button>
                      </div>
                    </td>
                  )}
              </tr>
            ))}
          </tbody>
        </table>

        {/* Modal Form */}
        {showModal && (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm bg-black/40"
            onClick={() => setShowModal(false)} // ← ferme si on clique dehors
          >
            <div
              className="bg-white rounded-lg p-6 w-full max-w-md"
              onClick={(e) => e.stopPropagation()} // ← bloque propagation si on clique dans le formulaire
            >
              <h2 className="text-xl font-bold mb-4">Ajouter un utilisateur</h2>
              <form onSubmit={handleCreateUser} className="space-y-4">
                <input
                  type="email"
                  placeholder="Email"
                  className="w-full border p-2 rounded"
                  value={newUserEmail}
                  onChange={(e) => setNewUserEmail(e.target.value)}
                  required
                />
                


                <div className="flex justify-end space-x-2">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                  >
                    Ajouter
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
        {userToDelete && (
  <div
    className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm bg-black/40"
    onClick={() => setUserToDelete(null)}
  >
    <div
      className="bg-white rounded-lg p-6 w-full max-w-sm"
      onClick={(e) => e.stopPropagation()}
    >
      <h2 className="text-lg font-bold mb-4 text-red-600">Confirmer la suppression</h2>
      <p className="mb-4">
        Supprimer l'utilisateur&nbsp;
        <span className="font-semibold">{userToDelete.email}</span>&nbsp;?
      </p>
      <div className="flex justify-end space-x-2">
        <button
          onClick={() => setUserToDelete(null)}
          className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
        >
          Annuler
        </button>
        <button
          onClick={confirmDelete}
          className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
        >
          Supprimer
        </button>
      </div>
    </div>
  </div>
)}
{popup && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
    <div className="bg-white rounded-xl p-6 w-80 text-center shadow-xl">
      <div className="text-6xl mb-4">
        {popup.type === 'success' ? (
          <span className="text-green-500">✔️</span>
        ) : (
          <span className="text-red-500">❌</span>
        )}
      </div>
      <h2 className={`text-xl font-bold mb-2 ${popup.type === 'success' ? 'text-green-600' : 'text-red-600'}`}>
        {popup.title}
      </h2>
      <p className="mb-4 text-gray-700">{popup.message}</p>
      <button
        onClick={() => setPopup(null)}
        className={`px-4 py-2 rounded text-white ${
          popup.type === 'success' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'
        }`}
      >
        Ok
      </button>
    </div>
  </div>
)}

          </div>
        </div>
      </main>
      
    </div>
  )
}

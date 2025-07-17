// pages/client.tsx

import Sidebar from '../components/sidebar'
import Header from '../components/header'
import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { getSession } from 'next-auth/react'
import { GetServerSideProps } from 'next'
import { FaEdit, FaTrashAlt, FaPlus } from 'react-icons/fa'

type Customer = {
  id: number
  nom: string
  prenom: string
  email: string
  createdAt: string
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

export default function CustomerDashboard() {
    const [sidebarOpen, setSidebarOpen] = useState(false)

  const { data: session, status } = useSession()
  const router = useRouter()

  const [searchTerm, setSearchTerm] = useState('')
  const [customers, setCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(true)
const [customerToDelete, setCustomerToDelete] = useState<Customer | null>(null)

const [popup, setPopup] = useState<{
  type: 'success' | 'error'
  title: string
  message: string
} | null>(null)
useEffect(() => {
  if (popup) {
    const timer = setTimeout(() => {
      setPopup(null)
    }, 2000) // 2000 ms = 2 secondes

    return () => clearTimeout(timer) // Clear si le popup change avant les 2s
  }
}, [popup])


  const [showModal, setShowModal] = useState(false)
    const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null)
const [form, setForm] = useState({ nom: '', prenom: '', email: '' })
  const [editForm, setEditForm] = useState({ nom: '', prenom: '', email: '' })
  useEffect(() => {
    if (status === 'unauthenticated') router.push('/auth/login')
    if (status === 'authenticated') fetchCustomers()
  }, [status])

  const fetchCustomers = async () => {
    const res = await fetch('/api/clients/list')
    const data = await res.json()
    setCustomers(data.customers)
    setLoading(false)
  }

  const requestDelete = (customer: Customer) => {
  setCustomerToDelete(customer)
}
const confirmDelete = async () => {
  if (!customerToDelete) return

  const res = await fetch('/api/clients/delete', {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id: customerToDelete.id }),
  })

  if (res.ok) {
  setCustomers(customers.filter((c) => c.id !== customerToDelete.id))
  setCustomerToDelete(null)
  setPopup({
    type: 'success',
    title: 'Succès!',
    message: 'Le client a été supprimé avec succès.',
  })
} else {
  const err = await res.json()
  setPopup({
    type: 'error',
    title: 'Erreur!',
    message: err.error || 'Une erreur est survenue.',
  })
}

}


const handleCreate = async (e: React.FormEvent) => {
  e.preventDefault()

  const res = await fetch('/api/clients/create', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(form),
  })

  let result
  try {
    result = await res.json()
  } catch (err) {
    setPopup({
      type: 'error',
      title: 'Erreur!',
      message: 'Réponse non valide du serveur.',
    })
    return
  }

  if (res.ok) {
    setShowModal(false)
    setForm({ nom: '', prenom: '', email: '' })
    fetchCustomers()
    setPopup({
      type: 'success',
      title: 'Succès!',
      message: 'Le client a été ajouté avec succès.',
    })
  } else {
    setPopup({
      type: 'error',
      title: 'Erreur!',
      message: result.error || 'L\'ajout a échoué.',
    })
  }
}

const openEditModal = (customer: Customer) => {
    setEditingCustomer(customer)
    setEditForm({
      nom: customer.nom,
      prenom: customer.prenom,
      email: customer.email,
    })
  }

const handleUpdate = async (e: React.FormEvent) => {
  e.preventDefault()
  if (!editingCustomer) return

  const res = await fetch('/api/clients/update', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      id: editingCustomer.id,
      ...editForm,
    }),
  })

  let result
  try {
    result = await res.json()
  } catch (err) {
    setPopup({
      type: 'error',
      title: 'Erreur!',
      message: 'Réponse invalide du serveur.',
    })
    return
  }

  if (res.ok) {
    setEditingCustomer(null)
    fetchCustomers()
    setPopup({
      type: 'success',
      title: 'Succès!',
      message: 'Le client a été modifié avec succès.',
    })
  } else {
    setPopup({
      type: 'error',
      title: 'Erreur!',
      message: result.error || 'La mise à jour a échoué.',
    })
  }
}


  return (
      <div className="flex min-h-screen bg-blue-50 text-gray-900">

      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />

      <main
        className={`flex-1 flex flex-col overflow-auto mt-12 p-2 transition-all duration-300
          ${sidebarOpen ? 'ml-64' : 'ml-0'} md:ml-64`}
      >
        <div className="shadow bg-white">
          <Header />
        </div>
        <div className="flex-1 p-6 overflow-auto">
          <div className="bg-white rounded-lg shadow-md p-6 overflow-auto">
            <div className="mb-6">
            <div className="relative mb-6">
  <div className="flex items-center justify-between mb-4">
  <h1 className="text-2xl font-bold">Liste des clients</h1>
  
  <button
    onClick={() => setShowModal(true)}
    className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded ml-4"
  >
    <FaPlus />
  </button>
 
</div>
 <input
    type="text"
    placeholder="🔍 Rechercher un client..."
    value={searchTerm}
    onChange={(e) => setSearchTerm(e.target.value)}
    className="border p-2 rounded w-60 mb-4"
  />
</div>

          </div>

            <table className="min-w-full border border-gray-300">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border px-4 py-2 text-left">Nom</th>
                  <th className="border px-4 py-2 text-left">Prénom</th>
                  <th className="border px-4 py-2 text-left">Email</th>
                  <th className="border px-4 py-2 text-left">Date de création</th>
                  <th className="border px-4 py-2 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
            {customers
  .filter((customer) => {
    const query = searchTerm.toLowerCase()
    const date = new Date(customer.createdAt).toLocaleDateString('fr-FR')
    return (
      customer.nom.toLowerCase().includes(query) ||
      customer.prenom.toLowerCase().includes(query) ||
      customer.email.toLowerCase().includes(query) ||
      date.includes(query)
    )
  })
  .map((customer) => (
                  <tr key={customer.id} className="hover:bg-gray-50">
                    <td className="border px-4 py-2">{customer.nom}</td>
                    <td className="border px-4 py-2">{customer.prenom}</td>
                    <td className="border px-4 py-2">{customer.email}</td>
                    <td className="border px-4 py-2">
                      {new Date(customer.createdAt).toLocaleDateString()}
                    </td>
                    <td className="border px-4 py-2">
                      <div className="flex items-center space-x-4">
                        <button className="text-blue-600 hover:text-blue-800" onClick={() => openEditModal(customer)}>
                          <FaEdit />
                        </button>
                        <button
                          className="text-red-600 hover:text-red-800"
                          onClick={() => requestDelete(customer)}
                        >
                          <FaTrashAlt />
                        </button>

                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {showModal && (
              <div
                className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm bg-black/40"
                onClick={() => setShowModal(false)}
              >
                <div
                  className="bg-white rounded-lg p-6 w-full max-w-md"
                  onClick={(e) => e.stopPropagation()}
                >
                  <h2 className="text-xl font-bold mb-4">Ajouter un client</h2>
                  <form onSubmit={handleCreate} className="space-y-4">
                    <input
                      type="text"
                      placeholder="Nom"
                      className="w-full border p-2 rounded"
                      value={form.nom}
                      onChange={(e) => setForm({ ...form, nom: e.target.value })}
                      required
                    />
                    <input
                      type="text"
                      placeholder="Prénom"
                      className="w-full border p-2 rounded"
                      value={form.prenom}
                      onChange={(e) => setForm({ ...form, prenom: e.target.value })}
                      required
                    />
                    <input
                      type="email"
                      placeholder="Email"
                      className="w-full border p-2 rounded"
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
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
{/* Modal - Modifier */}
            {editingCustomer && (
              <div
                className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm bg-black/40"
                onClick={() => setEditingCustomer(null)}
              >
                <div
                  className="bg-white rounded-lg p-6 w-full max-w-md"
                  onClick={(e) => e.stopPropagation()}
                >
                  <h2 className="text-xl font-bold mb-4">Modifier le client</h2>
                  <form onSubmit={handleUpdate} className="space-y-4">
                    <input
                      type="text"
                      className="w-full border p-2 rounded"
                      value={editForm.nom}
                      onChange={(e) => setEditForm({ ...editForm, nom: e.target.value })}
                      required
                    />
                    <input
                      type="text"
                      className="w-full border p-2 rounded"
                      value={editForm.prenom}
                      onChange={(e) => setEditForm({ ...editForm, prenom: e.target.value })}
                      required
                    />
                    <input
                      type="email"
                      className="w-full border p-2 rounded"
                      value={editForm.email}
                      onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                      required
                    />
                    <div className="flex justify-end space-x-2">
                      <button
                        type="button"
                        onClick={() => setEditingCustomer(null)}
                        className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
                      >
                        Annuler
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                      >
                        Modifier
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
            {customerToDelete && (
  <div
    className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm bg-black/40"
    onClick={() => setCustomerToDelete(null)}
  >
    <div
      className="bg-white rounded-lg p-6 w-full max-w-sm"
      onClick={(e) => e.stopPropagation()}
    >
      <h2 className="text-lg font-bold mb-4 text-red-600">Confirmer la suppression</h2>
      <p className="mb-4">
        Êtes-vous sûr de vouloir supprimer{' '}
        <span className="font-semibold">
          {customerToDelete.nom} {customerToDelete.prenom}
        </span>
        ?
      </p>
      <div className="flex justify-end space-x-2">
        <button
          onClick={() => setCustomerToDelete(null)}
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
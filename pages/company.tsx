import Sidebar from '../components/sidebar'
import Header from '../components/header'
import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { getSession } from 'next-auth/react'
import { GetServerSideProps } from 'next'
import { FaEdit, FaTrashAlt, FaPlus } from 'react-icons/fa'

type Company = {
  id: number
  name: string
  address: string
  lieu: string
  aval: string
}

type Bank = {
  id: number
  bankName: string
  rib: string
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

  return { props: { session } }
}

export default function CompanyInfoPage() {
   const [sidebarOpen, setSidebarOpen] = useState(false)
  const { data: session, status } = useSession()
  const router = useRouter()

  const [company, setCompany] = useState<Company | null>(null)
  const [banks, setBanks] = useState<Bank[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [form, setForm] = useState<{ id?: number, name: string, address: string, lieu: string, aval: string }>({
  name: '',
  address: '',
  lieu: '',
  aval: '',
  })
  const [bankToDelete, setBankToDelete] = useState<Bank | null>(null)
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

  const [showAddBankForm, setShowAddBankForm] = useState(false)
  const [newBank, setNewBank] = useState({ bankName: '', rib: '' })
  const [editBankId, setEditBankId] = useState<number | null>(null)


  useEffect(() => {
    if (status === 'unauthenticated') router.push('/auth/login')
    if (status === 'authenticated') {
      fetchCompany()
      fetchBanks()
    }
  }, [status])

const fetchCompany = async () => {
  const res = await fetch('/api/company/get')
  const data = await res.json()
  console.log('Company récupérée:', data)

  if (data) {
    const companyData = data.company ? data.company : data  // ajuste selon backend
    setCompany(companyData)
    setForm({
      id: companyData.id,
      name: companyData.name || '',
      address: companyData.address || '',
      lieu: companyData.lieu || '',
      aval: companyData.aval || '',
    })
  } else {
    setCompany(null)
    setForm({ name: '', address: '', lieu: '', aval: '' })
  }
}



const fetchBanks = async () => {
  const res = await fetch('/api/bank/list')
  const data = await res.json()

  // Vérifie si c’est un tableau ou un objet
  if (Array.isArray(data)) {
    setBanks(data)
  } else if (Array.isArray(data.banks)) {
    setBanks(data.banks)
  } else {
    console.error('Mauvais format de réponse:', data)
    setBanks([])
  }
}

const confirmDeleteBank = async () => {
  if (!bankToDelete) return

  try {
    const res = await fetch('/api/bank/delete', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: bankToDelete.id })
    })

    if (!res.ok) {
      const errorData = await res.json()
      setPopup({
        type: 'error',
        title: 'Erreur !',
        message: errorData.error || 'Suppression échouée.'
      })
      return
    }

    fetchBanks() // mise à jour de la liste
    setBankToDelete(null)
    setPopup({
      type: 'success',
      title: 'Succès !',
      message: 'Banque supprimée avec succès.'
    })
  } catch (error) {
    setPopup({
      type: 'error',
      title: 'Erreur réseau',
      message: "La suppression a échoué à cause d'une erreur réseau."
    })
  }
}


const handleSaveCompany = async () => {
  // Validation simple côté client
  if (!form.name || !form.address || !form.lieu || !form.aval) {
    alert('Merci de remplir tous les champs avant de sauvegarder.')
    return
  }

  const isUpdate = company && company.id && company.id > 0
  const method = isUpdate ? 'PUT' : 'POST'
  const url = isUpdate ? '/api/company/update' : '/api/company/create'

  const body = isUpdate ? { ...form, id: company.id } : form

  console.log('Données envoyées:', body)

  const res = await fetch(url, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })

 if (res.ok) {
  fetchCompany()
  setPopup({
    type: 'success',
    title: 'Succès !',
    message: isUpdate ? 'Société mise à jour avec succès.' : 'Société créée avec succès.'
  })
} else {
  const errorData = await res.json()
  setPopup({
    type: 'error',
    title: 'Erreur !',
    message: errorData.error || 'Échec de la sauvegarde.'
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
            <h1 className="text-2xl font-bold mb-4">Personal Information</h1>

            <h2 className="text-lg font-semibold mb-4">Company Information</h2>
<div className="space-y-3 mb-6">
  <div className="flex items-center mb-3">
    <label className="w-40 font-medium">Company Name:</label>
    <input
      value={form.name}
      onChange={(e) => setForm({ ...form, name: e.target.value })}
      className="flex-1 border p-2 rounded"
    />
  </div>
  <div className="flex items-center mb-3">
    <label className="w-40 font-medium">Address:</label>
    <input
      value={form.address}
      onChange={(e) => setForm({ ...form, address: e.target.value })}
      className="flex-1 border p-2 rounded"
    />
  </div>
  <div className="flex items-center mb-3">
    <label className="w-40 font-medium">Lieu:</label>
    <input
      value={form.lieu}
      onChange={(e) => setForm({ ...form, lieu: e.target.value })}
      className="flex-1 border p-2 rounded"
    />
  </div>
  <div className="flex items-center mb-3">
    <label className="w-40 font-medium">Aval:</label>
    <input
      value={form.aval}
      onChange={(e) => setForm({ ...form, aval: e.target.value })}
      className="flex-1 border p-2 rounded"
    />
  </div>
  <div className="flex justify-end">
    <button
      onClick={handleSaveCompany}
      className="bg-blue-600 text-white px-4 py-2 rounded mt-2"
    >
      Save Changes
    </button>
  </div>
</div>

            <h2 className="text-lg font-semibold mt-8 mb-2">Bank Information</h2>
            <div className="flex items-center justify-between mb-3">
              <div className="flex space-x-2">
                <button className="bg-blue-600 text-white px-3 py-2 rounded"
                onClick={() => setShowAddBankForm(prev => !prev)}>
                  <FaPlus className="inline mr-1" />
                  Add Bank
                </button>
                
              </div>
              <input
                type="text"
                placeholder="🔍 Rechercher une banque..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="border p-2 rounded"
              />
            </div>
              {showAddBankForm && (
                <div className="mt-4 mb-6 p-4 border rounded bg-gray-100">

                  <h3 className="font-semibold mb-2">Add New Bank</h3>
                  <input
                    type="text"
                    placeholder="Bank Name"
                    value={newBank.bankName}
                    onChange={(e) => setNewBank({ ...newBank, bankName: e.target.value })}
                    className="border p-2 rounded w-full mb-2"
                  />
                 <input
  type="number"
  placeholder="RIB"
  value={newBank.rib}
  onChange={(e) => {
    if (e.target.value.length <= 20) {
      setNewBank({ ...newBank, rib: e.target.value })
    }
  }}
  className="border p-2 rounded w-full mb-2"
/>
                  <div className="flex space-x-2">
                   <button
                      onClick={async () => {
                        if (!newBank.bankName || !newBank.rib) {
                          alert('Please fill in all bank fields.')
                          return
                        }
                        if (!company) {
                          alert('Company must exist before adding a bank.')
                          return
                        }
                        try {
                          const url = editBankId ? `/api/bank/update` : '/api/bank/create'
                          const method = editBankId ? 'PUT' : 'POST'

                          const res = await fetch(url, {
                            method,
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                              id: editBankId,
                              bankName: newBank.bankName,
                              rib: newBank.rib,
                              companyId: company.id,
                            }),
                          })

                          if (!res.ok) {
                            const errorData = await res.json()
                            setPopup({
                              type: 'error',
                              title: 'Erreur !',
                              message: errorData.error || 'Erreur lors de l’enregistrement de la banque.'
                            })
                            return
                          }

                          setNewBank({ bankName: '', rib: '' })
                          setEditBankId(null)
                          setShowAddBankForm(false)
                          await fetchBanks() // refresh list

                          setPopup({
                            type: 'success',
                            title: 'Succès !',
                            message: editBankId ? 'Banque mise à jour avec succès.' : 'Banque ajoutée avec succès.'
                          })

                        } catch (error) {
                          alert('Network error')
                        }
                      }}
                      className="bg-green-600 text-white px-3 py-1 rounded"
                    >
                      Save
                    </button>

                    <button
                      onClick={() => setShowAddBankForm(false)}
                      className="bg-gray-600 text-white px-3 py-1 rounded"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}

            <table className="min-w-full border border-gray-300">
              <thead className="bg-blue-600 text-white">
                <tr>
                  <th className="px-4 py-2 text-left">Bank Name</th>
                  <th className="px-4 py-2 text-left">RIB</th>
                  <th className="px-4 py-2 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {banks
                  .filter(
                    (bank) =>
                      bank.bankName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                      bank.rib.includes(searchTerm)
                  )
                  .map((bank) => (
                    <tr key={bank.id} className="hover:bg-gray-100">
                      <td className="border px-4 py-2">{bank.bankName}</td>
                      <td className="border px-4 py-2">{bank.rib}</td>
                      <td className="border px-4 py-2">
                        <button
                            onClick={() => {
                              setNewBank({ bankName: bank.bankName, rib: bank.rib }) // remplir le formulaire
                              setEditBankId(bank.id) // indiquer qu'on édite cette banque
                              setShowAddBankForm(true) // afficher le formulaire
                            }}
                            className="text-blue-600 hover:text-blue-800 mr-2">
                            <FaEdit />
                        </button>

                        <button
                          onClick={() => setBankToDelete(bank)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <FaTrashAlt />
                        </button>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
            
          </div>
        </div>
        {bankToDelete && (
  <div
    className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm bg-black/40"
    onClick={() => setBankToDelete(null)}
  >
    <div
      className="bg-white rounded-lg p-6 w-full max-w-sm"
      onClick={(e) => e.stopPropagation()}
    >
      <h2 className="text-lg font-bold mb-4 text-red-600">Confirmer la suppression</h2>
      <p className="mb-4">
        Êtes-vous sûr de vouloir supprimer{' '}
        <span className="font-semibold">{bankToDelete.bankName}</span> ?
      </p>
      <div className="flex justify-end space-x-2">
        <button
          onClick={() => setBankToDelete(null)}
          className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
        >
          Annuler
        </button>
        <button
          onClick={confirmDeleteBank}
          className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
        >
          Supprimer
        </button>
      </div>
    </div>
  </div>
)}
      </main>

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
  )
}

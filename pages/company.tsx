import { useEffect, useState } from 'react'
import { useSession, getSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { GetServerSideProps } from 'next'
import { FaEdit, FaTrashAlt, FaPlus } from 'react-icons/fa'
import Sidebar from '../components/sidebar'
import Header from '../components/header'



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
      redirect: { destination: '/auth/login', permanent: false },
    }
  }
  return { props: { session } }
}


export default function CompanyInfoPage() {
  const router = useRouter()
  const { data: session, status } = useSession()
  const [sidebarOpen, setSidebarOpen] = useState(false)


  const [company, setCompany] = useState<Company | null>(null)
  const [form, setForm] = useState({
    id: undefined as number | undefined,
    name: '',
    address: '',
    lieu: '',
    aval: '',
  })


  const [banks, setBanks] = useState<Bank[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [newBank, setNewBank] = useState({ bankName: '', rib: '' })
  const [showAddBankForm, setShowAddBankForm] = useState(false)
  const [editBankId, setEditBankId] = useState<number | null>(null)
  const [bankToDelete, setBankToDelete] = useState<Bank | null>(null)


  const [popup, setPopup] = useState<{
    type: 'success' | 'error'
    title: string
    message: string
  } | null>(null)

 

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/auth/login')
    if (status === 'authenticated') {
      fetchCompany()
      fetchBanks()
    }
  }, [status])

  useEffect(() => {
    if (popup) {
      const timer = setTimeout(() => setPopup(null), 2000)
      return () => clearTimeout(timer)
    }
  }, [popup])

  
  // Fonctions API
  
  const fetchCompany = async () => {
    const res = await fetch('/api/company/get')
    const data = await res.json()

    const companyData = data.company ?? data
    if (companyData) {
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
      setForm({ id: undefined, name: '', address: '', lieu: '', aval: '' })
    }
  }

  const fetchBanks = async () => {
    const res = await fetch('/api/bank/list')
    const data = await res.json()
    if (Array.isArray(data)) setBanks(data)
    else if (Array.isArray(data.banks)) setBanks(data.banks)
    else setBanks([])
  }

  
  
  const handleSaveCompany = async () => {
    if (!form.name || !form.address || !form.lieu || !form.aval) {
      alert('Merci de remplir tous les champs avant de sauvegarder.')
      return
    }

    const isUpdate = !!company?.id
    const method = isUpdate ? 'PUT' : 'POST'
    const url = isUpdate ? '/api/company/update' : '/api/company/create'
    const body = isUpdate ? { ...form, id: company?.id } : form

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
        message: isUpdate ? 'Société mise à jour avec succès.' : 'Société créée avec succès.',
      })
    } else {
      const errorData = await res.json()
      setPopup({
        type: 'error',
        title: 'Erreur !',
        message: errorData.error || 'Échec de la sauvegarde.',
      })
    }
  }



  const saveBank = async () => {
    if (!newBank.bankName || !newBank.rib) {
      alert('Veuillez remplir tous les champs.')
      return
    }
    if (!company) {
      alert('Veuillez enregistrer la société avant d’ajouter une banque.')
      return
    }

    const url = editBankId ? '/api/bank/update' : '/api/bank/create'
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
        message: errorData.error || 'Erreur lors de l’enregistrement de la banque.',
      })
      return
    }

    setNewBank({ bankName: '', rib: '' })
    setEditBankId(null)
    setShowAddBankForm(false)
    await fetchBanks()
    setPopup({
      type: 'success',
      title: 'Succès !',
      message: editBankId ? 'Banque mise à jour.' : 'Banque ajoutée avec succès.',
    })
  }

  const confirmDeleteBank = async () => {
    if (!bankToDelete) return
    try {
      const res = await fetch('/api/bank/delete', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: bankToDelete.id }),
      })

      if (!res.ok) throw new Error('Suppression échouée')

      fetchBanks()
      setBankToDelete(null)
      setPopup({
        type: 'success',
        title: 'Succès !',
        message: 'Banque supprimée avec succès.',
      })
    } catch {
      setPopup({
        type: 'error',
        title: 'Erreur !',
        message: 'La suppression a échoué.',
      })
    }
  }



  const formatRIB = (rib: string): string => {
    const clean = rib.replace(/\s+/g, '')
    return clean.length === 20
      ? `${clean.slice(0, 2)} - ${clean.slice(2, 5)} - ${clean.slice(5, 18)} - ${clean.slice(18)}`
      : rib
  }

 

  return (
    <div className="flex min-h-screen bg-blue-50 text-gray-900">
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />

      <main className={`flex-1 flex flex-col mt-12 p-2 ${sidebarOpen ? 'ml-64' : 'ml-0'} md:ml-64`}>
        <div className="shadow bg-white">
          <Header />
        </div>

        <div className="flex-1 p-6 overflow-auto">
          <div className="bg-white rounded-lg shadow-md p-6">
           
            <h1 className="text-2xl font-bold mb-4">Informations Personnelles</h1>
            <h2 className="text-lg font-semibold mb-4">Information de la société</h2>

            {/** Formulaire Société **/}
            <div className="space-y-3 mb-6">
              {['name', 'address', 'lieu', 'aval'].map((field) => (
                <div key={field} className="flex items-center mb-3">
                  <label className="w-40 font-medium capitalize">{field} :</label>
                  <input
                    value={(form as any)[field]}
                    onChange={(e) => setForm({ ...form, [field]: e.target.value })}
                    className="flex-1 border p-2 rounded"
                  />
                </div>
              ))}
              <div className="flex justify-end">
                <button onClick={handleSaveCompany} className="bg-blue-600 text-white px-4 py-2 rounded mt-2">
                  Enregistrer
                </button>
              </div>
            </div>

            {/*Informations Bancaires */}
            <h2 className="text-lg font-semibold mt-8 mb-2">Informations bancaires</h2>

            <div className="flex items-center justify-between mb-3">
              <input
                type="text"
                placeholder="🔍 Rechercher une banque..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="border p-2 rounded"
              />
              <button
                className="bg-blue-600 text-white px-3 py-2 rounded flex items-center"
                onClick={() => {
                  setEditBankId(null)
                  setNewBank({ bankName: '', rib: '' })
                  setShowAddBankForm((p) => !p)
                }}
              >
                <FaPlus className="mr-1" /> Ajouter banque
              </button>
            </div>

            {/*Formulaire Banque*/}
            {showAddBankForm && (
              <div className="mt-4 mb-6 p-4 border rounded bg-gray-100">
                <h3 className="font-semibold mb-2">
                  {editBankId ? 'Modifier Banque' : 'Ajouter Banque'}
                </h3>
                <input
                  type="text"
                  placeholder="Nom de la banque"
                  value={newBank.bankName}
                  onChange={(e) => setNewBank({ ...newBank, bankName: e.target.value })}
                  className="border p-2 rounded w-full mb-2"
                />
                <input
                  type="number"
                  placeholder="RIB"
                  value={newBank.rib}
                  onChange={(e) =>
                    e.target.value.length <= 20 &&
                    setNewBank({ ...newBank, rib: e.target.value })
                  }
                  className="border p-2 rounded w-full mb-2"
                />
                <div className="flex space-x-2">
                  <button onClick={saveBank} className="bg-green-600 text-white px-3 py-1 rounded">
                    Enregistrer
                  </button>
                  <button
                    onClick={() => setShowAddBankForm(false)}
                    className="bg-gray-600 text-white px-3 py-1 rounded"
                  >
                    Annuler
                  </button>
                </div>
              </div>
            )}

            {/*  Tableau des banques  */}
            <table className="min-w-full border border-gray-300">
              <thead className="bg-blue-600 text-white">
                <tr>
                  <th className="px-4 py-2 text-left">Nom de la banque</th>
                  <th className="px-4 py-2 text-left">RIB</th>
                  <th className="px-4 py-2 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {banks
                  .filter(
                    (b) =>
                      b.bankName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                      b.rib.includes(searchTerm)
                  )
                  .map((bank) => (
                    <tr key={bank.id} className="hover:bg-gray-100">
                      <td className="border px-4 py-2">{bank.bankName}</td>
                      <td className="border px-4 py-2">{formatRIB(bank.rib)}</td>
                      <td className="border px-4 py-2">
                        <button
                          onClick={() => {
                            setNewBank({ bankName: bank.bankName, rib: bank.rib })
                            setEditBankId(bank.id)
                            setShowAddBankForm(true)
                          }}
                          className="text-blue-600 hover:text-blue-800 mr-2"
                        >
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

        {/*  Modales  */}
        {bankToDelete && (
          <DeleteBankModal
            bank={bankToDelete}
            onCancel={() => setBankToDelete(null)}
            onConfirm={confirmDeleteBank}
          />
        )}
      </main>

      {popup && <PopupAlert popup={popup} onClose={() => setPopup(null)} />}
    </div>
  )
}


function DeleteBankModal({
  bank,
  onCancel,
  onConfirm,
}: {
  bank: Bank
  onCancel: () => void
  onConfirm: () => void
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
      onClick={onCancel}
    >
      <div className="bg-white rounded-lg p-6 w-full max-w-sm" onClick={(e) => e.stopPropagation()}>
        <h2 className="text-lg font-bold mb-4 text-red-600">Confirmer la suppression</h2>
        <p className="mb-4">
          Supprimer <span className="font-semibold">{bank.bankName}</span> ?
        </p>
        <div className="flex justify-end space-x-2">
          <button onClick={onCancel} className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400">
            Annuler
          </button>
          <button onClick={onConfirm} className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700">
            Supprimer
          </button>
        </div>
      </div>
    </div>
  )
}

function PopupAlert({
  popup,
  onClose,
}: {
  popup: { type: 'success' | 'error'; title: string; message: string }
  onClose: () => void
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-xl p-6 w-80 text-center shadow-xl">
        <div className="text-6xl mb-4">
          {popup.type === 'success' ? '✔️' : '❌'}
        </div>
        <h2
          className={`text-xl font-bold mb-2 ${
            popup.type === 'success' ? 'text-green-600' : 'text-red-600'
          }`}
        >
          {popup.title}
        </h2>
        <p className="mb-4 text-gray-700">{popup.message}</p>
        <button
          onClick={onClose}
          className={`px-4 py-2 rounded text-white ${
            popup.type === 'success'
              ? 'bg-green-600 hover:bg-green-700'
              : 'bg-red-600 hover:bg-red-700'
          }`}
        >
          Ok
        </button>
      </div>
    </div>
  )
}

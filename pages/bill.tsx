// pages/bill.tsx
import Sidebar from '../components/sidebar'
import Header from '../components/header'
import { useState, useEffect } from 'react'
import { GetServerSideProps } from 'next'
import { getSession } from 'next-auth/react'
import { Eye,Pencil, Trash2, Printer } from 'lucide-react'
import { FaPlus } from 'react-icons/fa'

type Bill = {
  id: number
  clientName: string
  amount: number
  dueDate: string
  status: 'payé' | 'non_payé'
  creationDate: string
  bankAgency: string
  customerId: number
  bankId: number
  companyName: string      
  aval: string             
  lieu: string 
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

export default function BillsPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')
  const [bills, setBills] = useState<Bill[]>([])
  const [billToDelete, setBillToDelete] = useState<Bill | null>(null)
const [billToView, setBillToView] = useState<Bill | null>(null)
const closeDetailModal = () => setBillToView(null)

  const requestDelete = (bill: Bill) => {
  setBillToDelete(bill)
}

  const [popup, setPopup] = useState<{
    type: 'success' | 'error'
    title: string
    message: string
  } | null>(null)

    useEffect(() => {
    if (popup) {
      const timer = setTimeout(() => {
        setPopup(null)
      }, 2000)

      return () => clearTimeout(timer)
    }
  }, [popup])

  // Pour gérer la popup édition
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [billToEdit, setBillToEdit] = useState<Bill | null>(null)
 const fetchBills = async () => {
      try {
        const res = await fetch('/api/bills/get')
        const data = await res.json()
        setBills(data)
      } catch (error) {
        console.error('Erreur de chargement des bills :', error)
      }
    }
  useEffect(() => {
   

    fetchBills()
  }, [])
const [clients, setClients] = useState<{ id: number, nom: string }[]>([])
const [banks, setBanks] = useState<{ id: number, bankName: string }[]>([])

useEffect(() => {
  const fetchInitialData = async () => {
    try {
      const [billRes, clientRes, bankRes] = await Promise.all([
        fetch('/api/bills/get'),
        fetch('/api/clients/list'),
        fetch('/api/bank/list'),
      ])

      const billData = await billRes.json()
      const clientData = await clientRes.json()
      
      const bankData = await bankRes.json()

      setBills(billData)
      setClients(clientData.customers || []) 
      setBanks(bankData.banks || [])
    } catch (error) {
      console.error('Erreur de chargement initial :', error)
    }
  }

  fetchInitialData()
}, [])

 const filteredBills = bills.filter((bill) => {
  const clientName = bill.clientName|| ''
  const matchesSearch = clientName.toLowerCase().includes(searchTerm.toLowerCase())
  const matchesStatus = statusFilter === 'All' || bill.status === statusFilter
  return matchesSearch && matchesStatus
})

const openDetailModal = (bill: Bill) => {
  setBillToView(bill)
}

  // Ouvre la popup et met la kembiala à modifier
  const openEditModal = (bill: Bill) => {
    setBillToEdit(bill)
    setIsEditModalOpen(true)
  }

  // Ferme la popup et vide la kembiala à modifier
  const closeEditModal = () => {
    setIsEditModalOpen(false)
    setBillToEdit(null)
  }

  // Gérer la modification des champs dans la popup
  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
  if (!billToEdit) return
  const { name, value } = e.target

  setBillToEdit({
    ...billToEdit,
    [name]: name === 'customerId' || name === 'bankId' ? Number(value) : value,
  })
}

const handleDelete = async (id: number) => {
  if (!window.confirm(`Voulez-vous vraiment supprimer la kembiala #${id} ?`)) return

  try {
    const res = await fetch(`/api/bills/delete?id=${id}`, {
      method: 'DELETE',
    })

    const result = await res.json()
    if (!res.ok) throw new Error(result.error || 'Erreur lors de la suppression')

    await fetchBills()

    setPopup({
      type: 'success',
      title: 'Supprimée!',
      message: `La kembiala #${String(id).padStart(12, '0')} a été supprimée avec succès.`,

    })
  } catch (err: any) {
    console.error(err)
    setPopup({
      type: 'error',
      title: 'Erreur!',
      message: err.message || 'Échec de la suppression.',
    })
  }
}
const confirmDelete = async () => {
  if (!billToDelete) return

  try {
    const res = await fetch(`/api/bills/delete?id=${billToDelete.id}`, {
      method: 'DELETE',
    })

    const result = await res.json()
    if (!res.ok) throw new Error(result.error || 'Erreur lors de la suppression')

    await fetchBills()
    setPopup({
      type: 'success',
      title: 'Supprimée!',
      message: `La kembiala #${String(billToDelete.id).padStart(12, '0')} a été supprimée avec succès.`,

    })
    setBillToDelete(null)
  } catch (err: any) {
    console.error(err)
    setPopup({
      type: 'error',
      title: 'Erreur!',
      message: err.message || 'Échec de la suppression.',
    })
  }
}

  // Exemple simple pour sauvegarder la modification (tu peux appeler ton API ici)
const handleSave = async () => {
  if (!billToEdit) return

  const payload = {
    id: billToEdit.id,
    amount: Number(billToEdit.amount),
    dueDate: billToEdit.dueDate,
    creationDate: billToEdit.creationDate,
    status: billToEdit.status,
    customerId: Number(billToEdit.customerId),
    bankId: Number(billToEdit.bankId),
  }

  try {
    const res = await fetch(`/api/bills/update`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })

    const result = await res.json()
    if (!res.ok) throw new Error(result.error || 'Échec de la mise à jour')

    await fetchBills()
    closeEditModal()

    setPopup({
      type: 'success',
      title: 'Succès!',
      message: 'La kembiala a été modifiée avec succès.',
    })
  } catch (err: any) {
    console.error(err)
    setPopup({
      type: 'error',
      title: 'Erreur!',
      message: err.message || 'Une erreur est survenue.',
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
            <div className="flex justify-between items-center mb-4">
              <h1 className="text-2xl font-bold mb-4">Gestion des lettres de Change</h1>

              <button className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
                <FaPlus className="inline mr-1" />
                Add Bill
              </button>
            </div>

            <div className="flex justify-between items-center mb-4">
              {/* Search + Filter */}
              <div className="flex space-x-2">
                <input
                  type="text"
                  placeholder="🔍Search..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="border p-2 rounded"
                />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="border p-2 rounded"
                >
                  <option value="All">All</option>
                  <option value="payé">Payé</option>
                  <option value="non_payé">Non Payé</option>
                </select>
              </div>
            </div>

            <table className="min-w-full border border-gray-300 text-sm">
              <thead>
                <tr className="bg-gray-100 text-left">
                  <th className="border px-2 py-2">ID</th>
                  <th className="border px-2 py-2">Client Name</th>
                  <th className="border px-2 py-2">Amount (DT)</th>
                  <th className="border px-2 py-2">Due Date</th>
                  <th className="border px-2 py-2">Status</th>
                  <th className="border px-2 py-2">Creation Date</th>
                  <th className="border px-2 py-2">BankAgency</th>
                  <th className="border px-2 py-2">Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredBills.map((bill) => (
                  <tr key={bill.id} className="hover:bg-gray-50">
                   <td className="border px-2 py-2">{String(bill.id).padStart(12, '0')}</td>
                    <td className="border px-2 py-2 capitalize">{bill.clientName} </td>
                    <td className="border px-2 py-2">{bill.amount.toLocaleString()}</td>
                    <td className="border px-2 py-2">
                      {(() => {
                        const date = new Date(bill.dueDate)
                        const day = String(date.getDate()).padStart(2, '0')
                        const month = String(date.getMonth() + 1).padStart(2, '0')
                        const year = date.getFullYear()
                        return `${day}/${month}/${year}`
                      })()}
                    </td>

                    <td className="border border-black px-2 py-2 font-bold">
                      <span className={bill.status === 'payé' ? 'text-green-600' : 'text-red-600'}>
                        {bill.status}
                      </span>
                    </td>

                    <td className="border px-2 py-2">
                      {(() => {
                        const date = new Date(bill.creationDate)
                        const day = String(date.getDate()).padStart(2, '0')
                        const month = String(date.getMonth() + 1).padStart(2, '0')
                        const year = date.getFullYear()
                        return `${day}/${month}/${year}`
                      })()}
                    </td>
                    <td className="border px-2 py-2">{bill.bankAgency}</td>
                    <td className="border px-2 py-2">
                      <div className="flex justify-center items-center space-x-2">
                        {/* <button
                          className="text-blue-600 hover:text-blue-800"
                          title="Edit"
                          onClick={() => openEditModal(bill)}
                        >
                          <Pencil size={16} />
                        </button> */}
                        <button
                          className="text-blue-600 hover:text-blue-800"
                          title="Voir détails"
                          onClick={() => openDetailModal(bill)} // nouvelle fonction à créer
                        >
                          <Eye size={16} />
                        </button>

                       <button
                        className="text-red-600 hover:text-red-800"
                        title="Delete"
                        onClick={() => requestDelete(bill)}
                      >
                        <Trash2 size={16} />
                      </button>


                        <button className="text-gray-600 hover:text-gray-800" title="Print">
                          <Printer size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Modal d'édition */}
            {isEditModalOpen && billToEdit && (
              <div className="fixed inset-0 flex items-center justify-center backdrop-blur-sm bg-black/30 z-50">

                <div className="bg-white rounded-lg p-6 w-full max-w-md">
                 <h2 className="text-xl font-bold mb-4">
                    Modifier la kembiala #{String(billToEdit.id).padStart(12, '0')}
                  </h2>


                  <label className="block mb-2">
  Client:
  <select
    name="customerId"
    value={billToEdit.customerId}
    onChange={handleEditChange}
    className="border w-full p-2 rounded mt-1"
  >
    {clients.map((client) => (
      <option key={client.id} value={client.id}>
        {client.nom} 
      </option>
    ))}
  </select>
</label>


                  <label className="block mb-2">
                    Amount:
                    <input
                      type="number"
                      name="amount"
                      value={billToEdit.amount}
                      onChange={handleEditChange}
                      className="border w-full p-2 rounded mt-1"
                    />
                  </label>

                  <label className="block mb-2">
                    Due Date:
                    <input
                      type="date"
                      name="dueDate"
                      value={billToEdit.dueDate.split('T')[0]} // ISO date format expected
                      onChange={handleEditChange}
                      className="border w-full p-2 rounded mt-1"
                    />
                  </label>
<label className="block mb-2">
  Creation Date:
  <input
    type="date"
    name="creationDate"
    value={billToEdit.creationDate.split('T')[0]}
    onChange={handleEditChange}
    className="border w-full p-2 rounded mt-1"
  />
</label>

                  <label className="block mb-2">
                    Status:
                    <select
                      name="status"
                      value={billToEdit.status}
                      onChange={handleEditChange}
                      className="border w-full p-2 rounded mt-1"
                    >
                      <option value="payé">Payé</option>
                      <option value="non_payé">Non Payé</option>
                    </select>
                  </label>

                  <label className="block mb-2">
  Bank Agency:
  <select
    name="bankId"
    value={billToEdit.bankId}
    onChange={handleEditChange}
    className="border w-full p-2 rounded mt-1"
  >
    {banks.map((bank) => (
      <option key={bank.id} value={bank.id}>
        {bank.bankName}
      </option>
    ))}
  </select>
</label>


                  <div className="flex justify-end space-x-4 mt-4">
                    <button
                      onClick={closeEditModal}
                      className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
                    >
                      Annuler
                    </button>
                    <button
                      onClick={handleSave}
                      className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                    >
                      Enregistrer
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
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

{billToDelete && (
  <div
    className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm bg-black/40"
    onClick={() => setBillToDelete(null)}
  >
    <div
      className="bg-white rounded-lg p-6 w-full max-w-sm"
      onClick={(e) => e.stopPropagation()}
    >
      <h2 className="text-lg font-bold mb-4 text-red-600">Confirmer la suppression</h2>
      <p className="mb-4">
        Êtes-vous sûr de vouloir supprimer la kembiala #{String(billToDelete.id).padStart(12, '0')} pour{' '}
        <span className="font-semibold">{billToDelete.clientName}</span> ?
      </p>
      <div className="flex justify-end space-x-2">
        
        <button
          onClick={() => setBillToDelete(null)}
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
{billToView && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
    <div className="bg-white rounded-xl p-6 w-full max-w-2xl shadow-xl">
      <h2 className="text-2xl font-semibold mb-6 text-center text-blue-700">
         Détails de la kembiala #{String(billToView.id).padStart(12, '0')}
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-gray-700">
        <div>
          <p><span className="font-semibold text-gray-800"> Société:</span> {billToView.companyName || 'N/A'}</p>
          <p><span className="font-semibold text-gray-800"> Aval:</span> {billToView.aval || 'N/A'}</p>
          <p><span className="font-semibold text-gray-800"> Lieu:</span> {billToView.lieu || 'N/A'}</p>
          <p><span className="font-semibold text-gray-800"> Client:</span> {billToView.clientName}</p>
        </div>
        <div>
          <p><span className="font-semibold text-gray-800"> Montant:</span> {billToView.amount.toLocaleString()} DT</p>
          <p><span className="font-semibold text-gray-800">Échéance:</span> {new Date(billToView.dueDate).toLocaleDateString()}</p>
          <p><span className="font-semibold text-gray-800">Création:</span> {new Date(billToView.creationDate).toLocaleDateString()}</p>
          <p>
            <span className="font-semibold text-gray-800"> Statut:</span>{' '}
            <span className={billToView.status === 'payé' ? 'text-green-600 font-semibold' : 'text-red-600 font-semibold'}>
              {billToView.status}
            </span>
          </p>
          <p><span className="font-semibold text-gray-800"> Banque:</span> {billToView.bankAgency}</p>
        </div>
      </div>

      <div className="mt-6 text-center">
        <button
          onClick={closeDetailModal}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 transition"
        >
          Fermer
        </button>
      </div>
    </div>
  </div>
)}



      </main>
    </div>
  )
}

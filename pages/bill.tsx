// pages/bill.tsx
import Sidebar from '../components/sidebar'
import Header from '../components/header'
import { useState, useEffect } from 'react'
import { GetServerSideProps } from 'next'
import { getSession } from 'next-auth/react'
import { Eye,Pencil, Trash2, Printer } from 'lucide-react'
import { FaPlus } from 'react-icons/fa'
import { useRouter } from 'next/router'
import { useRef } from 'react'

type Bank = {
  id: number
  bankName: string
  rib: string
}

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
  numero:string
  bank?: Bank 
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
const router = useRouter()
const [billToPrint, setBillToPrint] = useState<Bill | null>(null);

const ones: string[] = [
  '', 'un', 'deux', 'trois', 'quatre', 'cinq', 'six', 'sept', 'huit', 'neuf',
  'dix', 'onze', 'douze', 'treize', 'quatorze', 'quinze', 'seize'
];

const tens: string[] = [
  '', '', 'vingt', 'trente', 'quarante', 'cinquante', 'soixante', 'soixante', 'quatre-vingt', 'quatre-vingt'
];

function numberToWords(n: number): string {
  if (n === 0) return 'zéro';
  if (n < 0) return 'moins ' + numberToWords(-n);

  let words = '';

  if (Math.floor(n / 1000) > 0) {
    words += numberToWords(Math.floor(n / 1000)) + ' mille ';
    n %= 1000;
  }

  if (Math.floor(n / 100) > 0) {
    words += (Math.floor(n / 100) > 1 ? ones[Math.floor(n / 100)] : '') + ' cent ';
    n %= 100;
  }

  if (n > 0) {
    if (n < 17) {
      words += ones[n];
    } else if (n < 20) {
      words += 'dix-' + ones[n - 10];
    } else if (n < 70) {
      words += tens[Math.floor(n / 10)];
      if (n % 10 === 1) words += '-et-un';
      else if (n % 10 > 0) words += '-' + ones[n % 10];
    } else if (n < 80) {
      words += 'soixante-' + numberToWords(n - 60);
    } else if (n < 100) {
      words += 'quatre-vingt';
      if (n % 20 > 0) words += '-' + numberToWords(n % 20);
    }
  }

  return words.trim();
}

function amountToWords(amount: number): string {
  const dt = Math.floor(amount);
  const millimes = Math.round((amount - dt) * 1000); 
  let result = numberToWords(dt) + ' dinars';
  if (millimes > 0) {
    result += ' et ' + numberToWords(millimes) + ' millimes';
  }
  return result;
}



const requestDelete = (bill: Bill) => {
  setBillToDelete(bill)
}
const toggleStatus = async (bill: Bill) => {
  const newStatus = bill.status === 'payé' ? 'non_payé' : 'payé'

  try {
    const res = await fetch('/api/bills/update', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...bill, status: newStatus }),
    })

    const result = await res.json()
    if (!res.ok) throw new Error(result.error || 'Erreur lors du changement de statut')

    await fetchBills()
    setPopup({
      type: 'success',
      title: 'Mis à jour !',
      message: `Le statut de la kembiala #${String(bill.numero).padStart(12, '0')} a été mis à jour.`,
    })
  } catch (err: any) {
    setPopup({
      type: 'error',
      title: 'Erreur !',
      message: err.message || 'Impossible de changer le statut.',
    })
  }
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


const handlePrintBill = (bill: Bill) => {
  setBillToPrint(bill);

  // On attend que le DOM mette à jour le contenu caché avant d’imprimer
  setTimeout(() => {
    window.print();
  }, 500);
};


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
  const clientName = bill.clientName || ''
  const billNumber = bill.numero ? bill.numero.toString() : '' 

  const search = searchTerm.trim().toLowerCase()

  
  const matchesSearch =
    clientName.toLowerCase().includes(search) ||
    billNumber.toLowerCase().startsWith(search) 

 
  const matchesStatus = statusFilter === 'All' || bill.status === statusFilter

  return matchesSearch && matchesStatus
})


const openDetailModal = (bill: Bill) => {
  setBillToView(bill)
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
      message: `La kembiala #${String(billToDelete.numero).padStart(12, '0')} a été supprimée avec succès.`,

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

              <button 
              onClick={() => router.push('/document')}
              className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
                <FaPlus className="inline mr-1" />
                Ajouter Kembiala
              </button>
            </div>

            <div className="flex justify-between items-center mb-4">
              {/* Search + Filter */}
              <div className="flex space-x-2">
                <input
                  type="text"
                  placeholder="🔍Rechercher client..."
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
                  <th className="border px-2 py-2">Numéro</th>
                  <th className="border px-2 py-2">Nom client</th>
                  <th className="border px-2 py-2">Montant (DT)</th>
                  <th className="border px-2 py-2">Date d'échéance</th>
                  <th className="border px-2 py-2">Status</th>
                  <th className="border px-2 py-2">Date de creation </th>
                  <th className="border px-2 py-2">Agence bancaire</th>
                  <th className="border px-2 py-2">Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredBills.map((bill) => (
                  
                  <tr key={bill.id} className="hover:bg-gray-50">
                   <td className="border px-2 py-2">{bill.numero}</td>
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

      <td className="border px-2 py-2 text-center">
                <label className="relative inline-flex items-center cursor-pointer">
                <input
                    type="checkbox"
                    checked={bill.status === 'payé'}
                    onChange={() => toggleStatus(bill)}
                    className="sr-only peer"
                  />
                <div
                  className="w-24 h-8 bg-red-500 rounded-full peer-checked:bg-green-500 flex items-center justify-between px-2 text-white text-sm font-medium relative transition-all"
                >
                  <span
                    className={`absolute left-8 transition-all duration-200 ${
                      bill.status === 'payé' ? 'opacity-0' : 'opacity-100'
                    }`}
                  >
                    Non Payé
                  </span>
                  <span
                    className={`absolute right-8 transition-all duration-200 ${
                      bill.status === 'payé' ? 'opacity-100' : 'opacity-0'
                    }`}
                  >
                    Payé
                  </span>
                  <div
                    className="absolute top-1 left-1 w-6 h-6 bg-white rounded-full shadow-md transform transition-all duration-300 peer-checked:translate-x-16"
                  ></div>
                </div>
              </label>
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
                       
                        <button
                          className="text-blue-600 hover:text-blue-800"
                          title="Voir détails"
                          onClick={() => openDetailModal(bill)} 
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


                        <button 
                        onClick={() => handlePrintBill(bill)}
                        className="text-gray-600 hover:text-gray-800" title="Print" >
                          <Printer size={16} />
                          
                        </button>
           
                      </div>
                    </td>
                  </tr>
                  

                  
                ))}
                
              </tbody>
            </table>

           
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
        Êtes-vous sûr de vouloir supprimer la kembiala #{String(billToDelete.numero).padStart(12, '0')} pour{' '}
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
         Détails de la kembiala #{String(billToView.numero).padStart(12, '0')}
      </h2>
<div className="flex flex-col justify-center items-center min-h-[200px]">
      
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-30 gap-y-4 text-gray-700">

        
        <div>
          <p><span className="font-semibold text-gray-800"> Numéro:</span> {billToView.numero}</p>
          <p><span className="font-semibold text-gray-800"> Société:</span> {billToView.companyName }</p>
          <p><span className="font-semibold text-gray-800"> Aval:</span> {billToView.aval}</p>
          <p><span className="font-semibold text-gray-800"> Lieu:</span> {billToView.lieu }</p>
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

<div
  id="print-area"
  className="hidden print:block absolute top-0 left-0 w-full h-full bg-white text-black font-sans"
>
  {billToPrint && (
    <div
      style={{
        width: '800px',
        height: '1000px',
        position: 'relative',
        background: 'white',
        color: 'black',
        fontFamily: 'sans-serif',
      }}
    >
      
      <div style={{ position: 'absolute', top: '57px', right: '520px' }}>
  {new Date(billToPrint.dueDate).toISOString().split('T')[0]}
</div>

<div style={{ position: 'absolute', top: '61px', right: '390px' }}>
  {new Date(billToPrint.creationDate).toISOString().split('T')[0]}
</div>
      <div style={{ position: 'absolute', top: '41px', right: '390px' }}>
        {billToPrint.lieu}
      </div>

     
       <div style={{ position: 'absolute', top: '90px', left: '185px', display: 'flex', gap: '40px' }}>
        
      <span style={{ position: 'absolute', left: 0 }}>{billToPrint.bank?.rib?.slice(0, 2)}</span>
      <span style={{ position: 'absolute', left: 40 }}>{billToPrint.bank?.rib?.slice(2, 5)}</span>
      <span style={{ position: 'absolute', left: 95 }}>{billToPrint.bank?.rib?.slice(5, 18)}</span>
      <span style={{ position: 'absolute', left: 242 }}>{billToPrint.bank?.rib?.slice(18, 20)}</span>
    </div>
      <div style={{ position: 'absolute', top: '90px', right: '220px' }}>
        {billToPrint.amount.toFixed(3)} DT
      </div>
      <div style={{ position: 'absolute', top: '150px', left: '183px' }}>
        {billToPrint.clientName}
      </div>
      <div style={{ position: 'absolute', top: '145px', right: '220px' }}>
        {billToPrint.amount.toFixed(3)} DT
      </div>

      <div style={{ position: 'absolute', top: '178px', left: '20px' }}>
      {amountToWords(billToPrint.amount)} 
</div>
      

      <div style={{ position: 'absolute', top: '210px', left: '22px' }}>
        {billToPrint.lieu}
      </div>
      <div style={{ position: 'absolute', top: '210px', left: '114px' }}>
          {new Date(billToPrint.creationDate).toISOString().split('T')[0]}
    </div>

    <div style={{ position: 'absolute', top: '210px', left: '210px' }}>
      {new Date(billToPrint.dueDate).toISOString().split('T')[0]}
    </div>

 <div style={{ position: 'absolute', top: '250px', left: '11px', display: 'flex', gap: '40px' }}>
        
      <span style={{ position: 'absolute', left: 3 }}>{billToPrint.bank?.rib?.slice(0, 2)}</span>
      <span style={{ position: 'absolute', left: 28 }}>{billToPrint.bank?.rib?.slice(2, 5)}</span>
      <span style={{ position: 'absolute', left: 95 }}>{billToPrint.bank?.rib?.slice(5, 18)}</span>
      <span style={{ position: 'absolute', left: 238 }}>{billToPrint.bank?.rib?.slice(18, 20)}</span>
    </div>




      <div style={{ position: 'absolute', top: '300px', left: '145px',width:'150px' }}>
        {billToPrint.aval}
      </div>
      <div style={{ position: 'absolute', top: '250px', right: '180px' ,width:'170px'}}>
        {billToPrint.bankAgency}
      </div>
      <div style={{ position: 'absolute', top: '272px', left: '285px',width:'150px' }}>
        {billToPrint.companyName}
      </div>
    </div>
  )}


</div>
<style jsx global>{`
  @media print {
    body * {
      visibility: hidden; 
    }

    #print-area, #print-area * {
      visibility: visible;
    }

    #print-area {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      margin: 0;
      padding: 0;
    }

    @page {
      size: A4; 
      margin: 0; 
    }

    html, body {
      height: 100%;
      overflow: hidden;
      background: white;
    }
  }
`}</style>

      </main>
      
    </div>
  )
}

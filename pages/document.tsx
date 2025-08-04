'use client'

import { useEffect, useState, ChangeEvent,useRef } from 'react'
import Header from '../components/header'
import Sidebar from '../components/sidebar'
import "../app/globals.css";
import PrintLayout from '../components/PrintLayout'

type Bank = {
  id: string
  bankName: string
  rib: string
}

type Company = {
  name: string
  address: string
  aval: string
  lieu: string
  banks: Bank[]
}

type Customer = {
  id: number
  nom: string
 
}

type FormData = {
  numero: string
  name: string
  aval: string
  lieu: string
  echeance: string
  creationDate: string
  rib1: string
  rib2: string
  rib3: string
  rib4: string
  montant: string
  millimes: string
  beneficiaire: string
  montantLettre: string
}

export default function DocumentForm() {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [company, setCompany] = useState<Company | null>(null)
  const [selectedBank, setSelectedBank] = useState<Bank | null>(null)
  const [creationDate] = useState(() => new Date().toISOString().split('T')[0])

  const [form, setForm] = useState<FormData>({
    numero: '',
    name: '',
    creationDate: new Date().toISOString().split('T')[0],
    echeance: '',
    rib1: '', rib2: '', rib3: '', rib4: '',
    montant: '', millimes: '',
    beneficiaire: '',
    montantLettre: '',
    aval: '',
    lieu: '',
  })

    useEffect(() => {
    // fetch company
    fetch('/api/company/get')
      .then(res => res.json())
      .then(data => {
        const fetchedCompany: Company = data.company
        setCompany(fetchedCompany)

         setForm(prevForm => ({
        ...prevForm,
        name: `${fetchedCompany.name}, ${fetchedCompany.address}`,
        aval: fetchedCompany.aval,
        lieu: fetchedCompany.lieu,
      }))

        setSelectedBank( null)
      })
      .catch(err => console.error('Erreur chargement société:', err))

    // fetch customers
    fetch('/api/clients/list') // Remplace par le bon endpoint qui retourne ta liste clients
      .then(res => res.json())
      .then(data => {
        setCustomers(data.customers || [])
      })
      .catch(err => console.error('Erreur chargement clients:', err))
  }, [])

 

 /*  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  } */

const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
  const { name, value } = e.target
  const updatedForm = { ...form, [name]: value }
  if (name === 'numero') {
    // Empêcher tout sauf chiffres et longueur max 12
    const numericValue = value.replace(/\D/g, '') // Supprime tout sauf chiffres
    if (numericValue.length <= 12) {
      updatedForm.numero = numericValue
    } else {
      return // Ne met pas à jour si plus de 12 chiffres
    }
  } 

  if (name === 'montant' || name === 'millimes') {
    const dinars = parseInt(updatedForm.montant || '0', 10)
    const millimes = parseInt(updatedForm.millimes || '0', 10)
    updatedForm.montantLettre = convertirMontantEnLettres(dinars, millimes)
  }

  setForm(updatedForm)
}

function addOneDay(dateStr: string): string {
  const date = new Date(dateStr)
  date.setDate(date.getDate() + 1)
  return date.toISOString().split('T')[0]
}

const printRef = useRef<HTMLDivElement>(null)

const handlePrint = async () => {
  if (!form.echeance || !selectedBank || !form.beneficiaire || !form.montant) {
    alert('Veuillez remplir tous les champs obligatoires.')
    return
  }
if (form.numero.length !== 12) {
  alert('Le numéro doit contenir exactement 12 chiffres.')
  return
}

  try {
    // Sauvegarde
    const response = await fetch('/api/bills/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        numero: form.numero,
        amount: form.montant,
        millimes: form.millimes,
        dueDate: form.echeance,
        companyName: form.name,
        aval: form.aval,
        lieu: form.lieu,
        customerName: form.beneficiaire,
        bankName: selectedBank.bankName,
      }),
    })

    const data = await response.json()
    if (!response.ok) throw new Error(data.message || 'Erreur API')

    alert('Kembiala enregistrée avec succès !')

    // Déclenche impression
    window.print()

  } catch (err) {
    console.error('Erreur enregistrement kembiala:', err)
    alert('Erreur enregistrement kembiala')
  }
}




 const handlePrintPreview = async () => {
  if (!form.echeance || !selectedBank || !form.beneficiaire || !form.montant) {
    alert('Veuillez remplir tous les champs obligatoires.')
    return
  }

  try {
    

    
    const ribFull = [form.rib1, form.rib2, form.rib3, form.rib4].join('')
    const query = new URLSearchParams({
      numero: form.numero,
      companyName: form.name || '',
      lieu: form.lieu || '',
      creationDate: form.creationDate,
      dueDate: form.echeance,
      rib: ribFull,
      amount: `${form.montant}.${form.millimes}`,
      customer: form.beneficiaire,
      amountLettre: form.montantLettre,
      bank: selectedBank.bankName,
      aval: form.aval || '',
    }).toString()

    window.open(`print?${query}`, '_blank')
  } catch (err) {
    console.error('Erreur enregistrement kembiala:', err)
    alert('Erreur enregistrement facture')
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
            <h1 className="text-2xl font-bold mb-6">Création Document</h1>
            <Input
            label="Numéro"
            name="numero"
            value={form.numero}
            onChange={handleChange}
            maxLength={12}
            inputMode="numeric"
            pattern="\d{12}"
          />


            <div className="space-y-4">
              <Input
              label="Adresse du tiré"
              name="name"
              value={form.name}
              onChange={handleChange}
            />
                          <Input
              label="Aval"
              name="aval"
              value={form.aval}
              onChange={handleChange}
            />

            <Input
              label="Lieu de création"
              name="lieu"
              value={form.lieu}
              onChange={handleChange}
            />
            <Input
              label="Date de création"
              name="creationDate"
              value={form.creationDate}
              onChange={handleChange}
              type="date"
            />

              <Input
            label="Date d'échéance"
            name="echeance"
            value={form.echeance}
            onChange={handleChange}
            type="date"
            min={addOneDay(form.creationDate)}
          />



              <div className="flex items-center mb-3">
                <label className="w-40 font-medium">Agence bancaire:</label>
                <select
                value={selectedBank?.bankName || ''}
                onChange={(e) => {
                    console.log('Banque sélectionnée:', e.target.value)
                    const bank = company?.banks?.find(b => b.bankName === e.target.value)
                    setSelectedBank(bank || null)

                    if (bank && bank.rib) {
                    const rib = bank.rib.replace(/\s+/g, '')
                    const rib1 = rib.slice(0, 2)
                    const rib2 = rib.slice(2, 5)
                    const rib3 = rib.slice(5, 18)
                    const rib4 = rib.slice(18, 20)

                    console.log('RIB découpé:', rib1, rib2, rib3, rib4)

                    setForm(prev => ({
                        ...prev,
                        rib1,
                        rib2,
                        rib3,
                        rib4,
                    }))
                    } else {
                    setForm(prev => ({
                        ...prev,
                        rib1: '',
                        rib2: '',
                        rib3: '',
                        rib4: '',
                    }))
                    }
                }}
                className="flex-1 border p-2 rounded"
                >
                    <option value="">-- Choisir une banque --</option>
                {company?.banks?.map((bank) => (
                    <option key={bank.id} value={bank.bankName}>{bank.bankName}</option>
                ))}
                </select>

              </div>

                <div className="flex items-center mb-3">
                <label className="w-40 font-medium">RIB/RIP du tiré:</label>
                <div className="flex flex-1 gap-2">
                    <input
    className="border p-2 rounded w-14"
    name="rib1"
    maxLength={2}
    value={form.rib1}
    onChange={handleChange}
  />
  <input
    className="border p-2 rounded w-16"
    name="rib2"
    maxLength={3}
    value={form.rib2}
    onChange={handleChange}
  />
  <input
    className="border p-2 rounded w-40"
    name="rib3"
    maxLength={13}
    value={form.rib3}
    onChange={handleChange}
  />
  <input
    className="border p-2 rounded w-14"
    name="rib4"
    maxLength={2}
    value={form.rib4}
    onChange={handleChange}
  />
                </div>
                </div>



              <div className="flex items-center mb-3">
  <label className="w-40 font-medium">Bénéficiaire:</label>
  <select
    className="flex-1 border p-2 rounded"
    name="beneficiaire"
    value={form.beneficiaire}
    onChange={(e) => setForm(prev => ({ ...prev, beneficiaire: e.target.value }))}
  >
    <option value="">-- Choisir un bénéficiaire --</option>
    {customers.map(customer => (
      <option key={customer.id} value={`${customer.nom} `}>
        {customer.nom} 
      </option>
    ))}
  </select>
</div>


              <div className="flex items-center mb-3">
                <label className="w-40 font-medium">Montant (chiffres):</label>
                <div className="flex items-center gap-2 flex-1">
                  <input className="border p-2 rounded w-40" name="montant" value={form.montant} onChange={handleChange} type='number' />
                  <span>DT</span>
                  <input className="border p-2 rounded w-24" name="millimes" value={form.millimes} onChange={handleChange} type='number' />
                  <span>m</span>
                </div>
              </div>

              
                
                <Input label="Montant (lettres)" name="montantLettre" value={form.montantLettre} readOnly/>
             

              <div className="flex justify-end mt-6 gap-4">
                <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"onClick={handlePrintPreview}>Print Preview</button>
                <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700" onClick={handlePrint}>Print</button>
              </div>
            </div>
          </div>
        </div>

      

 
      </main>
      <div
  id="print-area"
  className="hidden print:block absolute top-0 left-0 w-full h-full bg-white text-black font-sans"
>
  {/* Mets ici le rendu complet de ton document à imprimer avec le positionnement */}
  <div style={{ width: '800px', height: '1000px', position: 'relative', background: 'white', color: 'black', fontFamily: 'sans-serif' }}>
    {/* Exemple simplifié */}
    <div style={{ position: 'absolute', top: 70, right: 489 }}>{form.echeance}</div>
    <div style={{ position: 'absolute', top: 70, right: 320 }}>{creationDate}</div>
    <div style={{ position: 'absolute', top: 50, right: 320 }}>{form.lieu}</div>

    <div style={{ position: 'absolute', top: 120, left: 200, letterSpacing: '0.1em' }}>
      {[form.rib1, form.rib2, form.rib3, form.rib4].join('')}
    </div>

    <div style={{ position: 'absolute', top: 120, right: 100 }}>{`${form.montant}.${form.millimes} DT`}</div>

    <div style={{ position: 'absolute', top: 185, left: 230, fontWeight: 'bold' }}>{form.beneficiaire}</div>

    <div style={{ position: 'absolute', top: 185, right: 100 }}>{`${form.montant}.${form.millimes} DT`}</div>

    <div style={{ position: 'absolute', top: 225, left: 30, textTransform: 'capitalize' }}>{form.montantLettre}</div>

      <div className="absolute top-[267px] left-[30px]">{form.lieu}</div>
      <div className="absolute top-[267px] left-[155px]">{creationDate}</div>
      <div className="absolute top-[267px] left-[275px]">{form.echeance}</div>
      <div className="absolute top-[310px] left-[20px] letterSpacing- '0.1em'">{[form.rib1, form.rib2, form.rib3, form.rib4].join('')}</div>
      <div className="absolute top-[310px] left-[530px]">{selectedBank?.bankName}</div>
      <div className="absolute top-[373px] left-[183px]">{form.aval}</div>

      <div className="absolute top-[330px] left-[350px] w-[150px] break-words whitespace-pre-wrap">
  {form.name}</div>
  </div>
</div>

    </div>
    

    
  )
  
}

function Input({ label, ...props }: { label: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div className="flex items-center mb-3">
      <label className="w-40 font-medium">{label}</label>
      <input className="flex-1 border p-2 rounded" {...props} />
    </div>
  )
}

function convertirNombreEnLettres(n: number): string {
  if (n === 0) return 'zéro'

  const unités = [
    '', 'un', 'deux', 'trois', 'quatre', 'cinq', 'six', 'sept', 'huit', 'neuf',
    'dix', 'onze', 'douze', 'treize', 'quatorze', 'quinze', 'seize',
    'dix-sept', 'dix-huit', 'dix-neuf'
  ]

  const dizaines = [
    '', '', 'vingt', 'trente', 'quarante', 'cinquante',
    'soixante', 'soixante', 'quatre-vingt', 'quatre-vingt'
  ]

  function centainesToText(num: number): string {
    const c = Math.floor(num / 100)
    const r = num % 100
    let str = ''

    if (c > 0) {
      str += c > 1 ? unités[c] + ' cent' : 'cent'
      if (r === 0 && c > 1) str += 's' // plural "cents" si pas de reste
    }

    if (r > 0) {
      if (str) str += ' '
      str += convertirDeuxChiffres(r)
    }

    return str
  }

  function convertirDeuxChiffres(num: number): string {
    if (num < 20) return unités[num]

    const d = Math.floor(num / 10)
    const u = num % 10

    if (d === 7 || d === 9) {
      // 70-79 et 90-99
      return dizaines[d] + '-' + unités[10 + u]
    }

    if (u === 1 && d !== 8) return dizaines[d] + '-et-un'

    return dizaines[d] + (u ? '-' + unités[u] : '')
  }

  const groupes = [
    { valeur: 1e9, nomSingulier: 'milliard', nomPluriel: 'milliards' },
    { valeur: 1e6, nomSingulier: 'million', nomPluriel: 'millions' },
    { valeur: 1e3, nomSingulier: 'mille', nomPluriel: 'mille' },
    { valeur: 1, nomSingulier: '', nomPluriel: '' },
  ]

  let reste = n
  let mots: string[] = []

  for (const groupe of groupes) {
    const q = Math.floor(reste / groupe.valeur)
    reste = reste % groupe.valeur

    if (q === 0) continue

    if (groupe.valeur === 1e3) {
      if (q === 1) {
        mots.push('mille')
      } else {
        mots.push(convertirNombreEnLettres(q) + ' mille')
      }
    } else if (groupe.valeur === 1) {
      mots.push(centainesToText(q))
    } else {
      mots.push(convertirNombreEnLettres(q) + ' ' + (q > 1 ? groupe.nomPluriel : groupe.nomSingulier))
    }
  }

  return mots.join(' ').trim()
}

function convertirMontantEnLettres(dinars: number, millimes: number): string {
  const dinarsTxt = dinars > 0 ? `${convertirNombreEnLettres(dinars)} dinar${dinars > 1 ? 's' : ''}` : ''
  const millimesTxt = millimes > 0 ? `${convertirNombreEnLettres(millimes)} millime${millimes > 1 ? 's' : ''}` : ''

  if (dinars && millimes) {
    const res = `${dinarsTxt} et ${millimesTxt}`
    return res.charAt(0).toUpperCase() + res.slice(1)
  } else if (dinars) {
    return dinarsTxt.charAt(0).toUpperCase() + dinarsTxt.slice(1)
  } else if (millimes) {
    return millimesTxt.charAt(0).toUpperCase() + millimesTxt.slice(1)
  }

  return 'Zéro dinar'
}
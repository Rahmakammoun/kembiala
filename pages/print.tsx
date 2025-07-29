//pages/print.tsx
'use client'

import { useSearchParams } from 'next/navigation'

export default function PrintDocument() {
  const params = useSearchParams()
if (!params) return null

  const formatDate = (dateStr: string) => {
    const [year, month, day] = dateStr.split('-')
    return `${day}/${month}/${year}`
  }

  const companyName = params.get('companyName') || ''
  const lieu = params.get('lieu') || ''
  const creationDate = formatDate(params.get('creationDate') || '')
  const dueDate = formatDate(params.get('dueDate') || '')
  const rib = params.get('rib') || ''
  const amount = parseFloat(params.get('amount') || '0').toFixed(3)
  const customer = params.get('customer') || ''
  const amountLettre = params.get('amountLettre') || ''
  const bankName = params.get('bank') || ''
  const aval = params.get('aval') || ''
  const address = params.get('address') || ''

  return (
    <div className="relative w-[800px] h-[1000px] mx-auto bg-white text-black font-sans print:p-0 print:m-0 print:w-full print:h-full print:absolute print:top-0 print:left-0">
      {/* Date d'échéance */}
      <div className="absolute top-[70px] right-[489px]">{dueDate}</div>

      {/* Date et lieu */}
      <div className="absolute top-[70px] right-[320px]">{creationDate}</div>
      <div className="absolute top-[50px] right-[320px]">{lieu}</div>

      
      {/* RIB */}
      <div className="absolute top-[120px] left-[200px] tracking-wider">{rib}</div>

      {/* Montant */}
      <div className="absolute top-[120px] right-[100px]">{amount} DT</div>

      {/* Nom du client */}
      <div className="absolute top-[185px] left-[230px] font-bold">{customer}</div>

      {/* Montant à droite */}
      <div className="absolute top-[185px] right-[100px]">{amount} DT</div>

      {/* Montant en lettres */}
      <div className="absolute top-[225px] left-[30px] capitalize">{amountLettre}</div>

      {/* Informations en bas */}
      <div className="absolute top-[267px] left-[30px]">{lieu}</div>
      <div className="absolute top-[267px] left-[155px]">{creationDate}</div>
      <div className="absolute top-[267px] left-[275px]">{dueDate}</div>
      <div className="absolute top-[310px] left-[20px]">{rib}</div>
      <div className="absolute top-[310px] left-[530px]">{bankName}</div>
      <div className="absolute top-[373px] left-[183px]">{aval}</div>

      <div className="absolute top-[330px] left-[350px] w-[150px] break-words whitespace-pre-wrap">
  {companyName}
</div>

      {/* Bouton imprimer */}
      <div className="absolute bottom-[20px] right-[40px]">
        <button onClick={() => window.print()} className="px-4 py-2 bg-blue-600 text-white rounded">
          Imprimer
        </button>
      </div>
    </div>
  )
}



/* //pages/print.tsx
'use client'

import LetterPrint from '../components/LettrePrint'
import { useEffect } from 'react'
import { useSearchParams } from 'next/navigation'

export default function PrintPage() {
  const params = useSearchParams()!

  const form = {
    echeance: params.get('echeance') || '',
    rib1: params.get('rib1') || '',
    rib2: params.get('rib2') || '',
    rib3: params.get('rib3') || '',
    rib4: params.get('rib4') || '',
    montant: params.get('montant') || '',
    millimes: params.get('millimes') || '',
    beneficiaire: params.get('beneficiaire') || '',
    montantLettre: params.get('montantLettre') || '',
  }

  const company = {
    name: params.get('
    ame') || '',
    address: params.get('companyAddress') || '',
    aval: params.get('companyAval') || '',
    lieu: params.get('companyLieu') || '',
  }

  const bankName = params.get('bankName') || ''
  const dateCreation = params.get('dateCreation') || ''

  useEffect(() => {
    setTimeout(() => {
      window.print()
    }, 500)
  }, [])

  return <LetterPrint form={form} bankName={bankName} dateCreation={dateCreation} company={company} />
}
 */
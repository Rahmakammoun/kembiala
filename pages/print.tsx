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
   
      <div className="absolute top-[70px] right-[489px]">{dueDate}</div>

    
      <div className="absolute top-[70px] right-[320px]">{creationDate}</div>
      <div className="absolute top-[50px] right-[320px]">{lieu}</div>

      
   
      <div className="absolute top-[120px] left-[200px] tracking-wider">{rib}</div>


      <div className="absolute top-[120px] right-[100px]">{amount} DT</div>

   
      <div className="absolute top-[185px] left-[230px] font-bold">{customer}</div>

      <div className="absolute top-[185px] right-[100px]">{amount} DT</div>

      
      <div className="absolute top-[225px] left-[30px] capitalize">{amountLettre}</div>

  
      <div className="absolute top-[267px] left-[30px]">{lieu}</div>
      <div className="absolute top-[267px] left-[155px]">{creationDate}</div>
      <div className="absolute top-[267px] left-[275px]">{dueDate}</div>
      <div className="absolute top-[310px] left-[20px]">{rib}</div>
      <div className="absolute top-[310px] left-[530px]">{bankName}</div>
      <div className="absolute top-[373px] left-[183px]">{aval}</div>

      <div className="absolute top-[330px] left-[350px] w-[150px] break-words whitespace-pre-wrap">
  {companyName}
</div>

    
      <div className="absolute bottom-[20px] right-[40px]">
        <button onClick={() => window.print()} className="px-4 py-2 bg-blue-600 text-white rounded">
          Imprimer
        </button>
      </div>
    </div>
  )
}


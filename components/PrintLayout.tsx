// components/PrintLayout.tsx
import React from 'react'

export default function PrintLayout({
  companyName,
  lieu,
  creationDate,
  dueDate,
  rib,
  amount,
  customer,
  amountLettre,
  bankName,
  aval,
  address
}: {
  companyName: string
  lieu: string
  creationDate: string
  dueDate: string
  rib: string
  amount: string
  customer: string
  amountLettre: string
  bankName: string
  aval: string
  address: string
}) {
  return (
    <div id="printable" className="relative w-[800px] h-[1000px] mx-auto mt-10 border bg-white text-black font-sans">
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
      <div className="absolute top-[2670px] left-[30px]">{lieu}</div>
      <div className="absolute top-[267px] left-[155px]">{creationDate}</div>
      <div className="absolute top-[267px] left-[275px]">{dueDate}</div>
      <div className="absolute top-[310px] left-[20px]">{rib}</div>
      <div className="absolute top-[310px] left-[530px]">{bankName}</div>
      <div className="absolute top-[3730px] left-[183px]">{aval}</div>
      <div className="absolute top-[330px] left-[350px] w-[150px] break-words whitespace-pre-wrap">
        {companyName}
      </div>
    </div>
    </div>
  )
}

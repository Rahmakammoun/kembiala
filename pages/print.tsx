//pages/print.tsx
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
    name: params.get('companyName') || '',
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

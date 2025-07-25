// components/LettrePrint.tsx
'use client'

interface PrintProps {
  form: {
    echeance: string
    rib1: string
    rib2: string
    rib3: string
    rib4: string
    montant: string
    millimes: string
    beneficiaire: string
    montantLettre: string
  }
  bankName: string
  dateCreation: string
  company: {
    name: string
    address: string
    aval: string
    lieu: string
  }
}

export default function LetterPrint({ form, bankName, dateCreation, company }: PrintProps) {
  const debug = false 

  const style = (top: string, left: string, fontSize = '10pt') => ({
    position: 'absolute' as const,
    top,
    left,
    fontSize,
    whiteSpace: 'nowrap' as const,
    border: debug ? '1px dashed red' : 'none',
    padding: '1px',
  })

  return (
    <div
      style={{
        width: '21cm',
        height: '18.5cm',
        position: 'relative',
        padding: 0,
        margin: 0,
        fontFamily: 'serif',
        
        backgroundImage: "url('/images/lettre_fond.png')", 
        backgroundSize: '100% 100%',
        backgroundRepeat: 'no-repeat',
      }}
    >
        <div style={style('1.8cm', '15.4cm')}>{company.lieu}</div>
      <div style={style('2.25cm', '15.4cm')}>{dateCreation}</div>
      <div style={style('3.75cm', '15.4cm')}>{form.echeance}</div>
      <div style={style('4.35cm', '15.4cm')}>{form.montant} DT {form.millimes} m</div>
      <div style={style('5.45cm', '4.7cm')}>{form.montantLettre}</div>
      <div style={style('6.45cm', '4.7cm')}>{form.rib1} {form.rib2} {form.rib3} {form.rib4}</div>
      <div style={style('7.45cm', '4.7cm')}>{form.beneficiaire}</div>
      <div style={style('8.55cm', '4.7cm')}>{company.name}</div>
      <div style={style('9.35cm', '4.7cm')}>{company.address}</div>
      <div style={style('10.55cm', '4.7cm')}>{company.lieu}</div>
      <div style={style('11.55cm', '4.7cm')}>{company.aval}</div>
      <div style={style('12.65cm', '4.7cm')}>{bankName}</div>
    </div>
  )
}

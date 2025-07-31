// app/api/bank/create/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { amount, millimes, dueDate, customerName,companyName, aval, lieu, bankName } = body

    if (!amount || !dueDate || !customerName || !bankName) {
      return NextResponse.json({ message: 'Champs manquants' }, { status: 400 })
    }

    // Rechercher le client
    const nom = customerName.trim()

    const customer = await prisma.customer.findFirst({
      where: {
        nom,
       
      }
    })

    if (!customer) {
      return NextResponse.json({ message: 'Client introuvable' }, { status: 404 })
    }

    // Rechercher la banque
    const bank = await prisma.bank.findFirst({
      where: {
        bankName
      }
    })

    if (!bank) {
      return NextResponse.json({ message: 'Banque introuvable' }, { status: 404 })
    }

    const totalAmount = parseFloat(amount) + parseFloat(millimes || '0') / 1000

    // Créer la facture
    const bill = await prisma.bill.create({
      data: {
        amount: totalAmount,
        dueDate: new Date(dueDate),
        status: 'non_payé',
        companyName,
        aval,
        lieu,
        customerId: customer.id,
        bankId: bank.id,
      }
    })

    return NextResponse.json({ bill }, { status: 201 })

  } catch (error) {
    console.error('[POST /api/bills/create]', error)
    return NextResponse.json({ message: 'Erreur serveur' }, { status: 500 })
  }
}

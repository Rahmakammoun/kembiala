// app/api/bills/update/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient, BillStatus } from '@prisma/client'

const prisma = new PrismaClient()

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json()
    const { id, amount, dueDate, status,creationDate, customerId, bankId } = body

    console.log('Données reçues pour update:', body)

    if (
      typeof id !== 'number' ||
      typeof amount !== 'number' ||
      typeof dueDate !== 'string' ||
      typeof creationDate !== 'string' ||
      typeof status !== 'string' ||
      typeof customerId !== 'number' ||
      typeof bankId !== 'number'
    ) {
      return NextResponse.json({ error: 'Champs invalides ou manquants', received: body }, { status: 400 })
    }

    const updatedBill = await prisma.bill.update({
      where: { id },
      data: {
  amount,
  dueDate: new Date(dueDate),
  creationDate: new Date(creationDate), // 👈 Ajout ici
  status: status as BillStatus,
  customer: { connect: { id: customerId } },
  bank: { connect: { id: bankId } },
}
    })

    return NextResponse.json(updatedBill, { status: 200 })
  } catch (error) {
    console.error('Erreur lors de la mise à jour de la facture:', error)
    return NextResponse.json({ error: 'Erreur interne du serveur' }, { status: 500 })
  }
}

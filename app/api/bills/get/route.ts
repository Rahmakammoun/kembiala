// app/api/bills/get/route.ts
import { PrismaClient } from '@prisma/client'
import { NextResponse } from 'next/server'
const prisma = new PrismaClient()
export async function GET() {
  try {
    const bills = await prisma.bill.findMany({
      include: {
        customer: true,
        bank: true,
      },
      orderBy: {
        creationDate: 'desc',
      },
    })

    const formatted = bills.map(bill => ({
      id: bill.id,
      clientName: `${bill.customer.nom} ${bill.customer.prenom}`,
      amount: bill.amount,
      dueDate: bill.dueDate.toISOString().split('T')[0],
      status: bill.status,
      creationDate: bill.creationDate.toISOString(),
      bankAgency: bill.bank.bankName,
       customerId: bill.customer.id,
        bankId: bill.bank.id,
    }))

    return NextResponse.json(formatted)
  } catch (error) {
    console.error('[GET /api/bills]', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

// app/api/bank/update/route.ts
import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function PUT(req: Request) {
  try {
    const { id, bankName, rib } = await req.json()

    if (!id || !bankName || !rib) {
      return NextResponse.json({ error: 'Champs requis manquants' }, { status: 400 })
    }

    const updatedBank = await prisma.bank.update({
      where: { id },
      data: {
        bankName,
        rib,
      },
    })

    return NextResponse.json(updatedBank)
  } catch (error) {
    console.error('Erreur update bank:', error)
    return NextResponse.json({ error: 'Erreur serveur lors de la mise à jour' }, { status: 500 })
  }
}

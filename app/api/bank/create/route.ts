// app/api/bank/create/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function POST(req: NextRequest) {
  const { bankName, rib, companyId } = await req.json()

  if (!bankName || !rib || !companyId) {
    return NextResponse.json({ error: 'Champs manquants' }, { status: 400 })
  }

  try {
    const bank = await prisma.bank.create({
      data: { bankName, rib, companyId },
    })

    return NextResponse.json({ bank }, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

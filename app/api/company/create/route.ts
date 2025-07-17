// app/api/company/create/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function POST(req: NextRequest) {
  const { name, address, lieu, aval } = await req.json()

  if (!name || !address || !lieu || !aval) {
    return NextResponse.json({ error: 'Tous les champs sont requis' }, { status: 400 })
  }

  try {
    const existing = await prisma.company.findFirst()
    if (existing) {
      return NextResponse.json({ error: 'Une société existe déjà.' }, { status: 400 })
    }

    const company = await prisma.company.create({
      data: { name, address, lieu, aval },
    })

    return NextResponse.json({ company })
  } catch (error) {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

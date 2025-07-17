// app/api/company/update/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function PUT(req: NextRequest) {
  const { id, name, address, lieu, aval } = await req.json()

  if (id === undefined  || !name || !address || !lieu || !aval) {
    return NextResponse.json({ error: 'Champs manquants' }, { status: 400 })
  }

  try {
    const company = await prisma.company.update({
      where: { id: Number(id) },
      data: { name, address, lieu, aval },
    })

    return NextResponse.json({ company })
  } catch (error) {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

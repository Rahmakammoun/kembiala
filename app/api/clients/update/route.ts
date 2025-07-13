// app/api/clients/update/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function PUT(req: NextRequest) {
  try {
    const { id, nom, prenom, email } = await req.json()

    if (!id || !nom || !prenom || !email) {
      return NextResponse.json({ error: 'Champs manquants' }, { status: 400 })
    }

    const updated = await prisma.customer.update({
      where: { id: Number(id) },
      data: { nom, prenom, email },
    })

    return NextResponse.json({ customer: updated })
  } catch (error) {
    console.error('Erreur update:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

// app/api/users/create/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { nom,  email } = body

  if (!nom  || !email) {
    return NextResponse.json({ error: 'Tous les champs sont requis' }, { status: 400 })
  }

  try {
    const newCustomer = await prisma.customer.create({
      data: {
        nom,
        email,
      },
    })

    return NextResponse.json({ customer: newCustomer }, { status: 201 })
  } catch (error: any) {
    if (error.code === 'P2002') {
      return NextResponse.json({ error: 'Email déjà utilisé' }, { status: 400 })
    }

    return NextResponse.json({ error: 'Erreur lors de la création' }, { status: 500 })
  }
}

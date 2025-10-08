
import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()
export async function GET() {
  try {
    const company = await prisma.company.findFirst({
      include: {
        banks: true,  
      },
    })
    return NextResponse.json({ company }) 
  } catch (error) {
    return NextResponse.json({ error: 'Erreur lors de la récupération de la société' }, { status: 500 })
  }
}

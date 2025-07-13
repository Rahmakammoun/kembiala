
// app/api/users/list/route.ts
import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET() {
  const customers = await prisma.customer.findMany({
    select: { id: true, nom:true,prenom:true, email: true,createdAt : true },
  })

  return NextResponse.json({ customers })
}
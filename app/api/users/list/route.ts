
// app/api/users/list/route.ts
import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET() {
  const users = await prisma.user.findMany({
    select: { id: true, email: true, role: true },
  })

  return NextResponse.json({ users })
}
import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET() {
  const banks = await prisma.bank.findMany()
  return NextResponse.json({ banks })
}

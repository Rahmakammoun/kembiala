// app/api/users/delete/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { getToken } from 'next-auth/jwt'

const prisma = new PrismaClient()

export async function DELETE(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET,cookieName: 'next-auth.session-token', }) 
    console.log(" TOKEN :", token)
  if (!token || token.role !== 'admin') {
    return NextResponse.json({ error: 'Non autorisé (pas de token ou mauvais rôle)' }, { status: 401 })
  }

  const body = await req.json()
  const { id } = body

  try {
    await prisma.user.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Erreur lors de la suppression' }, { status: 500 })
  }
}
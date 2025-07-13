import { NextRequest, NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'
import { sendPasswordEmail } from '@/lib/mail' // ← adapte le chemin

const prisma = new PrismaClient()

function generatePassword(length = 10) {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$_-'
  return Array.from({ length }, () => chars[Math.floor(Math.random() * chars.length)]).join('')
}

export async function POST(req: NextRequest) {
  const token = await getToken({ req })

  if (!token || token.role !== 'admin') {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  }

  const body = await req.json()
  const { email } = body

  if (!email) {
    return NextResponse.json({ error: 'Email requis' }, { status: 400 })
  }

  const existingUser = await prisma.user.findUnique({ where: { email } })
  if (existingUser) {
    return NextResponse.json({ error: 'Utilisateur existe déjà' }, { status: 400 })
  }

  const plainPassword = generatePassword()
  const hashedPassword = await bcrypt.hash(plainPassword, 10)

  try {
    const newUser = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        role: 'user',
      },
    })

    // 📩 Envoi de l'e-mail
    await sendPasswordEmail(email, plainPassword)

    return NextResponse.json({ message: 'Utilisateur créé et e-mail envoyé' })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Erreur lors de la création' }, { status: 500 })
  }
}
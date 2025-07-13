// app/api/users/change-password.ts
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/app/api/auth/[...nextauth]/authOptions'
import { PrismaClient } from '@prisma/client'
import { compare, hash } from 'bcryptjs'

const prisma = new PrismaClient()

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)

  if (!session || !session.user) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  }

  const { currentPassword, newPassword } = await req.json()

  try {
    const user = await prisma.user.findUnique({
      where: { email: session.user.email! },
    })

    if (!user || !user.password) {
      return NextResponse.json({ error: 'Utilisateur non trouvé' }, { status: 404 })
    }

    const isMatch = await compare(currentPassword, user.password)
    if (!isMatch) {
      return NextResponse.json({ error: 'Mot de passe actuel incorrect' }, { status: 400 })
    }

    const hashedPassword = await hash(newPassword, 10)

    await prisma.user.update({
      where: { email: session.user.email! },
      data: { password: hashedPassword },
    })

    return NextResponse.json({ message: 'Mot de passe modifié avec succès' })
  } catch (err) {
    console.error('Erreur de modification de mot de passe', err)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

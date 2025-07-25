import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function DELETE(req: NextRequest) {
  const { searchParams } = req.nextUrl
  const id = searchParams.get('id')

  if (!id || isNaN(Number(id))) {
    return NextResponse.json({ error: 'ID invalide' }, { status: 400 })
  }

  try {
    await prisma.bill.delete({
      where: { id: Number(id) },
    })

    return NextResponse.json({ message: 'Facture supprimée avec succès' }, { status: 200 })
  } catch (error) {
    console.error('Erreur suppression bill :', error)
    return NextResponse.json({ error: 'Erreur lors de la suppression' }, { status: 500 })
  }
}

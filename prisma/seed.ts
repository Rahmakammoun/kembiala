const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function main() {
  const users = [
    {
      email: 'admin@example.com',
      password: 'admin123',
      role: 'admin',
    },
    {
      email: 'user@example.com',
      password: 'user123',
      role: 'user',
    },
    {
      email: 'driver@example.com',
      password: 'driver123',
      role: 'driver',
    },
  ]

  for (const user of users) {
    const existing = await prisma.user.findUnique({
      where: { email: user.email },
    })

    if (existing) {
      console.log(`🔁 Utilisateur déjà existant : ${user.email}`)
      continue
    }

    const hashedPassword = await bcrypt.hash(user.password, 10)

    await prisma.user.create({
      data: {
        email: user.email,
        password: hashedPassword,
        role: user.role,
      },
    })

    console.log(`✅ Utilisateur créé : ${user.email}`)
  }
}

main()
  .catch(e => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
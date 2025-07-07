import { getSession, GetSessionParams } from 'next-auth/react'
import { GetServerSideProps } from 'next'

// Correction 1 : typage de context
export const getServerSideProps: GetServerSideProps = async (context) => {
  const session = await getSession(context as GetSessionParams)

  if (!session) {
    return {
      redirect: {
        destination: '/auth/login',
        permanent: false,
      },
    }
  }

  return {
    props: { session },
  }
}

// Correction 2 : ajouter le composant React exporté par défaut
type DashboardProps = {
  session: {
    user: {
      email: string
      name?: string
      id?: string
      role?: string
    }
  }
}

export default function Dashboard({ session }: DashboardProps) {
  return <div>Bienvenue, {session.user.email}</div>
}
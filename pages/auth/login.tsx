import { signIn } from 'next-auth/react'
import { useEffect,useState } from 'react'
import { useRouter } from 'next/router'
import { useSession } from 'next-auth/react'
import "../../app/globals.css";
import { getSession } from "next-auth/react"
import { GetServerSideProps } from "next"

export const getServerSideProps: GetServerSideProps = async (context) => {
  const session = await getSession(context)

  if (session) {
    return {
      redirect: {
        destination: "/dashboard",
        permanent: false,
      },
    }
  }

  return {
    props: {},
  }
}
export default function Login() {
  const { data: session, status } = useSession()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const router = useRouter()

  useEffect(() => {
    if (status === 'authenticated') {
      router.replace('/dashboard')
    }
  }, [status])
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const res = await signIn('credentials', {
      redirect: false,
      email,
      password,
      callbackUrl: '/dashboard',
    })

    if (res?.error) {
      setError(res.error)
      console.error('❌ Erreur de connexion :', res.error)
    } else if (res?.ok && res.url) {
      console.log('✅ Connexion réussie ! Redirection vers', res.url)
      router.push(res.url)
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-white">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-xl p-8 bg-white rounded-xl shadow-lg border border-gray-200"
      >
        <h1 className="text-2xl font-bold text-center text-black mb-6">Connexion</h1>

        <div className="mb-4">
          <label htmlFor="email" className="block text-sm font-medium text-black mb-1">
            Adresse email
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="Entrer email"
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 placeholder-gray-600 text-gray-900" />
        </div>

        <div className="mb-6">
          <label htmlFor="password" className="block text-sm font-medium text-black mb-1">
            Mot de passe
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="Mot de passe"
            required
            className="w-full px-4 py-2 border border-gray-900 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 placeholder-gray-600 text-gray-900"
          />
        </div>

        {error && (
          <p className="text-sm text-center text-red-500 mb-4">
            {error}
          </p>
        )}

        <button
          type="submit"
          className="w-full py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700 transition"
        >
          Se Connecter
        </button>
      </form>
    </div>
  )
}

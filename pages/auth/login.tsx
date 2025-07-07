import { signIn } from 'next-auth/react'
import { useState } from 'react'
import { useRouter } from 'next/router'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const router = useRouter()

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
      router.push(res.url) // redirection manuelle
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-md mx-auto mt-10">
      <h1 className="text-xl font-bold mb-4">Connexion</h1>
      <input
        type="email"
        value={email}
        onChange={e => setEmail(e.target.value)}
        placeholder="Email"
        required
      />
      <input
        type="password"
        value={password}
        onChange={e => setPassword(e.target.value)}
        placeholder="Mot de passe"
        required
      />
      {error && <p className="text-red-500">{error}</p>}
      <button type="submit">Se connecter</button>
    </form>
  )
}

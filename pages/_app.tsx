// pages/_app.tsx
import { SessionProvider } from 'next-auth/react'
import type { AppProps } from 'next/app'
import '../app/globals.css' // adapte le chemin si nécessaire

export default function MyApp({ Component, pageProps: { session, ...pageProps } }: AppProps) {
  return (
    <SessionProvider session={session}>
      <Component {...pageProps} />
    </SessionProvider>
  )
}
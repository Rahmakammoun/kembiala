'use client'

import { useState } from 'react'
import { FaBars, FaPlus, FaTimes } from 'react-icons/fa'
import { usePathname, useRouter } from 'next/navigation'
import clsx from 'clsx'

export default function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)

  const isActive = (path: string) => pathname === path

  const handleNavigation = (path: string) => {
    router.push(path)
    setIsOpen(false)
  }

  return (
    <>
      {/* Burger button - only show when sidebar is closed on small screens */}
      {!isOpen && (
        <button
          className="md:hidden fixed top-4 left-4 z-50 bg-blue-800 text-white p-2 rounded"
          onClick={() => setIsOpen(true)}
        >
          <FaBars />
        </button>
      )}

      {/* Sidebar */}
      <aside
        className={clsx(
          'bg-blue-900 text-white flex flex-col p-4 transition-transform z-40',
          'fixed top-0 left-0 h-full w-64',
          'md:static md:h-auto md:translate-x-0 md:block',
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {/* Header section with title and close button (only on mobile) */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold">Kembiala</h2>
          <button
            onClick={() => setIsOpen(false)}
            className="md:hidden text-white"
          >
            <FaTimes />
          </button>
        </div>

        <nav className="space-y-2">
          <button
            onClick={() => handleNavigation('/dashboard')}
            className={clsx(
              'flex items-center gap-2 px-3 py-2 rounded w-full',
              isActive('/dashboard') ? 'bg-blue-600' : 'hover:bg-blue-800'
            )}
          >
            <FaPlus /> Utilisateurs
          </button>

          <button
            onClick={() => handleNavigation('/client')}
            className={clsx(
              'flex items-center gap-2 px-3 py-2 rounded w-full',
              isActive('/client') ? 'bg-blue-600' : 'hover:bg-blue-800'
            )}
          >
            <FaPlus /> Clients
          </button>
        </nav>
      </aside>
    </>
  )
}

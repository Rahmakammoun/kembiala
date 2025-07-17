'use client'

import { FaBars, FaPlus, FaTimes } from 'react-icons/fa'
import { usePathname, useRouter } from 'next/navigation'
import clsx from 'clsx'

interface SidebarProps {
  isOpen: boolean
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>
}

export default function Sidebar({ isOpen, setIsOpen }: SidebarProps) {
  const pathname = usePathname()
  const router = useRouter()

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
          'bg-blue-900 text-white flex flex-col p-4 fixed top-0 left-0 h-screen w-64 z-40 transition-transform duration-300',
          isOpen ? 'translate-x-0' : '-translate-x-full',
          'md:translate-x-0'
        )}
      >
        {/* Header section with title and close button (only on mobile) */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold">Kembiala</h2>
          <button onClick={() => setIsOpen(false)} className="md:hidden text-white">
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

          <button
            onClick={() => handleNavigation('/company')}
            className={clsx(
              'flex items-center gap-2 px-3 py-2 rounded w-full',
              isActive('/company') ? 'bg-blue-600' : 'hover:bg-blue-800'
            )}
          >
            <FaPlus /> Info Personnelles
          </button>

          <button
            onClick={() => handleNavigation('/document')}
            className={clsx(
              'flex items-center gap-2 px-3 py-2 rounded w-full',
              isActive('/document') ? 'bg-blue-600' : 'hover:bg-blue-800'
            )}
          >
            <FaPlus /> Document
          </button>
        </nav>
      </aside>
    </>
  )
}

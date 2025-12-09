'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import LoginHeader from './_components/LoginHeader'
import LoginForm from './_components/LoginForm'
import LoginFooter from './_components/LoginFooter'

export default function LoginPage() {
  const [isExiting, setIsExiting] = useState(false)

  return (
    <motion.div
      className="w-full text-center space-y-8  bg-dark"
      animate={isExiting ? { opacity: 0, scale: 0.95 } : { opacity: 1, scale: 1 }}
      transition={{ duration: 0.6 }}
    >
      <main className="flex-1 flex items-center justify-center">
        <div className="w-full max-w-md mx-auto max-h-[900px] flex flex-col justify-center space-y-6">
          <LoginHeader />

          <div className="w-full space-y-2">
            <LoginForm onExitStart={() => setIsExiting(true)} />
            <LoginFooter />
          </div>
        </div>
      </main>
    </motion.div>
  )
}
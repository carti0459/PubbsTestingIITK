import { Metadata } from 'next'
import Image from 'next/image'

export const metadata: Metadata = {
  title: 'Auth - Pubbs',
  description: 'Authentication pages for Pubbs application',
}

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="h-screen bg-dark overflow-hidden">
      <div className="flex lg:hidden h-screen items-center justify-center p-4 overflow-y-auto">
        <div className="w-full max-w-md">
          {children}
        </div>
      </div>

      <div className="hidden lg:flex h-screen">
        <div className="w-1/2 relative bg-gradient-to-br from-gray-900 via-black to-gray-900 overflow-hidden">
          <div className="absolute inset-0 flex flex-col items-center justify-center p-12 text-center">
            <div className="mb-12">
              <Image
                src="/assets/logo.svg"
                alt="Pubbs Logo"
                width={300}
                height={120}
                className="mx-auto"
                priority
              />
            </div>
            
            <div className="max-w-lg space-y-6">
              <p className="text-white text-lg leading-relaxed">
                We provide technology and platform for Bicycle Sharing System and IoT devices under one roof.
              </p>
              
              <p className="text-orange-400 text-lg font-medium">
                #MakeInIndiaInitiative
              </p>
              
              <div className="mt-8 flex flex-wrap justify-center gap-2 text-sm text-orange-300">
                <span>Smart Bicycle Locks</span>
                <span>•</span>
                <span>Personal Mobility</span>
                <span>•</span>
                <span>Bicycle Sharing System & Infrastructure</span>
              </div>
            </div>
          </div>
          
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-900/10 to-transparent"></div>
        </div>

        <div className="w-1/2 bg-dark h-screen">
          <div className="h-full flex items-center justify-center">
            <div className="w-full h-full flex items-center justify-center md:p-6">
              <div className="w-full max-h-full overflow-y-auto scrollbar-hide">
                {children}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

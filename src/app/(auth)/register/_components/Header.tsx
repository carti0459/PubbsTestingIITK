import Image from "next/image";

export default function Header() {
  return (
    <header className="w-full px-4 py-4">
      <>
            {/* Logo - Larger size */}
            <div className="mb-8">
              <Image
                src="/assets/logo.svg"
                alt="Pubbs Logo"
                width={100}
                height={100}
                className="mx-auto"
                priority
              />
            </div>
      
            {/* Welcome Section - Separate from form */}
            <div className="space-y-2 text-center">
              <h1 className="text-white text-2xl font-semibold">
                Welcome
              </h1>
              <p className="text-label text-sm">
                Create an account to get started.
              </p>
            </div>
          </>
    </header>
  )
}

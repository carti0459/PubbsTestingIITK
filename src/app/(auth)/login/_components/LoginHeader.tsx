import Image from 'next/image'

export default function LoginHeader() {
  return (
    <>
      {/* Logo - Larger size */}
      <div className="mb-4">
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
      <div className="space-y-2 mb-8">
        <h1 className="text-white text-2xl font-semibold">
          Welcome
        </h1>
        <p className="text-label text-sm">
          Please log in to continue.
        </p>
      </div>
    </>
  )
}

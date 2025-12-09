import Image from "next/image";

export default function Header() {
  return (
    <header className="w-full px-4 py-4 mb-4">
      <>
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
      
            <div className="space-y-1 text-center">
              <p className="text-label text-sm">
                OTP Verification
              </p>
            </div>
          </>
    </header>
  )
}

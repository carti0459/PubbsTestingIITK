import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function LoginFooter() {
  return (
    <div className="mt-8 space-y-6">
      {/* Divider */}
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-label/30" />
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-4 bg-dark text-label">New User?</span>
        </div>
      </div>

      {/* New User Section */}
      <div>
        <Link href="/register">
          <Button
            variant="outline"
            className="w-full border-2 border-blue text-blue hover:bg-blue hover:text-white font-semibold py-6 px-8 text-lg rounded-lg transition-colors duration-200 bg-transparent"
          >
            Register Now
          </Button>
        </Link>
      </div>
    </div>
  )
}

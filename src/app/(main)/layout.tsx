import { Metadata } from "next";
import Image from "next/image";
import MobileHeader from "@/components/mobile/MobileHeader";

export const metadata: Metadata = {
  title: "Dashboard - Pubbs",
  description: "Main application dashboard",
};

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="flex flex-col min-h-screen">
        <header className="md:hidden block bg-dark border-b border-gray-700 px-4 py-3 sticky top-0 z-50">
          <div className="flex items-center justify-between">

            <MobileHeader>
              <button className="p-2 text-white hover:bg-gray-700 rounded-md">
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              </button>
            </MobileHeader>

            <div className="flex items-center">
              <Image
                src="/assets/logo.svg"
                alt="Pubbs Logo"
                height={32}
                width={32}
                className="h-8 w-auto"
              />
            </div>
            
          </div>
        </header>

        <main className="flex-1 overflow-y-auto">
          <div className="w-full max-w-full">{children}</div>
        </main>
      </div>
    </div>
  );
}

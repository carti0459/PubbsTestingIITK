"use client";

import { useRouter } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function Home() {
  const router = useRouter();

  const handleLogin = () => {
    router.push("/login");
  };

  const handleRegister = () => {
    router.push("/register");
  };

  return (
    <div className="min-h-screen bg-dark">
      <div className="md:hidden min-h-screen flex flex-col">
        <div className="flex-1 flex flex-col items-center justify-center px-6 py-8 text-center">
          <div className="mb-8">
            <Image
              src="/assets/logo.svg"
              alt="Pubbs Logo"
              width={120}
              height={120}
              className="mx-auto"
              priority
            />
          </div>

          <div className="mb-12 space-y-2">
            <div className="mb-4">
              <h1 className="text-white text-[28px] font-bold leading-[34px] tracking-[-0.01em]">
                Welcome to <span className="text-blue">Pubbs</span>
              </h1>
              <h2 className="text-blue text-3xl font-semibold leading-[34px] tracking-[-0.01em]">
                Quick Booking
              </h2>
            </div>
            <p className="text-grey text-sm leading-relaxed max-w-sm mx-auto">
              We are dedicated to provide you with the best Public Bicycle
              Sharing system.
            </p>
          </div>

          <div className="w-full max-w-sm space-y-4">
            <Button
              onClick={handleLogin}
              className="w-full bg-blue hover:bg-[#16a5c8] text-white font-semibold py-6 px-8 text-lg rounded-sm transition-colors duration-200"
            >
              Log In
            </Button>

            <Button
              onClick={handleRegister}
              variant="outline"
              className="w-full border-2 border-blue text-blue hover:bg-blue hover:text-white font-semibold py-6 px-8 text-lg rounded-sm transition-colors duration-200 bg-transparent"
            >
              Register Now
            </Button>
          </div>
        </div>

        <div className="py-6">
          <div className="text-center">
            <p className="text-grey text-sm">
              © 2025 Pubbs. All rights reserved.
            </p>
          </div>
        </div>
      </div>

      <div className="hidden md:block min-h-screen relative overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src="https://images.unsplash.com/photo-1571068316344-75bc76f77890?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80"
            alt="Bicycle Sharing in Modern City"
            fill
            className="object-cover"
            priority
          />

          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/60 to-black/40"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent"></div>
        </div>

        <div className="relative z-10 min-h-screen flex">
          <div className="w-3/5 flex flex-col justify-center px-12 lg:px-20">
            <div className="mb-8 mt-4">
              <Image
                src="/assets/logo.svg"
                alt="Pubbs Logo"
                width={200}
                height={80}
                className="filter brightness-110"
                priority
              />
            </div>

            <div className="space-y-4 max-w-2xl">
              <div className="space-y-3">
                <h1 className="text-4xl lg:text-5xl xl:text-6xl font-bold text-white leading-tight">
                  Welcome to
                  <span className="block text-cyan-400">Pubbs</span>
                </h1>
                <Badge className="bg-cyan-500 hover:bg-cyan-600 text-white md:text-xs lg:text-md rounded-3xl">
                  Quick Booking
                </Badge>
                <p className="lg:text-lg text-md  text-blue-100 leading-relaxed max-w-xl">
                  We are dedicated to provide you with the best Public Bicycle
                  Sharing system.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 md:gap-3 mt-4 md:mt-6">
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 md:p-4 border border-white/20">
                  <div className="w-8 h-8 md:w-10 md:h-10 bg-cyan-500 rounded-lg flex items-center justify-center mb-2 md:mb-3">
                    <svg
                      className="w-5 h-5 md:w-6 md:h-6 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 10V3L4 14h7v7l9-11h-7z"
                      />
                    </svg>
                  </div>
                  <h3 className="text-white font-semibold text-xs md:text-sm mb-1">
                    Instant Booking
                  </h3>
                  <p className="text-blue-200 text-xs">
                    Book your bicycle in seconds
                  </p>
                </div>

                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 md:p-4 border border-white/20">
                  <div className="w-8 h-8 md:w-10 md:h-10 bg-green-500 rounded-lg flex items-center justify-center mb-2 md:mb-3">
                    <svg
                      className="w-5 h-5 md:w-6 md:h-6 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                  </div>
                  <h3 className="text-white font-semibold text-xs md:text-sm mb-1">
                    Wide Network
                  </h3>
                  <p className="text-blue-200 text-xs">
                    1000+ stations across the city
                  </p>
                </div>

                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 md:p-4 border border-white/20">
                  <div className="w-8 h-8 md:w-10 md:h-10 bg-orange-500 rounded-lg flex items-center justify-center mb-2 md:mb-3">
                    <svg
                      className="w-5 h-5 md:w-6 md:h-6 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
                      />
                    </svg>
                  </div>
                  <h3 className="text-white font-semibold text-xs md:text-sm mb-1">
                    Affordable
                  </h3>
                  <p className="text-blue-200 text-xs">
                    Best rates for urban mobility
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-4 md:space-x-6 mt-4 md:mt-6">
                <div className="text-center">
                  <div className="text-xl md:text-2xl font-bold text-cyan-400">
                    50K+
                  </div>
                  <div className="text-blue-200 text-xs">Happy Users</div>
                </div>
                <div className="text-center">
                  <div className="text-xl md:text-2xl font-bold text-green-400">
                    1000+
                  </div>
                  <div className="text-blue-200 text-xs">Stations</div>
                </div>
                <div className="text-center">
                  <div className="text-xl md:text-2xl font-bold text-orange-400">
                    24/7
                  </div>
                  <div className="text-blue-200 text-xs">Available</div>
                </div>
              </div>
            </div>
          </div>

          <div className="w-2/5 flex items-center justify-center">
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 lg:p-12 border border-white/20 shadow-2xl max-w-md w-full mx-8">
              <div className="text-center space-y-8">
                <div className="space-y-2">
                  <h3 className="text-2xl lg:text-3xl font-bold text-white">
                    Get Started
                  </h3>
                  <p className="text-blue-200">
                    Join thousands of riders today
                  </p>
                </div>

                <div className="space-y-4">
                  <Button
                    onClick={handleLogin}
                    className="w-full bg-cyan-500 hover:bg-cyan-600 text-white font-semibold py-4 px-8 text-lg rounded-xl transition-all duration-200 transform hover:scale-105"
                  >
                    Log In
                  </Button>

                  <Button
                    onClick={handleRegister}
                    variant="outline"
                    className="w-full border-2 border-cyan-400 text-cyan-400 hover:bg-cyan-400 hover:text-gray-900 font-semibold py-4 px-8 text-lg rounded-xl transition-all duration-200 transform hover:scale-105 bg-transparent"
                  >
                    Register Now
                  </Button>
                </div>

                <div className="pt-6 border-t border-white/20">
                  <div className="flex items-center justify-center space-x-4 text-sm text-blue-200">
                    <div className="flex items-center space-x-1">
                      <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                      <span>Secure</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <div className="w-2 h-2 bg-cyan-400 rounded-full"></div>
                      <span>Fast</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <div className="w-2 h-2 bg-orange-400 rounded-full"></div>
                      <span>Reliable</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className=" bg-black/30 backdrop-blur-sm border-t border-white/10">
          <div className="py-3 md:py-4 px-6 md:px-12">
            <div className="flex flex-col md:flex-row justify-between items-center space-y-2 md:space-y-0">
              <p className="text-blue-200 text-xs md:text-sm text-center md:text-left">
                © 2025 Pubbs. All rights reserved.
              </p>
              <div className="text-orange-400 text-xs md:text-sm font-medium">
                #MakeInIndiaInitiative
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

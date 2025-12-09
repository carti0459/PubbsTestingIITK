'use client'

import React, { useState } from 'react'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { useOperator, OPERATORS, OperatorType } from '@/contexts/OperatorContext'
import { ChevronDown, Building2, TestTube, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

interface OperatorSelectionProps {
  isVisible: boolean
}

const OperatorSelection: React.FC<OperatorSelectionProps> = ({ isVisible }) => {
  const { setSelectedOperator } = useOperator()
  const router = useRouter()
  const [selectedValue, setSelectedValue] = useState<OperatorType | ''>('')
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleOperatorSelect = (operatorId: OperatorType) => {
    setSelectedValue(operatorId)
    setIsDropdownOpen(false)
  }

  const handleContinue = async () => {
    if (selectedValue && !isLoading) {
      setIsLoading(true)
      
      try {
        // Show loading toast
        const loadingToast = toast.loading('Setting up your workspace...', {
          duration: Infinity
        })
        
        // Simulate some processing time
        await new Promise(resolve => setTimeout(resolve, 2000))
        
        // Set the operator
        setSelectedOperator(selectedValue)
        
        // Dismiss loading toast and show success
        toast.dismiss(loadingToast)
        toast.success('Operator selected successfully!', {
          duration: 3000
        })
        
        // Small delay before navigation for better UX
        setTimeout(() => {
          router.push('/minDashboard')
        }, 1000)
        
      } catch (error) {
        console.error('Error selecting operator:', error)
        toast.error('Failed to select operator. Please try again.', {
          duration: 4000
        })
        setIsLoading(false)
      }
    } else if (!selectedValue) {
      toast.error('Please select an operator first', {
        duration: 3000
      })
    }
  }

  const getOperatorIcon = (operatorId: OperatorType) => {
    switch (operatorId) {
      case 'IITKgpCampus':
        return <Building2 className="w-5 h-5 text-cyan-400" />
      case 'PubbsTesting':
        return <TestTube className="w-5 h-5 text-cyan-400" />
      default:
        return null
    }
  }

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div 
          className="min-h-screen bg-[#0B111A] flex flex-col items-center justify-center px-6 py-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Logo */}
          <motion.div 
            className="mb-12"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Image
              src="/assets/logo.svg"
              alt="Pubbs Logo"
              width={100}
              height={50}
              className="mx-auto"
            />
          </motion.div>

          {/* Title */}
          <motion.div 
            className="text-center mb-8 max-w-sm"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <h2 className="text-white text-2xl font-semibold mb-3">
              Select Operator
            </h2>
            <p className="text-gray-400 text-base">
              Choose your organization to continue
            </p>
          </motion.div>

          {/* Operator Selection */}
          <motion.div 
            className="w-full max-w-sm space-y-6"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
          >
            {/* Custom Dropdown */}
            <div className="relative">
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-4 text-left flex items-center justify-between hover:border-cyan-400 transition-colors"
              >
                <div className="flex items-center space-x-3">
                  {selectedValue ? (
                    <>
                      {getOperatorIcon(selectedValue)}
                      <div>
                        <p className="text-white font-medium">
                          {OPERATORS.find(op => op.id === selectedValue)?.displayName}
                        </p>
                        <p className="text-gray-400 text-sm">
                          {OPERATORS.find(op => op.id === selectedValue)?.description}
                        </p>
                      </div>
                    </>
                  ) : (
                    <span className="text-gray-400">Select an operator...</span>
                  )}
                </div>
                <ChevronDown 
                  className={`w-5 h-5 text-gray-400 transition-transform ${
                    isDropdownOpen ? 'rotate-180' : ''
                  }`} 
                />
              </button>

              {/* Dropdown Options */}
              <AnimatePresence>
                {isDropdownOpen && (
                  <motion.div
                    className="absolute top-full left-0 w-full mt-2 bg-slate-800 border border-slate-700 rounded-lg shadow-xl z-10 overflow-hidden"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                  >
                    {OPERATORS.map((operator) => (
                      <motion.button
                        key={operator.id}
                        onClick={() => handleOperatorSelect(operator.id)}
                        className="w-full px-4 py-4 text-left hover:bg-slate-700 transition-colors flex items-center space-x-3"
                        whileHover={{ backgroundColor: 'rgba(51, 65, 85, 0.8)' }}
                      >
                        {getOperatorIcon(operator.id)}
                        <div>
                          <p className="text-white font-medium">{operator.displayName}</p>
                          <p className="text-gray-400 text-sm">{operator.description}</p>
                        </div>
                      </motion.button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Continue Button */}
            <motion.button
              onClick={handleContinue}
              disabled={!selectedValue || isLoading}
              className={`w-full py-4 rounded-lg font-semibold transition-all flex items-center justify-center space-x-2 ${
                selectedValue && !isLoading
                  ? 'bg-cyan-600 hover:bg-cyan-700 text-white'
                  : 'bg-gray-700 text-gray-400 cursor-not-allowed'
              }`}
              whileHover={selectedValue && !isLoading ? { scale: 1.02 } : {}}
              whileTap={selectedValue && !isLoading ? { scale: 0.98 } : {}}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Setting up...</span>
                </>
              ) : (
                <span>Continue</span>
              )}
            </motion.button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default OperatorSelection
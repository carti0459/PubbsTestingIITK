'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'

export type OperatorType = 'IITKgpCampus' | 'PubbsTesting'

interface OperatorContextType {
  selectedOperator: OperatorType | null
  setSelectedOperator: (operator: OperatorType) => void
  isOperatorSelected: boolean
  operators: Array<{
    id: OperatorType
    name: string
    displayName: string
    description: string
  }>
}

const OperatorContext = createContext<OperatorContextType | undefined>(undefined)

export const OPERATORS = [
  {
    id: 'IITKgpCampus' as OperatorType,
    name: 'IITKgpCampus',
    displayName: 'IIT Kharagpur',
    description: 'Indian Institute of Technology Kharagpur'
  },
  {
    id: 'PubbsTesting' as OperatorType,
    name: 'PubbsTesting',
    displayName: 'PUBBS Testing',
    description: 'PUBBS Development & Testing Environment'
  }
]

interface OperatorProviderProps {
  children: React.ReactNode
}

export const OperatorProvider: React.FC<OperatorProviderProps> = ({ children }) => {
  const [selectedOperator, setSelectedOperatorState] = useState<OperatorType | null>(null)

  // Load operator from localStorage on mount
  useEffect(() => {
    const savedOperator = localStorage.getItem('selectedOperator') as OperatorType
    if (savedOperator && OPERATORS.find(op => op.id === savedOperator)) {
      setSelectedOperatorState(savedOperator)
    }
  }, [])

  // Save operator to localStorage when changed
  const setSelectedOperator = (operator: OperatorType) => {
    setSelectedOperatorState(operator)
    localStorage.setItem('selectedOperator', operator)
  }

  const value: OperatorContextType = {
    selectedOperator,
    setSelectedOperator,
    isOperatorSelected: selectedOperator !== null,
    operators: OPERATORS
  }

  return (
    <OperatorContext.Provider value={value}>
      {children}
    </OperatorContext.Provider>
  )
}

export const useOperator = (): OperatorContextType => {
  const context = useContext(OperatorContext)
  if (context === undefined) {
    throw new Error('useOperator must be used within an OperatorProvider')
  }
  return context
}

export default OperatorContext
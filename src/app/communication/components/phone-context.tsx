"use client"

import { createContext, useContext, Dispatch, SetStateAction } from 'react'

interface PhoneContextType {
  setPhoneNumber: Dispatch<SetStateAction<string>>
}

export const PhoneContext = createContext<PhoneContextType | undefined>(undefined)

export function usePhoneContext() {
  const context = useContext(PhoneContext)
  if (!context) throw new Error('usePhoneContext must be used within PhoneProvider')
  return context
} 
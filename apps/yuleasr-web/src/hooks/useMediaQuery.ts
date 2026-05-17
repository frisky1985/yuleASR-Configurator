/**
 * Media Query Hook
 * React to media query changes for responsive design
 */

import { useState, useEffect } from 'react'

export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false)

  useEffect(() => {
    const media = window.matchMedia(query)
    
    const updateMatch = () => {
      setMatches(media.matches)
    }
    
    updateMatch()
    media.addEventListener('change', updateMatch)
    
    return () => {
      media.removeEventListener('change', updateMatch)
    }
  }, [query])

  return matches
}

// Common breakpoints
export const useIsMobile = () => useMediaQuery('(max-width: 639px)')
export const useIsTablet = () => useMediaQuery('(min-width: 640px) and (max-width: 1023px)')
export const useIsDesktop = () => useMediaQuery('(min-width: 1024px)')
export const useIsLargeScreen = () => useMediaQuery('(min-width: 1280px)')

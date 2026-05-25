/**
 * Compare Page
 * Full-page view for comparing configurations
 */

import { useState } from 'react'
import { useParams } from 'react-router-dom'

import { ConfigCompareDialog } from '@/components/ConfigCompareDialog'

export function Compare() {
  const { configAId, configBId } = useParams<{ configAId?: string; configBId?: string }>()
  const [isOpen, setIsOpen] = useState(true)

  const handleClose = () => {
    setIsOpen(false)
    // Navigate back
    window.history.back()
  }

  return (
    <div className="h-full">
      <ConfigCompareDialog
        isOpen={isOpen}
        onClose={handleClose}
        configAId={configAId}
        configBId={configBId}
      />
      {!isOpen && (
        <div className="flex items-center justify-center h-64 text-muted-foreground">
          <p>Comparison closed. Select configurations from the Dashboard to compare.</p>
        </div>
      )}
    </div>
  )
}

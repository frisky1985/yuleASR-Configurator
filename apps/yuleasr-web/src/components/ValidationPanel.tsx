import { useState, useEffect } from 'react'
import { AlertCircle, CheckCircle, AlertTriangle, XCircle, RefreshCw } from 'lucide-react'
import { cn } from '@/lib/utils'
import { yuleasrValidator } from '@yuletech/core'
import type { ModuleConfig, ValidationError, ValidationResult } from '@yuletech/core'

interface ValidationPanelProps {
  modules: ModuleConfig[]
  result?: ValidationResult | null
  onNavigate?: (path: string) => void
  className?: string
}

export function ValidationPanel({ modules, result: externalResult, onNavigate, className }: ValidationPanelProps) {
  const [internalErrors, setInternalErrors] = useState<ValidationError[]>([])
  const [isValidating, setIsValidating] = useState(false)
  
  const errors = externalResult?.errors || internalErrors

  const validate = () => {
    setIsValidating(true)
    setTimeout(() => {
      const validationErrors = yuleasrValidator.validateModules(modules)
      setInternalErrors(validationErrors)
      setIsValidating(false)
    }, 500)
  }

  useEffect(() => {
    if (!externalResult) {
      validate()
    }
  }, [modules, externalResult])

  const stats = yuleasrValidator.getValidationStats(errors)

  const handleItemClick = (path: string) => {
    if (onNavigate) {
      onNavigate(path)
    }
  }

  // Group errors by severity
  const errorItems = errors.filter(e => e.severity === 'error')
  const warningItems = errors.filter(e => e.severity === 'warning')
  const infoItems = errors.filter(e => e.severity === 'info')

  return (
    <div className={cn("bg-white border border-gray-200 rounded-lg overflow-hidden", className)}>
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h3 className="font-semibold text-gray-900">Validation</h3>
          {errors.length === 0 ? (
            <span className="flex items-center gap-1 text-sm text-green-600">
              <CheckCircle className="w-4 h-4" />
              All checks passed
            </span>
          ) : (
            <div className="flex items-center gap-2">
              {stats.errorCount > 0 && (
                <span className="flex items-center gap-1 text-sm text-red-600">
                  <XCircle className="w-4 h-4" />
                  {stats.errorCount} errors
                </span>
              )}
              {stats.warningCount > 0 && (
                <span className="flex items-center gap-1 text-sm text-yellow-600">
                  <AlertTriangle className="w-4 h-4" />
                  {stats.warningCount} warnings
                </span>
              )}
            </div>
          )}
        </div>
        <button
          onClick={validate}
          disabled={isValidating}
          className="flex items-center gap-1 px-3 py-1.5 text-sm text-gray-600 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors disabled:opacity-50"
        >
          <RefreshCw className={cn("w-4 h-4", isValidating && "animate-spin")} />
          Refresh
        </button>
      </div>

      {/* Content */}
      <div className="max-h-64 overflow-auto">
        {errors.length === 0 ? (
          <div className="p-8 text-center">
            <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-3">
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
            <p className="text-gray-600 font-medium">Configuration is valid</p>
            <p className="text-sm text-gray-400 mt-1">
              All modules and parameters pass validation
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {/* Errors */}
            {errorItems.length > 0 && (
              <div>
                <div className="px-4 py-2 bg-red-50 text-red-700 text-sm font-medium">
                  Errors ({errorItems.length})
                </div>
                {errorItems.map((error: ValidationError, index: number) => (
                  <div
                    key={`error-${index}`}
                    className="px-4 py-3 hover:bg-gray-50 cursor-pointer"
                    onClick={() => handleItemClick(error.path)}
                  >
                    <div className="flex items-start gap-3">
                      <XCircle className="w-5 h-5 text-red-500 mt-0.5 shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-900">{error.message}</p>
                        <p className="text-xs text-gray-500 mt-0.5 font-mono">
                          {error.path}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Warnings */}
            {warningItems.length > 0 && (
              <div>
                <div className="px-4 py-2 bg-yellow-50 text-yellow-700 text-sm font-medium">
                  Warnings ({warningItems.length})
                </div>
                {warningItems.map((error: ValidationError, index: number) => (
                  <div
                    key={`warning-${index}`}
                    className="px-4 py-3 hover:bg-gray-50 cursor-pointer"
                    onClick={() => handleItemClick(error.path)}
                  >
                    <div className="flex items-start gap-3">
                      <AlertTriangle className="w-5 h-5 text-yellow-500 mt-0.5 shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-900">{error.message}</p>
                        <p className="text-xs text-gray-500 mt-0.5 font-mono">
                          {error.path}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Info */}
            {infoItems.length > 0 && (
              <div>
                <div className="px-4 py-2 bg-blue-50 text-blue-700 text-sm font-medium">
                  Info ({infoItems.length})
                </div>
                {infoItems.map((error: ValidationError, index: number) => (
                  <div
                    key={`info-${index}`}
                    className="px-4 py-3 hover:bg-gray-50 cursor-pointer"
                    onClick={() => handleItemClick(error.path)}
                  >
                    <div className="flex items-start gap-3">
                      <AlertCircle className="w-5 h-5 text-blue-500 mt-0.5 shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-900">{error.message}</p>
                        <p className="text-xs text-gray-500 mt-0.5 font-mono">
                          {error.path}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Footer */}
      {errors.length > 0 && (
        <div className="px-4 py-2 border-t border-gray-200 bg-gray-50 text-xs text-gray-500">
          Click on an item to navigate to the configuration
        </div>
      )}
    </div>
  )
}

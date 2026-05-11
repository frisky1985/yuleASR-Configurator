import { cn } from '@/lib/utils'
import type { ValidationResult } from '@/types'
import { AlertCircle, AlertTriangle, Info, CheckCircle } from 'lucide-react'

interface ValidationPanelProps {
  result: ValidationResult | null
  onNavigate?: (path: string) => void
}

export function ValidationPanel({ result, onNavigate }: ValidationPanelProps) {
  if (!result) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6 text-center">
        <Info className="w-8 h-8 text-gray-400 mx-auto mb-2" />
        <p className="text-sm text-gray-500">No validation results yet</p>
        <p className="text-xs text-gray-400 mt-1">Run validation to check your configuration</p>
      </div>
    )
  }

  const { valid, errors, warnings } = result
  const totalIssues = errors.length + warnings.length

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <div className={cn(
        'px-4 py-3 border-b flex items-center gap-2',
        valid ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
      )}>
        {valid ? (
          <CheckCircle className="w-5 h-5 text-green-600" />
        ) : (
          <AlertCircle className="w-5 h-5 text-red-600" />
        )}
        <h3 className={cn(
          'text-sm font-semibold',
          valid ? 'text-green-900' : 'text-red-900'
        )}>
          {valid ? 'Configuration Valid' : `${totalIssues} Issue${totalIssues > 1 ? 's' : ''} Found`}
        </h3>
      </div>

      {totalIssues > 0 && (
        <div className="divide-y divide-gray-100 max-h-96 overflow-y-auto">
          {errors.map((error, index) => (
            <button
              key={`error-${index}`}
              onClick={() => onNavigate?.(error.path)}
              className="w-full px-4 py-3 flex items-start gap-3 text-left hover:bg-red-50 transition-colors"
            >
              <AlertCircle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
              <div className="min-w-0">
                <p className="text-sm text-red-800 font-medium">{error.message}</p>
                <p className="text-xs text-red-600 mt-0.5 truncate">{error.path}</p>
              </div>
            </button>
          ))}
          {warnings.map((warning, index) => (
            <button
              key={`warning-${index}`}
              onClick={() => onNavigate?.(warning.path)}
              className="w-full px-4 py-3 flex items-start gap-3 text-left hover:bg-yellow-50 transition-colors"
            >
              <AlertTriangle className="w-4 h-4 text-yellow-600 mt-0.5 flex-shrink-0" />
              <div className="min-w-0">
                <p className="text-sm text-yellow-800 font-medium">{warning.message}</p>
                <p className="text-xs text-yellow-600 mt-0.5 truncate">{warning.path}</p>
              </div>
            </button>
          ))}
        </div>
      )}

      {!valid && (
        <div className="px-4 py-2 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
          <span className="text-xs text-gray-500">
            {errors.length} error{errors.length > 1 ? 's' : ''}, {warnings.length} warning{warnings.length > 1 ? 's' : ''}
          </span>
          <button
            className="text-xs text-primary-600 hover:text-primary-700 font-medium"
            onClick={() => {/* TODO: Validate again */}}
          >
            Validate Again
          </button>
        </div>
      )}
    </div>
  )
}

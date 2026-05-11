import { useState, useCallback } from 'react'
import { cn } from '@/lib/utils'
import type { ValidationResult, ValidationError } from '@/types'
import {
  AlertCircle,
  AlertTriangle,
  Info,
  CheckCircle,
  Play,
  Clock,
  ChevronRight,
  RefreshCw,
  Filter,
} from 'lucide-react'

interface ValidationPanelProps {
  result: ValidationResult | null
  onNavigate?: (path: string) => void
  onValidate?: () => Promise<ValidationResult>
  isValidating?: boolean
  realTimeValidation?: boolean
  onToggleRealTime?: (enabled: boolean) => void
  lastValidatedAt?: Date
}

interface ValidationFilters {
  showErrors: boolean
  showWarnings: boolean
  showInfo: boolean
}

export function ValidationPanel({
  result,
  onNavigate,
  onValidate,
  isValidating = false,
  realTimeValidation = false,
  onToggleRealTime,
  lastValidatedAt,
}: ValidationPanelProps) {
  const [showFilters, setShowFilters] = useState(false)
  const [filters, setFilters] = useState<ValidationFilters>({
    showErrors: true,
    showWarnings: true,
    showInfo: true,
  })
  const [, setExpandedItems] = useState<Set<number>>(new Set())

  // Handle manual validation
  const handleValidate = useCallback(async () => {
    if (onValidate && !isValidating) {
      await onValidate()
    }
  }, [onValidate, isValidating])

  // Toggle item expansion
  const toggleItem = useCallback((index: number) => {
    setExpandedItems((prev) => {
      const next = new Set(prev)
      if (next.has(index)) {
        next.delete(index)
      } else {
        next.add(index)
      }
      return next
    })
  }, [])

  // Filter validation items
  const filteredItems = result
    ? [
        ...(filters.showErrors ? result.errors : []),
        ...(filters.showWarnings ? result.warnings : []),
      ]
    : []

  // Get severity icon
  const getSeverityIcon = (severity: ValidationError['severity']) => {
    switch (severity) {
      case 'error':
        return <AlertCircle className="w-4 h-4 text-red-600" />
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-yellow-600" />
      case 'info':
      default:
        return <Info className="w-4 h-4 text-blue-600" />
    }
  }

  // Get severity styles
  const getSeverityStyles = (severity: ValidationError['severity']) => {
    switch (severity) {
      case 'error':
        return 'bg-red-50 hover:bg-red-100 border-red-200'
      case 'warning':
        return 'bg-yellow-50 hover:bg-yellow-100 border-yellow-200'
      case 'info':
      default:
        return 'bg-blue-50 hover:bg-blue-100 border-blue-200'
    }
  }

  if (!result) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        {/* Header */}
        <div className="px-4 py-3 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-gray-900">Validation</h3>
          {onToggleRealTime && (
            <label className="flex items-center gap-1.5 cursor-pointer">
              <Clock className="w-3.5 h-3.5 text-gray-500" />
              <span className="text-xs text-gray-600">Auto</span>
              <input
                type="checkbox"
                checked={realTimeValidation}
                onChange={(e) => onToggleRealTime(e.target.checked)}
                className="w-3.5 h-3.5 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
              />
            </label>
          )}
        </div>

        {/* Empty state */}
        <div className="p-6 text-center">
          <Info className="w-10 h-10 text-gray-300 mx-auto mb-3" />
          <p className="text-sm text-gray-500 font-medium">
            No validation results yet
          </p>
          <p className="text-xs text-gray-400 mt-1">
            Run validation to check your configuration
          </p>
          {onValidate && (
            <button
              onClick={handleValidate}
              disabled={isValidating}
              className="mt-4 inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-primary-600 bg-primary-50 hover:bg-primary-100 rounded-lg transition-colors disabled:opacity-50"
            >
              {isValidating ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <Play className="w-4 h-4" />
              )}
              {isValidating ? 'Validating...' : 'Validate Now'}
            </button>
          )}
        </div>
      </div>
    )
  }

  const { valid, errors, warnings } = result
  const totalIssues = errors.length + warnings.length

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      {/* Header */}
      <div
        className={cn(
          'px-4 py-3 border-b flex items-center justify-between',
          valid
            ? 'bg-green-50 border-green-200'
            : errors.length > 0
              ? 'bg-red-50 border-red-200'
              : 'bg-yellow-50 border-yellow-200'
        )}
      >
        <div className="flex items-center gap-2">
          {valid ? (
            <CheckCircle className="w-5 h-5 text-green-600" />
          ) : errors.length > 0 ? (
            <AlertCircle className="w-5 h-5 text-red-600" />
          ) : (
            <AlertTriangle className="w-5 h-5 text-yellow-600" />
          )}
          <h3
            className={cn(
              'text-sm font-semibold',
              valid
                ? 'text-green-900'
                : errors.length > 0
                  ? 'text-red-900'
                  : 'text-yellow-900'
            )}
          >
            {valid
              ? 'Validation Passed'
              : `${totalIssues} Issue${totalIssues > 1 ? 's' : ''}`}
          </h3>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1">
          {onToggleRealTime && (
            <label
              className="flex items-center gap-1 px-2 py-1 rounded hover:bg-white/50 cursor-pointer"
              title="Toggle real-time validation"
            >
              <Clock className="w-3.5 h-3.5 text-gray-500" />
              <span className="text-xs text-gray-600">Auto</span>
              <input
                type="checkbox"
                checked={realTimeValidation}
                onChange={(e) => onToggleRealTime(e.target.checked)}
                className="w-3.5 h-3.5 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
              />
            </label>
          )}

          {onValidate && (
            <button
              onClick={handleValidate}
              disabled={isValidating}
              className="p-1.5 text-gray-600 hover:bg-white/50 rounded-md transition-colors disabled:opacity-50"
              title="Run validation"
            >
              {isValidating ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <Play className="w-4 h-4" />
              )}
            </button>
          )}
        </div>
      </div>

      {/* Status bar */}
      <div className="px-4 py-2 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {errors.length > 0 && (
            <span className="text-xs text-red-600 font-medium">
              {errors.length} error{errors.length > 1 ? 's' : ''}
            </span>
          )}
          {warnings.length > 0 && (
            <span className="text-xs text-yellow-600 font-medium">
              {warnings.length} warning{warnings.length > 1 ? 's' : ''}
            </span>
          )}
          {valid && (
            <span className="text-xs text-green-600 font-medium">
              All checks passed
            </span>
          )}
        </div>

        {/* Filter button */}
        {totalIssues > 0 && (
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={cn(
              'inline-flex items-center gap-1 text-xs px-2 py-1 rounded transition-colors',
              showFilters
                ? 'bg-primary-100 text-primary-700'
                : 'text-gray-600 hover:bg-gray-200'
            )}
          >
            <Filter className="w-3 h-3" />
            Filter
          </button>
        )}
      </div>

      {/* Filters */}
      {showFilters && totalIssues > 0 && (
        <div className="px-4 py-2 bg-gray-50 border-b border-gray-200 flex items-center gap-4">
          <label className="flex items-center gap-1.5 text-xs cursor-pointer">
            <input
              type="checkbox"
              checked={filters.showErrors}
              onChange={(e) =>
                setFilters((f) => ({ ...f, showErrors: e.target.checked }))
              }
              className="w-3.5 h-3.5 rounded border-gray-300 text-red-600 focus:ring-red-500"
            />
            <span className="text-red-600">Errors</span>
          </label>
          <label className="flex items-center gap-1.5 text-xs cursor-pointer">
            <input
              type="checkbox"
              checked={filters.showWarnings}
              onChange={(e) =>
                setFilters((f) => ({ ...f, showWarnings: e.target.checked }))
              }
              className="w-3.5 h-3.5 rounded border-gray-300 text-yellow-600 focus:ring-yellow-500"
            />
            <span className="text-yellow-600">Warnings</span>
          </label>
          <label className="flex items-center gap-1.5 text-xs cursor-pointer">
            <input
              type="checkbox"
              checked={filters.showInfo}
              onChange={(e) =>
                setFilters((f) => ({ ...f, showInfo: e.target.checked }))
              }
              className="w-3.5 h-3.5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-blue-600">Info</span>
          </label>
        </div>
      )}

      {/* Issues list */}
      {filteredItems.length > 0 && (
        <div className="max-h-64 overflow-y-auto divide-y divide-gray-100">
          {filteredItems.map((item, index) => (
            <button
              key={`${item.severity}-${index}`}
              onClick={() => {
                onNavigate?.(item.path)
                toggleItem(index)
              }}
              className={cn(
                'w-full px-4 py-3 flex items-start gap-3 text-left transition-colors',
                getSeverityStyles(item.severity)
              )}
            >
              <div className="mt-0.5 flex-shrink-0">
                {getSeverityIcon(item.severity)}
              </div>
              <div className="flex-1 min-w-0">
                <p
                  className={cn(
                    'text-sm font-medium',
                    item.severity === 'error'
                      ? 'text-red-800'
                      : item.severity === 'warning'
                        ? 'text-yellow-800'
                        : 'text-blue-800'
                  )}
                >
                  {item.message}
                </p>
                <div className="flex items-center gap-1 mt-1">
                  <code className="text-xs text-gray-600 bg-white/50 px-1.5 py-0.5 rounded truncate">
                    {item.path}
                  </code>
                  {onNavigate && (
                    <ChevronRight className="w-3 h-3 text-gray-400 flex-shrink-0" />
                  )}
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* No matching filters */}
      {filteredItems.length === 0 && totalIssues > 0 && (
        <div className="p-4 text-center text-sm text-gray-500">
          No issues match the current filters
        </div>
      )}

      {/* Footer */}
      <div className="px-4 py-2 bg-gray-50 border-t border-gray-200 flex items-center justify-between text-xs text-gray-500">
        <span>
          {realTimeValidation ? (
            <span className="inline-flex items-center gap-1 text-green-600">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
              Real-time validation enabled
            </span>
          ) : (
            'Manual validation mode'
          )}
        </span>
        {lastValidatedAt && (
          <span>
            Last checked: {lastValidatedAt.toLocaleTimeString()}
          </span>
        )}
      </div>
    </div>
  )
}

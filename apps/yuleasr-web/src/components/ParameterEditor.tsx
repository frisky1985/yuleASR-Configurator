import { useState, useCallback } from 'react'
import type { ConfigParameter, ValidationIssue } from '@/types'
import { cn } from '@/lib/utils'
import { RotateCcw, Plus, X, Link, AlertCircle, Check, ChevronDown } from 'lucide-react'

interface ParameterEditorProps {
  parameter: ConfigParameter
  error?: ValidationIssue
  warning?: ValidationIssue
  onChange: (value: unknown) => void
  onValidate?: (value: unknown) => ValidationIssue | null
  compact?: boolean
}

export function ParameterEditor({
  parameter,
  error,
  warning,
  onChange,
  onValidate,
  compact = false,
}: ParameterEditorProps) {
  const {
    type,
    name,
    description,
    min,
    max,
    options,
    defaultValue,
    itemType,
    referenceTarget,
  } = parameter

  const [value, setValue] = useState<unknown>(parameter.value ?? defaultValue)
  const [isDirty, setIsDirty] = useState(false)
  const [localError, setLocalError] = useState<string | null>(null)
  const [isValidating, setIsValidating] = useState(false)

  // Validate value
  const validateValue = useCallback(
    (val: unknown): string | null => {
      // Required check
      if (val === undefined || val === null || val === '') {
        return 'This field is required'
      }

      // Type-specific validation
      switch (type) {
        case 'integer':
          if (!Number.isInteger(val)) {
            return 'Must be an integer'
          }
          if (min !== undefined && (val as number) < min) {
            return `Minimum value is ${min}`
          }
          if (max !== undefined && (val as number) > max) {
            return `Maximum value is ${max}`
          }
          break

        case 'float':
          if (typeof val !== 'number' || isNaN(val)) {
            return 'Must be a valid number'
          }
          if (min !== undefined && val < min) {
            return `Minimum value is ${min}`
          }
          if (max !== undefined && val > max) {
            return `Maximum value is ${max}`
          }
          break

        case 'string':
          if (typeof val !== 'string') {
            return 'Must be a string'
          }
          break

        case 'array':
          if (!Array.isArray(val)) {
            return 'Must be an array'
          }
          break

        case 'reference':
          if (typeof val !== 'string' || !val) {
            return 'Reference target is required'
          }
          break
      }

      // Custom validation
      if (onValidate) {
        const customError = onValidate(val)
        if (customError) {
          return customError.message
        }
      }

      return null
    },
    [type, min, max, onValidate]
  )

  // Handle value change with validation
  const handleChange = useCallback(
    (newValue: unknown) => {
      setValue(newValue)
      setIsDirty(true)
      setIsValidating(true)

      // Debounced validation
      const validationError = validateValue(newValue)
      setLocalError(validationError)
      setIsValidating(false)

      // Only propagate if valid or empty
      if (!validationError || newValue === '') {
        onChange(newValue)
      }
    },
    [onChange, validateValue]
  )

  // Reset to default value
  const handleReset = useCallback(() => {
    setValue(defaultValue)
    setIsDirty(false)
    setLocalError(null)
    onChange(defaultValue)
  }, [defaultValue, onChange])

  // Array value handlers
  const handleArrayAdd = useCallback(() => {
    const currentArray = Array.isArray(value) ? value : []
    let newItem: unknown

    switch (itemType) {
      case 'integer':
      case 'float':
        newItem = 0
        break
      default:
        newItem = ''
    }

    handleChange([...currentArray, newItem])
  }, [value, itemType, handleChange])

  const handleArrayRemove = useCallback(
    (index: number) => {
      const currentArray = Array.isArray(value) ? value : []
      handleChange(currentArray.filter((_, i) => i !== index))
    },
    [value, handleChange]
  )

  const handleArrayItemChange = useCallback(
    (index: number, itemValue: unknown) => {
      const currentArray = Array.isArray(value) ? value : []
      const newArray = [...currentArray]
      newArray[index] = itemValue
      handleChange(newArray)
    },
    [value, handleChange]
  )

  // Base input class
  const baseInputClass = cn(
    'w-full px-3 py-2 border rounded-md text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500',
    error || localError
      ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
      : warning
        ? 'border-yellow-300 focus:border-yellow-500 focus:ring-yellow-500'
        : 'border-gray-300 focus:border-primary-500',
    isValidating && 'opacity-70'
  )

  // Render input based on type
  const renderInput = () => {
    switch (type) {
      case 'boolean':
        return (
          <div className="flex items-center gap-3">
            <button
              onClick={() => handleChange(!Boolean(value))}
              className={cn(
                'relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2',
                value ? 'bg-primary-600' : 'bg-gray-200'
              )}
            >
              <span
                className={cn(
                  'inline-block h-4 w-4 transform rounded-full bg-white transition-transform',
                  value ? 'translate-x-6' : 'translate-x-1'
                )}
              />
            </button>
            <span className="text-sm text-gray-700">
              {value ? 'Enabled' : 'Disabled'}
            </span>
          </div>
        )

      case 'integer':
      case 'float':
        return (
          <div className="flex items-center gap-2">
            <input
              type="number"
              value={typeof value === 'number' ? value : ''}
              min={min}
              max={max}
              step={type === 'float' ? 0.01 : 1}
              onChange={(e) => {
                const val =
                  type === 'integer'
                    ? parseInt(e.target.value)
                    : parseFloat(e.target.value)
                handleChange(isNaN(val) ? '' : val)
              }}
              className={baseInputClass}
              placeholder={`Enter ${type} value...`}
            />
            {(min !== undefined || max !== undefined) && (
              <span className="text-xs text-gray-400 whitespace-nowrap">
                [{min ?? '-∞'}, {max ?? '∞'}]
              </span>
            )}
          </div>
        )

      case 'enum':
        return (
          <div className="relative">
            <select
              value={String(value ?? '')}
              onChange={(e) => handleChange(e.target.value)}
              className={cn(baseInputClass, 'appearance-none cursor-pointer')}
            >
              <option value="">Select an option...</option>
              {options?.map((option, index) => (
                <option 
                  key={index} 
                  value={typeof option === 'string' ? option : String(option.value)}
                >
                  {typeof option === 'string' ? option : option.label}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          </div>
        )

      case 'array':
        const arrayValue = Array.isArray(value) ? value : []
        return (
          <div className="space-y-2">
            {arrayValue.map((item, index) => (
              <div key={index} className="flex items-center gap-2">
                <span className="text-xs text-gray-400 w-6">{index + 1}.</span>
                <input
                  type={itemType === 'integer' || itemType === 'float' ? 'number' : 'text'}
                  value={typeof item === 'number' ? item : String(item ?? '')}
                  step={itemType === 'float' ? 0.01 : 1}
                  onChange={(e) => {
                    const val =
                      itemType === 'integer'
                        ? parseInt(e.target.value)
                        : itemType === 'float'
                          ? parseFloat(e.target.value)
                          : e.target.value
                    handleArrayItemChange(index, isNaN(val as number) ? '' : val)
                  }}
                  className={cn(baseInputClass, 'flex-1')}
                />
                <button
                  onClick={() => handleArrayRemove(index)}
                  className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                  title="Remove item"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
            <button
              onClick={handleArrayAdd}
              className="inline-flex items-center gap-1.5 text-xs text-primary-600 hover:text-primary-700 font-medium px-2 py-1.5 rounded-md hover:bg-primary-50 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              Add item
            </button>
          </div>
        )

      case 'reference':
        return (
          <div className="relative">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              <Link className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={String(value ?? '')}
              onChange={(e) => handleChange(e.target.value)}
              className={cn(baseInputClass, 'pl-10')}
              placeholder={
                referenceTarget
                  ? `Reference to ${referenceTarget}...`
                  : 'Enter reference...'
              }
            />
          </div>
        )

      case 'string':
      default:
        return (
          <input
            type="text"
            value={String(value ?? '')}
            onChange={(e) => handleChange(e.target.value)}
            className={baseInputClass}
            placeholder="Enter value..."
          />
        )
    }
  }

  const displayError = error?.message || localError
  const displayWarning = warning?.message

  if (compact) {
    return (
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          {renderInput()}
          {defaultValue !== undefined && isDirty && (
            <button
              onClick={handleReset}
              className="p-1.5 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-md transition-colors"
              title="Reset to default"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
        {displayError && (
          <p className="text-xs text-red-600 flex items-center gap-1">
            <AlertCircle className="w-3 h-3" />
            {displayError}
          </p>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {/* Header row */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-gray-900">{name}</label>
          <span className="text-xs text-gray-500 uppercase bg-gray-100 px-1.5 py-0.5 rounded">
            {type}
          </span>
          {defaultValue !== undefined && (
            <span className="text-xs text-gray-400">default: {String(defaultValue)}</span>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1">
          {defaultValue !== undefined && isDirty && (
            <button
              onClick={handleReset}
              className="inline-flex items-center gap-1 text-xs text-gray-500 hover:text-primary-600 px-2 py-1 rounded-md hover:bg-primary-50 transition-colors"
              title="Reset to default"
            >
              <RotateCcw className="w-3 h-3" />
              Reset
            </button>
          )}
          {!displayError && !isDirty && Boolean(value) && (
            <span className="text-green-500">
              <Check className="w-4 h-4" />
            </span>
          )}
        </div>
      </div>

      {/* Description */}
      {description && <p className="text-xs text-gray-500">{description}</p>}

      {/* Input */}
      <div className="pt-1">{renderInput()}</div>

      {/* Validation feedback */}
      {displayError && (
        <div className="flex items-center gap-1.5 text-xs text-red-600 bg-red-50 px-2 py-1.5 rounded">
          <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
          <span>{displayError}</span>
        </div>
      )}

      {displayWarning && !displayError && (
        <div className="flex items-center gap-1.5 text-xs text-yellow-700 bg-yellow-50 px-2 py-1.5 rounded">
          <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
          <span>{displayWarning}</span>
        </div>
      )}

      {/* Range info for numeric types */}
      {(type === 'integer' || type === 'float') && (min !== undefined || max !== undefined) && (
        <p className="text-xs text-gray-400">
          Valid range: {min !== undefined ? min : '-∞'} to {max !== undefined ? max : '∞'}
        </p>
      )}
    </div>
  )
}

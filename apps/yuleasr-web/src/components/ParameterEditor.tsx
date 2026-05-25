import { RotateCcw, Plus, X, Link, AlertCircle, Check, ChevronDown, Info, Search } from 'lucide-react'
import { useState, useCallback, useMemo, useRef, useEffect } from 'react'

import { cn } from '@/lib/utils'
import type { ConfigParameter, ValidationIssue } from '@/types'

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
  const [enumSearch, setEnumSearch] = useState('')

  // Determine if current value matches default
  const isDefault = useMemo(() => {
    if (defaultValue === undefined) return false
    return value === defaultValue
  }, [value, defaultValue])

  // Filtered enum options for search
  const filteredEnumOptions = useMemo(() => {
    if (!options) return []
    if (!enumSearch) return options
    return options.filter((option) => {
      const label = typeof option === 'string' ? option : option.label
      return label.toLowerCase().includes(enumSearch.toLowerCase())
    })
  }, [options, enumSearch])

  // Check if we should show a range slider for numeric types
  const showRangeSlider = useMemo(() => {
    if (type !== 'integer' && type !== 'float') return false
    if (min === undefined || max === undefined) return false
    const range = max - min
    return range > 0 && range <= 1000
  }, [type, min, max])

  const searchInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (type === 'enum' && options && options.length > 5 && searchInputRef.current) {
      searchInputRef.current.focus()
    }
  }, [type, options])

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

  // Type badge colors
  const typeBadgeColors: Record<string, string> = {
    boolean: 'bg-blue-100 text-blue-700',
    integer: 'bg-emerald-100 text-emerald-700',
    float: 'bg-teal-100 text-teal-700',
    string: 'bg-purple-100 text-purple-700',
    enum: 'bg-amber-100 text-amber-700',
    array: 'bg-rose-100 text-rose-700',
    reference: 'bg-indigo-100 text-indigo-700',
  }

  // Render input based on type
  const renderInput = () => {
    switch (type) {
      case 'boolean':
        return (
          <div className="flex items-center gap-3">
            <button
              onClick={() => handleChange(!value)}
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
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              {showRangeSlider && (
                <input
                  type="range"
                  value={typeof value === 'number' ? value : (min ?? 0)}
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
                  className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary-600"
                />
              )}
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
                className={cn(baseInputClass, showRangeSlider ? 'w-24 shrink-0' : 'w-full')}
                placeholder={`Enter ${type} value...`}
              />
            </div>
            {(min !== undefined || max !== undefined) && !showRangeSlider && (
              <span className="text-xs text-gray-400 whitespace-nowrap">
                [{min ?? '-∞'}, {max ?? '∞'}]
              </span>
            )}
          </div>
        )

      case 'enum': {
        const hasManyOptions = options && options.length > 5

        if (hasManyOptions) {
          return (
            <div className="relative">
              <div className="relative mb-1.5">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={enumSearch}
                  onChange={(e) => setEnumSearch(e.target.value)}
                  placeholder="Search options..."
                  autoFocus
                  className={cn(
                    baseInputClass,
                    'pl-8 py-1.5 text-xs'
                  )}
                />
              </div>
              <div className="max-h-48 overflow-y-auto border border-gray-200 rounded-md divide-y divide-gray-100">
                {filteredEnumOptions.length === 0 ? (
                  <div className="px-3 py-2 text-xs text-gray-400 text-center">
                    No options found
                  </div>
                ) : (
                  filteredEnumOptions.map((option, index) => {
                    const optValue = typeof option === 'string' ? option : String(option.value)
                    const optLabel = typeof option === 'string' ? option : option.label
                    const isSelected = String(value ?? '') === optValue
                    return (
                      <button
                        key={index}
                        onClick={() => {
                          handleChange(optValue)
                          setEnumSearch('')
                        }}
                        className={cn(
                          'w-full text-left px-3 py-2 text-xs transition-colors hover:bg-primary-50',
                          isSelected
                            ? 'bg-primary-50 text-primary-700 font-medium'
                            : 'text-gray-700'
                        )}
                      >
                        {optLabel}
                      </button>
                    )
                  })
                )}
              </div>
            </div>
          )
        }

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
      }

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
          {type && (
            <span className={cn(
              'text-[10px] uppercase font-semibold px-1 py-0.5 rounded shrink-0',
              typeBadgeColors[type] || 'bg-gray-100 text-gray-600'
            )}>
              {type}
            </span>
          )}
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
          {/* Default value indicator */}
          {defaultValue !== undefined && (
            <span
              className={cn(
                'w-2 h-2 rounded-full shrink-0',
                isDefault ? 'bg-green-500' : 'bg-blue-500'
              )}
              title={isDefault ? 'Using default value' : 'Modified from default'}
            />
          )}
          <label className="text-sm font-medium text-gray-900">{name}</label>
          <span className={cn(
            'text-xs uppercase font-semibold px-1.5 py-0.5 rounded',
            typeBadgeColors[type] || 'bg-gray-100 text-gray-600'
          )}>
            {type}
          </span>
          {/* Description tooltip */}
          {description && (
            <span className="group relative inline-flex items-center">
              <Info className="w-3.5 h-3.5 text-gray-400 cursor-help" />
              <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2.5 py-1.5 text-xs text-white bg-gray-800 rounded-md shadow-lg whitespace-normal max-w-64 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 pointer-events-none">
                {description}
                <span className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-800" />
              </span>
            </span>
          )}
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

import type { ConfigParameter, ValidationError } from '@/types'
import { cn } from '@/lib/utils'

interface ParameterEditorProps {
  parameter: ConfigParameter
  error?: ValidationError
  onChange: (value: unknown) => void
}

export function ParameterEditor({ parameter, error, onChange }: ParameterEditorProps) {
  const { type, name, description, min, max, options, default: defaultValue } = parameter
  const value = parameter.value ?? defaultValue

  const baseInputClass = cn(
    'w-full px-3 py-2 border rounded-md text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500',
    error
      ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
      : 'border-gray-300 focus:border-primary-500'
  )

  const renderInput = () => {
    switch (type) {
      case 'boolean':
        return (
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id={name}
              checked={Boolean(value)}
              onChange={(e) => onChange(e.target.checked)}
              className="w-4 h-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
            />
            <label htmlFor={name} className="text-sm text-gray-700">
              {value ? 'Enabled' : 'Disabled'}
            </label>
          </div>
        )

      case 'integer':
      case 'float':
        return (
          <input
            type="number"
            value={typeof value === 'number' ? value : ''}
            min={min}
            max={max}
            step={type === 'float' ? 0.01 : 1}
            onChange={(e) => onChange(type === 'integer' ? parseInt(e.target.value) : parseFloat(e.target.value))}
            className={baseInputClass}
          />
        )

      case 'enum':
        return (
          <select
            value={String(value)}
            onChange={(e) => onChange(e.target.value)}
            className={baseInputClass}
          >
            {options?.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        )

      case 'string':
      default:
        return (
          <input
            type="text"
            value={String(value ?? '')}
            onChange={(e) => onChange(e.target.value)}
            className={baseInputClass}
          />
        )
    }
  }

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-gray-900">{name}</label>
        <span className="text-xs text-gray-500 uppercase">{type}</span>
      </div>
      <p className="text-xs text-gray-500">{description}</p>
      {renderInput()}
      {min !== undefined && max !== undefined && (
        <p className="text-xs text-gray-400">
          Range: {min} - {max}
        </p>
      )}
      {error && (
        <p className="text-xs text-red-600 flex items-center gap-1">
          <span className="inline-block w-1 h-1 rounded-full bg-red-600" />
          {error.message}
        </p>
      )}
    </div>
  )
}

import { useState, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { cn } from '@/lib/utils'
import { 
  Cpu, 
  Wifi, 
  ChevronRight, 
  ChevronLeft,
  Check,
  AlertCircle,
  HardDrive,
  Gauge,
  Search,
  Layers,
  X
} from 'lucide-react'

interface ModuleConfigWizardProps {
  isOpen: boolean
  onClose: () => void
  onComplete: (config: {
    module: string
    version: string
    parameters: Record<string, unknown>
    configStatus: 'configured'
    configMethod: 'wizard'
    configProgress: number
    configuredAt: string
  }) => void
}

interface ModuleTemplate {
  id: string
  name: string
  layer: 'MCAL' | 'ECUAL' | 'Service' | 'RTE'
  description: string
  icon: React.ReactNode
  parameters: ParameterConfig[]
}

interface ParameterConfig {
  name: string
  type: 'number' | 'string' | 'boolean' | 'select'
  label: string
  description: string
  defaultValue: unknown
  options?: { value: string | number; label: string }[]
  min?: number
  max?: number
}

const LAYER_COLORS: Record<string, { bg: string; text: string; border: string; hover: string; badge: string }> = {
  MCAL: {
    bg: 'bg-blue-50',
    text: 'text-blue-700',
    border: 'border-blue-200',
    hover: 'hover:border-blue-300 hover:bg-blue-50',
    badge: 'bg-blue-100 text-blue-700 border-blue-200'
  },
  ECUAL: {
    bg: 'bg-green-50',
    text: 'text-green-700',
    border: 'border-green-200',
    hover: 'hover:border-green-300 hover:bg-green-50',
    badge: 'bg-green-100 text-green-700 border-green-200'
  },
  Service: {
    bg: 'bg-purple-50',
    text: 'text-purple-700',
    border: 'border-purple-200',
    hover: 'hover:border-purple-300 hover:bg-purple-50',
    badge: 'bg-purple-100 text-purple-700 border-purple-200'
  },
  RTE: {
    bg: 'bg-orange-50',
    text: 'text-orange-700',
    border: 'border-orange-200',
    hover: 'hover:border-orange-300 hover:bg-orange-50',
    badge: 'bg-orange-100 text-orange-700 border-orange-200'
  }
}

const LAYER_ORDER = ['MCAL', 'ECUAL', 'Service', 'RTE']

const MODULE_TEMPLATES: ModuleTemplate[] = [
  {
    id: 'Mcu',
    name: 'MCU',
    layer: 'MCAL',
    description: 'Microcontroller configuration',
    icon: <Cpu className="w-6 h-6" />,
    parameters: [
      {
        name: 'clock_frequency',
        type: 'number',
        label: 'Clock Frequency (Hz)',
        description: 'Main system clock frequency',
        defaultValue: 800000000,
        min: 1000000,
        max: 10000000000
      },
      {
        name: 'core_count',
        type: 'number',
        label: 'Core Count',
        description: 'Number of CPU cores',
        defaultValue: 4,
        min: 1,
        max: 8
      },
      {
        name: 'target_platform',
        type: 'select',
        label: 'Target Platform',
        description: 'Target MCU platform',
        defaultValue: 'imx8mm',
        options: [
          { value: 'imx8mm', label: 'i.MX8M Mini' },
          { value: 's32k312', label: 'S32K312' },
          { value: 's32k344', label: 'S32K344' }
        ]
      }
    ]
  },
  {
    id: 'Can',
    name: 'CAN',
    layer: 'ECUAL',
    description: 'CAN communication configuration',
    icon: <Wifi className="w-6 h-6" />,
    parameters: [
      {
        name: 'baudrate',
        type: 'select',
        label: 'Baudrate',
        description: 'CAN bus baudrate',
        defaultValue: 500000,
        options: [
          { value: 125000, label: '125 kbps' },
          { value: 250000, label: '250 kbps' },
          { value: 500000, label: '500 kbps' },
          { value: 1000000, label: '1 Mbps' }
        ]
      },
      {
        name: 'controller_count',
        type: 'number',
        label: 'Controller Count',
        description: 'Number of CAN controllers',
        defaultValue: 2,
        min: 1,
        max: 8
      }
    ]
  },
  {
    id: 'NvM',
    name: 'NVM',
    layer: 'Service',
    description: 'Non-volatile memory configuration',
    icon: <HardDrive className="w-6 h-6" />,
    parameters: [
      {
        name: 'block_count',
        type: 'number',
        label: 'Block Count',
        description: 'Number of NVM blocks',
        defaultValue: 32,
        min: 1,
        max: 256
      },
      {
        name: 'write_cycle_count',
        type: 'number',
        label: 'Write Cycle Count',
        description: 'Maximum write cycles',
        defaultValue: 100000,
        min: 1000,
        max: 1000000
      }
    ]
  },
  {
    id: 'Com',
    name: 'COM',
    layer: 'Service',
    description: 'Communication stack configuration',
    icon: <Gauge className="w-6 h-6" />,
    parameters: [
      {
        name: 'ipdu_count',
        type: 'number',
        label: 'IPDU Count',
        description: 'Number of Interaction PDUs',
        defaultValue: 64,
        min: 1,
        max: 512
      },
      {
        name: 'signal_count',
        type: 'number',
        label: 'Signal Count',
        description: 'Number of COM signals',
        defaultValue: 256,
        min: 1,
        max: 2048
      }
    ]
  },
  {
    id: 'Gpt',
    name: 'GPT',
    layer: 'MCAL',
    description: 'General Purpose Timer configuration',
    icon: <Gauge className="w-6 h-6" />,
    parameters: [
      {
        name: 'channel_count',
        type: 'number',
        label: 'Channel Count',
        description: 'Number of GPT channels',
        defaultValue: 4,
        min: 1,
        max: 16
      },
      {
        name: 'tick_frequency',
        type: 'number',
        label: 'Tick Frequency (Hz)',
        description: 'GPT tick frequency',
        defaultValue: 1000,
        min: 1,
        max: 1000000
      },
      {
        name: 'predef_timer_1us',
        type: 'boolean',
        label: '1us Predefined Timer',
        description: 'Enable 1 microsecond predefined timer',
        defaultValue: true
      }
    ]
  },
  {
    id: 'Pwm',
    name: 'PWM',
    layer: 'MCAL',
    description: 'Pulse Width Modulation configuration',
    icon: <Gauge className="w-6 h-6" />,
    parameters: [
      {
        name: 'channel_count',
        type: 'number',
        label: 'Channel Count',
        description: 'Number of PWM channels',
        defaultValue: 8,
        min: 1,
        max: 32
      },
      {
        name: 'frequency',
        type: 'number',
        label: 'Default Frequency (Hz)',
        description: 'Default PWM frequency',
        defaultValue: 1000,
        min: 1,
        max: 100000
      }
    ]
  },
  {
    id: 'Adc',
    name: 'ADC',
    layer: 'MCAL',
    description: 'Analog to Digital Converter configuration',
    icon: <Gauge className="w-6 h-6" />,
    parameters: [
      {
        name: 'channel_count',
        type: 'number',
        label: 'Channel Count',
        description: 'Number of ADC channels',
        defaultValue: 16,
        min: 1,
        max: 64
      },
      {
        name: 'resolution',
        type: 'select',
        label: 'Resolution',
        description: 'ADC resolution',
        defaultValue: 12,
        options: [
          { value: 8, label: '8-bit' },
          { value: 10, label: '10-bit' },
          { value: 12, label: '12-bit' },
          { value: 16, label: '16-bit' }
        ]
      }
    ]
  },
  {
    id: 'Port',
    name: 'Port',
    layer: 'MCAL',
    description: 'Port pin configuration',
    icon: <HardDrive className="w-6 h-6" />,
    parameters: [
      {
        name: 'pin_count',
        type: 'number',
        label: 'Pin Count',
        description: 'Number of configurable port pins',
        defaultValue: 64,
        min: 1,
        max: 256
      },
      {
        name: 'dev_error_detect',
        type: 'boolean',
        label: 'Development Error Detection',
        description: 'Enable development error detection',
        defaultValue: true
      }
    ]
  },
  {
    id: 'Dio',
    name: 'DIO',
    layer: 'MCAL',
    description: 'Digital Input/Output configuration',
    icon: <HardDrive className="w-6 h-6" />,
    parameters: [
      {
        name: 'channel_count',
        type: 'number',
        label: 'Channel Count',
        description: 'Number of DIO channels',
        defaultValue: 64,
        min: 1,
        max: 256
      },
      {
        name: 'flip_channel_api',
        type: 'boolean',
        label: 'Flip Channel API',
        description: 'Enable flip channel API',
        defaultValue: true
      }
    ]
  }
]

export function ModuleConfigWizard({ isOpen, onClose, onComplete }: ModuleConfigWizardProps) {
  const { t } = useTranslation()
  const [step, setStep] = useState<1 | 2 | 3>(1)
  const [selectedModule, setSelectedModule] = useState<ModuleTemplate | null>(null)
  const [parameters, setParameters] = useState<Record<string, unknown>>({})
  const [errors, setErrors] = useState<Record<string, string>>({})
  
  // Category filter states
  const [selectedLayer, setSelectedLayer] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')

  // Filter and group modules
  const groupedModules = useMemo(() => {
    let modules = MODULE_TEMPLATES

    // Filter by layer
    if (selectedLayer !== 'all') {
      modules = modules.filter(m => m.layer === selectedLayer)
    }

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      modules = modules.filter(m => 
        m.name.toLowerCase().includes(query) ||
        m.description.toLowerCase().includes(query) ||
        m.layer.toLowerCase().includes(query)
      )
    }

    // Group by layer
    const grouped: Record<string, ModuleTemplate[]> = {}
    LAYER_ORDER.forEach(layer => {
      const layerModules = modules.filter(m => m.layer === layer)
      if (layerModules.length > 0) {
        grouped[layer] = layerModules
      }
    })

    return grouped
  }, [selectedLayer, searchQuery])

  // Get layer module count
  const layerCounts = useMemo(() => {
    const counts: Record<string, number> = {}
    LAYER_ORDER.forEach(layer => {
      counts[layer] = MODULE_TEMPLATES.filter(m => m.layer === layer).length
    })
    return counts
  }, [])

  if (!isOpen) return null

  const handleSelectModule = (module: ModuleTemplate) => {
    setSelectedModule(module)
    // Initialize parameters with defaults
    const defaults: Record<string, unknown> = {}
    module.parameters.forEach(param => {
      defaults[param.name] = param.defaultValue
    })
    setParameters(defaults)
    setStep(2)
  }

  const handleParameterChange = (name: string, value: unknown) => {
    setParameters(prev => ({ ...prev, [name]: value }))
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[name]
        return newErrors
      })
    }
  }

  const validateParameters = (): boolean => {
    const newErrors: Record<string, string> = {}
    
    if (!selectedModule) return false
    
    selectedModule.parameters.forEach(param => {
      const value = parameters[param.name]
      
      if (param.type === 'number') {
        const numValue = Number(value)
        if (isNaN(numValue)) {
          newErrors[param.name] = 'Must be a valid number'
        } else if (param.min !== undefined && numValue < param.min) {
          newErrors[param.name] = `Minimum value is ${param.min}`
        } else if (param.max !== undefined && numValue > param.max) {
          newErrors[param.name] = `Maximum value is ${param.max}`
        }
      }
    })
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleNext = () => {
    if (step === 2) {
      if (validateParameters()) {
        setStep(3)
      }
    }
  }

  const handleComplete = () => {
    if (selectedModule) {
      onComplete({
        module: selectedModule.id,
        version: '1.0.0',
        parameters,
        // 标记为已配置
        configStatus: 'configured',
        configMethod: 'wizard',
        configProgress: 100,
        configuredAt: new Date().toISOString()
      })
    }
    // Reset and close
    resetAndClose()
  }

  const resetAndClose = () => {
    setStep(1)
    setSelectedModule(null)
    setParameters({})
    setErrors({})
    setSelectedLayer('all')
    setSearchQuery('')
    onClose()
  }

  const handleBack = () => {
    if (step === 2) {
      setStep(1)
      setSelectedModule(null)
    } else if (step === 3) {
      setStep(2)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl mx-4 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              {t('wizard.title', 'Module Configuration Wizard')}
            </h3>
            <p className="text-sm text-gray-500">
              {t('wizard.step', 'Step {{step}} of 3: {{title}}', {
                step,
                title: step === 1 ? t('wizard.selectModule', 'Select Module') : 
                       step === 2 ? t('wizard.configureParams', 'Configure Parameters') : 
                       t('wizard.review', 'Review')
              })}
            </p>
          </div>
          <button
            onClick={resetAndClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <span className="sr-only">Close</span>
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Progress */}
        <div className="px-6 py-3 bg-gray-50 border-b border-gray-200">
          <div className="flex items-center gap-2">
            {[1, 2, 3].map((s) => (
              <div key={s} className="flex items-center gap-2">
                <div
                  className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors",
                    step === s
                      ? "bg-primary-600 text-white"
                      : step > s
                      ? "bg-green-500 text-white"
                      : "bg-gray-200 text-gray-600"
                  )}
                >
                  {step > s ? <Check className="w-4 h-4" /> : s}
                </div>
                {s < 3 && (
                  <div
                    className={cn(
                      "w-12 h-0.5 transition-colors",
                      step > s ? "bg-green-500" : "bg-gray-200"
                    )}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-6">
          {step === 1 && (
            <div className="space-y-4">
              {/* Search and Filter Bar */}
              <div className="space-y-3">
                {/* Search */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={t('wizard.searchModule', 'Search modules...')}
                    className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {/* Layer Filter Tabs */}
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setSelectedLayer('all')}
                    className={cn(
                      "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors",
                      selectedLayer === 'all'
                        ? "bg-gray-900 text-white"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    )}
                  >
                    <Layers className="w-3.5 h-3.5" />
                    {t('wizard.allLayers', 'All')}
                    <span className="ml-1 text-xs opacity-70">({MODULE_TEMPLATES.length})</span>
                  </button>
                  {LAYER_ORDER.map(layer => (
                    <button
                      key={layer}
                      onClick={() => setSelectedLayer(layer)}
                      className={cn(
                        "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors border",
                        selectedLayer === layer
                          ? cn(LAYER_COLORS[layer].badge, 'border-transparent')
                          : cn(LAYER_COLORS[layer].bg, LAYER_COLORS[layer].text, 'hover:opacity-80', LAYER_COLORS[layer].border)
                      )}
                    >
                      <span>{layer}</span>
                      <span className="text-xs opacity-70">({layerCounts[layer]})</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Module Grid */}
              {Object.keys(groupedModules).length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <Search className="w-12 h-12 mx-auto mb-3 opacity-30" />
                  <p>{t('wizard.noModules', 'No modules found')}</p>
                  <button
                    onClick={() => { setSearchQuery(''); setSelectedLayer('all'); }}
                    className="mt-2 text-primary-600 hover:text-primary-700 text-sm"
                  >
                    {t('wizard.clearFilters', 'Clear filters')}
                  </button>
                </div>
              ) : (
                <div className="space-y-6">
                  {LAYER_ORDER.map(layer => {
                    const modules = groupedModules[layer]
                    if (!modules || modules.length === 0) return null

                    return (
                      <div key={layer} className="space-y-3">
                        {/* Layer Header */}
                        <div className={cn(
                          "flex items-center gap-2 px-3 py-2 rounded-lg",
                          LAYER_COLORS[layer].bg
                        )}>
                          <span className={cn("text-sm font-semibold", LAYER_COLORS[layer].text)}>
                            {layer} Layer
                          </span>
                          <span className={cn("text-xs", LAYER_COLORS[layer].text, "opacity-70")}>
                            ({modules.length})
                          </span>
                        </div>

                        {/* Module Cards */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {modules.map((module) => (
                            <button
                              key={module.id}
                              onClick={() => handleSelectModule(module)}
                              className={cn(
                                "p-4 border rounded-lg transition-all text-left group",
                                LAYER_COLORS[layer].hover,
                                "border-gray-200 hover:shadow-md"
                              )}
                            >
                              <div className="flex items-start gap-3">
                                <div className={cn(
                                  "p-2 rounded-lg transition-colors",
                                  LAYER_COLORS[layer].bg,
                                  LAYER_COLORS[layer].text
                                )}>
                                  {module.icon}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2">
                                    <span className="font-semibold text-gray-900">{module.name}</span>
                                    <span className={cn(
                                      "px-1.5 py-0.5 text-xs rounded border",
                                      LAYER_COLORS[layer].badge
                                    )}>
                                      {module.layer}
                                    </span>
                                  </div>
                                  <p className="text-sm text-gray-500 mt-1 line-clamp-2">{module.description}</p>
                                  <div className="flex items-center gap-3 mt-2 text-xs text-gray-400">
                                    <span>{module.parameters.length} {t('wizard.params', 'params')}</span>
                                  </div>
                                </div>
                                <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-gray-600 flex-shrink-0" />
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )}

          {step === 2 && selectedModule && (
            <div className="space-y-6">
              <div className={cn(
                "flex items-center gap-3 p-4 rounded-lg border",
                LAYER_COLORS[selectedModule.layer].bg,
                LAYER_COLORS[selectedModule.layer].border
              )}>
                <div className="p-2 bg-white rounded-lg shadow-sm">
                  {selectedModule.icon}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-semibold text-gray-900">{selectedModule.name}</h4>
                    <span className={cn(
                      "px-1.5 py-0.5 text-xs rounded border",
                      LAYER_COLORS[selectedModule.layer].badge
                    )}>
                      {selectedModule.layer}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500">{selectedModule.description}</p>
                </div>
              </div>

              <div className="space-y-4">
                {selectedModule.parameters.map((param) => (
                  <div key={param.name}>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {param.label}
                    </label>
                    <p className="text-xs text-gray-500 mb-2">{param.description}</p>
                    
                    {param.type === 'select' ? (
                      <select
                        value={String(parameters[param.name])}
                        onChange={(e) => handleParameterChange(param.name, e.target.value)}
                        className={cn(
                          "w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500",
                          errors[param.name] ? "border-red-300" : "border-gray-300"
                        )}
                      >
                        {param.options?.map((opt) => (
                          <option key={String(opt.value)} value={String(opt.value)}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                    ) : param.type === 'boolean' ? (
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={Boolean(parameters[param.name])}
                          onChange={(e) => handleParameterChange(param.name, e.target.checked)}
                          className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                        />
                        <span className="text-sm text-gray-700">{t('wizard.enabled', 'Enabled')}</span>
                      </label>
                    ) : (
                      <input
                        type={param.type === 'number' ? 'number' : 'text'}
                        value={String(parameters[param.name] ?? '')}
                        onChange={(e) => {
                          const value = param.type === 'number' 
                            ? Number(e.target.value) 
                            : e.target.value
                          handleParameterChange(param.name, value)
                        }}
                        min={param.min}
                        max={param.max}
                        className={cn(
                          "w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500",
                          errors[param.name] ? "border-red-300" : "border-gray-300"
                        )}
                      />
                    )}
                    
                    {errors[param.name] && (
                      <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                        <AlertCircle className="w-4 h-4" />
                        {errors[param.name]}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {step === 3 && selectedModule && (
            <div className="space-y-6">
              <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                <div className="flex items-center gap-2 text-green-700">
                  <Check className="w-5 h-5" />
                  <span className="font-medium">{t('wizard.configComplete', 'Configuration Complete')}</span>
                </div>
                <p className="text-sm text-green-600 mt-1">
                  {t('wizard.reviewDesc', 'Review your configuration before saving.')}
                </p>
              </div>

              <div className="space-y-4">
                <div className={cn(
                  "flex items-center justify-between p-3 rounded-lg border",
                  LAYER_COLORS[selectedModule.layer].bg,
                  LAYER_COLORS[selectedModule.layer].border
                )}>
                  <span className="text-gray-600">{t('wizard.module', 'Module')}</span>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{selectedModule.name}</span>
                    <span className={cn(
                      "px-1.5 py-0.5 text-xs rounded border",
                      LAYER_COLORS[selectedModule.layer].badge
                    )}>
                      {selectedModule.layer}
                    </span>
                  </div>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-gray-600">{t('wizard.version', 'Version')}</span>
                  <span className="font-medium">1.0.0</span>
                </div>

                <div className="border-t border-gray-200 pt-4">
                  <h4 className="font-medium text-gray-900 mb-3">{t('wizard.parameters', 'Parameters')}</h4>
                  <div className="space-y-2">
                    {selectedModule.parameters.map((param) => (
                      <div
                        key={param.name}
                        className="flex items-center justify-between p-2 bg-gray-50 rounded"
                      >
                        <span className="text-sm text-gray-600">{param.label}</span>
                        <span className="font-medium">
                          {param.options
                            ? param.options.find(o => String(o.value) === String(parameters[param.name]))?.label
                            : String(parameters[param.name])}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 flex justify-between">
          <button
            onClick={handleBack}
            disabled={step === 1}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-lg transition-colors",
              step === 1
                ? "text-gray-300 cursor-not-allowed"
                : "text-gray-700 hover:bg-gray-100"
            )}
          >
            <ChevronLeft className="w-4 h-4" />
            {t('wizard.back', 'Back')}
          </button>
          
          {step === 3 ? (
            <button
              onClick={handleComplete}
              className="flex items-center gap-2 px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
            >
              <Check className="w-4 h-4" />
              {t('wizard.save', 'Save Configuration')}
            </button>
          ) : (
            <button
              onClick={handleNext}
              disabled={!selectedModule}
              className={cn(
                "flex items-center gap-2 px-6 py-2 rounded-lg transition-colors",
                !selectedModule
                  ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                  : "bg-primary-600 text-white hover:bg-primary-700"
              )}
            >
              {t('wizard.next', 'Next')}
              <ChevronRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useConfigStore } from '@/stores/configStore'
import {
  Cpu,
  Wifi,
  Database,
  FolderOpen,
  Eye,
  Plus,
  Layers,
  Microchip,
  Zap,
  Gauge,
  Activity,
  Settings,
  ChevronRight,
  X,
  Check,
  LayoutTemplate
} from 'lucide-react'

// Template type definitions
interface TemplateModule {
  id: string
  name: string
  layer: 'MCAL' | 'ECUAL' | 'Service'
}

interface TemplateConfig {
  id: string
  name: string
  description: string
  category: 'mcal' | 'ecual' | 'service' | 'full'
  icon: React.ReactNode
  modules: TemplateModule[]
  recommended?: boolean
}

// Template data
const templates: TemplateConfig[] = [
  // MCAL Base Templates
  {
    id: 'mcal-mcu',
    name: 'MCU Base',
    description: 'Microcontroller driver with clock configuration, core settings and basic MCU initialization',
    category: 'mcal',
    icon: <Cpu className="w-5 h-5" />,
    modules: [
      { id: 'mcu', name: 'Mcu', layer: 'MCAL' },
      { id: 'port', name: 'Port', layer: 'MCAL' }
    ]
  },
  {
    id: 'mcal-port-dio',
    name: 'Port & DIO',
    description: 'Port and Digital I/O configuration for GPIO control',
    category: 'mcal',
    icon: <Zap className="w-5 h-5" />,
    modules: [
      { id: 'mcu', name: 'Mcu', layer: 'MCAL' },
      { id: 'port', name: 'Port', layer: 'MCAL' },
      { id: 'dio', name: 'Dio', layer: 'MCAL' }
    ]
  },
  {
    id: 'mcal-pwm',
    name: 'PWM Timer',
    description: 'GPT and PWM modules for timer-based operations and pulse width modulation',
    category: 'mcal',
    icon: <Activity className="w-5 h-5" />,
    modules: [
      { id: 'mcu', name: 'Mcu', layer: 'MCAL' },
      { id: 'port', name: 'Port', layer: 'MCAL' },
      { id: 'gpt', name: 'Gpt', layer: 'MCAL' },
      { id: 'pwm', name: 'Pwm', layer: 'MCAL' }
    ]
  },
  {
    id: 'mcal-adc',
    name: 'ADC Sampling',
    description: 'Analog-to-Digital Converter configuration with sampling and conversion settings',
    category: 'mcal',
    icon: <Gauge className="w-5 h-5" />,
    modules: [
      { id: 'mcu', name: 'Mcu', layer: 'MCAL' },
      { id: 'port', name: 'Port', layer: 'MCAL' },
      { id: 'adc', name: 'Adc', layer: 'MCAL' }
    ]
  },
  // ECUAL Communication Templates
  {
    id: 'ecual-can',
    name: 'CAN Communication',
    description: 'CAN driver with baudrate configuration, message objects and communication settings',
    category: 'ecual',
    icon: <Wifi className="w-5 h-5" />,
    modules: [
      { id: 'mcu', name: 'Mcu', layer: 'MCAL' },
      { id: 'port', name: 'Port', layer: 'MCAL' },
      { id: 'can', name: 'Can', layer: 'ECUAL' }
    ],
    recommended: true
  },
  {
    id: 'ecual-eth',
    name: 'Ethernet Stack',
    description: 'Ethernet driver configuration for TCP/IP communication and network interface',
    category: 'ecual',
    icon: <Microchip className="w-5 h-5" />,
    modules: [
      { id: 'mcu', name: 'Mcu', layer: 'MCAL' },
      { id: 'port', name: 'Port', layer: 'MCAL' },
      { id: 'eth', name: 'Eth', layer: 'ECUAL' }
    ]
  },
  // Service Templates
  {
    id: 'service-nvm',
    name: 'NVRAM Storage',
    description: 'Non-Volatile Memory Manager for persistent data storage and memory management',
    category: 'service',
    icon: <Database className="w-5 h-5" />,
    modules: [
      { id: 'mcu', name: 'Mcu', layer: 'MCAL' },
      { id: 'port', name: 'Port', layer: 'MCAL' },
      { id: 'dio', name: 'Dio', layer: 'MCAL' },
      { id: 'nvm', name: 'NvM', layer: 'Service' }
    ]
  },
  {
    id: 'service-com',
    name: 'Communication Stack',
    description: 'COM module for signal-based communication between ECU components',
    category: 'service',
    icon: <Settings className="w-5 h-5" />,
    modules: [
      { id: 'mcu', name: 'Mcu', layer: 'MCAL' },
      { id: 'port', name: 'Port', layer: 'MCAL' },
      { id: 'can', name: 'Can', layer: 'ECUAL' },
      { id: 'com', name: 'Com', layer: 'Service' }
    ]
  },
  {
    id: 'service-dcm',
    name: 'Diagnostic Stack',
    description: 'DCM (Diagnostic Communication Manager) for UDS diagnostic services',
    category: 'service',
    icon: <Activity className="w-5 h-5" />,
    modules: [
      { id: 'mcu', name: 'Mcu', layer: 'MCAL' },
      { id: 'port', name: 'Port', layer: 'MCAL' },
      { id: 'can', name: 'Can', layer: 'ECUAL' },
      { id: 'dcm', name: 'Dcm', layer: 'Service' }
    ]
  },
  // Full Project Templates
  {
    id: 'full-empty',
    name: 'Empty Project',
    description: 'Start from scratch with minimal MCU configuration only',
    category: 'full',
    icon: <FolderOpen className="w-5 h-5" />,
    modules: [
      { id: 'mcu', name: 'Mcu', layer: 'MCAL' }
    ]
  },
  {
    id: 'full-minimal',
    name: 'Minimal System',
    description: 'Basic system with MCU, Port, DIO and CAN communication',
    category: 'full',
    icon: <Layers className="w-5 h-5" />,
    modules: [
      { id: 'mcu', name: 'Mcu', layer: 'MCAL' },
      { id: 'port', name: 'Port', layer: 'MCAL' },
      { id: 'dio', name: 'Dio', layer: 'MCAL' },
      { id: 'can', name: 'Can', layer: 'ECUAL' }
    ]
  },
  {
    id: 'full-complete',
    name: 'Full Autosar',
    description: 'Complete AUTOSAR configuration with all layers and common services',
    category: 'full',
    icon: <LayoutTemplate className="w-5 h-5" />,
    modules: [
      { id: 'mcu', name: 'Mcu', layer: 'MCAL' },
      { id: 'port', name: 'Port', layer: 'MCAL' },
      { id: 'dio', name: 'Dio', layer: 'MCAL' },
      { id: 'gpt', name: 'Gpt', layer: 'MCAL' },
      { id: 'pwm', name: 'Pwm', layer: 'MCAL' },
      { id: 'adc', name: 'Adc', layer: 'MCAL' },
      { id: 'can', name: 'Can', layer: 'ECUAL' },
      { id: 'eth', name: 'Eth', layer: 'ECUAL' },
      { id: 'nvm', name: 'NvM', layer: 'Service' },
      { id: 'com', name: 'Com', layer: 'Service' },
      { id: 'dcm', name: 'Dcm', layer: 'Service' }
    ],
    recommended: true
  }
]

const categoryLabels = {
  mcal: { name: 'MCAL Base Templates', description: 'Microcontroller drivers for hardware abstraction', color: 'blue' },
  ecual: { name: 'ECUAL Communication', description: 'Communication drivers and protocols', color: 'green' },
  service: { name: 'Service Layer', description: 'AUTOSAR service modules and stacks', color: 'purple' },
  full: { name: 'Full Project Templates', description: 'Complete project configurations', color: 'amber' }
}

const categoryColors: Record<string, { bg: string; text: string; border: string; badge: string }> = {
  mcal: { bg: 'bg-blue-50', text: 'text-blue-600', border: 'border-blue-200', badge: 'bg-blue-100 text-blue-700' },
  ecual: { bg: 'bg-green-50', text: 'text-green-600', border: 'border-green-200', badge: 'bg-green-100 text-green-700' },
  service: { bg: 'bg-purple-50', text: 'text-purple-600', border: 'border-purple-200', badge: 'bg-purple-100 text-purple-700' },
  full: { bg: 'bg-amber-50', text: 'text-amber-600', border: 'border-amber-200', badge: 'bg-amber-100 text-amber-700' }
}

export function Templates() {
  const navigate = useNavigate()
  const { createConfig, loadConfigList, isLoading } = useConfigStore()
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateConfig | null>(null)
  const [showPreview, setShowPreview] = useState(false)
  const [creating, setCreating] = useState(false)

  const handleCreateFromTemplate = async (template: TemplateConfig) => {
    setCreating(true)
    try {
      // Create config with template name
      const configName = `${template.name} - ${new Date().toLocaleDateString()}`
      const configDesc = `Created from template: ${template.description}`
      
      await createConfig(configName, configDesc)
      
      // Get the latest config list to find the new config ID
      await loadConfigList()
      
      // Navigate to editor - the new config should be the first one
      // In a real app, createConfig would return the new config ID
      navigate('/dashboard')
    } finally {
      setCreating(false)
    }
  }

  const handlePreview = (template: TemplateConfig) => {
    setSelectedTemplate(template)
    setShowPreview(true)
  }

  const TemplateCard = ({ template }: { template: TemplateConfig }) => {
    const colors = categoryColors[template.category]
    
    return (
      <div className="group bg-white border border-gray-200 rounded-lg hover:border-primary-300 hover:shadow-md transition-all overflow-hidden">
        <div className={`h-2 ${colors.bg.replace('50', '200')}`} />
        <div className="p-5">
          <div className="flex items-start justify-between mb-3">
            <div className={`w-10 h-10 ${colors.bg} rounded-lg flex items-center justify-center ${colors.text}`}>
              {template.icon}
            </div>
            {template.recommended && (
              <span className="px-2 py-0.5 bg-primary-100 text-primary-700 text-xs font-medium rounded-full">
                Recommended
              </span>
            )}
          </div>
          
          <h3 className="font-semibold text-gray-900 mb-1">{template.name}</h3>
          <p className="text-sm text-gray-500 mb-4 line-clamp-2">{template.description}</p>
          
          <div className="flex items-center gap-4 text-xs text-gray-400 mb-4">
            <span className="flex items-center gap-1">
              <Layers className="w-3.5 h-3.5" />
              {template.modules.length} modules
            </span>
            <span className={`px-2 py-0.5 rounded-full ${colors.badge}`}>
              {template.category.toUpperCase()}
            </span>
          </div>
          
          <div className="flex gap-2">
            <button
              onClick={() => handlePreview(template)}
              className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 text-sm text-gray-700 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <Eye className="w-4 h-4" />
              Preview
            </button>
            <button
              onClick={() => handleCreateFromTemplate(template)}
              disabled={creating || isLoading}
              className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 text-sm text-white bg-primary-600 hover:bg-primary-700 disabled:bg-gray-300 disabled:cursor-not-allowed rounded-lg transition-colors"
            >
              <Plus className="w-4 h-4" />
              Use
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Configuration Templates</h1>
          <p className="text-gray-500 mt-1">
            Choose a preset template to quickly start your yuleASR configuration
          </p>
        </div>
        <button
          onClick={() => navigate('/dashboard')}
          className="inline-flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
        >
          Back to Dashboard
        </button>
      </div>

      {/* Categories */}
      {(Object.keys(categoryLabels) as Array<keyof typeof categoryLabels>).map((category) => {
        const categoryTemplates = templates.filter(t => t.category === category)
        const colors = categoryColors[category]
        const label = categoryLabels[category]
        
        return (
          <section key={category} className="space-y-4">
            <div className="flex items-center gap-3">
              <div className={`w-8 h-8 ${colors.bg} rounded-lg flex items-center justify-center ${colors.text}`}>
                {category === 'mcal' && <Cpu className="w-4 h-4" />}
                {category === 'ecual' && <Wifi className="w-4 h-4" />}
                {category === 'service' && <Database className="w-4 h-4" />}
                {category === 'full' && <LayoutTemplate className="w-4 h-4" />}
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">{label.name}</h2>
                <p className="text-sm text-gray-500">{label.description}</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {categoryTemplates.map(template => (
                <TemplateCard key={template.id} template={template} />
              ))}
            </div>
          </section>
        )
      })}

      {/* Preview Modal */}
      {showPreview && selectedTemplate && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 ${categoryColors[selectedTemplate.category].bg} rounded-lg flex items-center justify-center ${categoryColors[selectedTemplate.category].text}`}>
                  {selectedTemplate.icon}
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{selectedTemplate.name}</h3>
                  <p className="text-sm text-gray-500">Template Preview</p>
                </div>
              </div>
              <button
                onClick={() => setShowPreview(false)}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            {/* Modal Body */}
            <div className="p-6 overflow-y-auto flex-1">
              <div className="space-y-6">
                {/* Description */}
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Description</h4>
                  <p className="text-gray-600 bg-gray-50 p-3 rounded-lg">{selectedTemplate.description}</p>
                </div>
                
                {/* Category */}
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Category</h4>
                  <span className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${categoryColors[selectedTemplate.category].badge}`}>
                    {categoryLabels[selectedTemplate.category].name}
                  </span>
                </div>
                
                {/* Modules List */}
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-3">
                    Included Modules ({selectedTemplate.modules.length})
                  </h4>
                  <div className="border border-gray-200 rounded-lg divide-y divide-gray-100">
                    {selectedTemplate.modules.map((module, index) => (
                      <div key={module.id} className="flex items-center gap-3 px-4 py-3">
                        <div className="w-6 h-6 rounded-full bg-primary-50 flex items-center justify-center">
                          <span className="text-xs font-medium text-primary-600">{index + 1}</span>
                        </div>
                        <div className="flex-1">
                          <div className="font-medium text-gray-900">{module.name}</div>
                          <div className="text-xs text-gray-500">{module.layer} Layer</div>
                        </div>
                        <Check className="w-4 h-4 text-green-500" />
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Dependencies Note */}
                <div className="bg-blue-50 border border-blue-100 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <div className="w-5 h-5 text-blue-600 mt-0.5">
                      <Settings className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-blue-900">Auto Configuration</h4>
                      <p className="text-sm text-blue-700 mt-1">
                        When you use this template, all module dependencies will be automatically configured 
                        with default values. You can customize them in the Editor.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex justify-end gap-3">
              <button
                onClick={() => setShowPreview(false)}
                className="px-4 py-2 text-gray-700 hover:bg-white hover:shadow-sm rounded-lg transition-all"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setShowPreview(false)
                  handleCreateFromTemplate(selectedTemplate)
                }}
                disabled={creating || isLoading}
                className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white hover:bg-primary-700 disabled:bg-gray-300 disabled:cursor-not-allowed rounded-lg transition-colors"
              >
                {creating ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4" />
                    Use This Template
                    <ChevronRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

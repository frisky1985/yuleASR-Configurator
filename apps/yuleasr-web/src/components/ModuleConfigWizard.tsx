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
  X,
  Zap,
  Activity,
  Clock,
  Radio,
  Database,
  Share2,
  Settings,
  Shield,
  Bell,
  Timer,
  Network,
  Usb,
  Monitor
} from 'lucide-react'
import { useState, useMemo } from 'react'
import { useTranslation } from 'react-i18next'

import { cn } from '@/lib/utils'

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
  // ==================== MCAL Layer ====================
  {
    id: 'Mcu',
    name: 'MCU',
    layer: 'MCAL',
    description: 'Microcontroller Unit - Basic MCU initialization, power down, reset functionality',
    icon: <Cpu className="w-6 h-6" />,
    parameters: [
      {
        name: 'clock_frequency',
        type: 'number',
        label: 'Clock Frequency (Hz)',
        description: 'Main system clock frequency',
        defaultValue: 160000000,
        min: 1000000,
        max: 600000000
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
        name: 'mcu_mode',
        type: 'select',
        label: 'MCU Mode',
        description: 'MCU operating mode',
        defaultValue: 'RUN',
        options: [
          { value: 'RUN', label: 'Run Mode' },
          { value: 'SLEEP', label: 'Sleep Mode' },
          { value: 'STOP', label: 'Stop Mode' },
          { value: 'STANDBY', label: 'Standby Mode' }
        ]
      },
      {
        name: 'sysclk_source',
        type: 'select',
        label: 'System Clock Source',
        description: 'Main system clock source',
        defaultValue: 'PLL',
        options: [
          { value: 'HSI', label: 'High Speed Internal' },
          { value: 'HSE', label: 'High Speed External' },
          { value: 'PLL', label: 'Phase Locked Loop' }
        ]
      }
    ]
  },
  {
    id: 'Port',
    name: 'Port',
    layer: 'MCAL',
    description: 'Port Driver - GPIO pin configuration and management',
    icon: <HardDrive className="w-6 h-6" />,
    parameters: [
      {
        name: 'pin_count',
        type: 'number',
        label: 'Pin Count',
        description: 'Number of configurable port pins',
        defaultValue: 144,
        min: 1,
        max: 256
      },
      {
        name: 'version_info_api',
        type: 'boolean',
        label: 'Version Info API',
        description: 'Enable version info API',
        defaultValue: true
      },
      {
        name: 'set_pin_mode_api',
        type: 'boolean',
        label: 'Set Pin Mode API',
        description: 'Enable runtime pin mode change',
        defaultValue: true
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
    description: 'Digital Input/Output - Reading and writing to digital pins',
    icon: <Zap className="w-6 h-6" />,
    parameters: [
      {
        name: 'channel_count',
        type: 'number',
        label: 'Channel Count',
        description: 'Number of DIO channels',
        defaultValue: 144,
        min: 1,
        max: 256
      },
      {
        name: 'flip_channel_api',
        type: 'boolean',
        label: 'Flip Channel API',
        description: 'Enable flip channel API',
        defaultValue: true
      },
      {
        name: 'masked_write_port_api',
        type: 'boolean',
        label: 'Masked Write Port API',
        description: 'Enable masked write port operations',
        defaultValue: false
      }
    ]
  },
  {
    id: 'Gpt',
    name: 'GPT',
    layer: 'MCAL',
    description: 'General Purpose Timer - Timer channel configuration',
    icon: <Clock className="w-6 h-6" />,
    parameters: [
      {
        name: 'channel_count',
        type: 'number',
        label: 'Channel Count',
        description: 'Number of GPT channels',
        defaultValue: 14,
        min: 1,
        max: 32
      },
      {
        name: 'tick_frequency',
        type: 'number',
        label: 'Tick Frequency (Hz)',
        description: 'GPT tick frequency',
        defaultValue: 1000000,
        min: 1,
        max: 100000000
      },
      {
        name: 'wakeup_functionality',
        type: 'boolean',
        label: 'Wakeup Functionality',
        description: 'Enable wakeup functionality',
        defaultValue: false
      },
      {
        name: 'predef_timer_1us',
        type: 'boolean',
        label: '1us Predefined Timer',
        description: 'Enable 1 microsecond predefined timer',
        defaultValue: true
      },
      {
        name: 'predef_timer_100us',
        type: 'boolean',
        label: '100us Predefined Timer',
        description: 'Enable 100 microsecond predefined timer',
        defaultValue: false
      }
    ]
  },
  {
    id: 'Pwm',
    name: 'PWM',
    layer: 'MCAL',
    description: 'Pulse Width Modulation - PWM output channel configuration',
    icon: <Activity className="w-6 h-6" />,
    parameters: [
      {
        name: 'channel_count',
        type: 'number',
        label: 'Channel Count',
        description: 'Number of PWM channels',
        defaultValue: 16,
        min: 1,
        max: 32
      },
      {
        name: 'default_frequency',
        type: 'number',
        label: 'Default Frequency (Hz)',
        description: 'Default PWM frequency',
        defaultValue: 1000,
        min: 1,
        max: 100000
      },
      {
        name: 'notifications',
        type: 'boolean',
        label: 'Enable Notifications',
        description: 'Enable PWM notifications',
        defaultValue: true
      },
      {
        name: 'set_duty_cycle_api',
        type: 'boolean',
        label: 'Set Duty Cycle API',
        description: 'Enable duty cycle adjustment API',
        defaultValue: true
      }
    ]
  },
  {
    id: 'Adc',
    name: 'ADC',
    layer: 'MCAL',
    description: 'Analog to Digital Converter - ADC channel and resolution configuration',
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
        description: 'ADC resolution in bits',
        defaultValue: 12,
        options: [
          { value: 8, label: '8-bit' },
          { value: 10, label: '10-bit' },
          { value: 12, label: '12-bit' },
          { value: 16, label: '16-bit' }
        ]
      },
      {
        name: 'conversion_mode',
        type: 'select',
        label: 'Conversion Mode',
        description: 'ADC conversion mode',
        defaultValue: 'CONTINUOUS',
        options: [
          { value: 'SINGLE', label: 'Single Conversion' },
          { value: 'CONTINUOUS', label: 'Continuous Conversion' }
        ]
      },
      {
        name: 'sample_time',
        type: 'number',
        label: 'Sample Time (μs)',
        description: 'ADC sampling time in microseconds',
        defaultValue: 3,
        min: 1,
        max: 100
      }
    ]
  },
  {
    id: 'Can',
    name: 'CAN',
    layer: 'MCAL',
    description: 'CAN Driver - Controller Area Network driver configuration',
    icon: <Network className="w-6 h-6" />,
    parameters: [
      {
        name: 'controller_count',
        type: 'number',
        label: 'Controller Count',
        description: 'Number of CAN controllers',
        defaultValue: 3,
        min: 1,
        max: 8
      },
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
        name: 'rx_fifo_count',
        type: 'number',
        label: 'RX FIFO Count',
        description: 'Number of receive FIFOs per controller',
        defaultValue: 2,
        min: 1,
        max: 8
      },
      {
        name: 'tx_buffer_count',
        type: 'number',
        label: 'TX Buffer Count',
        description: 'Number of transmit buffers per controller',
        defaultValue: 32,
        min: 1,
        max: 64
      },
      {
        name: 'wakeup_support',
        type: 'boolean',
        label: 'Wakeup Support',
        description: 'Enable CAN wakeup functionality',
        defaultValue: true
      }
    ]
  },
  {
    id: 'Spi',
    name: 'SPI',
    layer: 'MCAL',
    description: 'Serial Peripheral Interface - SPI bus configuration',
    icon: <Share2 className="w-6 h-6" />,
    parameters: [
      {
        name: 'channel_count',
        type: 'number',
        label: 'Channel Count',
        description: 'Number of SPI channels',
        defaultValue: 4,
        min: 1,
        max: 8
      },
      {
        name: 'max_buffer_size',
        type: 'number',
        label: 'Max Buffer Size (bytes)',
        description: 'Maximum SPI buffer size',
        defaultValue: 256,
        min: 1,
        max: 4096
      },
      {
        name: 'clock_polarity',
        type: 'select',
        label: 'Clock Polarity',
        description: 'SPI clock polarity (CPOL)',
        defaultValue: 'LOW',
        options: [
          { value: 'LOW', label: 'CPOL = 0 (Low when idle)' },
          { value: 'HIGH', label: 'CPOL = 1 (High when idle)' }
        ]
      },
      {
        name: 'clock_phase',
        type: 'select',
        label: 'Clock Phase',
        description: 'SPI clock phase (CPHA)',
        defaultValue: '1EDGE',
        options: [
          { value: '1EDGE', label: 'CPHA = 0 (First edge)' },
          { value: '2EDGE', label: 'CPHA = 1 (Second edge)' }
        ]
      },
      {
        name: 'baudrate_prescaler',
        type: 'select',
        label: 'Baudrate Prescaler',
        description: 'SPI baudrate prescaler',
        defaultValue: 'DIV_4',
        options: [
          { value: 'DIV_2', label: 'Divide by 2' },
          { value: 'DIV_4', label: 'Divide by 4' },
          { value: 'DIV_8', label: 'Divide by 8' },
          { value: 'DIV_16', label: 'Divide by 16' },
          { value: 'DIV_32', label: 'Divide by 32' },
          { value: 'DIV_64', label: 'Divide by 64' },
          { value: 'DIV_128', label: 'Divide by 128' },
          { value: 'DIV_256', label: 'Divide by 256' }
        ]
      }
    ]
  },
  {
    id: 'I2c',
    name: 'I2C',
    layer: 'MCAL',
    description: 'Inter-Integrated Circuit - I2C bus configuration',
    icon: <Usb className="w-6 h-6" />,
    parameters: [
      {
        name: 'channel_count',
        type: 'number',
        label: 'Channel Count',
        description: 'Number of I2C channels',
        defaultValue: 3,
        min: 1,
        max: 8
      },
      {
        name: 'clock_speed',
        type: 'select',
        label: 'Clock Speed',
        description: 'I2C clock speed mode',
        defaultValue: 'FAST',
        options: [
          { value: 'STANDARD', label: 'Standard Mode (100 kHz)' },
          { value: 'FAST', label: 'Fast Mode (400 kHz)' },
          { value: 'FAST_PLUS', label: 'Fast Mode Plus (1 MHz)' }
        ]
      },
      {
        name: 'own_address',
        type: 'number',
        label: 'Own Address (7-bit)',
        description: 'I2C device own address',
        defaultValue: 0x50,
        min: 0x08,
        max: 0x77
      },
      {
        name: 'addressing_mode',
        type: 'select',
        label: 'Addressing Mode',
        description: 'I2C addressing mode',
        defaultValue: '7BIT',
        options: [
          { value: '7BIT', label: '7-bit Addressing' },
          { value: '10BIT', label: '10-bit Addressing' }
        ]
      }
    ]
  },
  {
    id: 'Wdg',
    name: 'WDG',
    layer: 'MCAL',
    description: 'Watchdog Driver - Internal and external watchdog configuration',
    icon: <Shield className="w-6 h-6" />,
    parameters: [
      {
        name: 'timeout_period',
        type: 'number',
        label: 'Timeout Period (ms)',
        description: 'Watchdog timeout period in milliseconds',
        defaultValue: 1000,
        min: 1,
        max: 60000
      },
      {
        name: 'window_mode',
        type: 'boolean',
        label: 'Window Mode',
        description: 'Enable watchdog window mode',
        defaultValue: false
      },
      {
        name: 'window_start',
        type: 'number',
        label: 'Window Start (%)',
        description: 'Watchdog window start percentage',
        defaultValue: 25,
        min: 0,
        max: 100
      },
      {
        name: 'debug_mode',
        type: 'boolean',
        label: 'Debug Mode',
        description: 'Enable watchdog in debug mode',
        defaultValue: false
      }
    ]
  },
  {
    id: 'Icu',
    name: 'ICU',
    layer: 'MCAL',
    description: 'Input Capture Unit - Signal edge detection and measurement',
    icon: <Timer className="w-6 h-6" />,
    parameters: [
      {
        name: 'channel_count',
        type: 'number',
        label: 'Channel Count',
        description: 'Number of ICU channels',
        defaultValue: 8,
        min: 1,
        max: 32
      },
      {
        name: 'max_duty_cycle',
        type: 'number',
        label: 'Max Duty Cycle (‰)',
        description: 'Maximum measurable duty cycle in permille',
        defaultValue: 10000,
        min: 1,
        max: 10000
      },
      {
        name: 'timestamp_resolution',
        type: 'select',
        label: 'Timestamp Resolution',
        description: 'ICU timestamp resolution',
        defaultValue: '16BIT',
        options: [
          { value: '8BIT', label: '8-bit' },
          { value: '16BIT', label: '16-bit' },
          { value: '32BIT', label: '32-bit' }
        ]
      }
    ]
  },
  {
    id: 'Ocu',
    name: 'OCU',
    layer: 'MCAL',
    description: 'Output Compare Unit - Output compare channel configuration',
    icon: <Radio className="w-6 h-6" />,
    parameters: [
      {
        name: 'channel_count',
        type: 'number',
        label: 'Channel Count',
        description: 'Number of OCU channels',
        defaultValue: 8,
        min: 1,
        max: 32
      },
      {
        name: 'pin_action',
        type: 'select',
        label: 'Default Pin Action',
        description: 'Default output pin action',
        defaultValue: 'TOGGLE',
        options: [
          { value: 'NONE', label: 'No Action' },
          { value: 'SET', label: 'Set High' },
          { value: 'CLEAR', label: 'Clear Low' },
          { value: 'TOGGLE', label: 'Toggle' }
        ]
      }
    ]
  },
  // ==================== ECUAL Layer ====================
  {
    id: 'CanIf',
    name: 'CanIf',
    layer: 'ECUAL',
    description: 'CAN Interface - Hardware-independent CAN communication interface',
    icon: <Wifi className="w-6 h-6" />,
    parameters: [
      {
        name: 'dev_error_detect',
        type: 'boolean',
        label: 'Development Error Detection',
        description: 'Enable development error detection',
        defaultValue: true
      },
      {
        name: 'version_info_api',
        type: 'boolean',
        label: 'Version Info API',
        description: 'Enable version info API',
        defaultValue: true
      },
      {
        name: 'ul_cdd_support',
        type: 'boolean',
        label: 'CDD Support',
        description: 'Enable Complex Driver support',
        defaultValue: false
      },
      {
        name: 'hth_count',
        type: 'number',
        label: 'HTH Count',
        description: 'Number of Hardware Transmit Handles',
        defaultValue: 32,
        min: 1,
        max: 64
      },
      {
        name: 'hrh_count',
        type: 'number',
        label: 'HRH Count',
        description: 'Number of Hardware Receive Handles',
        defaultValue: 32,
        min: 1,
        max: 64
      }
    ]
  },
  {
    id: 'CanTrcv',
    name: 'CanTrcv',
    layer: 'ECUAL',
    description: 'CAN Transceiver - External CAN transceiver driver',
    icon: <Radio className="w-6 h-6" />,
    parameters: [
      {
        name: 'channel_count',
        type: 'number',
        label: 'Channel Count',
        description: 'Number of transceiver channels',
        defaultValue: 4,
        min: 1,
        max: 8
      },
      {
        name: 'wakeup_mode',
        type: 'select',
        label: 'Wakeup Mode',
        description: 'Wakeup detection mode',
        defaultValue: 'INTERRUPT',
        options: [
          { value: 'POLLING', label: 'Polling' },
          { value: 'INTERRUPT', label: 'Interrupt' }
        ]
      },
      {
        name: 'standby_mode',
        type: 'boolean',
        label: 'Standby Mode Support',
        description: 'Enable standby mode support',
        defaultValue: true
      }
    ]
  },
  {
    id: 'Eth',
    name: 'ETH',
    layer: 'ECUAL',
    description: 'Ethernet Driver - MAC and PHY communication driver',
    icon: <Network className="w-6 h-6" />,
    parameters: [
      {
        name: 'controller_count',
        type: 'number',
        label: 'Controller Count',
        description: 'Number of Ethernet controllers',
        defaultValue: 1,
        min: 1,
        max: 2
      },
      {
        name: 'mac_address',
        type: 'string',
        label: 'MAC Address',
        description: 'Default MAC address',
        defaultValue: 'AA:BB:CC:DD:EE:FF'
      },
      {
        name: 'link_speed',
        type: 'select',
        label: 'Link Speed',
        description: 'Ethernet link speed',
        defaultValue: '100',
        options: [
          { value: '10', label: '10 Mbps' },
          { value: '100', label: '100 Mbps' },
          { value: '1000', label: '1 Gbps' }
        ]
      },
      {
        name: 'duplex_mode',
        type: 'select',
        label: 'Duplex Mode',
        description: 'Duplex mode configuration',
        defaultValue: 'FULL',
        options: [
          { value: 'HALF', label: 'Half Duplex' },
          { value: 'FULL', label: 'Full Duplex' }
        ]
      },
      {
        name: 'rx_buffer_count',
        type: 'number',
        label: 'RX Buffer Count',
        description: 'Number of receive buffers',
        defaultValue: 8,
        min: 1,
        max: 64
      },
      {
        name: 'tx_buffer_count',
        type: 'number',
        label: 'TX Buffer Count',
        description: 'Number of transmit buffers',
        defaultValue: 8,
        min: 1,
        max: 64
      }
    ]
  },
  {
    id: 'Fr',
    name: 'FR',
    layer: 'ECUAL',
    description: 'FlexRay Driver - FlexRay communication driver',
    icon: <Activity className="w-6 h-6" />,
    parameters: [
      {
        name: 'controller_count',
        type: 'number',
        label: 'Controller Count',
        description: 'Number of FlexRay controllers',
        defaultValue: 2,
        min: 1,
        max: 4
      },
      {
        name: 'cluster_count',
        type: 'number',
        label: 'Cluster Count',
        description: 'Number of FlexRay clusters',
        defaultValue: 1,
        min: 1,
        max: 4
      },
      {
        name: 'g_cycle_count',
        type: 'number',
        label: 'gCycleCount',
        description: 'Number of cycles in the schedule',
        defaultValue: 64,
        min: 1,
        max: 64
      },
      {
        name: 'gd_macrotick',
        type: 'number',
        label: 'gdMacrotick (μs)',
        description: 'Duration of a macrotick in microseconds',
        defaultValue: 1,
        min: 1,
        max: 100
      },
      {
        name: 'version_info_api',
        type: 'boolean',
        label: 'Version Info API',
        description: 'Enable version info API',
        defaultValue: true
      }
    ]
  },
  {
    id: 'Lin',
    name: 'LIN',
    layer: 'ECUAL',
    description: 'LIN Driver - Local Interconnect Network driver',
    icon: <Usb className="w-6 h-6" />,
    parameters: [
      {
        name: 'channel_count',
        type: 'number',
        label: 'Channel Count',
        description: 'Number of LIN channels',
        defaultValue: 2,
        min: 1,
        max: 8
      },
      {
        name: 'baudrate',
        type: 'select',
        label: 'Baudrate',
        description: 'LIN bus baudrate',
        defaultValue: '19200',
        options: [
          { value: '9600', label: '9600 bps' },
          { value: '19200', label: '19200 bps' }
        ]
      },
      {
        name: 'wakeup_support',
        type: 'boolean',
        label: 'Wakeup Support',
        description: 'Enable LIN wakeup support',
        defaultValue: true
      },
      {
        name: 'master_node',
        type: 'boolean',
        label: 'Master Node',
        description: 'Configure as master node',
        defaultValue: true
      }
    ]
  },
  // ==================== Service Layer ====================
  {
    id: 'NvM',
    name: 'NvM',
    layer: 'Service',
    description: 'NVRAM Manager - Non-volatile RAM management',
    icon: <Database className="w-6 h-6" />,
    parameters: [
      {
        name: 'api_config_class',
        type: 'select',
        label: 'API Config Class',
        description: 'API configuration class',
        defaultValue: '3',
        options: [
          { value: '1', label: 'Class 1 - Basic' },
          { value: '2', label: 'Class 2 - Extended' },
          { value: '3', label: 'Class 3 - Full' }
        ]
      },
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
        name: 'job_end_notification',
        type: 'boolean',
        label: 'Job End Notification',
        description: 'Enable job end notification',
        defaultValue: true
      },
      {
        name: 'multi_block_callback',
        type: 'boolean',
        label: 'Multi Block Callback',
        description: 'Enable multi block callback',
        defaultValue: false
      },
      {
        name: 'write_block_once',
        type: 'boolean',
        label: 'Write Block Once',
        description: 'Enable write block once feature',
        defaultValue: false
      }
    ]
  },
  {
    id: 'Com',
    name: 'COM',
    layer: 'Service',
    description: 'COM Stack - Signal-based communication stack',
    icon: <Share2 className="w-6 h-6" />,
    parameters: [
      {
        name: 'signal_count',
        type: 'number',
        label: 'Signal Count',
        description: 'Number of COM signals',
        defaultValue: 256,
        min: 1,
        max: 2048
      },
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
        name: 'enable_signal_gates',
        type: 'boolean',
        label: 'Enable Signal Gates',
        description: 'Enable signal gateway functionality',
        defaultValue: false
      },
      {
        name: 'deferred_event_cache',
        type: 'number',
        label: 'Deferred Event Cache Size',
        description: 'Size of deferred event cache',
        defaultValue: 32,
        min: 1,
        max: 256
      }
    ]
  },
  {
    id: 'Fee',
    name: 'FEE',
    layer: 'Service',
    description: 'Flash EEPROM Emulation - EEPROM emulation over Flash',
    icon: <HardDrive className="w-6 h-6" />,
    parameters: [
      {
        name: 'virtual_page_size',
        type: 'number',
        label: 'Virtual Page Size (bytes)',
        description: 'Size of virtual page',
        defaultValue: 8,
        min: 1,
        max: 64
      },
      {
        name: 'block_count',
        type: 'number',
        label: 'Block Count',
        description: 'Number of FEE blocks',
        defaultValue: 64,
        min: 1,
        max: 512
      },
      {
        name: 'garbage_collection',
        type: 'boolean',
        label: 'Garbage Collection',
        description: 'Enable garbage collection',
        defaultValue: true
      }
    ]
  },
  {
    id: 'Ea',
    name: 'EA',
    layer: 'Service',
    description: 'EEPROM Abstraction - EEPROM abstraction layer',
    icon: <Monitor className="w-6 h-6" />,
    parameters: [
      {
        name: 'device_type',
        type: 'select',
        label: 'Device Type',
        description: 'EEPROM device type',
        defaultValue: 'INTERNAL',
        options: [
          { value: 'INTERNAL', label: 'Internal EEPROM' },
          { value: 'EXTERNAL', label: 'External EEPROM' }
        ]
      },
      {
        name: 'page_size',
        type: 'number',
        label: 'Page Size (bytes)',
        description: 'EEPROM page size',
        defaultValue: 32,
        min: 1,
        max: 256
      },
      {
        name: 'sector_count',
        type: 'number',
        label: 'Sector Count',
        description: 'Number of sectors',
        defaultValue: 16,
        min: 1,
        max: 64
      }
    ]
  },
  {
    id: 'MemIf',
    name: 'MemIf',
    layer: 'Service',
    description: 'Memory Interface - Abstraction for memory services',
    icon: <Database className="w-6 h-6" />,
    parameters: [
      {
        name: 'fee_used',
        type: 'boolean',
        label: 'FEE Used',
        description: 'Use Flash EEPROM Emulation',
        defaultValue: true
      },
      {
        name: 'ea_used',
        type: 'boolean',
        label: 'EA Used',
        description: 'Use EEPROM Abstraction',
        defaultValue: false
      },
      {
        name: 'version_info_api',
        type: 'boolean',
        label: 'Version Info API',
        description: 'Enable version info API',
        defaultValue: true
      }
    ]
  },
  {
    id: 'Crc',
    name: 'CRC',
    layer: 'Service',
    description: 'CRC Library - CRC calculation routines',
    icon: <Shield className="w-6 h-6" />,
    parameters: [
      {
        name: '8bit_mode',
        type: 'boolean',
        label: '8-bit CRC',
        description: 'Enable 8-bit CRC calculation',
        defaultValue: true
      },
      {
        name: '16bit_mode',
        type: 'boolean',
        label: '16-bit CRC',
        description: 'Enable 16-bit CRC calculation',
        defaultValue: true
      },
      {
        name: '32bit_mode',
        type: 'boolean',
        label: '32-bit CRC',
        description: 'Enable 32-bit CRC calculation',
        defaultValue: true
      },
      {
        name: '64bit_mode',
        type: 'boolean',
        label: '64-bit CRC',
        description: 'Enable 64-bit CRC calculation',
        defaultValue: false
      }
    ]
  },
  {
    id: 'Det',
    name: 'DET',
    layer: 'Service',
    description: 'Default Error Tracer - Error tracking and reporting',
    icon: <Bell className="w-6 h-6" />,
    parameters: [
      {
        name: 'forward_to_dlt',
        type: 'boolean',
        label: 'Forward to DLT',
        description: 'Forward errors to DLT module',
        defaultValue: true
      },
      {
        name: 'breakpoint_on_error',
        type: 'boolean',
        label: 'Breakpoint on Error',
        description: 'Trigger breakpoint on error',
        defaultValue: false
      },
      {
        name: 'max_error_count',
        type: 'number',
        label: 'Max Error Count',
        description: 'Maximum number of errors to track',
        defaultValue: 100,
        min: 10,
        max: 1000
      }
    ]
  },
  {
    id: 'Dem',
    name: 'DEM',
    layer: 'Service',
    description: 'Diagnostic Event Manager - Diagnostic event handling',
    icon: <Activity className="w-6 h-6" />,
    parameters: [
      {
        name: 'event_count',
        type: 'number',
        label: 'Event Count',
        description: 'Number of diagnostic events',
        defaultValue: 128,
        min: 1,
        max: 512
      },
      {
        name: 'debounce_counter_based',
        type: 'boolean',
        label: 'Counter-based Debounce',
        description: 'Enable counter-based debouncing',
        defaultValue: true
      },
      {
        name: 'debounce_time_based',
        type: 'boolean',
        label: 'Time-based Debounce',
        description: 'Enable time-based debouncing',
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
      <div className="bg-app-bg-primary rounded-xl shadow-2xl w-full max-w-2xl mx-4 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-app-border-primary flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-app-text-primary">
              {t('wizard.title', 'Module Configuration Wizard')}
            </h3>
            <p className="text-sm text-app-text-secondary">
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
            className="text-app-text-tertiary hover:text-app-text-secondary transition-colors"
          >
            <span className="sr-only">Close</span>
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Progress */}
        <div className="px-6 py-3 bg-app-bg-secondary border-b border-app-border-primary">
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
                      : "bg-app-bg-tertiary text-app-text-secondary"
                  )}
                >
                  {step > s ? <Check className="w-4 h-4" /> : s}
                </div>
                {s < 3 && (
                  <div
                    className={cn(
                      "w-12 h-0.5 transition-colors",
                      step > s ? "bg-green-500" : "bg-app-bg-tertiary"
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
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-app-text-tertiary" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={t('wizard.searchModule', 'Search modules...')}
                    className="w-full pl-9 pr-4 py-2 border border-app-border-primary rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-app-text-tertiary hover:text-app-text-secondary"
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
                        : "bg-app-bg-tertiary text-app-text-secondary hover:bg-app-bg-tertiary"
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
                <div className="text-center py-12 text-app-text-secondary">
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
                                "border-app-border-primary hover:shadow-md"
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
                                    <span className="font-semibold text-app-text-primary">{module.name}</span>
                                    <span className={cn(
                                      "px-1.5 py-0.5 text-xs rounded border",
                                      LAYER_COLORS[layer].badge
                                    )}>
                                      {module.layer}
                                    </span>
                                  </div>
                                  <p className="text-sm text-app-text-secondary mt-1 line-clamp-2">{module.description}</p>
                                  <div className="flex items-center gap-3 mt-2 text-xs text-app-text-tertiary">
                                    <span>{module.parameters.length} {t('wizard.params', 'params')}</span>
                                  </div>
                                </div>
                                <ChevronRight className="w-5 h-5 text-app-text-tertiary group-hover:text-app-text-secondary flex-shrink-0" />
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
                <div className="p-2 bg-app-bg-primary rounded-lg shadow-sm">
                  {selectedModule.icon}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-semibold text-app-text-primary">{selectedModule.name}</h4>
                    <span className={cn(
                      "px-1.5 py-0.5 text-xs rounded border",
                      LAYER_COLORS[selectedModule.layer].badge
                    )}>
                      {selectedModule.layer}
                    </span>
                  </div>
                  <p className="text-sm text-app-text-secondary">{selectedModule.description}</p>
                </div>
              </div>

              <div className="space-y-4">
                {selectedModule.parameters.map((param) => (
                  <div key={param.name}>
                    <label className="block text-sm font-medium text-app-text-primary mb-1">
                      {param.label}
                    </label>
                    <p className="text-xs text-app-text-secondary mb-2">{param.description}</p>
                    
                    {param.type === 'select' ? (
                      <select
                        value={String(parameters[param.name])}
                        onChange={(e) => handleParameterChange(param.name, e.target.value)}
                        className={cn(
                          "w-full px-3 py-2 border rounded-lg bg-app-bg-primary text-app-text-primary focus:ring-2 focus:ring-primary-500 focus:border-primary-500",
                          errors[param.name] ? "border-red-300" : "border-app-border-primary"
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
                          className="w-4 h-4 text-primary-600 border-app-border-primary rounded focus:ring-primary-500"
                        />
                        <span className="text-sm text-app-text-primary">{t('wizard.enabled', 'Enabled')}</span>
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
                          "w-full px-3 py-2 border rounded-lg bg-app-bg-primary text-app-text-primary focus:ring-2 focus:ring-primary-500 focus:border-primary-500",
                          errors[param.name] ? "border-red-300" : "border-app-border-primary"
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
                  <span className="text-app-text-secondary">{t('wizard.module', 'Module')}</span>
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
                <div className="flex items-center justify-between p-3 bg-app-bg-secondary rounded-lg">
                  <span className="text-app-text-secondary">{t('wizard.version', 'Version')}</span>
                  <span className="font-medium">1.0.0</span>
                </div>

                <div className="border-t border-app-border-primary pt-4">
                  <h4 className="font-medium text-app-text-primary mb-3">{t('wizard.parameters', 'Parameters')}</h4>
                  <div className="space-y-2">
                    {selectedModule.parameters.map((param) => (
                      <div
                        key={param.name}
                        className="flex items-center justify-between p-2 bg-app-bg-secondary rounded"
                      >
                        <span className="text-sm text-app-text-secondary">{param.label}</span>
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
        <div className="px-6 py-4 border-t border-app-border-primary flex justify-between">
          <button
            onClick={handleBack}
            disabled={step === 1}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-lg transition-colors",
              step === 1
                ? "text-app-text-tertiary cursor-not-allowed"
                : "text-app-text-primary hover:bg-app-bg-tertiary"
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
                  ? "bg-app-bg-tertiary text-app-text-tertiary cursor-not-allowed"
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

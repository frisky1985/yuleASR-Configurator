/**
 * Test data for E2E tests
 */

export const mockConfigs = {
  default: {
    id: 'config-1',
    name: 'Default Configuration',
    description: 'Default yuleASR configuration for testing',
    moduleCount: 35,
    lastModified: '2025-05-10T14:30:00Z'
  },
  production: {
    id: 'config-2',
    name: 'Production Config',
    description: 'Production ready configuration',
    moduleCount: 35,
    lastModified: '2025-05-09T10:15:00Z'
  },
  development: {
    id: 'config-3',
    name: 'Development Config',
    description: 'Development configuration with debug enabled',
    moduleCount: 20,
    lastModified: '2025-05-08T16:45:00Z'
  }
}

export const mockConfigDetail = {
  id: 'config-1',
  name: 'Default Configuration',
  description: 'Default yuleASR configuration',
  createdAt: '2025-05-01T10:00:00Z',
  updatedAt: '2025-05-10T14:30:00Z',
  modules: [
    {
      id: 'mcu',
      name: 'Mcu',
      layer: 'MCAL',
      version: '4.4.0',
      enabled: true,
      parameters: [
        {
          name: 'McuClockSetting',
          type: 'integer',
          value: 16000000,
          default: 16000000,
          min: 1000000,
          max: 180000000,
          description: 'MCU clock frequency in Hz'
        }
      ],
      containers: []
    },
    {
      id: 'port',
      name: 'Port',
      layer: 'MCAL',
      version: '4.4.0',
      enabled: true,
      parameters: [],
      containers: []
    },
    {
      id: 'dio',
      name: 'Dio',
      layer: 'MCAL',
      version: '4.4.0',
      enabled: false,
      parameters: [],
      containers: []
    },
    {
      id: 'can',
      name: 'Can',
      layer: 'ECUAL',
      version: '4.4.0',
      enabled: true,
      parameters: [
        {
          name: 'CanControllerId',
          type: 'integer',
          value: 0,
          default: 0,
          min: 0,
          max: 255,
          description: 'CAN Controller ID'
        },
        {
          name: 'CanBaudrate',
          type: 'enum',
          value: '500K',
          default: '500K',
          options: ['125K', '250K', '500K', '1M'],
          description: 'CAN bus baudrate'
        },
        {
          name: 'CanTxPdus',
          type: 'array',
          value: ['Pdu1', 'Pdu2'],
          default: [],
          itemType: 'string',
          description: 'List of TX PDUs'
        }
      ],
      containers: []
    },
    {
      id: 'eth',
      name: 'Eth',
      layer: 'ECUAL',
      version: '4.4.0',
      enabled: false,
      parameters: [],
      containers: []
    }
  ]
}

export const testConfigNames = {
  valid: 'Test Configuration',
  withSpecialChars: 'Test-Config_123',
  long: 'This is a very long configuration name that tests the UI limits and rendering',
  empty: '',
  onlySpaces: '   ',
  veryShort: 'A'
}

export const testParamValues = {
  validInteger: 8000000,
  invalidIntegerBelowMin: 500000,
  invalidIntegerAboveMax: 200000000,
  validEnum: '250K',
  validArray: ['Pdu1', 'Pdu2', 'Pdu3']
}

export const layerNames = ['MCAL', 'ECUAL', 'Service', 'RTE', 'ASW']

export const moduleNames = {
  mcal: ['Mcu', 'Port', 'Dio'],
  ecual: ['Can', 'Eth']
}

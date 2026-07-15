import type { CanMessage } from '../../components/autosar/CanBusPanel';
import type { GpioEvent } from '../../components/autosar/GpioWaveform';
import type { InterruptEvent } from '../../components/autosar/InterruptTimeline';

export interface SimulationState {
  canMessages: CanMessage[];
  gpioEvents: GpioEvent[];
  interrupts: InterruptEvent[];
  logs: string[];
  isRunning: boolean;
  startTime: number;
  currentTime: number;
}

export interface SimulationResult {
  success: boolean;
  state: SimulationState;
  output: string[];
  error?: string;
}

function createInitialState(): SimulationState {
  const now = Date.now();
  return {
    canMessages: [],
    gpioEvents: [],
    interrupts: [],
    logs: [],
    isRunning: false,
    startTime: now,
    currentTime: now,
  };
}

/**
 * Parse simulated C code for AutoSAR API calls and generate runtime events.
 * This is a virtual simulation engine that mimics the behavior of running
 * AutoSAR C code in a browser environment.
 */
export function simulateCode(code: string): SimulationResult {
  const state = createInitialState();
  const output: string[] = [];
  let hasError = false;
  let errorMsg: string | undefined;

  try {
    // Simulate Std_Types.h include
    // Check for includes and preprocess
    const lines = code.split('\n');
    let inComment = false;
    let inFunction = false;
    const cleanedLines: string[] = [];

    for (const rawLine of lines) {
      let line = rawLine.trim();

      // Handle block comments
      if (inComment) {
        if (line.includes('*/')) {
          line = line.substring(line.indexOf('*/') + 2);
          inComment = false;
        } else {
          continue;
        }
      }
      if (line.includes('/*')) {
        if (!line.includes('*/')) {
          inComment = true;
          line = line.substring(0, line.indexOf('/*'));
        } else {
          // Single line block comment, strip it
          line = line.replace(/\/\*.*?\*\//g, '').trim();
        }
      }

      // Handle line comments
      if (line.startsWith('//')) {
        cleanedLines.push('');
        continue;
      }
      const commentIdx = line.indexOf('//');
      if (commentIdx >= 0) {
        line = line.substring(0, commentIdx).trim();
      }

      // Process preprocessor directives
      if (line.startsWith('#include') || line.startsWith('#define') || line.startsWith('#ifndef') ||
          line.startsWith('#endif') || line.startsWith('#ifdef')) {
        cleanedLines.push('');
        continue;
      }

      // Detect function definitions
      if (line.includes('void main(void)') || line.includes('void main()')) {
        inFunction = true;
        cleanedLines.push('');
        continue;
      }

      if (inFunction && line === '}') {
        inFunction = false;
        continue;
      }

      cleanedLines.push(line);
    }

    // Now execute simulated code - walk through lines looking for API calls
    let simTime = 0;
    const simCanState = {
      initialized: false,
      baudrate: 0,
      config: {} as Record<string, any>,
    };
    const simDioState: number[] = new Array(16).fill(0);
    let simMcuClock = 8000000;

    // Track pin flips for blink patterns
    let flipCount: Record<string, number> = {};

    // Helper to simulate delay (convert to approximate time)
    const processDelay = (val: number) => {
      const ms = Math.min(val / 100, 500);
      simTime += ms;
    };

    for (let i = 0; i < cleanedLines.length; i++) {
      const line = cleanedLines[i];
      if (!line) continue;

      // Track variable assignments that might affect simulation
      // Can_Init
      if (line.includes('Can_Init(')) {
        simCanState.initialized = true;
        simCanState.baudrate = 500000;

        // Extract baudrate if available
        const baudMatch = line.match(/CanControllerBaudrate\s*=\s*(\d+)/);
        if (baudMatch) {
          simCanState.baudrate = parseInt(baudMatch[1], 10);
        }

        output.push(`[SIM] Can_Init: CAN controller initialized @ ${simCanState.baudrate} bps`);
        state.logs.push(`CAN controller initialized @ ${simCanState.baudrate} bps`);

        state.interrupts.push({
          source: 'CAN',
          timestamp: simTime,
          priority: 3,
          description: `Can_Init called - controller at ${simCanState.baudrate} bps`,
        });

        simTime += 1;
      }

      // Can_Write
      if (line.includes('Can_Write(') && !line.includes('Can_WriteExample')) {
        if (simCanState.initialized) {
          // Extract CAN ID
          const idMatch = line.match(/\.id\s*=\s*(0x[0-9a-fA-F]+|\d+)/i);
          const canId = idMatch ? parseInt(idMatch[1], 16) : 0x123;

          // Extract data
          let canData: number[] = [0xAA, 0xBB, 0xCC, 0xDD, 0x11, 0x22, 0x33, 0x44];
          const dataMatch = line.match(/\{([0-9xa-fA-F,\s]+)\}/);
          if (dataMatch) {
            canData = dataMatch[1].split(',').map(s => {
              const trimmed = s.trim();
              if (trimmed.startsWith('0x')) return parseInt(trimmed, 16);
              return parseInt(trimmed, 10);
            }).filter(n => !isNaN(n));
          }

          const dlc = Math.min(canData.length, 8);
          simTime += 0.5;

          state.canMessages.push({
            id: canId,
            dlc,
            data: canData.slice(0, dlc),
            timestamp: simTime,
            direction: 'tx',
          });

          output.push(`[SIM] Can_Write: TX 0x${canId.toString(16).toUpperCase().padStart(3, '0')} [${canData.slice(0, dlc).map(b => b.toString(16).padStart(2, '0')).join(' ')}]`);

          state.interrupts.push({
            source: 'CAN',
            timestamp: simTime,
            priority: 2,
            description: `CAN TX: ID=0x${canId.toString(16).toUpperCase().padStart(3, '0')}, DLC=${dlc}`,
          });
        } else {
          output.push(`[SIM] ERROR: Can_Write called before Can_Init`);
          hasError = true;
          errorMsg = 'Can_Write called before Can_Init';
        }
      }

      // Can_Read
      if (line.includes('Can_Read(') && !line.includes('Can_ReadExample')) {
        simTime += 0.3;
        const simRxId = 0x100 + Math.floor(Math.random() * 0x100);
        const simRxData = Array.from({length: 8}, () => Math.floor(Math.random() * 256));

        state.canMessages.push({
          id: simRxId,
          dlc: 8,
          data: simRxData,
          timestamp: simTime,
          direction: 'rx',
        });

        output.push(`[SIM] Can_Read: RX 0x${simRxId.toString(16).toUpperCase().padStart(3, '0')} [${simRxData.map(b => b.toString(16).padStart(2, '0')).join(' ')}]`);
      }

      // Can_CheckWakeup
      if (line.includes('Can_CheckWakeup(')) {
        output.push(`[SIM] Can_CheckWakeup: Wakeup detected = ${simCanState.initialized ? 'YES' : 'NO'}`);
        state.interrupts.push({
          source: 'CAN',
          timestamp: simTime,
          priority: 1,
          description: `CAN wakeup check: ${simCanState.initialized ? 'detected' : 'not detected'}`,
        });
      }

      // Can_GetVersionInfo
      if (line.includes('Can_GetVersionInfo(')) {
        output.push(`[SIM] Can_GetVersionInfo: vendor=0x0001, module=0x000A, v4.4.0`);
      }

      // Can_SetBaudrate
      if (line.includes('Can_SetBaudrate(')) {
        output.push(`[SIM] Can_SetBaudrate: baudrate configuration updated`);
      }

      // Dio_WriteChannel
      if (line.includes('Dio_WriteChannel(')) {
        const pinMatch = line.match(/Dio_WriteChannel\(DIO_PIN_(\d+)\s*,\s*DIO_(HIGH|LOW)\)/);
        if (pinMatch) {
          const pin = parseInt(pinMatch[1], 10);
          const level = pinMatch[2] === 'HIGH' ? 1 : 0;
          simDioState[pin] = level;
          simTime += 0.1;

          state.gpioEvents.push({
            pin,
            timestamp: Date.now(),
            level,
          });

          output.push(`[SIM] Dio_WriteChannel: GPIO${pin} = ${level ? 'HIGH' : 'LOW'}`);
        }
      }

      // Dio_ReadChannel
      if (line.includes('Dio_ReadChannel(') && !line.includes('Dio_ReadChannel()')) {
        const pinMatch = line.match(/Dio_ReadChannel\(DIO_PIN_(\d+)\)/);
        if (pinMatch) {
          const pin = parseInt(pinMatch[1], 10);
          output.push(`[SIM] Dio_ReadChannel: GPIO${pin} = ${simDioState[pin] ? 'HIGH' : 'LOW'}`);
        }
      }

      // Dio_FlipChannel
      if (line.includes('Dio_FlipChannel(')) {
        const pinMatch = line.match(/Dio_FlipChannel\(DIO_PIN_(\d+)\)/);
        if (pinMatch) {
          const pin = parseInt(pinMatch[1], 10);
          simDioState[pin] = simDioState[pin] ? 0 : 1;
          simTime += 0.15;

          const key = `pin${pin}`;
          flipCount[key] = (flipCount[key] || 0) + 1;

          state.gpioEvents.push({
            pin,
            timestamp: Date.now(),
            level: simDioState[pin],
          });

          output.push(`[SIM] Dio_FlipChannel: GPIO${pin} flipped to ${simDioState[pin] ? 'HIGH' : 'LOW'} (flip #${flipCount[key]})`);

          state.interrupts.push({
            source: 'DIO',
            timestamp: simTime,
            priority: 4,
            description: `GPIO${pin} flipped to ${simDioState[pin] ? 'HIGH' : 'LOW'}`,
          });
        }
      }

      // Dio_WritePort
      if (line.includes('Dio_WritePort(')) {
        const valMatch = line.match(/Dio_WritePort\(\s*(\d+)\s*,\s*(0x[0-9a-fA-F]+|\d+)\)/);
        if (valMatch) {
          const portVal = parseInt(valMatch[1], 10);
          output.push(`[SIM] Dio_WritePort: Port ${portVal} written`);
          simTime += 0.2;
        }
      }

      // Spi_Init
      if (line.includes('Spi_Init(')) {
        output.push(`[SIM] Spi_Init: SPI controller initialized`);
        state.interrupts.push({
          source: 'SPI',
          timestamp: simTime,
          priority: 3,
          description: 'SPI controller initialized',
        });
        simTime += 1;
      }

      // Spi_WriteIB
      if (line.includes('Spi_WriteIB(')) {
        const sizeMatch = line.match(/Spi_WriteIB\(\s*(\d+)\s*,\s*\w+\s*,\s*(\d+)\)/);
        const size = sizeMatch ? parseInt(sizeMatch[2], 10) : 4;
        output.push(`[SIM] Spi_WriteIB: ${size} bytes written to SPI channel`);
        simTime += 0.5;
      }

      // Spi_ReadIB
      if (line.includes('Spi_ReadIB(')) {
        output.push(`[SIM] Spi_ReadIB: data read from SPI (returned 0xFF fill)`);
        simTime += 0.5;
      }

      // Spi_Exchange
      if (line.includes('Spi_Exchange(')) {
        const sizeMatch = line.match(/Spi_Exchange\(\s*(\d+)\s*,\s*\w+\s*,\s*\w+\s*,\s*(\d+)\)/);
        const size = sizeMatch ? parseInt(sizeMatch[2], 10) : 4;
        output.push(`[SIM] Spi_Exchange: ${size}-byte SPI transfer completed (Tx data inverted on Rx)`);
        state.interrupts.push({
          source: 'SPI',
          timestamp: simTime,
          priority: 2,
          description: `SPI exchange: ${size} bytes transferred`,
        });
        simTime += 0.8;
      }

      // Mcu_Init
      if (line.includes('Mcu_Init(')) {
        output.push(`[SIM] Mcu_Init: MCU initialized with HSI/PLL clock config`);
        state.interrupts.push({
          source: 'MCU',
          timestamp: simTime,
          priority: 0,
          description: 'MCU initialized - clock tree configured',
        });
        simTime += 2;
      }

      // Mcu_InitClock
      if (line.includes('Mcu_InitClock(')) {
        if (line.includes('MCU_CLOCK_TYPE_PLL')) {
          simMcuClock = 72000000;
          output.push(`[SIM] Mcu_InitClock: Switched to PLL clock @ 72 MHz`);
        } else if (line.includes('MCU_CLOCK_TYPE_HSE')) {
          simMcuClock = 16000000;
          output.push(`[SIM] Mcu_InitClock: Switched to HSE clock @ 16 MHz`);
        } else {
          simMcuClock = 8000000;
          output.push(`[SIM] Mcu_InitClock: Switched to HSI clock @ 8 MHz`);
        }
        state.interrupts.push({
          source: 'MCU',
          timestamp: simTime,
          priority: 1,
          description: `Clock switched to ${simMcuClock / 1000000} MHz`,
        });
        simTime += 1;
      }

      // Mcu_GetResetReason
      if (line.includes('Mcu_GetResetReason(')) {
        output.push(`[SIM] Mcu_GetResetReason: Reset reason = POWER_ON_RESET`);
      }

      // Mcu_PerformReset
      if (line.includes('Mcu_PerformReset(')) {
        output.push(`[SIM] Mcu_PerformReset: System reset executed`);
        state.interrupts.push({
          source: 'MCU',
          timestamp: simTime,
          priority: 0,
          description: 'System reset performed',
        });
      }

      // NvM simulation - ReadBlock
      if (line.match(/NvM_ReadBlock\s*\(/)) {
        output.push(`[SIM] NvM_ReadBlock: Data read from NVRAM block`);
        simTime += 0.5;
      }

      // NvM simulation - WriteBlock
      if (line.match(/NvM_WriteBlock\s*\(/)) {
        output.push(`[SIM] NvM_WriteBlock: Data written to NVRAM block`);
        state.interrupts.push({
          source: 'MCU',
          timestamp: simTime,
          priority: 2,
          description: 'NVRAM write operation',
        });
        simTime += 1;
      }

      // delay() simulation
      const delayMatch = line.match(/delay\s*\(\s*(\d+)\s*\)/);
      if (delayMatch) {
        processDelay(parseInt(delayMatch[1], 10));
      }

      // for loop simulation (count iterations to estimate runtime)
      const forMatch = line.match(/for\s*\([^;]*;\s*(\w+)\s*<\s*(\d+)/);
      if (forMatch) {
        const iterations = parseInt(forMatch[2], 10);
        simTime += Math.min(iterations * 0.5, 100);
      }
    }

    state.isRunning = true;

    // Add summary
    output.push('');
    output.push(`=== Simulation Complete ===`);
    output.push(`Virtual time: ${simTime.toFixed(1)} ms`);
    output.push(`CAN messages sent: ${state.canMessages.filter(m => m.direction === 'tx').length}`);
    output.push(`CAN messages received: ${state.canMessages.filter(m => m.direction === 'rx').length}`);
    output.push(`GPIO events: ${state.gpioEvents.length}`);
    output.push(`Interrupts: ${state.interrupts.length}`);
    output.push(`MCU clock: ${(simMcuClock / 1000000).toFixed(0)} MHz`);

  } catch (err) {
    hasError = true;
    errorMsg = err instanceof Error ? err.message : 'Unknown simulation error';
    output.push(`[ERROR] ${errorMsg}`);
  }

  return {
    success: !hasError,
    state,
    output,
    error: errorMsg,
  };
}

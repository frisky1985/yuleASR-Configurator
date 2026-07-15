export interface SandboxExample {
  id: string;
  name: string;
  description: string;
  code: string;
  category: 'CAN' | 'DIO' | 'SPI' | 'MCU' | 'NvM';
}

export const SANDBOX_EXAMPLES: SandboxExample[] = [
  {
    id: 'can-init-send',
    name: 'CAN Init + Message Send',
    description: 'Initialize CAN controller and send a standard CAN frame with 8-byte payload',
    category: 'CAN',
    code: `/* CAN Init + Message Send Example */
#include "Std_Types.h"
#include "Can.h"

uint8 txData[8] = {0x11, 0x22, 0x33, 0x44, 0x55, 0x66, 0x77, 0x88};

void main(void) {
    Can_ConfigType cfg;
    cfg.Controller.CanControllerId = 0;
    cfg.Controller.CanControllerBaudrate = 500000;
    cfg.Controller.CanControllerWakeupSource = CAN_WAKEUP_SOURCE_INTERNAL;

    Std_ReturnType ret = Can_Init(&cfg);
    if (ret != E_OK) {
        /* Error: CAN init failed */
        return;
    }

    Can_PduType pdu;
    pdu.id = 0x123;
    pdu.length = 8;
    pdu.sdu = txData;
    pdu.swPduHandle = NULL;

    ret = Can_Write(CAN_HTH_0, &pdu);
    if (ret == E_OK) {
        /* Message sent successfully */
    }
}`,
  },
  {
    id: 'can-receive',
    name: 'CAN Message Receive',
    description: 'Simulate receiving CAN messages and checking wakeup status',
    category: 'CAN',
    code: `/* CAN Message Receive Example */
#include "Std_Types.h"
#include "Can.h"

void main(void) {
    Can_ConfigType cfg;
    cfg.Controller.CanControllerId = 0;
    cfg.Controller.CanControllerBaudrate = 500000;
    cfg.Controller.CanControllerWakeupSource = CAN_WAKEUP_SOURCE_INTERNAL;

    Can_Init(&cfg);

    /* Check if CAN bus woke up the system */
    if (Can_CheckWakeup(ECUM_WAKEUP_SOURCE_CAN) == E_OK) {
        /* Read received CAN message */
        Can_PduType rxPdu;
        uint8 rxBuffer[8];
        rxPdu.sdu = rxBuffer;
        rxPdu.length = 8;

        Can_Read(CAN_HRH_0, &rxPdu);

        /* Process received data */
        if (rxPdu.id == 0x100) {
            /* Handle specific CAN ID */
        }
    }
}`,
  },
  {
    id: 'dio-read-write',
    name: 'DIO Read/Write/Flip',
    description: 'Demonstrate digital I/O operations including read, write, and toggle functions',
    category: 'DIO',
    code: `/* DIO Read/Write/Flip Example */
#include "Std_Types.h"
#include "Dio.h"

void main(void) {
    /* Write high to pin 0 */
    Dio_WriteChannel(DIO_PIN_0, DIO_HIGH);

    /* Write low to pin 1 */
    Dio_WriteChannel(DIO_PIN_1, DIO_LOW);

    /* Read back pin 0 */
    Dio_LevelType val = Dio_ReadChannel(DIO_PIN_0);

    /* Flip pin 2 (toggle) */
    Dio_LevelType flipped = Dio_FlipChannel(DIO_PIN_2);

    /* Write all pins on port A */
    Dio_WritePort(0, 0xAA);

    /* Read port A */
    Dio_LevelType portVal = 0;
    Dio_ReadPort(0, &portVal);

    /* Verify flips */
    Dio_FlipChannel(DIO_PIN_2);
    Dio_FlipChannel(DIO_PIN_2);
}`,
  },
  {
    id: 'dio-blink',
    name: 'DIO Blink Pattern',
    description: 'Simulate a blinking LED pattern using DIO flip operations with delay loop',
    category: 'DIO',
    code: `/* DIO Blink Pattern Example */
#include "Std_Types.h"
#include "Dio.h"

void delay(volatile uint32 count) {
    while (count > 0) {
        count--;
    }
}

void main(void) {
    uint8 i;

    /* Blink LED on pin 0 five times */
    for (i = 0; i < 5; i++) {
        Dio_WriteChannel(DIO_PIN_0, DIO_HIGH);
        delay(10000);

        Dio_WriteChannel(DIO_PIN_0, DIO_LOW);
        delay(10000);
    }

    /* Blink pin 1 and 2 in alternating pattern */
    Dio_WriteChannel(DIO_PIN_1, DIO_HIGH);
    Dio_WriteChannel(DIO_PIN_2, DIO_LOW);
    delay(10000);

    Dio_WriteChannel(DIO_PIN_1, DIO_LOW);
    Dio_WriteChannel(DIO_PIN_2, DIO_HIGH);
    delay(10000);

    /* Use flip for half-speed blink on pin 3 */
    for (i = 0; i < 3; i++) {
        Dio_FlipChannel(DIO_PIN_3);
        delay(20000);
    }
}`,
  },
  {
    id: 'spi-exchange',
    name: 'SPI Exchange Data',
    description: 'Initialize SPI and demonstrate master-mode data exchange transaction',
    category: 'SPI',
    code: `/* SPI Exchange Data Example */
#include "Std_Types.h"
#include "Spi.h"

uint8 txBuffer[4] = {0xAA, 0xBB, 0xCC, 0xDD};
uint8 rxBuffer[4] = {0};

void main(void) {
    Spi_ChannelConfigType cfg;
    cfg.Channel = 0;
    cfg.Baudrate = 8;
    cfg.DataWidth = 8;
    cfg.Mode = SPI_MODE_0;

    /* Initialize SPI */
    Spi_Init(&cfg);

    /* Write data to SPI channel */
    Std_ReturnType ret = Spi_WriteIB(0, txBuffer, 4);
    if (ret == E_OK) {
        /* Data written successfully */
    }

    /* Perform SPI exchange (simultaneous Tx/Rx) */
    ret = Spi_Exchange(0, txBuffer, rxBuffer, 4);
    if (ret == E_OK) {
        /* rxBuffer now contains received data */
    }

    /* Read back from SPI */
    ret = Spi_ReadIB(0, rxBuffer, 4);
}`,
  },
  {
    id: 'mcu-clock-config',
    name: 'MCU Clock Configuration',
    description: 'Configure MCU clock tree including HSI, PLL setup and reset management',
    category: 'MCU',
    code: `/* MCU Clock Configuration Example */
#include "Std_Types.h"
#include "Mcu.h"

void main(void) {
    Mcu_ClockSettingType clockSettings[2];

    /* Configure HSI clock */
    clockSettings[0].ClockType = MCU_CLOCK_TYPE_HSI;
    clockSettings[0].Frequency = 8000000;
    clockSettings[0].SourceFrequency = 8000000;

    /* Configure PLL clock */
    clockSettings[1].ClockType = MCU_CLOCK_TYPE_PLL;
    clockSettings[1].Frequency = 72000000;
    clockSettings[1].SourceFrequency = 8000000;

    Mcu_ConfigType cfg;
    cfg.ClockSettings = clockSettings;
    cfg.ClockSettingCount = 2;
    cfg.PllConfig.PllMul = 9;
    cfg.PllConfig.PllDiv = 2;
    cfg.PllConfig.PllPreDiv = 1;

    /* Initialize MCU */
    Mcu_Init(&cfg);

    /* Switch to PLL clock */
    Std_ReturnType ret = Mcu_InitClock(MCU_CLOCK_TYPE_PLL);

    /* Get reset reason */
    Mcu_ResetType reason;
    Mcu_GetResetReason(&reason);

    if (reason == MCU_POWER_ON_RESET) {
        /* Handle power-on initialization */
    }

    /* Perform software reset */
    Mcu_PerformReset();
}`,
  },
  {
    id: 'nvm-read-write',
    name: 'NvM Read/Write (Stub)',
    description: 'Simulate NVRAM manager block read/write operations with virtual storage',
    category: 'NvM',
    code: `/* NvM Read/Write Stub Example */
#include "Std_Types.h"

/* NvM Stub Types */
typedef uint16 NvM_BlockIdType;
#define NVM_BLOCK_ID_CALIBRATION 0x01
#define NVM_BLOCK_ID_CONFIG      0x02
#define NVM_REQUEST_OK           0
#define NVM_REQUEST_NOT_OK       1

/* NvM Stub Functions - Simulated implementations */
typedef uint8 NvM_RequestResultType;

static uint8 _sim_nvm_data[256] = {0};

NvM_RequestResultType NvM_ReadBlock(NvM_BlockIdType BlockId, void* Data) {
    if (BlockId > 1 || Data == NULL) return NVM_REQUEST_NOT_OK;
    uint8 i;
    uint8* dst = (uint8*)Data;
    uint16 offset = BlockId * 128;
    for (i = 0; i < 128; i++) {
        dst[i] = _sim_nvm_data[offset + i];
    }
    return NVM_REQUEST_OK;
}

NvM_RequestResultType NvM_WriteBlock(NvM_BlockIdType BlockId, const void* Data) {
    if (BlockId > 1 || Data == NULL) return NVM_REQUEST_NOT_OK;
    uint8 i;
    const uint8* src = (const uint8*)Data;
    uint16 offset = BlockId * 128;
    for (i = 0; i < 128; i++) {
        _sim_nvm_data[offset + i] = src[i];
    }
    return NVM_REQUEST_OK;
}

typedef struct {
    uint16 parameter1;
    uint8  parameter2;
    uint32 parameter3;
} CalibrationData;

void main(void) {
    CalibrationData calData;
    calData.parameter1 = 1000;
    calData.parameter2 = 50;
    calData.parameter3 = 0x12345678;

    /* Write calibration data to NvM */
    NvM_RequestResultType ret = NvM_WriteBlock(NVM_BLOCK_ID_CALIBRATION, &calData);

    /* Read back calibration data */
    CalibrationData readBack;
    ret = NvM_ReadBlock(NVM_BLOCK_ID_CALIBRATION, &readBack);
}`,
  },
  {
    id: 'can-dio-integration',
    name: 'CAN + DIO Integration',
    description: 'Use CAN messages to control DIO outputs - integrates two AutoSAR modules',
    category: 'CAN',
    code: `/* CAN + DIO Integration Example */
#include "Std_Types.h"
#include "Can.h"
#include "Dio.h"

void main(void) {
    /* Initialize CAN */
    Can_ConfigType canCfg;
    canCfg.Controller.CanControllerId = 0;
    canCfg.Controller.CanControllerBaudrate = 500000;
    canCfg.Controller.CanControllerWakeupSource = CAN_WAKEUP_SOURCE_INTERNAL;
    Can_Init(&canCfg);

    /* Set initial DIO states */
    Dio_WriteChannel(DIO_PIN_0, DIO_LOW);
    Dio_WriteChannel(DIO_PIN_1, DIO_LOW);
    Dio_WriteChannel(DIO_PIN_2, DIO_LOW);

    /* Send command message to control DIO */
    uint8 cmdData[8] = {0};
    cmdData[0] = 0x01; /* Command: Set output */
    cmdData[1] = 0x00; /* Pin mask: bit0 = pin0, bit1 = pin1, etc. */
    cmdData[2] = 0x05; /* Pin values: bit0=1, bit2=1 */

    Can_PduType pdu;
    pdu.id = 0x200;
    pdu.length = 8;
    pdu.sdu = cmdData;
    pdu.swPduHandle = NULL;

    Can_Write(CAN_HTH_0, &pdu);

    /* Process command: set DIO according to CAN message */
    if (cmdData[0] == 0x01) {
        uint8 i;
        for (i = 0; i < 8; i++) {
            if (cmdData[1] & (1 << i)) {
                Dio_LevelType level = (cmdData[2] >> i) & 1;
                Dio_WriteChannel(i, level);
            }
        }
    }

    /* Read back and send status */
    uint8 statusData[8] = {0};
    uint8 j;
    for (j = 0; j < 4; j++) {
        statusData[j] = Dio_ReadChannel(j);
    }

    Can_PduType statusPdu;
    statusPdu.id = 0x201;
    statusPdu.length = 8;
    statusPdu.sdu = statusData;
    statusPdu.swPduHandle = NULL;

    Can_Write(CAN_HTH_0, &statusPdu);
}`,
  },
];

export function getExampleById(id: string): SandboxExample | undefined {
  return SANDBOX_EXAMPLES.find(e => e.id === id);
}

export function getExamplesByCategory(category: SandboxExample['category']): SandboxExample[] {
  return SANDBOX_EXAMPLES.filter(e => e.category === category);
}

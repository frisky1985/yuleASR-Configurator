export const MCU_H = `#ifndef AUTOSAR_MCU_H
#define AUTOSAR_MCU_H

#include "Std_Types.h"

/* MCU Clock Types */
typedef uint8 Mcu_ClockType;
#define MCU_CLOCK_TYPE_HSI 0
#define MCU_CLOCK_TYPE_HSE 1
#define MCU_CLOCK_TYPE_PLL 2

/* MCU Clock Setting */
typedef struct {
    Mcu_ClockType ClockType;
    uint32 Frequency;
    uint32 SourceFrequency;
} Mcu_ClockSettingType;

/* MCU RAM Section */
typedef struct {
    uint32 StartAddress;
    uint32 Size;
} Mcu_RamSectionType;

/* MCU PLL Config */
typedef struct {
    uint8 PllMul;
    uint8 PllDiv;
    uint8 PllPreDiv;
} Mcu_PllConfigType;

/* MCU Config Type */
typedef struct {
    Mcu_ClockSettingType* ClockSettings;
    uint8 ClockSettingCount;
    Mcu_PllConfigType PllConfig;
} Mcu_ConfigType;

/* MCU Reset Reason */
typedef uint8 Mcu_ResetType;
#define MCU_POWER_ON_RESET     0
#define MCU_WATCHDOG_RESET     1
#define MCU_SOFTWARE_RESET     2
#define MCU_EXTERNAL_RESET     3

/* Function Prototypes */
void Mcu_Init(const Mcu_ConfigType* Config);
Std_ReturnType Mcu_InitClock(Mcu_ClockType ClockSetting);
void Mcu_GetResetReason(Mcu_ResetType* ResetReason);
void Mcu_PerformReset(void);
void Mcu_SetMode(uint8 McuMode);
void Mcu_GetVersionInfo(Std_VersionInfoType* VersionInfo);

/* Virtual Implementation */
static uint8 _sim_mcu_initialized = 0;
static Mcu_ClockSettingType _sim_mcu_clock;

void Mcu_Init(const Mcu_ConfigType* Config) {
    if (Config != NULL && Config->ClockSettings != NULL) {
        _sim_mcu_clock = Config->ClockSettings[0];
    }
    _sim_mcu_initialized = 1;
}

Std_ReturnType Mcu_InitClock(Mcu_ClockType ClockSetting) {
    if (!_sim_mcu_initialized) return E_NOT_OK;
    _sim_mcu_clock.ClockType = ClockSetting;
    return E_OK;
}

void Mcu_GetResetReason(Mcu_ResetType* ResetReason) {
    if (ResetReason != NULL) {
        *ResetReason = MCU_POWER_ON_RESET;
    }
}

void Mcu_PerformReset(void) {
    _sim_mcu_initialized = 0;
}

void Mcu_SetMode(uint8 McuMode) {
    (void)McuMode;
}

void Mcu_GetVersionInfo(Std_VersionInfoType* VersionInfo) {
    if (VersionInfo != NULL) {
        VersionInfo->vendorID = 1;
        VersionInfo->moduleID = 40;
        VersionInfo->sw_major_version = 4;
        VersionInfo->sw_minor_version = 4;
        VersionInfo->sw_patch_version = 0;
    }
}

#endif /* AUTOSAR_MCU_H */
`;

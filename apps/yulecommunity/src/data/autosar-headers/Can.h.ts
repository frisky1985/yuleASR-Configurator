export const CAN_H = `#ifndef AUTOSAR_CAN_H
#define AUTOSAR_CAN_H

#include "Std_Types.h"

/* CAN Hardware Handle Types */
typedef uint16 Can_HwHandleType;
#define CAN_HTH_0 ((Can_HwHandleType)0)
#define CAN_HTH_1 ((Can_HwHandleType)1)
#define CAN_HRH_0 ((Can_HwHandleType)0)
#define CAN_HRH_1 ((Can_HwHandleType)1)

/* CAN PDU Type */
typedef struct {
    uint32 id;
    uint8 length;
    uint8* sdu;
    void* swPduHandle;
} Can_PduType;

/* CAN Controller Type */
typedef struct {
    uint8 CanControllerId;
    uint32 CanControllerBaudrate;
    uint8 CanControllerWakeupSource;
} Can_ControllerType;

/* CAN Configuration Type */
typedef struct {
    Can_ControllerType Controller;
} Can_ConfigType;

/* CAN Baudrate Configuration IDs */
#define CAN_BAUDRATE_125KBPS 0
#define CAN_BAUDRATE_250KBPS 1
#define CAN_BAUDRATE_500KBPS 2
#define CAN_BAUDRATE_1MBPS   3

/* CAN Wakeup Source */
#define CAN_WAKEUP_SOURCE_INTERNAL 0
#define CAN_WAKEUP_SOURCE_EXTERNAL 1

/* EcuM Wakeup Source Type */
typedef uint8 EcuM_WakeupSourceType;
#define ECUM_WAKEUP_SOURCE_CAN 0
#define ECUM_WAKEUP_SOURCE_CAN_1 1

/* Function Prototypes */
Std_ReturnType Can_Init(const Can_ConfigType* Config);
Std_ReturnType Can_Write(Can_HwHandleType Hth, const Can_PduType* PduInfo);
void Can_Read(Can_HwHandleType Hrh, Can_PduType* PduInfo);
Std_ReturnType Can_SetBaudrate(Can_HwHandleType Hth, uint16 BaudRateConfigID);
void Can_GetVersionInfo(Std_VersionInfoType* VersionInfo);
Std_ReturnType Can_CheckWakeup(EcuM_WakeupSourceType WakeupSource);

/* Virtual Implementation */
static int _sim_can_initialized = 0;
static Can_ConfigType _sim_can_config;

Std_ReturnType Can_Init(const Can_ConfigType* Config) {
    if (Config == NULL) return E_NOT_OK;
    _sim_can_config = *Config;
    _sim_can_initialized = 1;
    return E_OK;
}

Std_ReturnType Can_Write(Can_HwHandleType Hth, const Can_PduType* PduInfo) {
    if (!_sim_can_initialized) return E_NOT_OK;
    if (PduInfo == NULL || PduInfo->sdu == NULL) return E_NOT_OK;
    /* In simulation, this writes to a virtual bus */
    return E_OK;
}

void Can_Read(Can_HwHandleType Hrh, Can_PduType* PduInfo) {
    if (PduInfo != NULL) {
        PduInfo->id = 0;
        PduInfo->length = 0;
        PduInfo->sdu = NULL;
    }
}

Std_ReturnType Can_SetBaudrate(Can_HwHandleType Hth, uint16 BaudRateConfigID) {
    if (!_sim_can_initialized) return E_NOT_OK;
    _sim_can_config.Controller.CanControllerBaudrate = BaudRateConfigID;
    return E_OK;
}

void Can_GetVersionInfo(Std_VersionInfoType* VersionInfo) {
    if (VersionInfo != NULL) {
        VersionInfo->vendorID = 1;
        VersionInfo->moduleID = 10;
        VersionInfo->sw_major_version = 4;
        VersionInfo->sw_minor_version = 4;
        VersionInfo->sw_patch_version = 0;
    }
}

Std_ReturnType Can_CheckWakeup(EcuM_WakeupSourceType WakeupSource) {
    return (_sim_can_initialized) ? E_OK : E_NOT_OK;
}

#endif /* AUTOSAR_CAN_H */
`;

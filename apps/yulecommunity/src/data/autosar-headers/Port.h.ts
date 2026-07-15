export const PORT_H = `#ifndef AUTOSAR_PORT_H
#define AUTOSAR_PORT_H

#include "Std_Types.h"

/* Port Pin Direction */
#define PORT_PIN_IN  0
#define PORT_PIN_OUT 1

/* Port Pin Mode */
#define PORT_PIN_MODE_DIO     0
#define PORT_PIN_MODE_CAN     1
#define PORT_PIN_MODE_SPI     2
#define PORT_PIN_MODE_UART    3

/* Port Pin */
typedef uint8 Port_PinType;
typedef uint8 Port_PinDirectionType;
typedef uint8 Port_PinModeType;

typedef struct {
    Port_PinType Pin;
    Port_PinDirectionType Direction;
    Port_PinModeType Mode;
    uint8 InitialLevel;
} Port_ConfigPinType;

typedef struct {
    Port_ConfigPinType* Pins;
    uint8 PinCount;
} Port_ConfigType;

/* Function Prototypes */
void Port_Init(const Port_ConfigType* Config);
void Port_SetPinDirection(Port_PinType Pin, Port_PinDirectionType Direction);
void Port_SetPinMode(Port_PinType Pin, Port_PinModeType Mode);
void Port_GetVersionInfo(Std_VersionInfoType* VersionInfo);

/* Virtual Implementation */
static uint8 _sim_port_initialized = 0;

void Port_Init(const Port_ConfigType* Config) {
    (void)Config;
    _sim_port_initialized = 1;
}

void Port_SetPinDirection(Port_PinType Pin, Port_PinDirectionType Direction) {
    (void)Pin;
    (void)Direction;
    if (!_sim_port_initialized) return;
}

void Port_SetPinMode(Port_PinType Pin, Port_PinModeType Mode) {
    (void)Pin;
    (void)Mode;
    if (!_sim_port_initialized) return;
}

void Port_GetVersionInfo(Std_VersionInfoType* VersionInfo) {
    if (VersionInfo != NULL) {
        VersionInfo->vendorID = 1;
        VersionInfo->moduleID = 20;
        VersionInfo->sw_major_version = 4;
        VersionInfo->sw_minor_version = 4;
        VersionInfo->sw_patch_version = 0;
    }
}

#endif /* AUTOSAR_PORT_H */
`;

export const DIO_H = `#ifndef AUTOSAR_DIO_H
#define AUTOSAR_DIO_H

#include "Std_Types.h"

/* DIO Channel Type */
typedef uint16 Dio_ChannelType;
typedef uint16 Dio_PortType;
typedef uint8 Dio_LevelType;

#define DIO_LOW  0
#define DIO_HIGH 1
#define DIO_PIN_0 0
#define DIO_PIN_1 1
#define DIO_PIN_2 2
#define DIO_PIN_3 3
#define DIO_PIN_4 4
#define DIO_PIN_5 5
#define DIO_PIN_6 6
#define DIO_PIN_7 7
#define DIO_PIN_8 8
#define DIO_PIN_9 9
#define DIO_PIN_10 10
#define DIO_PIN_11 11
#define DIO_PIN_12 12
#define DIO_PIN_13 13
#define DIO_PIN_14 14
#define DIO_PIN_15 15

typedef struct {
    uint8 Port;
    uint8 Pin;
    uint8 Direction;
    uint8 Level;
} Dio_ChannelConfigType;

/* Function Prototypes */
Dio_LevelType Dio_ReadChannel(Dio_ChannelType ChannelId);
void Dio_WriteChannel(Dio_ChannelType ChannelId, Dio_LevelType Level);
Dio_LevelType Dio_FlipChannel(Dio_ChannelType ChannelId);
void Dio_ReadPort(Dio_PortType PortId, Dio_LevelType* PortPtr);
void Dio_WritePort(Dio_PortType PortId, Dio_LevelType Level);

/* Virtual Simulation State */
static Dio_LevelType _sim_dio_channels[16] = {0};

Dio_LevelType Dio_ReadChannel(Dio_ChannelType ChannelId) {
    if (ChannelId >= 16) return DIO_LOW;
    return _sim_dio_channels[ChannelId];
}

void Dio_WriteChannel(Dio_ChannelType ChannelId, Dio_LevelType Level) {
    if (ChannelId < 16) {
        _sim_dio_channels[ChannelId] = Level;
    }
}

Dio_LevelType Dio_FlipChannel(Dio_ChannelType ChannelId) {
    if (ChannelId >= 16) return DIO_LOW;
    _sim_dio_channels[ChannelId] = !_sim_dio_channels[ChannelId];
    return _sim_dio_channels[ChannelId];
}

void Dio_ReadPort(Dio_PortType PortId, Dio_LevelType* PortPtr) {
    if (PortPtr != NULL) {
        *PortPtr = 0;
    }
}

void Dio_WritePort(Dio_PortType PortId, Dio_LevelType Level) {
    /* Write to all pins on the virtual port */
}

#endif /* AUTOSAR_DIO_H */
`;

export const SPI_H = `#ifndef AUTOSAR_SPI_H
#define AUTOSAR_SPI_H

#include "Std_Types.h"

/* SPI Channel Type */
typedef uint8 Spi_ChannelType;
typedef uint8 Spi_SequenceType;
typedef uint8 Spi_JobType;

/* SPI Data Mode */
#define SPI_MODE_0 0
#define SPI_MODE_1 1
#define SPI_MODE_2 2
#define SPI_MODE_3 3

/* SPI Status */
#define SPI_IDLE    0
#define SPI_BUSY    1
#define SPI_COMPLETE 2

/* SPI Channel Config */
typedef struct {
    Spi_ChannelType Channel;
    uint8 Baudrate;
    uint8 DataWidth;
    uint8 Mode;
} Spi_ChannelConfigType;

/* SPI Job Config */
typedef struct {
    Spi_JobType Job;
    Spi_ChannelType Channel;
    uint8* DataBuffer;
    uint16 BufferSize;
} Spi_JobConfigType;

/* Function Prototypes */
void Spi_Init(const Spi_ChannelConfigType* Config);
Std_ReturnType Spi_WriteIB(Spi_ChannelType Channel, const uint8* DataBuffer, uint16 BufferSize);
Std_ReturnType Spi_ReadIB(Spi_ChannelType Channel, uint8* DataBuffer, uint16 BufferSize);
Std_ReturnType Spi_Exchange(Spi_ChannelType Channel, const uint8* TxData, uint8* RxData, uint16 BufferSize);
void Spi_GetVersionInfo(Std_VersionInfoType* VersionInfo);

/* Virtual Implementation */
static uint8 _sim_spi_initialized = 0;

void Spi_Init(const Spi_ChannelConfigType* Config) {
    (void)Config;
    _sim_spi_initialized = 1;
}

Std_ReturnType Spi_WriteIB(Spi_ChannelType Channel, const uint8* DataBuffer, uint16 BufferSize) {
    (void)Channel;
    (void)DataBuffer;
    (void)BufferSize;
    if (!_sim_spi_initialized) return E_NOT_OK;
    return E_OK;
}

Std_ReturnType Spi_ReadIB(Spi_ChannelType Channel, uint8* DataBuffer, uint16 BufferSize) {
    (void)Channel;
    (void)BufferSize;
    if (!_sim_spi_initialized) return E_NOT_OK;
    if (DataBuffer != NULL) {
        /* Return simulated data */
        uint16 i;
        for (i = 0; i < BufferSize; i++) {
            DataBuffer[i] = 0xFF;
        }
    }
    return E_OK;
}

Std_ReturnType Spi_Exchange(Spi_ChannelType Channel, const uint8* TxData, uint8* RxData, uint16 BufferSize) {
    (void)Channel;
    uint16 i;
    if (!_sim_spi_initialized) return E_NOT_OK;
    if (TxData != NULL && RxData != NULL) {
        for (i = 0; i < BufferSize; i++) {
            RxData[i] = ~TxData[i]; /* Simple mock: return inverted data */
        }
    }
    return E_OK;
}

void Spi_GetVersionInfo(Std_VersionInfoType* VersionInfo) {
    if (VersionInfo != NULL) {
        VersionInfo->vendorID = 1;
        VersionInfo->moduleID = 30;
        VersionInfo->sw_major_version = 4;
        VersionInfo->sw_minor_version = 4;
        VersionInfo->sw_patch_version = 0;
    }
}

#endif /* AUTOSAR_SPI_H */
`;

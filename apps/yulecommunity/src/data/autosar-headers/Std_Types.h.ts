export const STD_TYPES_H = `#ifndef AUTOSAR_STD_TYPES_H
#define AUTOSAR_STD_TYPES_H

/* Standard Integer Types */
typedef unsigned char uint8;
typedef unsigned short uint16;
typedef unsigned int uint32;
typedef signed char sint8;
typedef signed short sint16;
typedef signed int sint32;
typedef uint8 boolean;

/* Boolean Values */
#ifndef TRUE
#define TRUE 1
#endif
#ifndef FALSE
#define FALSE 0
#endif

/* Standard Return Type */
typedef uint8 Std_ReturnType;
#define E_OK    0
#define E_NOT_OK 1

/* Version Info Type */
typedef struct {
    uint16 vendorID;
    uint16 moduleID;
    uint8 sw_major_version;
    uint8 sw_minor_version;
    uint8 sw_patch_version;
} Std_VersionInfoType;

/* NULL Pointer */
#ifndef NULL
#define NULL ((void*)0)
#endif

#endif /* AUTOSAR_STD_TYPES_H */
`;

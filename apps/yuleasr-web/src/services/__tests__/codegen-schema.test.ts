import { describe, it, expect } from 'vitest';

import { generateHeadersFromSchemas } from '../codegen';

import { loadModuleSchemas } from '@yuletech/core/schema/load-generated';

/** 按模块名（大小写不敏感）取 schema */
function schemaByName(name: string) {
  return loadModuleSchemas().filter(s => s.name.toLowerCase() === name.toLowerCase());
}

/**
 * F2a — schema 驱动宏头生成器测试。
 *
 * 断言对象：F1 新提取（CfgH-Extracted）模块生成的宏头，
 * 宏名/宏值与 yuleASR 手写 *_Cfg.h 逐条对应（抽查）。
 */
describe('Codegen - Schema-driven macro headers (F2a)', () => {
  it('should generate one header per loaded schema (117 modules, no throw)', async () => {
    const schemas = loadModuleSchemas();
    expect(schemas.length).toBeGreaterThanOrEqual(117);

    const files = await generateHeadersFromSchemas(schemas);
    expect(files).toHaveLength(schemas.length);
    for (const f of files) {
      expect(f.language).toBe('h');
      expect(f.filename.endsWith('_Cfg.h')).toBe(true);
      expect(f.content).toContain('#define');
      expect(f.content).toContain('endif');
    }
  });

  it('flash: FLS_* macros match hand-written Flash_Cfg.h', async () => {
    const files = await generateHeadersFromSchemas(schemaByName('flash'));
    expect(files).toHaveLength(1);
    expect(files[0].filename).toBe('Flash_Cfg.h');
    // Flash_Cfg.h: #define FLS_CFG_VENDOR_ID (uint16)0x0001U / FLS_USE_INTERRUPTS STD_OFF / FLS_DEV_ERROR_DETECT STD_ON
    expect(files[0].content).toContain('#define FLS_CFG_VENDOR_ID    (1U)');
    expect(files[0].content).toContain('#define FLS_CFG_MODULE_ID    (92U)');
    expect(files[0].content).toContain('#define FLS_DEV_ERROR_DETECT    STD_ON');
    expect(files[0].content).toContain('#define FLS_VERSION_INFO_API    STD_ON');
    expect(files[0].content).toContain('#define FLS_USE_INTERRUPTS    STD_OFF');
    expect(files[0].content).toContain('#define FLS_NUM_OF_CONFIGURED_SECTORS    (8U)');
  });

  it('boot: BOOT_* macros match hand-written Boot_Cfg.h', async () => {
    const files = await generateHeadersFromSchemas(schemaByName('boot'));
    expect(files).toHaveLength(1);
    expect(files[0].filename).toBe('Boot_Cfg.h');
    // Boot_Cfg.h: BOOT_PBL_SIZE 0x00001000UL / BOOT_SBL_SIZE 0x00010000UL
    expect(files[0].content).toContain('#define BOOT_FLASH_BASE    (0U)');
    expect(files[0].content).toContain('#define BOOT_PBL_SIZE    (4096U)');
    expect(files[0].content).toContain('#define BOOT_SBL_SIZE    (65536U)');
  });

  it('e2e: E2E_PROFILE/CRC macros match hand-written E2E_Cfg.h', async () => {
    const files = await generateHeadersFromSchemas(schemaByName('e2e'));
    expect(files).toHaveLength(1);
    expect(files[0].filename).toBe('E2E_Cfg.h');
    // E2E_Cfg.h: E2E_PROFILE_01_ENABLED STD_ON / E2E_USE_CRC_HARDWARE STD_OFF / E2E_USE_CRC_SOFTWARE STD_ON
    expect(files[0].content).toContain('#define E2E_PROFILE_01_ENABLED    STD_ON');
    expect(files[0].content).toContain('#define E2E_USE_CRC_HARDWARE    STD_OFF');
    expect(files[0].content).toContain('#define E2E_USE_CRC_SOFTWARE    STD_ON');
  });

  it('secoc: SECOC_* macros match hand-written SecOC_Cfg.h', async () => {
    const files = await generateHeadersFromSchemas(schemaByName('secoc'));
    expect(files).toHaveLength(1);
    expect(files[0].filename).toBe('SecOC_Cfg.h');
    // SecOC_Cfg.h: SECOC_NUM_TX_PDUS (4u) / SECOC_DEV_ERROR_DETECT STD_ON
    expect(files[0].content).toContain('#define SECOC_NUM_TX_PDUS    (4U)');
    expect(files[0].content).toContain('#define SECOC_DEV_ERROR_DETECT    STD_ON');
    expect(files[0].content).toContain('#define SECOC_CFG_AR_RELEASE_MAJOR_VERSION    (4U)');
  });

  it('tcpip: TCPIP_* macros match hand-written TcpIp_Cfg.h', async () => {
    const files = await generateHeadersFromSchemas(schemaByName('tcpip'));
    expect(files).toHaveLength(1);
    expect(files[0].filename).toBe('TcpIp_Cfg.h');
    // TcpIp_Cfg.h: TCPIP_MAX_SOCKETS (8U) / TCPIP_DEV_ERROR_DETECT STD_ON
    expect(files[0].content).toContain('#define TCPIP_MAX_SOCKETS    (8U)');
    expect(files[0].content).toContain('#define TCPIP_DEV_ERROR_DETECT    STD_ON');
  });

  it('wdg (ARXML schema): container params flatten to WDG_* macros', async () => {
    const files = await generateHeadersFromSchemas(schemaByName('wdg'));
    expect(files).toHaveLength(1);
    expect(files[0].filename).toBe('Wdg_Cfg.h');
    // WdgConfigSet.WdgDisableAllowed → WDG_DISABLE_ALLOWED（去除 Wdg 前缀，避免 WDG_WDG_*）
    expect(files[0].content).toContain('#define WDG_DISABLE_ALLOWED    STD_OFF');
  });
});

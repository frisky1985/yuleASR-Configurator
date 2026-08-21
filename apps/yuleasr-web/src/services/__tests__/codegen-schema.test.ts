import { describe, it, expect } from 'vitest';

import { generateHeadersFromSchemas, NOLANDING_MODULES } from '../codegen';

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
  it('should generate one header per loaded schema minus NOLANDING（仅配置不生成跳过）', async () => {
    const schemas = loadModuleSchemas();
    expect(schemas.length).toBeGreaterThanOrEqual(118);

    const files = await generateHeadersFromSchemas(schemas);
    // YAC-MAP-002：appswc/arti/compswc/fr 生成产物无 yuleASR 落地 → 跳过
    const noLanding = schemas.filter(s => NOLANDING_MODULES.has(s.name.toLowerCase()));
    expect(noLanding.length).toBeGreaterThan(0);
    expect(files).toHaveLength(schemas.length - noLanding.length);
    for (const f of files) {
      expect(f.language).toBe('h');
      expect(f.filename.endsWith('_Cfg.h')).toBe(true);
      expect(f.content).toContain('#define');
      expect(f.content).toContain('endif');
    }
    // 跳过模块不产出文件
    for (const s of noLanding) {
      expect(files.some(f => f.filename === `${s.name}_Cfg.h`)).toBe(false);
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

/**
 * YAC-MAP-002（2026-08-21 老板裁决）— 补全模块 schema 生成闭环验证：
 * ethtsyn/ldcom/tm 手写 schema（源码内嵌宏提取），dds/microdds 最小 schema
 * （findings 推荐 a+c：最小参数打通配置→生成，完整配置走代码直连）。
 * 参数名即宏名（UPPER_SNAKE，rawMacroNames 原样输出），默认值取自 yuleASR 源码。
 */
describe('Codegen - YAC-MAP-002 补全模块（有代码无 schema → 手写 schema 打通闭环）', () => {
  it('ethtsyn: EthTSyn_Cfg.h 含 ETHTSYN_* 宏（EthTSyn.c 内嵌宏提取）', async () => {
    const files = await generateHeadersFromSchemas(schemaByName('ethtsyn'));
    expect(files).toHaveLength(1);
    expect(files[0].filename).toBe('EthTSyn_Cfg.h');
    expect(files[0].content).toContain('#define ETHTSYN_DEV_ERROR_DETECT    STD_ON');
    expect(files[0].content).toContain('#define ETHTSYN_VERSION_INFO_API    STD_ON');
    expect(files[0].content).toContain('#define ETHTSYN_MODULE_ID    (10U)');
  });

  it('ldcom: LdCom_Cfg.h 含 LDCOM_* 宏（LdCom.c 内嵌宏提取）', async () => {
    const files = await generateHeadersFromSchemas(schemaByName('ldcom'));
    expect(files).toHaveLength(1);
    expect(files[0].filename).toBe('LdCom_Cfg.h');
    expect(files[0].content).toContain('#define LDCOM_DEV_ERROR_DETECT    STD_ON');
    expect(files[0].content).toContain('#define LDCOM_MODULE_ID    (11U)');
  });

  it('tm: Tm_Cfg.h 含 TM_* 宏（Tm.c 内嵌宏 + Tm_ConfigType 提取）', async () => {
    const files = await generateHeadersFromSchemas(schemaByName('tm'));
    expect(files).toHaveLength(1);
    expect(files[0].filename).toBe('Tm_Cfg.h');
    expect(files[0].content).toContain('#define TM_DEV_ERROR_DETECT    STD_ON');
    expect(files[0].content).toContain('#define TM_MODULE_ID    (12U)');
    expect(files[0].content).toContain('#define TM_NUM_TIME_BASES    (4U)');
    expect(files[0].content).toContain('#define TM_ENABLE_SYNC    STD_OFF');
  });

  it('dds: Dds_Cfg.h 含最小 DDS_* 宏（dds_runtime/dds_eth_transport 实际宏）', async () => {
    const files = await generateHeadersFromSchemas(schemaByName('dds'));
    expect(files).toHaveLength(1);
    expect(files[0].filename).toBe('Dds_Cfg.h');
    expect(files[0].content).toContain('#define DDS_ENABLE    STD_OFF');
    expect(files[0].content).toContain('#define DDS_DEFAULT_DOMAIN_ID    (0U)');
    expect(files[0].content).toContain('#define DDS_ETH_MULTICAST_PORT_BASE    (7400U)');
    expect(files[0].content).toContain('#define DDS_ETH_MAX_PARTICIPANTS    (16U)');
    expect(files[0].content).toContain('#define DDS_TRANSPORT_TYPE    DDS_TRANSPORT_ETH');
  });

  it('microdds: MicroDds_Cfg.h 含最小 MICRODDS_* 宏（microdds/types.h #ifndef 可覆盖宏）', async () => {
    const files = await generateHeadersFromSchemas(schemaByName('microdds'));
    expect(files).toHaveLength(1);
    expect(files[0].filename).toBe('MicroDds_Cfg.h');
    expect(files[0].content).toContain('#define MICRODDS_ENABLE    STD_OFF');
    expect(files[0].content).toContain('#define MICRODDS_MAX_PARTICIPANTS    (4U)');
    expect(files[0].content).toContain('#define MICRODDS_MAX_TOPICS    (8U)');
    expect(files[0].content).toContain('#define MICRODDS_DEFAULT_DOMAIN_ID    (0U)');
  });

  it('lntm↔lintp 命名核对：lintp schema 的 x-source-file 精确指向 services/lntm（双版 DoIP 先例）', () => {
    const schemas = loadModuleSchemas();
    const lintp = schemas.find(s => s.name === 'LinTp');
    const lintpEcual = schemas.find(s => s.name === 'LinTp_Ecual');
    expect(lintp).toBeDefined();
    expect(lintpEcual).toBeDefined();
    // 与 DoIP 双版先例一致：x-source-file 区分 services/ecual 两版
    expect((lintp as unknown as Record<string, unknown>)['sourceFile']).toBe(
      'src/bsw/services/lntm/include/LinTp_Cfg.h'
    );
    expect((lintpEcual as unknown as Record<string, unknown>)['sourceFile']).toBe(
      'src/bsw/ecual/linTp/include/LinTp_Cfg.h'
    );
  });
});

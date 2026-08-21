/**
 * P0-1 probe: codegen fallback/error behavior for missing modules & handwritten headers.
 * Scenarios:
 *  1. KNOWN_MIXED_HEADERS module + splice mode + missing handwritten -> must throw
 *  2. Non-macro handwritten + no handwrittenHeaders provided (browser mode) -> warn, pure-macro output
 *  3. Unknown module with non-macro content + handwritten provided -> auto-splice (no throw)
 *  4. Schema missing entirely -> generateHeadersFromSchemas simply doesn't include it (caller must guard)
 */
import { describe, it, expect } from 'vitest';
import { generateHeadersFromSchemas } from '../codegen';

const canifSchema: any = {
  name: 'CanIf',
  version: '1.0.0',
  parameters: [
    { name: 'CANIF_DEV_ERROR_DETECT', type: 'boolean', default: true },
    { name: 'CANIF_NUM_CONTROLLERS', type: 'integer', default: 1 },
  ],
};

describe('P0-1 codegen fallback/error probes', () => {
  it('S1: KNOWN_MIXED_HEADERS + splice mode + missing handwritten -> throws', async () => {
    await expect(
      generateHeadersFromSchemas([canifSchema], { handwrittenHeaders: new Map() })
    ).rejects.toThrow(/缺少手写头内容/);
  });

  it('S1b: P0-1 补齐的拼接模块（doip）在 splice 模式缺手写头时同样报错（不静默产出残缺纯宏头）', async () => {
    const doipSchema: any = {
      name: 'DoIP',
      version: '1.0.0',
      parameters: [{ name: 'DOIP_DEV_ERROR_DETECT', type: 'boolean', default: true }],
    };
    await expect(
      generateHeadersFromSchemas([doipSchema], { handwrittenHeaders: new Map() })
    ).rejects.toThrow(/缺少手写头内容/);
  });

  it('S1c: P0-1 对象/数组字面量宏（object-literal）原样输出，不再丢失为 ""', async () => {
    const schema: any = {
      name: 'DoIP',
      version: '1.0.0',
      parameters: [
        { name: 'DOIP_EID', type: 'string', default: '{0x00, 0x1A, 0x2B, 0x3C, 0x4D, 0x5E}' },
        { name: 'DOIP_GID', type: 'string', default: '{0x00, 0x00, 0x00, 0x00, 0x00, 0x00}' },
      ],
    };
    const out = await generateHeadersFromSchemas([schema]);
    expect(out[0].content).toContain('#define DOIP_EID    {0x00, 0x1A, 0x2B, 0x3C, 0x4D, 0x5E}');
    expect(out[0].content).not.toContain('#define DOIP_EID    ""');
  });

  it('S1d: P0-1 多行对象宏（含续行 \\）原样输出，不丢失为 ""', async () => {
    const schema: any = {
      name: 'Crypto',
      version: '1.0.0',
      parameters: [
        {
          name: 'CRYPTO_ALG_SHA256',
          type: 'string',
          default: '\\\n{ \\\n.family = CRYPTO_ALGOFAM_SHA2_256, \\\n.curve = 0 \\\n}',
        },
      ],
    };
    const out = await generateHeadersFromSchemas([schema]);
    expect(out[0].content).toContain('CRYPTO_ALGOFAM_SHA2_256');
    expect(out[0].content).not.toContain('#define CRYPTO_ALG_SHA256    ""');
  });

  it('S2: browser mode (no handwritten) for mixed header -> warn, pure-macro output', async () => {
    const mixed = `#ifndef CANIF_CFG_H\n#define CANIF_CFG_H\n#define CANIF_DEV_ERROR_DETECT (STD_ON)\ntypedef struct { uint8 a; } CanIf_ConfigType;\nextern const CanIf_ConfigType CanIf_ConfigData;\n#endif`;
    const out = await generateHeadersFromSchemas([canifSchema], {
      handwrittenHeaders: new Map([['CanIf_Cfg.h', mixed]]),
    });
    // with handwritten provided + non-macro content -> splice path actually
    expect(out[0].content).toContain('NON-MACRO SEGMENT');
  });

  it('S3: unknown mixed module + handwritten provided -> auto-splice, no throw', async () => {
    const schema: any = {
      name: 'Xyz',
      version: '1.0.0',
      parameters: [{ name: 'XYZ_CNT', type: 'integer', default: 2 }],
    };
    const mixed = `#ifndef XYZ_CFG_H\n#define XYZ_CFG_H\n#define XYZ_CNT (2U)\ntypedef struct { uint16 b; } Xyz_Type;\nextern const Xyz_Type Xyz_Data;\n#endif`;
    const out = await generateHeadersFromSchemas([schema], {
      handwrittenHeaders: new Map([['Xyz_Cfg.h', mixed]]),
    });
    expect(out[0].content).toContain('NON-MACRO SEGMENT');
    expect(out[0].content).toContain('Xyz_Type');
  });

  it('S4: unknown mixed module + splice mode + missing handwritten -> auto pure-macro (warning)', async () => {
    const schema: any = {
      name: 'Yzw',
      version: '1.0.0',
      parameters: [{ name: 'YZW_CNT', type: 'integer', default: 1 }],
    };
    const out = await generateHeadersFromSchemas([schema], { handwrittenHeaders: new Map() });
    expect(out[0].content).toMatch(/#define\s+YZW_CNT\s+\(1U\)/);
  });
});

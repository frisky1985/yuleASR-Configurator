import { describe, expect, it } from 'vitest';
import { CrossModuleValidator } from '@yuletech/core/validators';
import { loadPreferredSchemas } from '../schemaSource';

describe('T4 跨模块依赖校验链路验证（宏名版，生产入口）', () => {
  it('loadPreferredSchemas 透传 crossReferences + CrossModuleValidator 可检测违反', () => {
    // 生产入口：schema.name = PascalCase（Fee/Fls），与 configStore 一致
    const schemas = loadPreferredSchemas();
    const withRefs = schemas.filter(s => (s as any).crossReferences?.length > 0);
    console.log(`[T4] schema 总数 ${schemas.length}，含 crossReferences: ${withRefs.length} 模块`);
    console.log(`[T4] schema.name 示例: ${withRefs.slice(0, 4).map(s => s.name).join(', ')}`);
    expect(withRefs.length).toBeGreaterThanOrEqual(10);

    const fee = withRefs.find(s => s.name.toLowerCase() === 'fee');
    expect(fee).toBeDefined();
    console.log(`[T4] Fee crossRefs[0]: ${JSON.stringify(fee!.crossReferences[0])}`);
    const ref0 = fee!.crossReferences[0];
    console.log(`[T4] 目标模块名: ${ref0.module}（应匹配 schema.name）`);

    // 构造违反配置：Fee 块大小 4096 > Fls 最大读取 256
    const configs = [
      { module: fee!.name, parameters: { FEE_BLOCK_SIZE_512: 4096 } },
      { module: ref0.module, parameters: { FLS_MAX_READ_NORMAL_MODE: 256 } },
    ];
    const map = new Map(schemas.map(s => [s.name, s]));
    const v = new CrossModuleValidator(map);
    const errors = v.validate(configs);
    console.log(`[T4] 违反配置检测到 ${errors.length} 条: ${errors.map(e => e.message).join('; ')}`);
    expect(errors.length).toBeGreaterThan(0);
  });
});

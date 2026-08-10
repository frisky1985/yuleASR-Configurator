/**
 * replace-cfgh 执行器（Electron 主进程 spawn 用）——无断言，只执行 + 输出 JSON 结果。
 * 用法：REPLACE_MODE=dry-run|apply|rollback npx vitest run .../replace-cfgh-run.test.ts
 * stdout 最后一行 = JSON 结果（Electron main.mjs 解析）。
 */
import { it } from 'vitest';
import { runReplace } from '../../../../../scripts/replace-cfgh';

it('run replace-cfgh', async () => {
  const mode = (process.env.REPLACE_MODE || 'dry-run') as 'dry-run' | 'apply' | 'rollback';
  try {
    const r = await runReplace(mode);
    console.log('REPLACE_CFGH_RESULT=' + JSON.stringify(r));
  } catch (e: any) {
    console.log('REPLACE_CFGH_RESULT=' + JSON.stringify({ mode, error: e.message }));
  }
});

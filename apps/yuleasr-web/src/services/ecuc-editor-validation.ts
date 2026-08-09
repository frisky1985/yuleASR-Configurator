/**
 * ECUC 编辑实时校验（F3）
 *
 * 规则与 E3（core arxml-import/ecuc-consistency.ts）对齐，独立实现以便
 * 编辑时逐参数即时校验（不重走完整导入管线）：
 *  - 参数类型匹配定义：NUMERICAL→number / BOOLEAN→boolean / TEXTUAL·REFERENCE→string /
 *    ENUMERATION→字符串且 ∈ literals（错误消息与 E3 同格式，便于对照）；
 *  - 容器实例数上限：超过 UPPER-MULTIPLICITY → warning（E3 语义）；低于
 *    LOWER-MULTIPLICITY → warning（E3 只查上限，这里补下限提示，不阻塞）。
 *
 * 边界（诚实声明）：定义缺失（纯值层文件）的参数/容器无法校验 → 返回 null
 * （无 issue），与 E3「定义层缺席跳过校验」的降级语义一致。
 */

import type { EcucContainerDef, EcucParameterDef } from '@/services/arxml-ecuc-import';
import type { EcucEditIssue } from '@/types/ecuc-edit';

/** 定义类别人类可读标签（错误消息用，与 E3 KIND_LABELS 对齐） */
const KIND_LABELS: Record<string, string> = {
  NUMERICAL: 'a numerical value',
  TEXTUAL: 'a textual value',
  BOOLEAN: 'a boolean value',
  ENUMERATION: 'one of the enumeration literals',
  REFERENCE: 'a reference value',
};

/** 值的人类可读描述（与 E3 describeValue 对齐） */
function describeValue(value: string | number | boolean): string {
  if (typeof value === 'string') return `'${value}' (string)`;
  if (typeof value === 'number') return `${value} (number)`;
  return `${value} (boolean)`;
}

/**
 * 校验单个参数值（编辑时实时调用）。
 *
 * @param param 参数（name/definitionRef/value/def）
 * @returns issue 或 null（通过 / 无法校验）
 */
export function validateEditedParamValue(param: {
  name: string;
  definitionRef: string;
  value: string | number | boolean;
  def?: EcucParameterDef;
}): EcucEditIssue | null {
  const { def, value } = param;
  if (!def) return null; // 纯值层：无定义可依，跳过（与 E3 降级一致）

  const ok =
    def.kind === 'NUMERICAL'
      ? typeof value === 'number'
      : def.kind === 'BOOLEAN'
        ? typeof value === 'boolean'
        : def.kind === 'TEXTUAL'
          ? typeof value === 'string'
          : def.kind === 'REFERENCE'
            ? typeof value === 'string'
            : /* ENUMERATION */ typeof value === 'string' &&
              def.literals !== undefined &&
              def.literals.includes(value);

  if (ok) return null;

  if (def.kind === 'ENUMERATION') {
    return {
      severity: 'error',
      message: `Assignment type mismatch: ${param.definitionRef} (parameter ${param.name}): value '${String(value)}' is not one of the enumeration literals [${(def.literals ?? []).join(', ')}]`,
    };
  }
  return {
    severity: 'error',
    message: `Assignment type mismatch: ${param.definitionRef} (parameter ${param.name}): expected ${KIND_LABELS[def.kind]}, got ${describeValue(value)}`,
  };
}

/**
 * 校验容器实例数（编辑时增删容器后对兄弟组重新计数）。
 *
 * @param name 容器名（def.name）
 * @param count 当前实例数（同父下同名容器个数）
 * @param def 容器定义（可空）
 */
export function validateContainerInstanceCount(
  name: string,
  count: number,
  def?: EcucContainerDef
): EcucEditIssue | null {
  if (!def) return null;

  const upper = def.upperMultiplicity;
  if (upper !== undefined && upper >= 0 && count > upper) {
    return {
      severity: 'warning',
      message: `Container multiplicity exceeded: ${name}: ${count} instances exceed upper multiplicity ${upper}`,
    };
  }
  const lower = def.lowerMultiplicity;
  if (lower !== undefined && lower >= 0 && count < lower) {
    return {
      severity: 'warning',
      message: `Container multiplicity below lower bound: ${name}: ${count} instances below lower multiplicity ${lower}`,
    };
  }
  return null;
}

/** 容器定义短名模糊查找（递归整树；新增容器时从定义树选型用） */
export function findContainerDefInTree(
  defs: EcucContainerDef[] | undefined,
  name: string
): EcucContainerDef | undefined {
  if (!defs) return undefined;
  for (const def of defs) {
    if (def.name === name) return def;
    const sub = findContainerDefInTree(def.subContainerDefs, name);
    if (sub) return sub;
  }
  return undefined;
}

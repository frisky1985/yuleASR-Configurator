/**
 * Configuration Comparison Engine
 * Three-level diff: module, container, parameter
 */

import type { ConfigFile, ConfigModule, ConfigContainer, ConfigParameter } from '@/types/config'

// Status types for comparison
export type CompareStatus = 'same' | 'different' | 'only_a' | 'only_b'

// Module-level diff
export interface ModuleDiff {
  moduleName: string
  moduleId: string
  status: CompareStatus
  enabledA?: boolean
  enabledB?: boolean
}

// Container-level diff
export interface ContainerDiff {
  moduleName: string
  containerName: string
  containerId: string
  status: CompareStatus
  instanceCountA?: number
  instanceCountB?: number
  multiple?: boolean
}

// Parameter-level diff
export interface ParamDiff {
  moduleName: string
  containerPath: string
  parameterName: string
  parameterId: string
  status: CompareStatus
  valueA?: unknown
  valueB?: unknown
  type?: string
}

// Full comparison result
export interface ComparisonResult {
  configA: { id: string; name: string }
  configB: { id: string; name: string }
  moduleDiffs: ModuleDiff[]
  containerDiffs: ContainerDiff[]
  paramDiffs: ParamDiff[]
  summary: {
    modulesSame: number
    modulesDifferent: number
    modulesOnlyA: number
    modulesOnlyB: number
    containersSame: number
    containersDifferent: number
    containersOnlyA: number
    containersOnlyB: number
    paramsSame: number
    paramsDifferent: number
    paramsOnlyA: number
    paramsOnlyB: number
  }
}

// Generic diff for tree view
export interface ConfigDiff {
  type: 'module' | 'container' | 'parameter'
  path: string
  name: string
  status: CompareStatus
  oldValue?: unknown
  newValue?: unknown
  children?: ConfigDiff[]
}

function compareModules(moduleA: ConfigModule | undefined, moduleB: ConfigModule | undefined): ModuleDiff {
  if (moduleA && moduleB) {
    const same = moduleA.enabled === moduleB.enabled
    return {
      moduleName: moduleA.name,
      moduleId: moduleA.id,
      status: same ? 'same' : 'different',
      enabledA: moduleA.enabled,
      enabledB: moduleB.enabled,
    }
  } else if (moduleA && !moduleB) {
    return {
      moduleName: moduleA.name,
      moduleId: moduleA.id,
      status: 'only_a',
      enabledA: moduleA.enabled,
    }
  } else if (!moduleA && moduleB) {
    return {
      moduleName: moduleB.name,
      moduleId: moduleB.id,
      status: 'only_b',
      enabledB: moduleB.enabled,
    }
  }
  throw new Error('Both modules are undefined')
}

function compareContainers(
  containersA: ConfigContainer[],
  containersB: ConfigContainer[],
  moduleName: string
): ContainerDiff[] {
  const diffs: ContainerDiff[] = []
  const allIds = new Set([
    ...containersA.map(c => c.id),
    ...containersB.map(c => c.id),
  ])

  for (const id of Array.from(allIds)) {
    const containerA = containersA.find(c => c.id === id)
    const containerB = containersB.find(c => c.id === id)

    if (containerA && containerB) {
      // Check instance count difference for multiple containers
      const multiple = containerA.multiple || containerB.multiple
      const instanceCountA = containerA.multiple ? (containerA.index ?? 0) + 1 : 1
      const instanceCountB = containerB.multiple ? (containerB.index ?? 0) + 1 : 1
      const sameInstances = instanceCountA === instanceCountB

      diffs.push({
        moduleName,
        containerName: containerA.name,
        containerId: containerA.id,
        status: sameInstances ? 'same' : 'different',
        instanceCountA,
        instanceCountB,
        multiple,
      })
    } else if (containerA && !containerB) {
      diffs.push({
        moduleName,
        containerName: containerA.name,
        containerId: containerA.id,
        status: 'only_a',
        instanceCountA: containerA.multiple ? (containerA.index ?? 0) + 1 : 1,
        multiple: containerA.multiple,
      })
    } else if (!containerA && containerB) {
      diffs.push({
        moduleName,
        containerName: containerB.name,
        containerId: containerB.id,
        status: 'only_b',
        instanceCountB: containerB.multiple ? (containerB.index ?? 0) + 1 : 1,
        multiple: containerB.multiple,
      })
    }
  }

  return diffs
}

function compareParameters(
  paramsA: ConfigParameter[],
  paramsB: ConfigParameter[],
  moduleName: string,
  containerPath: string
): ParamDiff[] {
  const diffs: ParamDiff[] = []
  const allIds = new Set([
    ...paramsA.map(p => p.id),
    ...paramsB.map(p => p.id),
  ])

  for (const id of Array.from(allIds)) {
    const paramA = paramsA.find(p => p.id === id)
    const paramB = paramsB.find(p => p.id === id)

    const paramName = paramA?.name || paramB?.name || id

    if (paramA && paramB) {
      const same = JSON.stringify(paramA.value) === JSON.stringify(paramB.value)
      diffs.push({
        moduleName,
        containerPath,
        parameterName: paramName,
        parameterId: id,
        status: same ? 'same' : 'different',
        valueA: paramA.value,
        valueB: paramB.value,
        type: paramA.type,
      })
    } else if (paramA && !paramB) {
      diffs.push({
        moduleName,
        containerPath,
        parameterName: paramName,
        parameterId: id,
        status: 'only_a',
        valueA: paramA.value,
        type: paramA.type,
      })
    } else if (!paramA && paramB) {
      diffs.push({
        moduleName,
        containerPath,
        parameterName: paramName,
        parameterId: id,
        status: 'only_b',
        valueB: paramB.value,
        type: paramB.type,
      })
    }
  }

  return diffs
}

function buildContainerPath(moduleName: string, containerName: string): string {
  return `${moduleName}.${containerName}`
}

class ConfigComparer {
  /**
   * Compare two configurations at three levels: module, container, parameter
   */
  compare(configA: ConfigFile, configB: ConfigFile): ComparisonResult {
    const moduleDiffs: ModuleDiff[] = []
    const containerDiffs: ContainerDiff[] = []
    const paramDiffs: ParamDiff[] = []

    // Collect all module IDs
    const allModuleIds = new Set([
      ...configA.modules.map(m => m.id),
      ...configB.modules.map(m => m.id),
    ])

    for (const moduleId of Array.from(allModuleIds)) {
      const moduleA = configA.modules.find(m => m.id === moduleId)
      const moduleB = configB.modules.find(m => m.id === moduleId)

      // Module level
      moduleDiffs.push(compareModules(moduleA, moduleB))

      if (moduleA && moduleB) {
        // Container level
        const containerDiffsResult = compareContainers(
          moduleA.containers,
          moduleB.containers,
          moduleA.name
        )
        containerDiffs.push(...containerDiffsResult)

        // Parameter level (module-level parameters)
        const moduleParamDiffs = compareParameters(
          moduleA.parameters,
          moduleB.parameters,
          moduleA.name,
          moduleA.name
        )
        paramDiffs.push(...moduleParamDiffs)

        // Container-level parameters + sub-containers
        const allContainerIds = new Set([
          ...moduleA.containers.map(c => c.id),
          ...moduleB.containers.map(c => c.id),
        ])

        for (const containerId of Array.from(allContainerIds)) {
          const containerA = moduleA.containers.find(c => c.id === containerId)
          const containerB = moduleB.containers.find(c => c.id === containerId)

          if (containerA && containerB) {
            const cPath = buildContainerPath(moduleA.name, containerA.name)
            const cParamDiffs = compareParameters(
              containerA.parameters,
              containerB.parameters,
              moduleA.name,
              cPath
            )
            paramDiffs.push(...cParamDiffs)

            // Sub-containers
            if (containerA.subContainers || containerB.subContainers) {
              const subContainerDiffs = compareContainers(
                containerA.subContainers || [],
                containerB.subContainers || [],
                moduleA.name
              )
              containerDiffs.push(...subContainerDiffs)

              // Sub-container parameters
              const allSubIds = new Set([
                ...(containerA.subContainers || []).map(c => c.id),
                ...(containerB.subContainers || []).map(c => c.id),
              ])
              for (const subId of Array.from(allSubIds)) {
                const subA = (containerA.subContainers || []).find(c => c.id === subId)
                const subB = (containerB.subContainers || []).find(c => c.id === subId)
                if (subA && subB) {
                  const subPath = buildContainerPath(moduleA.name, `${containerA.name}.${subA.name}`)
                  const subParamDiffs = compareParameters(
                    subA.parameters,
                    subB.parameters,
                    moduleA.name,
                    subPath
                  )
                  paramDiffs.push(...subParamDiffs)
                }
              }
            }
          }
        }
      } else if (moduleA && !moduleB) {
        // Module only in A - all its containers and params are "only_a"
        for (const container of moduleA.containers) {
          containerDiffs.push({
            moduleName: moduleA.name,
            containerName: container.name,
            containerId: container.id,
            status: 'only_a',
            instanceCountA: container.multiple ? (container.index ?? 0) + 1 : 1,
            multiple: container.multiple,
          })
          // Sub-containers
          for (const sub of container.subContainers || []) {
            containerDiffs.push({
              moduleName: moduleA.name,
              containerName: sub.name,
              containerId: sub.id,
              status: 'only_a',
              instanceCountA: sub.multiple ? (sub.index ?? 0) + 1 : 1,
              multiple: sub.multiple,
            })
            for (const p of sub.parameters) {
              paramDiffs.push({
                moduleName: moduleA.name,
                containerPath: `${moduleA.name}.${container.name}.${sub.name}`,
                parameterName: p.name,
                parameterId: p.id,
                status: 'only_a',
                valueA: p.value,
                type: p.type,
              })
            }
          }
          for (const p of container.parameters) {
            paramDiffs.push({
              moduleName: moduleA.name,
              containerPath: `${moduleA.name}.${container.name}`,
              parameterName: p.name,
              parameterId: p.id,
              status: 'only_a',
              valueA: p.value,
              type: p.type,
            })
          }
        }
        for (const p of moduleA.parameters) {
          paramDiffs.push({
            moduleName: moduleA.name,
            containerPath: moduleA.name,
            parameterName: p.name,
            parameterId: p.id,
            status: 'only_a',
            valueA: p.value,
            type: p.type,
          })
        }
      } else if (!moduleA && moduleB) {
        // Module only in B - all its containers and params are "only_b"
        for (const container of moduleB.containers) {
          containerDiffs.push({
            moduleName: moduleB.name,
            containerName: container.name,
            containerId: container.id,
            status: 'only_b',
            instanceCountB: container.multiple ? (container.index ?? 0) + 1 : 1,
            multiple: container.multiple,
          })
          for (const sub of container.subContainers || []) {
            containerDiffs.push({
              moduleName: moduleB.name,
              containerName: sub.name,
              containerId: sub.id,
              status: 'only_b',
              instanceCountB: sub.multiple ? (sub.index ?? 0) + 1 : 1,
              multiple: sub.multiple,
            })
            for (const p of sub.parameters) {
              paramDiffs.push({
                moduleName: moduleB.name,
                containerPath: `${moduleB.name}.${container.name}.${sub.name}`,
                parameterName: p.name,
                parameterId: p.id,
                status: 'only_b',
                valueB: p.value,
                type: p.type,
              })
            }
          }
          for (const p of container.parameters) {
            paramDiffs.push({
              moduleName: moduleB.name,
              containerPath: `${moduleB.name}.${container.name}`,
              parameterName: p.name,
              parameterId: p.id,
              status: 'only_b',
              valueB: p.value,
              type: p.type,
            })
          }
        }
        for (const p of moduleB.parameters) {
          paramDiffs.push({
            moduleName: moduleB.name,
            containerPath: moduleB.name,
            parameterName: p.name,
            parameterId: p.id,
            status: 'only_b',
            valueB: p.value,
            type: p.type,
          })
        }
      }
    }

    // Build summary
    const summary = {
      modulesSame: moduleDiffs.filter(d => d.status === 'same').length,
      modulesDifferent: moduleDiffs.filter(d => d.status === 'different').length,
      modulesOnlyA: moduleDiffs.filter(d => d.status === 'only_a').length,
      modulesOnlyB: moduleDiffs.filter(d => d.status === 'only_b').length,
      containersSame: containerDiffs.filter(d => d.status === 'same').length,
      containersDifferent: containerDiffs.filter(d => d.status === 'different').length,
      containersOnlyA: containerDiffs.filter(d => d.status === 'only_a').length,
      containersOnlyB: containerDiffs.filter(d => d.status === 'only_b').length,
      paramsSame: paramDiffs.filter(d => d.status === 'same').length,
      paramsDifferent: paramDiffs.filter(d => d.status === 'different').length,
      paramsOnlyA: paramDiffs.filter(d => d.status === 'only_a').length,
      paramsOnlyB: paramDiffs.filter(d => d.status === 'only_b').length,
    }

    return {
      configA: { id: configA.id, name: configA.name },
      configB: { id: configB.id, name: configB.name },
      moduleDiffs,
      containerDiffs,
      paramDiffs,
      summary,
    }
  }

  /**
   * Build a tree structure for display
   */
  buildDiffTree(result: ComparisonResult, filter: 'all' | 'diff_only' = 'all'): ConfigDiff[] {
    const tree: ConfigDiff[] = []

    for (const md of result.moduleDiffs) {
      if (filter === 'diff_only' && md.status === 'same') continue

      const moduleNode: ConfigDiff = {
        type: 'module',
        path: md.moduleName,
        name: md.moduleName,
        status: md.status,
        oldValue: md.enabledA,
        newValue: md.enabledB,
        children: [],
      }

      // Add container diffs for this module
      const moduleContainers = result.containerDiffs.filter(c => c.moduleName === md.moduleName)
      for (const cd of moduleContainers) {
        if (filter === 'diff_only' && cd.status === 'same') continue

        const containerNode: ConfigDiff = {
          type: 'container',
          path: `${md.moduleName}.${cd.containerName}`,
          name: cd.containerName,
          status: cd.status,
          oldValue: cd.instanceCountA,
          newValue: cd.instanceCountB,
          children: [],
        }

        // Add param diffs for this container
        const containerPath = cd.containerName.includes('.')
          ? cd.containerName
          : `${md.moduleName}.${cd.containerName}`
        
        const moduleParams = result.paramDiffs.filter(
          p => p.moduleName === md.moduleName && p.containerPath === containerPath
        )
        for (const pd of moduleParams) {
          if (filter === 'diff_only' && pd.status === 'same') continue

          containerNode.children!.push({
            type: 'parameter',
            path: `${containerPath}.${pd.parameterName}`,
            name: pd.parameterName,
            status: pd.status,
            oldValue: pd.valueA,
            newValue: pd.valueB,
          })
        }

        // Also check for container-level params where containerPath matches module name
        // (module-level parameters directly under the module's parameter list)
        if (moduleParams.length === 0) {
          const moduleLevelParams = result.paramDiffs.filter(
            p => p.moduleName === md.moduleName && p.containerPath === md.moduleName
          )
          for (const pd of moduleLevelParams) {
            if (filter === 'diff_only' && pd.status === 'same') continue
            containerNode.children!.push({
              type: 'parameter',
              path: `${md.moduleName}.${pd.parameterName}`,
              name: pd.parameterName,
              status: pd.status,
              oldValue: pd.valueA,
              newValue: pd.valueB,
            })
          }
        }

        if (containerNode.children!.length > 0 || filter === 'all') {
          moduleNode.children!.push(containerNode)
        }
      }

      // Add module-level parameter diffs (parameters directly on the module, not in a container)
      const moduleLevelParams = result.paramDiffs.filter(
        p => p.moduleName === md.moduleName && p.containerPath === md.moduleName
      )
      if (moduleLevelParams.length > 0 && moduleContainers.length === 0) {
        const defaultContainer: ConfigDiff = {
          type: 'container',
          path: `${md.moduleName}.parameters`,
          name: 'Parameters',
          status: 'same',
          children: [],
        }
        for (const pd of moduleLevelParams) {
          if (filter === 'diff_only' && pd.status === 'same') continue
          defaultContainer.children!.push({
            type: 'parameter',
            path: `${md.moduleName}.${pd.parameterName}`,
            name: pd.parameterName,
            status: pd.status,
            oldValue: pd.valueA,
            newValue: pd.valueB,
          })
        }
        if (defaultContainer.children!.length > 0 || filter === 'all') {
          moduleNode.children!.push(defaultContainer)
        }
      }

      if (moduleNode.children!.length > 0 || filter === 'all') {
        tree.push(moduleNode)
      }
    }

    return tree
  }
}

// Singleton instance
export const configComparer = new ConfigComparer()

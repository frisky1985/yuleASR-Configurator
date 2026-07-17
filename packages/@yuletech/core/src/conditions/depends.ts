/**
 * @yuletech/core - Dependency Graph for Constraint Propagation
 * Manages change ordering and cycle detection for propagation rules.
 */

export interface DependencyNode {
  key: string; // "module.param"
  dependsOn: string[]; // keys this node depends on
}

/**
 * Directed graph that tracks which module parameters depend on which,
 * enabling topological sort for correct propagation ordering and
 * cycle detection to catch circular dependencies.
 */
export class DependencyGraph {
  private nodes = new Map<string, DependencyNode>();

  /** Add or update a dependency node */
  addNode(key: string, dependsOn: string[]): void {
    this.nodes.set(key, { key, dependsOn: [...dependsOn] });
  }

  /** Remove a node from the graph */
  removeNode(key: string): void {
    this.nodes.delete(key);
  }

  /**
   * Topological sort — returns keys in evaluation order.
   * Uses Kahn's algorithm. If cycles are present, returns a partial
   * ordering (nodes without in-cycle dependencies first).
   */
  sort(): string[] {
    // Build adjacency list (dependencies → dependents)
    const adjacency = new Map<string, string[]>();
    const inDegree = new Map<string, number>();

    // Initialise all nodes
    for (const node of this.nodes.values()) {
      if (!adjacency.has(node.key)) adjacency.set(node.key, []);
      if (!inDegree.has(node.key)) inDegree.set(node.key, 0);
    }

    // Populate edges: for each dependency edge dep → node.key
    for (const node of this.nodes.values()) {
      for (const dep of node.dependsOn) {
        if (!this.nodes.has(dep)) continue; // skip unknown deps
        const edges = adjacency.get(dep);
        if (edges) {
          edges.push(node.key);
        } else {
          adjacency.set(dep, [node.key]);
        }
        inDegree.set(node.key, (inDegree.get(node.key) || 0) + 1);
      }
    }

    // Kahn's algorithm
    const queue: string[] = [];
    for (const [key, degree] of inDegree) {
      if (degree === 0) queue.push(key);
    }

    const sorted: string[] = [];
    while (queue.length > 0) {
      const node = queue.shift()!;
      sorted.push(node);
      const dependents = adjacency.get(node) || [];
      for (const dep of dependents) {
        const newDegree = (inDegree.get(dep) || 1) - 1;
        inDegree.set(dep, newDegree);
        if (newDegree === 0) queue.push(dep);
      }
    }

    return sorted;
  }

  /** Maximum recursion depth allowed during cycle detection */
  static readonly MAX_DEPTH = 20;

  /**
   * Detect cycles in the dependency graph.
   * Returns an array of cycle paths (each cycle is a string[] of keys).
   * Returns empty array if no cycles exist.
   */
  detectCycles(): string[][] {
    const cycles: string[][] = [];
    const visited = new Set<string>();
    const recursionStack = new Set<string>();
    const path: string[] = [];
    let depth = 0;

    const dfs = (key: string) => {
      if (++depth > DependencyGraph.MAX_DEPTH) {
        depth = 0;
        throw new Error(
          `MAX_DEPTH (${DependencyGraph.MAX_DEPTH}) exceeded during cycle detection. Possible circular dependency near: ${key}`
        );
      }
      if (recursionStack.has(key)) {
        // Found a cycle — extract the cycle path
        const cycleStart = path.indexOf(key);
        if (cycleStart !== -1) {
          cycles.push([...path.slice(cycleStart), key]);
        }
        return;
      }
      if (visited.has(key)) return;

      visited.add(key);
      recursionStack.add(key);
      path.push(key);

      const node = this.nodes.get(key);
      if (node) {
        for (const dep of node.dependsOn) {
          if (this.nodes.has(dep)) {
            dfs(dep);
          }
        }
      }

      path.pop();
      recursionStack.delete(key);
      depth--;
    };

    for (const key of this.nodes.keys()) {
      if (!visited.has(key)) {
        dfs(key);
      }
    }

    return cycles;
  }

  /**
   * Get all nodes that depend on a key (reverse lookup).
   * i.e. all nodes that have `key` in their dependsOn array.
   */
  getDependents(key: string): string[] {
    const dependents: string[] = [];
    for (const node of this.nodes.values()) {
      if (node.dependsOn.includes(key)) {
        dependents.push(node.key);
      }
    }
    return dependents;
  }

  /**
   * Get all keys this node depends on.
   */
  getDependencies(key: string): string[] {
    const node = this.nodes.get(key);
    return node ? [...node.dependsOn] : [];
  }

  /** Get all node keys in the graph */
  getAllKeys(): string[] {
    return [...this.nodes.keys()];
  }
}

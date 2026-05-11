import type { ModuleConfig, ModuleSchema } from '@yuletech/core';

/**
 * Configuration state
 */
export interface ConfigState {
  version: string;
  modules: Map<string, ModuleModel>;
  modified: boolean;
  lastSaved?: Date;
}

/**
 * Module model
 */
export interface ModuleModel {
  name: string;
  schema: ModuleSchema;
  config: ModuleConfig;
  modified: boolean;
  errors: string[];
}

/**
 * Configuration project model
 */
export class ConfigProject {
  private state: ConfigState;

  constructor() {
    this.state = {
      version: '1.0.0',
      modules: new Map(),
      modified: false,
    };
  }

  /**
   * Get current state
   */
  getState(): ConfigState {
    return this.state;
  }

  /**
   * Add a module to the project
   */
  addModule(model: ModuleModel): void {
    this.state.modules.set(model.name, model);
    this.state.modified = true;
  }

  /**
   * Get a module by name
   */
  getModule(name: string): ModuleModel | undefined {
    return this.state.modules.get(name);
  }

  /**
   * Get all modules
   */
  getAllModules(): ModuleModel[] {
    return Array.from(this.state.modules.values());
  }

  /**
   * Check if project is modified
   */
  isModified(): boolean {
    return this.state.modified;
  }

  /**
   * Mark as saved
   */
  markSaved(): void {
    this.state.modified = false;
    this.state.lastSaved = new Date();
  }
}

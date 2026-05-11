import type { ConfigEngine } from '../engine';
import type { ConfigProject } from '../models';

/**
 * Service container
 */
export class ServiceContainer {
  private services: Map<string, unknown> = new Map();
  private project: ConfigProject;
  private engine: ConfigEngine;

  constructor(project: ConfigProject, engine: ConfigEngine) {
    this.project = project;
    this.engine = engine;
  }

  /**
   * Register a service
   */
  register<T>(name: string, service: T): void {
    this.services.set(name, service);
  }

  /**
   * Get a service
   */
  get<T>(name: string): T | undefined {
    return this.services.get(name) as T | undefined;
  }

  /**
   * Get project
   */
  getProject(): ConfigProject {
    return this.project;
  }

  /**
   * Get engine
   */
  getEngine(): ConfigEngine {
    return this.engine;
  }
}

/**
 * Base service class
 */
export abstract class BaseService {
  protected container: ServiceContainer;

  constructor(container: ServiceContainer) {
    this.container = container;
  }

  /**
   * Initialize service
   */
  abstract init(): Promise<void>;

  /**
   * Dispose service
   */
  abstract dispose(): Promise<void>;
}

/**
 * AutoSAR Registry Sample Data Validation Tests
 * @description Validates registry-samples data integrity: module structure, field completeness, stats
 */

import { describe, it, expect } from 'vitest';
import {
  REGISTRY_MODULES,
  getRegistryModuleById,
  getRegistryStats,
  getRegistryVersionHistory,
} from '../registry-samples';


describe('AutoSAR Registry Sample Data', () => {
  // ─── Module count ──────────────────────────────────────────────────
  it('should have exactly 10 registry modules', () => {
    expect(REGISTRY_MODULES.length).toBe(10);
  });

  // ─── Each module has required fields ───────────────────────────────
  it('each registry module should have all required fields with truthy values', () => {
    REGISTRY_MODULES.forEach(mod => {
      expect(mod.id).toBeTruthy();
      expect(mod.name).toBeTruthy();
      expect(mod.version).toBeTruthy();
      expect(mod.layer).toBeTruthy();
      expect(mod.description).toBeTruthy();
      expect(mod.tags).toBeDefined();
      expect(Array.isArray(mod.tags)).toBe(true);
      expect(mod.tags.length).toBeGreaterThan(0);
      expect(mod.author).toBeTruthy();
      expect(mod.configData).toBeTruthy();
      expect(mod.compatibility).toBeDefined();
      expect(mod.dependencies).toBeDefined();
      expect(Array.isArray(mod.dependencies)).toBe(true);
      expect(mod.stats).toBeDefined();
      expect(mod.status).toBeTruthy();
      expect(mod.timestamps).toBeDefined();
      expect(mod.timestamps.created).toBeTruthy();
      expect(mod.timestamps.updated).toBeTruthy();
    });
  });

  // ─── Specific module IDs ───────────────────────────────────────────
  it('should contain all expected registry module IDs', () => {
    const ids = REGISTRY_MODULES.map(m => m.id);
    expect(ids).toContain('can-stack');
    expect(ids).toContain('dio-driver');
    expect(ids).toContain('spi-master');
    expect(ids).toContain('mcu-clock-config');
    expect(ids).toContain('os-scheduler');
    expect(ids).toContain('lin-master');
    expect(ids).toContain('eth-socket');
    expect(ids).toContain('wdg-driver');
    expect(ids).toContain('pwm-timer');
    expect(ids).toContain('fls-nvm');
  });

  // ─── Version strings are valid semver-like ─────────────────────────
  it('each module should have a valid version pattern', () => {
    const versionPattern = /^\d+\.\d+\.\d+/;
    REGISTRY_MODULES.forEach(mod => {
      expect(mod.version).toMatch(versionPattern);
    });
  });

  // ─── Stats validation ──────────────────────────────────────────────
  it('each module should have valid stats', () => {
    REGISTRY_MODULES.forEach(mod => {
      expect(mod.stats.downloads).toBeGreaterThanOrEqual(0);
      expect(mod.stats.rating).toBeGreaterThanOrEqual(0);
      expect(mod.stats.rating).toBeLessThanOrEqual(5);
      expect(mod.stats.reviewCount).toBeGreaterThanOrEqual(0);
    });
  });

  // ─── Status validation ─────────────────────────────────────────────
  it('each module should have a valid status', () => {
    const validStatuses = ['published', 'draft', 'deprecated', 'review'];
    REGISTRY_MODULES.forEach(mod => {
      expect(validStatuses).toContain(mod.status);
    });
  });

  // ─── Layer validation ──────────────────────────────────────────────
  it('each module should have a valid layer', () => {
    const validLayers = ['MCAL', 'ECUAL', 'Service', 'RTE_ASW', 'Complex', 'System'];
    REGISTRY_MODULES.forEach(mod => {
      expect(validLayers).toContain(mod.layer);
    });
  });

  // ─── Compatibility validation ──────────────────────────────────────
  it('each module should have compatibility with at least 1 MCU, OS, compiler', () => {
    REGISTRY_MODULES.forEach(mod => {
      expect(mod.compatibility.mcu.length).toBeGreaterThanOrEqual(1);
      expect(mod.compatibility.os.length).toBeGreaterThanOrEqual(1);
      expect(mod.compatibility.compiler.length).toBeGreaterThanOrEqual(1);
    });
  });

  // ─── Tags ──────────────────────────────────────────────────────────
  it('each module should have at least 2 tags', () => {
    REGISTRY_MODULES.forEach(mod => {
      expect(mod.tags.length).toBeGreaterThanOrEqual(2);
    });
  });

  // ─── configData is valid JSON ──────────────────────────────────────
  it('each module should have parseable configData JSON', () => {
    REGISTRY_MODULES.forEach(mod => {
      expect(() => JSON.parse(mod.configData)).not.toThrow();
      const parsed = JSON.parse(mod.configData);
      expect(parsed).toHaveProperty('name');
      expect(parsed).toHaveProperty('version');
      expect(parsed).toHaveProperty('module');
    });
  });

  // ─── Timestamps consistency ────────────────────────────────────────
  it('published modules should have a published timestamp', () => {
    REGISTRY_MODULES.forEach(mod => {
      if (mod.status === 'published') {
        expect(mod.timestamps.published).toBeTruthy();
      }
    });
  });

  it('draft modules should not have a published timestamp', () => {
    REGISTRY_MODULES.forEach(mod => {
      if (mod.status === 'draft') {
        expect(mod.timestamps.published).toBeUndefined();
      }
    });
  });

  it('timestamps should be valid ISO dates', () => {
    const isoPattern = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/;
    REGISTRY_MODULES.forEach(mod => {
      expect(mod.timestamps.created).toMatch(isoPattern);
      expect(mod.timestamps.updated).toMatch(isoPattern);
    });
  });

  // ─── getRegistryModuleById ─────────────────────────────────────────
  it('should find module by id', () => {
    const mod = getRegistryModuleById('can-stack');
    expect(mod).toBeDefined();
    expect(mod?.name).toContain('CAN Stack');
  });

  it('should return undefined for unknown id', () => {
    expect(getRegistryModuleById('nonexistent')).toBeUndefined();
  });

  // ─── getRegistryStats ──────────────────────────────────────────────
  it('getRegistryStats should return correct aggregate data', () => {
    const stats = getRegistryStats();
    expect(stats.totalModules).toBe(10);
    expect(stats.totalDownloads).toBeGreaterThan(0);
    expect(stats.layers.length).toBeGreaterThanOrEqual(1);
    expect(stats.mcus.length).toBeGreaterThan(0);
    expect(stats.layers).toContain('MCAL');
  });

  // ─── getRegistryVersionHistory ─────────────────────────────────────
  it('getRegistryVersionHistory should return version entries', () => {
    const history = getRegistryVersionHistory('can-stack');
    expect(history.length).toBeGreaterThanOrEqual(1);
    history.forEach(entry => {
      expect(entry).toHaveProperty('version');
      expect(entry).toHaveProperty('date');
      expect(entry).toHaveProperty('notes');
    });
  });

  // ─── Dependencies validation ───────────────────────────────────────
  it('each dependency should have required fields', () => {
    REGISTRY_MODULES.forEach(mod => {
      mod.dependencies.forEach(dep => {
        expect(dep.name).toBeTruthy();
        expect(dep.version).toBeTruthy();
        expect(typeof dep.optional).toBe('boolean');
      });
    });
  });

  // ─── No duplicate module IDs ───────────────────────────────────────
  it('should not have duplicate module IDs', () => {
    const ids = REGISTRY_MODULES.map(m => m.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(ids.length);
  });

  // ─── Author information ────────────────────────────────────────────
  it('each module should have a non-empty author', () => {
    REGISTRY_MODULES.forEach(mod => {
      expect(mod.author.length).toBeGreaterThan(0);
    });
  });
});

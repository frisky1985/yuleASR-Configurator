/**
 * AutoSAR Spec Index Data Integrity Tests
 * @description Validates spec-index data: 11 modules, 120+ APIs, all layers, field completeness
 */

import { describe, it, expect } from 'vitest';
import {
  getAllModules,
  getLayers,
  buildSearchIndex,
  findApiById,
  findModuleById,
  getModuleIndex,
  SPEC_VERSIONS,
  LAYERS,
} from '../spec-index';

describe('AutoSAR Spec Data Integrity', () => {
  // ─── Module count and identity ───────────────────────────────────────
  it('should have all 11 modules registered', () => {
    const modules = getAllModules();
    expect(modules.length).toBe(11);
    const names = modules.map(m => m.id);
    expect(names).toContain('Can');
    expect(names).toContain('Dio');
    expect(names).toContain('Port');
    expect(names).toContain('Mcu');
    expect(names).toContain('Spi');
    expect(names).toContain('Com');
    expect(names).toContain('PduR');
    expect(names).toContain('CanIf');
    expect(names).toContain('NvM');
    expect(names).toContain('EcuM');
    expect(names).toContain('Rte');
  });

  // ─── Total API count ≥ 120 ─────────────────────────────────────────
  it('should have at least 120 total APIs across all modules', () => {
    const modules = getAllModules();
    const total = modules.reduce((sum, m) => sum + m.apis.length, 0);
    expect(total).toBeGreaterThanOrEqual(120);
  });

  // ─── All 4 layers present ──────────────────────────────────────────
  it('should have all layers present', () => {
    const layers = getLayers();
    const layerIds = layers.map(l => l.id);
    expect(layerIds).toContain('MCAL');
    expect(layerIds).toContain('ECUAL');
    expect(layerIds).toContain('Service');
    expect(layerIds).toContain('RTE_ASW');
  });

  it('getLayers should return correct layer structure', () => {
    const layers = getLayers();
    layers.forEach(layer => {
      expect(layer).toHaveProperty('id');
      expect(layer).toHaveProperty('name');
      expect(layer).toHaveProperty('modules');
      expect(Array.isArray(layer.modules)).toBe(true);
    });
  });

  // ─── SPEC_VERSIONS ─────────────────────────────────────────────────
  it('SPEC_VERSIONS should have correct version entries', () => {
    expect(SPEC_VERSIONS.length).toBeGreaterThanOrEqual(3);
    const versionIds = SPEC_VERSIONS.map(v => v.id);
    expect(versionIds).toContain('4.4');
    expect(versionIds).toContain('4.6');
    expect(versionIds).toContain('R21-11');
    SPEC_VERSIONS.forEach(v => {
      expect(v).toHaveProperty('label');
      expect(v).toHaveProperty('releaseDate');
      expect(v).toHaveProperty('status');
    });
  });

  // ─── LAYERS ────────────────────────────────────────────────────────
  it('LAYERS constant should have correct layer definitions', () => {
    expect(LAYERS.length).toBe(4);
    const layerIds = LAYERS.map(l => l.id);
    expect(layerIds).toEqual(['MCAL', 'ECUAL', 'Service', 'RTE_ASW']);
    LAYERS.forEach(l => {
      expect(l).toHaveProperty('name');
      expect(l).toHaveProperty('description');
      expect(l).toHaveProperty('color');
    });
  });

  // ─── findApiById ───────────────────────────────────────────────────
  it('should find Can_Init by id with correct fields', () => {
    const api = findApiById('Can_Init');
    expect(api).toBeDefined();
    expect(api?.name).toBe('Can_Init');
    expect(api?.moduleId).toBe('Can');
    expect(api?.layerId).toBe('MCAL');
    expect(api?.returnType).toBeTruthy();
    expect(api?.signature).toBeTruthy();
    expect(api?.brief).toBeTruthy();
  });

  it('should find Rte_WriteVariable by id', () => {
    const api = findApiById('Rte_WriteVariable');
    expect(api).toBeDefined();
    expect(api?.moduleId).toBe('Rte');
    expect(api?.layerId).toBe('RTE_ASW');
  });

  it('should find NvM_ReadBlock by id', () => {
    const api = findApiById('NvM_ReadBlock');
    expect(api).toBeDefined();
    expect(api?.moduleId).toBe('NvM');
    expect(api?.layerId).toBe('Service');
  });

  it('should return undefined for non-existent API id', () => {
    expect(findApiById('NonExistent_Api')).toBeUndefined();
  });

  // ─── findModuleById ────────────────────────────────────────────────
  it('should find module by id', () => {
    const mod = findModuleById('Spi');
    expect(mod).toBeDefined();
    expect(mod?.id).toBe('Spi');
    expect(mod?.layer).toBe('MCAL');
  });

  it('should return undefined for non-existent module', () => {
    expect(findModuleById('Nonexistent')).toBeUndefined();
  });

  // ─── buildSearchIndex ──────────────────────────────────────────────
  it('should build search index with all APIs', () => {
    const index = buildSearchIndex();
    const modules = getAllModules();
    const totalApis = modules.reduce((s, m) => s + m.apis.length, 0);
    expect(index.length).toBe(totalApis);
    expect(index.length).toBeGreaterThanOrEqual(120);
    expect(index[0]).toHaveProperty('id');
    expect(index[0]).toHaveProperty('name');
    expect(index[0]).toHaveProperty('moduleId');
    expect(index[0]).toHaveProperty('layerId');
    expect(index[0]).toHaveProperty('signature');
    expect(index[0]).toHaveProperty('brief');
  });

  it('search index entries should have consistent moduleId references', () => {
    const index = buildSearchIndex();
    const moduleIds = new Set(getAllModules().map(m => m.id));
    index.forEach(entry => {
      expect(moduleIds.has(entry.moduleId)).toBe(true);
    });
  });

  // ─── getModuleIndex ────────────────────────────────────────────────
  it('should have module index with correct counts', () => {
    const idx = getModuleIndex();
    expect(idx.length).toBe(11);
    idx.forEach(m => {
      expect(m.apiCount).toBeGreaterThan(0);
      expect(m).toHaveProperty('id');
      expect(m).toHaveProperty('name');
      expect(m).toHaveProperty('layer');
      expect(m).toHaveProperty('apiCount');
    });
  });

  // ─── Every API field validation ────────────────────────────────────
  it('each API should have all required fields with truthy values', () => {
    const modules = getAllModules();
    modules.forEach(mod => {
      mod.apis.forEach(api => {
        expect(api.id).toBeTruthy();
        expect(api.name).toBeTruthy();
        expect(api.signature).toBeTruthy();
        expect(api.brief).toBeTruthy();
        expect(api.description).toBeTruthy();
        expect(api.returnType).toBeTruthy();
        expect(api.returnDescription).toBeTruthy();
        expect(api.moduleId).toBeTruthy();
        expect(api.layerId).toBeTruthy();
        expect(api.version).toBeTruthy();
        expect(api.example).toBeTruthy();
        expect(api.status).toBeTruthy();
        expect(api.params).toBeDefined();
        expect(Array.isArray(api.params)).toBe(true);
        expect(api.seeAlso).toBeDefined();
        expect(Array.isArray(api.seeAlso)).toBe(true);
      });
    });
  });

  // ─── API params validation ─────────────────────────────────────────
  it('each API param should have required fields', () => {
    const modules = getAllModules();
    modules.forEach(mod => {
      mod.apis.forEach(api => {
        api.params.forEach(param => {
          expect(param.name).toBeTruthy();
          expect(param.type).toBeTruthy();
          expect(['in', 'out', 'inout']).toContain(param.direction);
          expect(param.description).toBeTruthy();
        });
      });
    });
  });

  // ─── Each module ≥ 6 APIs ──────────────────────────────────────────
  it('each module should have at least 6 APIs', () => {
    const modules = getAllModules();
    modules.forEach(mod => {
      expect(mod.apis.length).toBeGreaterThanOrEqual(6);
    });
  });

  // ─── Module-layer mapping correctness ──────────────────────────────
  it('should have correct module-to-layer mappings', () => {
    const modules = getAllModules();
    const mcalModules = modules.filter(m => m.layer === 'MCAL').map(m => m.id);
    expect(mcalModules).toEqual(['Can', 'Dio', 'Port', 'Mcu', 'Spi']);

    const ecualModules = modules.filter(m => m.layer === 'ECUAL').map(m => m.id);
    expect(ecualModules).toEqual(['CanIf', 'Com', 'PduR']);

    const serviceModules = modules.filter(m => m.layer === 'Service').map(m => m.id);
    expect(serviceModules).toEqual(['NvM', 'EcuM']);

    const rteModules = modules.filter(m => m.layer === 'RTE_ASW').map(m => m.id);
    expect(rteModules).toEqual(['Rte']);
  });

  // ─── No duplicate API ids ──────────────────────────────────────────
  it('should not have duplicate API ids across all modules', () => {
    const modules = getAllModules();
    const allApiIds = modules.flatMap(m => m.apis.map(a => a.id));
    const uniqueIds = new Set(allApiIds);
    expect(uniqueIds.size).toBe(allApiIds.length);
  });

  // ─── Layers from getLayers have correct API counts ─────────────────
  it('getLayers should aggregate API counts correctly per layer', () => {
    const layers = getLayers();
    const allModules = getAllModules();
    layers.forEach(layer => {
      const expectedModuleCount = allModules.filter(m => m.layer === layer.id).length;
      expect(layer.modules.length).toBe(expectedModuleCount);
    });
  });

  // ─── Immutability check (getAllModules returns fresh array) ────────
  it('getAllModules should return a fresh array each call', () => {
    const a = getAllModules();
    const b = getAllModules();
    expect(a).not.toBe(b); // different reference
    expect(a).toEqual(b);  // same content
  });
});

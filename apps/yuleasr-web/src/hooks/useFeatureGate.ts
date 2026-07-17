import { useLicenseStore, type FeatureName } from '@/stores/licenseStore';

/**
 * useFeatureGate
 * Returns whether a given feature is available for the current user's tier.
 *
 * Usage:
 *   const canExportArxml = useFeatureGate('arxmlExport')
 *   const maxModules = useFeatureGate('maxModules') // returns number limit
 */

export function useFeatureGate(featureName: FeatureName): boolean | number {
  const features = useLicenseStore(s => s.features);
  return features[featureName] ?? false;
}

/**
 * useFeatureLimit
 * Returns the numeric limit for a feature (maxModules, maxProjects).
 */
export function useFeatureLimit(limitName: 'maxModules' | 'maxProjects'): number {
  const val = useFeatureGate(limitName);
  if (typeof val === 'number') return val;
  return val ? 9999 : 0;
}

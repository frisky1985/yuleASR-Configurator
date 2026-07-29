/**
 * PipelinePushButton — "Push to yuleOSH Pipeline" button
 *
 * Exports the current configuration as JSON and sends it to yuleOSH
 * pipeline trigger endpoint.
 */

import { useState, useCallback } from 'react';
import { Play, Loader2, CheckCircle, XCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { triggerPipeline } from '@/services/yuleoshPipeline';
import type { ConfigFile, ConfigModule } from '@/types';
import { generateArxml } from '@/services/arxml-exporter';

interface PipelinePushButtonProps {
  /** Current configuration to push */
  config: ConfigFile | null;
  /** Callback when pipeline is triggered — receives job_id */
  onPipelineStart?: (jobId: string) => void;
  /** Optional disabled state */
  disabled?: boolean;
  /** Optional size variant */
  size?: 'sm' | 'md' | 'lg';
}

type PushState = 'idle' | 'pushing' | 'success' | 'error';

export function PipelinePushButton({
  config,
  onPipelineStart,
  disabled = false,
  size = 'md',
}: PipelinePushButtonProps) {
  const [pushState, setPushState] = useState<PushState>('idle');
  const [errorMessage, setErrorMessage] = useState<string>('');

  const handlePush = useCallback(async () => {
    if (!config) return;

    setPushState('pushing');
    setErrorMessage('');

    try {
      // Build config JSON from the current ConfigFile
      const moduleConfigs = config.modules
        .filter(m => m.enabled)
        .map(m => ({
          name: m.name,
          version: m.version,
          layer: m.layer,
          parameters: Object.fromEntries(
            m.parameters.map(p => [p.name, p.value])
          ),
          enabled: m.enabled,
        }));

      const configPayload = {
        name: config.name,
        description: config.description,
        targetPlatform: config.targetPlatform,
        targetChip: config.targetChip,
        compiler: config.compiler,
        modules: moduleConfigs,
        os: config.os,
      };

      // Also try to generate ARXML representation
      let arxmlContent: string | undefined;
      try {
        arxmlContent = generateArxml(config);
      } catch {
        // ARXML generation is optional for the trigger
      }

      const result = await triggerPipeline({
        config_json: JSON.stringify(configPayload),
        arxml_content: arxmlContent,
        type: 'full',
      });

      if (result.ok) {
        setPushState('success');
        onPipelineStart?.(result.job_id);

        // Reset to idle after 3 seconds
        setTimeout(() => setPushState('idle'), 3000);
      } else {
        throw new Error(result.error ?? 'Unknown error');
      }
    } catch (err) {
      setPushState('error');
      setErrorMessage(err instanceof Error ? err.message : 'Failed to push to pipeline');
      // Reset error state after 5 seconds
      setTimeout(() => setPushState('idle'), 5000);
    }
  }, [config, onPipelineStart]);

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-xs gap-1.5',
    md: 'px-4 py-2 text-sm gap-2',
    lg: 'px-5 py-2.5 text-base gap-2',
  };

  const iconSize = size === 'sm' ? 14 : size === 'md' ? 16 : 18;

  return (
    <button
      onClick={handlePush}
      disabled={disabled || pushState === 'pushing' || pushState === 'success'}
      className={cn(
        'inline-flex items-center rounded-lg font-medium transition-all',
        'shadow-sm hover:shadow-md active:scale-[0.98]',
        sizeClasses[size],
        pushState === 'idle' &&
          'bg-blue-600 text-white hover:bg-blue-700 disabled:bg-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed',
        pushState === 'pushing' &&
          'bg-blue-500 text-white cursor-wait',
        pushState === 'success' &&
          'bg-green-600 text-white cursor-default',
        pushState === 'error' &&
          'bg-red-600 text-white'
      )}
      title={
        disabled
          ? 'No configuration loaded'
          : pushState === 'idle'
            ? 'Push to yuleOSH Pipeline'
            : pushState === 'pushing'
              ? 'Pushing to pipeline...'
              : pushState === 'success'
                ? 'Pipeline triggered!'
                : `Error: ${errorMessage}`
      }
    >
      {pushState === 'idle' && <Play size={iconSize} />}
      {pushState === 'pushing' && <Loader2 size={iconSize} className="animate-spin" />}
      {pushState === 'success' && <CheckCircle size={iconSize} />}
      {pushState === 'error' && <XCircle size={iconSize} />}

      {pushState === 'idle' && 'Push to Pipeline'}
      {pushState === 'pushing' && 'Pushing...'}
      {pushState === 'success' && 'Triggered!'}
      {pushState === 'error' && 'Failed'}
    </button>
  );
}

export default PipelinePushButton;

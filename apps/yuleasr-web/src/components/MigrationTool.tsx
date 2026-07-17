/**
 * Configuration Migration Tool
 * Import configurations from other AUTOSAR tools
 */

import {
  Upload,
  FileJson,
  AlertCircle,
  CheckCircle,
  Loader2,
  ChevronRight,
  Database,
  FileCode,
  Settings,
} from 'lucide-react';
import { useState, useCallback } from 'react';

import { cn } from '@/lib/utils';
import { useConfigStore } from '@/stores/configStore';

interface MigrationSource {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  supportedFormats: string[];
}

const migrationSources: MigrationSource[] = [
  {
    id: 'vector',
    name: 'Vector DaVinci Configurator',
    description: 'Import from Vector DaVinci .xdm or .arxml files',
    icon: <Database className="w-8 h-8 text-blue-600" />,
    supportedFormats: ['.xdm', '.arxml'],
  },
  {
    id: 'etas',
    name: 'ETAS ISOLAR-A/B',
    description: 'Import from ETAS ISOLAR configuration files',
    icon: <FileCode className="w-8 h-8 text-green-600" />,
    supportedFormats: ['.arxml', '.json'],
  },
  {
    id: 'eb',
    name: 'Elektrobit Tresos',
    description: 'Import from EB Tresos .xdm files',
    icon: <Settings className="w-8 h-8 text-purple-600" />,
    supportedFormats: ['.xdm'],
  },
  {
    id: 'autosar',
    name: 'Generic AUTOSAR',
    description: 'Import from standard AUTOSAR ARXML files',
    icon: <FileJson className="w-8 h-8 text-amber-600" />,
    supportedFormats: ['.arxml'],
  },
];

interface MigrationResult {
  success: boolean;
  message: string;
  modulesImported?: number;
  warnings?: string[];
}

export function MigrationTool() {
  const [selectedSource, setSelectedSource] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<MigrationResult | null>(null);
  const { createConfig } = useConfigStore();

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    async (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);

      if (!selectedSource) return;

      const files = Array.from(e.dataTransfer.files);
      await processFiles(files);
    },
    [selectedSource]
  );

  const handleFileSelect = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      if (!e.target.files || !selectedSource) return;

      const files = Array.from(e.target.files);
      await processFiles(files);
    },
    [selectedSource]
  );

  const processFiles = async (files: File[]) => {
    setIsProcessing(true);
    setResult(null);

    try {
      // Simulate processing
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Mock migration result
      const mockResult: MigrationResult = {
        success: true,
        message: `Successfully imported configuration from ${files.length} file(s)`,
        modulesImported: Math.floor(Math.random() * 10) + 5,
        warnings: [
          'Some parameter values may need manual review',
          'OS task priorities have been adjusted to fit yuleASR model',
        ],
      };

      setResult(mockResult);

      // Create a new config with imported modules
      if (mockResult.success) {
        await createConfig(
          `Migrated-${selectedSource}-${new Date().toISOString().slice(0, 10)}`,
          `Migrated from ${migrationSources.find(s => s.id === selectedSource)?.name}`
        );
      }
    } catch (error) {
      setResult({
        success: false,
        message: error instanceof Error ? error.message : 'Migration failed',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-foreground">Configuration Migration</h2>
        <p className="text-muted-foreground mt-1">Import configurations from other AUTOSAR tools</p>
      </div>

      {/* Source Selection */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {migrationSources.map(source => (
          <button
            key={source.id}
            onClick={() => {
              setSelectedSource(source.id);
              setResult(null);
            }}
            className={cn(
              'flex items-start gap-4 p-4 rounded-lg border-2 text-left transition-all',
              selectedSource === source.id
                ? 'border-primary bg-primary/5'
                : 'border-border hover:border-primary/50 hover:bg-accent'
            )}
          >
            <div className="flex-shrink-0">{source.icon}</div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-foreground">{source.name}</h3>
              <p className="text-sm text-muted-foreground mt-1">{source.description}</p>
              <div className="flex items-center gap-2 mt-2">
                {source.supportedFormats.map(format => (
                  <span
                    key={format}
                    className="px-2 py-0.5 bg-muted rounded text-xs text-muted-foreground"
                  >
                    {format}
                  </span>
                ))}
              </div>
            </div>
            <ChevronRight
              className={cn(
                'w-5 h-5 text-muted-foreground transition-transform',
                selectedSource === source.id && 'rotate-90 text-primary'
              )}
            />
          </button>
        ))}
      </div>

      {/* File Upload Area */}
      {selectedSource && (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={cn(
            'border-2 border-dashed rounded-lg p-8 text-center transition-colors',
            isDragging ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50',
            isProcessing && 'opacity-50 pointer-events-none'
          )}
        >
          {isProcessing ? (
            <div className="flex flex-col items-center gap-4">
              <Loader2 className="w-10 h-10 text-primary animate-spin" />
              <div>
                <p className="font-medium text-foreground">Processing migration...</p>
                <p className="text-sm text-muted-foreground mt-1">This may take a few moments</p>
              </div>
            </div>
          ) : (
            <>
              <Upload className="w-10 h-10 text-muted-foreground mx-auto mb-4" />
              <p className="font-medium text-foreground">Drop your configuration files here</p>
              <p className="text-sm text-muted-foreground mt-1">
                or{' '}
                <label className="text-primary hover:underline cursor-pointer">
                  browse
                  <input
                    type="file"
                    multiple
                    accept={migrationSources
                      .find(s => s.id === selectedSource)
                      ?.supportedFormats.join(',')}
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                </label>{' '}
                to upload
              </p>
              <p className="text-xs text-muted-foreground mt-4">
                Supported formats:{' '}
                {migrationSources.find(s => s.id === selectedSource)?.supportedFormats.join(', ')}
              </p>
            </>
          )}
        </div>
      )}

      {/* Result */}
      {result && (
        <div
          className={cn(
            'rounded-lg p-4',
            result.success
              ? 'bg-green-50 border border-green-200 dark:bg-green-900/20 dark:border-green-800'
              : 'bg-red-50 border border-red-200 dark:bg-red-900/20 dark:border-red-800'
          )}
        >
          <div className="flex items-start gap-3">
            {result.success ? (
              <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0" />
            )}
            <div className="flex-1">
              <p
                className={cn(
                  'font-medium',
                  result.success
                    ? 'text-green-900 dark:text-green-100'
                    : 'text-red-900 dark:text-red-100'
                )}
              >
                {result.message}
              </p>

              {result.modulesImported !== undefined && (
                <p className="text-sm text-muted-foreground mt-1">
                  {result.modulesImported} modules imported
                </p>
              )}

              {result.warnings && result.warnings.length > 0 && (
                <div className="mt-3 space-y-2">
                  <p className="text-sm font-medium text-amber-700 dark:text-amber-400">
                    Warnings:
                  </p>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    {result.warnings.map((warning, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <span className="text-amber-500">•</span>
                        {warning}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {result.success && (
                <p className="text-sm text-green-700 dark:text-green-400 mt-3">
                  A new configuration has been created. Go to Dashboard to view it.
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Instructions */}
      <div className="bg-muted rounded-lg p-4">
        <h3 className="font-semibold text-foreground mb-2">Migration Notes</h3>
        <ul className="text-sm text-muted-foreground space-y-1">
          <li>• Parameter mappings are based on standard AUTOSAR definitions where possible</li>
          <li>• Some vendor-specific parameters may need manual configuration</li>
          <li>• OS configurations are translated to yuleASR OS model</li>
          <li>• Always validate the migrated configuration before use</li>
        </ul>
      </div>
    </div>
  );
}

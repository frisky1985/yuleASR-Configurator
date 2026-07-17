import { yuleasrValidator } from '@yuletech/core';
import type { ModuleConfig, ValidationError, ValidationResult } from '@yuletech/core';
import {
  CheckCircle,
  AlertTriangle,
  XCircle,
  RefreshCw,
  ChevronDown,
  ChevronRight,
} from 'lucide-react';
import { useState, useEffect } from 'react';

import { cn } from '@/lib/utils';

interface ValidationPanelProps {
  modules: ModuleConfig[];
  result?: ValidationResult | null;
  onNavigate?: (path: string) => void;
  className?: string;
}

export function ValidationPanel({
  modules,
  result: externalResult,
  onNavigate,
  className,
}: ValidationPanelProps) {
  const [internalErrors, setInternalErrors] = useState<ValidationError[]>([]);
  const [isValidating, setIsValidating] = useState(false);
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(
    new Set(['errors', 'warnings'])
  );

  const errors = externalResult?.errors || internalErrors;
  const warnings = externalResult?.warnings || [];

  const validate = () => {
    setIsValidating(true);
    setTimeout(() => {
      const validationErrors = yuleasrValidator.validateModules(modules);
      setInternalErrors(validationErrors);
      setIsValidating(false);
    }, 500);
  };

  useEffect(() => {
    if (!externalResult) {
      validate();
    }
  }, [modules, externalResult]);

  const stats = yuleasrValidator.getValidationStats(errors);

  const handleItemClick = (path: string) => {
    if (onNavigate) {
      onNavigate(path);
    }
  };

  const toggleGroup = (group: string) => {
    setExpandedGroups(prev => {
      const newSet = new Set(prev);
      if (newSet.has(group)) {
        newSet.delete(group);
      } else {
        newSet.add(group);
      }
      return newSet;
    });
  };

  // Group errors by module
  const groupedErrors = errors.reduce(
    (acc, error) => {
      const moduleName = error.path.split('.')[0] || 'general';
      if (!acc[moduleName]) acc[moduleName] = [];
      acc[moduleName].push(error);
      return acc;
    },
    {} as Record<string, ValidationError[]>
  );

  const groupedWarnings = warnings.reduce(
    (acc, warning) => {
      const moduleName = warning.path.split('.')[0] || 'general';
      if (!acc[moduleName]) acc[moduleName] = [];
      acc[moduleName].push(warning);
      return acc;
    },
    {} as Record<string, ValidationError[]>
  );

  const hasErrors = stats.errorCount > 0;
  const hasWarnings = stats.warningCount > 0;
  const isValid = !hasErrors && !hasWarnings;

  return (
    <div
      className={cn(
        'bg-app-bg-primary border border-app-border-primary rounded-lg overflow-hidden',
        className
      )}
    >
      {/* Header */}
      <div className="px-4 py-3 border-b border-app-border-primary bg-app-bg-secondary flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h3 className="font-semibold text-app-text-primary">Validation</h3>
          {isValid ? (
            <span className="flex items-center gap-1 text-sm text-green-600">
              <CheckCircle className="w-4 h-4" />
              Valid
            </span>
          ) : (
            <div className="flex items-center gap-2">
              {hasErrors && (
                <span className="flex items-center gap-1 text-sm text-red-600">
                  <XCircle className="w-4 h-4" />
                  {stats.errorCount}
                </span>
              )}
              {hasWarnings && (
                <span className="flex items-center gap-1 text-sm text-yellow-600">
                  <AlertTriangle className="w-4 h-4" />
                  {stats.warningCount}
                </span>
              )}
            </div>
          )}
        </div>
        <button
          onClick={validate}
          disabled={isValidating}
          className="flex items-center gap-1 px-3 py-1.5 text-sm text-app-text-secondary hover:text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/40 rounded-lg transition-colors disabled:opacity-50"
        >
          <RefreshCw className={cn('w-4 h-4', isValidating && 'animate-spin')} />
          Refresh
        </button>
      </div>

      {/* Content */}
      <div className="max-h-80 overflow-auto">
        {isValid ? (
          <div className="p-6 text-center">
            <div className="w-14 h-14 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-3">
              <CheckCircle className="w-7 h-7 text-green-500" />
            </div>
            <p className="text-app-text-primary font-medium">Configuration is valid</p>
            <p className="text-sm text-app-text-tertiary mt-1">
              All {modules.length} modules pass validation
            </p>
          </div>
        ) : (
          <div className="divide-y divide-app-border-primary">
            {/* Errors Section */}
            {hasErrors && (
              <div>
                <button
                  onClick={() => toggleGroup('errors')}
                  className="w-full px-4 py-2 bg-red-50 text-red-700 text-sm font-medium flex items-center justify-between hover:bg-red-100 transition-colors"
                >
                  <span>Errors ({stats.errorCount})</span>
                  {expandedGroups.has('errors') ? (
                    <ChevronDown className="w-4 h-4" />
                  ) : (
                    <ChevronRight className="w-4 h-4" />
                  )}
                </button>
                {expandedGroups.has('errors') && (
                  <div className="divide-y divide-gray-50">
                    {Object.entries(groupedErrors).map(([moduleName, moduleErrors]) => (
                      <div key={moduleName} className="px-4 py-2">
                        <div className="text-xs font-medium text-app-text-secondary mb-1 uppercase tracking-wide">
                          {moduleName}
                        </div>
                        {moduleErrors.map((error: ValidationError, index: number) => (
                          <div
                            key={`error-${index}`}
                            className="py-2 hover:bg-app-bg-secondary cursor-pointer rounded px-2 -mx-2"
                            onClick={() => handleItemClick(error.path)}
                          >
                            <div className="flex items-start gap-2">
                              <XCircle className="w-4 h-4 text-red-500 mt-0.5 shrink-0" />
                              <div className="flex-1 min-w-0">
                                <p className="text-sm text-gray-800">{error.message}</p>
                                <p className="text-xs text-app-text-tertiary mt-0.5 font-mono">
                                  {error.path}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Warnings Section */}
            {hasWarnings && (
              <div>
                <button
                  onClick={() => toggleGroup('warnings')}
                  className="w-full px-4 py-2 bg-yellow-50 text-yellow-700 text-sm font-medium flex items-center justify-between hover:bg-yellow-100 transition-colors"
                >
                  <span>Warnings ({stats.warningCount})</span>
                  {expandedGroups.has('warnings') ? (
                    <ChevronDown className="w-4 h-4" />
                  ) : (
                    <ChevronRight className="w-4 h-4" />
                  )}
                </button>
                {expandedGroups.has('warnings') && (
                  <div className="divide-y divide-gray-50">
                    {Object.entries(groupedWarnings).map(([moduleName, moduleWarnings]) => (
                      <div key={moduleName} className="px-4 py-2">
                        <div className="text-xs font-medium text-app-text-secondary mb-1 uppercase tracking-wide">
                          {moduleName}
                        </div>
                        {moduleWarnings.map((warning: ValidationError, index: number) => (
                          <div
                            key={`warning-${index}`}
                            className="py-2 hover:bg-app-bg-secondary cursor-pointer rounded px-2 -mx-2"
                            onClick={() => handleItemClick(warning.path)}
                          >
                            <div className="flex items-start gap-2">
                              <AlertTriangle className="w-4 h-4 text-yellow-500 mt-0.5 shrink-0" />
                              <div className="flex-1 min-w-0">
                                <p className="text-sm text-gray-800">{warning.message}</p>
                                <p className="text-xs text-app-text-tertiary mt-0.5 font-mono">
                                  {warning.path}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Footer */}
      {(hasErrors || hasWarnings) && (
        <div className="px-4 py-2 border-t border-app-border-primary bg-app-bg-secondary text-xs text-app-text-secondary">
          Click on an item to navigate to the configuration
        </div>
      )}
    </div>
  );
}

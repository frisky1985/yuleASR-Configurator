import { yuleasrAdapter } from '@yuletech/core';
import type { ModuleConfig } from '@yuletech/core';
import { Upload, FileCode, AlertCircle, Check, X } from 'lucide-react';
import { useState, useRef } from 'react';

import { cn } from '@/lib/utils';

interface YuleasrImportDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (modules: ModuleConfig[]) => void;
}

export function YuleasrImportDialog({ isOpen, onClose, onImport }: YuleasrImportDialogProps) {
  const [fileContent, setFileContent] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string>('');
  const [fileType, setFileType] = useState<'json' | 'arxml' | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [_isLoading, setIsLoading] = useState(false);
  const [validationResult, setValidationResult] = useState<{
    valid: boolean;
    errors: string[];
  } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);
    setValidationResult(null);
    setIsLoading(true);

    try {
      const content = await file.text();
      setFileName(file.name);
      setFileContent(content);

      // 检测文件类型
      const isArxml = file.name.toLowerCase().endsWith('.arxml');
      setFileType(isArxml ? 'arxml' : 'json');

      // 验证配置
      let result: { valid: boolean; errors: string[] };
      if (isArxml) {
        result = yuleasrAdapter.validateArxmlConfig(content);
      } else {
        result = yuleasrAdapter.validateYuleasrConfig(content);
      }
      setValidationResult(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : '读取文件失败');
    } finally {
      setIsLoading(false);
    }
  };

  const handleImport = () => {
    if (!fileContent || !fileType) return;

    try {
      let modules: ModuleConfig[];
      if (fileType === 'arxml') {
        modules = yuleasrAdapter.importFromArxml(fileContent);
      } else {
        modules = yuleasrAdapter.importFromYuleasr(fileContent);
      }
      onImport(modules);
      handleClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : '导入失败');
    }
  };

  const handleClose = () => {
    setFileContent(null);
    setFileName('');
    setFileType(null);
    setError(null);
    setValidationResult(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-app-bg-primary rounded-xl shadow-xl w-full max-w-lg mx-4">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-app-border-primary">
          <h2 className="text-lg font-semibold text-app-text-primary">导入 yuleASR 配置</h2>
          <button
            onClick={handleClose}
            className="text-app-text-tertiary hover:text-app-text-secondary transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {/* File Upload */}
          <div
            onClick={() => fileInputRef.current?.click()}
            className={cn(
              'border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors',
              'hover:border-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/30',
              fileContent ? 'border-green-400 bg-green-50 dark:bg-green-950/40 dark:border-green-700' : 'border-app-border-primary'
            )}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".json,.arxml"
              onChange={handleFileSelect}
              className="hidden"
            />

            {fileContent ? (
              <div className="flex flex-col items-center gap-2">
                <Check className="w-8 h-8 text-green-500" />
                <span className="text-sm font-medium text-green-700">{fileName}</span>
                <span className="text-xs text-green-600">
                  {fileType === 'arxml' ? 'ARXML 格式' : 'JSON 格式'} 已加载
                </span>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2">
                <Upload className="w-8 h-8 text-app-text-tertiary" />
                <span className="text-sm font-medium text-app-text-primary">点击选择配置文件</span>
                <span className="text-xs text-app-text-secondary">支持 JSON 和 ARXML 格式</span>
              </div>
            )}
          </div>

          {/* Validation Result */}
          {validationResult && (
            <div
              className={cn(
                'p-4 rounded-lg border',
                validationResult.valid ? 'bg-green-50 border-green-200 dark:bg-green-950/40 dark:border-green-800/60' : 'bg-red-50 border-red-200 dark:bg-red-950/40 dark:border-red-800/60'
              )}
            >
              <div className="flex items-center gap-2">
                {validationResult.valid ? (
                  <Check className="w-5 h-5 text-green-500" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-red-500" />
                )}
                <span
                  className={cn(
                    'font-medium',
                    validationResult.valid ? 'text-green-700' : 'text-red-700'
                  )}
                >
                  {validationResult.valid ? '配置验证通过' : '配置验证失败'}
                </span>
              </div>

              {!validationResult.valid && validationResult.errors.length > 0 && (
                <ul className="mt-2 text-sm text-red-600 list-disc list-inside">
                  {validationResult.errors.map((err, i) => (
                    <li key={i}>{err}</li>
                  ))}
                </ul>
              )}
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg dark:bg-red-950/40 dark:border-red-800/60">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-red-500" />
                <span className="font-medium text-red-700">错误</span>
              </div>
              <p className="mt-1 text-sm text-red-600">{error}</p>
            </div>
          )}

          {/* Info */}
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg dark:bg-blue-950/40 dark:border-blue-800/60">
            <div className="flex items-start gap-3">
              <FileCode className="w-5 h-5 text-blue-500 mt-0.5" />
              <div>
                <p className="font-medium text-blue-900">支持的配置格式</p>
                <p className="text-sm text-blue-700 mt-1">
                  <strong>JSON:</strong> yuleASR 项目的 bsw_config.json 配置文件
                  <br />
                  <strong>ARXML:</strong> AutoSAR 标准配置文件 (ECUC 模块配置)
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 px-6 py-4 border-t border-app-border-primary">
          <button
            onClick={handleClose}
            className="px-4 py-2 text-app-text-primary hover:text-app-text-primary font-medium"
          >
            取消
          </button>
          <button
            onClick={handleImport}
            disabled={!fileContent || !validationResult?.valid}
            className="px-4 py-2 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            导入配置
          </button>
        </div>
      </div>
    </div>
  );
}

export default YuleasrImportDialog;

import { useState } from 'react'
import { 
  ChevronDown, 
  ChevronRight, 
  FilePlus, 
  FileMinus, 
  FileEdit,
  GitCompare,
  Copy,
  Check,
  Maximize2,
  Minimize2,
  Download,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import type { DiffInfo, DiffHunk } from '@/services/gitService'

interface DiffViewerProps {
  diffs: DiffInfo[]
  oldCommit?: { oid: string; message: string }
  newCommit?: { oid: string; message: string }
  onClose?: () => void
  title?: string
}

export function DiffViewer({ 
  diffs, 
  oldCommit, 
  newCommit, 
  onClose,
  title = 'Changes',
}: DiffViewerProps) {
  const [expandedFiles, setExpandedFiles] = useState<Set<string>>(
    new Set(diffs.map(d => d.newPath))
  )
  const [copiedFile, setCopiedFile] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<'split' | 'unified'>('unified')
  const [showFullScreen, setShowFullScreen] = useState(false)

  const toggleFile = (path: string) => {
    setExpandedFiles(prev => {
      const next = new Set(prev)
      if (next.has(path)) {
        next.delete(path)
      } else {
        next.add(path)
      }
      return next
    })
  }

  const expandAll = () => {
    setExpandedFiles(new Set(diffs.map(d => d.newPath)))
  }

  const collapseAll = () => {
    setExpandedFiles(new Set())
  }

  const copyToClipboard = async (content: string, path: string) => {
    try {
      await navigator.clipboard.writeText(content)
      setCopiedFile(path)
      setTimeout(() => setCopiedFile(null), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  const downloadDiff = () => {
    let content = ''
    for (const diff of diffs) {
      content += `--- a/${diff.oldPath}\n`
      content += `+++ b/${diff.newPath}\n`
      content += `@@ ... @@\n`
      if (diff.oldContent) content += diff.oldContent + '\n'
      if (diff.newContent) content += diff.newContent + '\n'
      content += '\n'
    }

    const blob = new Blob([content], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `diff-${oldCommit?.oid.substring(0, 7)}-${newCommit?.oid.substring(0, 7)}.patch`
    a.click()
    URL.revokeObjectURL(url)
  }

  const getFileIcon = (status: DiffInfo['status']) => {
    switch (status) {
      case 'added':
        return <FilePlus className="w-4 h-4 text-green-500" />
      case 'deleted':
        return <FileMinus className="w-4 h-4 text-red-500" />
      case 'modified':
        return <FileEdit className="w-4 h-4 text-yellow-500" />
      case 'renamed':
        return <GitCompare className="w-4 h-4 text-blue-500" />
      default:
        return <FileEdit className="w-4 h-4 text-gray-500" />
    }
  }

  const getStatusBadge = (status: DiffInfo['status']) => {
    const styles: Record<DiffInfo['status'], string> = {
      added: 'bg-green-100 text-green-700',
      deleted: 'bg-red-100 text-red-700',
      modified: 'bg-yellow-100 text-yellow-700',
      renamed: 'bg-blue-100 text-blue-700',
    }

    return (
      <span className={cn('px-1.5 py-0.5 text-xs font-medium rounded', styles[status])}>
        {status}
      </span>
    )
  }

  const calculateDiffStats = (diff: DiffInfo) => {
    let additions = 0
    let deletions = 0

    for (const hunk of diff.hunks) {
      for (const line of hunk.lines) {
        if (line.type === 'added') additions++
        if (line.type === 'removed') deletions++
      }
    }

    // Fallback: count lines in content
    if (additions === 0 && deletions === 0) {
      if (diff.newContent) additions = diff.newContent.split('\n').length
      if (diff.oldContent) deletions = diff.oldContent.split('\n').length
    }

    return { additions, deletions }
  }

  const totalStats = diffs.reduce(
    (acc, diff) => {
      const stats = calculateDiffStats(diff)
      return {
        additions: acc.additions + stats.additions,
        deletions: acc.deletions + stats.deletions,
      }
    },
    { additions: 0, deletions: 0 }
  )

  return (
    <div className={cn(
      'bg-white border border-gray-200 rounded-lg overflow-hidden',
      showFullScreen && 'fixed inset-4 z-50'
    )}>
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <GitCompare className="w-5 h-5 text-gray-500" />
            <h3 className="font-semibold text-gray-900">{title}</h3>
            {(oldCommit || newCommit) && (
              <div className="flex items-center gap-2 text-xs text-gray-500">
                {oldCommit && (
                  <span className="font-mono bg-gray-100 px-1.5 py-0.5 rounded">
                    {oldCommit.oid.substring(0, 7)}
                  </span>
                )}
                <span>→</span>
                {newCommit && (
                  <span className="font-mono bg-primary-100 text-primary-700 px-1.5 py-0.5 rounded">
                    {newCommit.oid.substring(0, 7)}
                  </span>
                )}
              </div>
            )}
          </div>
          <div className="flex items-center gap-2">
            {/* Stats */}
            <div className="flex items-center gap-2 text-xs mr-4">
              <span className="text-green-600 font-medium">+{totalStats.additions}</span>
              <span className="text-red-600 font-medium">-{totalStats.deletions}</span>
            </div>

            {/* View Mode Toggle */}
            <div className="flex items-center bg-white rounded border border-gray-300">
              <button
                onClick={() => setViewMode('unified')}
                className={cn(
                  'px-2 py-1 text-xs font-medium transition-colors',
                  viewMode === 'unified' 
                    ? 'bg-primary-100 text-primary-700' 
                    : 'text-gray-600 hover:text-gray-900'
                )}
              >
                Unified
              </button>
              <button
                onClick={() => setViewMode('split')}
                className={cn(
                  'px-2 py-1 text-xs font-medium transition-colors',
                  viewMode === 'split' 
                    ? 'bg-primary-100 text-primary-700' 
                    : 'text-gray-600 hover:text-gray-900'
                )}
              >
                Split
              </button>
            </div>

            {/* Actions */}
            <button
              onClick={expandAll}
              className="text-xs text-gray-600 hover:text-gray-900 px-2 py-1"
            >
              Expand All
            </button>
            <button
              onClick={collapseAll}
              className="text-xs text-gray-600 hover:text-gray-900 px-2 py-1"
            >
              Collapse All
            </button>
            <button
              onClick={downloadDiff}
              className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-200 rounded"
              title="Download patch"
            >
              <Download className="w-4 h-4" />
            </button>
            <button
              onClick={() => setShowFullScreen(!showFullScreen)}
              className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-200 rounded"
            >
              {showFullScreen ? (
                <Minimize2 className="w-4 h-4" />
              ) : (
                <Maximize2 className="w-4 h-4" />
              )}
            </button>
            {onClose && (
              <button
                onClick={onClose}
                className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-200 rounded"
              >
                ×
              </button>
            )}
          </div>
        </div>
      </div>

      {/* File List */}
      <div className={cn('overflow-auto', showFullScreen ? 'h-[calc(100vh-200px)]' : 'max-h-[600px]')}>
        {diffs.length === 0 ? (
          <div className="p-8 text-center">
            <GitCompare className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No changes to display</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {diffs.map((diff) => {
              const isExpanded = expandedFiles.has(diff.newPath)
              const stats = calculateDiffStats(diff)

              return (
                <div key={diff.newPath} className="bg-white">
                  {/* File Header */}
                  <button
                    onClick={() => toggleFile(diff.newPath)}
                    className="w-full flex items-center gap-3 px-4 py-2 hover:bg-gray-50 transition-colors text-left"
                  >
                    {isExpanded ? (
                      <ChevronDown className="w-4 h-4 text-gray-400" />
                    ) : (
                      <ChevronRight className="w-4 h-4 text-gray-400" />
                    )}
                    {getFileIcon(diff.status)}
                    <span className="flex-1 text-sm font-medium text-gray-900 truncate">
                      {diff.newPath}
                    </span>
                    {getStatusBadge(diff.status)}
                    <div className="flex items-center gap-2 text-xs">
                      <span className="text-green-600">+{stats.additions}</span>
                      <span className="text-red-600">-{stats.deletions}</span>
                    </div>
                  </button>

                  {/* Diff Content */}
                  {isExpanded && (
                    <div className="border-t border-gray-100">
                      {/* File Actions */}
                      <div className="flex items-center gap-2 px-4 py-1.5 bg-gray-50 border-b border-gray-200">
                        <button
                          onClick={() => diff.newContent && copyToClipboard(diff.newContent, diff.newPath)}
                          className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700"
                        >
                          {copiedFile === diff.newPath ? (
                            <>
                              <Check className="w-3 h-3" />
                              Copied
                            </>
                          ) : (
                            <>
                              <Copy className="w-3 h-3" />
                              Copy
                            </>
                          )}
                        </button>
                      </div>

                      {/* Diff View */}
                      {viewMode === 'unified' ? (
                        <UnifiedDiffView 
                          diff={diff} 
                          hunks={diff.hunks}
                          oldContent={diff.oldContent}
                          newContent={diff.newContent}
                        />
                      ) : (
                        <SplitDiffView 
                          diff={diff}
                          hunks={diff.hunks}
                          oldContent={diff.oldContent}
                          newContent={diff.newContent}
                        />
                      )}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

interface UnifiedDiffViewProps {
  diff: DiffInfo
  hunks: DiffHunk[]
  oldContent?: string
  newContent?: string
}

function UnifiedDiffView({ hunks, oldContent, newContent }: UnifiedDiffViewProps) {
  // If no hunks, generate simple line-by-line diff
  if (hunks.length === 0 && oldContent !== undefined && newContent !== undefined) {
    const oldLines = oldContent.split('\n')
    const newLines = newContent.split('\n')
    
    return (
      <div className="overflow-x-auto">
        <table className="w-full text-sm font-mono">
          <tbody>
            {oldLines.map((line, i) => (
              <tr key={`old-${i}`} className="bg-red-50">
                <td className="px-2 py-0.5 text-gray-400 text-right select-none w-12">{i + 1}</td>
                <td className="px-2 py-0.5 text-gray-400 select-none w-12"></td>
                <td className="px-4 py-0.5 whitespace-pre text-red-700">-{line}</td>
              </tr>
            ))}
            {newLines.map((line, i) => (
              <tr key={`new-${i}`} className="bg-green-50">
                <td className="px-2 py-0.5 text-gray-400 text-right select-none w-12"></td>
                <td className="px-2 py-0.5 text-gray-400 select-none w-12">{i + 1}</td>
                <td className="px-4 py-0.5 whitespace-pre text-green-700">+{line}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      {hunks.map((hunk, hunkIndex) => (
        <table key={hunkIndex} className="w-full text-sm font-mono">
          <thead>
            <tr className="bg-gray-100">
              <td colSpan={3} className="px-4 py-1 text-xs text-gray-500">
                @@ -{hunk.oldStart},{hunk.oldLines} +{hunk.newStart},{hunk.newLines} @@
              </td>
            </tr>
          </thead>
          <tbody>
            {hunk.lines.map((line: { type: string; content: string }, lineIndex: number) => {
              const lineBg = 
                line.type === 'added' ? 'bg-green-50' :
                line.type === 'removed' ? 'bg-red-50' : 'bg-white'
              
              const lineColor =
                line.type === 'added' ? 'text-green-700' :
                line.type === 'removed' ? 'text-red-700' : 'text-gray-700'

              const prefix =
                line.type === 'added' ? '+' :
                line.type === 'removed' ? '-' : ' '

              return (
                <tr key={lineIndex} className={lineBg}>
                  <td className="px-2 py-0.5 text-gray-400 text-right select-none w-12">
                    {line.type !== 'added' ? hunk.oldStart + lineIndex : ''}
                  </td>
                  <td className="px-2 py-0.5 text-gray-400 text-right select-none w-12">
                    {line.type !== 'removed' ? hunk.newStart + lineIndex : ''}
                  </td>
                  <td className={cn('px-4 py-0.5 whitespace-pre', lineColor)}>
                    {prefix}{line.content}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      ))}
    </div>
  )
}

interface SplitDiffViewProps {
  diff: DiffInfo
  hunks: DiffHunk[]
  oldContent?: string
  newContent?: string
}

function SplitDiffView({ oldContent, newContent }: SplitDiffViewProps) {
  const oldLines = oldContent?.split('\n') ?? []
  const newLines = newContent?.split('\n') ?? []
  const maxLines = Math.max(oldLines.length, newLines.length)

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm font-mono">
        <thead>
          <tr className="bg-gray-100">
            <th className="px-4 py-1 text-xs text-gray-500 text-left w-1/2">Old</th>
            <th className="px-4 py-1 text-xs text-gray-500 text-left w-1/2">New</th>
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: maxLines }, (_, i) => {
            const oldLine = oldLines[i]
            const newLine = newLines[i]
            const isChanged = oldLine !== newLine

            return (
              <tr key={i} className={isChanged ? 'bg-yellow-50' : 'bg-white'}>
                <td className={cn(
                  'px-4 py-0.5 whitespace-pre border-r border-gray-200',
                  isChanged ? 'text-red-700' : 'text-gray-700'
                )}>
                  {oldLine ?? ''}
                </td>
                <td className={cn(
                  'px-4 py-0.5 whitespace-pre',
                  isChanged ? 'text-green-700' : 'text-gray-700'
                )}>
                  {newLine ?? ''}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

export default DiffViewer

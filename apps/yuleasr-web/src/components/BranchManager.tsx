import { useState, useCallback } from 'react'
import { 
  GitBranch, 
  Plus, 
  Trash2, 
  ArrowRightLeft,
  Check,
  X,
  AlertCircle,
  RefreshCw,
  GitMerge,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import type { BranchInfo } from '@/services/gitService'

interface BranchManagerProps {
  branches: BranchInfo[]
  currentBranch: string
  onCreateBranch: (name: string, checkout: boolean) => Promise<void>
  onDeleteBranch: (name: string) => Promise<void>
  onSwitchBranch: (name: string) => Promise<void>
  onMergeBranch?: (source: string, target: string) => Promise<void>
  onRefresh: () => void
  isLoading?: boolean
}

export function BranchManager({
  branches,
  currentBranch,
  onCreateBranch,
  onDeleteBranch,
  onSwitchBranch,
  onMergeBranch,
  onRefresh,
  isLoading,
}: BranchManagerProps) {
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [newBranchName, setNewBranchName] = useState('')
  const [checkoutAfterCreate, setCheckoutAfterCreate] = useState(true)
  const [isCreating, setIsCreating] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState<string | null>(null)
  const [isSwitching, setIsSwitching] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [mergeSource, setMergeSource] = useState<string | null>(null)

  const handleCreateBranch = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newBranchName.trim()) return

    setIsCreating(true)
    setError(null)

    try {
      await onCreateBranch(newBranchName.trim(), checkoutAfterCreate)
      setNewBranchName('')
      setShowCreateForm(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create branch')
    } finally {
      setIsCreating(false)
    }
  }

  const handleDeleteBranch = async (name: string) => {
    if (deleteConfirm !== name) {
      setDeleteConfirm(name)
      return
    }

    setIsDeleting(name)
    setError(null)

    try {
      await onDeleteBranch(name)
      setDeleteConfirm(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete branch')
    } finally {
      setIsDeleting(null)
    }
  }

  const handleSwitchBranch = async (name: string) => {
    if (name === currentBranch) return

    setIsSwitching(name)
    setError(null)

    try {
      await onSwitchBranch(name)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to switch branch')
    } finally {
      setIsSwitching(null)
    }
  }

  const handleMerge = async (target: string) => {
    if (!mergeSource || !onMergeBranch) return

    setIsSwitching(target)
    setError(null)

    try {
      await onMergeBranch(mergeSource, target)
      setMergeSource(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to merge branch')
    } finally {
      setIsSwitching(null)
    }
  }

  const cancelDelete = useCallback(() => {
    setDeleteConfirm(null)
  }, [])

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
            <GitBranch className="w-4 h-4" />
            Branches
          </h3>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowCreateForm(!showCreateForm)}
              className="flex items-center gap-1 text-xs text-primary-600 hover:text-primary-700 font-medium"
            >
              <Plus className="w-3.5 h-3.5" />
              New
            </button>
            <button
              onClick={onRefresh}
              disabled={isLoading}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <RefreshCw className={cn('w-4 h-4', isLoading && 'animate-spin')} />
            </button>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mt-3 p-2 bg-red-50 border border-red-200 rounded text-xs text-red-700 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
            <button
              onClick={() => setError(null)}
              className="ml-auto text-red-500 hover:text-red-700"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        )}

        {/* Create Branch Form */}
        {showCreateForm && (
          <form onSubmit={handleCreateBranch} className="mt-3 space-y-3">
            <div>
              <input
                type="text"
                placeholder="Branch name"
                value={newBranchName}
                onChange={(e) => setNewBranchName(e.target.value)}
                className="w-full px-3 py-1.5 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-primary-500"
                autoFocus
              />
            </div>
            <label className="flex items-center gap-2 text-xs text-gray-600">
              <input
                type="checkbox"
                checked={checkoutAfterCreate}
                onChange={(e) => setCheckoutAfterCreate(e.target.checked)}
                className="rounded text-primary-600 focus:ring-primary-500"
              />
              Checkout after create
            </label>
            <div className="flex gap-2">
              <button
                type="submit"
                disabled={!newBranchName.trim() || isCreating}
                className="flex-1 px-3 py-1.5 text-xs font-medium bg-primary-600 text-white rounded hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isCreating ? 'Creating...' : 'Create'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowCreateForm(false)
                  setNewBranchName('')
                  setError(null)
                }}
                className="px-3 py-1.5 text-xs font-medium text-gray-600 hover:text-gray-900 border border-gray-300 rounded"
              >
                Cancel
              </button>
            </div>
          </form>
        )}

        {/* Merge Mode */}
        {mergeSource && (
          <div className="mt-3 p-2 bg-blue-50 border border-blue-200 rounded text-xs">
            <p className="text-blue-700 mb-2">
              Select target branch to merge <strong>{mergeSource}</strong> into
            </p>
            <button
              onClick={() => setMergeSource(null)}
              className="text-blue-600 hover:text-blue-800 font-medium"
            >
              Cancel Merge
            </button>
          </div>
        )}
      </div>

      {/* Branch List */}
      <div className="max-h-[300px] overflow-y-auto">
        {branches.length === 0 ? (
          <div className="p-6 text-center">
            <GitBranch className="w-8 h-8 text-gray-300 mx-auto mb-2" />
            <p className="text-gray-500 text-sm">No branches found</p>
          </div>
        ) : (
          <ul className="divide-y divide-gray-100">
            {branches.map((branch) => {
              const isCurrent = branch.name === currentBranch
              const isConfirmingDelete = deleteConfirm === branch.name
              const isDeletingThis = isDeleting === branch.name
              const isSwitchingThis = isSwitching === branch.name

              return (
                <li
                  key={branch.name}
                  className={cn(
                    'px-4 py-3 transition-colors',
                    isCurrent && 'bg-primary-50',
                    mergeSource === branch.name && 'bg-blue-50'
                  )}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 min-w-0">
                      <GitBranch className={cn(
                        'w-4 h-4 flex-shrink-0',
                        isCurrent ? 'text-primary-600' : 'text-gray-400'
                      )} />
                      <div className="min-w-0">
                        <p className={cn(
                          'text-sm font-medium truncate',
                          isCurrent ? 'text-primary-900' : 'text-gray-900'
                        )}>
                          {branch.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {branch.commit.substring(0, 7)}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 ml-2">
                      {isCurrent ? (
                        <span className="px-2 py-0.5 text-xs font-medium text-primary-700 bg-primary-100 rounded">
                          current
                        </span>
                      ) : mergeSource && mergeSource !== branch.name ? (
                        <button
                          onClick={() => handleMerge(branch.name)}
                          disabled={isSwitchingThis}
                          className="flex items-center gap-1 px-2 py-1 text-xs text-blue-600 hover:bg-blue-100 rounded"
                        >
                          <GitMerge className="w-3 h-3" />
                          {isSwitchingThis ? '...' : 'Merge'}
                        </button>
                      ) : (
                        <>
                          {/* Switch Button */}
                          {!isConfirmingDelete && (
                            <button
                              onClick={() => handleSwitchBranch(branch.name)}
                              disabled={isSwitchingThis !== null}
                              className="p-1.5 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded transition-colors"
                              title="Switch to branch"
                            >
                              {isSwitchingThis ? (
                                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                              ) : (
                                <ArrowRightLeft className="w-3.5 h-3.5" />
                              )}
                            </button>
                          )}

                          {/* Merge Button */}
                          {onMergeBranch && !isConfirmingDelete && (
                            <button
                              onClick={() => setMergeSource(branch.name)}
                              className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                              title="Merge this branch"
                            >
                              <GitMerge className="w-3.5 h-3.5" />
                            </button>
                          )}

                          {/* Delete Button */}
                          {isConfirmingDelete ? (
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => handleDeleteBranch(branch.name)}
                                disabled={isDeletingThis !== null}
                                className="p-1.5 text-red-600 hover:bg-red-50 rounded"
                              >
                                {isDeletingThis ? (
                                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                                ) : (
                                  <Check className="w-3.5 h-3.5" />
                                )}
                              </button>
                              <button
                                onClick={cancelDelete}
                                className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => handleDeleteBranch(branch.name)}
                              className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                              title="Delete branch"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </>
                      )}
                    </div>
                  </div>

                  {/* Delete Confirmation Text */}
                  {isConfirmingDelete && (
                    <p className="mt-2 text-xs text-red-600">
                      Are you sure? This cannot be undone.
                    </p>
                  )}
                </li>
              )
            })}
          </ul>
        )}
      </div>

      {/* Footer Stats */}
      <div className="px-4 py-2 border-t border-gray-200 bg-gray-50 text-xs text-gray-500">
        {branches.length} branch{branches.length !== 1 ? 'es' : ''}
      </div>
    </div>
  )
}

export default BranchManager

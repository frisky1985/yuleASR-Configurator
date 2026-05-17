/**
 * Virtual List Component
 * Efficiently render large lists by only rendering visible items
 */

import { useRef, useState, useEffect, useCallback, useMemo } from 'react'
import { cn } from '@/lib/utils'

interface VirtualListProps<T> {
  items: T[]
  itemHeight: number
  renderItem: (item: T, index: number) => React.ReactNode
  className?: string
  overscan?: number
  onScrollEnd?: () => void
}

export function VirtualList<T>({
  items,
  itemHeight,
  renderItem,
  className,
  overscan = 5,
  onScrollEnd,
}: VirtualListProps<T>) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [scrollTop, setScrollTop] = useState(0)
  const [containerHeight, setContainerHeight] = useState(0)

  // Calculate visible range
  const { virtualItems, totalHeight, startIndex, endIndex } = useMemo(() => {
    const start = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan)
    const visibleCount = Math.ceil(containerHeight / itemHeight)
    const end = Math.min(items.length, start + visibleCount + overscan * 2)
    
    const virtualItems = items.slice(start, end).map((item, index) => ({
      item,
      index: start + index,
      style: {
        position: 'absolute' as const,
        top: (start + index) * itemHeight,
        height: itemHeight,
        left: 0,
        right: 0,
      },
    }))

    return {
      virtualItems,
      totalHeight: items.length * itemHeight,
      startIndex: start,
      endIndex: end,
    }
  }, [items, itemHeight, scrollTop, containerHeight, overscan])

  // Handle scroll
  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    const newScrollTop = e.currentTarget.scrollTop
    setScrollTop(newScrollTop)

    // Check if near end
    if (onScrollEnd) {
      const scrollHeight = e.currentTarget.scrollHeight
      const clientHeight = e.currentTarget.clientHeight
      if (newScrollTop + clientHeight >= scrollHeight - itemHeight * 3) {
        onScrollEnd()
      }
    }
  }, [itemHeight, onScrollEnd])

  // Update container height on mount and resize
  useEffect(() => {
    const updateHeight = () => {
      if (containerRef.current) {
        setContainerHeight(containerRef.current.clientHeight)
      }
    }

    updateHeight()
    window.addEventListener('resize', updateHeight)
    return () => window.removeEventListener('resize', updateHeight)
  }, [])

  return (
    <div
      ref={containerRef}
      onScroll={handleScroll}
      className={cn('overflow-auto', className)}
      style={{ position: 'relative' }}
    >
      <div style={{ height: totalHeight, position: 'relative' }}>
        {virtualItems.map(({ item, index, style }) => (
          <div key={index} style={style}>
            {renderItem(item, index)}
          </div>
        ))}
      </div>
    </div>
  )
}

// Memoized item component for better performance
interface VirtualItemProps {
  children: React.ReactNode
  style: React.CSSProperties
}

export const VirtualItem = ({ children, style }: VirtualItemProps) => {
  return <div style={style}>{children}</div>
}

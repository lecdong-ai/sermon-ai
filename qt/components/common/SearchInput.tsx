'use client'

import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { useCallback, useRef, useState } from 'react'
import { Search, X } from 'lucide-react'
import { cn } from '@/lib/utils/cn'

interface SearchInputProps {
  paramName?: string
  placeholder?: string
  defaultValue?: string
  onSearch?: (value: string) => void
  className?: string
  /** If true, calls router.push on Enter instead of onSearch callback */
  useRouter?: boolean
  basePath?: string
}

export function SearchInput({
  paramName = 'search',
  placeholder = '검색',
  defaultValue = '',
  onSearch,
  className,
  useRouter: useRouterNav = false,
  basePath,
}: SearchInputProps) {
  const nextRouter = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const inputRef = useRef<HTMLInputElement>(null)
  const [value, setValue] = useState(defaultValue)

  const buildHref = useCallback(
    (term: string) => {
      const params = new URLSearchParams(searchParams.toString())
      if (term) {
        params.set(paramName, term)
      } else {
        params.delete(paramName)
      }
      params.delete('page')
      const qs = params.toString()
      return qs ? `${basePath ?? pathname}?${qs}` : basePath ?? pathname
    },
    [paramName, pathname, searchParams, basePath]
  )

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      const term = value.trim()
      if (useRouterNav) {
        nextRouter.push(buildHref(term))
      } else {
        onSearch?.(term)
      }
    }
  }

  const handleClear = () => {
    setValue('')
    inputRef.current?.focus()
    if (useRouterNav) {
      nextRouter.push(buildHref(''))
    } else {
      onSearch?.('')
    }
  }

  return (
    <div className={cn('relative', className)}>
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground-subtle pointer-events-none" />
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        aria-label={placeholder}
        className="w-full h-11 pl-10 pr-10 rounded-lg border border-border bg-surface text-sm text-foreground placeholder:text-foreground-subtle focus:outline-none focus:ring-1 focus:ring-ring transition-colors"
      />
      {value && (
        <button
          onClick={handleClear}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-foreground-subtle hover:text-foreground transition-colors"
          aria-label="검색 초기화"
          type="button"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  )
}

'use client'

import Link from 'next/link'
import { Container } from '@/components/layout/Container'
import { Button } from '@/components/ui/button'

export default function Error({
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <Container className="min-h-[60vh] flex flex-col items-center justify-center text-center space-y-4">
      <p className="font-serif text-display text-foreground">
        예기치 못한 오류가 발생했습니다
      </p>
      <p className="text-body text-foreground-muted max-w-xs">
        잠시 후 다시 시도해 주세요.
      </p>
      <div className="flex items-center gap-3">
        <Button onClick={reset}>다시 시도</Button>
        <Button variant="outline" asChild>
          <Link href="/">홈으로</Link>
        </Button>
      </div>
    </Container>
  )
}

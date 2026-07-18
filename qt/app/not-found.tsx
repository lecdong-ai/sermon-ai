import Link from 'next/link'
import { Container } from '@/components/layout/Container'
import { Button } from '@/components/ui/button'

export default function NotFound() {
  return (
    <Container className="min-h-[60vh] flex flex-col items-center justify-center text-center space-y-4">
      <p className="font-serif text-display text-foreground">찾을 수 없습니다</p>
      <p className="text-body text-foreground-muted max-w-xs">
        페이지가 없거나 다른 곳으로 이동했습니다.
      </p>
      <Button asChild>
        <Link href="/">홈으로</Link>
      </Button>
    </Container>
  )
}

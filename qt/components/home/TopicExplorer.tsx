import Link from 'next/link'
import { Container } from '@/components/layout/Container'
import { SectionHeader } from '@/components/common/SectionHeader'

const topics = [
  {
    slug: '대림',
    name: '대림',
    description: '기다림의 절기, 그리스도의 오심을 준비합니다.',
    href: '/qt?season=%EB%8C%80%EB%A6%BC',
  },
  {
    slug: '사순',
    name: '사순',
    description: '침묵과 회개의 시간, 말씀과 함께 걷는 40일.',
    href: '/qt?season=%EC%82%AC%EC%88%9C',
  },
  {
    slug: '부활',
    name: '부활',
    description: '부활의 기쁨, 새 생명을 묵상하는 절기.',
    href: '/qt?season=%EB%B6%80%ED%99%9C',
  },
  {
    slug: '연중',
    name: '연중',
    description: '일상이 예배가 되는 시간, 연중 묵상.',
    href: '/qt?season=%EC%97%B0%EC%A4%91',
  },
  {
    slug: '시편',
    name: '시편',
    description: '시편과 함께 걷는 묵상의 시간.',
    href: '/qt?search=%EC%8B%9C%ED%8E%B8',
  },
]

export function TopicExplorer() {
  return (
    <section className="py-section-y">
      <Container>
        <SectionHeader title="주제별 탐색" />
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
          {topics.map((topic) => (
            <Link
              key={topic.slug}
              href={topic.href}
              className="group p-5 sm:p-6 rounded-xl bg-surface border border-border/50 hover:border-accent/30 hover:bg-accent-soft transition-all text-center space-y-2"
            >
              <p className="font-serif text-h2 text-foreground group-hover:text-accent transition-colors">
                {topic.name}
              </p>
              <p className="text-meta text-foreground-subtle leading-relaxed">
                {topic.description}
              </p>
            </Link>
          ))}
        </div>
      </Container>
    </section>
  )
}

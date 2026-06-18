import dynamic from 'next/dynamic'

const AdvancedLayoutClient = dynamic(() => import('./layout.client'), { ssr: false })

export default function AdvancedLayout({ children }: { children: React.ReactNode }) {
  return <AdvancedLayoutClient>{children}</AdvancedLayoutClient>
}

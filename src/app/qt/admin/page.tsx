import { Container } from '@/components/layout/Container'
import { AdminGate } from '@/components/admin/AdminGate'
import AdminUploadPage from './AdminUploadPage'

export default function AdminPage() {
  return (
    <Container className="py-10 sm:py-14">
      <AdminGate>
        <AdminUploadPage />
      </AdminGate>
    </Container>
  )
}

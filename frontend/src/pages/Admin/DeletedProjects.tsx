import {
  fetchAdminDeletedProjects,
  purgeAdminDeletedProject,
  restoreAdminDeletedProject,
} from '../../api/adminDeleted'
import { AdminDeletedListPage } from '../../components/AdminDeletedListPage'

export function AdminDeletedProjectsPage() {
  return (
    <AdminDeletedListPage
      kind="project"
      title="已删项目"
      description="作者删除后对作者不可见。此处供管理员恢复或提前彻底清除；到期也会自动彻底清除。"
      fetchList={fetchAdminDeletedProjects}
      restoreItem={restoreAdminDeletedProject}
      purgeItem={purgeAdminDeletedProject}
    />
  )
}

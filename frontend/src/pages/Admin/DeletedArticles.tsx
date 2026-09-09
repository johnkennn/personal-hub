import {
  fetchAdminDeletedArticles,
  purgeAdminDeletedArticle,
  restoreAdminDeletedArticle,
} from '../../api/adminDeleted'
import { AdminDeletedListPage } from '../../components/AdminDeletedListPage'

export function AdminDeletedArticlesPage() {
  return (
    <AdminDeletedListPage
      kind="article"
      title="已删文章"
      description="作者删除后对作者不可见。此处供管理员恢复或提前彻底清除；到期也会自动彻底清除。"
      fetchList={fetchAdminDeletedArticles}
      restoreItem={restoreAdminDeletedArticle}
      purgeItem={purgeAdminDeletedArticle}
    />
  )
}

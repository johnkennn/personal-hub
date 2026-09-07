# 小铃铛通知扩展（可贴代码）

目标通知：

| 事件 | 接收者 | type |
|------|--------|------|
| 点赞 | 内容作者 | `LIKE`（已有） |
| 评论 | 内容作者 | `COMMENT`（已有） |
| 关注 | 被关注者 | `FOLLOW`（已有方法，需接线 + 取消列表过滤） |
| 管理员下架文章/项目 | 作者 | `UNPUBLISH`（新增） |
| 用户提交建议 | 所有 ADMIN | `SUGGESTION`（新增） |

---

## 1) Flyway `V4__notification_types.sql`

路径：`backend/src/main/resources/db/migration/V4__notification_types.sql`

```sql
-- 扩展通知类型：管理员下架、建议箱
ALTER TABLE notifications
    MODIFY COLUMN type ENUM(
        'LIKE',
        'COMMENT',
        'FOLLOW',
        'UNPUBLISH',
        'SUGGESTION'
    ) NOT NULL;
```

---

## 2) `NotificationType.java`

路径：`backend/src/main/java/com/zzh/personal_hub/notification/NotificationType.java`

```java
package com.zzh.personal_hub.notification;

public enum NotificationType {
    LIKE,
    COMMENT,
    FOLLOW,
    /** 管理员强制下架文章/项目 */
    UNPUBLISH,
    /** 用户提交建议 → 通知管理员 */
    SUGGESTION
}
```

---

## 3) `UserRepository.java` 增加按角色查询

在 `UserRepository` 中增加：

```java
List<User> findByRole(UserRole role);
```

---

## 4) 重写 `NotificationService.java` 关键方法

路径：`backend/src/main/java/com/zzh/personal_hub/notification/service/NotificationService.java`

要点：

- `listMine` / `unreadCount`：**不要再排除 FOLLOW**
- 新增 `notifyUnpublishByAdmin`、`notifySuggestionToAdmins`

完整替换该文件可用下面内容：

```java
package com.zzh.personal_hub.notification.service;

import java.time.Instant;
import java.util.List;
import java.util.Objects;

import com.zzh.personal_hub.notification.entity.Notification;
import com.zzh.personal_hub.notification.repository.NotificationRepository;
import com.zzh.personal_hub.notification.NotificationType;
import com.zzh.personal_hub.notification.dto.NotificationResponse;
import com.zzh.personal_hub.user.repository.UserRepository;
import com.zzh.personal_hub.common.security.CurrentUserService;
import com.zzh.personal_hub.user.entity.User;
import com.zzh.personal_hub.user.entity.UserRole;
import com.zzh.personal_hub.common.exception.BusinessException;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;
    private final CurrentUserService currentUserService;

    @Transactional(readOnly = true)
    public List<NotificationResponse> listMine() {
        User me = currentUserService.requireUser();
        return notificationRepository.findByReceiverIdAndReadAtIsNullOrderByCreatedAtDesc(me.getId()).stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public long unreadCount() {
        User me = currentUserService.requireUser();
        return notificationRepository.countByReceiverIdAndReadAtIsNull(me.getId());
    }

    @Transactional
    public void markAllRead() {
        User me = currentUserService.requireUser();
        notificationRepository.markAllRead(me.getId(), Instant.now());
    }

    @Transactional
    public void markRead(Long id) {
        User me = currentUserService.requireUser();
        Notification n = notificationRepository.findById(id)
                .orElseThrow(() -> new BusinessException(404, "通知不存在"));
        if (!Objects.equals(n.getReceiverId(), me.getId())) {
            throw new BusinessException(403, "无权操作");
        }
        if (n.getReadAt() != null) return;
        n.setReadAt(Instant.now());
        notificationRepository.save(n);
    }

    @Transactional
    public void notifyFollow(Long actorId, Long followeeId) {
        if (Objects.equals(actorId, followeeId)) return;
        Notification n = new Notification();
        n.setActorId(actorId);
        n.setReceiverId(followeeId);
        n.setType(NotificationType.FOLLOW);
        n.setCreatedAt(Instant.now());
        notificationRepository.save(n);
    }

    @Transactional
    public void notifyLike(Long actorId, Long receiverId, String targetType, Long targetId) {
        if (Objects.equals(actorId, receiverId)) return;
        Notification n = new Notification();
        n.setActorId(actorId);
        n.setReceiverId(receiverId);
        n.setType(NotificationType.LIKE);
        n.setTargetType(targetType);
        n.setTargetId(targetId);
        n.setCreatedAt(Instant.now());
        notificationRepository.save(n);
    }

    @Transactional
    public void notifyComment(Long actorId, Long receiverId, String targetType, Long targetId) {
        if (Objects.equals(actorId, receiverId)) return;
        Notification n = new Notification();
        n.setActorId(actorId);
        n.setReceiverId(receiverId);
        n.setType(NotificationType.COMMENT);
        n.setTargetType(targetType);
        n.setTargetId(targetId);
        n.setCreatedAt(Instant.now());
        notificationRepository.save(n);
    }

    /**
     * 管理员下架：通知作者。
     * actorId = 操作的管理员；targetType = ARTICLE / PROJECT。
     */
    @Transactional
    public void notifyUnpublishByAdmin(Long adminId, Long authorId, String targetType, Long targetId) {
        if (Objects.equals(adminId, authorId)) return;
        Notification n = new Notification();
        n.setActorId(adminId);
        n.setReceiverId(authorId);
        n.setType(NotificationType.UNPUBLISH);
        n.setTargetType(targetType);
        n.setTargetId(targetId);
        n.setCreatedAt(Instant.now());
        notificationRepository.save(n);
    }

    /** 用户提交建议：通知所有 ADMIN（提交者自己是 ADMIN 时也通知其他管理员；唯一 ADMIN 则跳过自己） */
    @Transactional
    public void notifySuggestionToAdmins(Long actorId, Long suggestionId) {
        List<User> admins = userRepository.findByRole(UserRole.ADMIN);
        Instant now = Instant.now();
        for (User admin : admins) {
            if (Objects.equals(admin.getId(), actorId)) continue;
            Notification n = new Notification();
            n.setActorId(actorId);
            n.setReceiverId(admin.getId());
            n.setType(NotificationType.SUGGESTION);
            n.setTargetType("SUGGESTION");
            n.setTargetId(suggestionId);
            n.setCreatedAt(now);
            notificationRepository.save(n);
        }
    }

    private NotificationResponse toResponse(Notification n) {
        NotificationResponse dto = new NotificationResponse();
        dto.setId(n.getId());
        dto.setActorId(n.getActorId());
        dto.setCreatedAt(n.getCreatedAt());
        dto.setRead(n.getReadAt() != null);
        dto.setType(n.getType());
        dto.setTargetType(n.getTargetType());
        dto.setTargetId(n.getTargetId());

        userRepository.findById(n.getActorId())
                .ifPresentOrElse(
                        u -> dto.setActorUsername(u.getUsername()),
                        () -> dto.setActorUsername("未知用户")
                );
        return dto;
    }
}
```

---

## 5) `FollowService.follow` 接线关注通知

注入 `NotificationService`，在 `followRepository.save(follow);` **之后**加：

```java
notificationService.notifyFollow(me.getId(), followeeId);
```

类上增加字段：

```java
private final NotificationService notificationService;
```

并补 import：

```java
import com.zzh.personal_hub.notification.service.NotificationService;
```

---

## 6) `ArticleService.unpublishByAdmin` 通知作者

注入 `NotificationService`（若尚未注入）。`unpublishByAdmin` 改为：

```java
@Transactional
public Article unpublishByAdmin(Long id) {
    User admin = currentUserService.requireAdmin();
    Article article = getActiveForAdmin(id);
    article.setPublished(false);
    article.setUpdatedAt(Instant.now());
    article = articleRepository.save(article);
    notificationService.notifyUnpublishByAdmin(
            admin.getId(), article.getAuthorId(), "ARTICLE", article.getId());
    return article;
}
```

---

## 7) `ProjectService.unpublishByAdmin` 同理

```java
@Transactional
public Project unpublishByAdmin(Long id) {
    User admin = currentUserService.requireAdmin();
    Project project = getPublishedForAdmin(id);
    project.setPublished(false);
    project.setUpdatedAt(Instant.now());
    project = projectRepository.save(project);
    notificationService.notifyUnpublishByAdmin(
            admin.getId(), project.getAuthorId(), "PROJECT", project.getId());
    return project;
}
```

需注入 `NotificationService`，并确保 `requireAdmin()` 返回 `User`（当前 `CurrentUserService` 已有）。

---

## 8) `SuggestionService.create` 通知管理员

注入 `NotificationService`，`create` 末尾：

```java
@Transactional
public SuggestionResponse create(String content) {
    User me = currentUserService.requireUser();
    Suggestion row = new Suggestion();
    row.setUserId(me.getId());
    row.setContent(content.trim());
    row.setCreatedAt(Instant.now());
    suggestionRepository.save(row);
    notificationService.notifySuggestionToAdmins(me.getId(), row.getId());
    return toResponse(row);
}
```

---

## 自测清单

1. A 关注 B → B 铃铛出现 FOLLOW  
2. A 点赞/评论 B 的已发布内容 → B 收到 LIKE/COMMENT  
3. 管理员下架 B 的文章/项目 → B 收到 UNPUBLISH，点开可去草稿编辑  
4. 用户提交建议 → 管理员铃铛 SUGGESTION，点开进 `/admin/suggestions`  
5. 重启后 Flyway V4 成功执行  

贴完后回复「好了」，我帮你 review。

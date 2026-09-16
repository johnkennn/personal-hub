package com.zzh.personal_hub.ai.service;

import com.zzh.personal_hub.ai.dto.ChatConversationDetailDto;
import com.zzh.personal_hub.ai.dto.ChatConversationSummaryDto;
import com.zzh.personal_hub.ai.entity.ChatConversationEntity;
import com.zzh.personal_hub.ai.entity.ChatMessageEntity;
import com.zzh.personal_hub.ai.repository.ChatConversationRepository;
import com.zzh.personal_hub.ai.repository.ChatMessageRepository;
import com.zzh.personal_hub.common.exception.BusinessException;
import com.zzh.personal_hub.common.security.CurrentUserService;
import com.zzh.personal_hub.user.entity.User;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import tools.jackson.databind.JsonNode;
import tools.jackson.databind.json.JsonMapper;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class ChatHistoryService {

    private static final String DEFAULT_TITLE = "新对话";
    private static final int MAX_MESSAGES = 200;
    private static final int MAX_TITLE_LEN = 80;

    private final ChatConversationRepository conversationRepository;
    private final ChatMessageRepository messageRepository;
    private final CurrentUserService currentUserService;
    private final JsonMapper jsonMapper;

    public List<ChatConversationSummaryDto> listMine() {
        User me = currentUserService.requireUser();
        return conversationRepository.findByUserIdOrderByCreatedAtDesc(me.getId()).stream()
                .map(c -> toSummary(c, (int) messageRepository.countByConversationId(c.getId())))
                .toList();
    }

    @Transactional
    public ChatConversationDetailDto create(String title) {
        User me = currentUserService.requireUser();
        ChatConversationEntity row = new ChatConversationEntity();
        row.setUserId(me.getId());
        row.setTitle(normalizeTitle(title));
        Instant now = Instant.now();
        row.setCreatedAt(now);
        row.setUpdatedAt(now);
        conversationRepository.save(row);
        return toDetail(row, List.of());
    }

    public ChatConversationDetailDto getMine(Long id) {
        ChatConversationEntity row = requireOwned(id);
        List<Object> messages = loadMessages(row.getId());
        return toDetail(row, messages);
    }

    @Transactional
    public ChatConversationSummaryDto rename(Long id, String title) {
        ChatConversationEntity row = requireOwned(id);
        row.setTitle(normalizeTitle(title));
        row.setUpdatedAt(Instant.now());
        conversationRepository.save(row);
        return toSummary(row, (int) messageRepository.countByConversationId(row.getId()));
    }

    @Transactional
    public void delete(Long id) {
        ChatConversationEntity row = requireOwned(id);
        messageRepository.deleteByConversationId(row.getId());
        conversationRepository.delete(row);
    }

    @Transactional
    public ChatConversationDetailDto replaceMessages(Long id, List<Object> messages) {
        ChatConversationEntity row = requireOwned(id);
        if (messages == null) {
            throw new BusinessException(400, "messages 不能为空");
        }
        if (messages.size() > MAX_MESSAGES) {
            throw new BusinessException(400, "单会话消息过多，请新建对话");
        }

        messageRepository.deleteByConversationId(row.getId());
        // 确保 DELETE 已落到库，再 insert，避免唯一索引冲突
        messageRepository.flush();

        List<ChatMessageEntity> rows = new ArrayList<>(messages.size());
        int order = 0;
        // 同一批里若前端重复 id，加后缀保证唯一
        java.util.HashSet<String> seenIds = new java.util.HashSet<>();
        for (Object raw : messages) {
            JsonNode node = jsonMapper.valueToTree(raw);
            String clientMsgId = textOr(node, "id", "m-" + order);
            if (clientMsgId.length() > 64) {
                clientMsgId = clientMsgId.substring(0, 64);
            }
            if (!seenIds.add(clientMsgId)) {
                clientMsgId = (clientMsgId.length() > 56 ? clientMsgId.substring(0, 56) : clientMsgId)
                        + "-" + order;
                seenIds.add(clientMsgId);
            }
            long createdAtMs = node.path("createdAt").asLong(System.currentTimeMillis());
            String payload = jsonMapper.writeValueAsString(raw);

            ChatMessageEntity msg = new ChatMessageEntity();
            msg.setConversationId(row.getId());
            msg.setClientMsgId(clientMsgId);
            msg.setSortOrder(order++);
            msg.setPayload(payload);
            msg.setCreatedAtMs(createdAtMs);
            rows.add(msg);
        }
        if (!rows.isEmpty()) {
            messageRepository.saveAll(rows);
        }

        // 仍是默认标题时，按首条用户消息自动命名
        if (DEFAULT_TITLE.equals(row.getTitle()) || "附件对话".equals(row.getTitle())) {
            String auto = titleFromMessages(messages);
            if (!DEFAULT_TITLE.equals(auto)) {
                row.setTitle(auto);
            }
        }
        if (messages.isEmpty()) {
            row.setTitle(DEFAULT_TITLE);
        }
        row.setUpdatedAt(Instant.now());
        conversationRepository.save(row);

        return toDetail(row, loadMessages(row.getId()));
    }

    @Transactional
    public ChatConversationDetailDto upsertMessages(Long id, List<Object> messages) {
        ChatConversationEntity row = requireOwned(id);
        if (messages == null || messages.isEmpty()) {
            throw new BusinessException(400, "messages 不能为空");
        }
        long existing = messageRepository.countByConversationId(row.getId());
        if (existing + messages.size() > MAX_MESSAGES) {
            throw new BusinessException(400, "单会话消息过多，请新建对话");
        }

        int nextOrder = messageRepository.findMaxSortOrder(row.getId()) + 1;
        for (Object raw : messages) {
            JsonNode node = jsonMapper.valueToTree(raw);
            String clientMsgId = textOr(node, "id", "m-" + nextOrder);
            if (clientMsgId.length() > 64) {
                clientMsgId = clientMsgId.substring(0, 64);
            }
            long createdAtMs = node.path("createdAt").asLong(System.currentTimeMillis());
            String payload = jsonMapper.writeValueAsString(raw);

            var existingMsg = messageRepository
                    .findByConversationIdAndClientMsgId(row.getId(), clientMsgId);
            if (existingMsg.isPresent()) {
                ChatMessageEntity msg = existingMsg.get();
                msg.setPayload(payload);
                msg.setCreatedAtMs(createdAtMs);
                messageRepository.save(msg);
            } else {
                ChatMessageEntity msg = new ChatMessageEntity();
                msg.setConversationId(row.getId());
                msg.setClientMsgId(clientMsgId);
                msg.setSortOrder(nextOrder++);
                msg.setPayload(payload);
                msg.setCreatedAtMs(createdAtMs);
                messageRepository.save(msg);
            }
        }

        List<Object> all = loadMessages(row.getId());
        if (DEFAULT_TITLE.equals(row.getTitle()) || "附件对话".equals(row.getTitle())) {
            String auto = titleFromMessages(all);
            if (!DEFAULT_TITLE.equals(auto)) {
                row.setTitle(auto);
            }
        }
        row.setUpdatedAt(Instant.now());
        conversationRepository.save(row);
        return toDetail(row, all);
    }

    private ChatConversationEntity requireOwned(Long id) {
        User me = currentUserService.requireUser();
        return conversationRepository.findByIdAndUserId(id, me.getId())
                .orElseThrow(() -> new BusinessException(404, "会话不存在"));
    }

    private List<Object> loadMessages(Long conversationId) {
        return messageRepository.findByConversationIdOrderBySortOrderAscIdAsc(conversationId).stream()
                .map(m -> {
                    try {
                        return (Object) jsonMapper.readValue(m.getPayload(), Map.class);
                    } catch (Exception e) {
                        return Map.of(
                                "id", m.getClientMsgId(),
                                "role", "assistant",
                                "text", "[消息已损坏]",
                                "createdAt", m.getCreatedAtMs()
                        );
                    }
                })
                .toList();
    }

    private String titleFromMessages(List<Object> messages) {
        for (Object raw : messages) {
            JsonNode node = jsonMapper.valueToTree(raw);
            if (!"user".equals(node.path("role").asText())) continue;
            String text = node.path("text").asText("").replaceAll("\\s+", " ").trim();
            if (text.isEmpty()) continue;
            if (text.startsWith("（仅发送了附件）")) return "附件对话";
            return text.length() > 24 ? text.substring(0, 24) + "…" : text;
        }
        return DEFAULT_TITLE;
    }

    private String normalizeTitle(String title) {
        if (title == null || title.isBlank()) return DEFAULT_TITLE;
        String t = title.trim();
        return t.length() > MAX_TITLE_LEN ? t.substring(0, MAX_TITLE_LEN) : t;
    }

    private static String textOr(JsonNode node, String field, String fallback) {
        String v = node.path(field).asText(null);
        return (v == null || v.isBlank()) ? fallback : v;
    }

    private ChatConversationSummaryDto toSummary(ChatConversationEntity c, int messageCount) {
        return new ChatConversationSummaryDto(
                c.getId(),
                c.getTitle(),
                c.getCreatedAt().toEpochMilli(),
                c.getUpdatedAt().toEpochMilli(),
                messageCount
        );
    }

    private ChatConversationDetailDto toDetail(ChatConversationEntity c, List<Object> messages) {
        return new ChatConversationDetailDto(
                c.getId(),
                c.getTitle(),
                c.getCreatedAt().toEpochMilli(),
                c.getUpdatedAt().toEpochMilli(),
                messages
        );
    }
}

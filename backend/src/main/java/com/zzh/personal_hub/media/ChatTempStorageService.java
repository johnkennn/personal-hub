package com.zzh.personal_hub.media;

import com.zzh.personal_hub.common.exception.BusinessException;
import com.zzh.personal_hub.common.ratelimit.RedisRateLimiter;
import com.zzh.personal_hub.common.ratelimit.RateLimitProperties;
import com.zzh.personal_hub.common.security.CurrentUserService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.time.Instant;
import java.time.ZoneOffset;
import java.time.format.DateTimeFormatter;
import java.util.Locale;
import java.util.Set;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ChatTempStorageService {

    private static final long UPLOAD_WINDOW_MS = 60_000L;
    private static final long MAX_IMAGE = 5L * 1024 * 1024;
    private static final long MAX_DOC = 10L * 1024 * 1024;
    private static final long MAX_TEXT = 2L * 1024 * 1024;
    private static final Set<String> ALLOWED_IMAGES = Set.of(
        "image/jpeg", "image/png", "image/gif", "image/webp"
    );

    private final MediaProperties mediaProperties;
    private final CurrentUserService currentUserService;
    private final RedisRateLimiter rateLimiter;
    private final RateLimitProperties rateLimitProperties;

    public ChatTempFile save(MultipartFile file, String clientIp) {
        if (file == null || file.isEmpty()) {
            throw new BusinessException(400, "请选择文件");
        }
        acquireRateLimit(clientIp);

        String original = file.getOriginalFilename() != null ? file.getOriginalFilename() : "file";
        String lower = original.toLowerCase(Locale.ROOT);
        Kind kind = resolveKind(file.getContentType(), lower);
        if (kind == Kind.REJECT) {
            throw new BusinessException(400, "暂不支持该类型（可用：图片、PDF、Office、文本）");
        }
        long max = switch (kind) {
            case IMAGE -> MAX_IMAGE;
            case DOC -> MAX_DOC;
            case TEXT -> MAX_TEXT;
            case REJECT -> throw new BusinessException(400, "暂不支持该类型");
        };
        if (file.getSize() > max) {
            throw new BusinessException(400, "文件过大");
        }

        String ext = extensionOf(lower, kind);
        String id = UUID.randomUUID().toString().replace("-", "");
        String day = DateTimeFormatter.ofPattern("yyyyMMdd").withZone(ZoneOffset.UTC).format(Instant.now());
        String subDir = "chat-temp/" + day;
        String fileName = id + ext;

        Path dir = Path.of(mediaProperties.getRootDir(), subDir).normalize();
        Path dest = dir.resolve(fileName).normalize();
        if (!dest.startsWith(dir)) {
            throw new BusinessException(400, "非法路径");
        }
        try {
            Files.createDirectories(dir);
            file.transferTo(dest);
        } catch (IOException e) {
            throw new BusinessException(500, "保存失败");
        }

        String prefix = mediaProperties.getPublicPrefix().replaceAll("/$", "");
        String url = prefix + "/" + subDir + "/" + fileName;
        Instant expiresAt = Instant.now().plusSeconds(mediaProperties.getChatTempTtlHours() * 3600L);

        return new ChatTempFile(id, url, original, kind.contentTypeHint, file.getSize(), expiresAt);
    }

    private void acquireRateLimit(String clientIp) {
        Long userId = currentUserService.findUserIdOrNull();
        String key = userId != null
                ? "upload:" + userId
                : "upload:ip:" + (clientIp == null || clientIp.isBlank() ? "unknown" : clientIp);
        if (!rateLimiter.tryAcquire(key, rateLimitProperties.getUploadPerMinute(), UPLOAD_WINDOW_MS)) {
            throw new BusinessException(429, "上传过于频繁，请稍后再试");
        }
    }

    private Kind resolveKind(String contentType, String name) {
        String ct = contentType == null ? "" : contentType.toLowerCase(Locale.ROOT).trim();
        if ("image/jpg".equals(ct)) {
            ct = "image/jpeg";
        }
        if (ALLOWED_IMAGES.contains(ct) || name.matches(".*\\.(jpe?g|png|gif|webp)$")) {
            return Kind.IMAGE;
        }
        if ("application/pdf".equals(ct) || name.endsWith(".pdf")
                || name.matches(".*\\.(docx?|xlsx?|pptx?)$")) {
            return Kind.DOC;
        }
        if (ct.startsWith("text/") || name.matches(".*\\.(txt|md)$")) {
            return Kind.TEXT;
        }
        return Kind.REJECT;
    }

    private String extensionOf(String name, Kind kind) {
        int i = name.lastIndexOf('.');
        if (i >= 0 && i < name.length() - 1) return name.substring(i);
        return switch (kind) {
            case IMAGE -> ".bin";
            case DOC -> ".pdf";
            case TEXT -> ".txt";
            default -> ".bin";
        };
    }

    public enum Kind {
        IMAGE("image/jpeg"), DOC("application/octet-stream"), TEXT("text/plain"), REJECT("");
        final String contentTypeHint;
        Kind(String contentTypeHint) { this.contentTypeHint = contentTypeHint; }
    }

    public record ChatTempFile(
            String id,
            String url,
            String originalName,
            String contentType,
            long sizeBytes,
            Instant expiresAt
    ) {}
}
package com.zzh.personal_hub.media;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.time.Instant;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.stream.Stream;

@Slf4j
@Component
@RequiredArgsConstructor
public class ChatTempPurgeJob {

    private final MediaProperties mediaProperties;

    /** 每小时清理一次过期临时附件 */
    @Scheduled(cron = "0 30 * * * *")
    public void purge() {
        Path root = Path.of(mediaProperties.getRootDir(), "chat-temp").normalize();
        if (!Files.isDirectory(root)) {
            return;
        }
        long ttlHours = Math.max(1, mediaProperties.getChatTempTtlHours());
        Instant cutoff = Instant.now().minusSeconds(ttlHours * 3600L);
        AtomicInteger deleted = new AtomicInteger();
        try (Stream<Path> walk = Files.walk(root)) {
            walk.filter(Files::isRegularFile).forEach(path -> {
                try {
                    Instant modified = Files.getLastModifiedTime(path).toInstant();
                    if (modified.isBefore(cutoff)) {
                        Files.deleteIfExists(path);
                        deleted.incrementAndGet();
                    }
                } catch (IOException e) {
                    log.warn("清理临时附件失败: {}", path);
                }
            });
        } catch (IOException e) {
            log.warn("扫描 chat-temp 失败", e);
        }
        if (deleted.get() > 0) {
            log.info("已清理聊天临时附件 {} 个", deleted.get());
        }
    }
}
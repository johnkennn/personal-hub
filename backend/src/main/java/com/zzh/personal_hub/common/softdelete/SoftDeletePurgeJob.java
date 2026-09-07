package com.zzh.personal_hub.common.softdelete;

import org.springframework.stereotype.Component;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.scheduling.annotation.Scheduled;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Component
@RequiredArgsConstructor
@ConditionalOnProperty(prefix = "app.soft-delete", name = "purge-enabled", havingValue = "true", matchIfMissing = true)
public class SoftDeletePurgeJob {

    private final SoftDeletePurgeService softDeletePurgeService;

    @Scheduled(cron = "${app.soft-delete.purge-cron:0 0 3 * * *}")
    public void run() {
        log.info("开始执行软删物理清理任务");
        softDeletePurgeService.purgeExpired();
    }
}

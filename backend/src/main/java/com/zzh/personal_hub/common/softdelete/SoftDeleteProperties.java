package com.zzh.personal_hub.common.softdelete;

import org.springframework.stereotype.Component;
import org.springframework.boot.context.properties.ConfigurationProperties;
import lombok.Data;

@Data
@Component
@ConfigurationProperties(prefix = "app.soft-delete")
public class SoftDeleteProperties {
    // 软删后保留天数，到期物理删除
    private int retainDays = 30;
    // 是否启用定时清理
    private boolean purgeEnabled = true;
    // cron,默认每天凌晨3点
    private String purgeCron = "0 0 3 * * *";
}

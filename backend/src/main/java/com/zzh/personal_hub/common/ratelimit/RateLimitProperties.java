package com.zzh.personal_hub.common.ratelimit;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

import lombok.Data;

@Data
@Component
@ConfigurationProperties(prefix = "app.ratelimit")
public class RateLimitProperties {
    /** 同一 IP 每分钟登录次数上限 */
    private int loginPerMinute = 10;
    /** 同一 IP 每分钟注册次数上限 */
    private int registerPerMinute = 5;
    /** 同一用户每分钟上传次数上限 */
    private int uploadPerMinute = 20;
    /** 同一 IP 每分钟重置密码次数上限 */
    private int forgotPasswordPerMinute = 5;
}

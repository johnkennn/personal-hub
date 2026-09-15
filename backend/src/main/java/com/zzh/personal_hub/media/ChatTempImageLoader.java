package com.zzh.personal_hub.media;

import com.zzh.personal_hub.common.exception.BusinessException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.Base64;
import java.util.List;
import java.util.Locale;

@Service
@RequiredArgsConstructor
public class ChatTempImageLoader {

    private static final int MAX_IMAGES = 1;

    private final MediaProperties mediaProperties;

    public record ImagePart(String fileName, String dataUrl) {}

    /** 从附件 URL 列表里挑出图片；非图片忽略（交给文字抽取）。 */
    public List<ImagePart> loadImages(List<String> urls) {
        if (urls == null || urls.isEmpty()) {
            return List.of();
        }
        List<ImagePart> out = new ArrayList<>();
        for (String raw : urls) {
            if (!StringUtils.hasText(raw) || out.size() >= MAX_IMAGES) {
                continue;
            }
            Path file = resolveSafeChatTempPath(raw.trim());
            String name = file.getFileName().toString().toLowerCase(Locale.ROOT);
            String mime = mimeOf(name);
            if (mime == null) {
                continue;
            }
            try {
                byte[] bytes = Files.readAllBytes(file);
                if (bytes.length == 0) {
                    continue;
                }
                String dataUrl = "data:" + mime + ";base64," + Base64.getEncoder().encodeToString(bytes);
                out.add(new ImagePart(file.getFileName().toString(), dataUrl));
            } catch (IOException e) {
                throw new BusinessException(500, "读取图片失败：" + file.getFileName());
            }
        }
        return out;
    }

    private static String mimeOf(String name) {
        if (name.endsWith(".png")) return "image/png";
        if (name.endsWith(".jpg") || name.endsWith(".jpeg")) return "image/jpeg";
        if (name.endsWith(".webp")) return "image/webp";
        if (name.endsWith(".gif")) return "image/gif";
        return null;
    }

    // 与 ChatTempTextExtractor.resolveSafeChatTempPath 相同逻辑，可复制过去
    private Path resolveSafeChatTempPath(String url) {
        String prefix = mediaProperties.getPublicPrefix();
        if (prefix.endsWith("/")) {
            prefix = prefix.substring(0, prefix.length() - 1);
        }
        String allowedPrefix = prefix + "/chat-temp/";
        String path = url;
        int scheme = url.indexOf("://");
        if (scheme >= 0) {
            int pathStart = url.indexOf('/', scheme + 3);
            path = pathStart >= 0 ? url.substring(pathStart) : "";
        }
        if (!path.startsWith(allowedPrefix)) {
            throw new BusinessException(400, "非法附件路径");
        }
        String relative = path.substring(prefix.length() + 1);
        Path root = Path.of(mediaProperties.getRootDir()).toAbsolutePath().normalize();
        Path chatTempRoot = root.resolve("chat-temp").normalize();
        Path dest = root.resolve(relative).normalize();
        if (!dest.startsWith(chatTempRoot) || !Files.isRegularFile(dest)) {
            throw new BusinessException(400, "附件不存在或已过期");
        }
        return dest;
    }
}
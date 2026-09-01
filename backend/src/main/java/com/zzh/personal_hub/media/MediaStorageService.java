package com.zzh.personal_hub.media;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import com.zzh.personal_hub.common.exception.BusinessException;
import lombok.RequiredArgsConstructor;

import java.util.Set;
import java.util.UUID;
import java.nio.file.Path;
import java.nio.file.Files;
import java.io.IOException;

@Service
@RequiredArgsConstructor
public class MediaStorageService {

    private static final Set<String> ALLOWED = Set.of("image/jpeg", "image/png", "image/gif", "image/webp");
    private static final long MAX_BYTES = 1024 * 1024 * 5; // 5MB
    private final MediaProperties mediaProperties;

    /**
     * @param subDir 相对 root 的子目录，例如 avatars/3
     * @return 对外可访问路径，例如 /media/avatars/3/uuid.png
     */
    public String saveImage(MultipartFile file, String subDir) {
        if(file == null || file.isEmpty()) {
            throw new BusinessException(400, "请选择图片");
        }
        if(file.getSize() > MAX_BYTES) {
            throw new BusinessException(400, "图片大小不能超过 5MB");
        }
        String contentType = file.getContentType();
        if(contentType == null || !ALLOWED.contains(contentType)) {
            throw new BusinessException(400, "仅支持 jpeg、png、gif、webp 格式");
        }

        String ext = extensionOf(contentType);
        String fileName = UUID.randomUUID() + ext;

        Path dir = Path.of(mediaProperties.getRootDir(), subDir).normalize();
        Path dest = dir.resolve(fileName).normalize();
        // 防止 subDir 被拼成 ../../etc
        if(!dest.startsWith(dir)) {
            throw new BusinessException(400, "非法的子目录");
        }

        try {
            Files.createDirectories(dir);
            file.transferTo(dest);
        } catch (IOException e) {
            throw new BusinessException(500, "保存图片失败");
        }

        String prefix = mediaProperties.getPublicPrefix();
        if(prefix.endsWith("/")) {
            prefix = prefix.substring(0, prefix.length() - 1);
        }
        return prefix + "/" + subDir.replace("\\", "/") + "/" + fileName;
    }

    private String extensionOf(String contentType) {
        return switch (contentType) {
            case "image/jpeg" -> ".jpg";
            case "image/png" -> ".png";
            case "image/gif" -> ".gif";
            case "image/webp" -> ".webp";
            default -> ".bin";
        };
    }
}

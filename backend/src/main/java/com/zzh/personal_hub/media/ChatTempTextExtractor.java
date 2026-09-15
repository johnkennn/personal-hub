package com.zzh.personal_hub.media;

import com.zzh.personal_hub.common.exception.BusinessException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.apache.pdfbox.Loader;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;
import org.apache.poi.xssf.extractor.XSSFExcelExtractor;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.apache.poi.xwpf.extractor.XWPFWordExtractor;
import org.apache.poi.xwpf.usermodel.XWPFDocument;

import java.io.InputStream;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;

/**
 * 从聊天临时目录读取可解析文本（txt / md / pdf / docx / xlsx）。
 * 严格限制只能读 chat-temp/，防止任意路径读取。
 */
@Service
@RequiredArgsConstructor
public class ChatTempTextExtractor {

    private static final int MAX_TOTAL_CHARS = 12_000;
    private static final int MAX_FILES = 5;

    private final MediaProperties mediaProperties;

    public String extractAll(List<String> urls) {
        if (urls == null || urls.isEmpty()) {
            return "";
        }
        List<String> parts = new ArrayList<>();
        int used = 0;
        int count = 0;
        for (String rawUrl : urls) {
            if (!StringUtils.hasText(rawUrl)) {
                continue;
            }
            if (count >= MAX_FILES) {
                parts.add("（已忽略更多附件：最多解析 " + MAX_FILES + " 个）");
                break;
            }
            String piece = extractOne(rawUrl.trim());
            if (!StringUtils.hasText(piece)) {
                continue;
            }
            count++;
            if (used + piece.length() > MAX_TOTAL_CHARS) {
                int remain = Math.max(0, MAX_TOTAL_CHARS - used);
                if (remain > 0) {
                    parts.add(piece.substring(0, remain) + "\n…（已截断）");
                }
                parts.add("（附件总长度已达上限）");
                break;
            }
            parts.add(piece);
            used += piece.length();
        }
        return String.join("\n\n", parts);
    }

    private String extractOne(String url) {
        Path file = resolveSafeChatTempPath(url);
        String name = file.getFileName().toString().toLowerCase(Locale.ROOT);
        if (name.endsWith(".txt") || name.endsWith(".md")) {
            try {
                String text = Files.readString(file, StandardCharsets.UTF_8).trim();
                if (!StringUtils.hasText(text)) {
                    return "【" + file.getFileName() + "】（空文件）";
                }
                return "【" + file.getFileName() + "】\n" + text;
            } catch (IOException e) {
                throw new BusinessException(500, "读取附件失败：" + file.getFileName());
            }
        }
        if (name.endsWith(".pdf")) {
            try (PDDocument doc = Loader.loadPDF(file.toFile())) {
                PDFTextStripper stripper = new PDFTextStripper();
                stripper.setSortByPosition(true);
                String text = stripper.getText(doc);
                if (text != null) {
                    text = text.replaceAll("[ \\t\\x0B\\f\\r]+", " ")
                            .replaceAll("\\n{3,}", "\n\n")
                            .trim();
                }
                if (!StringUtils.hasText(text)) {
                    return "【" + file.getFileName() + "】未能提取到文字（可能是扫描件/图片型 PDF），请改用可复制文本的 PDF 或 .txt。";
                }
                return "【" + file.getFileName() + "】\n" + text;
            } catch (IOException e) {
                throw new BusinessException(500, "读取 PDF 失败：" + file.getFileName());
            }
        }
        if (name.endsWith(".docx")) {
            try (InputStream in = Files.newInputStream(file);
                 XWPFDocument doc = new XWPFDocument(in);
                 XWPFWordExtractor extractor = new XWPFWordExtractor(doc)) {
                String text = normalizeOfficeText(extractor.getText());
                if (!StringUtils.hasText(text)) {
                    return "【" + file.getFileName() + "】未能提取到文字（可能是空文档或几乎全是图片），请改用可复制文本的 Word 或 .txt。";
                }
                return "【" + file.getFileName() + "】\n" + text;
            } catch (IOException e) {
                throw new BusinessException(500, "读取 Word 失败：" + file.getFileName());
            }
        }
        if (name.endsWith(".xlsx")) {
            try (InputStream in = Files.newInputStream(file);
                 XSSFWorkbook workbook = new XSSFWorkbook(in);
                 XSSFExcelExtractor extractor = new XSSFExcelExtractor(workbook)) {
                extractor.setFormulasNotResults(false);
                extractor.setIncludeSheetNames(true);
                String text = normalizeOfficeText(extractor.getText());
                if (!StringUtils.hasText(text)) {
                    return "【" + file.getFileName() + "】未能提取到文字（可能是空表），请改用有内容的 Excel 或 .txt。";
                }
                return "【" + file.getFileName() + "】\n" + text;
            } catch (IOException e) {
                throw new BusinessException(500, "读取 Excel 失败：" + file.getFileName());
            }
        }
        // 图片交给识图链路；此处跳过，避免污染文档抽字
        if (name.endsWith(".png") || name.endsWith(".jpg") || name.endsWith(".jpeg")
                || name.endsWith(".webp") || name.endsWith(".gif")) {
            return "";
        }
        // 旧版 Office / PPT：本步不解析正文
        return "【" + file.getFileName() + "】暂不支持自动解析该格式，请粘贴文字或上传 .txt / .md / .pdf / .docx / .xlsx。";
    }

    /**
     * 仅允许：{publicPrefix}/chat-temp/... → {rootDir}/chat-temp/...
     */
    private Path resolveSafeChatTempPath(String url) {
        String prefix = mediaProperties.getPublicPrefix();
        if (prefix.endsWith("/")) {
            prefix = prefix.substring(0, prefix.length() - 1);
        }
        String allowedPrefix = prefix + "/chat-temp/";
        // 兼容前端偶发带上 origin 的情况：只取 path
        String path = url;
        int scheme = url.indexOf("://");
        if (scheme >= 0) {
            int pathStart = url.indexOf('/', scheme + 3);
            path = pathStart >= 0 ? url.substring(pathStart) : "";
        }
        if (!path.startsWith(allowedPrefix)) {
            throw new BusinessException(400, "非法附件路径");
        }
        String relative = path.substring(prefix.length() + 1); // chat-temp/...
        Path root = Path.of(mediaProperties.getRootDir()).toAbsolutePath().normalize();
        Path chatTempRoot = root.resolve("chat-temp").normalize();
        Path dest = root.resolve(relative).normalize();
        if (!dest.startsWith(chatTempRoot) || !Files.isRegularFile(dest)) {
            throw new BusinessException(400, "附件不存在或已过期");
        }
        return dest;
    }

    private static String normalizeOfficeText(String text) {
        if (text == null) {
            return "";
        }
        return text.replaceAll("[ \\t\\x0B\\f\\r]+", " ")
                .replaceAll("\\n{3,}", "\n\n")
                .trim();
    }
}

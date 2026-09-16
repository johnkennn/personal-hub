package com.zzh.personal_hub.article.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.IdClass;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

import java.io.Serializable;
import java.util.Objects;

@Getter
@Setter
@Entity
@Table(name = "article_tool")
@IdClass(ArticleToolEntity.Pk.class)
public class ArticleToolEntity {

    @Id
    @Column(name = "article_id", nullable = false)
    private Long articleId;

    @Id
    @Column(name = "tool_id", nullable = false)
    private Long toolId;

    @Column(name = "sort_order", nullable = false)
    private int sortOrder;

    @Getter
    @Setter
    public static class Pk implements Serializable {
        private Long articleId;
        private Long toolId;

        @Override
        public boolean equals(Object o) {
            if (this == o) return true;
            if (!(o instanceof Pk pk)) return false;
            return Objects.equals(articleId, pk.articleId) && Objects.equals(toolId, pk.toolId);
        }

        @Override
        public int hashCode() {
            return Objects.hash(articleId, toolId);
        }
    }
}

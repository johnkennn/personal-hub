package com.zzh.personal_hub.common.response;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.util.List;

/** 简单分页包装，后续列表接口可复用 */
@Data
@AllArgsConstructor
public class PageResult<T> {
    private List<T> items;
    private int page;
    private int size;
    private long total;
}

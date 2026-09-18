package com.zzh.personal_hub;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * 全量启动应用 + MockMvc，测一条公开接口。
 * 跑测试前请保证本机 MySQL、Redis 已启动（与日常开发相同）。
 */
@SpringBootTest
@AutoConfigureMockMvc
class HelloControllerMockMvcTest {

    @Autowired
    private MockMvc mockMvc;

    @Test
    void hello_shouldReturn200() throws Exception {
        mockMvc.perform(get("/api/hello"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data").value("Hello Personal Hub"));
    }
}
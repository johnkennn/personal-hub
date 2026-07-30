package com.zzh.personal_hub.config;

import com.zzh.personal_hub.auth.jwt.JwtAuthenticationFilter;
import com.zzh.personal_hub.common.response.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import tools.jackson.databind.json.JsonMapper;

@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;
    private final JsonMapper jsonMapper;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .csrf(csrf -> csrf.disable())
                .cors(Customizer.withDefaults())
                .authorizeHttpRequests(auth -> auth
                    // More specific matchers must come before wildcards (first match wins)
                    .requestMatchers(HttpMethod.POST, "/api/auth/login").permitAll()
                    .requestMatchers(HttpMethod.GET, "/api/hello").permitAll()
                    .requestMatchers(HttpMethod.GET, "/api/articles/manage").authenticated()
                    .requestMatchers(HttpMethod.GET, "/api/articles/*/manage").authenticated()
                    .requestMatchers(HttpMethod.POST, "/api/articles").authenticated()
                    .requestMatchers(HttpMethod.PUT, "/api/articles/*").authenticated()
                    .requestMatchers(HttpMethod.DELETE, "/api/articles/*").authenticated()
                    .requestMatchers(HttpMethod.GET, "/api/articles", "/api/articles/*").permitAll()
                    .requestMatchers(HttpMethod.GET, "/api/projects/manage").authenticated()
                    .requestMatchers(HttpMethod.GET, "/api/projects/*/manage").authenticated()
                    .requestMatchers(HttpMethod.POST, "/api/projects").authenticated()
                    .requestMatchers(HttpMethod.PUT, "/api/projects/*").authenticated()
                    .requestMatchers(HttpMethod.DELETE, "/api/projects/*").authenticated()
                    .requestMatchers(HttpMethod.GET, "/api/projects", "/api/projects/*").permitAll()
                    .anyRequest().permitAll()
                )
                .httpBasic(httpBasic -> httpBasic.disable())
                .formLogin(form -> form.disable())
                .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class)
                .exceptionHandling(ex -> ex
                    .authenticationEntryPoint((request, response, authException) -> {
                        response.setStatus(401);
                        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
                        response.setCharacterEncoding("UTF-8");
                        jsonMapper.writeValue(
                                response.getOutputStream(),
                                ApiResponse.fail(401, "未登录或登录已失效")
                        );
                    })
                );
        return http.build();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public UserDetailsService userDetailsService() {
        return username -> {
            throw new UsernameNotFoundException(
                    "本系统使用 JWT 认证，不使用 UserDetailsService 加载用户: " + username
            );
        };
    }
}
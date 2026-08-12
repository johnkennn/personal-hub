package com.zzh.personal_hub.user.controller;

import com.zzh.personal_hub.common.response.ApiResponse;
import com.zzh.personal_hub.common.response.PageResult;
import com.zzh.personal_hub.user.dto.ProfileResponse;
import com.zzh.personal_hub.user.dto.UserSummaryDto;
import com.zzh.personal_hub.user.service.FollowService;
import com.zzh.personal_hub.user.service.ProfileService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import java.util.List;
import com.zzh.personal_hub.blog.entity.Article;
import com.zzh.personal_hub.project.entity.Project;
import com.zzh.personal_hub.blog.service.ArticleService;
import com.zzh.personal_hub.project.service.ProjectService;
@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UsersController {

    private final ProfileService profileService;
    private final FollowService followService;
    private final ArticleService articleService;
    private final ProjectService projectService;
    @GetMapping("/{id}/profile")
    public ApiResponse<ProfileResponse> getPublicProfile(@PathVariable Long id) {
        return ApiResponse.success(profileService.getPublicProfile(id));
    }

    /** 粉丝列表（公开），page 从 0 开始 */
    @GetMapping("/{id}/followers")
    public ApiResponse<PageResult<UserSummaryDto>> followers(
            @PathVariable Long id,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ApiResponse.success(followService.listFollowers(id, page, size));
    }

    /** 关注列表（公开），page 从 0 开始 */
    @GetMapping("/{id}/following")
    public ApiResponse<PageResult<UserSummaryDto>> following(
            @PathVariable Long id,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ApiResponse.success(followService.listFollowing(id, page, size));
    }

    @PostMapping("/{id}/follow")
    public ApiResponse<Void> follow(@PathVariable Long id) {
        followService.follow(id);
        return ApiResponse.success(null);
    }

    @DeleteMapping("/{id}/follow")
    public ApiResponse<Void> unfollow(@PathVariable Long id) {
        followService.unfollow(id);
        return ApiResponse.success(null);
    }

    @GetMapping("/{id}/articles")
    public ApiResponse<List<Article>> getPublishedArticles(@PathVariable Long id) {
        return ApiResponse.success(articleService.listPublishedByAuthor(id));
    }

    @GetMapping("/{id}/projects")
    public ApiResponse<List<Project>> getPublishedProjects(@PathVariable Long id) {
        return ApiResponse.success(projectService.listPublishedByAuthor(id));
    }
}

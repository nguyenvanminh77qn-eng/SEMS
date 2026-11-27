package com.sems.auth.controller;

import java.util.List;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.sems.auth.dto.RoleResponse;
import com.sems.auth.service.RoleService;
import com.sems.common.response.ApiResponse;

/** GET /api/v1/admin/roles : chỉ ADMIN (SecurityConfig đã chặn /api/v1/admin/**). */
@RestController
@RequestMapping("/api/v1/admin/roles")
public class RoleController {

    private final RoleService roleService;

    public RoleController(RoleService roleService) {
        this.roleService = roleService;
    }

    @GetMapping
    public ApiResponse<List<RoleResponse>> findAll() {
        return ApiResponse.ok(roleService.findAll());
    }
}

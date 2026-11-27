package com.sems.auth.dto;

import com.sems.auth.entity.Role;

public record RoleResponse(Integer id, String name) {

    public static RoleResponse from(Role role) {
        return new RoleResponse(role.getId(), role.getName());
    }
}

package com.sems.dto.authDTO;

import com.sems.entity.Role;

public record RoleResponse(Integer id, String name) {

    public static RoleResponse from(Role role) {
        return new RoleResponse(role.getId(), role.getName());
    }
}

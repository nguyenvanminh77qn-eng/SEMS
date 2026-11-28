package com.sems.repository.authRepository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.sems.entity.Role;

public interface RoleRepository extends JpaRepository<Role, Integer> {

    Optional<Role> findByName(String name);
}

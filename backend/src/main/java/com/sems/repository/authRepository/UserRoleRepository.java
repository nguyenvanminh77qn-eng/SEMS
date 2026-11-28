package com.sems.repository.authRepository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.sems.entity.UserRole;

public interface UserRoleRepository extends JpaRepository<UserRole, Integer> {

    @Query("select ur.role.name from UserRole ur where ur.user.id = :userId order by ur.role.name")
    List<String> findRoleNamesByUserId(@Param("userId") Integer userId);
}

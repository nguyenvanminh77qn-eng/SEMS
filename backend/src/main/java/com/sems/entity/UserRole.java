package com.sems.entity;

import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;

/** Bảng user_roles: gán vai trò cho tài khoản. assigner_id = tài khoản thực hiện việc gán (NULL khi seed/đăng ký). */
@Entity
@Table(name = "user_roles")
public class UserRole {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "role_id", nullable = false)
    private Role role;

    @Column(name = "assigner_id")
    private Integer assignerId;

    @Column(name = "assigned_at", nullable = false, updatable = false)
    private LocalDateTime assignedAt;

    protected UserRole() {
    }

    public UserRole(User user, Role role, Integer assignerId) {
        this.user = user;
        this.role = role;
        this.assignerId = assignerId;
    }

    @PrePersist
    void onCreate() {
        if (assignedAt == null) {
            assignedAt = LocalDateTime.now();
        }
    }

    public Integer getId() { return id; }
    public User getUser() { return user; }
    public Role getRole() { return role; }
    public Integer getAssignerId() { return assignerId; }
    public LocalDateTime getAssignedAt() { return assignedAt; }
}

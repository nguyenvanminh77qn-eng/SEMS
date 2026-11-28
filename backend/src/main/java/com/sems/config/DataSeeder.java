package com.sems.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import com.sems.entity.Role;
import com.sems.entity.RoleName;
import com.sems.entity.User;
import com.sems.entity.UserRole;
import com.sems.entity.UserStatus;
import com.sems.repository.authRepository.RoleRepository;
import com.sems.repository.authRepository.UserRepository;
import com.sems.repository.authRepository.UserRoleRepository;
import com.sems.service.authService.StudentProfileWriter;

/**
 * Tạo sẵn 3 tài khoản mẫu để test trên database local (cùng tài khoản demo với frontend).
 * Chỉ chạy khi app.seed.enabled=true và bỏ qua tài khoản đã tồn tại. PHẢI tắt khi triển khai thật.
 */
@Component
@ConditionalOnProperty(prefix = "app.seed", name = "enabled", havingValue = "true")
public class DataSeeder implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(DataSeeder.class);

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final UserRoleRepository userRoleRepository;
    private final StudentProfileWriter studentProfileWriter;
    private final PasswordEncoder passwordEncoder;

    public DataSeeder(UserRepository userRepository, RoleRepository roleRepository,
                      UserRoleRepository userRoleRepository, StudentProfileWriter studentProfileWriter,
                      PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.userRoleRepository = userRoleRepository;
        this.studentProfileWriter = studentProfileWriter;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    @Transactional
    public void run(String... args) {
        Role admin = ensureRole(RoleName.ADMIN);
        Role organizer = ensureRole(RoleName.ORGANIZER);
        Role student = ensureRole(RoleName.STUDENT);

        createUser("admin@qnu.edu.vn", "Admin@123", "Quản trị viên SEMS", "Khác", admin);
        createUser("organizer@qnu.edu.vn", "Organizer@123", "Phòng Công tác sinh viên", "Khác", organizer);
        User sv = createUser("4751050247@student.qnu.edu.vn", "Student@123", "Nguyễn Phương", "Nam", student);
        if (sv != null) {
            studentProfileWriter.insert(sv.getId(), "4751050247", sv.getFullName(), "CNTT K47B", null, null, sv.getEmail());
        }
        log.warn("DataSeeder đang bật (app.seed.enabled=true): tài khoản mẫu dùng mật khẩu công khai, không dùng khi triển khai thật");
    }

    private Role ensureRole(String name) {
        return roleRepository.findByName(name).orElseGet(() -> roleRepository.save(new Role(name)));
    }

    /** Trả về null nếu tài khoản đã tồn tại. */
    private User createUser(String email, String password, String fullName, String gender, Role role) {
        if (userRepository.existsByEmailIgnoreCase(email)) {
            return null;
        }
        User user = new User();
        user.setEmail(email);
        user.setPasswordHash(passwordEncoder.encode(password));
        user.setFullName(fullName);
        user.setGender(gender);
        user.setStatus(UserStatus.ACTIVE);
        user.setEmailVerified(true);
        userRepository.save(user);
        userRoleRepository.save(new UserRole(user, role, null));
        log.info("Đã tạo tài khoản mẫu {} ({})", email, role.getName());
        return user;
    }
}

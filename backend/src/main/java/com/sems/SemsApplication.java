package com.sems;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.security.servlet.UserDetailsServiceAutoConfiguration;
import org.springframework.boot.context.properties.ConfigurationPropertiesScan;

// Loại UserDetailsServiceAutoConfiguration để Spring không tự tạo user "user" với mật khẩu ngẫu nhiên:
// hệ thống xác thực bằng email + mật khẩu trong bảng users và JWT.
@SpringBootApplication(exclude = UserDetailsServiceAutoConfiguration.class)
@ConfigurationPropertiesScan
public class SemsApplication {

    public static void main(String[] args) {
        SpringApplication.run(SemsApplication.class, args);
    }
}

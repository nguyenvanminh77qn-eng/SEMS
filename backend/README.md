# SEMS Backend (Spring Boot)

Module hiện có: **Authentication & Core Security** (Phương) cùng các thành phần dùng chung
(`SecurityConfig`, JWT, `ApiResponse`, `GlobalExceptionHandler`, exception chung).

## Yêu cầu
- JDK 17 trở lên, Maven 3.9+
- MySQL 8.0.16+ đã chạy file `SEMS_MySQL_Create_Database.sql` (tạo database `sems_db`)

## Chạy
```bash
cd backend
mvn spring-boot:run
```
API chạy tại `http://localhost:8080`. Cấu hình mặc định nằm ở `src/main/resources/application.properties`,
ghi đè bằng biến môi trường (không commit mật khẩu thật):

| Biến | Ý nghĩa | Mặc định |
|---|---|---|
| `DB_URL`, `DB_USERNAME`, `DB_PASSWORD` | Kết nối MySQL | `localhost:3306/sems_db`, `root`, rỗng |
| `JWT_SECRET` | Khóa ký JWT, tối thiểu 32 ký tự | giá trị dev |
| `MAIL_ENABLED` | `true` để gửi email thật | `false` (OTP in ra console) |
| `MAIL_HOST`, `MAIL_PORT`, `MAIL_USERNAME`, `MAIL_PASSWORD`, `MAIL_FROM` | SMTP | Gmail 587 |
| `SEED_ENABLED` | Tạo 3 tài khoản mẫu | `true` |

Khi `MAIL_ENABLED=false`, tìm dòng `[DEV] ... OTP ...` trong console để lấy mã.

## Tài khoản mẫu (khi `SEED_ENABLED=true`)
| Email | Mật khẩu | Vai trò |
|---|---|---|
| admin@qnu.edu.vn | Admin@123 | ADMIN |
| organizer@qnu.edu.vn | Organizer@123 | ORGANIZER |
| 4751050247@student.qnu.edu.vn | Student@123 | STUDENT |

## Endpoint (prefix `/api/v1`)
| Method | URL | Quyền | Chức năng |
|---|---|---|---|
| POST | `/auth/register` | công khai | Đăng ký sinh viên, gửi OTP xác thực email |
| POST | `/auth/verify-email` | công khai | Xác thực email bằng OTP |
| POST | `/auth/resend-otp` | công khai | Gửi lại OTP (`purpose` tùy chọn) |
| POST | `/auth/login` | công khai | Đăng nhập bằng email + mật khẩu |
| POST | `/auth/refresh` | công khai | Đổi refresh token lấy cặp token mới |
| POST | `/auth/logout` | công khai | Thu hồi refresh token |
| POST | `/auth/forgot-password` | công khai | Gửi OTP đặt lại mật khẩu |
| POST | `/auth/verify-reset-otp` | công khai | Kiểm tra OTP quên mật khẩu (chưa đổi mật khẩu, chưa tiêu thụ mã) |
| POST | `/auth/reset-password` | công khai | Đặt lại mật khẩu bằng OTP |
| GET | `/auth/me` | đã đăng nhập | Tài khoản hiện tại |
| PATCH | `/auth/me` | đã đăng nhập | Sửa họ tên, SĐT, giới tính, lớp, khoa (email và mã sinh viên không đổi) |
| PATCH | `/auth/me/password` | đã đăng nhập | Đổi mật khẩu; trả cặp token mới cho thiết bị hiện tại, các thiết bị khác phải đăng nhập lại |
| GET | `/admin/roles` | ADMIN | Danh sách vai trò |

Ví dụ:
```bash
curl -X POST localhost:8080/api/v1/auth/login -H "Content-Type: application/json" \
  -d '{"email":"admin@qnu.edu.vn","password":"Admin@123"}'

curl localhost:8080/api/v1/auth/me -H "Authorization: Bearer <accessToken>"
```

## Quy tắc bảo mật đã áp dụng
- Mật khẩu băm BCrypt; access token JWT 15 phút; refresh token ngẫu nhiên 7 ngày, DB chỉ lưu SHA-256, xoay vòng mỗi lần refresh.
- Sai mật khẩu 5 lần khóa 15 phút (`users.failed_login_count`, `locked_until`).
- OTP 6 chữ số, hiệu lực 5 phút, tối đa 5 lần nhập sai, chờ 60 giây mới gửi lại.
- `forgot-password` và `resend-otp` luôn trả thành công để không lộ email nào đã đăng ký.
- Đặt lại hoặc đổi mật khẩu sẽ thu hồi mọi refresh token.

## Cho các module khác
- Lấy tài khoản hiện tại: `SecurityUtils.requireCurrentUserId()` hoặc `@AuthenticationPrincipal AuthenticatedUser`. Không tin `userId`/`role` do client gửi.
- URL `/api/v1/admin/**` yêu cầu ADMIN, `/api/v1/organizer/**` yêu cầu ORGANIZER; hoặc dùng `@PreAuthorize("hasRole('...')")`.
- Endpoint cần mở công khai: báo Phương thêm vào `PUBLIC_ENDPOINTS` trong `SecurityConfig`.
- Trả `ApiResponse<T>`, danh sách phân trang trả `PageResponse<T>`, ném `BusinessException` / `ResourceNotFoundException` / `DuplicateResourceException`.
- Hàm vừa ghi DB vừa ném `BusinessException` (ví dụ đếm số lần sai) phải dùng `@Transactional(noRollbackFor = BusinessException.class)`.
- `StudentProfileWriter` đang ghi tạm bảng `students` lúc đăng ký; Hòa thay bằng service của module student khi sẵn sàng.

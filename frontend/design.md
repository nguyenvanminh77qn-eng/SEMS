# SEMS – Thiết kế giao diện (Frontend)

Cổng thông tin sinh viên – Đại học Quy Nhơn. Giao diện sinh viên viết bằng HTML/CSS/JS thuần, dữ liệu mẫu (demo) nằm trong `js/student/student.js`.

## Cấu trúc thư mục

```
frontend/
├── index.html                  # Điểm vào, chuyển tới pages/student/index.html
├── design.md                   # Tài liệu này
├── design-references/          # Ảnh/mockup tham khảo thiết kế
├── css/student/
│   ├── student.css             # CSS dùng chung (biến màu, header, nút, thẻ, chip, modal, toast...)
│   └── <tên-trang>.css         # CSS riêng từng trang, nạp sau student.css
├── js/student/
│   ├── student.js              # JS dùng chung: dữ liệu mẫu (window.QN), header, đăng nhập demo, toast
│   └── <tên-trang>.js          # JS riêng từng trang
├── pages/student/              # Các trang HTML của sinh viên
└── images/student/logo.png
```

## Các trang sinh viên

| Trang | `data-nav` | CSS / JS riêng |
|---|---|---|
| `notifications.html` | `notices` | `notifications` |
| `activity-calendar.html` | `calendar` | `activity-calendar` |
| `event-list.html` | `events` | `event-list` |
| `event-detail.html` | `events` | `event-detail` |
| `event-register.html` | `register` | `event-register` |
| `event-review.html` | `my-events` | `event-review` |
| `my-events.html` | `my-events` | `my-events` |
| `qr-checkin.html` | `qr` | `qr-checkin` |

Mỗi trang nạp theo thứ tự: `student.css` → `<trang>.css`, và `student.js` → `<trang>.js`.
Header được chèn tự động vào `<div id="siteHeaderSlot">`; `<body data-nav="...">` đánh dấu mục menu đang chọn.

## Quy ước thêm trang mới

1. Tạo `pages/student/<ten>.html`, `css/student/<ten>.css`, `js/student/<ten>.js`.
2. Dùng đường dẫn tương đối `../../css/student/...`, `../../js/student/...`, `../../images/student/...`.
3. Thêm tên file HTML vào mảng `BUILT` trong `student.js` để liên kết không hiện thông báo "sẽ có ở đợt sau".
4. Style dùng chung nhiều trang đặt vào `student.css`; style chỉ một trang đặt vào CSS riêng của trang đó.

## Design tokens (khai báo trong `:root` của `student.css`)

- Màu chữ: `--ink #0e2a4d`, `--text #2b3d52`, `--muted #66788d`
- Nền / viền: `--bg #f3f6fb`, `--card #ffffff`, `--line #d9e2ee`
- Màu chính: `--blue #2563c9` (đậm `--blue-dark #1a4aa0`, nền nhạt `--blue-tint`)
- Trạng thái: `--green`, `--amber`, `--rose`, `--gray`, `--danger` (mỗi màu có bản `-tint`)
- Bo góc: `--radius 12px`, `--radius-sm 8px`
- Font: Be Vietnam Pro (Google Fonts), nền tảng `system-ui`
- Loại sự kiện (gradient): Văn hóa tím–hồng, Thể thao xanh lá, Tình nguyện cam, Học thuật xanh dương
- Breakpoint responsive: 980px (menu thu gọn) và 680px (mobile)

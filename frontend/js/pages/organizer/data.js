// ==========================================
// DATA - Dữ liệu mẫu (sự kiện, sinh viên)
// Khi nối API thật, thay phần này bằng dữ liệu lấy từ server.
// ==========================================

// ------------------------------------------
// Dữ liệu sự kiện mẫu
// ------------------------------------------

const events = [
    {
        id: 1,
        name: "Ngày hội Chào đón Tân sinh viên",
        coverText: "NGÀY HỘI TÂN SINH VIÊN",
        status: "ongoing",
        date: "12/11/2026",
        start: "07:00",
        end: "17:00",
        location: "Sân trường Đại học Quy Nhơn",
        organizer: "Đoàn Thanh niên - Hội Sinh viên",
        registered: 286,
        maximum: 350,
        description: "Chương trình chào đón tân sinh viên, tạo cơ hội giao lưu, kết nối và tìm hiểu các hoạt động học tập, phong trào của nhà trường."
    },
    {
        id: 2,
        name: "Hội thảo Định hướng nghề nghiệp ngành CNTT",
        coverText: "ĐỊNH HƯỚNG NGHỀ NGHIỆP",
        status: "upcoming",
        date: "18/11/2026",
        start: "08:00",
        end: "11:30",
        location: "Hội trường A",
        organizer: "Khoa Công nghệ thông tin",
        registered: 142,
        maximum: 200,
        description: "Hội thảo cung cấp thông tin về định hướng nghề nghiệp, cơ hội việc làm và những kỹ năng cần thiết cho sinh viên ngành Công nghệ thông tin."
    },
    {
        id: 3,
        name: "Ngày hội Hiến máu tình nguyện",
        coverText: "HIẾN MÁU TÌNH NGUYỆN",
        status: "ended",
        submitted: true,
        date: "05/11/2026",
        start: "06:30",
        end: "11:00",
        location: "Nhà thi đấu đa năng",
        organizer: "Hội Sinh viên",
        registered: 194,
        maximum: 220,
        description: "Hoạt động hiến máu tình nguyện nhằm lan tỏa tinh thần nhân ái, sẻ chia và trách nhiệm cộng đồng trong sinh viên."
    },
    {
        id: 4,
        name: "Cuộc thi Sáng tạo công nghệ sinh viên",
        coverText: "SÁNG TẠO CÔNG NGHỆ",
        status: "upcoming",
        date: "25/11/2026",
        start: "08:00",
        end: "16:30",
        location: "Phòng hội thảo B",
        organizer: "Khoa Công nghệ thông tin",
        registered: 85,
        maximum: 150,
        description: "Cuộc thi tạo sân chơi để sinh viên giới thiệu các ý tưởng và sản phẩm công nghệ sáng tạo."
    },
    {
        id: 5,
        name: "Hội thao sinh viên năm 2026",
        coverText: "HỘI THAO SINH VIÊN",
        status: "ended",
        submitted: false,
        date: "01/11/2026",
        start: "07:00",
        end: "17:00",
        location: "Sân vận động trường",
        organizer: "Đoàn Thanh niên",
        registered: 310,
        maximum: 400,
        description: "Hoạt động thể thao giúp sinh viên rèn luyện sức khỏe, tăng cường tinh thần đoàn kết và giao lưu giữa các khoa."
    },
    {
        id: 6,
        name: "Tập huấn kỹ năng mềm cho sinh viên",
        coverText: "KỸ NĂNG MỀM",
        status: "ongoing",
        date: "16/11/2026",
        start: "08:00",
        end: "16:00",
        location: "Hội trường B",
        organizer: "Trung tâm Hỗ trợ sinh viên",
        registered: 120,
        maximum: 180,
        description: "Chương trình trang bị những kỹ năng giao tiếp, làm việc nhóm và giải quyết vấn đề dành cho sinh viên."
    }
];


// ------------------------------------------
// Dữ liệu sinh viên đăng ký mẫu
// ------------------------------------------

const students = [
    {
        name: "Nguyễn Văn A",
        id: "4523657894",
        className: "CNTT 47B",
        faculty: "CNTT",
        email: "NguyenVanA@qnu.edu.vn"
    },
    {
        name: "Lý Văn B",
        id: "4574890346",
        className: "KTPM 46A",
        faculty: "CNTT",
        email: "LyVanB@qnu.edu.vn"
    },
    {
        name: "Trần Thị C",
        id: "4467894563",
        className: "CNTT 47B",
        faculty: "CNTT",
        email: "TranThiC@qnu.edu.vn"
    },
    {
        name: "Lê Văn D",
        id: "4764839568",
        className: "KTPM 46A",
        faculty: "CNTT",
        email: "LeVanD@qnu.edu.vn"
    },
    {
        name: "Phạm Thị E",
        id: "4751032456",
        className: "Toán 47A",
        faculty: "Toán",
        email: "PhamThiE@qnu.edu.vn"
    },
    {
        name: "Nguyễn Văn F",
        id: "4751032457",
        className: "Kế toán 46B",
        faculty: "Kinh tế",
        email: "NguyenVanF@qnu.edu.vn"
    },
    {
        name: "Trần Văn G",
        id: "4751032458",
        className: "Anh 47C",
        faculty: "Ngoại ngữ",
        email: "TranVanG@qnu.edu.vn"
    },
    {
        name: "Hoàng Thị H",
        id: "4751032459",
        className: "Vật lý 46A",
        faculty: "Vật lý",
        email: "HoangThiH@qnu.edu.vn"
    },
    {
        name: "Đỗ Văn I",
        id: "4751032460",
        className: "Toán 46B",
        faculty: "Toán",
        email: "DoVanI@qnu.edu.vn"
    },
    {
        name: "Bùi Thị K",
        id: "4751032461",
        className: "Kế toán 47A",
        faculty: "Kinh tế",
        email: "BuiThiK@qnu.edu.vn"
    },
    {
        name: "Phan Văn L",
        id: "4751032462",
        className: "CNTT 46C",
        faculty: "CNTT",
        email: "PhanVanL@qnu.edu.vn"
    }
];

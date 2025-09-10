document.addEventListener('DOMContentLoaded', function() {
    const majorSelect = document.getElementById('major');
    const courseSelect = document.getElementById('training_course');
    const classCodeInput = document.getElementById('class_code');

    // Ánh xạ các ngành học với mã viết tắt
    const majorAbbreviations = {
        'Kế toán doanh nghiệp': 'KT',
        'Quản trị kinh doanh': 'QTKD',
        'Tài chính ngân hàng': 'TCNH',
        'Thương mại điện tử': 'TMDT',
        'Logistic': 'LGC',
        'Thú y': 'TY',
        'Công nghệ thông tin': 'CNTT',
        'Công nghệ ô tô': 'OTO',
        'Công nghệ thực phẩm': 'TP',
        'Dược': 'DUOC',
        'Điều dưỡng': 'DD',
        'Y sĩ đa khoa': 'YDK',
        'Kỹ thuật phục hình răng': 'KTPHR',
        'Kỹ thuật phục hồi chức năng': 'KTPHCN',
        'Y học cổ truyền': 'YHCT',
        'Du lịch': 'DL',
        'Ngôn ngữ Anh': 'NNA',
        'Luật dịch vụ pháp lý': 'LDVPL',
        'Sư phạm mầm non': 'SPMN'
    };

    // Ánh xạ khóa đào tạo với mã K
    const courseAbbreviations = {
        '2025 - 2028': 'K11',
        '2024 - 2027': 'K10',
        '2023 - 2026': 'K9',
        '2022 - 2025': 'K8'
    };
    
    function generateClassCode() {
        const selectedMajor = majorSelect.value;
        const selectedCourse = courseSelect.value;
        
        const majorAbbr = majorAbbreviations[selectedMajor];
        const courseAbbr = courseAbbreviations[selectedCourse];

        if (majorAbbr && courseAbbr) {
            classCodeInput.value = `${courseAbbr}-${majorAbbr}`;
        } else {
            classCodeInput.value = ''; // Xóa trường nếu không có giá trị
        }
    }

    // Lắng nghe sự kiện khi người dùng thay đổi Ngành học hoặc Khóa đào tạo
    majorSelect.addEventListener('change', generateClassCode);
    courseSelect.addEventListener('change', generateClassCode);

    // Tạo mã lớp ngay khi trang được tải lần đầu tiên
    generateClassCode();
});
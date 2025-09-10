document.addEventListener('DOMContentLoaded', function() {
    const loanForm = document.getElementById('loanForm');
    const majorSelect = document.getElementById('major');
    const courseSelect = document.getElementById('training_course');
    const classCodeInput = document.getElementById('class_code');
    const trainingSystemSelect = document.getElementById('training_system'); // Thêm trường training_system
    const messageContainer = document.getElementById('messageContainer');

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
            classCodeInput.value = '';
        }
    }

    // Gán sự kiện change cho các trường liên quan
    majorSelect.addEventListener('change', generateClassCode);
    courseSelect.addEventListener('change', generateClassCode);

    // Tạo mã lớp ngay khi trang được tải lần đầu tiên
    generateClassCode();
    
    loanForm.addEventListener('submit', async function(event) {
        event.preventDefault();
        
        const formData = new FormData(loanForm);
        const data = Object.fromEntries(formData.entries());

        // Gán giá trị mã lớp vào payload với key lophoc
        data.lophoc = classCodeInput.value;
        
        // Gán giá trị hệ đào tạo vào payload với key training_system
        data.training_system = trainingSystemSelect.value;
        
        // Xóa trường không cần thiết để tránh gửi dư thừa
        delete data.class_code;

        data.miengiam = data.miengiam || 'khong_mien_giam';
        data.doituong = data.doituong || 'khong_mo_coi';
        data.trang_thai = 'dang_xu_ly';
        
        // Reset nội dung thông báo và style
        messageContainer.textContent = '';
        messageContainer.className = 'mt-4 text-center text-sm font-bold';
        
        try {
            const response = await fetch('https://saigonginh.pythonanywhere.com/vayvon/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            });
            
            if (response.ok) {
                const result = await response.json();
                console.log('Success:', result);
                messageContainer.textContent = 'Bạn đã đăng ký thành công Giấy xác nhận vay vốn. Vui lòng đến phòng tuyển sinh sau 1-3 ngày làm việc để nhận giấy nhé.';
                messageContainer.classList.add('text-green-600');
                
                // Reset form sau khi gửi thành công
                loanForm.reset();
                
                // Cần gọi lại hàm generateClassCode để điền lại giá trị ban đầu cho class_code
                generateClassCode();
                
            } else {
                const errorData = await response.json();
                console.error('Error:', errorData);
                messageContainer.textContent = 'Đăng ký thất bại. Vui lòng kiểm tra lại thông tin và thử lại.';
                messageContainer.classList.add('text-red-600');
            }
        } catch (error) {
            console.error('Network or server error:', error);
            messageContainer.textContent = 'Có lỗi xảy ra. Vui lòng thử lại sau.';
            messageContainer.classList.add('text-red-600');
        }
    });
});
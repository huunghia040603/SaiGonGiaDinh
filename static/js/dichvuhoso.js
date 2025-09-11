const checkVayVon = document.getElementById('check-vayvon');
const vayvonOptions = document.getElementById('vayvon-options');
const mienGiam = document.getElementById('mien_giam');
const doiTuong = document.getElementById('doi_tuong');
const mainForm = document.getElementById('mainForm');
const messageContainer = document.getElementById('messageContainer');

checkVayVon.addEventListener('change', () => {
    if (checkVayVon.checked) {
        vayvonOptions.classList.remove('hidden');
        mienGiam.disabled = false;
        doiTuong.disabled = false;
    } else {
        vayvonOptions.classList.add('hidden');
        mienGiam.disabled = true;
        doiTuong.disabled = true;
    }
});

// Bản đồ ánh xạ tên ngành sang mã viết tắt
const majorCodes = {
    'Kế toán doanh nghiệp': 'KTDN',
    'Quản trị kinh doanh': 'QTKD',
    'Tài chính ngân hàng': 'TCNH',
    'Thương mại điện tử': 'TMDDT',
    'Logistic': 'LOG',
    'Thú y': 'TY',
    'Công nghệ thông tin': 'CNTT',
    'Công nghệ ô tô': 'CNOTO',
    'Công nghệ thực phẩm': 'CNTP',
    'Dược': 'DUOC',
    'Điều dưỡng': 'DD',
    'Y sĩ đa khoa': 'YS',
    'Kỹ thuật phục hình răng': 'PTR',
    'Kỹ thuật phục hồi chức năng': 'PHCN',
    'Y học cổ truyền': 'YHCT',
    'Du lịch': 'DL',
    'Ngôn ngữ Anh': 'NNA',
    'Luật dịch vụ pháp lý': 'LDS',
    'Sư phạm mầm non': 'SPMN',
};

function updateClassInfo() {
    const major = document.getElementById('major').value;
    const trainingCourse = document.getElementById('training_course').value;
    const classInfoDiv = document.getElementById('class_info');
    const classNameInput = document.getElementById('class_name');
    
    const startYear = parseInt(trainingCourse.split(' ')[0]);
    const yearCode = startYear - 2014;
    const majorCode = majorCodes[major] || '';
    
    let classCode = '';

    if (yearCode > 0 && majorCode) {
        classCode = `K${yearCode}-${majorCode}`;
    }

    classInfoDiv.textContent = classCode;
    classNameInput.value = classCode;
}

document.getElementById('major').addEventListener('change', updateClassInfo);
document.getElementById('training_course').addEventListener('change', updateClassInfo);

document.addEventListener('DOMContentLoaded', updateClassInfo);

mainForm.addEventListener('submit', async (e) => {
    e.preventDefault(); // Ngăn chặn hành vi gửi form mặc định

    // Thu thập dữ liệu từ các checkbox
    const services = Array.from(document.querySelectorAll('input[name="services"]:checked'))
        .map(checkbox => checkbox.value);
    
    // Tạo đối tượng dữ liệu phù hợp với JSON body
    const formData = {
        giay_chung_nhan_sv: services.includes('Giấy chứng nhận sinh viên'),
        giay_hoan_nvqs: services.includes('Giấy hoãn nghĩa vụ quân sự'),
        yeu_cau_vay_von: services.includes('Giấy xác nhận vay vốn'),
        full_name: document.getElementById('full_name').value,
        date_of_birth: document.getElementById('date_of_birth').value,
        gender: document.getElementById('gender').value,
        place_of_birth: document.getElementById('place_of_birth').value,
        cccd: document.getElementById('cccd').value,
        cccd_issue_date: document.getElementById('cccd_issue_date').value,
        permanent_residence: document.getElementById('permanent_residence').value,
        major: document.getElementById('major').value,
        lophoc: document.getElementById('class_name').value,
        training_course: document.getElementById('training_course').value,
        so_luong_ban: document.getElementById('number_of_copies').value,
        // Thêm trường email
        email: document.getElementById('email').value,
        // Thêm các trường dữ liệu cho vay vốn nếu được chọn
        mien_giam: document.getElementById('check-vayvon').checked ? document.getElementById('mien_giam').value : null,
        doi_tuong: document.getElementById('check-vayvon').checked ? document.getElementById('doi_tuong').value : null,
    };
    
    try {
        const response = await fetch('https://saigongiadinh.pythonanywhere.com/hoso/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(formData),
        });

        const result = await response.json();
        
        if (response.ok) {
            // Cập nhật tin nhắn thành công để bao gồm mã hồ sơ
            const maHoSo = result.ma_ho_so;
            messageContainer.innerHTML = `Bạn đã đăng ký thành công. Mã hồ sơ của bạn là: <strong>${maHoSo}</strong>. <br>Bạn hãy nhớ mã hồ sơ này để tra tiến độ hồ sơ đang xử lý. <br>Chờ nhà trường 1-2 ngày để xét duyệt nhé`;
            messageContainer.className = 'mt-4 text-center text-sm font-bold text-green-600';
            mainForm.reset(); // Xóa form sau khi gửi thành công
            updateClassInfo();
        } else {
            messageContainer.textContent = `Lỗi: ${result.message || 'Gửi dữ liệu không thành công.'}`;
            messageContainer.className = 'mt-4 text-center text-sm font-bold text-red-600';
        }
    } catch (error) {
        console.error('Lỗi khi gửi dữ liệu:', error);
        messageContainer.textContent = 'Đã xảy ra lỗi khi kết nối đến máy chủ.';
        messageContainer.className = 'mt-4 text-center text-sm font-bold text-red-600';
    }
});
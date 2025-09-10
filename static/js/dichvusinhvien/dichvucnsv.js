// // Lắng nghe sự kiện khi toàn bộ trang đã tải xong
// document.addEventListener('DOMContentLoaded', () => {

//     // Lấy tham chiếu đến form đăng ký bằng ID
//     const form = document.getElementById('tourForm');
    
//     // Kiểm tra xem form có tồn tại không
//     if (form) {
//         // Thêm một message container để hiển thị kết quả
//         const messageContainer = document.createElement('div');
//         messageContainer.id = 'message-container';
//         messageContainer.className = 'mt-4 p-3 rounded-md text-center text-sm font-medium';
//         form.parentNode.insertBefore(messageContainer, form.nextSibling);

//         // Lắng nghe sự kiện 'submit' của form
//         form.addEventListener('submit', async (event) => {
//             // Ngăn chặn hành vi gửi form mặc định của trình duyệt
//             event.preventDefault();

//             // Lấy các giá trị từ form
//             const formData = new FormData(form);
//             const payload = {
//                 full_name: formData.get('full_name'),
//                 date_of_birth: formData.get('date_of_birth'),
//                 gender: formData.get('gender'),
//                 place_of_birth: formData.get('place_of_birth'),
//                 cccd: formData.get('cccd'),
//                 cccd_issue_date: formData.get('cccd_issue_date'),
//                 permanent_residence: formData.get('permanent_residence'),
//                 major: formData.get('major'),
//                 training_level: formData.get('training_level'),
//                 training_course: formData.get('training_course'),
//                 number_of_copies: parseInt(formData.get('number_of_copies'), 10), // Chuyển đổi sang số nguyên
//             };

//             // URL của API
//             const apiUrl = 'https://saigongiadinh.pythonanywhere.com/xnsv/';

//             // Cập nhật trạng thái UI để báo cho người dùng biết đang xử lý
//             const submitButton = form.querySelector('button[type="submit"]');
//             submitButton.disabled = true;
//             submitButton.innerHTML = 'Đang gửi...';
//             messageContainer.textContent = '';
//             messageContainer.className = 'mt-4 p-3 rounded-md text-center text-sm font-medium';

//             try {
//                 // Gửi yêu cầu POST tới API sử dụng fetch
//                 const response = await fetch(apiUrl, {
//                     method: 'POST',
//                     headers: {
//                         'Content-Type': 'application/json',
//                     },
//                     body: JSON.stringify(payload),
//                 });

//                 // Kiểm tra xem phản hồi có thành công không (status code 200-299)
//                 if (response.ok) {
//                     const result = await response.json();
//                     messageContainer.textContent = 'Bạn đã đăng ký thành công Giấy chứng nhận sinh viên. Vui lòng đến phòng tuyển sinh sau 1-3 ngày làm việc để nhận giấy nhé.';
//                     messageContainer.classList.add('bg-green-100', 'text-green-700');
//                     console.log('Đăng ký thành công:', result);
//                     form.reset(); // Đặt lại form sau khi gửi thành công
//                 } else {
//                     const errorData = await response.json();
//                     messageContainer.textContent = `Gửi thất bại: ${errorData.message || 'Lỗi không xác định'}`;
//                     messageContainer.classList.add('bg-red-100', 'text-red-700');
//                     console.error('Lỗi khi gửi:', errorData);
//                 }
//             } catch (error) {
//                 // Xử lý lỗi khi kết nối hoặc yêu cầu thất bại
//                 messageContainer.textContent = `Đã xảy ra lỗi: ${error.message}`;
//                 messageContainer.classList.add('bg-red-100', 'text-red-700');
//                 console.error('Lỗi kết nối:', error);
//             } finally {
//                 // Luôn khôi phục lại trạng thái của nút Gửi
//                 submitButton.disabled = false;
//                 submitButton.innerHTML = 'Gửi thông tin';
//             }
//         });
//     }
// });


// Lắng nghe sự kiện khi toàn bộ trang đã tải xong
document.addEventListener('DOMContentLoaded', () => {

    // Ánh xạ khóa học sang tên lớp tương ứng
    const courseToClassMap = {
        '2025 - 2028': 'K11',
        '2024 - 2027': 'K10',
        '2023 - 2026': 'K9',
        '2022 - 2025': 'K8'
    };

    // Ánh xạ tên ngành học sang viết tắt
    const majorToAbbreviationMap = {
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

    // Lấy tham chiếu đến các phần tử cần thiết
    const form = document.getElementById('tourForm');
    const majorSelect = document.getElementById('major');
    const trainingCourseSelect = document.getElementById('training_course');
    const classInfoDiv = document.getElementById('class_info');
    const classNameInput = document.getElementById('class_name');

    // Hàm để tính toán và cập nhật tên lớp học
    const updateClassInfo = () => {
        const selectedMajor = majorSelect.value;
        const selectedCourse = trainingCourseSelect.value;

        const majorAbbreviation = majorToAbbreviationMap[selectedMajor] || '';
        const classPrefix = courseToClassMap[selectedCourse] || '';

        const fullClassName = `${classPrefix}-${majorAbbreviation}`;
        
        classInfoDiv.textContent = fullClassName;
        classNameInput.value = fullClassName;
    };

    // Lắng nghe sự kiện thay đổi của các trường ngành học và khóa đào tạo
    if (majorSelect && trainingCourseSelect) {
        majorSelect.addEventListener('change', updateClassInfo);
        trainingCourseSelect.addEventListener('change', updateClassInfo);
        // Cập nhật lần đầu tiên khi trang tải xong
        updateClassInfo();
    }

    // Kiểm tra xem form có tồn tại không
    if (form) {
        // Thêm một message container để hiển thị kết quả
        const messageContainer = document.createElement('div');
        messageContainer.id = 'message-container';
        messageContainer.className = 'mt-4 p-3 rounded-md text-center text-sm font-medium';
        form.parentNode.insertBefore(messageContainer, form.nextSibling);

        // Lắng nghe sự kiện 'submit' của form
        form.addEventListener('submit', async (event) => {
            // Ngăn chặn hành vi gửi form mặc định của trình duyệt
            event.preventDefault();

            // Lấy các giá trị từ form
            const formData = new FormData(form);
            const payload = {
                full_name: formData.get('full_name'),
                date_of_birth: formData.get('date_of_birth'),
                gender: formData.get('gender'),
                place_of_birth: formData.get('place_of_birth'),
                cccd: formData.get('cccd'),
                cccd_issue_date: formData.get('cccd_issue_date'),
                permanent_residence: formData.get('permanent_residence'),
                major: formData.get('major'),
                training_system: formData.get('training_system'), // Thêm trường training_system
                training_level: formData.get('training_level'),
                training_course: formData.get('training_course'),
                class_name: formData.get('class_name'), // Thêm trường lớp học đã được tính toán
                number_of_copies: parseInt(formData.get('number_of_copies'), 10), // Chuyển đổi sang số nguyên
            };

            // URL của API
            const apiUrl = 'https://saigongiadinh.pythonanywhere.com/xnsv/';

            // Cập nhật trạng thái UI để báo cho người dùng biết đang xử lý
            const submitButton = form.querySelector('button[type="submit"]');
            submitButton.disabled = true;
            submitButton.innerHTML = 'Đang gửi...';
            messageContainer.textContent = '';
            messageContainer.className = 'mt-4 p-3 rounded-md text-center text-sm font-medium';

            try {
                // Gửi yêu cầu POST tới API sử dụng fetch
                const response = await fetch(apiUrl, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(payload),
                });

                // Kiểm tra xem phản hồi có thành công không (status code 200-299)
                if (response.ok) {
                    const result = await response.json();
                    messageContainer.textContent = 'Bạn đã đăng ký thành công Giấy chứng nhận sinh viên. Vui lòng đến phòng tuyển sinh sau 1-3 ngày làm việc để nhận giấy nhé.';
                    messageContainer.classList.add('bg-green-100', 'text-green-700');
                    console.log('Đăng ký thành công:', result);
                    form.reset(); // Đặt lại form sau khi gửi thành công
                } else {
                    const errorData = await response.json();
                    messageContainer.textContent = `Gửi thất bại: ${errorData.message || 'Lỗi không xác định'}`;
                    messageContainer.classList.add('bg-red-100', 'text-red-700');
                    console.error('Lỗi khi gửi:', errorData);
                }
            } catch (error) {
                // Xử lý lỗi khi kết nối hoặc yêu cầu thất bại
                messageContainer.textContent = `Đã xảy ra lỗi: ${error.message}`;
                messageContainer.classList.add('bg-red-100', 'text-red-700');
                console.error('Lỗi kết nối:', error);
            } finally {
                // Luôn khôi phục lại trạng thái của nút Gửi
                submitButton.disabled = false;
                submitButton.innerHTML = 'Gửi thông tin';
            }
        });
    }
});
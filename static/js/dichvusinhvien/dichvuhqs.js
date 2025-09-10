// Lắng nghe sự kiện khi toàn bộ trang đã tải xong
document.addEventListener('DOMContentLoaded', () => {

    // Lấy tham chiếu đến form đăng ký bằng ID
    const form = document.getElementById('tourForm');
    
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
                training_level: formData.get('training_level'),
                training_course: formData.get('training_course'),
                number_of_copies: parseInt(formData.get('number_of_copies'), 10), // Chuyển đổi sang số nguyên
            };

            // URL của API
            const apiUrl = 'https://saigongiadinh.pythonanywhere.com/cnsv/';

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
                    messageContainer.textContent = 'Bạn đã đăng ký thành công Giấy xác nhận tạm hoãn nghĩa vụ quân sự. Vui lòng đến phòng tuyển sinh sau 1-3 ngày làm việc để nhận giấy nhé.';
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

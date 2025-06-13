// /static/js/notification_badge.js
document.addEventListener('DOMContentLoaded', function() {
    const notificationCountBadge = document.getElementById('notificationCountBadge');
    const unreadNotificationsApiUrl = 'https://saigongiadinh.pythonanywhere.com/unread_notifications/'; // URL API

    // Ẩn badge ngay lập tức khi DOM được tải để tránh hiển thị giá trị không chính xác ban đầu
    if (notificationCountBadge) {
        notificationCountBadge.style.display = 'none'; 
    }

    function getAuthToken() {
        // Ưu tiên lấy token của giáo viên nếu có
        const teacherToken = localStorage.getItem('teacherAuthToken');
        if (teacherToken) {
            console.log('DEBUG (JS): Đang sử dụng teacherAuthToken.');
            return teacherToken;
        }
        // Nếu không có token giáo viên, lấy token thông thường
        console.log('DEBUG (JS): Không tìm thấy teacherAuthToken, đang sử dụng authToken thông thường.');
        return localStorage.getItem('authToken'); 
    }

    async function fetchNotificationCount() {
        try {
            const token = getAuthToken();
            console.log('DEBUG (JS): Token Authorization:', token ? 'Exist' : 'Not Exist'); // Log token để kiểm tra
            
            const headers = {
                'Content-Type': 'application/json',
                // Chỉ thêm header Authorization nếu có token
                ...(token && { 'Authorization': `Token ${token}` })
            };
            console.log('DEBUG (JS): Request Headers:', headers); // Log headers

            const response = await fetch(unreadNotificationsApiUrl, { headers: headers });

            console.log('DEBUG (JS): Raw Response:', response); // Log đối tượng response thô

            if (!response.ok) {
                // Ném lỗi nếu phản hồi không thành công
                const errorText = await response.text(); // Đọc nội dung lỗi nếu có
                console.error('DEBUG (JS): Lỗi phản hồi API:', response.status, errorText); // Log lỗi chi tiết
                throw new Error(`Lỗi HTTP! Trạng thái: ${response.status} - ${errorText}`);
            }

            const data = await response.json();
            console.log('DEBUG (JS): Data từ API (JSON):', data);
            console.log('DEBUG (JS): Data từ API (JSON)11:', data.count); // Log toàn bộ dữ liệu JSON
            
            const count = data.count; // Lấy số lượng thông báo chưa đọc
            console.log('DEBUG (JS): Số lượng thông báo chưa đọc (count):', count); // Log giá trị count

            // Cập nhật huy hiệu dựa trên số lượng thông báo
            if (notificationCountBadge) { // Thêm kiểm tra này để tránh lỗi "Cannot read properties of null"
                if (count > 0) { // Chỉ hiển thị nếu số lượng lớn hơn 0
                    notificationCountBadge.textContent = count;
                    notificationCountBadge.style.display = 'flex'; // Hiển thị
                } else {
                    notificationCountBadge.textContent = '';
                    notificationCountBadge.style.display = 'none'; // Ẩn
                }
            } else {
                console.error("DEBUG (JS): Không tìm thấy phần tử 'notificationCountBadge' trong DOM.");
            }

        } catch (error) {
            console.error('DEBUG (JS): Lỗi khi tải số lượng thông báo chưa đọc:', error);
            // Trong trường hợp lỗi, đảm bảo huy hiệu bị ẩn
            if (notificationCountBadge) { // Thêm kiểm tra này
                notificationCountBadge.style.display = 'none';
            }
        }
    }

    // Gọi hàm fetchNotificationCount sau 3 giây
    setTimeout(() => {
        fetchNotificationCount();
    }, 100); // 3000 milliseconds = 3 giây

    // (Tùy chọn) Tự động làm mới số lượng thông báo định kỳ
    // setInterval(fetchNotificationCount, 5 * 60 * 1000);
});
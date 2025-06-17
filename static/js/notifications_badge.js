// /static/js/notification_badge.js
document.addEventListener('DOMContentLoaded', function() {
    const notificationCountBadge = document.getElementById('notificationCountBadge');
    const unreadNotificationsApiUrl = 'https://saigongiadinh.pythonanywhere.com/unread_notifications/'; // URL API

    // Ẩn badge ngay lập tức khi DOM được tải để tránh hiển thị giá trị không chính xác ban đầu
    if (notificationCountBadge) {
        notificationCountBadge.style.display = 'none'; 
    }

    // Hàm lấy token được điều chỉnh để nhất quán với các script khác
    function getAuthToken() {
        const currentPath = window.location.pathname;
        let token = null;

        // Nếu đường dẫn là của giảng viên/cán bộ, lấy 'authToken'
        if (currentPath.startsWith('/sggd/gv/manage')) {
            token = localStorage.getItem('authToken');
          
        } 
        // Nếu đường dẫn là của quản trị viên, lấy 'adminAuthToken'
        else if (currentPath.startsWith('/sggd/qtv/admin')) {
            token = localStorage.getItem('adminAuthToken');
           
        } 
        // Nếu không khớp đường dẫn nào, log và trả về null
        else {
            console.log("DEBUG (JS - Notification): Không khớp đường dẫn, không lấy token cụ thể.");
        }
        return token;
    }

    async function fetchNotificationCount() {
        try {
            const token = getAuthToken();
           
            
            // Nếu không có token, không thực hiện gọi API
            if (!token) {
                
                if (notificationCountBadge) {
                    notificationCountBadge.textContent = '0';
                    notificationCountBadge.style.display = 'none';
                }
                return;
            }

            const headers = {
                'Content-Type': 'application/json',
                'Authorization': `Token ${token}` // Chỉ thêm header Authorization nếu có token
            };
            

            const response = await fetch(unreadNotificationsApiUrl, { headers: headers });

            console.log('DEBUG (JS - Notification): Raw Response:', response);

            if (!response.ok) {
                const errorText = await response.text();
                console.error('DEBUG (JS - Notification): Lỗi phản hồi API:', response.status, errorText);
                throw new Error(`Lỗi HTTP! Trạng thái: ${response.status} - ${errorText}`);
            }

            const data = await response.json();
           
            // Bạn có thể cần kiểm tra cấu trúc chính xác của `data` nếu `data.count` không phải lúc nào cũng là số
           
            const count = data.count; // Lấy số lượng thông báo chưa đọc
            console.log('DEBUG (JS - Notification): Số lượng thông báo chưa đọc (count):', count);

            if (notificationCountBadge) {
                if (count > 0) {
                    notificationCountBadge.textContent = count;
                    notificationCountBadge.style.display = 'flex'; // Sử dụng flex để căn giữa nếu cần
                } else {
                    notificationCountBadge.textContent = '';
                    notificationCountBadge.style.display = 'none';
                }
            } else {
                console.error("DEBUG (JS - Notification): Không tìm thấy phần tử 'notificationCountBadge' trong DOM.");
            }

        } catch (error) {
            
            if (notificationCountBadge) {
                notificationCountBadge.style.display = 'none';
            }
        }
    }

    // Tùy chỉnh độ trễ nếu cần thiết, 100ms thường là đủ sau khi DOM tải
    setTimeout(() => {
        fetchNotificationCount();
    }, 100); 

    // (Tùy chọn) Tự động làm mới số lượng thông báo định kỳ (ví dụ: mỗi 5 phút)
    // setInterval(fetchNotificationCount, 5 * 60 * 1000); 
});
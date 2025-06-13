document.addEventListener('DOMContentLoaded', function() {
    const notificationsTableBody = document.querySelector('#notificationsTable tbody');
    const noNotificationsMessage = document.getElementById('noNotificationsMessage');
    const listNotificationsApiUrl = 'https://saigongiadinh.pythonanywhere.com/notifications/'; // API để lấy danh sách thông báo
    const markNotificationApiUrl = 'https://saigongiadinh.pythonanywhere.com/mark_notifications/'; // API để đánh dấu đã đọc/chưa đọc

    // Hàm lấy token xác thực (có thể lấy từ notification_badge.js hoặc một file chung)
    function getAuthToken() {
        const teacherToken = localStorage.getItem('teacherAuthToken');
        if (teacherToken) {
            console.log('DEBUG (JS): Đang sử dụng teacherAuthToken.');
            return teacherToken;
        }
        console.log('DEBUG (JS): Không tìm thấy teacherAuthToken, đang sử dụng authToken thông thường.');
        return localStorage.getItem('authToken'); 
    }

    // Hàm gọi API PATCH để đánh dấu thông báo đã đọc/chưa đọc
    async function markNotificationAsRead(notificationId, isRead) {
        try {
            const token = getAuthToken();
            if (!token) {
                console.error("DEBUG (JS): Không có token xác thực. Không thể đánh dấu thông báo.");
                alert("Bạn cần đăng nhập để thực hiện hành động này.");
                return false; // Trả về false để có thể xử lý lỗi
            }

            const headers = {
                'Content-Type': 'application/json',
                'Authorization': `Token ${token}`
            };

            const body = JSON.stringify({
                notification_id: notificationId,
                is_read: isRead
            });

            console.log(`DEBUG (JS): Đang gửi PATCH tới ${markNotificationApiUrl} với ID: ${notificationId}, is_read: ${isRead}`);
            const response = await fetch(markNotificationApiUrl, {
                method: 'PATCH',
                headers: headers,
                body: body
            });

            if (!response.ok) {
                const errorData = await response.json();
                console.error('DEBUG (JS): Lỗi khi đánh dấu thông báo:', response.status, errorData);
                throw new Error(`Lỗi HTTP! Trạng thái: ${response.status} - ${errorData.detail || 'Không xác định'}`);
            }

            const result = await response.json();
            console.log('DEBUG (JS): Thông báo đã được đánh dấu thành công:', result);

            // Cập nhật lại số lượng thông báo chưa đọc trên badge sau khi thay đổi trạng thái
            // Giả sử fetchNotificationCount() được expose ra global (ví dụ: window.refreshNotificationBadge = fetchNotificationCount;)
            // hoặc bạn có thể gọi lại hàm fetchNotifications() nếu muốn toàn bộ bảng được load lại
            if (typeof window.fetchNotificationCount === 'function') {
                 window.fetchNotificationCount(); // Gọi hàm làm mới badge
            } else {
                console.warn("DEBUG (JS): Không tìm thấy window.fetchNotificationCount. Badge thông báo có thể không được cập nhật.");
                // Hoặc bạn có thể gọi fetchNotifications() để tải lại toàn bộ bảng và cập nhật badge
                // fetchNotifications(); 
            }
            return true;
        } catch (error) {
            console.error('DEBUG (JS): Lỗi khi gọi API đánh dấu thông báo:', error);
            alert(`Lỗi khi cập nhật trạng thái thông báo: ${error.message}`);
            return false;
        }
    }

    // Function to fetch and display notifications from the API
    async function fetchNotifications() {
        try {
            const token = getAuthToken();
            const headers = {
                'Content-Type': 'application/json',
                ...(token && { 'Authorization': `Token ${token}` })
            };

            const response = await fetch(listNotificationsApiUrl, { headers: headers });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const notifications = await response.json();

            notificationsTableBody.innerHTML = ''; // Clear existing rows

            if (notifications.length === 0) {
                noNotificationsMessage.classList.remove('hidden');
            } else {
                noNotificationsMessage.classList.add('hidden');
                notifications.forEach(notification => {
                    const row = notificationsTableBody.insertRow();
                    row.dataset.notificationId = notification.id; // Lưu ID vào dataset của hàng

                    const idCell = row.insertCell();
                    const titleCell = row.insertCell();
                    const contentCell = row.insertCell();
                    const readStatusCell = row.insertCell(); // Cột mới cho checkbox

                    idCell.textContent = notification.id;
                    titleCell.textContent = notification.title;
                    contentCell.textContent = notification.content;

                    // Tạo checkbox
                    const checkbox = document.createElement('input');
                    checkbox.type = 'checkbox';
                    checkbox.classList.add('read-checkbox');
                    checkbox.checked = notification.is_read_by_user; // Giả định API trả về trường này
                    checkbox.dataset.notificationId = notification.id; // Lưu ID vào dataset của checkbox

                    // Gắn sự kiện change cho checkbox
                    checkbox.addEventListener('change', async function() {
                        const success = await markNotificationAsRead(
                            parseInt(this.dataset.notificationId),
                            this.checked
                        );
                        if (!success) {
                            // Nếu API gọi lỗi, đưa checkbox về trạng thái cũ
                            this.checked = !this.checked; 
                        }
                    });

                    readStatusCell.appendChild(checkbox);

                    // Add Tailwind CSS classes for styling
                    idCell.classList.add('border', 'px-4', 'py-2', 'text-center');
                    titleCell.classList.add('border', 'px-4', 'py-2');
                    contentCell.classList.add('border', 'px-4', 'py-2');
                    readStatusCell.classList.add('border', 'px-4', 'py-2', 'text-center'); // Căn giữa checkbox
                });
            }
        } catch (error) {
            console.error('Error fetching notifications:', error);
            notificationsTableBody.innerHTML = `<tr><td colspan="4" class="text-center text-red-500 py-4">
                                                    Không thể tải thông báo. Vui lòng thử lại sau.
                                                </td></tr>`;
            noNotificationsMessage.classList.add('hidden');
        }
    }

    // Gọi hàm để lấy và hiển thị thông báo khi trang tải
    fetchNotifications();
});
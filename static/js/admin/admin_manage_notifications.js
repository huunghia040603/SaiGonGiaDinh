document.addEventListener('DOMContentLoaded', () => {
    const notificationsContainer = document.getElementById('notificationsContainer');
    const editNotificationSection = document.getElementById('editNotificationSection');
    const editNotificationForm = document.getElementById('editNotificationForm');
    const messageDiv = document.getElementById('message');

    // Edit form elements
    const editNotificationId = document.getElementById('editNotificationId');
    const editTitle = document.getElementById('editTitle');
    const editContent = document.getElementById('editContent');
    const editStartDate = document.getElementById('editStartDate');
    const editEndDate = document.getElementById('editEndDate');
    const editTargetUsers = document.getElementById('editTargetUsers');
    const editSpecificUsersContainer = document.getElementById('editSpecificUsersContainer');
    const editSpecificUsers = document.getElementById('editSpecificUsers');
    const editNotificationType = document.getElementById('editNotificationType');
    const editIsActive = document.getElementById('editIsActive');
    const editRequiresAcknowledgement = document.getElementById('editRequiresAcknowledgement');

    const API_BASE_URL = 'https://saigongiadinh.pythonanywhere.com/api/admin/notifications/';

    // Hàm hiển thị thông báo trạng thái
    function showMessage(msg, type) {
        messageDiv.textContent = msg;
        messageDiv.className = `message ${type}`;
        messageDiv.style.display = 'block';
        setTimeout(() => {
            messageDiv.style.display = 'none';
        }, 5000); // Ẩn thông báo sau 5 giây
    }

    // Hàm định dạng ngày giờ cho input type="datetime-local"
    function formatDateTimeLocal(isoString) {
        if (!isoString) return '';
        const date = new Date(isoString);
        // Định dạng YYYY-MM-DDTHH:mm
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        return `${year}-${month}-${day}T${hours}:${minutes}`;
    }

    // Hàm tải danh sách thông báo
    async function loadNotifications() {
        notificationsContainer.innerHTML = '<p style="text-align: center; margin-top: 20px;">Đang tải thông báo...</p>';
        try {
            const response = await fetch(API_BASE_URL, {
                headers: {
                    // **QUAN TRỌNG:** Thêm token xác thực ở đây nếu cần
                    // Ví dụ: 'Authorization': 'Bearer YOUR_AUTH_TOKEN'
                }
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(`Lỗi tải thông báo: ${response.status} ${response.statusText} - ${JSON.stringify(errorData)}`);
            }
            const notifications = await response.json();
            displayNotifications(notifications);
        } catch (error) {
            console.error('Lỗi khi tải thông báo:', error);
            notificationsContainer.innerHTML = `<p style="color: red; text-align: center;">Không thể tải thông báo: ${error.message}</p>`;
            showMessage('Không thể tải thông báo. Vui lòng kiểm tra console để biết chi tiết.', 'error');
        }
    }

    // Hàm hiển thị danh sách thông báo
    function displayNotifications(notifications) {
        if (notifications.length === 0) {
            notificationsContainer.innerHTML = '<p style="text-align: center;">Chưa có thông báo nào.</p>';
            return;
        }

        notificationsContainer.innerHTML = '';
        notifications.forEach(notification => {
            const notificationItem = document.createElement('div');
            notificationItem.className = 'notification-item';
            notificationItem.innerHTML = `
                <div>
                    <h3>${notification.title}</h3>
                    <p><strong>Đối tượng:</strong> ${notification.target_users_display || notification.target_users}</p>
                    <p><strong>Loại:</strong> ${notification.notification_type_display || notification.notification_type}</p>
                    <p><strong>Ngày bắt đầu:</strong> ${new Date(notification.start_date).toLocaleString('vi-VN')}</p>
                    ${notification.end_date ? `<p><strong>Ngày kết thúc:</strong> ${new Date(notification.end_date).toLocaleString('vi-VN')}</p>` : ''}
                    <p><strong>Hoạt động:</strong> ${notification.is_active ? 'Có' : 'Không'}</p>
                </div>
                <div class="notification-actions">
                    <button class="edit" data-id="${notification.id}">Sửa</button>
                    <button class="delete" data-id="${notification.id}">Xóa</button>
                </div>
            `;
            notificationsContainer.appendChild(notificationItem);
        });

        // Gán sự kiện cho các nút Sửa và Xóa
        document.querySelectorAll('.edit').forEach(button => {
            button.addEventListener('click', (e) => loadNotificationForEdit(e.target.dataset.id));
        });
        document.querySelectorAll('.delete').forEach(button => {
            button.addEventListener('click', (e) => deleteNotification(e.target.dataset.id));
        });
    }

    // Hàm tải thông báo và điền vào form chỉnh sửa
    async function loadNotificationForEdit(id) {
        try {
            const response = await fetch(`${API_BASE_URL}${id}/`, {
                headers: {
                    // **QUAN TRỌNG:** Thêm token xác thực ở đây nếu cần
                    // Ví dụ: 'Authorization': 'Bearer YOUR_AUTH_TOKEN'
                }
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(`Lỗi tải thông báo để sửa: ${response.status} ${response.statusText} - ${JSON.stringify(errorData)}`);
            }
            const notification = await response.json();

            // Điền dữ liệu vào form
            editNotificationId.value = notification.id;
            editTitle.value = notification.title;
            editContent.value = notification.content;
            editStartDate.value = formatDateTimeLocal(notification.start_date);
            editEndDate.value = formatDateTimeLocal(notification.end_date);
            editTargetUsers.value = notification.target_users;
            editNotificationType.value = notification.notification_type;
            editIsActive.checked = notification.is_active;
            editRequiresAcknowledgement.checked = notification.requires_acknowledgement;

            // Xử lý specific_users
            if (notification.target_users === 'SPECIFIC_USER') {
                editSpecificUsersContainer.style.display = 'block';
                // specific_users từ API là một mảng ID người dùng
                editSpecificUsers.value = notification.specific_users.join(', ');
                editSpecificUsers.setAttribute('required', 'required');
            } else {
                editSpecificUsersContainer.style.display = 'none';
                editSpecificUsers.value = '';
                editSpecificUsers.removeAttribute('required');
            }

            editNotificationSection.style.display = 'block'; // Hiển thị form chỉnh sửa
            window.scrollTo({ top: editNotificationSection.offsetTop, behavior: 'smooth' }); // Cuộn xuống form
        } catch (error) {
            console.error('Lỗi khi tải thông báo để sửa:', error);
            showMessage('Không thể tải thông báo để chỉnh sửa. Vui lòng thử lại.', 'error');
        }
    }

    // Xử lý sự kiện thay đổi của select targetUsers trong form sửa
    editTargetUsers.addEventListener('change', () => {
        if (editTargetUsers.value === 'SPECIFIC_USER') {
            editSpecificUsersContainer.style.display = 'block';
            editSpecificUsers.setAttribute('required', 'required');
        } else {
            editSpecificUsersContainer.style.display = 'none';
            editSpecificUsers.value = ''; // Xóa giá trị khi ẩn
            editSpecificUsers.removeAttribute('required');
        }
    });


    // Gửi dữ liệu cập nhật
    editNotificationForm.addEventListener('submit', async (event) => {
        event.preventDefault();

        const id = editNotificationId.value;
        const data = {
            title: editTitle.value,
            content: editContent.value,
            start_date: editStartDate.value ? new Date(editStartDate.value).toISOString() : null,
            end_date: editEndDate.value ? new Date(editEndDate.value).toISOString() : null,
            target_users: editTargetUsers.value,
            notification_type: editNotificationType.value,
            is_active: editIsActive.checked,
            requires_acknowledgement: editRequiresAcknowledgement.checked
        };

        if (data.target_users === 'SPECIFIC_USER') {
            const specificUsersValue = editSpecificUsers.value.trim();
            if (specificUsersValue) {
                data.specific_users = specificUsersValue.split(',').map(id => parseInt(id.trim())).filter(id => !isNaN(id));
                if (data.specific_users.length === 0) {
                    showMessage("Bạn phải nhập ít nhất một ID người dùng cụ thể khi chọn 'Người dùng cụ thể'.", 'error');
                    return;
                }
            } else {
                showMessage("Bạn phải nhập ít nhất một ID người dùng cụ thể khi chọn 'Người dùng cụ thể'.", 'error');
                return;
            }
        } else {
            data.specific_users = []; // Đảm bảo gửi mảng rỗng nếu không phải SPECIFIC_USER
        }

        try {
            const response = await fetch(`${API_BASE_URL}${id}/`, {
                method: 'PUT', // Hoặc PATCH nếu bạn chỉ muốn gửi các trường thay đổi
                headers: {
                    'Content-Type': 'application/json',
                    // **QUAN TRỌNG:** Thêm token xác thực ở đây
                    // Ví dụ: 'Authorization': 'Bearer YOUR_AUTH_TOKEN'
                },
                body: JSON.stringify(data)
            });

            if (!response.ok) {
                const errorData = await response.json();
                console.error('Lỗi khi cập nhật thông báo:', errorData);
                let errorMessage = `Lỗi ${response.status}: ${response.statusText}. `;
                if (errorData) {
                    if (errorData.non_field_errors) {
                        errorMessage += errorData.non_field_errors.join(', ');
                    } else {
                        errorMessage += Object.values(errorData).flat().join(', ');
                    }
                }
                showMessage(`Cập nhật thất bại: ${errorMessage}`, 'error');
                return;
            }

            showMessage('Thông báo đã được cập nhật thành công!', 'success');
            editNotificationSection.style.display = 'none'; // Ẩn form sửa sau khi cập nhật
            loadNotifications(); // Tải lại danh sách thông báo
        } catch (error) {
            console.error('Lỗi mạng hoặc lỗi không xác định khi cập nhật:', error);
            showMessage('Đã xảy ra lỗi khi kết nối đến máy chủ. Vui lòng thử lại.', 'error');
        }
    });

    // Hàm xóa thông báo
    async function deleteNotification(id) {
        if (!confirm('Bạn có chắc chắn muốn xóa thông báo này?')) {
            return;
        }

        try {
            const response = await fetch(`${API_BASE_URL}${id}/`, {
                method: 'DELETE',
                headers: {
                    // **QUAN TRỌNG:** Thêm token xác thực ở đây nếu cần
                    // Ví dụ: 'Authorization': 'Bearer YOUR_AUTH_TOKEN'
                }
            });

            if (!response.ok) {
                const errorData = await response.json();
                console.error('Lỗi khi xóa thông báo:', errorData);
                 let errorMessage = `Lỗi ${response.status}: ${response.statusText}. `;
                if (errorData) {
                    errorMessage += Object.values(errorData).flat().join(', ');
                }
                showMessage(`Xóa thất bại: ${errorMessage}`, 'error');
                return;
            }

            showMessage('Thông báo đã được xóa thành công!', 'success');
            loadNotifications(); // Tải lại danh sách thông báo sau khi xóa
            editNotificationSection.style.display = 'none'; // Ẩn form sửa nếu thông báo đang được sửa bị xóa
        } catch (error) {
            console.error('Lỗi mạng hoặc lỗi không xác định khi xóa:', error);
            showMessage('Đã xảy ra lỗi khi kết nối đến máy chủ. Vui lòng thử lại.', 'error');
        }
    }

    // Tải thông báo khi trang được tải lần đầu
    loadNotifications();
});
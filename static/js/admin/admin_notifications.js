$(document).ready(function() {
    // --- Configuration ---
    const API_BASE_URL = 'https://saigongiadinh.pythonanywhere.com/notifications/'; 
    const API_USERS_URL = 'http://localhost:8000/api/users/';
    const CONTENT_TRUNCATE_LENGTH = 70; // Ngưỡng cắt nội dung

    const TARGET_USERS_OPTIONS = [
        { value: 'ALL', text: 'Tất cả người dùng' },
        { value: 'AUTHENTICATED', text: 'Người dùng đã đăng nhập' },
        { value: 'GUEST', text: 'Khách (chưa đăng nhập)' },
        { value: 'SPECIFIC_USER', text: 'Người dùng cụ thể' }
    ];

    const NOTIFICATION_TYPE_OPTIONS = [
        { value: 'INFO', text: 'Thông tin' },
        { value: 'WARNING', text: 'Cảnh báo' },
        { value: 'ALERT', text: 'Khẩn cấp' }
    ];

    let currentNotificationId = null;

    // --- Helper Functions ---

    function formatDateTimeLocal(dateString) {
        if (!dateString) return '';
        const date = new Date(dateString);
        date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
        return date.toISOString().slice(0, 16);
    }

    function formatDateToDDMMYYYYHHMMSS(dateString) {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        const seconds = String(date.getSeconds()).padStart(2, '0');
        return `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;
    }

    function populateDropdown(selectElementId, optionsArray) {
        const select = $(`#${selectElementId}`);
        select.empty();
        optionsArray.forEach(option => {
            select.append(new Option(option.text, option.value));
        });
    }

    async function loadSpecificUsers() {
        try {
            const response = await fetch(API_USERS_URL);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const users = await response.json();
            const specificUsersSelect = $('#specificUsers');
            specificUsersSelect.empty();
            if (users.length === 0) {
                specificUsersSelect.append(new Option('Không có người dùng nào để chọn', '', true, true));
                specificUsersSelect.prop('disabled', true);
            } else {
                specificUsersSelect.prop('disabled', false);
                users.forEach(user => {
                    specificUsersSelect.append(new Option(user.username || user.email || `User ${user.id}`, user.id));
                });
            }
        } catch (error) {
            console.error('Error loading specific users:', error);
            $('#specificUsers').empty().append(new Option('Lỗi tải người dùng', '', true, true)).prop('disabled', true);
        }
    }

    // Function to show content in a modal
    function showContentModal(title, content) {
        // Create modal HTML if it doesn't exist
        if ($('#contentModal').length === 0) {
            $('body').append(`
                <div class="modal fade" id="contentModal" tabindex="-1" role="dialog" aria-labelledby="contentModalLabel" aria-hidden="true">
                    <div class="modal-dialog modal-lg" role="document">
                        <div class="modal-content">
                            <div class="modal-header">
                                <h5 class="modal-title" id="contentModalLabel"></h5>
                                <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                                    <span aria-hidden="true">&times;</span>
                                </button>
                            </div>
                            <div class="modal-body">
                            </div>
                            <div class="modal-footer">
                                <button type="button" class="btn btn-secondary" data-dismiss="modal">Đóng</button>
                            </div>
                        </div>
                    </div>
                </div>
            `);
        }
        $('#contentModalLabel').text(title);
        $('#contentModal .modal-body').text(content); // Use .text() to prevent XSS if content has HTML
        $('#contentModal').modal('show');

        // Gắn lại sự kiện click cho các nút đóng modal một cách tường minh
        $('#contentModal').find('[data-dismiss="modal"]').off('click').on('click', function() {
            $('#contentModal').modal('hide');
        });
    }

    // --- CRUD Operations ---

    async function fetchNotifications() {
        try {
            const response = await fetch(API_BASE_URL); 
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const notifications = await response.json();
            renderNotifications(notifications);
        } catch (error) {
            console.error('Error fetching notifications:', error);
            alert('Không thể tải danh sách thông báo. Vui lòng kiểm tra console.');
            $('#noNotificationsMessage').show();
            $('#notificationsTable tbody').empty();
        }
    }

    // Render notifications into the table
    function renderNotifications(notifications) {
        const tbody = $('#notificationsTable tbody');
        tbody.empty(); // Clear existing rows

        if (notifications.length === 0) {
            $('#noNotificationsMessage').show();
            return;
        } else {
            $('#noNotificationsMessage').hide();
        }

        notifications.forEach(notification => {
            let displayContent = notification.content;
            let contentCellHtml = '';

            if (notification.content.length > CONTENT_TRUNCATE_LENGTH) {
                displayContent = notification.content.substring(0, CONTENT_TRUNCATE_LENGTH); // Loại bỏ "..." ở đây
                contentCellHtml = `
                    <span class="content-truncated" title="${notification.content}">${displayContent}...</span>
                    <span class="view-more-text" data-id="${notification.id}" data-title="${notification.title}" data-content="${encodeURIComponent(notification.content)}">Xem thêm</span>
                `;
            } else {
                contentCellHtml = displayContent;
            }

            const row = `
                <tr>
                    <td>${notification.id}</td>
                    <td>${notification.title}</td>
                    <td>${contentCellHtml}</td>
                    <td>${formatDateToDDMMYYYYHHMMSS(notification.created_at)}</td>
                    <td>${formatDateToDDMMYYYYHHMMSS(notification.start_date)}</td>
                    <td>${formatDateToDDMMYYYYHHMMSS(notification.end_date)}</td>
                    <td>${notification.target_users_display}</td>
                    <td>${notification.notification_type_display}</td>
                    <td>${notification.is_active ? '<i class="fas fa-check-circle icon-check"></i>' : '<i class="fas fa-times-circle icon-times"></i>'}</td>
                    <td>${notification.requires_acknowledgement ? '<i class="fas fa-check-circle icon-check"></i>' : '<i class="fas fa-times-circle icon-times"></i>'}</td>
                    
                    <td class="action-buttons">
                        <button class="btn btn-sm btn-info edit-btn" data-id="${notification.id}"><i class="fas fa-edit"></i> Sửa</button>
                        <button class="btn btn-sm btn-danger delete-btn" data-id="${notification.id}"><i class="fas fa-trash-alt"></i> Xóa</button>
                    </td>
                </tr>
            `;
            tbody.append(row);
        });

        // Attach click handler for "Xem thêm" text after rendering
        // Thay đổi từ '.view-more-btn' sang '.view-more-text'
        tbody.off('click', '.view-more-text').on('click', '.view-more-text', function() {
            const title = $(this).data('title');
            const content = decodeURIComponent($(this).data('content'));
            showContentModal(title, content);
        });
    }

    $('#notificationForm').on('submit', async function(e) {
        e.preventDefault();

        const title = $('#title').val();
        const content = $('#content').val();
        const startDate = $('#startDate').val();
        const endDate = $('#endDate').val();
        const targetUsers = $('#targetUsers').val();
        const notificationType = $('#notificationType').val();
        const isActive = $('#isActive').prop('checked');
        const requiresAcknowledgement = $('#requiresAcknowledgement').prop('checked');

        let specificUsers = [];
        if (targetUsers === 'SPECIFIC_USER') {
            specificUsers = $('#specificUsers').val() ? $('#specificUsers').val().map(Number) : []; 
        }

        const notificationData = {
            title,
            content,
            start_date: startDate || null, 
            end_date: endDate || null,     
            target_users: targetUsers,
            specific_users: specificUsers.length > 0 ? specificUsers : null,
            notification_type: notificationType,
            is_active: isActive,
            requires_acknowledgement: requiresAcknowledgement
        };

        const method = currentNotificationId ? 'PUT' : 'POST';
        const url = currentNotificationId ? `${API_BASE_URL}${currentNotificationId}/` : API_BASE_URL;

        const saveBtn = $('#saveNotificationBtn');
        saveBtn.prop('disabled', true).html('<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Đang lưu...');

        try {
            const response = await fetch(url, {
                method: method,
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(notificationData)
            });

            if (!response.ok) {
                const errorData = await response.json();
                console.error('API Error:', errorData);
                let errorMessage = 'Đã xảy ra lỗi khi lưu thông báo.';
                if (errorData) {
                    for (const key in errorData) {
                        errorMessage += `\n- ${key}: ${Array.isArray(errorData[key]) ? errorData[key].join(', ') : errorData[key]}`;
                    }
                }
                alert(errorMessage);
                return;
            }

            alert(`Thông báo đã được ${currentNotificationId ? 'cập nhật' : 'tạo'} thành công!`);
            resetForm();
            hideNotificationForm();
            fetchNotifications();
        } catch (error) {
            console.error('Error saving notification:', error);
            alert('Không thể kết nối đến máy chủ API. Vui lòng kiểm tra console.');
        } finally {
            saveBtn.prop('disabled', false).html('Lưu Thông báo');
            if (currentNotificationId) {
                saveBtn.text('Cập nhật Thông báo').removeClass('btn-primary').addClass('btn-success');
            }
        }
    });

    $('#notificationsTable tbody').on('click', '.edit-btn', async function() {
        const id = $(this).data('id');
        try {
            const response = await fetch(`${API_BASE_URL}${id}/`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const notification = await response.json();

            $('#notificationId').val(notification.id);
            $('#title').val(notification.title);
            $('#content').val(notification.content);
            $('#startDate').val(formatDateTimeLocal(notification.start_date));
            $('#endDate').val(formatDateTimeLocal(notification.end_date));
            $('#targetUsers').val(notification.target_users);
            $('#notificationType').val(notification.notification_type);
            $('#isActive').prop('checked', notification.is_active);
            $('#requiresAcknowledgement').prop('checked', notification.requires_acknowledgement);

            if (notification.target_users === 'SPECIFIC_USER') {
                $('#specificUsersGroup').show();
                const selectedUsers = notification.specific_users || [];
                await loadSpecificUsers();
                $('#specificUsers').val(selectedUsers.map(String));
            } else {
                $('#specificUsersGroup').hide();
                $('#specificUsers').val([]);
            }

            currentNotificationId = notification.id;
            $('#form-title').text('Chỉnh sửa');
            $('#saveNotificationBtn').text('Cập nhật Thông báo').removeClass('btn-primary').addClass('btn-success');
            
            showNotificationForm();
            $('html, body').animate({
                scrollTop: $("#notificationFormSection").offset().top
            }, 500);

        } catch (error) {
            console.error('Error fetching notification for edit:', error);
            alert('Không thể tải thông báo để chỉnh sửa.');
        }
    });

    $('#notificationsTable tbody').on('click', '.delete-btn', async function() {
        const id = $(this).data('id');
        if (confirm(`Bạn có chắc chắn muốn xóa thông báo ID: ${id} không? Hành động này không thể hoàn tác.`)) {
            try {
                const response = await fetch(`${API_BASE_URL}${id}/`, {
                    method: 'DELETE',
                    headers: {}
                });

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                alert('Thông báo đã được xóa thành công!');
                fetchNotifications();
            } catch (error) {
                    console.error('Error deleting notification:', error);
                    alert('Không thể xóa thông báo. Vui lòng kiểm tra console.');
            }
        }
    });

    // --- Form Visibility Logic ---
    $('#showNotificationFormBtn').on('click', function() {
        resetForm();
        showNotificationForm();
    });

    $('#cancelFormBtn').on('click', function() {
        resetForm();
        hideNotificationForm();
    });

    function resetForm() {
        $('#notificationForm')[0].reset();
        $('#notificationId').val('');
        currentNotificationId = null;
        $('#form-title').text('Tạo');
        $('#saveNotificationBtn').text('Lưu Thông báo').removeClass('btn-success').addClass('btn-primary');
        $('#specificUsersGroup').hide();
        $('#specificUsers').val([]);
    }

    function showNotificationForm() {
        $('#notificationFormSection').slideDown(400);
        $('#showNotificationFormBtn').hide();
    }

    function hideNotificationForm() {
        $('#notificationFormSection').slideUp(400, function() {
            $('#showNotificationFormBtn').show();
        });
    }

    $('#targetUsers').on('change', function() {
        if ($(this).val() === 'SPECIFIC_USER') {
            $('#specificUsersGroup').slideDown();
        } else {
            $('#specificUsersGroup').slideUp();
            $('#specificUsers').val([]);
        }
    });

    // --- Initialization ---
    populateDropdown('targetUsers', TARGET_USERS_OPTIONS);
    populateDropdown('notificationType', NOTIFICATION_TYPE_OPTIONS);
    loadSpecificUsers();
    fetchNotifications();
    $('#notificationFormSection').hide();
});
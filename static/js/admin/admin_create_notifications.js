document.addEventListener('DOMContentLoaded', () => {
    const notificationForm = document.getElementById('notificationForm');
    const targetUsersSelect = document.getElementById('targetUsers');
    const specificUsersSelectionContainer = document.getElementById('specificUsersSelectionContainer');
    const userListDiv = document.getElementById('userList');
    const selectedUsersDisplay = document.getElementById('selectedUsersDisplay');
    const messageDiv = document.getElementById('message');

    const API_NOTIFICATION_URL = 'https://saigongiadinh.pythonanywhere.com/api/admin/notifications/';
    const API_FACULTY_URL = 'https://saigongiadinh.pythonanywhere.com/faculty-list/';
    const API_STUDENT_URL = 'https://saigongiadinh.pythonanywhere.com/student-list/';

    let allUsers = []; // Sẽ chứa cả giảng viên và học sinh với cả ID và mã code
    let selectedUserIds = new Set(); // Dùng Set để quản lý ID (số nguyên) duy nhất và nhanh chóng

    function getAuthToken() {
        return localStorage.getItem('adminAuthToken');
    }
    const ADMIN_AUTH_TOKEN = getAuthToken();

    function showMessage(msg, type) {
        messageDiv.textContent = msg;
        messageDiv.className = `message ${type}`;
        messageDiv.style.display = 'block';
        setTimeout(() => {
            messageDiv.style.display = 'none';
        }, 5000);
    }

    async function loadAllUsers() {
        userListDiv.innerHTML = '<p style="text-align: center; color: #666;">Đang tải danh sách người dùng...</p>';
        allUsers = [];
        try {
            const commonHeaders = {
                'Authorization': `Token ${ADMIN_AUTH_TOKEN}`
            };

            const [facultyResponse, studentResponse] = await Promise.all([
                fetch(API_FACULTY_URL, { headers: commonHeaders }),
                fetch(API_STUDENT_URL, { headers: commonHeaders })
            ]);

            if (!facultyResponse.ok) {
                const errorData = await facultyResponse.json();
                throw new Error(`Lỗi tải giảng viên: ${facultyResponse.status} ${facultyResponse.statusText} - ${JSON.stringify(errorData)}`);
            }
            let studentData = await studentResponse.json();
            if (!Array.isArray(studentData)) {
                studentData = [studentData];
            }
            if (!studentResponse.ok) {
                const errorData = await studentResponse.json();
                throw new Error(`Lỗi tải sinh viên: ${studentResponse.status} ${studentResponse.statusText} - ${JSON.stringify(errorData)}`);
            }

            const facultyData = await facultyResponse.json();

            // Ánh xạ giảng viên: Lưu cả 'id' (PK) và 'faculty_code'
            const faculties = facultyData.map(f => ({
                pk_id: f.id, // Lưu ID thực (Primary Key)
                display_code: f.faculty_code, // Mã code để hiển thị
                full_name: `${f.first_name || ''} ${f.last_name || ''}`.trim(),
                type: 'Giảng viên'
            }));
            // Ánh xạ sinh viên: Lưu cả 'id' (PK) và 'student_code'
            const students = studentData.map(s => ({
                pk_id: s.id, // Giả định student-list cũng trả về trường 'id' là PK (số nguyên)
                               // Nếu không, bạn cần cân nhắc lại cách ánh xạ ID cho sinh viên.
                               // Với dữ liệu student-list bạn cung cấp, không có 'id' mà chỉ có 'student_code'.
                               // Để đảm bảo gửi ID số nguyên, bạn cần API student-list trả về 'id'.
                               // Tạm thời, tôi sẽ dùng s.id, nếu không có, bạn sẽ cần hỏi lại backend API student-list.
                display_code: s.student_code, // Mã code để hiển thị
                full_name: s.full_name || '',
                type: 'Sinh viên'
            }));

            allUsers = [...faculties, ...students].sort((a, b) => {
                const nameA = a.full_name || '';
                const nameB = b.full_name || '';
                return nameA.localeCompare(nameB, 'vi', { sensitivity: 'base' });
            });
            displayUserList();
        } catch (error) {
            console.error('Lỗi khi tải danh sách người dùng:', error);
            userListDiv.innerHTML = `<p style="text-align: center; color: red;">Không thể tải danh sách người dùng: ${error.message}</p>`;
            showMessage('Không thể tải danh sách người dùng. Vui lòng kiểm tra console.', 'error');
        }
    }

    function displayUserList() {
        userListDiv.innerHTML = '';
        if (allUsers.length === 0) {
            userListDiv.innerHTML = '<p style="text-align: center;">Không tìm thấy người dùng nào.</p>';
            return;
        }

        allUsers.forEach(user => {
            const userItem = document.createElement('div');
            userItem.className = 'user-item';
            // Lưu pk_id vào dataset để dễ dàng lấy khi chọn
            userItem.dataset.pkId = user.pk_id;
            userItem.dataset.name = user.full_name;

            // Kiểm tra xem pk_id có trong selectedUserIds không
            if (selectedUserIds.has(user.pk_id)) {
                userItem.classList.add('selected');
            }

            // Hiển thị mã code hoặc ID tùy theo preference
            userItem.innerHTML = `
                <span>${user.full_name} (${user.type})</span>
                <span>Mã: ${user.display_code || user.pk_id}</span>
            `;
            // Khi click, truyền pk_id (số nguyên) để lưu vào selectedUserIds
            userItem.addEventListener('click', () => toggleUserSelection(user.pk_id, user.full_name));
            userListDiv.appendChild(userItem);
        });
    }

    function toggleUserSelection(pkId, userName) {
        if (selectedUserIds.has(pkId)) {
            selectedUserIds.delete(pkId);
        } else {
            selectedUserIds.add(pkId);
        }
        updateSelectedUsersDisplay();
        displayUserList(); // Tải lại danh sách để cập nhật trạng thái selected
    }

    function updateSelectedUsersDisplay() {
        selectedUsersDisplay.innerHTML = '';
        if (selectedUserIds.size === 0) {
            selectedUsersDisplay.textContent = 'Chưa có người dùng nào được chọn.';
        } else {
            // Lấy tên hiển thị từ allUsers dựa vào pk_id đã chọn
            const selectedNames = Array.from(selectedUserIds)
                .map(pkId => allUsers.find(u => u.pk_id === pkId)?.full_name || `ID: ${pkId}`)
                .filter(Boolean);

            selectedNames.forEach(name => {
                const tag = document.createElement('span');
                tag.className = 'selected-user-tag';
                tag.textContent = name;
                selectedUsersDisplay.appendChild(tag);
            });
        }
    }

    targetUsersSelect.addEventListener('change', () => {
        if (targetUsersSelect.value === 'SPECIFIC_USER') {
            specificUsersSelectionContainer.style.display = 'block';
            if (allUsers.length === 0) {
                loadAllUsers();
            } else {
                displayUserList();
            }
        } else {
            specificUsersSelectionContainer.style.display = 'none';
            selectedUserIds.clear();
            updateSelectedUsersDisplay();
        }
    });

    targetUsersSelect.dispatchEvent(new Event('change'));

    notificationForm.addEventListener('submit', async (event) => {
        event.preventDefault();

        const title = document.getElementById('title').value;
        const noidung = document.getElementById('noidung').value;
        console.log("Giá trị của trường nội dung (content):", noidung);
        const startDate = document.getElementById('startDate').value;
        const endDate = document.getElementById('endDate').value;
        const targetUsers = document.getElementById('targetUsers').value;
        const notificationType = document.getElementById('notificationType').value;
        const isActive = document.getElementById('isActive').checked;
        const requiresAcknowledgement = document.getElementById('requiresAcknowledgement').checked;

        let specificUserIdsArray = [];
        if (targetUsers === 'SPECIFIC_USER') {
            specificUserIdsArray = Array.from(selectedUserIds); // Lấy các ID số nguyên từ Set
            if (specificUserIdsArray.length === 0) {
                showMessage("Phải chọn ít nhất một người dùng cụ thể khi đối tượng là 'Người dùng cụ thể'.", 'error');
                return;
            }
        }

        const formattedStartDate = startDate ? new Date(startDate).toISOString() : null;
        const formattedEndDate = endDate ? new Date(endDate).toISOString() : null;

        const data = {
            title: title,
            content: noidung,
            start_date: formattedStartDate,
            end_date: formattedEndDate,
            target_users: targetUsers,
            specific_users: specificUserIdsArray, // Dữ liệu gửi đi là mảng các ID số nguyên
            notification_type: notificationType,
            is_active: isActive,
            requires_acknowledgement: requiresAcknowledgement
        };

        console.log("Dữ liệu gửi đi:", data);

        try {
            const response = await fetch(API_NOTIFICATION_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Token ${ADMIN_AUTH_TOKEN}`
                },
                body: JSON.stringify(data)
            });

            if (!response.ok) {
                const errorData = await response.json();
                console.error('Lỗi khi tạo thông báo:', errorData);
                let errorMessage = `Lỗi ${response.status}: ${response.statusText}. `;
                if (errorData) {
                    if (errorData.non_field_errors) {
                        errorMessage += errorData.non_field_errors.join(', ');
                    } else {
                        errorMessage += Object.values(errorData).flat().join(', ');
                    }
                }
                showMessage(`Thất bại: ${errorMessage}`, 'error');
                return;
            }

            const result = await response.json();
            console.log('Thông báo đã tạo thành công:', result);
            showMessage('Thông báo đã được tạo thành công!', 'success');
            notificationForm.reset();
            selectedUserIds.clear();
            updateSelectedUsersDisplay();
            targetUsersSelect.dispatchEvent(new Event('change'));
        } catch (error) {
            console.error('Lỗi mạng hoặc lỗi không xác định:', error);
            showMessage('Đã xảy ra lỗi khi kết nối đến máy chủ. Vui lòng thử lại.', 'error');
        }
    });
});
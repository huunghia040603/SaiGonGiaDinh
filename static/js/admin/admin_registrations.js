


document.addEventListener('DOMContentLoaded', function() {
    const tableBody = document.getElementById('advisory-registrations-table-body');
    const notesModal = new bootstrap.Modal(document.getElementById('notesModal'));
    const notesTextarea = document.getElementById('notesTextarea');
    const notesRegistrationId = document.getElementById('notesRegistrationId');
    const saveNotesBtn = document.getElementById('saveNotesBtn');

    function getAuthToken() {
        // Lấy token từ localStorage, nơi login_admin.html đã lưu trữ
        return localStorage.getItem('adminAuthToken'); 
    }

    async function fetchAdvisoryRegistrations() {
        tableBody.innerHTML = '<tr><td colspan="11" class="text-center">Đang tải dữ liệu...</td></tr>';
        const token = getAuthToken();

        if (!token) { // Kiểm tra nếu token không tồn tại (null hoặc undefined)
            tableBody.innerHTML = '<tr><td colspan="11" class="text-center text-danger">Lỗi: Không tìm thấy token xác thực admin. Vui lòng đăng nhập lại.</td></tr>';
            // Tùy chọn: Chuyển hướng về trang đăng nhập nếu không có token
            setTimeout(() => {
                window.location.href = '/admin/login'; 
            }, 1000); 
            return;
        }

        try {
            const response = await fetch('https://saigongiadinh.pythonanywhere.com/api/admin/advisory-registrations/', {
                method: 'GET',
                headers: {
                    'Authorization': `Token ${token}`, // Gửi token dưới dạng 'Token <your_token>'
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                }
            });

            if (!response.ok) {
                let errorMessage = `Lỗi ${response.status}: ${response.statusText}`;
                try {
                    const errorData = await response.json();
                    errorMessage = errorData.detail || errorMessage;
                } catch (jsonError) {
                    console.warn('Server did not return JSON for error:', jsonError);
                }

                if (response.status === 401 || response.status === 403) {
                    errorMessage = 'Bạn không có quyền truy cập hoặc phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.';
                    // Chuyển hướng về trang đăng nhập khi token hết hạn hoặc không hợp lệ
                    setTimeout(() => {
                        window.location.href = '/admin/login'; // Thay thế bằng đường dẫn login admin của bạn
                    }, 500); 
                }
                throw new Error(errorMessage);
            }

            const data = await response.json();
            renderTable(data);

        } catch (error) {
            console.error('Lỗi khi tải dữ liệu:', error);
            tableBody.innerHTML = `<tr><td colspan="11" class="text-center text-danger">Lỗi: ${error.message}</td></tr>`;
        }
    }

    function renderTable(registrations) {
        tableBody.innerHTML = '';
        if (registrations.length === 0) {
            tableBody.innerHTML = '<tr><td colspan="11" class="text-center">Không có đăng ký tư vấn nào.</td></tr>';
            return;
        }

        registrations.forEach((reg) => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${reg.id}</td>
                <td>${reg.full_name}</td>
                <td>${reg.phone_number}</td>
                <td>${reg.email}</td>
                <td>${reg.address || 'N/A'}</td>
                <td>${reg.major_of_interest ? reg.major_of_interest.name : 'Chưa xác định'}</td>
                <td>${reg.has_graduated_display}</td>
                <td>${new Date(reg.registration_date).toLocaleDateString('vi-VN')}</td>
                <td>
                    <select class="form-select status-select" data-id="${reg.id}">
                        <option value="NEW" ${reg.status === 'NEW' ? 'selected' : ''}>Mới đăng ký</option>
                        <option value="CONTACTED" ${reg.status === 'CONTACTED' ? 'selected' : ''}>Đã liên hệ</option>
                        <option value="CONSULTED" ${reg.status === 'CONSULTED' ? 'selected' : ''}>Đã tư vấn</option>
                        <option value="REJECTED" ${reg.status === 'REJECTED' ? 'selected' : ''}>Từ chối</option>
                    </select>
                </td>
                <td>
                    <button class="btn btn-sm btn-info view-notes-btn" data-id="${reg.id}" data-notes="${reg.notes || ''}">
                        <i class="bi bi-journal-text"></i>
                    </button>
                </td>
                <td>
                    <button class="btn btn-sm btn-danger delete-btn" data-id="${reg.id}">
                        <i class="bi bi-trash"></i>
                    </button>
                </td>
            `;
            tableBody.appendChild(row);
        });

        attachEventListeners();
    }

    function attachEventListeners() {
        tableBody.querySelectorAll('.status-select').forEach(select => {
            select.addEventListener('change', async (event) => {
                const registrationId = event.target.dataset.id;
                const newStatus = event.target.value;
                await updateRegistration(registrationId, { status: newStatus });
            });
        });

        tableBody.querySelectorAll('.view-notes-btn').forEach(button => {
            button.addEventListener('click', (event) => {
                const id = event.currentTarget.dataset.id;
                const notes = event.currentTarget.dataset.notes;
                notesRegistrationId.value = id;
                notesTextarea.value = notes;
                notesModal.show();
            });
        });

        tableBody.querySelectorAll('.delete-btn').forEach(button => {
            button.addEventListener('click', async (event) => {
                const registrationId = event.currentTarget.dataset.id;
                if (confirm('Bạn có chắc chắn muốn xóa đăng ký này?')) {
                    await deleteRegistration(registrationId);
                }
            });
        });
    }

    saveNotesBtn.addEventListener('click', async () => {
        const id = notesRegistrationId.value;
        const newNotes = notesTextarea.value;
        await updateRegistration(id, { notes: newNotes });
        notesModal.hide();
    });

    async function updateRegistration(id, dataToUpdate) {
        const token = getAuthToken();
        if (!token) {
             alert('Lỗi: Không tìm thấy token xác thực. Vui lòng đăng nhập lại.');
             window.location.href = '/admin/login'; // Redirect to login
             return;
        }
        try {
            const response = await fetch(`https://saigongiadinh.pythonanywhere.com/api/admin/advisory-registrations/${id}/`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Token ${token}`
                },
                body: JSON.stringify(dataToUpdate)
            });

            if (!response.ok) {
                let errorMessage = `Lỗi ${response.status}: ${response.statusText} khi cập nhật.`;
                try {
                    const errorData = await response.json();
                    errorMessage = errorData.detail || errorMessage;
                } catch (jsonError) {
                    console.warn('Server did not return JSON for error:', jsonError);
                }
                if (response.status === 401 || response.status === 403) {
                    errorMessage = 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.';
                    setTimeout(() => {
                        window.location.href = '/admin/login'; 
                    }, 500); 
                }
                throw new Error(errorMessage);
            }
            alert('Cập nhật thành công!');
            fetchAdvisoryRegistrations();
        } catch (error) {
            console.error('Lỗi cập nhật:', error);
            alert('Lỗi cập nhật: ' + error.message);
        }
    }

    async function deleteRegistration(id) {
        const token = getAuthToken();
        if (!token) {
            alert('Lỗi: Không tìm thấy token xác thực. Vui lòng đăng nhập lại.');
            window.location.href = '/admin/login'; // Redirect to login
            return;
        }
        try {
            const response = await fetch(`https://saigongiadinh.pythonanywhere.com/api/admin/advisory-registrations/${id}/`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Token ${token}`
                }
            });

            if (!response.ok) {
                let errorMessage = `Lỗi ${response.status}: ${response.statusText} khi xóa.`;
                try {
                    const errorData = await response.json();
                    errorMessage = errorData.detail || errorMessage;
                } catch (jsonError) {
                    console.warn('Server did not return JSON for error:', jsonError);
                }
                if (response.status === 401 || response.status === 403) {
                    errorMessage = 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.';
                    setTimeout(() => {
                        window.location.href = '/admin/login'; 
                    }, 500); 
                }
                throw new Error(errorMessage);
            }
            alert('Xóa đăng ký thành công!');
            fetchAdvisoryRegistrations();
        } catch (error) {
            console.error('Lỗi xóa đăng ký:', error);
            alert('Lỗi xóa đăng ký: ' + error.message);
        }
    }

    fetchAdvisoryRegistrations();
});
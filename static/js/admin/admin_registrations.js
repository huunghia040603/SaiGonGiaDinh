document.addEventListener('DOMContentLoaded', function() {
    const tableBody = document.getElementById('advisory-registrations-table-body');
    const notesModal = new bootstrap.Modal(document.getElementById('notesModal'));
    const notesTextarea = document.getElementById('notesTextarea');
    const notesRegistrationId = document.getElementById('notesRegistrationId');
    const saveNotesBtn = document.getElementById('saveNotesBtn');

    function getAuthToken() {
        if (window.location.pathname.startsWith('/sggd/gv/manage')) {
           
            return localStorage.getItem('authToken');
        } else if (window.location.pathname.startsWith('/sggd/qtv/admin')) {
           
            return localStorage.getItem('adminAuthToken');
        }
        console.log("getAuthToken: Không tìm thấy đường dẫn quản lý, trả về null token.");
        return null;
    }

    async function fetchAdvisoryRegistrations() {
        console.log("fetchAdvisoryRegistrations: Bắt đầu tải dữ liệu đăng ký tư vấn.");
        tableBody.innerHTML = '<tr><td colspan="11" class="text-center">Đang tải dữ liệu...</td></tr>';
        const token = getAuthToken();

        if (!token) {
            console.error("fetchAdvisoryRegistrations: Lỗi - Không tìm thấy token xác thực.");
            tableBody.innerHTML = '<tr><td colspan="11" class="text-center text-danger">Lỗi: Không tìm thấy token xác thực. Vui lòng đăng nhập lại.</td></tr>';
            setTimeout(() => {
                if (window.location.pathname==='/sggd/qtv/admin') {
                    window.location.href = '/admin/login';
                } 
                if (window.location.pathname.startsWith('/sggd/gv/manage')){
                    window.location.href = '/sggd/gv/manage/';
                }
            }, 1000);
            return;
        }
        console.log("fetchAdvisoryRegistrations: Token đã lấy thành công (kiểm tra token không in ra đây để bảo mật).");

        try {
            console.log("fetchAdvisoryRegistrations: Đang gửi yêu cầu GET tới API...");
            const response = await fetch('https://saigongiadinh.pythonanywhere.com/api/admin/advisory-registrations/', {
                method: 'GET',
                headers: {
                    'Authorization': `Token ${token}`,
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                }
            });
            console.log("fetchAdvisoryRegistrations: Đã nhận được phản hồi từ API.", response);

            if (!response.ok) {
                let errorMessage = `Lỗi ${response.status}: ${response.statusText}`;
                try {
                    const errorData = await response.json();
                    errorMessage = errorData.detail || errorMessage;
                    console.error("fetchAdvisoryRegistrations: Lỗi phản hồi từ server (JSON):", errorData);
                } catch (jsonError) {
                    console.warn('fetchAdvisoryRegistrations: Server did not return JSON for error:', jsonError);
                }

                if (response.status === 401 || response.status === 403) {
                    errorMessage = 'Bạn không có quyền truy cập hoặc phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.';
                    console.error("fetchAdvisoryRegistrations: Lỗi xác thực/phân quyền (401/403).");
                    setTimeout(() => {
                        if (window.location.pathname.startsWith('/sggd/qtv/admin')) {
                            window.location.href = '/admin/login';
                        } else {
                            window.location.href = '/sggd/gv/manage';
                        }
                    }, 500);
                }
                throw new Error(errorMessage);
            }

            const data = await response.json();
            console.log("fetchAdvisoryRegistrations: Dữ liệu tải về thành công:", data);
            renderTable(data);

        } catch (error) {
            console.error('fetchAdvisoryRegistrations: Lỗi khi tải dữ liệu:', error);
            tableBody.innerHTML = `<tr><td colspan="11" class="text-center text-danger">Lỗi: ${error.message}</td></tr>`;
        }
    }

    function renderTable(registrations) {
        console.log("renderTable: Bắt đầu render bảng dữ liệu.");
        tableBody.innerHTML = '';
        if (registrations.length === 0) {
            console.log("renderTable: Không có đăng ký nào để hiển thị.");
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
                    <select class="form-select status-select" data-id="${reg.id}" name="status">
                        <option value="NEW" ${reg.status === 'NEW' ? 'selected' : ''}>Mới đăng ký</option>
                        <option value="CONTACTED" ${reg.status === 'CONTACTED' ? 'selected' : ''}>Đã liên hệ</option>
                        <option value="CONSULTED" ${reg.status === 'CONSULTED' ? 'selected' : ''}>Đã tư vấn</option>
                        
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
        console.log("renderTable: Đã render xong bảng dữ liệu. Chuẩn bị gắn sự kiện.");
        attachEventListeners();
    }

    function attachEventListeners() {
        console.log("attachEventListeners: Đang gắn sự kiện cho các phần tử.");
        tableBody.querySelectorAll('.status-select').forEach(select => {
            select.addEventListener('change', async (event) => {
                const registrationId = event.target.dataset.id;
                const newStatus = event.target.value;
                console.log(`attachEventListeners: Sự kiện 'change' trên select. ID: ${registrationId}, Trạng thái mới: ${newStatus}`);
                await updateRegistration(registrationId, { status: newStatus });
            });
        });

        tableBody.querySelectorAll('.view-notes-btn').forEach(button => {
            button.addEventListener('click', (event) => {
                const id = event.currentTarget.dataset.id;
                const notes = event.currentTarget.dataset.notes;
                console.log(`attachEventListeners: Sự kiện 'click' trên nút ghi chú. ID: ${id}, Ghi chú hiện tại: "${notes}"`);
                notesRegistrationId.value = id;
                notesTextarea.value = notes;
                notesModal.show();
            });
        });

        tableBody.querySelectorAll('.delete-btn').forEach(button => {
            button.addEventListener('click', async (event) => {
                const registrationId = event.currentTarget.dataset.id;
                console.log(`attachEventListeners: Sự kiện 'click' trên nút xóa. ID: ${registrationId}`);
                if (confirm('Bạn có chắc chắn muốn xóa đăng ký này?')) {
                    console.log(`attachEventListeners: Xác nhận xóa đăng ký ID: ${registrationId}.`);
                    await deleteRegistration(registrationId);
                } else {
                    console.log(`attachEventListeners: Hủy xóa đăng ký ID: ${registrationId}.`);
                }
            });
        });
        console.log("attachEventListeners: Đã gắn xong các sự kiện.");
    }

    saveNotesBtn.addEventListener('click', async () => {
        console.log("saveNotesBtn: Sự kiện 'click' trên nút lưu ghi chú.");
        const id = notesRegistrationId.value;
        const newNotes = notesTextarea.value;
        console.log(`saveNotesBtn: ID: ${id}, Ghi chú mới: "${newNotes}"`);
        await updateRegistration(id, { notes: newNotes });
        notesModal.hide();
        console.log("saveNotesBtn: Đã đóng modal ghi chú.");
    });

    async function updateRegistration(id, dataToUpdate) {
        console.log(`updateRegistration: Bắt đầu cập nhật đăng ký ID: ${id}. Dữ liệu cập nhật:`, dataToUpdate);
        const token = getAuthToken();
        console.log("updateRegistration: Token đã được lấy."); // Không in ra token để bảo mật
        if (!token) {
            console.error("updateRegistration: Lỗi - Không tìm thấy token xác thực để cập nhật.");
            alert('Lỗi: Không tìm thấy token xác thực. Vui lòng đăng nhập lại.');
            setTimeout(() => {
                if (window.location.pathname.startsWith('/sggd/qtv/admin')) {
                    window.location.href = '/admin/login';
                } else {
                    window.location.href = '/sggd/gv/manage';
                }
            }, 500);
            return;
        }

        let apiUrl = `https://saigongiadinh.pythonanywhere.com/api/admin/advisory-registrations/${id}/`; // API tổng quát
        let method = 'PATCH';

        // Xác định API cụ thể dựa vào dữ liệu cần cập nhật
        if (dataToUpdate.hasOwnProperty('status')) {
            apiUrl = `https://saigongiadinh.pythonanywhere.com/update-status-registrations/${id}/`;
            console.log(`updateRegistration: Cập nhật trạng thái. Sử dụng API: ${apiUrl}`);
        } else if (dataToUpdate.hasOwnProperty('notes')) {
            apiUrl = `https://saigongiadinh.pythonanywhere.com/update-notes-registrations/${id}/`;
            console.log(`updateRegistration: Cập nhật ghi chú. Sử dụng API: ${apiUrl}`);
        }

        try {
            console.log(`updateRegistration: Đang gửi yêu cầu ${method} tới URL: ${apiUrl}`);
            console.log("updateRegistration: Dữ liệu gửi đi:", JSON.stringify(dataToUpdate));

            const response = await fetch(apiUrl, {
                method: method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Token ${token}`
                },
                body: JSON.stringify(dataToUpdate)
            });

            console.log("updateRegistration: Đã nhận được phản hồi từ API:", response);

            if (!response.ok) {
                let errorMessage = `Lỗi ${response.status}: ${response.statusText} khi cập nhật.`;
                console.error(`updateRegistration: Phản hồi không thành công. Status: ${response.status}, StatusText: ${response.statusText}`);
                try {
                    const errorData = await response.json();
                    errorMessage = errorData.detail || errorMessage;
                    console.error("updateRegistration: Chi tiết lỗi từ server (JSON):", errorData);
                } catch (jsonError) {
                    console.warn('updateRegistration: Server did not return JSON for error response.', jsonError);
                }
                if (response.status === 401 || response.status === 403) {
                    errorMessage = 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.';
                    console.error("updateRegistration: Lỗi xác thực/phân quyền (401/403) khi cập nhật.");
                    setTimeout(() => {
                        if (window.location.pathname.startsWith('/sggd/qtv/admin')) {
                            window.location.href = '/admin/login';
                        } else {
                            window.location.href = '/sggd/gv/manage';
                        }
                    }, 500);
                }
                throw new Error(errorMessage);
            }
            console.log("updateRegistration: Cập nhật thành công!");
            alert('Cập nhật thành công!');
            fetchAdvisoryRegistrations(); // Tải lại dữ liệu sau khi cập nhật thành công
        } catch (error) {
            console.error('updateRegistration: Lỗi khi cập nhật:', error);
            alert('Lỗi cập nhật: ' + error.message);
        }
    }

    async function deleteRegistration(id) {
        console.log(`deleteRegistration: Bắt đầu xóa đăng ký ID: ${id}.`);
        const token = getAuthToken();
        if (!token) {
            console.error("deleteRegistration: Lỗi - Không tìm thấy token xác thực để xóa.");
            alert('Lỗi: Không tìm thấy token xác thực. Vui lòng đăng nhập lại.');
            if (window.location.pathname.startsWith('/sggd/qtv/admin')) {
                window.location.href = '/admin/login';
            } else {
                window.location.href = '/sggd/gv/manage';
            }
            return;
        }
        try {
            const apiUrl = `https://saigongiadinh.pythonanywhere.com/api/admin/advisory-registrations/${id}/`;
            console.log(`deleteRegistration: Đang gửi yêu cầu DELETE tới URL: ${apiUrl}`);

            const response = await fetch(apiUrl, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Token ${token}`
                }
            });

            console.log("deleteRegistration: Đã nhận được phản hồi từ API:", response);

            if (!response.ok) {
                let errorMessage = `Lỗi ${response.status}: ${response.statusText} khi xóa.`;
                console.error(`deleteRegistration: Phản hồi không thành công. Status: ${response.status}, StatusText: ${response.statusText}`);
                try {
                    const errorData = await response.json();
                    errorMessage = errorData.detail || errorMessage;
                    console.error("deleteRegistration: Chi tiết lỗi từ server (JSON):", errorData);
                } catch (jsonError) {
                    console.warn('deleteRegistration: Server did not return JSON for error response.', jsonError);
                }
                if (response.status === 401 || response.status === 403) {
                    errorMessage = 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.';
                    console.error("deleteRegistration: Lỗi xác thực/phân quyền (401/403) khi xóa.");
                    setTimeout(() => {
                        window.location.href = '/admin/login';
                    }, 500);
                }
                throw new Error(errorMessage);
            }
            console.log("deleteRegistration: Xóa đăng ký thành công!");
            alert('Xóa đăng ký thành công!');
            fetchAdvisoryRegistrations(); // Tải lại dữ liệu sau khi xóa thành công
        } catch (error) {
            console.error('deleteRegistration: Lỗi khi xóa đăng ký:', error);
            alert('Lỗi xóa đăng ký: ' + error.message);
        }
    }

    // Khởi tạo tải dữ liệu khi DOM đã sẵn sàng
    console.log("DOMContentLoaded: Bắt đầu.");
    fetchAdvisoryRegistrations();
});



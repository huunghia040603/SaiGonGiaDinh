// /static/js/faculty_registrations.js
document.addEventListener('DOMContentLoaded', function() {
    const tableBody = document.getElementById('advisory-registrations-table-body');
    const notesModal = new bootstrap.Modal(document.getElementById('notesModal'));
    const notesTextarea = document.getElementById('notesTextarea');
    const notesRegistrationId = document.getElementById('notesRegistrationId');
    const saveNotesBtn = document.getElementById('saveNotesBtn');

    console.log("FACULTY_REGISTRATIONS_DEBUG: DOMContentLoaded fired. Script started.");

    // Hàm lấy token riêng cho giảng viên
    function getFacultyAuthToken() {
        const token = localStorage.getItem('authToken'); // Luôn lấy authToken cho giảng viên
        console.log(`FACULTY_REGISTRATIONS_DEBUG: Fetched authToken: ${token ? 'Exists' : 'NULL'}`);
        return token;
    }

    // URL đăng nhập dành riêng cho giảng viên
    const facultyLoginUrl = '/sggd/gv/login';
    // URL API dành riêng cho giảng viên (Cần đảm bảo API này có tồn tại và đúng quyền trên backend)
    // Nếu bạn có một API riêng cho giảng viên, hãy thay đổi URL này.
    // Ví dụ: '/api/faculty/advisory-registrations/'
    // Nếu API admin hiện tại của bạn đã được cấu hình để hoạt động với token giảng viên, bạn có thể giữ nguyên.
    const facultyApiBaseUrl = 'https://saigongiadinh.pythonanywhere.com/api/admin/advisory-registrations/'; 
    const updateStatusApiUrl = 'https://saigongiadinh.pythonanywhere.com/update-status-registrations/';
    const updateNotesApiUrl = 'https://saigongiadinh.pythonanywhere.com/update-notes-registrations/';


    async function fetchAdvisoryRegistrations() {
        console.log("FACULTY_REGISTRATIONS_DEBUG: fetchAdvisoryRegistrations started.");
        tableBody.innerHTML = '<tr><td colspan="11" class="text-center">Đang tải dữ liệu...</td></tr>';
        
        const token = getFacultyAuthToken();
        
        console.log(`FACULTY_REGISTRATIONS_DEBUG: Inside fetchAdvisoryRegistrations. Token status: ${token ? 'Exists' : 'NULL'}.`);

        if (!token) {
            console.error("FACULTY_REGISTRATIONS_ERROR: Authentication token not found for faculty. Redirecting to:", facultyLoginUrl);
            tableBody.innerHTML = '<tr><td colspan="11" class="text-center text-danger">Lỗi: Không tìm thấy token xác thực. Vui lòng đăng nhập lại.</td></tr>';
            setTimeout(() => {
                console.log(`FACULTY_REGISTRATIONS_DEBUG: Redirecting window to: ${facultyLoginUrl}`);
                window.location.href = facultyLoginUrl;
            }, 1000);
            return;
        }
        console.log("FACULTY_REGISTRATIONS_DEBUG: Token successfully retrieved for API call.");

        try {
            console.log(`FACULTY_REGISTRATIONS_DEBUG: Sending GET request to API: ${facultyApiBaseUrl}`);
            const response = await fetch(facultyApiBaseUrl, {
                method: 'GET',
                headers: {
                    'Authorization': `Token ${token}`,
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                }
            });
            console.log("FACULTY_REGISTRATIONS_DEBUG: Received API response. Status:", response.status, response.statusText);

            if (!response.ok) {
                let errorMessage = `Lỗi ${response.status}: ${response.statusText}`;
                console.error(`FACULTY_REGISTRATIONS_ERROR: API response not OK. Status: ${response.status}, StatusText: ${response.statusText}`);
                try {
                    const errorData = await response.json();
                    errorMessage = errorData.detail || errorMessage;
                    console.error("FACULTY_REGISTRATIONS_ERROR: Server error details (JSON):", errorData);
                } catch (jsonError) {
                    console.warn('FACULTY_REGISTRATIONS_WARNING: Server did not return JSON for error response.', jsonError);
                }

                if (response.status === 401 || response.status === 403) {
                    errorMessage = 'Bạn không có quyền truy cập hoặc phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.';
                    console.error(`FACULTY_REGISTRATIONS_ERROR: Authentication/Authorization error (${response.status}). Redirecting to: ${facultyLoginUrl}`);
                    setTimeout(() => {
                        console.log(`FACULTY_REGISTRATIONS_DEBUG: Redirecting window to: ${facultyLoginUrl}`);
                        window.location.href = facultyLoginUrl;
                    }, 500);
                }
                throw new Error(errorMessage);
            }

            const data = await response.json();
            console.log("FACULTY_REGISTRATIONS_DEBUG: Data fetched successfully:", data);
            renderTable(data);

        } catch (error) {
            console.error('FACULTY_REGISTRATIONS_ERROR: Failed to fetch advisory registrations:', error);
            tableBody.innerHTML = `<tr><td colspan="11" class="text-center text-danger">Lỗi: ${error.message}</td></tr>`;
        }
    }

    function renderTable(registrations) {
        console.log("FACULTY_REGISTRATIONS_DEBUG: renderTable started.");
        tableBody.innerHTML = '';
        if (registrations.length === 0) {
            console.log("FACULTY_REGISTRATIONS_DEBUG: No registrations to display.");
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
        console.log("FACULTY_REGISTRATIONS_DEBUG: Table rendering complete. Attaching event listeners.");
        attachEventListeners();
    }

    function attachEventListeners() {
        console.log("FACULTY_REGISTRATIONS_DEBUG: Attaching event listeners.");
        tableBody.querySelectorAll('.status-select').forEach(select => {
            select.addEventListener('change', async (event) => {
                const registrationId = event.target.dataset.id;
                const newStatus = event.target.value;
                console.log(`FACULTY_REGISTRATIONS_DEBUG: Status select changed. ID: ${registrationId}, New Status: ${newStatus}`);
                await updateRegistration(registrationId, { status: newStatus });
            });
        });

        tableBody.querySelectorAll('.view-notes-btn').forEach(button => {
            button.addEventListener('click', (event) => {
                const id = event.currentTarget.dataset.id;
                const notes = event.currentTarget.dataset.notes;
                console.log(`FACULTY_REGISTRATIONS_DEBUG: View notes button clicked. ID: ${id}, Current notes: "${notes}"`);
                notesRegistrationId.value = id;
                notesTextarea.value = notes;
                notesModal.show();
            });
        });

        // Nút xóa chỉ hiển thị nhưng có thể không có quyền thực hiện
        tableBody.querySelectorAll('.delete-btn').forEach(button => {
            button.addEventListener('click', async (event) => {
                const registrationId = event.currentTarget.dataset.id;
                console.log(`FACULTY_REGISTRATIONS_DEBUG: Delete button clicked. ID: ${registrationId}`);
                if (confirm('Bạn có chắc chắn muốn xóa đăng ký này?')) {
                    console.log(`FACULTY_REGISTRATIONS_DEBUG: Confirmed delete for registration ID: ${registrationId}.`);
                    await deleteRegistration(registrationId);
                } else {
                    console.log(`FACULTY_REGISTRATIONS_DEBUG: Cancelled delete for registration ID: ${registrationId}.`);
                }
            });
        });
        console.log("FACULTY_REGISTRATIONS_DEBUG: Event listeners attached.");
    }

    saveNotesBtn.addEventListener('click', async () => {
        console.log("FACULTY_REGISTRATIONS_DEBUG: Save notes button clicked.");
        const id = notesRegistrationId.value;
        const newNotes = notesTextarea.value;
        console.log(`FACULTY_REGISTRATIONS_DEBUG: Notes to save. ID: ${id}, New notes: "${newNotes}"`);
        await updateRegistration(id, { notes: newNotes });
        notesModal.hide();
        console.log("FACULTY_REGISTRATIONS_DEBUG: Notes modal hidden.");
    });

    async function updateRegistration(id, dataToUpdate) {
        console.log(`FACULTY_REGISTRATIONS_DEBUG: updateRegistration started for ID: ${id}. Data to update:`, dataToUpdate);
        const token = getFacultyAuthToken();
        console.log("FACULTY_REGISTRATIONS_DEBUG: Token retrieved for update."); 

        if (!token) {
            console.error("FACULTY_REGISTRATIONS_ERROR: Authentication token not found for update. Redirecting to:", facultyLoginUrl);
            alert('Lỗi: Không tìm thấy token xác thực. Vui lòng đăng nhập lại.');
            setTimeout(() => {
                console.log(`FACULTY_REGISTRATIONS_DEBUG: Redirecting window to: ${facultyLoginUrl}`);
                window.location.href = facultyLoginUrl;
            }, 500);
            return;
        }

        let apiUrl;
        let method = 'PATCH';

        if (dataToUpdate.hasOwnProperty('status')) {
            apiUrl = `${updateStatusApiUrl}${id}/`;
            console.log(`FACULTY_REGISTRATIONS_DEBUG: Updating status. Using API URL: ${apiUrl}`);
        } else if (dataToUpdate.hasOwnProperty('notes')) {
            apiUrl = `${updateNotesApiUrl}${id}/`;
            console.log(`FACULTY_REGISTRATIONS_DEBUG: Updating notes. Using API URL: ${apiUrl}`);
        } else {
            console.error("FACULTY_REGISTRATIONS_ERROR: Không có dữ liệu hợp lệ để cập nhật.");
            alert('Lỗi: Không có dữ liệu hợp lệ để cập nhật.');
            return;
        }

        try {
            console.log(`FACULTY_REGISTRATIONS_DEBUG: Sending ${method} request to URL: ${apiUrl}`);
            console.log("FACULTY_REGISTRATIONS_DEBUG: Data sent:", JSON.stringify(dataToUpdate));

            const response = await fetch(apiUrl, {
                method: method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Token ${token}`
                },
                body: JSON.stringify(dataToUpdate)
            });

            console.log("FACULTY_REGISTRATIONS_DEBUG: Received API response for update. Status:", response.status, response.statusText);

            if (!response.ok) {
                let errorMessage = `Lỗi ${response.status}: ${response.statusText} khi cập nhật.`;
                console.error(`FACULTY_REGISTRATIONS_ERROR: Update API response not OK. Status: ${response.status}, StatusText: ${response.statusText}`);
                try {
                    const errorData = await response.json();
                    errorMessage = errorData.detail || errorMessage;
                    console.error("FACULTY_REGISTRATIONS_ERROR: Update error details from server (JSON):", errorData);
                } catch (jsonError) {
                    console.warn('FACULTY_REGISTRATIONS_WARNING: Server did not return JSON for update error response.', jsonError);
                }
                if (response.status === 401 || response.status === 403) {
                    errorMessage = 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.';
                    console.error(`FACULTY_REGISTRATIONS_ERROR: Authentication/Authorization error (${response.status}) during update. Redirecting to: ${facultyLoginUrl}`);
                    setTimeout(() => {
                        console.log(`FACULTY_REGISTRATIONS_DEBUG: Redirecting window to: ${facultyLoginUrl}`);
                        window.location.href = facultyLoginUrl;
                    }, 500);
                }
                throw new Error(errorMessage);
            }
            console.log("FACULTY_REGISTRATIONS_DEBUG: Update successful!");
            alert('Cập nhật thành công!');
            fetchAdvisoryRegistrations(); // Tải lại dữ liệu sau khi cập nhật thành công
        } catch (error) {
            console.error('FACULTY_REGISTRATIONS_ERROR: Failed to update registration:', error);
            alert('Lỗi cập nhật: ' + error.message);
        }
    }

    async function deleteRegistration(id) {
        console.log(`FACULTY_REGISTRATIONS_DEBUG: deleteRegistration started for ID: ${id}.`);
        const token = getFacultyAuthToken();
        if (!token) {
            console.error("FACULTY_REGISTRATIONS_ERROR: Authentication token not found for delete. Redirecting to:", facultyLoginUrl);
            alert('Lỗi: Không tìm thấy token xác thực. Vui lòng đăng nhập lại.');
            window.location.href = facultyLoginUrl;
            return;
        }
        try {
            // Lưu ý: API xóa có thể cần một endpoint riêng cho giảng viên,
            // hoặc API admin hiện tại cần được cấu hình để cho phép giảng viên xóa.
            // Nếu không, thao tác này có thể bị từ chối bởi backend.
            const apiUrl = `${facultyApiBaseUrl}${id}/`; // Giả định API admin cho phép xóa bằng token giảng viên
            console.log(`FACULTY_REGISTRATIONS_DEBUG: Sending DELETE request to URL: ${apiUrl}`);

            const response = await fetch(apiUrl, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Token ${token}`
                }
            });

            console.log("FACULTY_REGISTRATIONS_DEBUG: Received API response for delete. Status:", response.status, response.statusText);

            if (!response.ok) {
                let errorMessage = `Lỗi ${response.status}: ${response.statusText} khi xóa.`;
                console.error(`FACULTY_REGISTRATIONS_ERROR: Delete API response not OK. Status: ${response.status}, StatusText: ${response.statusText}`);
                try {
                    const errorData = await response.json();
                    errorMessage = errorData.detail || errorMessage;
                    console.error("FACULTY_REGISTRATIONS_ERROR: Delete error details from server (JSON):", errorData);
                } catch (jsonError) {
                    console.warn('FACULTY_REGISTRATIONS_WARNING: Server did not return JSON for delete error response.', jsonError);
                }
                if (response.status === 401 || response.status === 403) {
                    errorMessage = 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.';
                    console.error(`FACULTY_REGISTRATIONS_ERROR: Authentication/Authorization error (${response.status}) during delete. Redirecting to: ${facultyLoginUrl}`);
                    setTimeout(() => {
                        console.log(`FACULTY_REGISTRATIONS_DEBUG: Redirecting window to: ${facultyLoginUrl}`);
                        window.location.href = facultyLoginUrl;
                    }, 500);
                }
                throw new Error(errorMessage);
            }
            console.log("FACULTY_REGISTRATIONS_DEBUG: Delete successful!");
            alert('Xóa đăng ký thành công!');
            fetchAdvisoryRegistrations(); // Tải lại dữ liệu sau khi xóa thành công
        } catch (error) {
            console.error('FACULTY_REGISTRATIONS_ERROR: Failed to delete registration:', error);
            alert('Lỗi xóa đăng ký: ' + error.message);
        }
    }

    // Khởi tạo tải dữ liệu khi DOM đã sẵn sàng
    console.log("FACULTY_REGISTRATIONS_DEBUG: Initializing fetchAdvisoryRegistrations on DOMContentLoaded.");
    fetchAdvisoryRegistrations();
});
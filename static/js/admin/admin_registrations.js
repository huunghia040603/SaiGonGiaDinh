
document.addEventListener('DOMContentLoaded', function() {
    const tableBody = document.getElementById('advisory-registrations-table-body');
    const notesModal = new bootstrap.Modal(document.getElementById('notesModal'));
    const notesTextarea = document.getElementById('notesTextarea');
    const notesRegistrationId = document.getElementById('notesRegistrationId');
    const saveNotesBtn = document.getElementById('saveNotesBtn');
    const exportExcelBtn = document.getElementById('exportExcelBtn');
    const filterForm = document.getElementById('filterForm'); // Lấy form bộ lọc
    const startDateInput = document.getElementById('startDate'); // Lấy input Từ ngày
    const endDateInput = document.getElementById('endDate'); // Lấy input Đến ngày
    const exactDateInput = document.getElementById('exactDate'); // Lấy input Ngày chính xác

    let allRegistrationsData = [];

    function getAuthToken() {
        if (window.location.pathname.startsWith('/sggd/gv/manage')) {
            return localStorage.getItem('authToken');
        } else if (window.location.pathname.startsWith('/sggd/qtv/admin')) {
            return localStorage.getItem('adminAuthToken');
        }
      
        return null;
    }

    const facultyApiBaseUrl = 'https://saigongiadinh.pythonanywhere.com/api/admin/advisory-registrations/';
    const updateStatusApiUrl = 'https://saigongiadinh.pythonanywhere.com/update-status-registrations/';
    const updateNotesApiUrl = 'https://saigonginh.pythonanywhere.com/update-notes-registrations/';
    const loginUrl = window.location.pathname.startsWith('/sggd/qtv/admin') ? '/admin/login' : '/sggd/gv/manage';

    /**
     * Hàm xây dựng URL API với các tham số lọc theo ngày.
     * @param {string} startDate Ngày bắt đầu (định dạng YYYY-MM-DD).
     * @param {string} endDate Ngày kết thúc (định dạng YYYY-MM-DD).
     * @param {string} exactDate Ngày chính xác (định dạng YYYY-MM-DD).
     * @returns {string} URL API hoàn chỉnh.
     */
    function buildApiUrlWithDates(startDate, endDate, exactDate) {
        const params = new URLSearchParams();

        if (exactDate) {
            params.append('registration_date_exact', exactDate);
        } else {
            if (startDate) {
                params.append('registration_date_after', startDate);
            }
            if (endDate) {
                params.append('registration_date_before', endDate);
            }
        }
        
        const queryString = params.toString();
        return queryString ? `${facultyApiBaseUrl}?${queryString}` : facultyApiBaseUrl;
    }

    async function fetchAdvisoryRegistrations(reopenModal = false, apiUrl = facultyApiBaseUrl) {
       
        tableBody.innerHTML = '<tr><td colspan="11" class="text-center">Đang tải dữ liệu...</td></tr>';
        const token = getAuthToken();

        if (!token) {
            console.error("fetchAdvisoryRegistrations: Lỗi - Không tìm thấy token xác thực.");
            tableBody.innerHTML = '<tr><td colspan="11" class="text-center text-danger">Lỗi: Không tìm thấy token xác thực. Vui lòng đăng nhập lại.</td></tr>';
            setTimeout(() => {
                window.location.href = loginUrl;
            }, 1000);
            return;
        }

        try {
           
            const response = await fetch(apiUrl, {
                method: 'GET',
                headers: {
                    'Authorization': `Token ${token}`,
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                }
            });

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
                        window.location.href = loginUrl;
                    }, 500);
                }
                throw new Error(errorMessage);
            }

            const data = await response.json();
            allRegistrationsData = data;
         
            renderTable(data);

        } catch (error) {
            console.error('fetchAdvisoryRegistrations: Lỗi khi tải dữ liệu:', error);
            tableBody.innerHTML = `<tr><td colspan="11" class="text-center text-danger">Lỗi: ${error.message}</td></tr>`;
        }
    }

    function renderTable(registrations) {
        // ... (phần code renderTable không thay đổi)
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
                <td>${reg.phone_number || ''}</td>
                <td>${reg.email || ''}</td>
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
        attachEventListeners();
    }

    function attachEventListeners() {
        // ... (phần code attachEventListeners không thay đổi)
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
        // Gắn sự kiện cho form lọc
        if (filterForm) {
            filterForm.addEventListener('submit', handleFilterFormSubmit);
        }
        if (exportExcelBtn) {
            exportExcelBtn.addEventListener('click', exportToExcel);
        }
    }

    // --- Hàm xử lý sự kiện cho form lọc ---
    async function handleFilterFormSubmit(event) {
        event.preventDefault();
        const startDate = startDateInput.value;
        const endDate = endDateInput.value;
        const exactDate = exactDateInput.value;

        const filteredApiUrl = buildApiUrlWithDates(startDate, endDate, exactDate);
        
        await fetchAdvisoryRegistrations(false, filteredApiUrl);
    }

    async function updateRegistration(id, dataToUpdate) {
        const token = getAuthToken();
        if (!token) {
            alert('Lỗi: Không tìm thấy token xác thực. Vui lòng đăng nhập lại.');
            setTimeout(() => { window.location.href = loginUrl; }, 500);
            return;
        }

        let apiUrl = `https://saigongiadinh.pythonanywhere.com/api/admin/advisory-registrations/${id}/`;
        let method = 'PATCH';

        if (dataToUpdate.hasOwnProperty('status')) {
            apiUrl = `${updateStatusApiUrl}${id}/`;
        } else if (dataToUpdate.hasOwnProperty('notes')) {
            apiUrl = `${updateNotesApiUrl}${id}/`;
        }

        try {
            const response = await fetch(apiUrl, {
                method: method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Token ${token}`
                },
                body: JSON.stringify(dataToUpdate)
            });

            if (!response.ok) {
                let errorMessage = `Lỗi ${response.status}: ${response.statusText} khi cập nhật.`;
                if (response.status === 401 || response.status === 403) {
                    errorMessage = 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.';
                    setTimeout(() => { window.location.href = loginUrl; }, 500);
                }
                throw new Error(errorMessage);
            }
            alert('Cập nhật thành công!');
            const currentFilteredUrl = buildApiUrlWithDates(startDateInput.value, endDateInput.value, exactDateInput.value);
            fetchAdvisoryRegistrations(false, currentFilteredUrl);
            notesModal.hide();
        } catch (error) {
            alert('Lỗi cập nhật: ' + error.message);
        }
    }

    async function deleteRegistration(id) {
        const token = getAuthToken();
        if (!token) {
            alert('Lỗi: Không tìm thấy token xác thực. Vui lòng đăng nhập lại.');
            window.location.href = loginUrl;
            return;
        }
        try {
            const apiUrl = `https://saigongiadinh.pythonanywhere.com/api/admin/advisory-registrations/${id}/`;
            const response = await fetch(apiUrl, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Token ${token}`
                }
            });

            if (!response.ok) {
                let errorMessage = `Lỗi ${response.status}: ${response.statusText} khi xóa.`;
                if (response.status === 401 || response.status === 403) {
                    errorMessage = 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.';
                    setTimeout(() => { window.location.href = loginUrl; }, 500);
                }
                throw new Error(errorMessage);
            }
            alert('Xóa đăng ký thành công!');
            const currentFilteredUrl = buildApiUrlWithDates(startDateInput.value, endDateInput.value, exactDateInput.value);
            fetchAdvisoryRegistrations(false, currentFilteredUrl);
        } catch (error) {
            alert('Lỗi xóa đăng ký: ' + error.message);
        }
    }

    async function exportToExcel() {
        const dataToExport = allRegistrationsData;
        if (dataToExport.length === 0) {
            alert('Không có dữ liệu để xuất ra Excel.');
            return;
        }
        const combinedSheetData = [];
        combinedSheetData.push([
            'ID Đăng ký', 'Họ và tên', 'Điện thoại', 'Email', 'Địa chỉ', 'Ngành quan tâm',
            'Tốt nghiệp', 'Ngày đăng ký', 'Trạng thái', 'Ghi chú'
        ]);
        dataToExport.forEach(reg => {
            combinedSheetData.push([
                reg.id, reg.full_name, reg.phone_number || '', reg.email || '', reg.address || 'N/A',
                reg.major_of_interest ? reg.major_of_interest.name : 'Chưa xác định',
                reg.has_graduated_display, new Date(reg.registration_date).toLocaleDateString('vi-VN'),
                reg.status, reg.notes || ''
            ]);
        });
        const wb = XLSX.utils.book_new();
        const wsCombined = XLSX.utils.aoa_to_sheet(combinedSheetData);
        XLSX.utils.book_append_sheet(wb, wsCombined, "Danh sách đăng ký tư vấn");
        XLSX.writeFile(wb, "DanhSachDangKyTuVan.xlsx");
        alert('Đã xuất dữ liệu ra file Excel thành công!');
    }

    if (exportExcelBtn) {
        exportExcelBtn.addEventListener('click', exportToExcel);
    }

    fetchAdvisoryRegistrations();
});
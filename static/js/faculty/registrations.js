document.addEventListener('DOMContentLoaded', function() {
     const tableBody = document.getElementById('advisory-registrations-table-body');
    // Khởi tạo Modal ngay từ đầu, nhưng nó sẽ không tự động show
    const notesModal = new bootstrap.Modal(document.getElementById('advisoryNotesModal')); // Đã đổi ID ở đây
    const notesTextarea = document.getElementById('notesTextarea');
    const notesRegistrationId = document.getElementById('notesRegistrationId');
    const saveNotesBtn = document.getElementById('saveNotesBtn');

    // Hàm lấy token xác thực dựa trên đường dẫn hiện tại
    function getAuthToken() {
        const currentPath = window.location.pathname;
        console.log('DEBUG: Current path:', currentPath);

        if (currentPath.startsWith('/sggd/gv/manage')) {
            const token = localStorage.getItem('authToken'); // Token của giảng viên
            console.log('DEBUG: Lấy token giảng viên:', token ? 'Có' : 'Không');
            return token; 
        } else if (currentPath.startsWith('/sggd/qtv/admin')) {
            const token = localStorage.getItem('adminAuthToken'); // Token của admin
            console.log('DEBUG: Lấy token admin:', token ? 'Có' : 'Không');
            return token;
        }
        console.warn('DEBUG: Không tìm thấy đường dẫn phù hợp để lấy token. Trả về null.');
        return null; // Trường hợp không khớp đường dẫn nào
    }

    // Hàm tải dữ liệu đăng ký tư vấn từ API
    async function fetchAdvisoryRegistrations() {
        console.log('DEBUG: Bắt đầu tải dữ liệu đăng ký...');
        tableBody.innerHTML = '<tr><td colspan="11" class="text-center">Đang tải dữ liệu...</td></tr>';
        const token = getAuthToken();

        if (!token) {
            console.error('ERROR: Không tìm thấy token xác thực. Yêu cầu đăng nhập lại.');
            tableBody.innerHTML = '<tr><td colspan="11" class="text-center text-danger">Lỗi: Không tìm thấy token xác thực. Vui lòng đăng nhập lại.</td></tr>';
            
            setTimeout(() => {
                // Chuyển hướng về trang đăng nhập phù hợp
                if (window.location.pathname.startsWith('/sggd/qtv/admin')) {
                    window.location.href = '/admin/login'; // Đường dẫn đăng nhập admin
                } else {
                    window.location.href = '/sggd/gv/manage'; // Đường dẫn đăng nhập giảng viên
                }
            }, 1000); 
            return;
        }

        try {
            const apiUrl = 'https://saigongiadinh.pythonanywhere.com/api/admin/advisory-registrations/';
            console.log('DEBUG: Đang gửi yêu cầu GET đến API:', apiUrl);
            console.log('DEBUG: Với header Authorization:', `Token ${token}`);

            const response = await fetch(apiUrl, {
                method: 'GET',
                headers: {
                    'Authorization': `Token ${token}`, // Gửi token dưới dạng 'Token <your_token>'
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                }
            });

            console.log('DEBUG: Phản hồi từ API. Status:', response.status, response.statusText);

            if (!response.ok) {
                let errorMessage = `Lỗi ${response.status}: ${response.statusText}`;
                try {
                    const errorData = await response.json();
                    errorMessage = errorData.detail || errorMessage;
                    console.error('ERROR: Chi tiết lỗi từ server:', errorData);
                } catch (jsonError) {
                    console.warn('WARNING: Server không trả về JSON cho lỗi HTTP:', jsonError);
                }

                if (response.status === 401 || response.status === 403) {
                    errorMessage = 'Bạn không có quyền truy cập hoặc phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.';
                    console.error('ERROR: Lỗi xác thực hoặc ủy quyền. Chuyển hướng sau 0.5s.');
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
            console.log('DEBUG: Dữ liệu nhận được:', data);
            renderTable(data);

        } catch (error) {
            console.error('ERROR: Lỗi khi tải dữ liệu trong khối catch:', error);
            tableBody.innerHTML = `<tr><td colspan="11" class="text-center text-danger">Lỗi: ${error.message}</td></tr>`;
        }
    }

    // Hàm hiển thị dữ liệu lên bảng
    function renderTable(registrations) {
        tableBody.innerHTML = ''; // Xóa nội dung "Đang tải..."
        if (registrations.length === 0) {
            tableBody.innerHTML = '<tr><td colspan="11" class="text-center">Không có đăng ký tư vấn nào.</td></tr>';
            console.log('DEBUG: Không có dữ liệu đăng ký.');
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
                    <select class="status-select" data-id="${reg.id}">
                        <option value="NEW" ${reg.status === 'NEW' ? 'selected' : ''}>Mới đăng ký</option>
                        <option value="CONTACTED" ${reg.status === 'CONTACTED' ? 'selected' : ''}>Đã liên hệ</option>
                        <option value="CONSULTED" ${reg.status === 'CONSULTED' ? 'selected' : ''}>Đã tư vấn</option>
                        <option value="REJECTED" ${reg.status === 'REJECTED' ? 'selected' : ''}>Từ chối</option>
                    </select>
                </td>
                <td>
                    <button class="action-button view-notes-btn" data-id="${reg.id}" data-notes="${reg.notes || ''}">
                        <i class="fas fa-sticky-note"></i> Ghi chú
                    </button>
                </td>
                <td>
                    <button class="action-button delete-btn" data-id="${reg.id}">
                        <i class="fas fa-trash"></i> Xóa
                    </button>
                </td>
            `;
            tableBody.appendChild(row);
        });
        console.log('DEBUG: Dữ liệu đã được hiển thị lên bảng.');
        attachEventListeners(); // Gắn lại các sự kiện sau khi render bảng
    }

    // Hàm gắn các sự kiện cho nút và dropdown
    function attachEventListeners() {
        // Sự kiện thay đổi trạng thái
        tableBody.querySelectorAll('.status-select').forEach(select => {
            select.addEventListener('change', async (event) => {
                const registrationId = event.target.dataset.id;
                const newStatus = event.target.value;
                console.log(`DEBUG: Cập nhật trạng thái cho ID ${registrationId} thành ${newStatus}`);
                await updateRegistration(registrationId, { status: newStatus });
            });
        });

        // Sự kiện xem/chỉnh sửa ghi chú
        tableBody.querySelectorAll('.view-notes-btn').forEach(button => {
            button.addEventListener('click', (event) => {
                const id = event.currentTarget.dataset.id;
                const notes = event.currentTarget.dataset.notes;
                notesRegistrationId.value = id;
                notesTextarea.value = notes;
                notesModal.show(); // DÒNG NÀY SẼ CHỈ CHẠY KHI BẠN NHẤN NÚT
                console.log(`DEBUG: Mở modal ghi chú cho ID ${id}. Nội dung: "${notes}"`);
            });
        });

        // Sự kiện xóa đăng ký
        tableBody.querySelectorAll('.delete-btn').forEach(button => {
            button.addEventListener('click', async (event) => {
                const registrationId = event.currentTarget.dataset.id;
                console.log(`DEBUG: Người dùng yêu cầu xóa ID ${registrationId}`);
                if (confirm('Bạn có chắc chắn muốn xóa đăng ký này?')) {
                    await deleteRegistration(registrationId);
                }
            });
        });
    }

    // Sự kiện lưu ghi chú từ modal
    saveNotesBtn.addEventListener('click', async () => {
        const id = notesRegistrationId.value;
        const newNotes = notesTextarea.value;
        console.log(`DEBUG: Lưu ghi chú cho ID ${id}. Ghi chú mới: "${newNotes}"`);
        await updateRegistration(id, { notes: newNotes });
        notesModal.hide(); // Ẩn modal sau khi lưu
    });

    // Hàm cập nhật đăng ký (trạng thái hoặc ghi chú)
    async function updateRegistration(id, dataToUpdate) {
        const token = getAuthToken();
        if (!token) {
            alert('Lỗi: Không tìm thấy token xác thực. Vui lòng đăng nhập lại.');
            console.error('ERROR: Không tìm thấy token khi cập nhật.');
            setTimeout(() => {
                if (window.location.pathname.startsWith('/sggd/qtv/admin')) {
                    window.location.href = '/admin/login';
                } else {
                    window.location.href = '/sggd/gv/manage';
                }
            }, 500);
            return;
        }
        try {
            const response = await fetch(`https://saigongiadinh.pythonanywhere.com/api/admin/advisory-registrations/${id}/`, {
                method: 'PATCH', // Sử dụng PATCH để cập nhật một phần
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
                    console.error('ERROR: Chi tiết lỗi từ server khi cập nhật:', errorData);
                } catch (jsonError) {
                    console.warn('WARNING: Server không trả về JSON cho lỗi cập nhật:', jsonError);
                }
                if (response.status === 401 || response.status === 403) {
                    errorMessage = 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.';
                    console.error('ERROR: Lỗi xác thực/ủy quyền khi cập nhật. Chuyển hướng sau 0.5s.');
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
            alert('Cập nhật thành công!');
            console.log('DEBUG: Cập nhật thành công. Tải lại dữ liệu...');
            fetchAdvisoryRegistrations(); // Tải lại dữ liệu sau khi cập nhật
        } catch (error) {
            console.error('ERROR: Lỗi cập nhật trong khối catch:', error);
            alert('Lỗi cập nhật: ' + error.message);
        }
    }

    // Hàm xóa đăng ký
    async function deleteRegistration(id) {
        const token = getAuthToken();
        if (!token) {
            alert('Lỗi: Không tìm thấy token xác thực. Vui lòng đăng nhập lại.');
            console.error('ERROR: Không tìm thấy token khi xóa.');
            setTimeout(() => {
                if (window.location.pathname.startsWith('/sggd/qtv/admin')) {
                    window.location.href = '/admin/login'; 
                } else {
                    window.location.href = '/sggd/gv/manage';
                }
            }, 500);
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
                    console.error('ERROR: Chi tiết lỗi từ server khi xóa:', errorData);
                } catch (jsonError) {
                    console.warn('WARNING: Server không trả về JSON cho lỗi xóa:', jsonError);
                }
                if (response.status === 401 || response.status === 403) {
                    errorMessage = 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.';
                    console.error('ERROR: Lỗi xác thực/ủy quyền khi xóa. Chuyển hướng sau 0.5s.');
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
            alert('Xóa đăng ký thành công!');
            console.log('DEBUG: Xóa thành công. Tải lại dữ liệu...');
            fetchAdvisoryRegistrations(); // Tải lại dữ liệu sau khi xóa
        } catch (error) {
            console.error('ERROR: Lỗi xóa đăng ký trong khối catch:', error);
            alert('Lỗi xóa đăng ký: ' + error.message);
        }
    }

    // Gọi hàm tải dữ liệu khi DOM đã được tải hoàn chỉnh
    fetchAdvisoryRegistrations();
});
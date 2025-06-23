// /static/js/faculty/faculty_registrations.js
document.addEventListener('DOMContentLoaded', function() {
    const tableBody = document.getElementById('advisory-registrations-table-body');
    const notesModal = new bootstrap.Modal(document.getElementById('notesModal'));
    const notesTextarea = document.getElementById('notesTextarea');
    const notesRegistrationId = document.getElementById('notesRegistrationId');
    const saveNotesBtn = document.getElementById('saveNotesBtn');

    // Khai báo modal chi tiết đăng ký và các phần tử bên trong nó
    const registrationDetailsModal = new bootstrap.Modal(document.getElementById('registrationDetailsModal'));
    const modalFullNameSpan = document.getElementById('modalFullName');
    const modalPhoneEmailSpan = document.getElementById('modalPhoneEmail');
    const modalRegistrationsTableBody = document.getElementById('modal-registrations-table-body');

    let allRegistrationsData = []; // Biến để lưu trữ toàn bộ dữ liệu đăng ký gốc

    

    // Hàm lấy token riêng cho giảng viên
    function getFacultyAuthToken() {
        const token = localStorage.getItem('authToken'); // Luôn lấy authToken cho giảng viên
        
        return token;
    }

    // URL đăng nhập dành riêng cho giảng viên
    const facultyLoginUrl = '/sggd/gv/manage/';
    // URL API dành riêng cho giảng viên (Cần đảm bảo API này có tồn tại và đúng quyền trên backend)
    const facultyApiBaseUrl = 'https://saigongiadinh.pythonanywhere.com/api/admin/advisory-registrations/'; 
    const updateStatusApiUrl = 'https://saigongiadinh.pythonanywhere.com/update-status-registrations/';
    const updateNotesApiUrl = 'https://saigongiadinh.pythonanywhere.com/update-notes-registrations/';


    async function fetchAdvisoryRegistrations() {
      
        tableBody.innerHTML = '<tr><td colspan="11" class="text-center">Đang tải dữ liệu...</td></tr>'; 

        const token = getFacultyAuthToken();
        
        

        if (!token) {
            console.error("FACULTY_REGISTRATIONS_ERROR: Authentication token not found for faculty. Redirecting to:", facultyLoginUrl);
            tableBody.innerHTML = '<tr><td colspan="11" class="text-center text-danger">Lỗi: Không tìm thấy token xác thực. Vui lòng đăng nhập lại.</td></tr>';
            setTimeout(() => {
                
                window.location.href = facultyLoginUrl;
            }, 1000);
            return;
        }
       

        try {
            
            const response = await fetch(facultyApiBaseUrl, {
                method: 'GET',
                headers: {
                    'Authorization': `Token ${token}`,
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                }
            });
            

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
                       
                        window.location.href = facultyLoginUrl;
                    }, 500);
                }
                throw new Error(errorMessage);
            }

            const data = await response.json();
            allRegistrationsData = data; // Lưu dữ liệu gốc
            
            renderTable(allRegistrationsData); // Truyền dữ liệu gốc để render bảng tổng quan

        } catch (error) {
            console.error('FACULTY_REGISTRATIONS_ERROR: Failed to fetch advisory registrations:', error);
            tableBody.innerHTML = `<tr><td colspan="11" class="text-center text-danger">Lỗi: ${error.message}</td></tr>`;
        }
    }

    // Hàm để nhóm các đăng ký theo người dùng (điện thoại hoặc email)
    function groupRegistrationsByUser(registrations) {
        const grouped = new Map();

        registrations.forEach(reg => {
            // Sử dụng email làm khóa chính nếu có, nếu không thì dùng số điện thoại
            // Đây là một giả định, bạn có thể cần điều chỉnh logic khóa nhóm tùy theo dữ liệu của bạn
            const key = reg.email || reg.phone_number; 
            if (!key) return; // Bỏ qua nếu không có cả email và số điện thoại

            if (!grouped.has(key)) {
                grouped.set(key, {
                    full_name: reg.full_name,
                    phone_number: reg.phone_number,
                    email: reg.email,
                    address: reg.address,
                    has_graduated_display: reg.has_graduated_display,
                    registrations: [], 
                });
            }
            grouped.get(key).registrations.push(reg);
        });

        // Sắp xếp các đăng ký con trong mỗi nhóm theo ngày đăng ký (mới nhất lên đầu)
        grouped.forEach(group => {
            group.registrations.sort((a, b) => new Date(b.registration_date) - new Date(a.registration_date));
        });

        return Array.from(grouped.values());
    }

    function renderTable(registrations) {
      
        tableBody.innerHTML = ''; // Xóa sạch nội dung cũ của bảng
        if (registrations.length === 0) {
            
            tableBody.innerHTML = '<tr><td colspan="11" class="text-center">Không có đăng ký tư vấn nào.</td></tr>'; 
            return;
        }

        const groupedRegistrations = groupRegistrationsByUser(registrations);
        

        groupedRegistrations.forEach((group, groupIndex) => {
            // Hàng cha
            const masterRow = document.createElement('tr');
            masterRow.classList.add('master-row'); 
            masterRow.innerHTML = `
                <td>
                    <button class="btn btn-sm btn-outline-primary view-details-btn" 
                            data-full-name="${group.full_name}" 
                            data-phone-number="${group.phone_number || ''}" 
                            data-email="${group.email || ''}"
                            data-group-index="${groupIndex}">
                        <i class="bi bi-plus-lg"></i>
                    </button>
                </td>
                <td>${group.full_name}</td>
                <td>${group.phone_number || 'N/A'}</td>
                <td>${group.email || 'N/A'}</td>
                <td>${group.address || 'N/A'}</td>
                <td>${group.has_graduated_display}</td>
                <td colspan="5">${group.registrations.length} lượt đăng ký</td>
            `;
            tableBody.appendChild(masterRow);
        });
        
        attachEventListeners();
    }

    function attachEventListeners() {
        
        // Event listener cho nút "Xem chi tiết" (dấu cộng) trên bảng chính
        tableBody.querySelectorAll('.view-details-btn').forEach(button => {
            button.removeEventListener('click', handleViewDetailsClick); // Gỡ bỏ listener cũ nếu có
            button.addEventListener('click', handleViewDetailsClick); // Gắn listener mới
        });

        // Event listeners cho các nút trong MODAL (cần ủy quyền sự kiện vì chúng được thêm động)
        // Lưu ý: Các sự kiện này được gắn vào modal-registrations-table-body, không phải tableBody chính
        modalRegistrationsTableBody.removeEventListener('change', handleModalStatusChange);
        modalRegistrationsTableBody.addEventListener('change', handleModalStatusChange);

        modalRegistrationsTableBody.removeEventListener('click', handleModalButtonClick);
        modalRegistrationsTableBody.addEventListener('click', handleModalButtonClick);

        // Event listener cho nút Lưu ghi chú trong modal ghi chú
        saveNotesBtn.removeEventListener('click', handleSaveNotesClick);
        saveNotesBtn.addEventListener('click', handleSaveNotesClick);

        
    }

    // --- Các hàm xử lý sự kiện ---

    async function handleViewDetailsClick(event) {
        event.preventDefault(); // Ngăn chặn hành vi mặc định của thẻ (nếu có, ví dụ nếu nó là <a>)
        const groupIndex = event.currentTarget.dataset.groupIndex;
        const fullName = event.currentTarget.dataset.fullName;
        const phoneNumber = event.currentTarget.dataset.phoneNumber;
        const email = event.currentTarget.dataset.email;

        // Tìm nhóm đăng ký tương ứng
        const groupedData = groupRegistrationsByUser(allRegistrationsData);
        const currentGroup = groupedData[groupIndex];

        if (currentGroup) {
            displayRegistrationDetailsInModal(currentGroup, fullName, phoneNumber, email);
        } else {
            console.error("FACULTY_REGISTRATIONS_ERROR: Could not find group for index:", groupIndex);
            alert("Không tìm thấy chi tiết đăng ký cho người này.");
        }
    }

    async function handleModalStatusChange(event) {
        if (event.target.classList.contains('status-select')) {
            const registrationId = event.target.dataset.id;
            const newStatus = event.target.value;
            
            await updateRegistration(registrationId, { status: newStatus });
        }
    }

    async function handleModalButtonClick(event) {
        if (event.target.closest('.view-notes-btn')) {
            const button = event.target.closest('.view-notes-btn');
            const id = button.dataset.id;
            const notes = button.dataset.notes;
          
            notesRegistrationId.value = id;
            notesTextarea.value = notes;
            notesModal.show();
        } else if (event.target.closest('.delete-btn')) {
            const button = event.target.closest('.delete-btn');
            const registrationId = button.dataset.id;
           
            if (confirm('Bạn có chắc chắn muốn xóa đăng ký này?')) {
                
                deleteRegistration(registrationId); // Gọi hàm xóa
            } else {
                
            }
        }
    }

    async function handleSaveNotesClick() {
      
        const id = notesRegistrationId.value;
        const newNotes = notesTextarea.value;
       
        await updateRegistration(id, { notes: newNotes });
        // notesModal.hide(); // Sẽ được ẩn sau khi fetchAdvisoryRegistrations() hoàn tất
       
    }

    // Hàm hiển thị chi tiết đăng ký trong Modal
    function displayRegistrationDetailsInModal(groupData, fullName, phoneNumber, email) {
        modalFullNameSpan.textContent = fullName;
        modalPhoneEmailSpan.textContent = (phoneNumber && email) ? `${phoneNumber} / ${email}` : (phoneNumber || email || 'N/A');
        
        modalRegistrationsTableBody.innerHTML = ''; // Xóa nội dung cũ

        if (groupData.registrations.length === 0) {
            modalRegistrationsTableBody.innerHTML = '<tr><td colspan="6" class="text-center">Không có đăng ký nào.</td></tr>';
        } else {
            groupData.registrations.forEach(reg => {
                const row = document.createElement('tr');
                row.dataset.registrationId = reg.id; // Để dễ dàng cập nhật hàng này
                row.innerHTML = `
                    <td>${reg.id}</td>
                    <td>${reg.major_of_interest ? reg.major_of_interest.name : 'Chưa xác định'}</td>
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
                modalRegistrationsTableBody.appendChild(row);
            });
        }
        registrationDetailsModal.show(); // Hiển thị modal
       
    }

    async function updateRegistration(id, dataToUpdate) {
        
        const token = getFacultyAuthToken();
       

        if (!token) {
            console.error("FACULTY_REGISTRATIONS_ERROR: Authentication token not found for update. Redirecting to:", facultyLoginUrl);
            alert('Lỗi: Không tìm thấy token xác thực. Vui lòng đăng nhập lại.');
            setTimeout(() => {
               
                window.location.href = facultyLoginUrl;
            }, 500);
            return;
        }

        let apiUrl;
        let method = 'PATCH';

        if (dataToUpdate.hasOwnProperty('status')) {
            apiUrl = `${updateStatusApiUrl}${id}/`;
         
        } else if (dataToUpdate.hasOwnProperty('notes')) {
            apiUrl = `${updateNotesApiUrl}${id}/`;
           
        } else {
            console.error("FACULTY_REGISTRATIONS_ERROR: Không có dữ liệu hợp lệ để cập nhật.");
            alert('Lỗi: Không có dữ liệu hợp lệ để cập nhật.');
            return;
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
                      
                        window.location.href = facultyLoginUrl;
                    }, 500);
                }
                throw new Error(errorMessage);
            }
          
            alert('Cập nhật thành công!');
            
            // Cập nhật dữ liệu trong bộ nhớ và làm mới hiển thị
            await fetchAdvisoryRegistrations(); // Tải lại toàn bộ dữ liệu để đảm bảo đồng bộ
            notesModal.hide(); // Ẩn modal ghi chú nếu nó đang mở
            registrationDetailsModal.hide(); // Ẩn modal chi tiết nếu nó đang mở (quan trọng để cập nhật lại)
           

        } catch (error) {
            console.error('FACULTY_REGISTRATIONS_ERROR: Failed to update registration:', error);
            alert('Lỗi cập nhật: ' + error.message);
        }
    }

    async function deleteRegistration(id) {
       
        const token = getFacultyAuthToken();
        if (!token) {
            console.error("FACULTY_REGISTRATIONS_ERROR: Authentication token not found for delete. Redirecting to:", facultyLoginUrl);
            alert('Lỗi: Không tìm thấy token xác thực. Vui lòng đăng nhập lại.');
            window.location.href = facultyLoginUrl;
            return;
        }
        try {
            const apiUrl = `${facultyApiBaseUrl}${id}/`; 
           

            const response = await fetch(apiUrl, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Token ${token}`
                }
            });

           

            if (!response.ok) {
                let errorMessage = `Lỗi ${response.status}: ${response.statusText} khi xóa.`;
                console.error(`FACULTY_REGISTRATIONS_ERROR: Delete API response not OK. Status: ${response.status}, StatusText: ${response.statusText}`);
                try {
                    const errorData = await response.json();
                    errorMessage = errorData.detail || errorMessage;
                   
                } catch (jsonError) {
                    
                }
                if (response.status === 401 || response.status === 403) {
                    errorMessage = 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.';
                   
                    setTimeout(() => {
                        
                        window.location.href = facultyLoginUrl;
                    }, 500);
                }
                throw new Error(errorMessage);
            }
           
            alert('Xóa đăng ký thành công!');
            // Sau khi xóa, tải lại toàn bộ dữ liệu để cập nhật bảng chính và đóng modal chi tiết
            await fetchAdvisoryRegistrations();
            registrationDetailsModal.hide(); // Đóng modal chi tiết
           

        } catch (error) {
            console.error('FACULTY_REGISTRATIONS_ERROR: Failed to delete registration:', error);
            alert('Lỗi xóa đăng ký: ' + error.message);
        }
    }

    // Khởi tạo tải dữ liệu khi DOM đã sẵn sàng
    
    fetchAdvisoryRegistrations();
});
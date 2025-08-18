// // /static/js/faculty/faculty_registrations.js
// document.addEventListener('DOMContentLoaded', function() {
//     const tableBody = document.getElementById('advisory-registrations-table-body');
//     const notesModal = new bootstrap.Modal(document.getElementById('notesModal'));
//     const notesTextarea = document.getElementById('notesTextarea');
//     const notesRegistrationId = document.getElementById('notesRegistrationId');
//     const saveNotesBtn = document.getElementById('saveNotesBtn');
//     const exportExcelBtn = document.getElementById('exportExcelBtn'); // Đã có sẵn

//     // Khai báo modal chi tiết đăng ký và các phần tử bên trong nó
//     const registrationDetailsModal = new bootstrap.Modal(document.getElementById('registrationDetailsModal'));
//     const modalFullNameSpan = document.getElementById('modalFullName');
//     const modalPhoneEmailSpan = document.getElementById('modalPhoneEmail');
//     const modalRegistrationsTableBody = document.getElementById('modal-registrations-table-body');

//     let allRegistrationsData = []; // Biến để lưu trữ toàn bộ dữ liệu đăng ký gốc
//     let currentOpenedRegistrationGroup = null; // Biến để lưu trữ nhóm đăng ký đang mở trong modal chi tiết

//     // Hàm lấy token riêng cho giảng viên
//     function getFacultyAuthToken() {
//         const token = localStorage.getItem('authToken'); // Luôn lấy authToken cho giảng viên
//         return token;
//     }

//     // URL đăng nhập dành riêng cho giảng viên
//     const facultyLoginUrl = '/sggd/gv/manage/';
//     // URL API dành riêng cho giảng viên (Cần đảm bảo API này có tồn tại và đúng quyền trên backend)
//     const facultyApiBaseUrl = 'https://saigongiadinh.pythonanywhere.com/api/admin/advisory-registrations/'; 
//     const updateStatusApiUrl = 'https://saigongiadinh.pythonanywhere.com/update-status-registrations/';
//     const updateNotesApiUrl = 'https://saigongiadinh.pythonanywhere.com/update-notes-registrations/';


//     async function fetchAdvisoryRegistrations(reopenModal = false) { // Thêm tham số reopenModal
//         tableBody.innerHTML = '<tr><td colspan="11" class="text-center">Đang tải dữ liệu...</td></tr>'; 

//         const token = getFacultyAuthToken();
        
//         if (!token) {
//             console.error("FACULTY_REGISTRATIONS_ERROR: Authentication token not found for faculty. Redirecting to:", facultyLoginUrl);
//             tableBody.innerHTML = '<tr><td colspan="11" class="text-center text-danger">Lỗi: Không tìm thấy token xác thực. Vui lòng đăng nhập lại.</td></tr>';
//             setTimeout(() => {
//                 window.location.href = facultyLoginUrl;
//             }, 1000);
//             return;
//         }
        
//         try {
//             const response = await fetch(facultyApiBaseUrl, {
//                 method: 'GET',
//                 headers: {
//                     'Authorization': `Token ${token}`,
//                     'Content-Type': 'application/json',
//                     'Accept': 'application/json'
//                 }
//             });
            
//             if (!response.ok) {
//                 let errorMessage = `Lỗi ${response.status}: ${response.statusText}`;
//                 console.error(`FACULTY_REGISTRATIONS_ERROR: API response not OK. Status: ${response.status}, StatusText: ${response.statusText}`);
//                 try {
//                     const errorData = await response.json();
//                     errorMessage = errorData.detail || errorMessage;
//                     console.error("FACULTY_REGISTRATIONS_ERROR: Server error details (JSON):", errorData);
//                 } catch (jsonError) {
//                     console.warn('FACULTY_REGISTRATIONS_WARNING: Server did not return JSON for error response.', jsonError);
//                 }

//                 if (response.status === 401 || response.status === 403) {
//                     errorMessage = 'Bạn không có quyền truy cập hoặc phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.';
//                     console.error(`FACULTY_REGISTRATIONS_ERROR: Authentication/Authorization error (${response.status}). Redirecting to: ${facultyLoginUrl}`);
//                     setTimeout(() => {
//                         window.location.href = facultyLoginUrl;
//                     }, 500);
//                 }
//                 throw new Error(errorMessage);
//             }

//             const data = await response.json();
//             allRegistrationsData = data; // Lưu dữ liệu gốc
            
//             renderTable(allRegistrationsData); // Truyền dữ liệu gốc để render bảng tổng quan

//             // Nếu cờ reopenModal là true và có một nhóm đang được mở
//             if (reopenModal && currentOpenedRegistrationGroup) {
//                 const updatedGroupedData = groupRegistrationsByUser(allRegistrationsData);
//                 // Tìm lại nhóm đã mở bằng email/phone_number
//                 const reOpenedGroup = updatedGroupedData.find(group => 
//                     (group.email && group.email === currentOpenedRegistrationGroup.email) || 
//                     (group.phone_number && group.phone_number === currentOpenedRegistrationGroup.phone_number)
//                 );
                
//                 if (reOpenedGroup) {
//                     // Mở lại modal với dữ liệu đã cập nhật của nhóm đó
//                     displayRegistrationDetailsInModal(reOpenedGroup, reOpenedGroup.full_name, reOpenedGroup.phone_number, reOpenedGroup.email);
//                 } else {
//                     // Nếu nhóm không còn tồn tại (ví dụ: tất cả đăng ký của người đó bị xóa), đóng modal
//                     registrationDetailsModal.hide();
//                     currentOpenedRegistrationGroup = null;
//                 }
//             }

//         } catch (error) {
//             console.error('FACULTY_REGISTRATIONS_ERROR: Failed to fetch advisory registrations:', error);
//             tableBody.innerHTML = `<tr><td colspan="11" class="text-center text-danger">Lỗi: ${error.message}</td></tr>`;
//         }
//     }

//     // Hàm để nhóm các đăng ký theo người dùng (điện thoại hoặc email)
//     function groupRegistrationsByUser(registrations) {
//         const grouped = new Map();

//         registrations.forEach(reg => {
//             const key = reg.email || reg.phone_number; 
//             if (!key) return; 

//             if (!grouped.has(key)) {
//                 grouped.set(key, {
//                     full_name: reg.full_name,
//                     phone_number: reg.phone_number,
//                     email: reg.email,
//                     address: reg.address,
//                     has_graduated_display: reg.has_graduated_display,
//                     registrations: [], 
//                 });
//             }
//             grouped.get(key).registrations.push(reg);
//         });

//         // Sắp xếp các đăng ký con trong mỗi nhóm theo ngày đăng ký (mới nhất lên đầu)
//         grouped.forEach(group => {
//             group.registrations.sort((a, b) => new Date(b.registration_date) - new Date(a.registration_date));
//         });

//         return Array.from(grouped.values());
//     }

//     function renderTable(registrations) {
//         tableBody.innerHTML = ''; // Xóa sạch nội dung cũ của bảng
//         if (registrations.length === 0) {
//             tableBody.innerHTML = '<tr><td colspan="11" class="text-center">Không có đăng ký tư vấn nào.</td></tr>'; 
//             return;
//         }

//         const groupedRegistrations = groupRegistrationsByUser(registrations);

//         groupedRegistrations.forEach((group, groupIndex) => {
//             // Xác định trạng thái tổng thể của nhóm đăng ký
//             let groupStatusClass = '';
//             // Ưu tiên trạng thái 'NEW' > 'CONTACTED' > 'CONSULTED'
//             if (group.registrations.some(reg => reg.status === 'NEW')) {
//                 groupStatusClass = 'group-status-new';
//             } else if (group.registrations.some(reg => reg.status === 'CONTACTED')) {
//                 groupStatusClass = 'group-status-contacted';
//             } else if (group.registrations.every(reg => reg.status === 'CONSULTED')) {
//                 groupStatusClass = 'group-status-consulted';
//             }
//             // else: Nếu không có đăng ký nào thì không có màu, hoặc nếu có trạng thái lạ thì không có màu.

//             // Hàng cha
//             const masterRow = document.createElement('tr');
//             masterRow.classList.add('master-row'); 

//             // THÊM CLASS TRẠNG THÁI VÀO HÀNG CHA Ở ĐÂY
//             if (groupStatusClass) {
//                 masterRow.classList.add(groupStatusClass);
//             }
//             // HẾT PHẦN THÊM CLASS

//             masterRow.innerHTML = `
//                 <td>
//                     <button class="btn btn-sm btn-outline-primary view-details-btn" 
//                                 data-full-name="${group.full_name}" 
//                                 data-phone-number="${group.phone_number || ''}" 
//                                 data-email="${group.email || ''}"
//                                 data-group-index="${groupIndex}">
//                             <i class="bi bi-plus-lg"></i>
//                         </button>
//                 </td>
//                 <td>${group.full_name}</td>
//                 <td>${group.phone_number || 'N/A'}</td>
//                 <td>${group.email || 'N/A'}</td>
//                 <td>${group.address || 'N/A'}</td>
//                 <td>${group.has_graduated_display}</td>
//                 <td colspan="5">${group.registrations.length} lượt đăng ký</td>
//             `;
//             tableBody.appendChild(masterRow);
//         });

//         attachEventListeners();
//     }

//     function attachEventListeners() {
//         // Event listener cho nút "Xem chi tiết" (dấu cộng) trên bảng chính
//         tableBody.querySelectorAll('.view-details-btn').forEach(button => {
//             button.removeEventListener('click', handleViewDetailsClick); // Gỡ bỏ listener cũ nếu có
//             button.addEventListener('click', handleViewDetailsClick); // Gắn listener mới
//         });

//         // Event listeners cho các nút trong MODAL (cần ủy quyền sự kiện vì chúng được thêm động)
//         // Lưu ý: Các sự kiện này được gắn vào modal-registrations-table-body, không phải tableBody chính
//         modalRegistrationsTableBody.removeEventListener('change', handleModalStatusChange);
//         modalRegistrationsTableBody.addEventListener('change', handleModalStatusChange);

//         modalRegistrationsTableBody.removeEventListener('click', handleModalButtonClick);
//         modalRegistrationsTableBody.addEventListener('click', handleModalButtonClick);

//         // Event listener cho nút Lưu ghi chú trong modal ghi chú
//         saveNotesBtn.removeEventListener('click', handleSaveNotesClick);
//         saveNotesBtn.addEventListener('click', handleSaveNotesClick);

//         // Đảm bảo khi modal chi tiết bị ẩn, biến theo dõi nhóm được reset
//         registrationDetailsModal._element.addEventListener('hidden.bs.modal', () => {
//             currentOpenedRegistrationGroup = null;
//         });

//         // Event listener cho nút Xuất Excel
//         exportExcelBtn.removeEventListener('click', exportToExcel); // Gỡ bỏ listener cũ nếu có
//         exportExcelBtn.addEventListener('click', exportToExcel); // Gắn listener mới
//     }

//     // --- Các hàm xử lý sự kiện ---

//     async function handleViewDetailsClick(event) {
//         event.preventDefault(); 
//         const groupIndex = event.currentTarget.dataset.groupIndex;
//         const fullName = event.currentTarget.dataset.fullName;
//         const phoneNumber = event.currentTarget.dataset.phoneNumber;
//         const email = event.currentTarget.dataset.email;

//         const groupedData = groupRegistrationsByUser(allRegistrationsData);
//         const currentGroup = groupedData[groupIndex];

//         if (currentGroup) {
//             currentOpenedRegistrationGroup = currentGroup; // Lưu trữ nhóm đang mở
//             displayRegistrationDetailsInModal(currentGroup, fullName, phoneNumber, email);
//         } else {
//             console.error("FACULTY_REGISTRATIONS_ERROR: Could not find group for index:", groupIndex);
//             alert("Không tìm thấy chi tiết đăng ký cho người này.");
//         }
//     }

//     async function handleModalStatusChange(event) {
//         if (event.target.classList.contains('status-select')) {
//             const registrationId = event.target.dataset.id;
//             const newStatus = event.target.value;
            
//             await updateRegistration(registrationId, { status: newStatus });
//         }
//     }

//     async function handleModalButtonClick(event) {
//         if (event.target.closest('.view-notes-btn')) {
//             const button = event.target.closest('.view-notes-btn');
//             const id = button.dataset.id;
//             const notes = button.dataset.notes;
            
//             notesRegistrationId.value = id;
//             notesTextarea.value = notes;
//             registrationDetailsModal.hide(); // Ẩn modal chi tiết trước khi mở modal ghi chú
//             notesModal.show();
//         } else if (event.target.closest('.delete-btn')) {
//             const button = event.target.closest('.delete-btn');
//             const registrationId = button.dataset.id;
            
//             if (confirm('Bạn có chắc chắn muốn xóa đăng ký này?')) {
//                 deleteRegistration(registrationId); 
//             }
//         }
//     }

//     async function handleSaveNotesClick() {
//         const id = notesRegistrationId.value;
//         const newNotes = notesTextarea.value;
        
//         await updateRegistration(id, { notes: newNotes });
//         notesModal.hide(); // Ẩn modal ghi chú sau khi lưu
//         // Modal chi tiết sẽ tự động được mở lại thông qua fetchAdvisoryRegistrations(true)
//     }

//     // Hàm hiển thị chi tiết đăng ký trong Modal
//     function displayRegistrationDetailsInModal(groupData, fullName, phoneNumber, email) {
//         modalFullNameSpan.textContent = fullName;
//         modalPhoneEmailSpan.textContent = (phoneNumber && email) ? `${phoneNumber} / ${email}` : (phoneNumber || email || 'N/A');
        
//         modalRegistrationsTableBody.innerHTML = ''; // Xóa nội dung cũ

//         if (groupData.registrations.length === 0) {
//             modalRegistrationsTableBody.innerHTML = '<tr><td colspan="6" class="text-center">Không có đăng ký nào.</td></tr>';
//         } else {
            
//             const modalRegistrationsTableBody = document.getElementById('modal-registrations-table-body');
//             modalRegistrationsTableBody.innerHTML = ''; // Xóa nội dung cũ
//             console.log("Dữ liệu groupData trong modal:", groupData); 
//             groupData.registrations.forEach(reg => {
//                 console.log("Trạng thái đăng ký ID", reg.id, ":", reg.status);
//                 const row = document.createElement('tr');
//                 row.dataset.registrationId = reg.id;

//                 // Xác định class CSS dựa trên trạng thái
//                 let statusClass = '';
//                 if (reg.status === 'CONTACTED') {
//                     statusClass = 'status-contacted';
//                 } else if (reg.status === 'CONSULTED') {
//                     statusClass = 'status-consulted';
//                 } else {
//                     statusClass = 'status-new'; // Mặc định cho 'NEW' hoặc các trạng thái khác
//                 }

//                 // ******************************************************
//                 // QUAN TRỌNG: Thêm class vào chính thẻ <tr>
//                 row.classList.add(statusClass);
//                 // ******************************************************

//                 row.innerHTML = `
//                     <td>${reg.id}</td>
//                     <td>${reg.major_of_interest ? reg.major_of_interest.name : 'Chưa xác định'}</td>
//                     <td>${new Date(reg.registration_date).toLocaleDateString('vi-VN')}</td>
//                     <td>
//                         <select class="form-select status-select" data-id="${reg.id}" name="status">
//                             <option value="NEW" ${reg.status === 'NEW' ? 'selected' : ''}>Mới đăng ký</option>
//                             <option value="CONTACTED" ${reg.status === 'CONTACTED' ? 'selected' : ''}>Đã liên hệ</option>
//                             <option value="CONSULTED" ${reg.status === 'CONSULTED' ? 'selected' : ''}>Đã tư vấn</option>
//                         </select>
//                     </td>
//                     <td>
//                         <button class="btn btn-sm btn-info view-notes-btn" data-id="${reg.id}" data-notes="${reg.notes || ''}">
//                             <i class="bi bi-journal-text"></i>
//                         </button>
//                     </td>
//                     <td>
//                         <button class="btn btn-sm btn-danger delete-btn" data-id="${reg.id}">
//                             <i class="bi bi-trash"></i>
//                         </button>
//                     </td>
//                 `;
//                 modalRegistrationsTableBody.appendChild(row);
//             });
//         }
//         registrationDetailsModal.show(); // Hiển thị modal
//     }

//     async function updateRegistration(id, dataToUpdate) {
//         const token = getFacultyAuthToken();

//         if (!token) {
//             console.error("FACULTY_REGISTRATIONS_ERROR: Authentication token not found for update. Redirecting to:", facultyLoginUrl);
//             alert('Lỗi: Không tìm thấy token xác thực. Vui lòng đăng nhập lại.');
//             setTimeout(() => {
//                 window.location.href = facultyLoginUrl;
//             }, 500);
//             return;
//         }

//         let apiUrl;
//         let method = 'PATCH';

//         if (dataToUpdate.hasOwnProperty('status')) {
//             apiUrl = `${updateStatusApiUrl}${id}/`;
//         } else if (dataToUpdate.hasOwnProperty('notes')) {
//             apiUrl = `${updateNotesApiUrl}${id}/`;
//         } else {
//             console.error("FACULTY_REGISTRATIONS_ERROR: Không có dữ liệu hợp lệ để cập nhật.");
//             alert('Lỗi: Không có dữ liệu hợp lệ để cập nhật.');
//             return;
//         }

//         try {
//             const response = await fetch(apiUrl, {
//                 method: method,
//                 headers: {
//                     'Content-Type': 'application/json',
//                     'Authorization': `Token ${token}`
//                 },
//                 body: JSON.stringify(dataToUpdate)
//             });

//             if (!response.ok) {
//                 let errorMessage = `Lỗi ${response.status}: ${response.statusText} khi cập nhật.`;
//                 console.error(`FACULTY_REGISTRATIONS_ERROR: Update API response not OK. Status: ${response.status}, StatusText: ${response.statusText}`);
//                 try {
//                     const errorData = await response.json();
//                     errorMessage = errorData.detail || errorMessage;
//                     console.error("FACULTY_REGISTRATIONS_ERROR: Update error details from server (JSON):", errorData);
//                 } catch (jsonError) {
//                     console.warn('FACULTY_REGISTRATIONS_WARNING: Server did not return JSON for update error response.', jsonError);
//                 }
//                 if (response.status === 401 || response.status === 403) {
//                     errorMessage = 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.';
//                     console.error(`FACULTY_REGISTRATIONS_ERROR: Authentication/Authorization error (${response.status}) during update. Redirecting to: ${facultyLoginUrl}`);
//                     setTimeout(() => {
//                         window.location.href = facultyLoginUrl;
//                     }, 500);
//                 }
//                 throw new Error(errorMessage);
//             }
            
//             alert('Cập nhật thành công!');
            
//             // Tải lại toàn bộ dữ liệu và mở lại modal chi tiết nếu nó đang mở
//             await fetchAdvisoryRegistrations(true); // Truyền true để báo hiệu cần mở lại modal
//             notesModal.hide(); // Đảm bảo modal ghi chú được ẩn
//             // registrationDetailsModal sẽ được mở lại trong fetchAdvisoryRegistrations(true)
            
//         } catch (error) {
//             console.error('FACULTY_REGISTRATIONS_ERROR: Failed to update registration:', error);
//             alert('Lỗi cập nhật: ' + error.message);
//         }
//     }

//     async function deleteRegistration(id) {
//         const token = getFacultyAuthToken();
//         if (!token) {
//             console.error("FACULTY_REGISTRATIONS_ERROR: Authentication token not found for delete. Redirecting to:", facultyLoginUrl);
//             alert('Lỗi: Không tìm thấy token xác thực. Vui lòng đăng nhập lại.');
//             window.location.href = facultyLoginUrl;
//             return;
//         }
//         try {
//             const apiUrl = `${facultyApiBaseUrl}${id}/`; 
            
//             const response = await fetch(apiUrl, {
//                 method: 'DELETE',
//                 headers: {
//                     'Authorization': `Token ${token}`
//                 }
//             });

//             if (!response.ok) {
//                 let errorMessage = `Lỗi ${response.status}: ${response.statusText} khi xóa.`;
//                 console.error(`FACULTY_REGISTRATIONS_ERROR: Delete API response not OK. Status: ${response.status}, StatusText: ${response.statusText}`);
//                 try {
//                     const errorData = await response.json();
//                     errorMessage = errorData.detail || errorMessage;
//                 } catch (jsonError) {
//                     console.warn('FACULTY_REGISTRATIONS_WARNING: Server did not return JSON for delete error response.', jsonError);
//                 }
//                 if (response.status === 401 || response.status === 403) {
//                     errorMessage = 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.';
//                     setTimeout(() => {
//                         window.location.href = facultyLoginUrl;
//                     }, 500);
//                 }
//                 throw new Error(errorMessage);
//             }
            
//             alert('Xóa đăng ký thành công!');
//             // Sau khi xóa, tải lại toàn bộ dữ liệu và đóng modal chi tiết
//             await fetchAdvisoryRegistrations(false); // Không cần mở lại modal sau khi xóa
//             registrationDetailsModal.hide(); // Đóng modal chi tiết
            
//         } catch (error) {
//             console.error('FACULTY_REGISTRATIONS_ERROR: Failed to delete registration:', error);
//             alert('Lỗi xóa đăng ký: ' + error.message);
//         }
//     }

//     // Hàm xuất dữ liệu ra Excel
//    async function exportToExcel() {
//         // Lấy dữ liệu từ mảng `allRegistrationsData`
//         const dataToExport = allRegistrationsData;

//         if (dataToExport.length === 0) {
//             alert('Không có dữ liệu để xuất ra Excel.');
//             return;
//         }

//         // Chuẩn bị dữ liệu cho một sheet duy nhất
//         const combinedSheetData = [];

//         // Thêm hàng tiêu đề cho sheet
//         combinedSheetData.push([
//             'ID Đăng ký',
//             'Họ và tên',
//             'Điện thoại',
//             'Email',
//             'Địa chỉ',
//             'Tốt nghiệp',
//             'Ngành quan tâm', // Thêm cột ngành quan tâm
//             'Ngày đăng ký',
//             'Trạng thái',
//             'Ghi chú'
//         ]);

//         // Duyệt qua từng lượt đăng ký riêng lẻ để đưa vào sheet
//         dataToExport.forEach(reg => {
//             combinedSheetData.push([
//                 reg.id,
//                 reg.full_name,
//                 reg.phone_number || '',
//                 reg.email || '',
//                 reg.address || '',
//                 reg.has_graduated_display,
//                 reg.major_of_interest ? reg.major_of_interest.name : 'Chưa xác định', // Ngành quan tâm
//                 new Date(reg.registration_date).toLocaleDateString('vi-VN'),
//                 reg.status,
//                 reg.notes || ''
//             ]);
//         });

//         // Tạo workbook mới
//         const wb = XLSX.utils.book_new();

//         // Tạo và thêm một sheet duy nhất
//         const wsCombined = XLSX.utils.aoa_to_sheet(combinedSheetData);
//         XLSX.utils.book_append_sheet(wb, wsCombined, "Danh sách đăng ký tư vấn"); // Tên sheet

//         // Ghi file và tải xuống
//         XLSX.writeFile(wb, "DanhSachDangKyTuVan.xlsx");
//         alert('Đã xuất dữ liệu ra file Excel thành công!');
//     }

//     // Khởi tạo tải dữ liệu khi DOM đã sẵn sàng
//     fetchAdvisoryRegistrations();
// });



// /static/js/faculty/faculty_registrations.js
document.addEventListener('DOMContentLoaded', function() {
    const tableBody = document.getElementById('advisory-registrations-table-body');
    const notesModal = new bootstrap.Modal(document.getElementById('notesModal'));
    const notesTextarea = document.getElementById('notesTextarea');
    const notesRegistrationId = document.getElementById('notesRegistrationId');
    const saveNotesBtn = document.getElementById('saveNotesBtn');
    const exportExcelBtn = document.getElementById('exportExcelBtn');

    const registrationDetailsModal = new bootstrap.Modal(document.getElementById('registrationDetailsModal'));
    const modalFullNameSpan = document.getElementById('modalFullName');
    const modalPhoneEmailSpan = document.getElementById('modalPhoneEmail');
    const modalRegistrationsTableBody = document.getElementById('modal-registrations-table-body');

    // Thêm các phần tử mới cho chức năng lọc theo ngày
    const filterForm = document.getElementById('filterForm');
    const startDateInput = document.getElementById('startDate');
    const endDateInput = document.getElementById('endDate');
    // BỔ SUNG: Thêm biến cho trường lọc ngày chính xác
    const exactDateInput = document.getElementById('exactDate');

    let allRegistrationsData = [];
    let currentOpenedRegistrationGroup = null;

    function getFacultyAuthToken() {
        const token = localStorage.getItem('authToken');
        return token;
    }

    const facultyLoginUrl = '/sggd/gv/manage/';
    const facultyApiBaseUrl = 'https://saigongiadinh.pythonanywhere.com/api/admin/advisory-registrations/';
    const updateStatusApiUrl = 'https://saigongiadinh.pythonanywhere.com/update-status-registrations/';
    const updateNotesApiUrl = 'https://saigongiadinh.pythonanywhere.com/update-notes-registrations/';

    /**
     * Hàm xây dựng URL API với các tham số lọc theo ngày.
     * @param {string} startDate Ngày bắt đầu (định dạng YYYY-MM-DD).
     * @param {string} endDate Ngày kết thúc (định dạng YYYY-MM-DD).
     * @param {string} exactDate Ngày chính xác (định dạng YYYY-MM-DD).
     * @returns {string} URL API hoàn chỉnh.
     */
    function buildApiUrlWithDates(startDate, endDate, exactDate) {
        const params = new URLSearchParams();

        // BỔ SUNG: Kiểm tra nếu có ngày chính xác, ưu tiên sử dụng trường này
        if (exactDate) {
            params.append('registration_date_exact', exactDate);
        } else {
            // Nếu không có ngày chính xác, sử dụng khoảng ngày
            if (startDate) {
                params.append('registration_date_range_after', startDate);
            }
            if (endDate) {
                params.append('registration_date_range_before', endDate);
            }
        }
        
        const queryString = params.toString();
        return queryString ? `${facultyApiBaseUrl}?${queryString}` : facultyApiBaseUrl;
    }

    async function fetchAdvisoryRegistrations(reopenModal = false, apiUrl = facultyApiBaseUrl) {
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
            allRegistrationsData = data;
            
            renderTable(allRegistrationsData);

            if (reopenModal && currentOpenedRegistrationGroup) {
                const updatedGroupedData = groupRegistrationsByUser(allRegistrationsData);
                const reOpenedGroup = updatedGroupedData.find(group =>
                    (group.email && group.email === currentOpenedRegistrationGroup.email) ||
                    (group.phone_number && group.phone_number === currentOpenedRegistrationGroup.phone_number)
                );
                
                if (reOpenedGroup) {
                    displayRegistrationDetailsInModal(reOpenedGroup, reOpenedGroup.full_name, reOpenedGroup.phone_number, reOpenedGroup.email);
                } else {
                    registrationDetailsModal.hide();
                    currentOpenedRegistrationGroup = null;
                }
            }

        } catch (error) {
            console.error('FACULTY_REGISTRATIONS_ERROR: Failed to fetch advisory registrations:', error);
            tableBody.innerHTML = `<tr><td colspan="11" class="text-center text-danger">Lỗi: ${error.message}</td></tr>`;
        }
    }

    function groupRegistrationsByUser(registrations) {
        const grouped = new Map();
        registrations.forEach(reg => {
            const key = reg.email || reg.phone_number;
            if (!key) return;
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
        grouped.forEach(group => {
            group.registrations.sort((a, b) => new Date(b.registration_date) - new Date(a.registration_date));
        });
        return Array.from(grouped.values());
    }

    function renderTable(registrations) {
        tableBody.innerHTML = '';
        if (registrations.length === 0) {
            tableBody.innerHTML = '<tr><td colspan="11" class="text-center">Không có đăng ký tư vấn nào.</td></tr>';
            return;
        }
        const groupedRegistrations = groupRegistrationsByUser(registrations);
        groupedRegistrations.forEach((group, groupIndex) => {
            let groupStatusClass = '';
            if (group.registrations.some(reg => reg.status === 'NEW')) {
                groupStatusClass = 'group-status-new';
            } else if (group.registrations.some(reg => reg.status === 'CONTACTED')) {
                groupStatusClass = 'group-status-contacted';
            } else if (group.registrations.every(reg => reg.status === 'CONSULTED')) {
                groupStatusClass = 'group-status-consulted';
            }
            const masterRow = document.createElement('tr');
            masterRow.classList.add('master-row');
            if (groupStatusClass) {
                masterRow.classList.add(groupStatusClass);
            }
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
        tableBody.querySelectorAll('.view-details-btn').forEach(button => {
            button.removeEventListener('click', handleViewDetailsClick);
            button.addEventListener('click', handleViewDetailsClick);
        });
        modalRegistrationsTableBody.removeEventListener('change', handleModalStatusChange);
        modalRegistrationsTableBody.addEventListener('change', handleModalStatusChange);
        modalRegistrationsTableBody.removeEventListener('click', handleModalButtonClick);
        modalRegistrationsTableBody.addEventListener('click', handleModalButtonClick);
        saveNotesBtn.removeEventListener('click', handleSaveNotesClick);
        saveNotesBtn.addEventListener('click', handleSaveNotesClick);
        registrationDetailsModal._element.addEventListener('hidden.bs.modal', () => {
            currentOpenedRegistrationGroup = null;
        });
        exportExcelBtn.removeEventListener('click', exportToExcel);
        exportExcelBtn.addEventListener('click', exportToExcel);
        // Thêm event listener cho form lọc
        filterForm.removeEventListener('submit', handleFilterFormSubmit);
        filterForm.addEventListener('submit', handleFilterFormSubmit);
    }

    // --- Hàm xử lý sự kiện cho form lọc ---
    async function handleFilterFormSubmit(event) {
        event.preventDefault();
        const startDate = startDateInput.value;
        const endDate = endDateInput.value;
        // BỔ SUNG: Lấy giá trị của trường lọc ngày chính xác
        const exactDate = exactDateInput.value; 

        // BỔ SUNG: Truyền tham số exactDate vào hàm xây dựng URL
        const filteredApiUrl = buildApiUrlWithDates(startDate, endDate, exactDate);
        
        await fetchAdvisoryRegistrations(false, filteredApiUrl);
    }

    async function handleViewDetailsClick(event) {
        event.preventDefault();
        const groupIndex = event.currentTarget.dataset.groupIndex;
        const fullName = event.currentTarget.dataset.fullName;
        const phoneNumber = event.currentTarget.dataset.phoneNumber;
        const email = event.currentTarget.dataset.email;
        const groupedData = groupRegistrationsByUser(allRegistrationsData);
        const currentGroup = groupedData[groupIndex];
        if (currentGroup) {
            currentOpenedRegistrationGroup = currentGroup;
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
            registrationDetailsModal.hide();
            notesModal.show();
        } else if (event.target.closest('.delete-btn')) {
            const button = event.target.closest('.delete-btn');
            const registrationId = button.dataset.id;
            if (confirm('Bạn có chắc chắn muốn xóa đăng ký này?')) {
                deleteRegistration(registrationId);
            }
        }
    }

    async function handleSaveNotesClick() {
        const id = notesRegistrationId.value;
        const newNotes = notesTextarea.value;
        await updateRegistration(id, { notes: newNotes });
        notesModal.hide();
    }

    function displayRegistrationDetailsInModal(groupData, fullName, phoneNumber, email) {
        modalFullNameSpan.textContent = fullName;
        modalPhoneEmailSpan.textContent = (phoneNumber && email) ? `${phoneNumber} / ${email}` : (phoneNumber || email || 'N/A');
        modalRegistrationsTableBody.innerHTML = '';
        if (groupData.registrations.length === 0) {
            modalRegistrationsTableBody.innerHTML = '<tr><td colspan="6" class="text-center">Không có đăng ký nào.</td></tr>';
        } else {
            const modalRegistrationsTableBody = document.getElementById('modal-registrations-table-body');
            modalRegistrationsTableBody.innerHTML = '';
            groupData.registrations.forEach(reg => {
                const row = document.createElement('tr');
                row.dataset.registrationId = reg.id;
                let statusClass = '';
                if (reg.status === 'CONTACTED') {
                    statusClass = 'status-contacted';
                } else if (reg.status === 'CONSULTED') {
                    statusClass = 'status-consulted';
                } else {
                    statusClass = 'status-new';
                }
                row.classList.add(statusClass);
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
        registrationDetailsModal.show();
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
                    setTimeout(() => {
                        window.location.href = facultyLoginUrl;
                    }, 500);
                }
                throw new Error(errorMessage);
            }
            alert('Cập nhật thành công!');
            // BỔ SUNG: Truyền tham số exactDate vào hàm fetchAdvisoryRegistrations
            await fetchAdvisoryRegistrations(true, buildApiUrlWithDates(startDateInput.value, endDateInput.value, exactDateInput.value));
            notesModal.hide();
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
                    console.warn('FACULTY_REGISTRATIONS_WARNING: Server did not return JSON for delete error response.', jsonError);
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
            // BỔ SUNG: Truyền tham số exactDate vào hàm fetchAdvisoryRegistrations
            await fetchAdvisoryRegistrations(false, buildApiUrlWithDates(startDateInput.value, endDateInput.value, exactDateInput.value));
            registrationDetailsModal.hide();
        } catch (error) {
            console.error('FACULTY_REGISTRATIONS_ERROR: Failed to delete registration:', error);
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
            'ID Đăng ký',
            'Họ và tên',
            'Điện thoại',
            'Email',
            'Địa chỉ',
            'Tốt nghiệp',
            'Ngành quan tâm',
            'Ngày đăng ký',
            'Trạng thái',
            'Ghi chú'
        ]);
        dataToExport.forEach(reg => {
            combinedSheetData.push([
                reg.id,
                reg.full_name,
                reg.phone_number || '',
                reg.email || '',
                reg.address || '',
                reg.has_graduated_display,
                reg.major_of_interest ? reg.major_of_interest.name : 'Chưa xác định',
                new Date(reg.registration_date).toLocaleDateString('vi-VN'),
                reg.status,
                reg.notes || ''
            ]);
        });
        const wb = XLSX.utils.book_new();
        const wsCombined = XLSX.utils.aoa_to_sheet(combinedSheetData);
        XLSX.utils.book_append_sheet(wb, wsCombined, "Danh sách đăng ký tư vấn");
        XLSX.writeFile(wb, "DanhSachDangKyTuVan.xlsx");
        alert('Đã xuất dữ liệu ra file Excel thành công!');
    }

    // Khởi tạo tải dữ liệu khi DOM đã sẵn sàng
    fetchAdvisoryRegistrations();
});
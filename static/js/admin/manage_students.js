document.addEventListener('DOMContentLoaded', function() {
    const studentTableBody = document.getElementById('studentTableBody');
    const messageDiv = document.getElementById('message');
    const loadingOverlay = document.getElementById('loadingOverlay');
    const loadingText = document.getElementById('loadingText');


    // Student Detail Modal elements
    const studentDetailModalOverlay = document.getElementById('studentDetailModalOverlay');
    const closeStudentDetailModalBtn = document.getElementById('closeStudentDetailModal');
    const detailStudentPhoto = document.getElementById('detailStudentPhoto');
    const detailFullName = document.getElementById('detailFullName');
    const detailEmail = document.getElementById('detailEmail');
    const detailStudentCode = document.getElementById('detailStudentCode');
    const detailNationalIdCard = document.getElementById('detailNationalIdCard');
    const detailNationality = document.getElementById('detailNationality');
    const detailGender = document.getElementById('detailGender');
    const detailDateOfBirth = document.getElementById('detailDateOfBirth');
    const detailPlaceOfBirth = document.getElementById('detailPlaceOfBirth');
    const detailPhone = document.getElementById('detailPhone');
    const detailAddress = document.getElementById('detailAddress');
    const detailDistrict = document.getElementById('detailDistrict');
    const detailCity = document.getElementById('detailCity');
    const detailParentName = document.getElementById('detailParentName');
    const detailParentPhone = document.getElementById('detailParentPhone');
    const detailProgram = document.getElementById('detailProgram');
    const detailMajor = document.getElementById('detailMajor');
    const detailAcademicYear = document.getElementById('detailAcademicYear');
    const detailDepartment = document.getElementById('detailDepartment');
    const detailStudentStatus = document.getElementById('detailStudentStatus');
    const detailGPA = document.getElementById('detailGPA'); // Fixed typo: detailGPA = document = document.getElementById('detailGPA');
    const detailDateJoined = document.getElementById('date_joined');
    const detailLock = document.getElementById('detailStudentLock');
    // --- NEW: Edit Student Modal elements ---
    const editStudentModalOverlay = document.getElementById('editStudentModalOverlay');
    const closeEditStudentModalBtn = document.getElementById('closeEditStudentModal');
    const cancelEditStudentModalBtn = document.getElementById('cancelEditStudentModal');
    const editStudentForm = document.getElementById('editStudentForm');
    const editStudentId = document.getElementById('editStudentId'); // Hidden input for ID
    const currentEditUserPhoto = document.getElementById('currentEditUserPhoto');
    const editUserPhotoInput = document.getElementById('editUserPhoto'); // File input


    const API_ENDPOINT = 'https://saigongiadinh.pythonanywhere.com/StudentList/'; // For listing students
    const STUDENT_DETAIL_API_BASE_URL = 'https://saigongiadinh.pythonanywhere.com/StudentList/'; // For student detail and delete
    const PLACEHOLDER_AVATAR = 'https://placehold.co/40x40/cccccc/ffffff?text=AV'; // Placeholder for missing avatar

    const PROGRAM_API = 'https://saigongiadinh.pythonanywhere.com/Program/';
    const MAJOR_API = 'https://saigongiadinh.pythonanywhere.com/Major/';
    const ACADEMIC_YEAR_API = 'https://saigongiadinh.pythonanywhere.com/AcademicYear/';
    const DEPARTMENT_API = 'https://saigongiadinh.pythonanywhere.com/Department/';

    // --- Custom Confirmation Modal Elements (re-used from previous version) ---
    let confirmModal = null;
    let confirmMessage = null;
    let confirmYesBtn = null;
    let confirmNoBtn = null;

    // Function to create and append the confirmation modal to the body
    function createConfirmModal() {
        if (confirmModal) return;
        confirmModal = document.createElement('div');
        confirmModal.id = 'customConfirmModal';
        confirmModal.style.cssText = `
            position: fixed; top: 0; left: 0; width: 100%; height: 100%;
            background-color: rgba(0, 0, 0, 0.6); display: flex; justify-content: center;
            align-items: center; z-index: 10000; display: none;
        `;
        confirmModal.innerHTML = `
            <div style="background-color: white; padding: 30px; border-radius: 10px;
                box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3); text-align: center;
                max-width: 400px; width: 90%;">
                <p id="confirmMessage" style="font-size: 1.1em; margin-bottom: 25px; color: #333;"></p>
                <button id="confirmYesBtn" style="background-color: #dc3545; color: white;
                    padding: 10px 20px; border: none; border-radius: 5px; cursor: pointer;
                    margin-right: 15px; font-size: 1em; transition: background-color 0.2s ease;">Xác nhận</button>
                <button id="confirmNoBtn" style="background-color: #6c757d; color: white;
                    padding: 10px 20px; border: none; border-radius: 5px; cursor: pointer;
                    font-size: 1em; transition: background-color 0.2s ease;">Hủy</button>
            </div>
        `;
        document.body.appendChild(confirmModal);
        confirmMessage = document.getElementById('confirmMessage');
        confirmYesBtn = document.getElementById('confirmYesBtn');
        confirmNoBtn = document.getElementById('confirmNoBtn');
    }

    // Function to show the custom confirmation modal
    function showConfirmModal(message, onConfirm) {
        createConfirmModal();
        confirmMessage.textContent = message;
        confirmModal.style.display = 'flex';
        confirmYesBtn.onclick = null;
        confirmNoBtn.onclick = null;
        confirmYesBtn.onclick = () => { confirmModal.style.display = 'none'; onConfirm(true); };
        confirmNoBtn.onclick = () => { confirmModal.style.display = 'none'; onConfirm(false); };
    }


    const editInputs = {
        first_name: document.getElementById('editFirstName'),
        last_name: document.getElementById('editLastName'),
        email: document.getElementById('editEmail'),
        username: document.getElementById('editUsername'),
        student_code: document.getElementById('editStudentCode'),
        national_id_card: document.getElementById('editNationalIdCard'),
        nationality: document.getElementById('editNationality'),
        gender: document.getElementById('editGender'),
        date_of_birth: document.getElementById('editDateOfBirth'),
        place_of_birth: document.getElementById('editPlaceOfBirth'),
        phone: document.getElementById('editPhone'),
        address: document.getElementById('editAddress'),
        district: document.getElementById('editDistrict'),
        city: document.getElementById('editCity'),
        parent_name: document.getElementById('editParentName'),
        parent_phone: document.getElementById('editParentPhone'),
        student_status: document.getElementById('editStudentStatus'),
        GPA: document.getElementById('editGPA'),
        date_joined: document.getElementById('editDateJoined'),
        is_active: document.getElementById('editIsActive'), // Checkbox
        // Add dropdowns for related objects (Program, Major, Academic Year, Department)
        program: document.getElementById('editProgram'),
        major: document.getElementById('editMajor'),
        academic_year: document.getElementById('editAcademicYear'),
        department: document.getElementById('editDepartment'),
    };
    // --- Utility Functions ---
    // Function to display messages on the page
    function showMessage(msg, type) {
        messageDiv.textContent = msg;
        messageDiv.className = `sggd-message sggd-${type}`;
        messageDiv.style.display = 'block';
        setTimeout(() => { // Tự động ẩn thông báo sau 5 giây
            messageDiv.style.display = 'none';
        }, 5000);
    }

    // Function to show the loading overlay
    function showLoading(text = 'Đang tải dữ liệu...') {
        loadingText.textContent = text;
        loadingOverlay.style.display = 'flex';
    }

    // Function to hide the loading overlay
    function hideLoading() {
        loadingOverlay.style.display = 'none';
    }

    // Function to get the authentication token from localStorage
    function getAuthToken() {
        return localStorage.getItem('adminAuthToken');
    }

    // Function to generate status badges with appropriate styling
    function getStatusBadge(status) {
        let className = '';
        let displayText = '';
        switch (status) {
            case 'DANG_HOC': className = 'dang-hoc'; displayText = 'Đang học'; break;
            case 'DA_TOT_NGHIEP': className = 'da-tot-nghiep'; displayText = 'Đã tốt nghiệp'; break;
            case 'SAP_TOT_NGHIEP': className = 'sap-tot-nghiep'; displayText = 'Sắp tốt nghiệp'; break;
            case 'THOI_HOC': className = 'thoi-hoc'; displayText = 'Thôi học'; break;
            case 'BUOC_THOI_HOC': className = 'buoc-thoi-hoc'; displayText = 'Buộc thôi học'; break;
            case 'BAO_LUU': className = 'bao-luu'; displayText = 'Bảo lưu'; break;
            default: className = 'default'; displayText = status;
        }
        return `<span class="status-badge ${className}">${displayText}</span>`;
    }

    // Hàm chung để điền dữ liệu vào các dropdown (Program, Major, Academic Year, Department)
    async function populateDropdown(selectElement, apiUrl, selectedValue = null) {
        selectElement.innerHTML = ''; // Clear existing options
        const authToken = getAuthToken();
        if (!authToken) {
            console.error('Không có token xác thực để tải dropdown.');
            return;
        }

        try {
            const response = await axios.get(apiUrl, {
                headers: { 'Authorization': `Token ${authToken}` }
            });
            const data = response.data;

            // Add a default "Select" option
            const defaultOption = document.createElement('option');
            defaultOption.value = '';
            defaultOption.textContent = '-- Chọn --';
            selectElement.appendChild(defaultOption);

            data.forEach(item => {
                const option = document.createElement('option');
                option.value = item.id;
                option.textContent = item.name;
                if (selectedValue !== null && item.id === selectedValue) {
                    option.selected = true;
                }
                selectElement.appendChild(option);
            });
        } catch (error) {
            console.error(`Lỗi khi điền vào dropdown từ ${apiUrl}:`, error);
            showMessage(`Không thể tải dữ liệu cho một số trường: ${selectElement.id}.`, 'sggd-error');
        }
    }


    // Function to load student data into the table
    async function loadStudents() {
        showMessage('', ''); // Clear previous messages
        showLoading();
        studentTableBody.innerHTML = ''; // Clear existing table rows

        const authToken = getAuthToken();
        if (!authToken) {
            hideLoading();
            showMessage('Bạn chưa đăng nhập hoặc không có quyền. Vui lòng đăng nhập với tài khoản Admin.', 'sggd-error');
            return;
        }

        try {
            const response = await axios.get(API_ENDPOINT, {
                headers: { 'Authorization': `Token ${authToken}` }
            });

            const students = response.data;
            if (students.length === 0) {
                showMessage('Không có tài khoản sinh viên nào.', 'sggd-info');
                return;
            }

            students.forEach((student, index) => {
                const row = document.createElement('tr');
                // Sử dụng Cloudinary URL nếu có, nếu không thì dùng placeholder.
               

                row.innerHTML = `
                    <td>${index + 1}</td>
                    <td>
                        <img src="${student.user_photo}"
                             alt="${student.first_name} ${student.last_name}"
                             class="avatar"
                             onerror="this.onerror=null;this.src='${PLACEHOLDER_AVATAR}';">
                    </td>
                    <td>${student.last_name} ${student.first_name}</td>
                    <td>${student.email}</td>
                    <td>${student.student_code}</td>
                    <td>${student.department_name || 'N/A'}</td>
                    <td>${getStatusBadge(student.student_status)}</td>
                    <td>${student.is_locked ? '<i class="fa-solid fa-lock"></i>' : '<i class="fa-solid fa-lock-open"></i>'}</td>
                    <td>${student.GPA !== null ? student.GPA : 'N/A'}</td>
                    <td class="action-buttons">
                        <button class="view-btn" data-id="${student.id}">Xem</button>
                        <button class="edit-btn" data-id="${student.id}">Sửa</button>
                        <button class="delete-btn" data-id="${student.id}">Xóa</button>
                    </td>
                `;
                studentTableBody.appendChild(row);
            });

            // Add event listeners for action buttons
            studentTableBody.querySelectorAll('.view-btn').forEach(button => {
                button.addEventListener('click', (event) => viewStudent(event.target.dataset.id));
            });
            // SỬA ĐỔI LỚN TẠI ĐÂY: Gắn đúng sự kiện cho nút "Sửa" để gọi hàm editStudent
            studentTableBody.querySelectorAll('.edit-btn').forEach(button => {
                button.addEventListener('click', (event) => editStudent(event.target.dataset.id));
            });
            studentTableBody.querySelectorAll('.delete-btn').forEach(button => {
                button.addEventListener('click', (event) => deleteStudent(event.target.dataset.id));
            });

        } catch (error) {
            console.error('Lỗi khi tải danh sách sinh viên:', error);
            let errorMessage = 'Đã xảy ra lỗi không xác định khi tải dữ liệu.';
            if (error.response) {
                console.error('Dữ liệu lỗi từ server:', error.response.data);
                errorMessage = `Lỗi từ server: ${error.response.status} - ${error.response.statusText}`;
                if (error.response.data && typeof error.response.data === 'object') {
                    errorMessage += ': ' + JSON.stringify(error.response.data);
                }
            } else if (error.request) {
                errorMessage = 'Không nhận được phản hồi từ server. Vui lòng kiểm tra kết nối mạng.';
            } else {
                errorMessage = `Lỗi: ${error.message}`;
            }
            showMessage(`Lỗi: ${errorMessage}`, 'sggd-error');
        } finally {
            hideLoading();
        }
    }

    // --- Student Detail Modal Functions ---
    // Function to show the student detail modal and populate it with data
    function showStudentDetailModal(studentData) {
        // Populate modal with student data
        
        detailStudentPhoto.src = studentData.user_photo;
        detailStudentPhoto.onerror = function() { this.onerror=null; this.src=`${studentData.user_photo}`; };

        detailFullName.textContent = `${studentData.last_name} ${studentData.first_name}`;
        detailEmail.textContent = studentData.email;
        detailStudentCode.textContent = studentData.student_code;
        detailNationalIdCard.textContent = studentData.national_id_card || 'N/A';
        detailNationality.textContent = studentData.nationality || 'N/A';
        detailGender.textContent = studentData.gender === 'M' ? 'Nam' : (studentData.gender === 'F' ? 'Nữ' : 'Khác');
        detailDateOfBirth.textContent = studentData.date_of_birth || 'N/A';
        detailPlaceOfBirth.textContent = studentData.place_of_birth || 'N/A';
        detailPhone.textContent = studentData.phone || 'N/A';
        detailAddress.textContent = studentData.address || 'N/A';
        detailDistrict.textContent = studentData.district || 'N/A';
        detailCity.textContent = studentData.city || 'N/A';
        detailParentName.textContent = studentData.parent_name || 'N/A';
        detailParentPhone.textContent = studentData.parent_phone || 'N/A';
        detailProgram.textContent = studentData.program_name || 'N/A';
        detailMajor.textContent = studentData.major_name || 'N/A';
        detailAcademicYear.textContent = studentData.academic_year_name || 'N/A';
        detailDepartment.textContent = studentData.department_name || 'N/A';
        detailStudentStatus.textContent = getStatusDisplayName(studentData.student_status); // Use helper for display name
        detailGPA.textContent = studentData.gpa !== null ? studentData.GPA : 'N/A'; // Sửa từ GPA thành gpa
        detailDateJoined.textContent = studentData.date_joined ? 
                new Date(studentData.date_joined).toLocaleDateString('vi-VN', {
                    day: '2-digit',   // Luôn có 2 chữ số cho ngày (ví dụ: 01, 15)
                    month: '2-digit', // Luôn có 2 chữ số cho tháng (ví dụ: 01, 12)
                    year: 'numeric'   // 4 chữ số cho năm (ví dụ: 2025)
                }) : 'N/A';
        detailLock.innerHTML = studentData.is_locked ? '<i class="fa-solid fa-lock"></i>' : '<i class="fa-solid fa-lock-open"></i>';

        studentDetailModalOverlay.style.display = 'flex';
    }

    // Function to hide the student detail modal
    function hideStudentDetailModal() {
        studentDetailModalOverlay.style.display = 'none';
    }

    // Helper to get display name for status (since getStatusBadge returns HTML)
    function getStatusDisplayName(status) {
        switch (status) {
            case 'DANG_HOC': return 'Đang học';
            case 'DA_TOT_NGHIEP': return 'Đã tốt nghiệp';
            case 'SAP_TOT_NGHIEP': return 'Sắp tốt nghiệp';
            case 'THOI_HOC': return 'Thôi học';
            case 'BUOC_THOI_HOC': return 'Buộc thôi học';
            case 'BAO_LUU': return 'Bảo lưu';
            default: return status;
        }
    }

    // --- NEW: Function to show the Edit Student Modal and populate it with data ---
    async function showEditStudentModal(studentData) {
        editStudentId.value = studentData.id; 
        console.log("Hàm showEditStudentModal đã được gọi.");
        console.log("Dữ liệu sinh viên nhận được:", studentData);// Store the student ID
        currentEditUserPhoto.src = studentData.user_photo;
       
        


        // Populate form fields
        // Duyệt qua các trường trong editInputs
        for (const key in editInputs) {
            const element = editInputs[key];
            if (element) {
                if (key === 'user_photo') {
                    // Update current photo preview
                if (studentData.user_photo) {
                        console.log(`${studentData.user_photo}`)
                        currentEditUserPhoto.src = studentData.user_photo;
                    } else {
                        // Nếu không có ảnh từ dữ liệu, hiển thị ảnh placeholder
                        currentEditUserPhoto.src = PLACEHOLDER_AVATAR;
                    }
                } else if (key === 'date_of_birth' || key === 'date_joined') {
                    element.value = studentData[key] ? new Date(studentData[key]).toISOString().split('T')[0] : '';
                } else if (element.type === 'checkbox') {
                    element.checked = studentData[key];
                } else if (key === 'GPA') { // Sử dụng key 'gpa' từ API response
                    element.value = studentData.GPA !== null ? parseFloat(studentData.GPA) : '';
                } else if (key === 'program' || key === 'major' || key === 'academic_year' || key === 'department') {
                    // Đối với các dropdown, chúng ta cần id của đối tượng liên quan
                    let api = '';
                    let selectedId = null;
                    switch (key) {
                        case 'program': api = PROGRAM_API; selectedId = studentData.program; break; // studentData.program là ID
                        case 'major': api = MAJOR_API; selectedId = studentData.major; break;
                        case 'academic_year': api = ACADEMIC_YEAR_API; selectedId = studentData.academic_year; break;
                        case 'department': api = DEPARTMENT_API; selectedId = studentData.department; break;
                    }
                    if (api) {
                        await populateDropdown(element, api, selectedId);
                    }
                } else {
                    // Đối với các trường văn bản và số khác
                    element.value = studentData[key] || '';
                }
            }
        }

        // Handle new photo selection preview
        editUserPhotoInput.onchange = function(event) {
            const [file] = event.target.files;
            if (file) {
                currentEditUserPhoto.src = URL.createObjectURL(file);
                currentEditUserPhoto.style.display = 'block';
            }
        };

        editStudentModalOverlay.style.display = 'flex';
    }


    function hideEditStudentModal() {
        editStudentModalOverlay.style.display = 'none';
        editStudentForm.reset(); // Clear the form
        currentEditUserPhoto.src = ''; // Clear photo preview
        currentEditUserPhoto.style.display = 'none'; // Hide photo preview
        editUserPhotoInput.value = ''; // Clear file input selection
    }

    // --- Event handler for "Sửa" button on each row (Đã sửa lại để gọi hàm chính xác) ---
    async function editStudent(studentId) {
        showMessage('', '');
        showLoading('Đang tải thông tin sinh viên để chỉnh sửa...');
        const authToken = getAuthToken();

        if (!authToken) {
            hideLoading();
            showMessage('Bạn chưa đăng nhập hoặc không có quyền. Vui lòng đăng nhập với tài khoản Admin.', 'sggd-error');
            return;
        }

        try {
            const response = await axios.get(`${STUDENT_DETAIL_API_BASE_URL}${studentId}/`, {
                headers: { 'Authorization': `Token ${authToken}` }
            });
            // Gọi hàm hiển thị modal chỉnh sửa và điền dữ liệu
            await showEditStudentModal(response.data); // Chắc chắn gọi async
        } catch (error) {
            console.error('Lỗi khi tải chi tiết sinh viên để chỉnh sửa:', error);
            let errorMessage = 'Đã xảy ra lỗi không xác định khi tải chi tiết sinh viên để chỉnh sửa.';
            if (error.response) {
                console.error('Dữ liệu lỗi từ server:', error.response.data);
                errorMessage = `Lỗi từ server: ${error.response.status} - ${error.response.statusText}`;
                if (error.response.data && typeof error.response.data === 'object') {
                    errorMessage += ': ' + JSON.stringify(error.response.data);
                }
            } else if (error.request) {
                errorMessage = 'Không nhận được phản hồi từ server. Vui lòng kiểm tra kết nối mạng.';
            } else {
                errorMessage = `Lỗi: ${error.message}`;
            }
            showMessage(`Lỗi: ${errorMessage}`, 'sggd-error');
        } finally {
            hideLoading();
        }
    }

    // --- Core Fetch and Display Student Detail Function ---
    // Fetches student details from the API and displays them in the modal
    async function fetchAndShowStudentDetail(studentId) {
        showMessage('', '');
        showLoading('Đang tải thông tin chi tiết sinh viên...');
        const authToken = getAuthToken();

        if (!authToken) {
            hideLoading();
            showMessage('Bạn chưa đăng nhập hoặc không có quyền. Vui lòng đăng nhập với tài khoản Admin.', 'sggd-error');
            return;
        }

        try {
            const response = await axios.get(`${STUDENT_DETAIL_API_BASE_URL}${studentId}/`, {
                headers: { 'Authorization': `Token ${authToken}` }
            });
            showStudentDetailModal(response.data);
        } catch (error) {
            console.error('Lỗi khi tải chi tiết sinh viên:', error);
            let errorMessage = 'Đã xảy ra lỗi không xác định khi tải chi tiết sinh viên.';
            if (error.response) {
                errorMessage = `Lỗi từ server: ${error.response.status} - ${error.response.statusText}`;
                if (error.response.data && typeof error.response.data === 'object') {
                    errorMessage += ': ' + JSON.stringify(error.response.data);
                }
            } else if (error.request) {
                errorMessage = 'Không nhận được phản hồi từ server. Vui lòng kiểm tra kết nối mạng.';
            } else {
                errorMessage = `Lỗi: ${error.message}`;
            }
            showMessage(`Lỗi: ${errorMessage}`, 'sggd-error');
        } finally {
            hideLoading();
        }
    }

    // Event handler for "Xem" button on each row
    function viewStudent(studentId) {
        fetchAndShowStudentDetail(studentId);
    }

    // Event handler for "Xóa" button on each row
    async function deleteStudent(studentId) {
        showConfirmModal(`Bạn có chắc chắn muốn xóa sinh viên ID: ${studentId} không?`, async (confirmed) => {
            if (confirmed) {
                showLoading('Đang xóa sinh viên...');
                const authToken = getAuthToken();
                try {
                    await axios.delete(`${STUDENT_DETAIL_API_BASE_URL}${studentId}/`, {
                        headers: { 'Authorization': `Token ${authToken}` }
                    });
                    showMessage('Xóa sinh viên thành công!', 'sggd-success');
                    loadStudents(); // Reload the list after successful deletion
                } catch (error) {
                    console.error('Lỗi khi xóa sinh viên:', error);
                    let errorMessage = 'Đã xảy ra lỗi không xác định khi xóa.';
                    if (error.response) {
                        errorMessage = `Lỗi từ server: ${error.response.status} - ${error.response.statusText}`;
                        if (error.response.data && typeof error.response.data === 'object') {
                            errorMessage += ': ' + JSON.stringify(error.response.data);
                        }
                    } else if (error.request) {
                        errorMessage = 'Không nhận được phản hồi từ server. Vui lòng kiểm tra kết nối mạng.';
                    } else {
                        errorMessage = `Lỗi: ${error.message}`;
                    }
                    showMessage(`Lỗi: ${errorMessage}`, 'sggd-error');
                } finally {
                    hideLoading();
                }
            } else {
                showMessage('Hủy xóa.', 'sggd-info');
            }
        });
    }

    // Event listener for Edit Student Form submission
    editStudentForm.addEventListener('submit', async function(event) {
        event.preventDefault();
        showMessage('', '');
        showLoading('Đang lưu thay đổi...');

        const studentId = editStudentId.value;
        const authToken = getAuthToken();

        if (!authToken) {
            hideLoading();
            showMessage('Bạn chưa đăng nhập hoặc không có quyền.', 'sggd-error');
            return;
        }

        const formData = new FormData(); // Using FormData to send file and other data

        // Add form fields to FormData
        for (const key in editInputs) {
            const element = editInputs[key];
            if (element && key !== 'user_photo') { // Don't add file input here
                if (element.type === 'checkbox') {
                    formData.append(key, element.checked);
                } else if (key === 'GPA') { // Use 'gpa' for the API field name
                    formData.append('gpa', element.value);
                }
                 else if (key === 'program' || key === 'major' || key === 'academic_year' || key === 'department') {
                    // For foreign key fields, only send the ID of the selected object
                    if (element.value) {
                        formData.append(key, element.value);
                    }
                } else {
                    formData.append(key, element.value);
                }
            }
        }

        // Add photo file if selected
        if (editUserPhotoInput.files[0]) {
            formData.append('user_photo', editUserPhotoInput.files[0]);
        }

        try {
            // Using PATCH to update partial object data, which is common for forms that might not send all fields.
            // axios automatically sets 'Content-Type': 'multipart/form-data' when using FormData.
            const response = await axios.patch(`${STUDENT_DETAIL_API_BASE_URL}${studentId}/`, formData, {
                headers: {
                    'Authorization': `Token ${authToken}`,
                }
            });

            showMessage('Cập nhật thông tin sinh viên thành công!', 'sggd-success');
            hideEditStudentModal();
            loadStudents(); // Reload table to reflect changes
        } catch (error) {
            console.error('Lỗi khi cập nhật thông tin sinh viên:', error);
            let errorMessage = 'Đã xảy ra lỗi không xác định khi cập nhật.';
            if (error.response) {
                console.error('Dữ liệu lỗi từ server:', error.response.data);
                errorMessage = `Lỗi từ server: ${error.response.status} - ${error.response.statusText}`;
                if (error.response.data && typeof error.response.data === 'object') {
                    const errorDetails = Object.values(error.response.data).flat().join('; ');
                    errorMessage += `: ${errorDetails}`;
                }
            } else if (error.request) {
                errorMessage = 'Không nhận được phản hồi từ server. Vui lòng kiểm tra kết nối mạng.';
            } else {
                errorMessage = `Lỗi: ${error.message}`;
            }
            showMessage(`Lỗi: ${errorMessage}`, 'sggd-error');
        } finally {
            hideLoading();
        }
    });


// Hàm để đóng modal chi tiết sinh viên
function closeStudentDetailModal() {
    studentDetailModalOverlay.style.display = 'none';
}

// (Tùy chọn) Đóng modal khi click ra ngoài overlay
studentDetailModalOverlay.addEventListener('click', (event) => {
    if (event.target === studentDetailModalOverlay) {
        closeStudentDetailModal();
    }
});

    // --- Event Listeners for Modals ---
    closeStudentDetailModalBtn.addEventListener('click', hideStudentDetailModal);
    closeEditStudentModalBtn.addEventListener('click', hideEditStudentModal);
    cancelEditStudentModalBtn.addEventListener('click', hideEditStudentModal);


    // Load student list when the page is loaded
    loadStudents();
});
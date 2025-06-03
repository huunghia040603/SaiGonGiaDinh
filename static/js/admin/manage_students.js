document.addEventListener('DOMContentLoaded', function() {
    const studentTableBody = document.getElementById('studentTableBody');
    const messageDiv = document.getElementById('message');
    const loadingOverlay = document.getElementById('loadingOverlay');
    const loadingText = document.getElementById('loadingText');
    const viewReportButton = document.querySelector('.view-report-button'); // Get the "Xem Báo Cáo Đầy Đủ" button

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
    const detailGPA = document = document.getElementById('detailGPA');
    const detailEnrollmentDate = document.getElementById('detailEnrollmentDate');

    // Removed Student ID Input Modal elements as they are no longer needed for "Xem Báo Cáo Đầy Đủ"
    // const studentIdInputModalOverlay = document.getElementById('studentIdInputModalOverlay');
    // const studentIdInput = document.getElementById('studentIdInput');
    // const confirmStudentIdBtn = document.getElementById('confirmStudentIdBtn');
    // const cancelStudentIdBtn = document.getElementById('cancelStudentIdBtn');


    const API_ENDPOINT = 'https://saigongiadinh.pythonanywhere.com/StudentList/'; // For listing students
    const STUDENT_DETAIL_API_BASE_URL = 'https://saigongiadinh.pythonanywhere.com/StudentList/'; // For student detail and delete
    const PLACEHOLDER_AVATAR = 'https://placehold.co/40x40/cccccc/ffffff?text=AV'; // Placeholder for missing avatar

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

    // --- Utility Functions ---
    // Function to display messages on the page
    function showMessage(msg, type) {
        messageDiv.textContent = msg;
        messageDiv.className = `sggd-message sggd-${type}`;
        messageDiv.style.display = 'block';
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
                row.innerHTML = `
                    <td>${index + 1}</td>
                    <td>
                        <img src="https://res.cloudinary.com/dftarzzfw/${student.user_photo}" 
                             alt="${student.first_name} ${student.last_name}" 
                             class="avatar"
                             onerror="this.onerror=null;this.src='${PLACEHOLDER_AVATAR}';">
                    </td>
                    <td>${student.last_name} ${student.first_name}</td>
                    <td>${student.email}</td>
                    <td>${student.student_code}</td>
                    <td>${student.department_name || 'N/A'}</td>
                    <td>${getStatusBadge(student.student_status)}</td>
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
            studentTableBody.querySelectorAll('.edit-btn').forEach(button => {
                button.addEventListener('click', (event) => editStudent(event.target.dataset.id));
            });
            studentTableBody.querySelectorAll('.delete-btn').forEach(button => {
                button.addEventListener('click', (event) => deleteStudent(event.target.dataset.id));
            });

            // Removed: Event listener for "Xem Báo Cáo Đầy Đủ" button
            // viewReportButton.addEventListener('click', () => {
            //     if (students.length > 0) {
            //         fetchAndShowStudentDetail(students[0].id);
            //     } else {
            //         showMessage('Không có sinh viên nào để xem báo cáo.', 'sggd-info');
            //     }
            // });


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
        detailStudentPhoto.src = `https://res.cloudinary.com/dftarzzfw/${studentData.user_photo}`;
        detailStudentPhoto.onerror = function() { this.onerror=null; this.src=PLACEHOLDER_AVATAR; };

        detailFullName.textContent = `${studentData.last_name} ${studentData.first_name}`;
        detailEmail.textContent = studentData.email;
        detailStudentCode.textContent = studentData.student_code;
        detailNationalIdCard.textContent = studentData.national_id_card;
        detailNationality.textContent = studentData.nationality;
        detailGender.textContent = studentData.gender === 'M' ? 'Nam' : (studentData.gender === 'F' ? 'Nữ' : 'Khác');
        detailDateOfBirth.textContent = studentData.date_of_birth || 'N/A';
        detailPlaceOfBirth.textContent = studentData.place_of_birth || 'N/A';
        detailPhone.textContent = studentData.phone;
        detailAddress.textContent = studentData.address;
        detailDistrict.textContent = studentData.district;
        detailCity.textContent = studentData.city;
        detailParentName.textContent = studentData.parent_name || 'N/A';
        detailParentPhone.textContent = studentData.parent_phone || 'N/A';
        detailProgram.textContent = studentData.program_name || 'N/A';
        detailMajor.textContent = studentData.major_name || 'N/A';
        detailAcademicYear.textContent = studentData.academic_year_name || 'N/A';
        detailDepartment.textContent = studentData.department_name || 'N/A';
        detailStudentStatus.textContent = getStatusDisplayName(studentData.student_status); // Use helper for display name
        detailGPA.textContent = studentData.GPA !== null ? studentData.GPA : 'N/A';
        detailEnrollmentDate.textContent = studentData.enrollment_date ? new Date(studentData.enrollment_date).toLocaleDateString('vi-VN') : 'N/A';


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

    // Removed Student ID Input Modal Functions as they are no longer needed for "Xem Báo Cáo Đầy Đủ"
    // function showStudentIdInputModal() {
    //     studentIdInput.value = '';
    //     studentIdInputModalOverlay.style.display = 'flex';
    //     studentIdInput.focus();
    // }

    // function hideStudentIdInputModal() {
    //     studentIdInputModalOverlay.style.display = 'none';
    // }

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

    // Event handler for "Sửa" button on each row
    function editStudent(studentId) {
        showMessage(`Chỉnh sửa sinh viên ID: ${studentId}`, 'sggd-info');
        console.log(`Editing student with ID: ${studentId}`);
        // Example: window.location.href = `/admin/students/${studentId}/edit`;
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

    // --- Event Listeners for Modals ---
    closeStudentDetailModalBtn.addEventListener('click', hideStudentDetailModal);

    // Removed direct event listener for viewReportButton here.
    // It's now added inside loadStudents() after data is available.

    // Removed Student ID Input Modal event listeners
    // confirmStudentIdBtn.addEventListener('click', () => { ... });
    // cancelStudentIdBtn.addEventListener('click', hideStudentIdInputModal);

    // Load student list when the page is loaded
    loadStudents();
});



document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('createAccountForm');
    const accountTypeToggle = document.getElementById('accountTypeToggle');
    const formHeading = document.getElementById('formHeading');
    const studentFields = document.getElementById('studentFields');
    const facultyFields = document.getElementById('facultyFields');
    const submitButton = document.getElementById('submitButton');
    const messageDiv = document.getElementById('message');
    const loadingOverlay = document.getElementById('loadingOverlay');
    const loadingText = document.getElementById('loadingText');

    // Dropdowns for Student
    const studentProgramSelect = document.getElementById('program');
    const studentMajorSelect = document.getElementById('major');
    const studentAcademicYearSelect = document.getElementById('academic_year');
    const studentDepartmentSelect = document.getElementById('department'); // Common department select for student

    // Dropdowns for Faculty
    const facultyDepartmentSelect = document.getElementById('department_faculty'); // Separate department select for faculty
    const facultyTypeSelect = document.getElementById('type'); // Faculty type select

    // Photo Preview Elements
    const userPhotoInput = document.getElementById('user_photo');
    const photoPreviewContainer = document.getElementById('photoPreviewContainer');
    const photoPreview = document.getElementById('photoPreview');

    // API Endpoints
    const API_ENDPOINTS = {
        student: 'https://saigongiadinh.pythonanywhere.com/create_student_account/',
        faculty: 'https://saigongiadinh.pythonanywhere.com/create_faculty_account/',
        departments: 'https://saigongiadinh.pythonanywhere.com/Department/',
        programs: 'https://saigongiadinh.pythonanywhere.com/Program/',
        majors: 'https://saigongiadinh.pythonanywhere.com/Major/',
        academicYears: 'https://saigongiadinh.pythonanywhere.com/AcademicYear/',
        // Thêm API mới để lấy ngành theo khoa
        majorsByDepartment: 'https://saigongiadinh.pythonanywhere.com/MajorListByDepartmentAPIView/'
    };

    // Cloudinary Configuration
    const CLOUDINARY_CLOUD_NAME = 'dftarzzfw';
    const CLOUDINARY_UPLOAD_PRESET = 'SGGDCollege';
    const CLOUDINARY_UPLOAD_URL = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`;

    let allDepartments = [];
    let allPrograms = [];
    let allMajors = []; // Giờ đây biến này sẽ chứa TẤT CẢ ngành, dùng để lọc
    let allAcademicYears = [];

    // --- Utility Functions ---
    function showMessage(msg, type) {
        messageDiv.textContent = msg;
        messageDiv.className = `sggd-message sggd-${type}`;
        messageDiv.style.display = 'block';
    }

    function showLoading(text = 'Đang xử lý...') {
        loadingText.textContent = text;
        loadingOverlay.style.display = 'flex';
        submitButton.disabled = true;
    }

    function hideLoading() {
        loadingOverlay.style.display = 'none';
        submitButton.disabled = false;
    }

    async function uploadImageToCloudinary(file) {
        if (!file) return null;

        const formData = new FormData();
        formData.append('file', file);
        formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);

        try {
            const response = await fetch(CLOUDINARY_UPLOAD_URL, {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(`Cloudinary upload failed: ${errorData.error.message || response.statusText}`);
            }

            const data = await response.json();
            return data.secure_url;
        } catch (error) {
            console.error('Lỗi khi upload ảnh lên Cloudinary:', error);
            showMessage(`Lỗi khi upload ảnh: ${error.message}`, 'sggd-error');
            return null;
        }
    }

    function getAuthToken() {
        return localStorage.getItem('adminAuthToken');
    }

    // --- Dropdown Loading Functions ---
    async function fetchData(url) {
        try {
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            console.error(`Lỗi khi tải dữ liệu từ ${url}:`, error);
            showMessage(`Không thể tải dữ liệu từ ${url}. Vui lòng thử lại.`, 'sggd-error');
            return [];
        }
    }

    async function loadAllDropdownData() {
        showLoading('Đang tải dữ liệu...');
        await Promise.all([
            fetchData(API_ENDPOINTS.departments).then(data => allDepartments = data),
            fetchData(API_ENDPOINTS.programs).then(data => allPrograms = data),
            // Load ALL majors initially
            fetchData(API_ENDPOINTS.majors).then(data => allMajors = data), 
            fetchData(API_ENDPOINTS.academicYears).then(data => allAcademicYears = data)
            
        ]);
        console.log(allAcademicYears)
        hideLoading();
        populateDropdowns(); // Populate initial dropdowns based on default selection
    }

    function populateDropdown(selectElement, data, valueKey = 'id', textKey = 'name', defaultOptionText = 'Chọn...') {
        selectElement.innerHTML = `<option value="">${defaultOptionText}</option>`;
        data.forEach(item => {
            const option = document.createElement('option');
            option.value = item[valueKey];
            option.textContent = item[textKey];
            selectElement.appendChild(option);
        });
    }

    function populateDropdowns() {
        // Populate student-specific dropdowns
        populateDropdown(studentProgramSelect, allPrograms, 'id', 'name', 'Chọn chương trình học');
        // Major dropdown will be populated based on department selection
        // populateDropdown(studentMajorSelect, allMajors, 'id', 'name', 'Chọn ngành học'); // Removed, handled by filterMajorsByDepartment
        populateDropdown(studentAcademicYearSelect, allAcademicYears, 'id', 'name', 'Chọn năm học');
        populateDropdown(studentDepartmentSelect, allDepartments, 'id', 'name', 'Chọn khoa');

        // Populate faculty-specific dropdowns
        populateDropdown(facultyDepartmentSelect, allDepartments, 'id', 'name', 'Chọn khoa');
        // Faculty Type is hardcoded in HTML, no need to populate from API
    }

    // NEW FUNCTION: Filter Majors based on selected Department
    async function filterMajorsByDepartment() {
        const selectedDepartmentId = studentDepartmentSelect.value;
        if (selectedDepartmentId) {
            showLoading('Đang tải ngành học...');
            try {
                // Use the new API endpoint to get majors specific to the selected department
                const filteredMajors = await fetchData(`${API_ENDPOINTS.majorsByDepartment}?department_id=${selectedDepartmentId}`);
                populateDropdown(studentMajorSelect, filteredMajors, 'id', 'name', 'Chọn ngành học');
            } catch (error) {
                console.error('Lỗi khi tải ngành theo khoa:', error);
                populateDropdown(studentMajorSelect, [], 'id', 'name', 'Không thể tải ngành học');
            } finally {
                hideLoading();
            }
        } else {
            // If no department is selected, clear the major dropdown
            populateDropdown(studentMajorSelect, [], 'id', 'name', 'Chọn khoa trước để chọn ngành');
        }
    }


    // --- Form Type Switching Logic ---
    function updateFormVisibility() {
        const isFaculty = accountTypeToggle.checked; // true if checked (Faculty), false if unchecked (Student)

        if (isFaculty) {
            formHeading.textContent = 'Tạo Tài Khoản Giảng Viên Mới';
            studentFields.style.display = 'none';
            facultyFields.style.display = 'block';
            // Set required attributes for faculty fields and remove for student fields
            toggleRequiredFields(studentFields, false);
            toggleRequiredFields(facultyFields, true);
        } else {
            formHeading.textContent = 'Tạo Tài Khoản Sinh Viên Mới';
            studentFields.style.display = 'block';
            facultyFields.style.display = 'none';
            // Set required attributes for student fields and remove for faculty fields
            toggleRequiredFields(studentFields, true);
            toggleRequiredFields(facultyFields, false);
        }
        form.reset(); // Reset form fields on type change
        resetPhotoPreview(); // Reset photo preview on type change
        showMessage('', ''); // Clear messages
        populateDropdowns(); // Repopulate dropdowns to ensure correct default option
        // Call filterMajorsByDepartment after resetting and populating departments
        // This ensures the major dropdown is correctly cleared or pre-filtered if a department is selected by default
        filterMajorsByDepartment(); 
    }

    function toggleRequiredFields(container, isRequired) {
        const inputs = container.querySelectorAll('input[required], select[required]');
        inputs.forEach(input => {
            if (isRequired) {
                input.setAttribute('required', 'required');
            } else {
                input.removeAttribute('required');
            }
        });
        // Handle specific fields that might be common but required differently
        // Example: faculty_code and student_code are mutually exclusive required fields
        document.getElementById('student_code').required = !isRequired;
        document.getElementById('faculty_code').required = isRequired;
        document.getElementById('parent_name').required = !isRequired;
        document.getElementById('parent_phone').required = !isRequired;
        document.getElementById('program').required = !isRequired;
        document.getElementById('major').required = !isRequired;
        document.getElementById('academic_year').required = !isRequired;
        document.getElementById('student_status').required = !isRequired;
        // document.getElementById('gpa').required = false; // GPA is optional for student
        document.getElementById('type').required = isRequired;
        document.getElementById('department_faculty').required = isRequired;
        document.getElementById('position').required = isRequired;
        document.getElementById('degree').required = isRequired;
        document.getElementById('office_location').required = isRequired;
        // is_department_head is checkbox, not required
    }


    function resetPhotoPreview() {
        photoPreview.src = '#';
        photoPreview.style.display = 'none';
        photoPreviewContainer.style.display = 'none';
        userPhotoInput.value = ''; // Clear selected file
    }

    // --- Event Listeners ---
    accountTypeToggle.addEventListener('change', updateFormVisibility);

    // NEW EVENT LISTENER: Listen for changes on the student department select
    studentDepartmentSelect.addEventListener('change', filterMajorsByDepartment);


    userPhotoInput.addEventListener('change', function() {
        const file = this.files[0];
        if (file) {
            if (file.type.startsWith('image/')) {
                const reader = new FileReader();
                reader.onload = function(e) {
                    photoPreview.src = e.target.result;
                    photoPreview.style.display = 'block';
                    photoPreviewContainer.style.display = 'flex';
                };
                reader.readAsDataURL(file);
            } else {
                showMessage('Vui lòng chọn một file ảnh hợp lệ.', 'sggd-error');
                resetPhotoPreview();
            }
        } else {
            resetPhotoPreview();
        }
    });

    form.addEventListener('submit', async (event) => {
        event.preventDefault();

        showMessage('', '');
        showLoading('Đang gửi dữ liệu...');

        const isFaculty = accountTypeToggle.checked;
        const authToken = getAuthToken();

        if (!authToken) {
            hideLoading();
            showMessage('Bạn chưa đăng nhập hoặc không có quyền. Vui lòng đăng nhập với tài khoản Admin.', 'sggd-error');
            return;
        }

        let user_photo_url = null;
        const user_photo_file = userPhotoInput.files[0];
        if (user_photo_file) {
            showLoading('Đang tải ảnh lên Cloudinary...');
            user_photo_url = await uploadImageToCloudinary(user_photo_file);
            if (!user_photo_url) {
                hideLoading();
                return;
            }
        }

        const commonData = {
            username: document.getElementById('username').value,
            email: document.getElementById('email').value,
            first_name: document.getElementById('first_name').value,
            last_name: document.getElementById('last_name').value,
            nationality: document.getElementById('nationality').value,
            national_id_card: document.getElementById('national_id_card').value,
            date_of_birth: document.getElementById('date_of_birth').value,
            place_of_birth: document.getElementById('place_of_birth').value,
            user_photo: user_photo_url,
            phone: document.getElementById('phone').value,
            gender: document.getElementById('gender').value,
            address: document.getElementById('address').value,
            district: document.getElementById('district').value,
            city: document.getElementById('city').value,
            password: document.getElementById('national_id_card').value // Default password
        };

        let payload = {};
        let apiUrl = '';

        if (isFaculty) {
            // Faculty-specific data
            payload = {
                ...commonData,
                faculty_code: document.getElementById('faculty_code').value,
                type: facultyTypeSelect.value, // Use faculty-specific type select
                department: facultyDepartmentSelect.value ? parseInt(facultyDepartmentSelect.value) : null,
                position: document.getElementById('position').value,
                degree: document.getElementById('degree').value,
                office_location: document.getElementById('office_location').value,
                is_department_head: document.getElementById('is_department_head').checked
            };
            apiUrl = API_ENDPOINTS.faculty;
        } else {
            // Student-specific data
            payload = {
                ...commonData,
                student_code: document.getElementById('student_code').value,
                parent_name: document.getElementById('parent_name').value,
                parent_phone: document.getElementById('parent_phone').value,
                program: studentProgramSelect.value ? parseInt(studentProgramSelect.value) : null,
                major: studentMajorSelect.value ? parseInt(studentMajorSelect.value) : null,
                academic_year: studentAcademicYearSelect.value ? parseInt(studentAcademicYearSelect.value) : null,
                department: studentDepartmentSelect.value ? parseInt(studentDepartmentSelect.value) : null, // Use student-specific department select
                student_status: document.getElementById('student_status').value,
                // GPA: document.getElementById('gpa').value ? parseFloat(document.getElementById('gpa').value) : null
            };
            apiUrl = API_ENDPOINTS.student;
        }

        console.log('Dữ liệu payload trước khi gửi:', payload);

        try {
            showLoading(`Đang tạo tài khoản ${isFaculty ? 'giảng viên' : 'sinh viên'}...`);
            const response = await axios.post(apiUrl, payload, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Token ${authToken}`
                }
            });

            const data = response.data;
            alert(`Tạo tài khoản ${isFaculty ? 'giảng viên' : 'sinh viên'} thành công!`);
            form.reset();
            resetPhotoPreview();
            populateDropdowns(); // Re-populate dropdowns after reset
            filterMajorsByDepartment(); // Re-filter majors after reset
        } catch (error) {
            console.error(`Lỗi khi tạo tài khoản ${isFaculty ? 'giảng viên' : 'sinh viên'}:`, error);
            let errorMessage = 'Đã xảy ra lỗi không xác định. Vui lòng thử lại sau.';
            if (error.response) {
                console.error('Dữ liệu lỗi từ server:', error.response.data);
                if (error.response.data) {
                    try {
                        let detailedErrors = [];
                        for (const key in error.response.data) {
                            if (Array.isArray(error.response.data[key])) {
                                detailedErrors.push(`${key}: ${error.response.data[key].join(', ')}`);
                            } else {
                                detailedErrors.push(`${key}: ${error.response.data[key]}`);
                            }
                        }
                        errorMessage = detailedErrors.join('; ');
                    } catch (e) {
                        errorMessage = `Lỗi từ server: ${error.response.status} - ${error.response.statusText}. Chi tiết: ${JSON.stringify(error.response.data)}`;
                    }
                } else {
                    errorMessage = `Lỗi từ server: ${error.response.status} - ${error.response.statusText}`;
                }
            } else if (error.request) {
                errorMessage = 'Không nhận được phản hồi từ server. Vui lòng kiểm tra kết nối mạng.';
            } else {
                errorMessage = `Lỗi trong quá trình gửi yêu cầu: ${error.message}`;
            }
            showMessage(`Lỗi: ${errorMessage}`, 'sggd-error');
        } finally {
            hideLoading();
        }
    });

    // --- Initial Setup ---
    loadAllDropdownData();
    updateFormVisibility(); // Set initial form state (Student by default)
    // No need to call filterMajorsByDepartment here directly, updateFormVisibility already calls it.
});
// Cấu hình API URL của backend
const API_BASE_URL = 'https://saigongiadinh.pythonanywhere.com';


const addGradeModal = document.getElementById('addGradeModal');
const addGradeEntryForm = document.getElementById('addGradeEntryForm');
const addStudentIdInput = document.getElementById('addStudentId'); // Đây là input cho student_code
const addSubjectTitleDisplay = document.getElementById('addSubjectTitleDisplay'); // Hiển thị tên môn học
const addGradeCategorySelect = document.getElementById('addGradeCategory'); // Dropdown chọn loại cột điểm
const addScoreInput = document.getElementById('addScore');
const addCustomNameInput = document.getElementById('addCustomName');
const addModalSubmitButton = document.getElementById('addModalSubmitButton');
const addModalButtonText = document.getElementById('addModalButtonText');
const addModalLoadingSpinner = document.getElementById('addModalLoadingSpinner');
const addModalClearFormButton = document.getElementById('addModalClearFormButton');
const addModalCloseButton = document.getElementById('addModalCloseButton');
const addModalMessageBox = document.getElementById('addModalMessageBox');

// Các phần tử DOM cần thao tác cho BẢNG VÀ LỌC
const messageBox = document.getElementById('messageBox'); // Message box chính của trang
// const filterStudentIdInput = document.getElementById('filterStudentId');
// const filterSubjectIdInput = document.getElementById('filterSubjectId');
const filterGradesButton = document.getElementById('filterGradesButton');
const gradesTableBody = document.querySelector('#gradesTable tbody');

// Các phần tử DOM cần thao tác cho MODAL SỬA ĐIỂM - ĐÃ CẬP NHẬT
const editModal = document.getElementById('editModal');
const editGradeEntryForm = document.getElementById('editGradeEntryForm');
const modalStudentIdInput = document.getElementById('modalStudentId'); // Input hiển thị student_code trong modal sửa
// CẬP NHẬT: Thay đổi từ select sang div để hiển thị
const modalGradeCategoryDisplay = document.getElementById('modalGradeCategoryDisplay'); 
const modalScoreInput = document.getElementById('modalScore');
const modalCustomNameInput = document.getElementById('modalCustomName');
const modalSubmitButton = document.getElementById('modalSubmitButton');
const modalButtonText = document.getElementById('modalButtonText');
const modalLoadingSpinner = document.getElementById('modalLoadingSpinner');
const modalCloseButton = document.getElementById('modalCloseButton');
const modalMessageBox = document.getElementById('modalMessageBox');

// Các phần tử DOM cần thao tác cho MODAL XEM CHI TIẾT ĐIỂM MỚI
const gradeDetailsModal = document.getElementById('gradeDetailsModal');
const gradeDetailsCloseButton = document.getElementById('gradeDetailsCloseButton');
const gradeDetailsStudentInfo = document.getElementById('gradeDetailsStudentInfo');
const gradeDetailsTableBody = document.getElementById('gradeDetailsTableBody');
const gradeDetailsMessageBox = document.getElementById('gradeDetailsMessageBox');
const gradeDetailsLoadingSpinner = document.getElementById('gradeDetailsLoadingSpinner');

// BỔ SUNG: Các phần tử DOM cần thao tác cho MODAL CHỌN ĐIỂM ĐỂ SỬA
const selectGradeToEditModal = document.getElementById('selectGradeToEditModal');
const selectGradeToEditCloseButton = document.getElementById('selectGradeToEditCloseButton');
const selectGradeToEditStudentInfo = document.getElementById('selectGradeToEditStudentInfo');
const selectGradeToEditTableBody = document.getElementById('selectGradeToEditTableBody');
const selectGradeToEditMessageBox = document.getElementById('selectGradeToEditMessageBox');
const selectGradeToEditLoadingSpinner = document.getElementById('selectGradeToEditLoadingSpinner');


let gradeEntryIdToEdit = null; // Biến này lưu trữ ID của điểm đang được chỉnh sửa trong modal
let gradeCategoriesMap = new Map(); // Map: grade_category_id -> { full category object }
let gradeTypeCodesToIdMap = new Map(); // Map: grade_type_code (e.g., "ORAL") -> grade_category_id


/**
 * Hiển thị thông báo lên giao diện người dùng.
 * @param {HTMLElement} targetMessageBox Phần tử message box để hiển thị thông báo.
 * @param {string} message Nội dung thông báo.
 * @param {string} type Loại thông báo ('success' hoặc 'error').
 */
function showMessage(targetMessageBox, message, type) {
    targetMessageBox.textContent = message;
    targetMessageBox.className = `message-box ${type}`; // Xóa các class cũ và thêm class mới
    targetMessageBox.classList.remove('hidden');
    // Tự động ẩn sau 5 giây
    setTimeout(() => {
        targetMessageBox.classList.add('hidden');
    }, 5000);
}

// Bổ sung hàm showGlobalAlert để hiển thị thông báo tổng thể
function showGlobalAlert(message, type) {
    alert(message); // Sử dụng alert() để hiển thị thông báo
    // Có thể thêm logic để hiển thị thông báo đẹp hơn nếu bạn có UI components cho nó
    // Ví dụ: showMessage(messageBox, message, type); nếu muốn hiện lên messageBox chung
}

function getFacultyAuthToken() {
    const token = localStorage.getItem('authToken'); // Luôn lấy authToken cho giảng viên
    
    return token;
}


/**
 * Ẩn thông báo.
 * @param {HTMLElement} targetMessageBox Phần tử message box để ẩn thông báo.
 */
function hideMessage(targetMessageBox) {
    targetMessageBox.classList.add('hidden');
    targetMessageBox.textContent = '';
}

/**
 * Hiển thị/ẩn spinner loading.
 * @param {HTMLElement} targetLoadingSpinner Phần tử spinner.
 * @param {HTMLElement} targetButton Phần tử nút.
 * @param {boolean} isLoading True để hiển thị, false để ẩn.
 */
function toggleLoading(targetLoadingSpinner, targetButton, isLoading) {
    if (isLoading) {
        targetLoadingSpinner.classList.remove('hidden');
        if (targetButton) targetButton.disabled = true; // Nút có thể không tồn tại (ví dụ: chỉ spinner)
    } else {
        targetLoadingSpinner.classList.add('hidden');
        if (targetButton) targetButton.disabled = false;
    }
}

/**
 * Đặt lại form nhập mới (modal thêm điểm) về trạng thái mặc định.
 */
function resetAddEntryForm() {
    addGradeEntryForm.reset();
    addModalButtonText.textContent = 'Thêm cột điểm mới';
    hideMessage(addModalMessageBox);
    addStudentIdInput.disabled = false;
    addGradeCategorySelect.disabled = false;
    addSubjectTitleDisplay.textContent = ''; // Xóa nội dung môn học
    addGradeCategorySelect.innerHTML = '<option value="">Chọn loại cột điểm</option>'; // Đặt lại dropdown
}

/**
 * Đặt lại form modal sửa điểm về trạng thái mặc định.
 */
function resetEditModalForm() {
    editGradeEntryForm.reset();
    gradeEntryIdToEdit = null;
    modalButtonText.textContent = 'Cập nhật điểm';
    modalSubmitButton.classList.remove('primary', 'update-mode'); // Đảm bảo không còn class update-mode
    hideMessage(modalMessageBox);
    modalStudentIdInput.disabled = false; // Mở lại input sau khi reset
    // CẬP NHẬT: Reset nội dung của div hiển thị loại cột điểm
    modalGradeCategoryDisplay.textContent = ''; 
}

/**
 * Lấy danh sách GradeCategory (loại cột điểm cho một môn học cụ thể) và điền vào dropdown đã cho.
 * Đồng thời cập nhật `gradeCategoriesMap` và `gradeTypeCodesToIdMap`.
 * @param {HTMLElement} selectElement Phần tử <select> để điền dữ liệu vào.
 * @param {string} subjectId ID của môn học để lọc các GradeCategory (tùy chọn).
 */
async function populateGradeCategoriesDropdown(selectElement, subjectId = null) {
    const token = getFacultyAuthToken();
    const headers = {}; // Khởi tạo headers
    if (token) {
        headers['Authorization'] = `Token ${token}`;
    }
    
    try {
        let url;
        if (subjectId && subjectId !== 'null') {
            url = `${API_BASE_URL}/GradeCategoryViewSet/subject/${subjectId}/`;
            console.log(`[populateGradeCategoriesDropdown] Fetching GradeCategories for subject ID: ${subjectId} from URL: ${url}`);
        } else {
            url = `${API_BASE_URL}/GradeCategoryViewSet/`;
            console.log(`[populateGradeCategoriesDropdown] Subject ID not provided or invalid (${subjectId}). Fetching all GradeCategories from URL: ${url}`);
        }

        const response = await fetch(url, { headers: headers });
        if (!response.ok) {
            const errorText = await response.text();
            console.error(`[populateGradeCategoriesDropdown] HTTP error! status: ${response.status}, response: ${errorText}`);
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const gradeCategories = await response.json();
        console.log(`[populateGradeCategoriesDropdown] Received ${gradeCategories.length} GradeCategories for dropdown.`);

        selectElement.innerHTML = '<option value="">Chọn loại cột điểm</option>'; // Reset dropdown
        gradeCategories.forEach(category => {
            const option = document.createElement('option');
            option.value = category.id; // Giá trị option là ID của GradeCategory
            option.textContent = `${category.grade_type_name} (${category.subject_title})`; 
            selectElement.appendChild(option);
            // Cập nhật map khi tải danh mục điểm cho dropdown cũng như cho bản đồ chung
            gradeCategoriesMap.set(category.id, category); // Store full category object
            gradeTypeCodesToIdMap.set(category.grade_type_code, category.id);
        });
    } catch (error) {
        console.error('[populateGradeCategoriesDropdown] Lỗi khi lấy danh mục điểm:', error);
        showMessage(messageBox, 'Không thể tải danh mục điểm. Vui lòng thử lại.', 'error');
    }
}

/**
 * Lấy tất cả danh mục điểm và lưu vào gradeCategoriesMap và gradeTypeCodesToIdMap.
 * Hàm này được gọi một lần khi ứng dụng khởi tạo.
 */
async function fetchAllGradeCategoriesForMap() {
    const token = getFacultyAuthToken();
    const headers = {}; // Khởi tạo headers
    if (token) {
        headers['Authorization'] = `Token ${token}`;
    }
    try {
        const url = `${API_BASE_URL}/GradeCategoryViewSet/`;
        const response = await fetch(url, { headers: headers });
        if (!response.ok) {
            const errorText = await response.text();
            console.error(`[fetchAllGradeCategoriesForMap] HTTP error! status: ${response.status}, response: ${errorText}`);
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const gradeCategories = await response.json();
        gradeCategoriesMap.clear(); // Xóa map cũ trước khi điền mới
        gradeTypeCodesToIdMap.clear(); // Xóa map cũ trước khi điền mới
        gradeCategories.forEach(category => {
            gradeCategoriesMap.set(category.id, category); // Store full category object
            gradeTypeCodesToIdMap.set(category.grade_type_code, category.id);
        });
        console.log(`[fetchAllGradeCategoriesForMap] Grade categories maps updated with ${gradeCategoriesMap.size} entries.`);
    } catch (error) {
        console.error('[fetchAllGradeCategoriesForMap] Lỗi khi lấy tất cả danh mục điểm:', error);
        // Có thể không hiển thị lỗi cho người dùng cuối nếu đây là background fetch
    }
}


/**
 * Lấy danh sách điểm đã nhập dựa trên bộ lọc và hiển thị trong bảng.
 */
async function fetchGradeEntries(gradeLevel = null, subjectId = null) {
    gradesTableBody.innerHTML = '<tr><td colspan="5" class="text-center text-gray-500 py-4"><div class="flex-center"><span class="loading-spinner"></span> Đang tải điểm...</div></td></tr>';

    let url = `${API_BASE_URL}/GradeEntryViewSet/`;

    const queryParams = [];
    if (gradeLevel) {
        queryParams.push(`grade_level=${gradeLevel}`);
    }
    if (subjectId) {
        queryParams.push(`subject_id=${subjectId}`);
    }
    if (queryParams.length > 0) {
        url += `?${queryParams.join('&')}`;
    }

    const token = getFacultyAuthToken();
    const headers = {
        'Content-Type': 'application/json',
    };
    if (token) {
        headers['Authorization'] = `Token ${token}`; 
    }

    try {
        const response = await fetch(url, { headers: headers });
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const studentsGrades = await response.json();

        gradesTableBody.innerHTML = '';
        if (studentsGrades.length === 0) {
            gradesTableBody.innerHTML = '<tr><td colspan="5" class="text-center text-gray-500 py-4">Không tìm thấy điểm nào.</td></tr>';
            showMessage(messageBox, 'Không tìm thấy điểm nào phù hợp với tiêu chí lọc.', 'info');
            return;
        }

        let stt = 0; 
        studentsGrades.forEach(studentGrade => {
            stt++; 
            const row = document.createElement('tr');
            row.dataset.studentCode = studentGrade.student_code;
            row.dataset.subjectTitle = studentGrade.subject_title;
            row.dataset.subjectId = studentGrade.subject_id; 

            row.innerHTML = `
                <td>${stt}</td>
                <td>${studentGrade.student_code}</td>
                <td>${studentGrade.student_full_name || 'N/A'}</td>
                <td>${studentGrade.subject_title || 'N/A'}</td>
                <td>
                    <button class="show-button action-button"
                        data-student-code="${studentGrade.student_code}"
                        data-subject-title="${studentGrade.subject_title}"
                        data-subject-id="${studentGrade.subject_id}">Xem</button>
                    <button class="add-button action-button"
                        data-student-code="${studentGrade.student_code}"
                        data-subject-title="${studentGrade.subject_title}"
                        data-subject-id="${studentGrade.subject_id}">Thêm</button>
                    <button class="edit-grades-button action-button"
                        data-student-code="${studentGrade.student_code}"
                        data-subject-id="${studentGrade.subject_id}"
                        data-subject-title="${studentGrade.subject_title}">Sửa</button>
                </td>
            `;
            gradesTableBody.appendChild(row);
        });

        // Gán event listeners sau khi các nút đã được thêm vào DOM
        document.querySelectorAll('.add-button').forEach(button => {
            button.addEventListener('click', (event) => {
                const studentCodeToAdd = event.target.dataset.studentCode;
                const subjectTitleToAdd = event.target.dataset.subjectTitle;
                const subjectIdToAdd = event.target.dataset.subjectId;
                console.log(`[Add button click] studentCodeToAdd: ${studentCodeToAdd}, subjectTitleToAdd: ${subjectTitleToAdd}, subjectIdToAdd (from dataset): ${subjectIdToAdd}`);
                populateAddModal(studentCodeToAdd, subjectTitleToAdd, subjectIdToAdd);
            });
        });

        document.querySelectorAll('.edit-grades-button').forEach(button => {
            button.addEventListener('click', (event) => {
                const studentCodeToEdit = event.target.dataset.studentCode;
                const subjectIdToEdit = event.target.dataset.subjectId; 
                const subjectTitleToEdit = event.target.dataset.subjectTitle;

                const studentGradeToEdit = studentsGrades.find(sg => 
                    sg.student_code === studentCodeToEdit && String(sg.subject_id) === String(subjectIdToEdit)
                );

                if (studentGradeToEdit) {
                    showSelectGradeToEditModal(studentGradeToEdit);
                } else {
                    showMessage(messageBox, `Không tìm thấy dữ liệu học sinh để sửa cho ${studentCodeToEdit} môn ${subjectTitleToEdit}.`, 'error');
                }
            });
        });

        document.querySelectorAll('.show-button').forEach(button => {
            button.addEventListener('click', (event) => {
                const studentCode = event.target.dataset.studentCode;
                const subjectTitle = event.target.dataset.subjectTitle;
                const subjectId = event.target.dataset.subjectId;

                const studentGradeData = studentsGrades.find(sg =>
                    sg.student_code === studentCode && sg.subject_title === subjectTitle && String(sg.subject_id) === String(subjectId)
                );

                if (studentGradeData) {
                    showGradeDetailsModal(studentGradeData);
                } else {
                    showMessage(messageBox, `Không tìm thấy thông tin điểm chi tiết cho học sinh ${studentCode} môn ${subjectTitle}.`, 'error');
                }
            });
        });

    } catch (error) {
        gradesTableBody.innerHTML = '<tr><td colspan="5" class="text-center text-red-500 py-4">Lỗi tải dữ liệu điểm.</td></tr>';
        showMessage(messageBox, 'Không thể tải danh sách điểm. Vui lòng kiểm tra console.', 'error');
    }
}

/**
 * Điền dữ liệu của một GradeEntry vào modal để sửa.
 * @param {string} gradeId ID của GradeEntry cần sửa.
 * @param {object} grade The specific grade entry object to populate the modal with.
 */
function populateEditModal(gradeId, grade) {
    console.log("Đối tượng grade được tìm thấy trong populateEditModal:", grade);
    if (grade) {
        resetEditModalForm(); // Reset modal form trước khi điền dữ liệu
        modalStudentIdInput.value = grade.student_code;
        console.log("Giá trị student_code được gán:", grade.student_code);
        
        // Lấy thông tin loại cột điểm từ map
        const gradeCategoryInfo = gradeCategoriesMap.get(grade.grade_category_id);
        const gradeCategoryName = gradeCategoryInfo ? `${gradeCategoryInfo.grade_type_name} (${gradeCategoryInfo.subject_title})` : 'N/A';
        // CẬP NHẬT: Gán vào div hiển thị thay vì select
        modalGradeCategoryDisplay.textContent = gradeCategoryName;

        modalScoreInput.value = parseFloat(grade.score);
        modalCustomNameInput.value = grade.custom_name || '';

        gradeEntryIdToEdit = grade.id; // Lưu ID của điểm đang sửa
        modalButtonText.textContent = `Cập nhật điểm`;
        modalSubmitButton.classList.add('primary', 'update-mode');

        modalStudentIdInput.disabled = true;
        // CẬP NHẬT: Không cần disabled modalGradeCategorySelect nữa vì nó không phải là select
        // modalGradeCategorySelect.disabled = true; // Không còn dùng
        
        hideSelectGradeToEditModal(); // Ẩn modal chọn điểm trước khi hiện modal sửa
        showEditModal(); // Hiển thị modal
    } else {
        showMessage(messageBox, 'Không tìm thấy điểm để chỉnh sửa.', 'error');
    }
}


/**
 * Điền dữ liệu cần thiết vào modal thêm điểm mới.
 * @param {string} studentCode Mã học sinh để điền sẵn.
 * @param {string} subjectTitle Tên môn học để gợi ý loại điểm.
 * @param {string} subjectId ID của môn học để điền sẵn.
 */
function populateAddModal(studentCode, subjectTitle, subjectId) {
    resetAddEntryForm(); // Đặt lại form khi mở
    addStudentIdInput.value = studentCode; // Điền sẵn mã học sinh
    addSubjectTitleDisplay.textContent = subjectTitle; // Hiển thị tên môn học
    addModalButtonText.textContent = `Thêm cột điểm mới`;

    console.log(`[populateAddModal] subjectId: ${subjectId}`);
    populateGradeCategoriesDropdown(addGradeCategorySelect, subjectId);

    showAddModal();
}

/**
 * Hiển thị modal sửa điểm.
 */
function showEditModal() {
    editModal.classList.remove('hidden');
}

/**
 * Ẩn modal sửa điểm.
 */
function hideEditModal() {
    editModal.classList.add('hidden');
    resetEditModalForm(); // Đặt lại form khi đóng modal
}

/**
 * Hiển thị modal thêm điểm mới.
 */
function showAddModal() {
    addGradeModal.classList.remove('hidden');
}

/**
 * Ẩn modal thêm điểm mới.
 */
function hideAddModal() {
    addGradeModal.classList.add('hidden');
    resetAddEntryForm(); // Đặt lại form khi đóng modal
}

/**
 * Hiển thị modal chi tiết điểm của học sinh.
 * @param {object} studentGradeData Đối tượng chứa thông tin học sinh và tất cả điểm của môn học.
 */
async function showGradeDetailsModal(studentGradeData) {
    gradeDetailsModal.classList.remove('hidden');
    hideMessage(gradeDetailsMessageBox);
    gradeDetailsTableBody.innerHTML = ''; // Clear previous entries
    toggleLoading(gradeDetailsLoadingSpinner, null, true); // Show loading spinner

    gradeDetailsStudentInfo.textContent = `Điểm của học sinh: ${studentGradeData.student_full_name} (${studentGradeData.student_code}) - Môn: ${studentGradeData.subject_title}`;

    // Đảm bảo gradeCategoriesMap và gradeTypeCodesToIdMap đã được tải
    if (gradeCategoriesMap.size === 0 || gradeTypeCodesToIdMap.size === 0) {
        await fetchAllGradeCategoriesForMap();
    }

    const allGrades = [];
    // Lặp qua các loại điểm (ORAL, FIFTEEN_MIN, v.v.) trong dữ liệu và gán grade_category_id
    for (const categoryCode in studentGradeData.grades) {
        if (studentGradeData.grades.hasOwnProperty(categoryCode)) {
            const gradesForCategory = studentGradeData.grades[categoryCode];
            const gradeCategoryId = gradeTypeCodesToIdMap.get(categoryCode);

            if (gradeCategoryId !== undefined) { // Chỉ xử lý nếu tìm thấy ID danh mục cho mã loại
                if (Array.isArray(gradesForCategory)) {
                    gradesForCategory.forEach(gradeEntry => {
                        allGrades.push({ ...gradeEntry, grade_category_id: gradeCategoryId });
                    });
                } else if (gradesForCategory !== null && typeof gradesForCategory === 'object') {
                    // Đối với các đối tượng điểm duy nhất như MIDTERM, FINAL
                    allGrades.push({ ...gradesForCategory, grade_category_id: gradeCategoryId });
                }
            }
        }
    }

    if (allGrades.length === 0) {
        gradeDetailsTableBody.innerHTML = '<tr><td colspan="4" class="text-center text-gray-500 py-4">Không có điểm nào cho môn học này.</td></tr>';
        toggleLoading(gradeDetailsLoadingSpinner, null, false);
        return;
    }

    // Sort grades by grade_category_name and then by custom_name if available
    allGrades.sort((a, b) => {
        // Lấy thông tin loại cột điểm từ map hoặc gán chuỗi rỗng nếu không tìm thấy
        const categoryAInfo = gradeCategoriesMap.get(a.grade_category_id);
        const categoryBInfo = gradeCategoriesMap.get(b.grade_category_id);

        const categoryNameA = categoryAInfo ? categoryAInfo.grade_type_name : '';
        const categoryNameB = categoryBInfo ? categoryBInfo.grade_type_name : '';
        
        const categoryA = categoryNameA.toLowerCase();
        const categoryB = categoryNameB.toLowerCase(); 

        if (categoryA < categoryB) return -1;
        if (categoryA > categoryB) return 1;

        // Nếu các danh mục giống nhau, sắp xếp theo tên tùy chỉnh nếu có
        const customNameA = (a.custom_name || '').toLowerCase();
        const customNameB = (b.custom_name || '').toLowerCase();

        if (customNameA < customNameB) return -1;
        if (customNameA > customNameB) return 1;
        return 0;
    });

    let stt = 0;
    allGrades.forEach(grade => {
        stt++;
        // Lấy tên loại cột điểm từ map
        const gradeCategoryInfo = gradeCategoriesMap.get(grade.grade_category_id);
        const gradeCategoryName = gradeCategoryInfo ? gradeCategoryInfo.grade_type_name : 'N/A';

        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${stt}</td>
            <td>${gradeCategoryName}</td>
            <td>${grade.score !== undefined && grade.score !== null ? grade.score : 'N/A'}</td>
            <td>${grade.custom_name || ''}</td>
        `;
        gradeDetailsTableBody.appendChild(row);
    });
    toggleLoading(gradeDetailsLoadingSpinner, null, false); // Hide loading spinner
}

/**
 * Ẩn modal chi tiết điểm của học sinh.
 */
function hideGradeDetailsModal() {
    gradeDetailsModal.classList.add('hidden');
    gradeDetailsTableBody.innerHTML = '';
    gradeDetailsStudentInfo.textContent = '';
    hideMessage(gradeDetailsMessageBox);
}

// BỔ SUNG: Hàm hiển thị modal chọn điểm để sửa
async function showSelectGradeToEditModal(studentGradeData) {
    selectGradeToEditModal.classList.remove('hidden');
    hideMessage(selectGradeToEditMessageBox);
    selectGradeToEditTableBody.innerHTML = ''; // Clear previous entries
    toggleLoading(selectGradeToEditLoadingSpinner, null, true);

    selectGradeToEditStudentInfo.textContent = `Chọn điểm để sửa cho học sinh: ${studentGradeData.student_full_name} (${studentGradeData.student_code}) - Môn: ${studentGradeData.subject_title}`;

    if (gradeCategoriesMap.size === 0 || gradeTypeCodesToIdMap.size === 0) {
        await fetchAllGradeCategoriesForMap();
    }

    const allIndividualGrades = [];
    for (const categoryCode in studentGradeData.grades) {
        if (studentGradeData.grades.hasOwnProperty(categoryCode)) {
            const gradesForCategory = studentGradeData.grades[categoryCode];
            const gradeCategoryId = gradeTypeCodesToIdMap.get(categoryCode);

            if (gradeCategoryId !== undefined) {
                if (Array.isArray(gradesForCategory)) {
                    gradesForCategory.forEach(gradeEntry => {
                        allIndividualGrades.push({ 
                            ...gradeEntry, 
                            student_code: studentGradeData.student_code, 
                            subject_id: studentGradeData.subject_id,
                            grade_category_id: gradeCategoryId 
                        });
                    });
                } else if (gradesForCategory !== null && typeof gradesForCategory === 'object') {
                    allIndividualGrades.push({ 
                        ...gradesForCategory, 
                        student_code: studentGradeData.student_code, 
                        subject_id: studentGradeData.subject_id,
                        grade_category_id: gradeCategoryId 
                    });
                }
            }
        }
    }

    if (allIndividualGrades.length === 0) {
        selectGradeToEditTableBody.innerHTML = '<tr><td colspan="4" class="text-center text-gray-500 py-4">Không có điểm nào để sửa cho môn học này.</td></tr>';
        toggleLoading(selectGradeToEditLoadingSpinner, null, false);
        return;
    }

    // Sort grades for display
    allIndividualGrades.sort((a, b) => {
        const categoryAInfo = gradeCategoriesMap.get(a.grade_category_id);
        const categoryBInfo = gradeCategoriesMap.get(b.grade_category_id);
        const categoryNameA = categoryAInfo ? categoryAInfo.grade_type_name : '';
        const categoryNameB = categoryBInfo ? categoryBInfo.grade_type_name : '';
        
        const categoryCompare = categoryNameA.localeCompare(categoryNameB);
        if (categoryCompare !== 0) return categoryCompare;
        return (a.custom_name || '').localeCompare(b.custom_name || '');
    });

    let stt = 0;
    allIndividualGrades.forEach(grade => {
        stt++;
        const gradeCategoryInfo = gradeCategoriesMap.get(grade.grade_category_id);
        const gradeCategoryName = gradeCategoryInfo ? gradeCategoryInfo.grade_type_name : 'N/A';

        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${stt}</td>
            <td>${gradeCategoryName}</td>
            <td>${grade.custom_name || ''}</td>
            <td>${grade.score !== undefined && grade.score !== null ? grade.score : 'N/A'}</td>
            <td>
                <button class="edit-individual-grade-button action-button primary"
                    data-grade-id="${grade.id}"
                    data-student-code="${grade.student_code}"
                    data-subject-id="${grade.subject_id}"
                    data-grade-category-id="${grade.grade_category_id}"
                    data-score="${grade.score}"
                    data-custom-name="${grade.custom_name || ''}">Sửa</button>
            </td>
        `;
        selectGradeToEditTableBody.appendChild(row);
    });

    // Gán event listeners cho các nút "Sửa" trong modal này
    document.querySelectorAll('.edit-individual-grade-button').forEach(button => {
        button.addEventListener('click', (event) => {
            const gradeId = event.target.dataset.gradeId;
            const studentCode = event.target.dataset.studentCode;
            const subjectId = event.target.dataset.subjectId; // Mặc dù không dùng trực tiếp trong form sửa, nhưng có thể cần cho debug
            const gradeCategoryId = event.target.dataset.gradeCategoryId;
            const score = event.target.dataset.score;
            const customName = event.target.dataset.customName;

            const gradeToPopulate = {
                id: gradeId,
                student_code: studentCode,
                subject_id: subjectId,
                grade_category_id: parseInt(gradeCategoryId),
                score: parseFloat(score),
                custom_name: customName
            };
            populateEditModal(gradeToPopulate.id, gradeToPopulate);
        });
    });

    toggleLoading(selectGradeToEditLoadingSpinner, null, false);
}

// BỔ SUNG: Hàm ẩn modal chọn điểm để sửa
function hideSelectGradeToEditModal() {
    selectGradeToEditModal.classList.add('hidden');
    selectGradeToEditTableBody.innerHTML = '';
    selectGradeToEditStudentInfo.textContent = '';
    hideMessage(selectGradeToEditMessageBox);
}


// Xử lý sự kiện gửi form MODAL THÊM ĐIỂM MỚI
addGradeEntryForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    hideMessage(addModalMessageBox);
    toggleLoading(addModalLoadingSpinner, addModalSubmitButton, true);

    const formData = {
        student_code: addStudentIdInput.value,
        grade_category_id: parseInt(addGradeCategorySelect.value),
        score: parseFloat(addScoreInput.value),
        custom_name: addCustomNameInput.value || null
    };
    const token = getFacultyAuthToken();
    const headers = {
        'Content-Type': 'application/json',
    };
    if (token) {
        headers['Authorization'] = `Token ${token}`; // Thêm token nếu có
    }

    console.log(`[Add Form Submit] Sending data:`, formData);

    try {
        const response = await fetch(`${API_BASE_URL}/GradeEntryViewSet/`, {
            method: 'POST',
            headers: headers,
            body: JSON.stringify(formData)
        });

        const data = await response.json();

        if (response.ok) {
            showMessage(addModalMessageBox, 'Thêm điểm mới thành công!', 'success');
            showGlobalAlert('Thêm điểm mới thành công!'); // Thông báo alert
            hideAddModal(); // Tắt modal sau khi thêm thành công
            fetchGradeEntries(); // Tải lại danh sách điểm
        } else {
            let errorMessage = 'Đã có lỗi xảy ra khi thêm điểm. Vui lòng thử lại.';
            if (data.detail) {
                errorMessage = data.detail;
            } else if (data) {
                errorMessage = Object.entries(data)
                    .map(([key, value]) => {
                        const fieldName = key === 'non_field_errors' ? 'Lỗi chung' : key;
                        return `${fieldName}: ${Array.isArray(value) ? value.join(', ') : value}`;
                    })
                    .join('; ');
            }
            showMessage(addModalMessageBox, errorMessage, 'error');
            showGlobalAlert(`Lỗi khi thêm điểm: ${errorMessage}`); // Thông báo alert lỗi
            console.error('[Add Form Submit] Lỗi API (thêm điểm):', data);
        }
    } catch (error) {
        console.error('[Add Form Submit] Lỗi khi gửi yêu cầu thêm điểm:', error);
        showMessage(addModalMessageBox, 'Không thể kết nối với server. Vui lòng kiểm tra console.', 'error');
        showGlobalAlert('Không thể kết nối với server. Vui lòng kiểm tra console.'); // Thông báo alert lỗi kết nối
    } finally {
        toggleLoading(addModalLoadingSpinner, addModalSubmitButton, false);
    }
});

// Xử lý sự kiện gửi form MODAL SỬA ĐIỂM
editGradeEntryForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    hideMessage(modalMessageBox);
    toggleLoading(modalLoadingSpinner, modalSubmitButton, true);

    const formData = {
        score: parseFloat(modalScoreInput.value),
        custom_name: modalCustomNameInput.value || null,
    };
    const token = getFacultyAuthToken();
    const headers = {
        'Content-Type': 'application/json',
    };
    if (token) {
        headers['Authorization'] = `Token ${token}`; // Thêm token nếu có
    }

    console.log(`[Edit Form Submit] Sending data for grade ID ${gradeEntryIdToEdit}:`, formData);

    try {
        const response = await fetch(`https://saigongiadinh.pythonanywhere.com/GradeEntryViewSet/${gradeEntryIdToEdit}/`, {
            method: 'PATCH',
            headers: headers,
            body: JSON.stringify(formData)
        });

        const data = await response.json();

        if (response.ok) {
            showMessage(modalMessageBox, 'Cập nhật điểm thành công!', 'success');
            showGlobalAlert('Cập nhật điểm thành công!'); // Thông báo alert
            hideEditModal(); // Tắt modal sau khi sửa thành công
            fetchGradeEntries(); // Tải lại danh sách điểm
        } else {
            let errorMessage = 'Đã có lỗi xảy ra khi cập nhật điểm. Vui lòng thử lại.';
            if (data.detail) {
                errorMessage = data.detail;
            } else if (data) {
                errorMessage = Object.entries(data)
                    .map(([key, value]) => {
                        const fieldName = key === 'non_field_errors' ? 'Lỗi chung' : key;
                        return `${fieldName}: ${Array.isArray(value) ? value.join(', ') : value}`;
                    })
                    .join('; ');
            }
            showMessage(modalMessageBox, errorMessage, 'error');
            showGlobalAlert(`Lỗi khi cập nhật điểm: ${errorMessage}`); // Thông báo alert lỗi
            console.error('[Edit Form Submit] Lỗi API (cập nhật điểm):', data);
        }
    } catch (error) {
        console.error('[Edit Form Submit] Lỗi khi gửi yêu cầu cập nhật điểm:', error);
        showMessage(modalMessageBox, 'Không thể kết nối với server. Vui lòng kiểm tra console.', 'error');
        showGlobalAlert('Không thể kết nối với server. Vui lòng kiểm tra console.'); // Thông báo alert lỗi kết nối
    } finally {
        toggleLoading(modalLoadingSpinner, modalSubmitButton, false);
    }
});

// Khởi tạo ứng dụng khi DOM đã sẵn sàng
document.addEventListener('DOMContentLoaded', () => {
    // Tải tất cả các danh mục điểm vào map khi khởi tạo
    fetchAllGradeCategoriesForMap();

    // Event listener cho nút lọc điểm
    if (filterGradesButton) {
        filterGradesButton.addEventListener('click', fetchGradeEntries);
    }

    // Event listener cho nút đóng modal Thêm
    if (addModalCloseButton) {
        addModalCloseButton.addEventListener('click', hideAddModal);
    }

    // Event listener cho nút "Xóa form" trong modal Thêm
    if (addModalClearFormButton) {
        addModalClearFormButton.addEventListener('click', resetAddEntryForm);
    }

    // Event listener để đóng modal Thêm khi click ra ngoài (overlay)
    if (addGradeModal) {
        addGradeModal.addEventListener('click', (event) => {
            if (event.target === addGradeModal) {
                hideAddModal();
            }
        });
    }

    // Event listener cho nút đóng modal Sửa
    if (modalCloseButton) {
        modalCloseButton.addEventListener('click', hideEditModal);
    }

    // Event listener để đóng modal Sửa khi click ra ngoài (overlay)
    if (editModal) {
        editModal.addEventListener('click', (event) => {
            if (event.target === editModal) {
                hideEditModal();
            }
        });
    }

    // Event listener cho nút đóng modal Xem chi tiết điểm
    if (gradeDetailsCloseButton) {
        gradeDetailsCloseButton.addEventListener('click', hideGradeDetailsModal);
    }

    // Event listener để đóng modal Xem chi tiết điểm khi click ra ngoài (overlay)
    if (gradeDetailsModal) {
        gradeDetailsModal.addEventListener('click', (event) => {
            if (event.target === gradeDetailsModal) {
                hideGradeDetailsModal();
            }
        });
    }

    // BỔ SUNG: Event listener cho nút đóng modal Chọn điểm để sửa
    if (selectGradeToEditCloseButton) {
        selectGradeToEditCloseButton.addEventListener('click', hideSelectGradeToEditModal);
    }

    // BỔ SUNG: Event listener để đóng modal Chọn điểm để sửa khi click ra ngoài (overlay)
    if (selectGradeToEditModal) {
        selectGradeToEditModal.addEventListener('click', (event) => {
            if (event.target === selectGradeToEditModal) {
                hideSelectGradeToEditModal();
            }
        });
    }

    // Tải danh sách điểm ban đầu khi DOM đã sẵn sàng
    fetchGradeEntries();
});
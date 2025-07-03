document.addEventListener('DOMContentLoaded', async () => {
    // API URLs
    const grade9PlusApiUrl = 'https://saigongiadinh.pythonanywhere.com/GradeEntryViewSet/';
    const collegeGradeApiUrl = 'https://saigongiadinh.pythonanywhere.com/StudentGradeListView/';
    const semesterApiUrl = 'https://saigongiadinh.pythonanywhere.com/SemesterListView/';
    const subjectApiUrl = 'https://saigongiadinh.pythonanywhere.com/SubjectViewSet/';

    // DOM Elements (9+)
    const semesterSelect = document.getElementById('semester-select');
    const gradeTableHeader = document.getElementById('grade-table-header');
    const gradeTableBody = document.getElementById('grade-table-body');
    const additional9PlusInfo = document.getElementById('additional-9plus-info');
    const ninePlusSemesterSection = document.getElementById('9plus-semester-section');
    const ninePlusTableWrapper = document.getElementById('9plus-table-wrapper');

    // DOM Elements (College)
    const collegeGradesSection = document.getElementById('college-grades-section');
    const studentInfoCollege = document.getElementById('student-info-college');
    const collegeGradeTableBody = document.getElementById('collegeGradeTableBody');
    const loadingMessageCollege = document.getElementById('loadingMessage-college');
    const errorMessageCollege = document.getElementById('errorMessage-college');
    const collegeGradeTable = document.getElementById('collegeGradeTable');

    // General DOM Elements
    const btn9Plus = document.getElementById('btn-9plus');
    const btnCollege = document.getElementById('btn-college');
    const gradeTableTitle = document.getElementById('grade-table-title');
    const noDataMessage = document.getElementById('no-data-message');

    // Global variables
    let currentStudentClassName = ''; // For 9+ grades
    let currentActiveTab = '9plus'; // '9plus' or 'college'
    let has9PlusGrades = false; // Biến để kiểm tra có dữ liệu 9+ không
    let hasCollegeGrades = false; // Biến để kiểm tra có dữ liệu Cao đẳng không

    // --- Authentication Token ---
    function getAuthToken() {
        return localStorage.getItem('authToken');
    }
    const token = getAuthToken();

    // NEW: Kiểm tra token ngay từ đầu
    if (!token) {
        alert('Phiên đăng nhập của bạn đã hết hạn. Vui lòng đăng nhập lại nhé!');
        window.location.href = '/dangnhap'; // Chuyển hướng về trang đăng nhập
        return; // Dừng việc thực thi script nếu không có token
    }

    // --- Helper function: Get grade level from class name (for 9+ grades) ---
    function getGradeLevelFromClassName(className) {
        if (!className) return null;
        const matches = className.match(/^(\d{2})/); // Get first 2 digits
        if (matches && matches[1]) {
            const year = parseInt(matches[1], 10);
            if (year === 10) return 'KHOI_10';
            if (year === 11) return 'KHOI_11';
            if (year === 12) return 'KHOI_12';
        }
        return null;
    }

    // --- Helper function: Get grade type based on 4-point score (for College grades) ---
    function getCollegeGradeType(score4) {
        score4 = parseFloat(score4);
        if (isNaN(score4)) {
            return 'N/A';
        }
        if (score4 >= 3.6 && score4 <= 4.0) {
            return 'Xuất sắc';
        } else if (score4 >= 3.2 && score4 < 3.6) {
            return 'Giỏi';
        } else if (score4 >= 2.5 && score4 < 3.2) {
            return 'Khá';
        } else if (score4 >= 2.0 && score4 < 2.5) {
            return 'Trung bình';
        } else if (score4 >= 1.0 && score4 < 2.0) {
            return 'Yếu';
        } else if (score4 < 1.0) {
            return 'Kém';
        }
        return 'Không xác định';
    }

    // --- Function to update button states ---
    function updateButtonStates() {
        if (has9PlusGrades) {
            btn9Plus.removeAttribute('disabled');
            btn9Plus.classList.remove('disabled-button');
            btn9Plus.title = '';
        } else {
            btn9Plus.setAttribute('disabled', true);
            btn9Plus.classList.add('disabled-button');
            btn9Plus.title = 'Không có dữ liệu điểm 9+ cho học sinh này.';
        }

        if (hasCollegeGrades) {
            btnCollege.removeAttribute('disabled');
            btnCollege.classList.remove('disabled-button');
            btnCollege.title = '';
        } else {
            btnCollege.setAttribute('disabled', true);
            btnCollege.classList.add('disabled-button');
            btnCollege.title = 'Không có dữ liệu điểm Cao đẳng cho sinh viên này.';
        }
    }

    // --- Helper function for handling API errors (e.g., 401 Unauthorized) ---
    function handleApiError(error) {
        if (error.response && error.response.status === 401) {
            alert('Phiên đăng nhập của bạn đã hết hạn. Vui lòng đăng nhập lại nhé!');
            localStorage.removeItem('authToken'); // Xóa token cũ
            window.location.href = '/dangnhap'; // Chuyển hướng về trang đăng nhập
        } else {
            // Xử lý các lỗi khác
            console.error('Lỗi API:', error);
            // Có thể hiển thị thông báo lỗi chung
        }
    }

    // --- Fetch and display 9+ Grades ---
    const fetch9PlusGrades = async (semesterId) => {
        gradeTableBody.innerHTML = `<tr><td colspan="10" class="text-center py-8 text-gray-500">Đang tải điểm...</td></tr>`;
        noDataMessage.classList.add('hidden');
        additional9PlusInfo.classList.add('hidden'); // Hide additional info when loading

        try {
            const url = `${grade9PlusApiUrl}?semester_id=${semesterId}`;
            const response = await axios.get(url, {
                headers: { 'Authorization': `Token ${token}` }
            });

            const gradeData = response.data;
            console.log("Dữ liệu điểm 9+ API:", gradeData);

            if (gradeData.length > 0) {
                has9PlusGrades = true;
                currentStudentClassName = gradeData[0].student_class_name;
                const studentFullName = gradeData[0].student_full_name;
                const studentCode = gradeData[0].student_code;
                gradeTableTitle.textContent = `Bảng Điểm Học Tập của ${studentFullName} - Lớp: ${currentStudentClassName}`;
                
                // Fetch subjects for the current grade level
                const gradeLevel = getGradeLevelFromClassName(currentStudentClassName);
                let allSubjects = [];
                if (gradeLevel) {
                    const subjectResponse = await axios.get(`${subjectApiUrl}?grade_level=${gradeLevel}`, {
                        headers: { 'Content-Type': 'application/json' }
                    });
                    allSubjects = subjectResponse.data;
                    console.log(`Môn học khối ${gradeLevel}:`, allSubjects);
                } else {
                    console.warn("Không xác định được khối lớp từ tên lớp để tải danh sách môn học.");
                }
                display9PlusGrades(gradeData, allSubjects);
            } else {
                has9PlusGrades = false;
                currentStudentClassName = ''; // Reset if no data
                noDataMessage.classList.remove('hidden');
                noDataMessage.textContent = "Không có dữ liệu điểm 9+ cho kỳ học này.";
                gradeTableBody.innerHTML = '';
                gradeTableHeader.innerHTML = '';
                gradeTableTitle.textContent = "Bảng Điểm Học Tập";
            }

        } catch (error) {
            has9PlusGrades = false;
            console.error("Lỗi khi fetch điểm 9+ hoặc môn học:", error);
            noDataMessage.classList.remove('hidden');
            noDataMessage.textContent = `Lỗi khi tải dữ liệu 9+: ${error.response?.data?.detail || error.message}. Vui lòng thử lại.`;
            gradeTableBody.innerHTML = '';
            gradeTableHeader.innerHTML = '';
            gradeTableTitle.textContent = "Bảng Điểm Học Tập";
            handleApiError(error); // NEW: Xử lý lỗi API
        } finally {
            updateButtonStates(); // Luôn cập nhật trạng thái nút sau khi fetch
        }
    };

    const display9PlusGrades = (gradeData, allSubjects) => {
        gradeTableBody.innerHTML = '';
        noDataMessage.classList.add('hidden');

        const gradesBySubjectTitle = new Map();
        gradeData.forEach(item => {
            gradesBySubjectTitle.set(item.subject_title, item);
        });

        let maxOral = 0;
        let maxFifteenMin = 0;
        let maxOneLesson = 0;

        gradeData.forEach(item => {
            maxOral = Math.max(maxOral, (item.grades.ORAL || []).length);
            maxFifteenMin = Math.max(maxFifteenMin, (item.grades.FIFTEEN_MIN || []).length);
            maxOneLesson = Math.max(maxOneLesson, (item.grades.ONE_LESSON || []).length);
        });

        maxOral = Math.max(maxOral, 1); // Ensure at least one column
        maxFifteenMin = Math.max(maxFifteenMin, 1);
        maxOneLesson = Math.max(maxOneLesson, 1);

        // Create dynamic header
        let headerHtml = `
            <th scope="col" class="py-3 px-6 text-left text-xs font-medium text-white uppercase tracking-wider rounded-tl-xl">Môn Học</th>
        `;
        for (let i = 1; i <= maxOral; i++) {
            headerHtml += `<th scope="col" class="py-3 px-3 text-center text-xs font-medium text-white uppercase tracking-wider">Miệng</th>`;
        }
        for (let i = 1; i <= maxFifteenMin; i++) {
            headerHtml += `<th scope="col" class="py-3 px-3 text-center text-xs font-medium text-white uppercase tracking-wider">15 Phút</th>`;
        }
        for (let i = 1; i <= maxOneLesson; i++) {
            headerHtml += `<th scope="col" class="py-3 px-3 text-center text-xs font-medium text-white uppercase tracking-wider">1 Tiết</th>`;
        }
        headerHtml += `
            <th scope="col" class="py-3 px-3 text-center text-xs font-medium text-white uppercase tracking-wider">Giữa Kỳ</th>
            <th scope="col" class="py-3 px-3 text-center text-xs font-medium text-white uppercase tracking-wider rounded-tr-xl">Cuối Kỳ</th>
        `;
        gradeTableHeader.innerHTML = `<tr>${headerHtml}</tr>`;

        allSubjects.sort((a, b) => a.title.localeCompare(b.title));

        allSubjects.forEach(subject => {
            const item = gradesBySubjectTitle.get(subject.title);

            let rowHtml = `
                <tr class="transition-all duration-200 hover:bg-gray-50">
                    <td class="py-3 px-6 text-sm font-medium text-gray-900 whitespace-nowrap border-r border-gray-100">${subject.title}</td>
            `;

            // Oral Grades
            const oralGrades = item && item.grades.ORAL ? item.grades.ORAL : [];
            for (let i = 0; i < maxOral; i++) {
                const grade = oralGrades[i];
                rowHtml += `<td class="py-3 px-3 text-center text-sm text-gray-700 whitespace-nowrap border-r border-gray-100">${grade ? grade.score : ''}</td>`;
            }
            // 15-minute Grades
            const fifteenMinGrades = item && item.grades.FIFTEEN_MIN ? item.grades.FIFTEEN_MIN : [];
            for (let i = 0; i < maxFifteenMin; i++) {
                const grade = fifteenMinGrades[i];
                rowHtml += `<td class="py-3 px-3 text-center text-sm text-gray-700 whitespace-nowrap border-r border-gray-100">${grade ? grade.score : ''}</td>`;
            }
            // 1-Lesson Grades
            const oneLessonGrades = item && item.grades.ONE_LESSON ? item.grades.ONE_LESSON : [];
            for (let i = 0; i < maxOneLesson; i++) {
                const grade = oneLessonGrades[i];
                rowHtml += `<td class="py-3 px-3 text-center text-sm text-gray-700 whitespace-nowrap border-r border-gray-100">${grade ? grade.score : ''}</td>`;
            }

            // Midterm Score
            const midtermScore = item && item.grades.MIDTERM ? item.grades.MIDTERM.score : '';
            rowHtml += `<td class="py-3 px-3 text-center text-sm text-gray-700 whitespace-nowrap border-r border-gray-100">${midtermScore}</td>`;
            // Final Score
            const finalScore = item && item.grades.FINAL ? item.grades.FINAL.score : '';
            rowHtml += `<td class="py-3 px-3 text-center text-sm text-gray-700 whitespace-nowrap">${finalScore}</td>`;

            rowHtml += `</tr>`;
            gradeTableBody.insertAdjacentHTML('beforeend', rowHtml);
        });

        if (allSubjects.length === 0) {
            noDataMessage.classList.remove('hidden');
            noDataMessage.textContent = "Không có môn học nào được tìm thấy cho khối lớp này.";
        }
    };

    // --- Fetch and display College Grades ---
    const fetchCollegeGrades = async () => {
        collegeGradeTableBody.innerHTML = ''; // Clear previous data
        loadingMessageCollege.style.display = 'block';
        errorMessageCollege.style.display = 'none';
        collegeGradeTable.style.display = 'none'; // Hide table while loading
        studentInfoCollege.innerHTML = ''; // Clear student info
        
        try {
            const response = await axios.get(collegeGradeApiUrl, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Token ${token}`
                }
            });

            const data = response.data;
            console.log("Dữ liệu điểm Cao đẳng API:", data);

            // Kiểm tra xem có dữ liệu điểm cao đẳng không
            if (data && data.college_grades && data.college_grades.length > 0) {
                hasCollegeGrades = true;
                loadingMessageCollege.style.display = 'none';
                collegeGradeTable.style.display = 'table'; // Show table

                if (gradeTableTitle) {
                    gradeTableTitle.textContent = `Bảng Điểm Học Tập của ${data.full_name} - MSSV: ${data.student_code}`;
                }

                // Display student info
                if (studentInfoCollege) {
                    studentInfoCollege.innerHTML = `
                        <p><strong>Mã số sinh viên:</strong> ${data.student_code}</p>
                        <p><strong>Họ và tên:</strong> ${data.full_name}</p>
                        <p><strong>GPA:</strong> ${data.GPA}</p>
                        <p><strong>Xếp loại :</strong> ${data.academic_standing}</p>
                    `;
                }

                data.college_grades.forEach(grade => {
                    const row = collegeGradeTableBody.insertRow();
                    row.insertCell().textContent = grade.course.name;
                    row.insertCell().textContent = grade.process_score;
                    row.insertCell().textContent = grade.exam_score;
                    row.insertCell().textContent = grade.final_score_10;
                    row.insertCell().textContent = grade.final_score_4;

                    const isPassedCell = row.insertCell();
                    isPassedCell.innerHTML = grade.is_passed
                        ? '<i class="fa-solid fa-circle-check" style="color: #19a44e;"></i>'
                        : '<i class="fa-solid fa-circle-xmark" style="color: #ff3d3d;"></i>';
                    isPassedCell.classList.add('centered-icon'); // Apply class for centering

                    row.insertCell().textContent = getCollegeGradeType(grade.final_score_4);
                });
            } else {
                hasCollegeGrades = false;
                loadingMessageCollege.style.display = 'none';
                collegeGradeTable.style.display = 'none'; // Ensure table is hidden if no data
                errorMessageCollege.style.display = 'block';
                errorMessageCollege.textContent = 'Không có dữ liệu điểm Cao đẳng cho sinh viên này.';
            }

        } catch (error) {
            hasCollegeGrades = false;
            loadingMessageCollege.style.display = 'none';
            collegeGradeTable.style.display = 'none'; // Ensure table is hidden on error
            errorMessageCollege.style.display = 'block';
            errorMessageCollege.textContent = `Không thể tải dữ liệu điểm Cao đẳng: ${error.response?.data?.detail || error.message}`;
            console.error('Lỗi khi fetch dữ liệu Cao đẳng:', error);
            handleApiError(error); // NEW: Xử lý lỗi API
        } finally {
            updateButtonStates(); // Luôn cập nhật trạng thái nút sau khi fetch
            // Nếu không có dữ liệu cao đẳng và không có dữ liệu 9+, hiện thông báo chung
            if (!has9PlusGrades && !hasCollegeGrades) {
                noDataMessage.classList.remove('hidden');
                noDataMessage.textContent = "Không có dữ liệu điểm nào cho học sinh/sinh viên này.";
            } else if (has9PlusGrades && !hasCollegeGrades && currentActiveTab === 'college') {
                 // Nếu không có dữ liệu cao đẳng nhưng có 9+ và đang ở tab cao đẳng, chuyển về 9+
                show9PlusView();
            }
        }
    };

    // --- Tab Switching Logic ---
    const show9PlusView = async () => {
        if (!has9PlusGrades && !btn9Plus.disabled) { // Prevent re-fetching if no data and button is already disabled by previous logic
            // This case should ideally be handled by the initial load.
            // If the button is enabled but no grades, it means we need to fetch.
        }
        currentActiveTab = '9plus';
        btn9Plus.classList.replace('btn-secondary', 'btn-primary');
        btnCollege.classList.replace('btn-primary', 'btn-secondary');
        gradeTableTitle.textContent = "Bảng Điểm Học Tập (Học sinh 9+)";

        // Hide College elements
        collegeGradesSection.style.display = 'none';
        
        // Show 9+ elements
        ninePlusSemesterSection.style.display = 'block';
        ninePlusTableWrapper.style.display = 'block';
        additional9PlusInfo.classList.remove('hidden'); // Show 9+ info box again
        
        // Ensure semesters are loaded and then fetch grades for the first semester
        if (semesterSelect.options.length === 0) {
            await loadSemesters(); // Load semesters if not already loaded
        }
        
        // Fetch 9+ grades only if it has not been determined that there are no 9+ grades
        // or if the semester selection changes.
        // The check for `has9PlusGrades` determines if we should try to fetch again.
        if (has9PlusGrades || semesterSelect.value) { // Try to fetch if we think there might be data or a semester is selected
            fetch9PlusGrades(semesterSelect.value);
        } else {
            // If no semesters loaded after attempt, show no data message for 9+
            noDataMessage.classList.remove('hidden');
            noDataMessage.textContent = "Không có kỳ học nào để hiển thị điểm học sinh 9+.";
            gradeTableBody.innerHTML = '';
            gradeTableHeader.innerHTML = '';
            additional9PlusInfo.classList.add('hidden');
        }
        updateButtonStates(); // Ensure buttons are updated
    };

    const showCollegeView = () => {
        if (!hasCollegeGrades && !btnCollege.disabled) { // Similar to 9+ view, prevent unnecessary re-fetch
            // This case should ideally be handled by the initial load.
            // If the button is enabled but no grades, it means we need to fetch.
        }
        currentActiveTab = 'college';
        btnCollege.classList.replace('btn-secondary', 'btn-primary');
        btn9Plus.classList.replace('btn-primary', 'btn-secondary');
        gradeTableTitle.textContent = "Bảng Điểm Học Tập (Sinh viên Cao đẳng)";

        // Hide 9+ elements
        ninePlusSemesterSection.style.display = 'none';
        ninePlusTableWrapper.style.display = 'none';
        additional9PlusInfo.classList.add('hidden'); // Hide 9+ info
        noDataMessage.classList.add('hidden'); // Hide general no data message

        // Show College elements
        collegeGradesSection.style.display = 'block';
        fetchCollegeGrades();
    };

    // --- Event Listeners ---
    // Add check for disabled buttons to prevent clicking if no data
    btn9Plus.addEventListener('click', () => {
        if (!btn9Plus.disabled) {
            show9PlusView();
        }
    });
    btnCollege.addEventListener('click', () => {
        if (!btnCollege.disabled) {
            showCollegeView();
        }
    });

    semesterSelect.addEventListener('change', (event) => {
        const selectedSemesterId = event.target.value;
        console.log(`Đã chọn kỳ học với ID: ${selectedSemesterId}`);
        if (currentActiveTab === '9plus') { // Only fetch 9+ grades if this tab is active
            fetch9PlusGrades(selectedSemesterId);
        }
    });

    // --- Load Semesters (only for 9+ grades) ---
    const loadSemesters = async () => {
        try {
            const response = await axios.get(semesterApiUrl, {
                headers: { 'Authorization': `Token ${token}` }
            });
            const semesters = response.data;
            console.log("Dữ liệu kỳ học từ API:", semesters);

            if (semesters.length === 0) {
                semesterSelect.innerHTML = '<option value="">Không có kỳ học nào</option>';
                has9PlusGrades = false; // No semesters means no 9+ grades via semester
                updateButtonStates(); // Update button state immediately
                return;
            }

            semesters.sort((a, b) => {
                if (b.academic_year_name !== a.academic_year_name) {
                    return b.academic_year_name.localeCompare(a.academic_year_name);
                }
                if (a.semester_type === "HK2" && b.semester_type === "HK1") return -1;
                if (a.semester_type === "HK1" && b.semester_type === "HK2") return 1;
                return 0;
            });

            semesterSelect.innerHTML = semesters.map(sem =>
                `<option value="${sem.id}">${sem.name}</option>`
            ).join('');

            // After loading semesters, attempt to fetch 9+ grades for the first one
            // This is crucial for initial data check
            await fetch9PlusGrades(semesterSelect.value); // This will set has9PlusGrades
            
        } catch (error) {
            console.error("Lỗi khi tải danh sách kỳ học:", error);
            semesterSelect.innerHTML = '<option value="">Lỗi tải kỳ học</option>';
            has9PlusGrades = false; // Error loading semesters means no 9+ grades
            handleApiError(error); // NEW: Xử lý lỗi API
        } finally {
            updateButtonStates(); // Always update button states after trying to load semesters
        }
    };

    // --- Initial Load ---
    // Fetch College grades first to determine if current user is a College student
    // This allows us to potentially default to College view if 9+ data is absent
    await fetchCollegeGrades(); // This will set hasCollegeGrades and update buttons

    // Now, fetch 9+ grades to set has9PlusGrades and update buttons again
    // This is done after college grades because college grades might imply a different default view
    await loadSemesters(); // This will internally call fetch9PlusGrades for the first semester

    // Determine initial active tab based on data availability
    if (hasCollegeGrades && !has9PlusGrades) {
        // If only college grades are available, default to college view
        showCollegeView();
    } else {
        // Otherwise (has 9+ grades, or both, or neither), default to 9+ view
        // show9PlusView will handle no data message if no semesters/grades for 9+
        show9PlusView(); 
    }
});
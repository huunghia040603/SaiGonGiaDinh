document.addEventListener('DOMContentLoaded', () => {
    // Lấy token từ localStorage (đảm bảo bạn đã lưu token sau khi đăng nhập)
    function getAuthToken() {
        const token = localStorage.getItem('adminAuthToken');
        if (!token) {
            console.warn("Không tìm thấy token xác thực. Vui lòng đăng nhập.");
            // Chuyển hướng về trang đăng nhập nếu không có token
            // window.location.href = 'login.html';
        }
        return token;
} 
const token = getAuthToken();

    // --- Khai báo các phần tử HTML ---
    const scheduleTypeSelect = document.getElementById('scheduleType');
    const classSelectGroup = document.getElementById('classSelectGroup');
    const facultySelectGroup = document.getElementById('facultySelectGroup');

    const classSelect = document.getElementById('classSelect');
    const facultySelect = document.getElementById('facultySelect');
    const semesterSelect = document.getElementById('semesterSelect');
    const yearSelect = document.getElementById('yearSelect');
    const scheduleTableBody = document.getElementById('scheduleTableBody');

    const addScheduleBtn = document.getElementById('addScheduleBtn');
    const editScheduleBtn = document.getElementById('editScheduleBtn');
    const deleteScheduleBtn = document.getElementById('deleteScheduleBtn');
    const exportScheduleExcelBtn = document.getElementById('exportScheduleExcelBtn');

    const scheduleModal = document.getElementById('scheduleModal');
    const closeButton = scheduleModal.querySelector('.close-button');
    const cancelModalBtn = document.getElementById('cancelModalBtn');
    const scheduleForm = document.getElementById('scheduleForm');
    const modalTitle = document.getElementById('modalTitle');
    const scheduleIdInput = document.getElementById('scheduleId');

    const modalScheduleTypeSelect = document.getElementById('modalScheduleType');
    const modalClassSelectGroup = document.getElementById('modalClassSelectGroup');
    const modalFacultySelectGroup = document.getElementById('modalFacultySelectGroup');
    const modalClassSelect = document.getElementById('modalClassSelect');
    const modalFacultySelect = document.getElementById('modalFacultySelect');
    const modalSubjectSelect = document.getElementById('modalSubjectSelect'); // Môn THPT
    const modalCourseDHSelect = document.getElementById('modalCourseDHSelect'); // Môn ĐH/CĐ
    const allModalSubjectSelects = document.querySelectorAll('.subject-select'); // Dùng để ẩn/hiện tất cả môn học

    const modalRoomSelect = document.getElementById('modalRoomSelect'); // Đã đổi sang select trong HTML
    const modalDayOfWeekSelect = document.getElementById('modalDayOfWeek');
    const modalLessonNumberSelect = document.getElementById('modalLessonNumber');
    const modalSemesterSelect = document.getElementById('modalSemesterSelect');
    const modalYearSelect = document.getElementById('modalYearSelect');
    const modalSessionTypeSelect = document.getElementById('modalSessionTypeSelect');

    let currentSelectedScheduleEntryId = null; // Để lưu ID của mục đang được chọn để sửa/xóa
    let allTimeSlots = []; // Lưu trữ tất cả các TimeSlot đã fetch để sử dụng trong bảng
    let allSubjectsTHPT = []; // Để lưu trữ môn THPT
    let allCoursesDH = []; // Để lưu trữ môn ĐH
    let allClassesTHPT = []; // Để lưu trữ lớp THPT
    let allClassesDaiHoc = []; // Để lưu trữ lớp ĐH

    // --- Hàm chung để fetch dữ liệu từ API và điền vào select ---
    async function fetchData(url, selectElement, valueField, textField, defaultOptionText = '-- Chọn --') {
        // Clear previous options, but keep the default one for modal if it's already there
        if (selectElement.options.length === 0 || selectElement.options[0].value !== "") {
            selectElement.innerHTML = `<option value="">${defaultOptionText}</option>`;
        }
        
        try {
            const headers = token ? { 'Authorization': `Token ${token}` } : {};
            const response = await fetch(url, { headers: headers });
            if (!response.ok) {
                // If it's a 401, token might be expired or invalid
                if (response.status === 401) {
                    alert('Phiên làm việc đã hết hạn hoặc bạn không có quyền truy cập. Vui lòng đăng nhập lại.');
                    window.location.href = '/sggd/qtv/admin/'; // Chuyển hướng về trang đăng nhập
                    return []; // Trả về mảng rỗng để không tiếp tục xử lý
                }
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            data.forEach(item => {
                const option = document.createElement('option');
                option.value = item[valueField];
                option.textContent = item[textField];
                selectElement.appendChild(option);
            });
            return data; // Trả về dữ liệu để lưu trữ nếu cần
        } catch (error) {
            console.error(`Lỗi khi tải dữ liệu từ ${url}:`, error);
            const option = document.createElement('option');
            option.value = "";
            option.textContent = `Không thể tải dữ liệu.`;
            option.disabled = true;
            selectElement.appendChild(option);
            return []; // Trả về mảng rỗng
        }
    }

    // --- Hàm tải dữ liệu cho các dropdown bộ lọc và modal ---
    async function loadAllDropdowns() {
        // Tải các dropdown chung
        await fetchData('https://saigongiadinh.pythonanywhere.com/semesters/', semesterSelect, 'id', 'name', '-- Chọn học kỳ --');
        await fetchData('https://saigongiadinh.pythonanywhere.com/semesters/', modalSemesterSelect, 'id', 'name', 'Chọn học kỳ');
        await fetchData('https://saigongiadinh.pythonanywhere.com/location/', modalRoomSelect, 'id', 'name', 'Chọn phòng học');

        populateYearSelect(yearSelect, '-- Chọn năm học --');
        populateYearSelect(modalYearSelect, 'Chọn năm học');

        // Tải TimeSlots và lưu trữ chúng
        allTimeSlots = await fetchData('https://saigongiadinh.pythonanywhere.com/time-slots/', modalLessonNumberSelect, 'id', 'name', 'Chọn tiết');

        // Tải danh sách Giảng viên
        await fetchData('https://saigongiadinh.pythonanywhere.com/faculty-list/', facultySelect, 'id', 'full_name', '-- Chọn giảng viên --');
        await fetchData('https://saigongiadinh.pythonanywhere.com/faculty-list/', modalFacultySelect, 'id', 'full_name', 'Chọn giảng viên');

        // Tải danh sách Môn học (THPT & ĐH) và Lớp (THPT & ĐH)
        allSubjectsTHPT = await fetchData('https://saigongiadinh.pythonanywhere.com/subjects/', modalSubjectSelect, 'id', 'title', 'Chọn môn học (THPT)');
        allCoursesDH = await fetchData('https://saigongiadinh.pythonanywhere.com/course-DH/', modalCourseDHSelect, 'id', 'name', 'Chọn môn học (ĐH/CĐ)');
        
        allClassesTHPT = await fetchData('https://saigongiadinh.pythonanywhere.com/classesId/', classSelect, 'id', 'class_id', '-- Chọn lớp --');
        
        allClassesTHPT = await fetchData('https://saigongiadinh.pythonanywhere.com/classesId/', modalClassSelect, 'id', 'class_id', 'Chọn lớp (THPT)');
        allClassesDaiHoc = await fetchData('https://saigongiadinh.pythonanywhere.com/classCollege/', modalClassSelect, 'id', 'class_name', 'Chọn lớp (ĐH/CĐ)'); // Đã sửa tên biến

        populateSessionTypeSelect(modalSessionTypeSelect); // Hàm này đã có sẵn trong mã của bạn
    }

    function populateYearSelect(selectElement, defaultText) {
        const currentYear = new Date().getFullYear();
        selectElement.innerHTML = `<option value="">${defaultText}</option>`;
        for (let i = currentYear - 5; i <= currentYear + 5; i++) {
            const option = document.createElement('option');
            option.value = i;
            option.textContent = i;
            selectElement.appendChild(option);
        }
    }

    function populateSessionTypeSelect(selectElement) {
        selectElement.innerHTML = `<option value="">Chọn buổi</option>`;
        const sessionTypes = [
            { value: 'MORNING', text: 'Buổi sáng' },
            { value: 'AFTERNOON', text: 'Buổi chiều' }
        ];
        sessionTypes.forEach(type => {
            const option = document.createElement('option');
            option.value = type.value;
            option.textContent = type.text;
            selectElement.appendChild(option);
        });
    }

    // --- Cập nhật trạng thái hiển thị của các dropdown bộ lọc chính ---
    scheduleTypeSelect.addEventListener('change', () => {
        const selectedType = scheduleTypeSelect.value;
        if (selectedType === 'class') {
            classSelectGroup.style.display = 'flex';
            facultySelectGroup.style.display = 'none';
            facultySelect.value = ""; // Reset faculty selection
            // Ví dụ: populateClassFilter(classSelect, allClassesTHPT.concat(allClassesDaiHoc));
        } else if (selectedType === 'faculty') {
            facultySelectGroup.style.display = 'flex';
            classSelectGroup.style.display = 'none';
            classSelect.value = ""; // Reset class selection
            // fetchData('https://saigongiadinh.pythonanywhere.com/faculty-list/', facultySelect, 'id', 'full_name', '-- Chọn giảng viên --');
        } else {
            classSelectGroup.style.display = 'none';
            facultySelectGroup.style.display = 'none';
            classSelect.value = "";
            facultySelect.value = "";
        }
        fetchAndRenderSchedule(); // Fetch lại TKB sau khi thay đổi loại
    });

    // --- Cập nhật trạng thái hiển thị của các dropdown trong modal ---
    modalScheduleTypeSelect.addEventListener('change', () => {
        const selectedType = modalScheduleTypeSelect.value;
        // Ẩn tất cả các select liên quan đến lớp và môn học trước
        modalClassSelectGroup.style.display = 'none';
        modalFacultySelectGroup.style.display = 'none';
        allModalSubjectSelects.forEach(select => select.style.display = 'none'); // Ẩn tất cả các select môn học

        // Reset giá trị để tránh gửi sai Foreign Key
        modalClassSelect.value = "";
        modalFacultySelect.value = "";
        modalSubjectSelect.value = ""; // Môn THPT
        modalCourseDHSelect.value = ""; // Môn ĐH/CĐ

        if (selectedType === 'class') {
            modalClassSelectGroup.style.display = 'flex';
            
            // modalSubjectSelect.style.display = 'block'; // Môn THPT
            // modalCourseDHSelect.style.display = 'block'; // Môn ĐH/CĐ
            
        } else if (selectedType === 'faculty') {
            modalFacultySelectGroup.style.display = 'flex';
            // Khi chọn theo giảng viên, cả 2 loại môn đều có thể được chọn
            modalSubjectSelect.style.display = 'block'; // Môn THPT
            modalCourseDHSelect.style.display = 'block'; // Môn ĐH/CĐ
        }
    });

    // Logic ẩn/hiện môn học trong modal khi chọn lớp
    modalClassSelect.addEventListener('change', () => {
        const selectedClassId = modalClassSelect.value;
        allModalSubjectSelects.forEach(select => select.style.display = 'none'); // Ẩn tất cả môn học
        modalSubjectSelect.value = "";
        modalCourseDHSelect.value = "";

        if (selectedClassId) {
            const isTHPTClass = allClassesTHPT.some(cls => String(cls.id) === selectedClassId);
            const isDaiHocClass = allClassesDaiHoc.some(cls => String(cls.id) === selectedClassId);

            if (isTHPTClass) {
                modalSubjectSelect.style.display = 'block';
            } else if (isDaiHocClass) {
                modalCourseDHSelect.style.display = 'block';
            }
        }
    });

    // Kích hoạt lần đầu để thiết lập trạng thái ban đầu của modal
    modalScheduleTypeSelect.dispatchEvent(new Event('change'));

    // --- Hàm tải và hiển thị thời khóa biểu ---
    async function fetchAndRenderSchedule() {
        const scheduleType = scheduleTypeSelect.value;
        const classId = classSelect.value;
        const facultyId = facultySelect.value;
        const semesterId = semesterSelect.value;
        const year = yearSelect.value;

        // Vô hiệu hóa các nút thao tác và xuất excel
        editScheduleBtn.disabled = true;
        deleteScheduleBtn.disabled = true;
        exportScheduleExcelBtn.disabled = true;
        currentSelectedScheduleEntryId = null; // Reset mục đã chọn

        // Hiển thị thông báo đang tải
        scheduleTableBody.innerHTML = `
            <tr>
                <td class="time-slot">...</td>
                <td colspan="7" class="table-note">Đang tải dữ liệu...</td>
            </tr>
        `;

        if (!scheduleType || !semesterId || !year || (scheduleType === 'class' && !classId) || (scheduleType === 'faculty' && !facultyId)) {
            const colSpan = 8; 
            scheduleTableBody.innerHTML = `
                <tr>
                    <td class="time-slot">...</td>
                    <td colspan="${colSpan - 1}" class="table-note">Vui lòng chọn đầy đủ thông tin để xem thời khóa biểu.</td>
                </tr>
            `;
            return;
        }

        let apiUrl = `https://saigongiadinh.pythonanywhere.com/api/admin/schedule-entries/?semester=${semesterId}&year=${year}`;
        
        if (scheduleType === 'class' && classId) {
            // Cần xác định loại lớp để gửi đúng param. Giả định API của bạn có thể handle class_id chung.
            // Nếu không, bạn cần thêm logic kiểm tra classId là THPT hay ĐH trước khi thêm vào URL
            const isTHPTClassSelected = allClassesTHPT.some(cls => String(cls.id) === classId);
            const isDaiHocClassSelected = allClassesDaiHoc.some(cls => String(cls.id) === classId);

            if (isTHPTClassSelected) {
                apiUrl += `&class_thpt=${classId}`;
            } else if (isDaiHocClassSelected) {
                apiUrl += `&class_daihoc=${classId}`;
            } else {
                // Should not happen if dropdowns are populated correctly
                console.warn('Selected class ID does not match any known THPT or DaiHoc class.');
                scheduleTableBody.innerHTML = `
                    <tr>
                        <td class="time-slot">...</td>
                        <td colspan="7" class="table-note">Lớp được chọn không hợp lệ.</td>
                    </tr>
                `;
                return;
            }
        } else if (scheduleType === 'faculty' && facultyId) {
            apiUrl += `&faculty=${facultyId}`;
        }
        
        try {
            const headers = token ? { 'Authorization': `Token ${token}` } : {};
            const response = await fetch(apiUrl, { headers: headers });
            if (!response.ok) {
                    if (response.status === 401) {
                        alert('Phiên làm việc đã hết hạn hoặc bạn không có quyền truy cập. Vui lòng đăng nhập lại.');
                        window.location.href = '/sggd/qtv/admin/';
                        return;
                    }
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const scheduleData = await response.json();
            
            renderScheduleTable(scheduleData);
            
            // Kích hoạt nút xuất Excel nếu có dữ liệu
            if (scheduleData.length > 0) {
                exportScheduleExcelBtn.disabled = false;
            }

        } catch (error) {
            console.error('Lỗi khi tải thời khóa biểu:', error);
            const colSpan = 8;
            scheduleTableBody.innerHTML = `
                <tr>
                    <td class="time-slot">...</td>
                    <td colspan="${colSpan - 1}" class="table-note" style="color: red;">Không thể tải thời khóa biểu. Vui lòng thử lại sau.</td>
                </tr>
            `;
        }
    }

    function renderScheduleTable(data) {
        scheduleTableBody.innerHTML = ''; // Xóa nội dung cũ

        // Sắp xếp allTimeSlots theo 'order' của TimeSlot model
        const sortedTimeSlots = [...allTimeSlots].sort((a, b) => a.order - b.order);

        if (sortedTimeSlots.length === 0) {
            const colSpan = 8;
            scheduleTableBody.innerHTML = `<tr><td colspan="${colSpan}" class="table-note">Không có dữ liệu tiết học để tạo bảng. Vui lòng thêm các tiết học.</td></tr>`;
            return;
        }

        const days = {
            'MON': { col: 2, display: 'Thứ 2' }, 
            'TUE': { col: 3, display: 'Thứ 3' },
            'WED': { col: 4, display: 'Thứ 4' },
            'THU': { col: 5, display: 'Thứ 5' },
            'FRI': { col: 6, display: 'Thứ 6' },
            'SAT': { col: 7, display: 'Thứ 7' },
            'SUN': { col: 8, display: 'Chủ Nhật' },
        };
        const dayOrder = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];

        // Khởi tạo một đối tượng để dễ dàng điền dữ liệu vào các ô bảng
        const scheduleMap = {}; // { 'day_of_week-time_slot_id': [entry1, entry2...] }

        data.forEach(entry => {
            const key = `${entry.day_of_week}-${entry.time_slot}`; // time_slot ở đây là ID của TimeSlot
            if (!scheduleMap[key]) {
                scheduleMap[key] = [];
            }
            scheduleMap[key].push(entry);
        });

        sortedTimeSlots.forEach(timeSlot => { 
            const row = document.createElement('tr');
            const timeSlotCell = document.createElement('td');
            timeSlotCell.className = 'time-slot';
            timeSlotCell.textContent = timeSlot.name; 
            row.appendChild(timeSlotCell);

            dayOrder.forEach(dayCode => {
                const cell = document.createElement('td');
                cell.className = 'schedule-cell';
                cell.dataset.day = dayCode; // Lưu dayCode thay vì col number
                cell.dataset.lessonId = timeSlot.id; // Dùng ID để định vị ô

                const entriesInCell = scheduleMap[`${dayCode}-${timeSlot.id}`]; // Vẫn dùng ID của TimeSlot để match dữ liệu

                if (entriesInCell && entriesInCell.length > 0) {
                    cell.classList.add('has-data');
                    entriesInCell.forEach(entry => {
                        const div = document.createElement('div');
                        div.className = 'schedule-info';
                        div.dataset.scheduleEntryId = entry.id; // Lưu ID của ScheduleEntry để sửa/xóa
                        div.dataset.dayCode = dayCode;
                        div.dataset.timeSlotId = timeSlot.id; // Lưu ID của TimeSlot
                        div.dataset.semesterId = entry.semester;
                        // Lưu thêm các data-set khác để dễ dàng lấy thông tin khi sửa
                        div.dataset.classThptId = entry.class_thpt || '';
                        div.dataset.classDaihocId = entry.class_daihoc || '';
                        div.dataset.facultyId = entry.faculty || '';
                        div.dataset.subjectThptId = entry.subject_thpt || '';
                        div.dataset.courseDhId = entry.course_dh || '';
                        div.dataset.locationId = entry.location || '';
                        div.dataset.sessionType = entry.session_type || '';
                        
                        let content = '';
                        // Môn học
                        if (entry.subject_thpt_info) {
                            content += `<strong>${entry.subject_thpt_info.title}</strong>`;
                        } else if (entry.course_dh_info) {
                            content += `<strong>${entry.course_dh_info.name}</strong>`;
                        }

                        // Lớp học
                        if (entry.class_thpt_info) {
                            content += `<br>${entry.class_thpt_info.class_id}`;
                        } else if (entry.class_daihoc_info) {
                            content += `<br>${entry.class_daihoc_info.class_name}`;
                        }
                        
                        // Giảng viên
                        if (entry.faculty_info) {
                            content += `<br>GV: ${entry.faculty_info.full_name}`;
                        }
                        
                        // Phòng học
                        if (entry.location_info) {
                            content += `<br>Phòng: ${entry.location_info.name}`;
                        }
                        
                        div.innerHTML = content;
                        cell.appendChild(div);

                        // Thêm lắng nghe sự kiện click để chọn mục chỉnh sửa/xóa
                        div.addEventListener('click', (e) => {
                            e.stopPropagation(); // Ngăn sự kiện click lan ra cell hoặc row
                            // Bỏ chọn tất cả các mục khác
                            document.querySelectorAll('.schedule-info.selected').forEach(el => el.classList.remove('selected'));
                            // Chọn mục hiện tại
                            div.classList.add('selected');
                            currentSelectedScheduleEntryId = entry.id;
                            editScheduleBtn.disabled = false;
                            deleteScheduleBtn.disabled = false;
                        });
                    });
                }
                row.appendChild(cell);
            });
            scheduleTableBody.appendChild(row);
        });

        // Nếu không có dữ liệu nào khớp với bộ lọc nhưng có các tiết học để tạo bảng
        if (data.length === 0 && sortedTimeSlots.length > 0) { 
            const colSpan = 8;
            scheduleTableBody.innerHTML += `
                <tr>
                    <td class="time-slot"></td> <td colspan="${colSpan - 1}" class="table-note">Không có thời khóa biểu cho các tiêu chí đã chọn.</td>
                </tr>
            `;
        }
    }

    // --- Chức năng Modal ---
    async function openModal(isEditMode = false, entryData = {}) {
        scheduleModal.style.display = 'flex';
        scheduleForm.reset();
        scheduleIdInput.value = '';
        
        modalTitle.textContent = isEditMode ? 'Sửa Lịch Học/Dạy' : 'Thêm Lịch Học/Dạy';

        // Lấy thông tin từ bộ lọc chính để làm mặc định cho modal
        const currentScheduleType = scheduleTypeSelect.value;
        const currentSemester = semesterSelect.value;
        const currentYear = yearSelect.value;

        // Đặt giá trị mặc định cho modal dựa trên bộ lọc hoặc dữ liệu sửa
        // Sử dụng await để đảm bảo các select đã được populate trước khi set value
        await new Promise(resolve => setTimeout(resolve, 50)); // Tạm dừng nhỏ để đảm bảo DOM đã cập nhật
        modalScheduleTypeSelect.value = entryData.scheduleType || currentScheduleType || '';
        modalSemesterSelect.value = entryData.semester || currentSemester || '';
        modalYearSelect.value = entryData.year || currentYear || '';

        // Kích hoạt sự kiện change để ẩn/hiện các nhóm select trong modal
        // và reset các select môn học/lớp ban đầu
        modalScheduleTypeSelect.dispatchEvent(new Event('change')); 
        modalClassSelect.dispatchEvent(new Event('change')); // Để đảm bảo môn học được hiển thị đúng

        // Điền dữ liệu vào form nếu là chế độ sửa
        if (isEditMode && entryData) {
            scheduleIdInput.value = entryData.id;
            
            // Set giá trị cho lớp/giảng viên trong modal
            if (entryData.class_thpt) {
                modalScheduleTypeSelect.value = 'class';
                modalClassSelectGroup.style.display = 'flex';
                modalFacultySelectGroup.style.display = 'none';
                modalClassSelect.value = entryData.class_thpt;
                modalFacultySelect.value = ""; 
                // Kích hoạt change event cho modalClassSelect để hiển thị môn THPT
                modalClassSelect.dispatchEvent(new Event('change'));
            } else if (entryData.class_daihoc) {
                modalScheduleTypeSelect.value = 'class';
                modalClassSelectGroup.style.display = 'flex';
                modalFacultySelectGroup.style.display = 'none';
                modalClassSelect.value = entryData.class_daihoc;
                modalFacultySelect.value = "";
                // Kích hoạt change event cho modalClassSelect để hiển thị môn ĐH
                modalClassSelect.dispatchEvent(new Event('change'));
            } else if (entryData.faculty) {
                modalScheduleTypeSelect.value = 'faculty';
                modalFacultySelectGroup.style.display = 'flex';
                modalClassSelectGroup.style.display = 'none';
                modalFacultySelect.value = entryData.faculty;
                modalClassSelect.value = "";
                // Khi là giảng viên, cả 2 loại môn đều hiển thị
                modalSubjectSelect.style.display = 'block'; 
                modalCourseDHSelect.style.display = 'block';
            }
            // Kích hoạt lại event change cho modalScheduleTypeSelect sau khi set value
            // để đảm bảo các nhóm select hiện đúng
            modalScheduleTypeSelect.dispatchEvent(new Event('change'));


            // Xử lý môn học: set giá trị cho đúng select
            if (entryData.subject_thpt) {
                modalSubjectSelect.value = entryData.subject_thpt;
            } else if (entryData.course_dh) {
                modalCourseDHSelect.value = entryData.course_dh;
            }
            
            modalRoomSelect.value = entryData.location || ''; 
            modalDayOfWeekSelect.value = entryData.day_of_week || '';
            modalLessonNumberSelect.value = entryData.time_slot || '';
            modalSessionTypeSelect.value = entryData.session_type || ''; 
        }
    }

    function closeModal() {
        scheduleModal.style.display = 'none';
        scheduleForm.reset();
        currentSelectedScheduleEntryId = null;
        editScheduleBtn.disabled = true;
        deleteScheduleBtn.disabled = true;
        // Xóa lựa chọn màu nền xanh của lịch đã chọn
        document.querySelectorAll('.schedule-info.selected').forEach(el => el.classList.remove('selected'));
        // Đặt lại trạng thái ban đầu của modal dropdowns
        modalScheduleTypeSelect.dispatchEvent(new Event('change'));
    }

    // --- Xử lý sự kiện mở/đóng Modal ---
    addScheduleBtn.addEventListener('click', () => openModal(false));
    closeButton.addEventListener('click', closeModal);
    cancelModalBtn.addEventListener('click', closeModal);
    window.addEventListener('click', (event) => {
        if (event.target === scheduleModal) {
            closeModal();
        }
    });

    // --- Xử lý sự kiện Sửa Lịch ---
    editScheduleBtn.addEventListener('click', async () => {
        if (currentSelectedScheduleEntryId) {
            try {
                const headers = token ? { 'Authorization': `Token ${token}` } : {};
                const response = await fetch(`https://saigonginh.pythonanywhere.com/api/admin/schedule-entries/${currentSelectedScheduleEntryId}/`, { headers: headers });
                if (!response.ok) {
                    if (response.status === 401) {
                        alert('Phiên làm việc đã hết hạn hoặc bạn không có quyền truy cập. Vui lòng đăng nhập lại.');
                        window.location.href = '/sggd/qtv/admin/';
                        return;
                    }
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const entryData = await response.json();
                
                // Chuẩn bị dữ liệu để truyền vào openModal
                const mappedData = {
                    id: entryData.id,
                    semester: entryData.semester,
                    day_of_week: entryData.day_of_week,
                    time_slot: entryData.time_slot,
                    subject_thpt: entryData.subject_thpt,
                    course_dh: entryData.course_dh,
                    faculty: entryData.faculty,
                    location: entryData.location,
                    class_thpt: entryData.class_thpt,
                    class_daihoc: entryData.class_daihoc,
                    session_type: entryData.session_type,
                    // Giả sử semester_info.year có sẵn trong read serializer
                    year: entryData.semester_info ? entryData.semester_info.year : '' 
                };
                await openModal(true, mappedData); // Sử dụng await
            } catch (error) {
                console.error('Lỗi khi tải dữ liệu lịch để sửa:', error);
                alert('Không thể tải dữ liệu lịch để sửa. Vui lòng kiểm tra console.');
            }
        } else {
            alert('Vui lòng chọn một mục thời khóa biểu để sửa.');
        }
    });

    // --- Xử lý sự kiện Xóa Lịch ---
    deleteScheduleBtn.addEventListener('click', async () => {
        if (currentSelectedScheduleEntryId && confirm('Bạn có chắc chắn muốn xóa mục thời khóa biểu này?')) {
            try {
                const headers = token ? { 'Authorization': `Token ${token}` } : {};
                const response = await fetch(`https://saigongiadinh.pythonanywhere.com/api/admin/schedule-entries/${currentSelectedScheduleEntryId}/`, {
                    method: 'DELETE',
                    headers: headers
                });
                if (!response.ok) {
                    if (response.status === 401) {
                        alert('Phiên làm việc đã hết hạn hoặc bạn không có quyền truy cập. Vui lòng đăng nhập lại.');
                        window.location.href = '/sggd/qtv/admin/';
                        return;
                    }
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                alert('Xóa lịch thành công!');
                closeModal();
                fetchAndRenderSchedule(); // Tải lại bảng sau khi xóa
            } catch (error) {
                console.error('Lỗi khi xóa lịch:', error);
                alert('Xóa lịch thất bại. Vui lòng thử lại.');
            }
        }
    });

    // --- Xử lý Submit Form Thêm/Sửa Lịch ---
    scheduleForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const id = scheduleIdInput.value;
        const method = id ? 'PUT' : 'POST';
        const url = id ? `https://saigongiadinh.pythonanywhere.com/api/admin/schedule-entries/${id}/` : 'https://saigongiadinh.pythonanywhere.com/api/admin/schedule-entries/';

        const payload = {
            semester: modalSemesterSelect.value,
            day_of_week: modalDayOfWeekSelect.value,
            time_slot: modalLessonNumberSelect.value,
            faculty: modalFacultySelect.value || null, // Đảm bảo gửi null nếu không chọn
            location: modalRoomSelect.value || null, // Đảm bảo gửi null nếu không chọn
            session_type: modalSessionTypeSelect.value || null 
        };

        // Logic để đảm bảo chỉ một trong hai trường môn học/lớp được gửi đi
        const selectedScheduleType = modalScheduleTypeSelect.value;
        let selectedClassId = modalClassSelect.value;
        let selectedSubjectThptId = modalSubjectSelect.value; // ID của môn THPT
        let selectedCourseDhId = modalCourseDHSelect.value; // ID của môn ĐH/CĐ

        if (selectedScheduleType === 'class') {
            if (!selectedClassId) {
                alert('Vui lòng chọn một lớp.');
                return;
            }

            // Kiểm tra xem lớp là THPT hay Đại học
            const isTHPTClass = allClassesTHPT.some(cls => String(cls.id) === selectedClassId);
            const isDaiHocClass = allClassesDaiHoc.some(cls => String(cls.id) === selectedClassId);
            
            if (isTHPTClass) {
                payload.class_thpt = selectedClassId;
                payload.class_daihoc = null;
                // Kiểm tra môn học THPT
                if (!selectedSubjectThptId) {
                    alert('Vui lòng chọn một môn học THPT hợp lệ cho lớp THPT.');
                    return;
                }
                payload.subject_thpt = selectedSubjectThptId;
                payload.course_dh = null;
            } else if (isDaiHocClass) {
                payload.class_daihoc = selectedClassId;
                payload.class_thpt = null;
                // Kiểm tra môn học ĐH
                if (!selectedCourseDhId) {
                    alert('Vui lòng chọn một môn học Đại học/Cao đẳng hợp lệ cho lớp Đại học/Cao đẳng.');
                    return;
                }
                payload.course_dh = selectedCourseDhId;
                payload.subject_thpt = null;
            } else {
                alert('Lớp được chọn không hợp lệ (không phải THPT hoặc ĐH/CĐ).');
                return;
            }
            payload.faculty = null; // Nếu là theo lớp, giảng viên là null
        } else if (selectedScheduleType === 'faculty') {
            if (!modalFacultySelect.value) {
                alert('Vui lòng chọn một giảng viên.');
                return;
            }
            payload.faculty = modalFacultySelect.value;
            payload.class_thpt = null;
            payload.class_daihoc = null;
            
            // Xử lý môn học cho giảng viên (cho phép cả 2, nhưng ưu tiên nếu chỉ 1 cái được chọn)
            if (selectedSubjectThptId && !selectedCourseDhId) { // Chỉ chọn môn THPT
                payload.subject_thpt = selectedSubjectThptId;
                payload.course_dh = null;
            } else if (selectedCourseDhId && !selectedSubjectThptId) { // Chỉ chọn môn ĐH
                payload.course_dh = selectedCourseDhId;
                payload.subject_thpt = null;
            } else if (selectedSubjectThptId && selectedCourseDhId) {
                alert('Vui lòng chỉ chọn một môn học (THPT hoặc Đại học/Cao đẳng) cho giảng viên.');
                return;
            } else {
                 alert('Vui lòng chọn một môn học (THPT hoặc Đại học/Cao đẳng) cho giảng viên.');
                return;
            }
        } else {
            alert('Vui lòng chọn loại thời khóa biểu (Theo Lớp hoặc Theo Giảng viên).');
            return;
        }

        // Đảm bảo không có ID rỗng được gửi đi (chuyển về null nếu rỗng)
        for (const key in payload) {
            if (payload[key] === "") {
                payload[key] = null;
            }
        }

        try {
            const headers = {
                'Content-Type': 'application/json',
            };
            if (token) {
                headers['Authorization'] = `Token ${token}`;
            }

            const response = await fetch(url, {
                method: method,
                headers: headers,
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                const errorData = await response.json();
                let errorMessage = 'Lưu lịch thất bại. ';
                if (response.status === 400 && errorData) { // Bad Request, có thể có lỗi validation
                     for (const key in errorData) {
                        errorMessage += `Trường ${key}: ${Array.isArray(errorData[key]) ? errorData[key].join(', ') : errorData[key]} `;
                    }
                } else if (response.status === 401) {
                    alert('Phiên làm việc đã hết hạn hoặc bạn không có quyền truy cập. Vui lòng đăng nhập lại.');
                    window.location.href = '/sggd/qtv/admin/';
                    return;
                } else {
                    errorMessage += `Lỗi HTTP: ${response.status} ${response.statusText}`;
                }
                throw new Error(errorMessage);
            }

            alert(`Lịch học/dạy đã được ${id ? 'cập nhật' : 'thêm'} thành công!`);
            closeModal();
            fetchAndRenderSchedule(); // Tải lại bảng sau khi lưu
        } catch (error) {
            console.error('Lỗi khi lưu lịch:', error);
            alert(`Lưu lịch thất bại: ${error.message}`);
        }
    });


    // --- Xử lý sự kiện Xuất Excel ---
    exportScheduleExcelBtn.addEventListener('click', () => {
        // Kiểm tra xem XLSX đã được tải chưa
        if (typeof XLSX === 'undefined') {
            alert('Thư viện Excel không khả dụng. Vui lòng kiểm tra lại kết nối mạng hoặc file thư viện.');
            console.error('XLSX library not loaded.');
            return;
        }

        const table = document.getElementById('scheduleTable'); // Đảm bảo bạn có id="scheduleTable" trên thẻ <table>
        if (!table) {
            alert('Không tìm thấy bảng thời khóa biểu để xuất.');
            return;
        }

        // Lấy thông tin cho tên file
        const scheduleTypeDisplay = scheduleTypeSelect.options[scheduleTypeSelect.selectedIndex].text;
        let entityName = '';
        if (scheduleTypeSelect.value === 'class' && classSelect.selectedIndex > 0) {
            entityName = classSelect.options[classSelect.selectedIndex].text;
        } else if (scheduleTypeSelect.value === 'faculty' && facultySelect.selectedIndex > 0) {
            entityName = facultySelect.options[facultySelect.selectedIndex].text;
        }
        const semesterName = semesterSelect.options[semesterSelect.selectedIndex].text;
        const yearValue = yearSelect.value;

        // Tạo một bản sao của bảng để thao tác (tránh ảnh hưởng đến giao diện gốc)
        const tableClone = table.cloneNode(true);
        
        // Xóa các event listener và các class/data-attribute không cần thiết
        tableClone.querySelectorAll('.schedule-cell').forEach(cell => {
            if (cell.classList.contains('has-data')) {
                let cellText = '';
                // Lấy nội dung text từ các div.schedule-info
                cell.querySelectorAll('.schedule-info').forEach(infoDiv => {
                    cellText += infoDiv.textContent.trim().replace(/\s+/g, ' ').replace(/\n/g, '; ') + ' | ';
                });
                cell.textContent = cellText.trim().replace(/ \|$/, ''); // Đặt nội dung đã xử lý vào ô, loại bỏ dấu '|' cuối cùng
                cell.classList.remove('has-data');
            }
            // Loại bỏ các data-attribute khỏi các cell để bảng sạch hơn
            for (let i = cell.attributes.length - 1; i >= 0; i--) {
                const attr = cell.attributes[i];
                if (attr.name.startsWith('data-')) {
                    cell.removeAttributeNode(attr);
                }
            }
        });
        
        // Xóa dòng "Không có thời khóa biểu..." nếu có
        tableClone.querySelectorAll('.table-note').forEach(row => row.remove());


        const ws = XLSX.utils.table_to_sheet(tableClone, { raw: false }); 
        
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Thời Khóa Biểu");

        const fileName = `TKB_${scheduleTypeDisplay.replace(/\s/g, '_')}_${entityName.replace(/\s/g, '_')}_${semesterName.replace(/\s/g, '_')}_${yearValue}.xlsx`;
        XLSX.writeFile(wb, fileName);
    });


    // --- Lắng nghe sự kiện thay đổi của các bộ lọc để tải TKB ---
    classSelect.addEventListener('change', fetchAndRenderSchedule);
    facultySelect.addEventListener('change', fetchAndRenderSchedule);
    semesterSelect.addEventListener('change', fetchAndRenderSchedule);
    yearSelect.addEventListener('change', fetchAndRenderSchedule);

    // --- Khởi tạo khi trang tải ---
    loadAllDropdowns().then(() => {
        // Chỉ gọi fetchAndRenderSchedule() sau khi tất cả dropdown đã tải xong
        // để đảm bảo có đủ dữ liệu cho các filter ban đầu
        fetchAndRenderSchedule(); 
    });
});
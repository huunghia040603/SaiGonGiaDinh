document.addEventListener('DOMContentLoaded', () => {
    const timetableBody = document.querySelector('#facultyTimetable tbody');
    const timetableHead = document.querySelector('#facultyTimetable thead');
    const semesterSelect = document.getElementById('semesterSelect');
    const weekSelect = document.getElementById('weekSelect'); // Lấy tham chiếu đến dropdown tuần

    const prevWeekBtn = document.getElementById('prevWeekBtn');
    const nextWeekBtn = document.getElementById('nextWeekBtn'); // Đã sửa lỗi gán lại document
    const weekInfoSpan = document.getElementById('weekInfo'); // Đổi tên từ weekInfo thành weekInfoSpan

    // currentDisplayDate sẽ lưu trữ ngày BẮT ĐẦU của tuần hiện tại (luôn là Thứ Hai)
    let currentDisplayDate = new Date();
    let selectedSemesterDetails = null;

    const semesterApiUrl = 'https://saigongiadinh.pythonanywhere.com/semesters/';
    const baseUrl = 'http://saigongiadinh.pythonanywhere.com/faculty-schedule/';
    const timeSlotsApiUrl = 'https://saigongiadinh.pythonanywhere.com/time-slots/'; // API mới cho tiết học

    // Khai báo biến để lưu trữ dữ liệu tiết học từ API
    let fetchedTimeSlots = []; // Sửa đổi: Mảng này sẽ lưu dữ liệu từ API /Time/
    let organizedTimeSlots = []; // Biến mới để lưu trữ cấu trúc tiết học đã được tổ chức theo buổi

    // Hàm xử lý phiên hết hạn, đảm bảo chuyển hướng
    function handleSessionExpiration() {
        // Xóa tất cả các thông tin liên quan đến phiên đăng nhập khỏi localStorage
        localStorage.removeItem('authToken');
        localStorage.removeItem('userId');
        localStorage.removeItem('userEmail');
        localStorage.removeItem('userRole');
        localStorage.removeItem('userFullName');
        localStorage.removeItem('teacherAuthToken'); // Xóa cả teacherAuthToken

        alert('Phiên đăng nhập của bạn đã hết hạn hoặc bạn không có quyền truy cập. Vui lòng đăng nhập lại.');
        // Bắt buộc chuyển hướng ngay lập tức sau alert
        window.location.href = '/dangnhap';
        // Thêm return để đảm bảo không có code nào khác chạy sau khi đã ra lệnh chuyển hướng
        return;
    }

    function getAuthToken() {
        const teacherToken = localStorage.getItem('teacherAuthToken');
        if (teacherToken) {
            console.log('DEBUG (JS): Đang sử dụng teacherAuthToken.');
            return teacherToken;
        }
        console.log('DEBUG (JS): Không tìm thấy teacherAuthToken, đang sử dụng authToken thông thường.');
        return localStorage.getItem('authToken');
    }

    const token = getAuthToken();

    // ************* THÊM ĐIỀU KIỆN KIỂM TRA NGAY TẠI ĐÂY *************
    // Nếu không có teacherAuthToken (hoặc token nói chung), xử lý phiên hết hạn ngay
    if (!token) {
        handleSessionExpiration();
        return; // Dừng việc thực thi các script khác nếu không có token
    }
    // ***************************************************************

    const dayOrder = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
    const dayDisplayNames = {
        'MON': 'Thứ 2', 'TUE': 'Thứ 3', 'WED': 'Thứ 4', 'THU': 'Thứ 5',
        'FRI': 'Thứ 6', 'SAT': 'Thứ 7'
    };

    // Sửa đổi: Hàm mới để lấy dữ liệu tiết học từ API và tổ chức lại
    async function fetchTimeSlots() {
        try {
            const response = await fetch(timeSlotsApiUrl, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Token ${token}`
                }
            });
            if (!response.ok) {
                if (response.status === 401 || response.status === 403) {
                    handleSessionExpiration(); // Gọi hàm xử lý phiên hết hạn
                    return; // Quan trọng: dừng hàm và không trả về gì
                } else {
                    const errorText = await response.text();
                    throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
                }
            }
            const data = await response.json();
            console.log('Dữ liệu API (Time):', data);

            // Sắp xếp dữ liệu theo trường 'order'
            data.sort((a, b) => a.order - b.order);
            fetchedTimeSlots = data; // Lưu trữ mảng phẳng

            // Tổ chức dữ liệu tiết học vào cấu trúc buổi (Sáng, Chiều, Tối)
            const sessionsMap = new Map(); // Dùng Map để duy trì thứ tự và dễ truy cập
            
            // Xác định các buổi dựa trên thuộc tính 'session_type_display' hoặc logic thời gian
            fetchedTimeSlots.forEach(slot => {
                const sessionType = slot.session_type_display || (slot.start_time < '12:00:00' ? 'Sáng' : (slot.start_time < '17:00:00' ? 'Chiều' : 'Tối'));
                if (!sessionsMap.has(sessionType)) {
                    sessionsMap.set(sessionType, {
                        session: sessionType.toUpperCase(), // hoặc theo API nếu có
                        label: sessionType,
                        slots: []
                    });
                }
                sessionsMap.get(sessionType).slots.push(slot);
            });

            // Chuyển Map thành mảng để dễ dàng duyệt
            organizedTimeSlots = Array.from(sessionsMap.values());
            console.log('organizedTimeSlots:', organizedTimeSlots);

        } catch (error) {
            console.error('Lỗi khi lấy dữ liệu tiết học:', error);
            alert('Không thể tải thông tin tiết học. Vui lòng thử lại sau.');
            // Cung cấp một cấu trúc mặc định rỗng nếu API lỗi
            organizedTimeSlots = [];
        }
    }


    // Hàm lấy các ngày trong tuần (Thứ Hai đến Thứ Bảy) dựa trên một ngày bất kỳ trong tuần đó
    function getWeekDays(inputDate) {
        const days = [];
        let currentDay = new Date(inputDate);
        const dayOfWeek = currentDay.getDay(); // 0 for Sunday, 1 for Monday, ..., 6 for Saturday
        // Điều chỉnh để lùi về Thứ Hai của tuần hiện tại
        currentDay.setDate(currentDay.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));

        for (let i = 0; i < 6; i++) { // Lặp 6 lần cho 6 ngày (Thứ 2 đến Thứ 7)
            const d = new Date(currentDay);
            const apiDayIndex = d.getDay();
            let apiDayName;
            switch(apiDayIndex) {
                case 1: apiDayName = 'MON'; break;
                case 2: apiDayName = 'TUE'; break;
                case 3: apiDayName = 'WED'; break;
                case 4: apiDayName = 'THU'; break;
                case 5: apiDayName = 'FRI'; break;
                case 6: apiDayName = 'SAT'; break;
                default: apiDayName = '';
            }
            days.push({
                name: dayDisplayNames[apiDayName],
                apiName: apiDayName,
                date: d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' })
            });
            currentDay.setDate(currentDay.getDate() + 1);
        }
        return days;
    }

    // Hàm cập nhật thông tin hiển thị tuần (ví dụ: Tuần 1 (Từ 07/07/2025 đến 12/07/2025))
    function updateWeekInfo(currentDate) {
        const startOfWeek = new Date(currentDate); // currentDate ở đây là Thứ Hai của tuần
        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(endOfWeek.getDate() + 5); // Thứ Bảy

        // Tìm tuần hiện tại trong dropdown để lấy số tuần
        let weekNumber = 0;
        const currentWeekStartDateString = startOfWeek.toISOString().split('T')[0];
        Array.from(weekSelect.options).forEach((option, index) => {
            if (option.value === currentWeekStartDateString) {
                // Parse "Tuần X (Từ ...)" để lấy X
                const match = option.textContent.match(/Tuần (\d+)/);
                if (match) {
                    weekNumber = parseInt(match[1]);
                }
            }
        });

        const startFormatted = startOfWeek.toLocaleDateString('vi-VN', {day: '2-digit', month: '2-digit', year: 'numeric'});
        const endFormatted = endOfWeek.toLocaleDateString('vi-VN', {day: '2-digit', month: '2-digit', year: 'numeric'});

    }

    function createTableHeaders(weekDays) {
        let headerHtml = '<tr><th class="session-column-header">BUỔI</th><th class="time-column-header">TIẾT</th>';
        weekDays.forEach(day => {
            headerHtml += `<th class="day-header">${day.name}<br>${day.date}</th>`;
        });
        headerHtml += '</tr>';
        timetableHead.innerHTML = headerHtml;
    }

    // Hàm fetchScheduleData không cần thay đổi vì nó lấy tất cả lịch của học kỳ
    async function fetchScheduleData(semesterId) {
        if (!semesterId || semesterId === "") {
            console.warn("Chưa chọn học kỳ hoặc học kỳ không hợp lệ. Không thể tải thời khóa biểu.");
            return [];
        }
        const url = `${baseUrl}?semester_id=${semesterId}`;
        try {
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Token ${token}`
                }
            });
            if (!response.ok) {
                // Sửa lỗi 401 ở đây:
                if (response.status === 401 || response.status === 403) {
                    handleSessionExpiration(); // Gọi hàm xử lý phiên hết hạn
                    return []; // Quan trọng: trả về mảng rỗng và dừng hàm
                } else {
                    const errorText = await response.text();
                    throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
                }
            }
            const data = await response.json();
            console.log('Dữ liệu API (FacultyScheduleView):', data);
            return data;
        } catch (error) {
            console.error('Lỗi khi lấy dữ liệu thời khóa biểu:', error);
            alert('Không thể tải thời khóa biểu. Vui lòng thử lại sau.');
            return [];
        }
    }

    // Hàm tính toán và điền các tuần trong một học kỳ vào dropdown
    function populateWeeksDropdown(semesterStartDate, semesterEndDate) {
        weekSelect.innerHTML = '<option value="">Chọn tuần</option>'; // Xóa các option cũ

        let currentWeekStart = new Date(semesterStartDate);
        // Đảm bảo currentWeekStart là ngày Thứ Hai của tuần đầu tiên trong học kỳ
        const dayOfWeek = currentWeekStart.getDay(); // 0 for Sunday, 1 for Monday, ..., 6 for Saturday
        const diff = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // Số ngày lùi lại để về thứ Hai
        currentWeekStart.setDate(currentWeekStart.getDate() - diff);

        let weekCounter = 1;

        while (currentWeekStart <= semesterEndDate) {
            const weekEnd = new Date(currentWeekStart);
            weekEnd.setDate(currentWeekStart.getDate() + 5); // Cuối tuần (Thứ 7)

            // Đảm bảo tuần không vượt quá học kỳ
            const actualWeekEnd = new Date(Math.min(weekEnd.getTime(), semesterEndDate.getTime()));

            const option = document.createElement('option');
            const startFormatted = currentWeekStart.toLocaleDateString('vi-VN', {day: '2-digit', month: '2-digit', year: 'numeric'});
            const endFormatted = actualWeekEnd.toLocaleDateString('vi-VN', {day: '2-digit', month: '2-digit', year: 'numeric'});
            // Value của option sẽ là ngày bắt đầu của tuần (Thứ Hai) để dễ dàng thao tác sau này
            option.value = currentWeekStart.toISOString().split('T')[0]; // FormatYYYY-MM-DD
            option.textContent = `Tuần ${weekCounter} (Từ ${startFormatted} đến ${endFormatted})`;
            weekSelect.appendChild(option);

            // Chuyển sang tuần tiếp theo
            currentWeekStart.setDate(currentWeekStart.getDate() + 7);
            weekCounter++;
        }

        // Chọn tuần hiện tại nếu nó nằm trong học kỳ đã chọn
        const today = new Date();
        const todayWeekStart = new Date(today);
        const dayOfWeekToday = todayWeekStart.getDay();
        const diffToday = dayOfWeekToday === 0 ? 6 : dayOfWeekToday - 1;
        todayWeekStart.setDate(todayWeekStart.getDate() - diffToday);

        const foundWeekOption = Array.from(weekSelect.options).find(opt => {
            if (opt.value) {
                const optDate = new Date(opt.value);
                // So sánh ngày (bỏ qua thời gian)
                return optDate.toDateString() === todayWeekStart.toDateString();
            }
            return false;
        });

        if (foundWeekOption) {
            weekSelect.value = foundWeekOption.value;
            currentDisplayDate = new Date(foundWeekOption.value);
        } else if (weekSelect.options.length > 1) { // Chọn tuần đầu tiên của học kỳ nếu tuần hiện tại không thuộc
            weekSelect.value = weekSelect.options[1].value;
            currentDisplayDate = new Date(weekSelect.options[1].value);
        } else {
            currentDisplayDate = new Date(); // Fallback nếu không có tuần nào
        }

        displaySchedule();
    }

    // Hàm hiển thị thời khóa biểu
    async function displaySchedule() {
        const selectedSemesterId = semesterSelect.value;
        const scheduleData = await fetchScheduleData(selectedSemesterId); // Fetch tất cả lịch của học kỳ

        timetableBody.innerHTML = ''; // Xóa nội dung cũ

        // Lấy các ngày trong tuần đang hiển thị dựa trên currentDisplayDate
        const weekDays = getWeekDays(currentDisplayDate);
        createTableHeaders(weekDays);
        updateWeekInfo(currentDisplayDate); // Cập nhật thông tin tuần hiển thị

        // Chuẩn bị cấu trúc dữ liệu để dễ dàng điền vào bảng
        const organizedSchedule = {};
        dayOrder.forEach(day => {
            organizedSchedule[day] = {};
            // Sửa đổi: Sử dụng organizedTimeSlots để khởi tạo cấu trúc
            organizedTimeSlots.forEach(sessionBlock => {
                sessionBlock.slots.forEach(slot => {
                    organizedSchedule[day][slot.id] = null;
                });
            });
        });

        // Điền dữ liệu thời khóa biểu vào cấu trúc đã tổ chức
        scheduleData.forEach(entry => {
            const day = entry.day_of_week;
            const timeSlotId = entry.time_slot;
            // session_type đã có trong dữ liệu schedule, không cần lấy từ time_slot nếu API đã cung cấp

            if (dayOrder.includes(day)) {
                // Kiểm tra xem đã có lịch ở ô đó chưa, nếu có thì ghi đè (hoặc xử lý theo ý muốn)
                // Hiện tại code của bạn đang ghi đè nếu có nhiều mục cho cùng một ô, giữ nguyên logic này
                if (organizedSchedule[day] && typeof organizedSchedule[day][timeSlotId] !== 'undefined') {
                     organizedSchedule[day][timeSlotId] = entry;
                } else {
                    console.warn(`Cảnh báo: Không tìm thấy ô thời gian ${timeSlotId} cho ngày ${day} trong cấu trúc tiết học đã tổ chức. Lịch này có thể không hiển thị.`);
                }
            }
        });

        // DUYỆT QUA ORGANIZED_TIME_SLOTS (thay vì fixedTimeSlots) để tạo bảng đầy đủ và hiển thị dữ liệu
       organizedTimeSlots.forEach(sessionBlock => {
            const sessionName = sessionBlock.session; // Ví dụ: "MORNING"
            const sessionLabel = sessionBlock.label; // Ví dụ: "Sáng"
            const slotsInThisSession = sessionBlock.slots;

            slotsInThisSession.forEach((timeSlot, index) => {
                const row = document.createElement('tr');

                // THÊM ĐOẠN MÃ NÀY VÀO ĐÂY
                // Kiểm tra nếu đây là buổi 'Sáng' và là tiết cuối cùng của buổi 'Sáng'
                if (sessionLabel === 'Sáng') {
    // Tìm index của tiết cuối cùng trong buổi Sáng KHÔNG PHẢI "Ra chơi"
    let lastMorningLessonIndex = -1;
    for (let i = slotsInThisSession.length - 1; i >= 0; i--) {
        if (!slotsInThisSession[i].name.includes('Ra chơi')) {
            lastMorningLessonIndex = i;
            break;
        }
    }

    // Nếu đây là tiết cuối cùng của buổi sáng và không phải là "Ra chơi", thì thêm đường kẻ
    if (index === lastMorningLessonIndex) {
        row.classList.add('afternoon-start-row');
    }
}
                // KẾT THÚC ĐOẠN MÃ THÊM

                if (index === 0) {
                    const sessionHeaderCell = document.createElement('td');
                    sessionHeaderCell.classList.add('session-label-body');
                    sessionHeaderCell.rowSpan = slotsInThisSession.length;
                    sessionHeaderCell.textContent = sessionLabel;
                    row.appendChild(sessionHeaderCell);
                }

                const timeSlotLabelCell = document.createElement('td');
                timeSlotLabelCell.classList.add('time-slot-label');
                // Sửa đổi: Sử dụng timeSlot.name từ API và định dạng thời gian
                timeSlotLabelCell.innerHTML = `${timeSlot.name}<br>(${timeSlot.start_time.substring(0, 5)} - ${timeSlot.end_time.substring(0, 5)})`;
                if (timeSlot.name.includes('Ra chơi')) {
                    timeSlotLabelCell.classList.add('ra-choi');
                }
                row.appendChild(timeSlotLabelCell);

                weekDays.forEach(day => {
                    const cell = document.createElement('td');
                    cell.classList.add('schedule-cell');
                    cell.classList.add('empty-cell');

                    const entry = organizedSchedule[day.apiName] ? organizedSchedule[day.apiName][timeSlot.id] : null;

                    // Kiểm tra nếu có lịch phù hợp
                    if (entry) { // Không cần kiểm tra entry.session_type === sessionName nữa vì organizedSchedule đã lọc theo timeSlot.id
                        cell.classList.remove('empty-cell');
                        const entryDiv = document.createElement('div');
                        entryDiv.classList.add('schedule-entry');

                        let subjectTitle = entry.subject_thpt_info ? entry.subject_thpt_info.title : 'Không xác định';

                        const shortenSubjectName = (name) => {
                            if (name.includes('Giáo dục công dân')) return 'GDCD';
                            if (name.includes('Giáo dục địa phương')) return 'GDDP';
                            if (name.includes('Giáo dục thể chất')) return 'TD';
                            if (name.includes('Nghệ thuật')) return 'NT';
                            if (name.includes('Toán')) return 'Toán';
                            if (name.includes('Giáo dục quốc phòng và an ninh')) return 'GDQP';
                            if (name.includes('Lịch sử')) return 'Sử';
                            if (name.includes('Hóa học')) return 'Hóa';
                            if (name.includes('Ngoại ngữ 1')) return 'Anh';
                            if (name.includes('Sinh học')) return 'Sinh';
                            if (name.includes('Vật lý')) return 'Lý';
                            if (name.includes('Hoạt động trải nghiệm, hướng nghiệp')) return 'HDTN';
                            return name;
                        };
                        subjectTitle = shortenSubjectName(subjectTitle);

                        const classId = entry.class_thpt_info && entry.class_thpt_info.class_id ? entry.class_thpt_info.class_id.toUpperCase() : 'N/A';
                        const locationName = entry.location_info ? entry.location_info.name : 'N/A';
                        const addressName = entry.location_info ? entry.location_info.address : 'N/A'; // Lỗi chính tả, nên là location_info.address nếu có

                        entryDiv.innerHTML = `
                            <strong>${classId} - ${subjectTitle}</strong>
                            <span>${locationName} - CS: ${addressName}</span>
                        `;
                        cell.appendChild(entryDiv);
                    }
                    row.appendChild(cell);
                });
                timetableBody.appendChild(row);
            });
        });
    }

    // --- EVENT LISTENERS CẬP NHẬT ---

    semesterSelect.addEventListener('change', (event) => {
        const selectedOption = event.target.options[event.target.selectedIndex];
        if (selectedOption && selectedOption.dataset.startDate && selectedOption.dataset.endDate) {
            selectedSemesterDetails = {
                startDate: new Date(selectedOption.dataset.startDate),
                endDate: new Date(selectedOption.dataset.endDate)
            };
            populateWeeksDropdown(selectedSemesterDetails.startDate, selectedSemesterDetails.endDate);
        } else {
            weekSelect.innerHTML = '<option value="">Không có tuần</option>';
            selectedSemesterDetails = null;
            displaySchedule();
        }
    });

    weekSelect.addEventListener('change', (event) => {
        if (event.target.value) {
            currentDisplayDate = new Date(event.target.value);
            displaySchedule();
        } else {
            console.log("Chọn tuần mặc định.");
        }
    });


    prevWeekBtn.addEventListener('click', () => {
        if (selectedSemesterDetails) {
            const newDate = new Date(currentDisplayDate);
            newDate.setDate(newDate.getDate() - 7);

            // Đảm bảo không lùi quá ngày bắt đầu học kỳ
            const firstMondayOfSemester = new Date(selectedSemesterDetails.startDate);
            const dayOfWeek = firstMondayOfSemester.getDay();
            const diff = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // Lùi về thứ Hai
            firstMondayOfSemester.setDate(firstMondayOfSemester.getDate() - diff);

            if (newDate >= firstMondayOfSemester) {
                currentDisplayDate = newDate;
                const weekStartDateString = currentDisplayDate.toISOString().split('T')[0];
                if (weekSelect.value !== weekStartDateString) {
                    weekSelect.value = weekStartDateString;
                }
                displaySchedule();
            } else {
                alert('Đây là tuần đầu tiên của học kỳ!');
            }
        } else {
            alert('Vui lòng chọn học kỳ trước.');
        }
    });

    nextWeekBtn.addEventListener('click', () => {
        if (selectedSemesterDetails) {
            const newDate = new Date(currentDisplayDate);
            newDate.setDate(newDate.getDate() + 7);

            // Đảm bảo không tiến quá ngày kết thúc học kỳ (Thứ Bảy của tuần cuối cùng)
            const lastSaturdayOfSemester = new Date(selectedSemesterDetails.endDate);
            const dayOfWeek = lastSaturdayOfSemester.getDay();
            // Điều chỉnh lastSaturdayOfSemester để nó là Thứ Bảy cuối cùng của tuần chứa endDate
            const diff = dayOfWeek === 6 ? 0 : 6 - dayOfWeek;
            lastSaturdayOfSemester.setDate(lastSaturdayOfSemester.getDate() + diff);

            // So sánh với ngày bắt đầu của tuần mới, không phải ngày kết thúc
            // newDate là ngày Thứ Hai của tuần tiếp theo
            if (newDate <= lastSaturdayOfSemester) {
                currentDisplayDate = newDate;
                const weekStartDateString = currentDisplayDate.toISOString().split('T')[0];
                if (weekSelect.value !== weekStartDateString) {
                    weekSelect.value = weekStartDateString;
                }
                displaySchedule();
            } else {
                alert('Đây là tuần cuối cùng của học kỳ!');
            }
        } else {
            alert('Vui lòng chọn học kỳ trước.');
        }
    });

    // Sửa đổi: Bọc phần tải dữ liệu học kỳ và hiển thị lịch vào một hàm async/await
    async function initializeSchedule() {
        // Bước 1: Fetch dữ liệu tiết học trước
        await fetchTimeSlots(); 
        
        // Bước 2: Sau khi có dữ liệu tiết học, tiến hành tải học kỳ và hiển thị lịch
        fetch(semesterApiUrl, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Token ${token}`
            }
        })
            .then(response => {
                if (!response.ok) {
                    if (response.status === 401 || response.status === 403) {
                        handleSessionExpiration();
                        throw new Error("Session expired or unauthorized."); // Ném lỗi để dừng chuỗi promise
                    }
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                data.sort((a, b) => b.id - a.id);

                data.forEach(semester => {
                    const option = document.createElement('option');
                    option.value = semester.id;
                    option.textContent = `${semester.semester_type_display} - Năm học ${semester.academic_year_name}`;
                    option.dataset.startDate = semester.start_date;
                    option.dataset.endDate = semester.end_date;
                    semesterSelect.appendChild(option);
                });

                if (semesterSelect.options.length > 0) {
                    const today = new Date();
                    let foundCurrentSemester = false;
                    for (let i = 0; i < semesterSelect.options.length; i++) {
                        const option = semesterSelect.options[i];
                        if (option.dataset.startDate && option.dataset.endDate) {
                            const sDate = new Date(option.dataset.startDate);
                            const eDate = new Date(option.dataset.endDate);
                            if (today >= sDate && today <= eDate) {
                                semesterSelect.value = option.value;
                                selectedSemesterDetails = {
                                    startDate: sDate,
                                    endDate: eDate
                                };
                                populateWeeksDropdown(selectedSemesterDetails.startDate, selectedSemesterDetails.endDate);
                                foundCurrentSemester = true;
                                break;
                            }
                        }
                    }

                    if (!foundCurrentSemester) {
                        semesterSelect.value = semesterSelect.options[0].value;
                        const firstOption = semesterSelect.options[0];
                        selectedSemesterDetails = {
                            startDate: new Date(firstOption.dataset.startDate),
                            endDate: new Date(firstOption.dataset.endDate)
                        };
                        populateWeeksDropdown(selectedSemesterDetails.startDate, selectedSemesterDetails.endDate);
                    }
                } else {
                    console.warn("Không có học kỳ nào được tải.");
                    // Nếu không có học kỳ, vẫn cố gắng hiển thị lịch (có thể là rỗng)
                    displaySchedule(); 
                }
            })
            .catch(error => {
                console.error('Lỗi khi tải dữ liệu học kỳ:', error);
                const defaultOption = document.createElement('option');
                defaultOption.value = "";
                defaultOption.textContent = "Không thể tải dữ liệu học kỳ";
                semesterSelect.appendChild(defaultOption);
                displaySchedule();
            });
    }

    // Sửa đổi: Gọi hàm khởi tạo chính
    initializeSchedule();
});
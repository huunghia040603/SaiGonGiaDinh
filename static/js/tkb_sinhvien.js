
document.addEventListener('DOMContentLoaded', async () => {
    const timetableBody = document.querySelector('#facultyTimetable tbody');
    const timetableHead = document.querySelector('#facultyTimetable thead');
    const semesterSelect = document.getElementById('semesterSelect');
    const weekSelect = document.getElementById('weekSelect');

    const prevWeekBtn = document.getElementById('prevWeekBtn');
    const nextWeekBtn = document.getElementById('nextWeekBtn');
    const weekInfoSpan = document.getElementById('weekInfo');
    const errorMessageElement = document.getElementById('errorMessage'); // Lấy phần tử hiển thị lỗi

    let currentDisplayDate = new Date();
    let selectedSemesterDetails = null;

    const semesterApiUrl = 'https://saigongiadinh.pythonanywhere.com/semesters/';
    const studentScheduleApiUrl = 'https://saigongiadinh.pythonanywhere.com/student-schedule/';
    const timeSlotsApiUrl = 'https://saigongiadinh.pythonanywhere.com/time-slots/';

    let processedTimeSlots = [];

    function getAuthToken() {
        return localStorage.getItem('authToken');
    }
    const token = getAuthToken();
    console.log('Authorization token:', token);

    const dayOrder = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
    const dayDisplayNames = {
        'MON': 'Thứ 2', 'TUE': 'Thứ 3', 'WED': 'Thứ 4', 'THU': 'Thứ 5',
        'FRI': 'Thứ 6', 'SAT': 'Thứ 7'
    };

    // --- HÀM MỚI: FETCH VÀ XỬ LÝ TIME SLOTS TỪ API ---
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
                    clearLocalStorageAndRedirect();
                    return [];
                } else {
                    const errorText = await response.text();
                    throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
                }
            }
            const data = await response.json();
            console.log('Dữ liệu Time Slots từ API:', data);
            return processTimeSlotsData(data);
        } catch (error) {
            console.error('Lỗi khi lấy dữ liệu time slots:', error);
            errorMessageElement.textContent = `Không thể tải cấu hình tiết học: ${error.message}. Vui lòng thử lại sau.`;
            return [];
        }
    }

    function processTimeSlotsData(apiData) {
        const morningSlots = [];
        const afternoonSlots = [];

        apiData.sort((a, b) => a.order - b.order);

        apiData.forEach(slot => {
            const timeSlot = {
                id: slot.id,
                order: slot.order,
                start_time: slot.start_time,
                end_time: slot.end_time,
                name: slot.name
            };

            if (slot.name && slot.name.toLowerCase().includes('ra chơi')) {
                timeSlot.isBreakTime = true;
                timeSlot.breakLabel = slot.name;
            }

            if (timeSlot.order <= 6) {
                morningSlots.push(timeSlot);
            } else {
                afternoonSlots.push(timeSlot);
            }
        });

        return [
            { session: 'MORNING', label: 'Sáng', slots: morningSlots },
            { session: 'AFTERNOON', label: 'Chiều', slots: afternoonSlots }
        ];
    }
    // --- KẾT THÚC HÀM MỚI ---

    function getWeekDays(inputDate) {
        const days = [];
        let currentDay = new Date(inputDate);
        const dayOfWeek = currentDay.getDay();
        currentDay.setDate(currentDay.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));

        for (let i = 0; i < 6; i++) {
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

    // ĐỊNH NGHĨA HÀM createTableHeaders TẠI ĐÂY
    function createTableHeaders(weekDays) {
        timetableHead.innerHTML = ''; // Xóa các header cũ

        const headerRow = document.createElement('tr');
        const emptyCell1 = document.createElement('th');
        emptyCell1.classList.add('header-cell', 'empty-header-cell');
        headerRow.appendChild(emptyCell1); // Ô trống cho cột "Sáng/Chiều"

        const emptyCell2 = document.createElement('th');
        emptyCell2.classList.add('header-cell', 'empty-header-cell');
        headerRow.appendChild(emptyCell2); // Ô trống cho cột "Tiết"

        weekDays.forEach(day => {
            const th = document.createElement('th');
            th.classList.add('header-cell', 'day-header');
            th.innerHTML = `${day.name}<br>${day.date}`;
            headerRow.appendChild(th);
        });
        timetableHead.appendChild(headerRow);
    }
    // KẾT THÚC ĐỊNH NGHĨA HÀM createTableHeaders

    function updateWeekInfo(currentDate) {
        const startOfWeek = new Date(currentDate);
        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(endOfWeek.getDate() + 5);

        let weekNumber = 0;
        const currentWeekStartDateString = startOfWeek.toISOString().split('T')[0];
        Array.from(weekSelect.options).forEach((option, index) => {
            if (option.value === currentWeekStartDateString) {
                const match = option.textContent.match(/Tuần (\d+)/);
                if (match) {
                    weekNumber = parseInt(match[1]);
                }
            }
        });

        
    }

    async function fetchScheduleData(semesterId) {
        if (!semesterId || semesterId === "") {
            console.warn("Chưa chọn học kỳ hoặc học kỳ không hợp lệ. Không thể tải thời khóa biểu.");
            return [];
        }
        const url = `${studentScheduleApiUrl}?semester_id=${semesterId}`;
        try {
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Token ${token}`
                }
            });
            if (!response.ok) {
                if (response.status === 401 || response.status === 403) {
                    clearLocalStorageAndRedirect();
                    return [];
                } else {
                    const errorText = await response.text();
                    throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
                }
            }
            const data = await response.json();
            console.log('Dữ liệu API (StudentScheduleView):', data);
            return data;
        } catch (error) {
            console.error('Lỗi khi lấy dữ liệu thời khóa biểu:', error);
            errorMessageElement.textContent = `Không thể tải thời khóa biểu: ${error.message}. Vui lòng thử lại sau.`;
            return [];
        }
    }

    function populateWeeksDropdown(semesterStartDate, semesterEndDate) {
        weekSelect.innerHTML = '<option value="">Chọn tuần</option>';

        let currentWeekStart = new Date(semesterStartDate);
        const dayOfWeek = currentWeekStart.getDay();
        const diff = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
        currentWeekStart.setDate(currentWeekStart.getDate() - diff);

        let weekCounter = 1;

        while (currentWeekStart <= semesterEndDate) {
            const weekEnd = new Date(currentWeekStart);
            weekEnd.setDate(currentWeekStart.getDate() + 5);

            const actualWeekEnd = new Date(Math.min(weekEnd.getTime(), semesterEndDate.getTime()));

            const option = document.createElement('option');
            const startFormatted = currentWeekStart.toLocaleDateString('vi-VN', {day: '2-digit', month: '2-digit', year: 'numeric'});
            const endFormatted = actualWeekEnd.toLocaleDateString('vi-VN', {day: '2-digit', month: '2-digit', year: 'numeric'});
            option.value = currentWeekStart.toISOString().split('T')[0];
            option.textContent = `Tuần ${weekCounter} (Từ ${startFormatted} đến ${endFormatted})`;
            weekSelect.appendChild(option);

            currentWeekStart.setDate(currentWeekStart.getDate() + 7);
            weekCounter++;
        }

        const today = new Date();
        today.setHours(0, 0, 0, 0); // Đặt giờ về 00:00:00 để so sánh chỉ theo ngày

        const todayWeekStart = new Date(today);
        const dayOfWeekToday = todayWeekStart.getDay();
        const diffToday = dayOfWeekToday === 0 ? 6 : dayOfWeekToday - 1;
        todayWeekStart.setDate(todayWeekStart.getDate() - diffToday);

        const foundWeekOption = Array.from(weekSelect.options).find(opt => {
            if (opt.value) {
                const optDate = new Date(opt.value);
                optDate.setHours(0,0,0,0); // Đảm bảo so sánh chỉ theo ngày
                return optDate.toDateString() === todayWeekStart.toDateString();
            }
            return false;
        });

        if (foundWeekOption) {
            weekSelect.value = foundWeekOption.value;
            currentDisplayDate = new Date(foundWeekOption.value);
        } else if (weekSelect.options.length > 1) { // Nếu không tìm thấy tuần hiện tại, chọn tuần đầu tiên có thể (option[0] là "Chọn tuần")
            weekSelect.value = weekSelect.options[1].value;
            currentDisplayDate = new Date(weekSelect.options[1].value);
        } else {
            currentDisplayDate = new Date(); // Nếu không có tuần nào, đặt lại ngày hiện tại
        }

        displaySchedule();
    }

    async function displaySchedule() {
        const selectedSemesterId = semesterSelect.value;
        const scheduleData = await fetchScheduleData(selectedSemesterId);

        timetableBody.innerHTML = ''; // Xóa nội dung cũ
        errorMessageElement.textContent = ''; // Xóa thông báo lỗi cũ

        const weekDays = getWeekDays(currentDisplayDate);
        createTableHeaders(weekDays); // Đảm bảo hàm này đã được định nghĩa
        updateWeekInfo(currentDisplayDate);

        const organizedSchedule = {};
        dayOrder.forEach(day => {
            organizedSchedule[day] = {};
            processedTimeSlots.forEach(sessionBlock => {
                sessionBlock.slots.forEach(slot => {
                    organizedSchedule[day][slot.id] = null;
                });
            });
        });

     // Đoạn mã bạn đã cung cấp trong câu trả lời trước, nhưng có thể cần kiểm tra lại việc gán giá trị
scheduleData.forEach(entry => {
    const day = entry.day_of_week;
    const timeSlotId = entry.time_slot_info.id;
    let sessionType = entry.session_type; // Lấy session_type từ dữ liệu

    const correspondingTimeSlot = processedTimeSlots.flatMap(block => block.slots).find(s => s.id === timeSlotId);

    if (correspondingTimeSlot) {
        if (!correspondingTimeSlot.isBreakTime) { // Bỏ qua break time ở đây
            // Nếu session_type là null, cố gắng suy luận từ time_slot_info
            if (sessionType === null && correspondingTimeSlot) {
                const foundSessionBlock = processedTimeSlots.find(block =>
                    block.slots.some(s => s.id === timeSlotId)
                );
                if (foundSessionBlock) {
                    sessionType = foundSessionBlock.session; // Gán giá trị sessionType đã suy luận
                    console.warn(`Dữ liệu session_type cho ${entry.subject_or_course_name} (${day}, tiết ${timeSlotId}) là null, đã suy luận thành: ${sessionType}`);
                }
            }

            // Dòng này rất quan trọng: Đảm bảo điều kiện kiểm tra sessionType sau khi suy luận
            // và gán đúng entry vào organizedSchedule
            if (dayOrder.includes(day) && sessionType !== null) { 
                // Cập nhật session_type của entry trước khi gán vào organizedSchedule nếu cần
                // Hoặc bạn có thể tạo một bản sao của entry và gán sessionType đã suy luận
                const entryToOrganize = { ...entry, session_type: sessionType }; // Tạo bản sao với session_type đã cập nhật

                if (!organizedSchedule[day][timeSlotId]) {
                    organizedSchedule[day][timeSlotId] = entryToOrganize; // Gán bản sao đã cập nhật
                } else {
                    console.warn(`Cảnh báo: Phát hiện nhiều mục cho cùng một ô (${day}, tiết ${timeSlotId}).`);
                }
            }
        }
    } else {
        console.warn(`Cảnh báo: Không tìm thấy time_slot_info.id ${timeSlotId} trong processedTimeSlots.`);
    }
});

        processedTimeSlots.forEach(sessionBlock => {
                const sessionName = sessionBlock.session;
                const sessionLabel = sessionBlock.label;
                const slotsInThisSession = sessionBlock.slots;

                slotsInThisSession.forEach((timeSlot, index) => {
                    const row = document.createElement('tr');

                    // THÊM DÒNG NÀY: Kiểm tra nếu đây là buổi Chiều và là tiết đầu tiên của buổi đó
                    if (sessionName === 'AFTERNOON' && index === 0) {
                        row.classList.add('afternoon-start-row');
                    }

                    if (index === 0) {
                        const sessionHeaderCell = document.createElement('td');
                        sessionHeaderCell.classList.add('session-label-body');
                        sessionHeaderCell.rowSpan = slotsInThisSession.length;
                        sessionHeaderCell.textContent = sessionLabel;
                        row.appendChild(sessionHeaderCell);
                    }

                const timeSlotLabelCell = document.createElement('td');
                timeSlotLabelCell.classList.add('time-slot-label');
                if (timeSlot.isBreakTime) {
                    timeSlotLabelCell.innerHTML = `${timeSlot.breakLabel}<br>(${timeSlot.start_time.substring(0, 5)} - ${timeSlot.end_time.substring(0, 5)})`;
                } else {
                    const slotDisplayName = timeSlot.name && timeSlot.name.startsWith('Tiết') ? timeSlot.name : `Tiết ${timeSlot.order % 6 === 0 ? 6 : timeSlot.order % 6}`;
                    timeSlotLabelCell.innerHTML = `${slotDisplayName}<br>(${timeSlot.start_time.substring(0, 5)} - ${timeSlot.end_time.substring(0, 5)})`;
                }
                row.appendChild(timeSlotLabelCell);

                weekDays.forEach(day => {
                    const cell = document.createElement('td');
                    cell.classList.add('schedule-cell');
                    cell.classList.add('empty-cell');

                    const entry = organizedSchedule[day.apiName] ? organizedSchedule[day.apiName][timeSlot.id] : null;

                    if (timeSlot.isBreakTime) {
                        cell.classList.add('break-time-cell');
                    } else if (entry && entry.session_type === sessionName) {
                        cell.classList.remove('empty-cell');
                        const entryDiv = document.createElement('div');
                        entryDiv.classList.add('schedule-entry');

                        let subjectName = entry.subject_or_course_name || 'Không xác định';

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
                        subjectName = shortenSubjectName(subjectName);

                        const teacherName = entry.faculty_info && entry.faculty_info.full_name ? `GV: ${entry.faculty_info.full_name}` : '';
                        const locationInfo = entry.location_info ? `${entry.location_info.name} - ${entry.location_info.address || 'N/A'}` : '';

                        entryDiv.innerHTML = `
                            <div class="subject-name">${subjectName}</div>
                            <div class="teacher-name">${teacherName}</div>
                            <div class="location-name">${locationInfo}</div>
                        `;
                        cell.appendChild(entryDiv);
                    }
                    row.appendChild(cell);
                });
                timetableBody.appendChild(row);
            });
        });
    }

    function clearLocalStorageAndRedirect() {
        localStorage.removeItem('authToken');
        localStorage.removeItem('userId');
        localStorage.removeItem('userEmail');
        localStorage.removeItem('userRole');
        localStorage.removeItem('userFullName');
        localStorage.removeItem('teacherAuthToken');
        alert('Phiên đăng nhập của bạn đã hết hạn hoặc bạn không có quyền truy cập. Vui lòng đăng nhập lại.');
        window.location.href = '/dangnhap';
    }

    // --- EVENT LISTENERS ---

    semesterSelect.addEventListener('change', async (event) => {
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

            const firstMondayOfSemester = new Date(selectedSemesterDetails.startDate);
            firstMondayOfSemester.setHours(0,0,0,0); // Đảm bảo so sánh chính xác ngày bắt đầu của học kỳ
            const dayOfWeek = firstMondayOfSemester.getDay();
            const diff = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
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

            const lastSaturdayOfSemester = new Date(selectedSemesterDetails.endDate);
            lastSaturdayOfSemester.setHours(23,59,59,999); // Đảm bảo so sánh chính xác ngày kết thúc của học kỳ
            const dayOfWeek = lastSaturdayOfSemester.getDay();
            const diff = dayOfWeek === 6 ? 0 : 6 - dayOfWeek; // Tính toán để tìm ngày thứ 7 cuối cùng trong tuần đó
            lastSaturdayOfSemester.setDate(lastSaturdayOfSemester.getDate() + diff);

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

    // --- LOGIC TẢI DỮ LIỆU KHI TRANG TẢI ---
    try {
        processedTimeSlots = await fetchTimeSlots();
        if (processedTimeSlots.length === 0) {
            console.error("Không tải được dữ liệu tiết học, không thể hiển thị TKB.");
            errorMessageElement.textContent = "Không thể tải cấu hình tiết học. Vui lòng kiểm tra kết nối hoặc thử lại sau.";
            return;
        }
    } catch (error) {
        console.error("Lỗi nghiêm trọng khi tải dữ liệu tiết học:", error);
        errorMessageElement.textContent = `Lỗi nghiêm trọng khi tải cấu hình tiết học: ${error.message}. Vui lòng thử lại sau.`;
        return;
    }

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
                clearLocalStorageAndRedirect();
                return null;
            }
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
    })
    .then(data => {
        if (data) {
            data.sort((a, b) => {
                // Sắp xếp các học kỳ theo ngày bắt đầu mới nhất lên đầu
                const dateA = new Date(a.start_date);
                const dateB = new Date(b.start_date);
                return dateB.getTime() - dateA.getTime();
            });

            const today = new Date();
            today.setHours(0, 0, 0, 0); // Đặt giờ về 00:00:00 để so sánh chỉ theo ngày

            let foundCurrentSemester = false;
            semesterSelect.innerHTML = ''; // Xóa các option cũ trước khi thêm mới

            data.forEach(semester => {
                const startDate = new Date(semester.start_date);
                const endDate = new Date(semester.end_date);
                startDate.setHours(0, 0, 0, 0);
                endDate.setHours(0, 0, 0, 0);

                const option = document.createElement('option');
                option.value = semester.id;
                option.textContent = semester.name;
                option.dataset.startDate = semester.start_date;
                option.dataset.endDate = semester.end_date;
                semesterSelect.appendChild(option);

                // Kiểm tra nếu ngày hôm nay nằm trong khoảng của kỳ này và chưa tìm thấy kỳ hiện tại
                if (today >= startDate && today <= endDate && !foundCurrentSemester) {
                    semesterSelect.value = semester.id;
                    selectedSemesterDetails = {
                        startDate: startDate,
                        endDate: endDate
                    };
                    foundCurrentSemester = true; // Đánh dấu đã tìm thấy kỳ hiện tại đầu tiên
                }
            });

            // Nếu không tìm thấy kỳ nào đang diễn ra, chọn kỳ đầu tiên trong danh sách
            if (!foundCurrentSemester && semesterSelect.options.length > 0) {
                const firstOption = semesterSelect.options[0];
                semesterSelect.value = firstOption.value;
                selectedSemesterDetails = {
                    startDate: new Date(firstOption.dataset.startDate),
                    endDate: new Date(firstOption.dataset.endDate)
                };
            } else if (semesterSelect.options.length === 0) {
                errorMessageElement.textContent = "Không có học kỳ nào được tìm thấy. Vui lòng liên hệ quản trị viên.";
                weekSelect.innerHTML = '<option value="">Không có tuần</option>';
                selectedSemesterDetails = null;
                displaySchedule();
                return;
            }

            // Sau khi chọn được học kỳ (hoặc tự động tìm thấy), populate tuần và hiển thị thời khóa biểu
            if (selectedSemesterDetails) {
                populateWeeksDropdown(selectedSemesterDetails.startDate, selectedSemesterDetails.endDate);
            } else {
                 displaySchedule(); // Gọi để xóa bảng nếu không có học kỳ nào được chọn sau cùng
            }
        }
    })
    .catch(error => {
        console.error('Lỗi khi tải danh sách học kỳ:', error);
        errorMessageElement.textContent = `Không thể tải danh sách học kỳ: ${error.message}. Vui lòng thử lại sau.`;
    });
});
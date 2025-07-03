document.addEventListener('DOMContentLoaded', async () => { // Thêm async ở đây
    const timetableBody = document.querySelector('#facultyTimetable tbody');
    const timetableHead = document.querySelector('#facultyTimetable thead');
    const semesterSelect = document.getElementById('semesterSelect');
    const weekSelect = document.getElementById('weekSelect');

    const prevWeekBtn = document.getElementById('prevWeekBtn');
    const nextWeekBtn = document.getElementById('nextWeekBtn');
    const weekInfoSpan = document.getElementById('weekInfo');

    let currentDisplayDate = new Date();
    let selectedSemesterDetails = null;

    const semesterApiUrl = 'https://saigongiadinh.pythonanywhere.com/SemesterListView/';
    const studentScheduleApiUrl = 'https://saigongiadinh.pythonanywhere.com/StudentScheduleView/';
    const timeSlotsApiUrl = 'https://saigongiadinh.pythonanywhere.com/Time/'; // URL API cho time slots

    let processedTimeSlots = []; // Sẽ lưu trữ dữ liệu time slots đã được xử lý từ API

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
                    'Authorization': `Token ${token}` // Vẫn cần token nếu API Time yêu cầu
                }
            });
            if (!response.ok) {
                if (response.status === 401 || response.status === 403) {
                    localStorage.removeItem('authToken');
                    localStorage.removeItem('userId');
                    localStorage.removeItem('userEmail');
                    localStorage.removeItem('userRole');
                    localStorage.removeItem('userFullName');
                    localStorage.removeItem('teacherAuthToken');
                    alert('Phiên đăng nhập của bạn đã hết hạn hoặc bạn không có quyền truy cập. Vui lòng đăng nhập lại.');
                    window.location.href = '/dangnhap';
                    return [];
                } else {
                    const errorText = await response.text();
                    throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
                }
            }
            const data = await response.json();
            console.log('Dữ liệu Time Slots từ API:', data);
            return processTimeSlotsData(data); // Xử lý dữ liệu sau khi nhận được
        } catch (error) {
            console.error('Lỗi khi lấy dữ liệu time slots:', error);
            document.getElementById('errorMessage').textContent = `Không thể tải cấu hình tiết học: ${error.message}. Vui lòng thử lại sau.`;
            return [];
        }
    }

    function processTimeSlotsData(apiData) {
        const morningSlots = [];
        const afternoonSlots = [];

        apiData.sort((a, b) => a.order - b.order); // Sắp xếp theo order để đảm bảo đúng thứ tự

        apiData.forEach(slot => {
            const timeSlot = {
                id: slot.id,
                order: slot.order,
                start_time: slot.start_time,
                end_time: slot.end_time,
                name: slot.name // Giữ lại name từ API
            };

            // Kiểm tra và gán nhãn "Ra chơi"
            if (slot.name && slot.name.toLowerCase().includes('ra chơi')) { // Sử dụng .includes để linh hoạt hơn
                timeSlot.isBreakTime = true;
                timeSlot.breakLabel = slot.name; // Sử dụng tên từ API cho breakLabel
            }

            // Phân loại buổi dựa trên 'order'
            // Dựa vào dữ liệu bạn cung cấp, order 1-6 là sáng, 7 trở đi là chiều.
            if (timeSlot.order <= 6) { // Tiết 1-6 là buổi sáng
                morningSlots.push(timeSlot);
            } else { // Tiết 7-12 là buổi chiều
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

    function updateWeekInfo(currentDate) {
        const startOfWeek = new Date(currentDate); // currentDate ở đây là Thứ Hai của tuần
        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(endOfWeek.getDate() + 5); // Thứ Bảy

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

        const startFormatted = startOfWeek.toLocaleDateString('vi-VN', {day: '2-digit', month: '2-digit', year: 'numeric'});
        const endFormatted = endOfWeek.toLocaleDateString('vi-VN', {day: '2-digit', month: '2-digit', year: 'numeric'});

        weekInfoSpan.textContent = `Tuần ${weekNumber} (Từ ${startFormatted} đến ${endFormatted})`;
    }

    function createTableHeaders(weekDays) {
        let headerHtml = '<tr><th class="session-column-header">BUỔI</th><th class="time-column-header">TIẾT</th>';
        weekDays.forEach(day => {
            headerHtml += `<th class="day-header">${day.name}<br>${day.date}</th>`;
        });
        headerHtml += '</tr>';
        timetableHead.innerHTML = headerHtml;
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
                    localStorage.removeItem('authToken');
                    localStorage.removeItem('userId');
                    localStorage.removeItem('userEmail');
                    localStorage.removeItem('userRole');
                    localStorage.removeItem('userFullName');
                    localStorage.removeItem('teacherAuthToken');

                    alert('Phiên đăng nhập của bạn đã hết hạn hoặc bạn không có quyền truy cập. Vui lòng đăng nhập lại.');
                    window.location.href = '/dangnhap';
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
            document.getElementById('errorMessage').textContent = `Không thể tải thời khóa biểu: ${error.message}. Vui lòng thử lại sau.`;
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
        const todayWeekStart = new Date(today);
        const dayOfWeekToday = todayWeekStart.getDay();
        const diffToday = dayOfWeekToday === 0 ? 6 : dayOfWeekToday - 1;
        todayWeekStart.setDate(todayWeekStart.getDate() - diffToday);

        const foundWeekOption = Array.from(weekSelect.options).find(opt => {
            if (opt.value) {
                const optDate = new Date(opt.value);
                return optDate.toDateString() === todayWeekStart.toDateString();
            }
            return false;
        });

        if (foundWeekOption) {
            weekSelect.value = foundWeekOption.value;
            currentDisplayDate = new Date(foundWeekOption.value);
        } else if (weekSelect.options.length > 1) {
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

        const weekDays = getWeekDays(currentDisplayDate);
        createTableHeaders(weekDays);
        updateWeekInfo(currentDisplayDate);

        const organizedSchedule = {};
        dayOrder.forEach(day => {
            organizedSchedule[day] = {};
            // Sử dụng processedTimeSlots ở đây
            processedTimeSlots.forEach(sessionBlock => {
                sessionBlock.slots.forEach(slot => {
                    organizedSchedule[day][slot.id] = null;
                });
            });
        });

        scheduleData.forEach(entry => {
            const day = entry.day_of_week;
            const timeSlotId = entry.time_slot_info.id;
            const sessionType = entry.session_type;

            // Tìm timeSlot tương ứng trong processedTimeSlots
            const correspondingTimeSlot = processedTimeSlots.flatMap(block => block.slots).find(s => s.id === timeSlotId);

            if (correspondingTimeSlot) {
                // Nếu là tiết ra chơi, chúng ta sẽ lưu thông tin tiết ra chơi vào organizedSchedule
                // và bỏ qua việc kiểm tra sessionType từ API cho tiết ra chơi.
                if (correspondingTimeSlot.isBreakTime) {
                    // Không cần gán entry từ scheduleData nếu là break time
                    // Mà chỉ cần đảm bảo timeSlot này được nhận diện là break time
                    // processedTimeSlots đã có thông tin này
                } else {
                    // Đối với các tiết học bình thường, kiểm tra sessionType
                    const expectedSessionBlock = processedTimeSlots.find(block => 
                        block.slots.some(s => s.id === timeSlotId)
                    );
                    const expectedSession = expectedSessionBlock ? expectedSessionBlock.session : null;

                    if (dayOrder.includes(day) && sessionType === expectedSession) {
                        if (!organizedSchedule[day][timeSlotId]) {
                            organizedSchedule[day][timeSlotId] = entry;
                        } else {
                            console.warn(`Cảnh báo: Phát hiện nhiều mục cho cùng một ô (${day}, tiết ${timeSlotId}).`);
                        }
                    }
                }
            } else {
                console.warn(`Cảnh báo: Không tìm thấy time_slot_info.id ${timeSlotId} trong processedTimeSlots.`);
            }
        });

        // Vòng lặp để vẽ bảng sử dụng processedTimeSlots
        processedTimeSlots.forEach(sessionBlock => {
            const sessionName = sessionBlock.session;
            const sessionLabel = sessionBlock.label;
            const slotsInThisSession = sessionBlock.slots;

            slotsInThisSession.forEach((timeSlot, index) => {
                const row = document.createElement('tr');

                if (index === 0) {
                    const sessionHeaderCell = document.createElement('td');
                    sessionHeaderCell.classList.add('session-label-body');
                    sessionHeaderCell.rowSpan = slotsInThisSession.length;
                    sessionHeaderCell.textContent = sessionLabel;
                    row.appendChild(sessionHeaderCell);
                }

                const timeSlotLabelCell = document.createElement('td');
                timeSlotLabelCell.classList.add('time-slot-label');
                // Kiểm tra nếu là giờ ra chơi để hiển thị nội dung và style khác
                if (timeSlot.isBreakTime) {
                    timeSlotLabelCell.innerHTML = `${timeSlot.breakLabel}<br>(${timeSlot.start_time.substring(0, 5)} - ${timeSlot.end_time.substring(0, 5)})`;
                    // timeSlotLabelCell.classList.add('break-time-label'); // Thêm class nếu muốn style riêng cho nhãn này
                } else {
                    // Hiển thị tên tiết nếu có, hoặc "Tiết [số thứ tự trong buổi]" nếu không
                    const slotDisplayName = timeSlot.name && timeSlot.name.startsWith('Tiết') ? timeSlot.name : `Tiết ${timeSlot.order % 6 === 0 ? 6 : timeSlot.order % 6}`;
                    timeSlotLabelCell.innerHTML = `${slotDisplayName}<br>(${timeSlot.start_time.substring(0, 5)} - ${timeSlot.end_time.substring(0, 5)})`;
                }
                row.appendChild(timeSlotLabelCell);

                weekDays.forEach(day => {
                    const cell = document.createElement('td');
                    cell.classList.add('schedule-cell');
                    cell.classList.add('empty-cell');

                    // Lấy dữ liệu theo day.apiName và timeSlot.id
                    const entry = organizedSchedule[day.apiName] ? organizedSchedule[day.apiName][timeSlot.id] : null;

                    // Nếu là tiết ra chơi, tô màu nền vàng
                    if (timeSlot.isBreakTime) {
                        cell.classList.add('break-time-cell'); // Thêm class để tô màu
                        // KHÔNG ĐIỀN CHỮ "RA CHƠI" VÀO ĐÂY
                        // cell.textContent = timeSlot.breakLabel; // Bỏ dòng này
                    } else if (entry && entry.session_type === sessionName) { // Chỉ hiển thị nếu có dữ liệu và khớp với session hiện tại
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
            displaySchedule(); // Gọi để xóa bảng nếu không có học kỳ được chọn
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
            // Đảm bảo lastSaturdayOfSemester là Thứ Bảy của tuần cuối cùng
            const dayOfWeek = lastSaturdayOfSemester.getDay();
            const diff = dayOfWeek === 6 ? 0 : 6 - dayOfWeek;
            lastSaturdayOfSemester.setDate(lastSaturdayOfSemester.getDate() + diff);


            // Kiểm tra newDate không vượt quá ngày cuối cùng của học kỳ
            // và đảm bảo nó vẫn nằm trong tuần cuối cùng có thể hiển thị
            // So sánh với ngày bắt đầu của tuần mới so với ngày kết thúc học kỳ
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
    // Fetch Time Slots đầu tiên và xử lý nó
    try {
        processedTimeSlots = await fetchTimeSlots();
        if (processedTimeSlots.length === 0) {
            console.error("Không tải được dữ liệu tiết học, không thể hiển thị TKB.");
            document.getElementById('errorMessage').textContent = "Không thể tải cấu hình tiết học. Vui lòng kiểm tra kết nối hoặc thử lại sau.";
            return; // Dừng nếu không có dữ liệu tiết học
        }
    } catch (error) {
        console.error("Lỗi nghiêm trọng khi tải dữ liệu tiết học:", error);
        document.getElementById('errorMessage').textContent = `Lỗi nghiêm trọng khi tải cấu hình tiết học: ${error.message}. Vui lòng thử lại sau.`;
        return; // Dừng nếu có lỗi
    }

    // Sau khi Time Slots được tải, tiến hành tải danh sách học kỳ
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
                localStorage.removeItem('authToken');
                localStorage.removeItem('userId');
                localStorage.removeItem('userEmail');
                localStorage.removeItem('userRole');
                localStorage.removeItem('userFullName');
                localStorage.removeItem('teacherAuthToken');
                alert('Phiên đăng nhập của bạn đã hết hạn hoặc bạn không có quyền truy cập. Vui lòng đăng nhập lại.');
                window.location.href = '/dangnhap';
                return null;
            }
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
    })
    .then(data => {
        if (data) {
            data.sort((a, b) => b.id - a.id);
            data.forEach(semester => {
                const option = document.createElement('option');
                option.value = semester.id;
                option.textContent = semester.name;
                option.dataset.startDate = semester.start_date;
                option.dataset.endDate = semester.end_date;
                semesterSelect.appendChild(option);
            });

            if (semesterSelect.options.length > 0) {
                semesterSelect.value = semesterSelect.options[0].value;
                const firstOption = semesterSelect.options[0];
                selectedSemesterDetails = {
                    startDate: new Date(firstOption.dataset.startDate),
                    endDate: new Date(firstOption.dataset.endDate)
                };
                populateWeeksDropdown(selectedSemesterDetails.startDate, selectedSemesterDetails.endDate);
            }
            // displaySchedule() sẽ được gọi bên trong populateWeeksDropdown()
        }
    })
    .catch(error => {
        console.error('Lỗi khi tải danh sách học kỳ:', error);
        document.getElementById('errorMessage').textContent = `Không thể tải danh sách học kỳ: ${error.message}. Vui lòng thử lại sau.`;
    });
});
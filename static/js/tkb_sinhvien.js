// document.addEventListener('DOMContentLoaded', () => {
//     const apiUrl = "https://saigongiadinh.pythonanywhere.com/StudentScheduleView/?semester_id=1";
//     const scheduleTableBody = document.querySelector('#scheduleTable tbody');
//     const errorMessageElement = document.getElementById('errorMessage');

//     function getAuthToken() {
//         return localStorage.getItem('authToken');
//     }
//     const token = getAuthToken();
//     console.log('Authorization token:', token); // Giữ lại để debug token

//     const daysOfWeek = {
//         "MON": "Thứ Hai",
//         "TUE": "Thứ Ba",
//         "WED": "Thứ Tư",
//         "THU": "Thứ Năm",
//         "FRI": "Thứ Sáu",
//         "SAT": "Thứ Bảy"
//     };

//     // --- ĐÃ SỬA ĐỔI ĐÂY ---
//     // Mảng timeSlots được cập nhật với thời gian bắt đầu và kết thúc
//     // và không còn các mục "Ra chơi" riêng biệt
//     const timeSlots = [
//         { name: "Tiết 1", morning: true, order: 1, start_time: '07:15:00', end_time: '08:00:00' },
//         { name: "Tiết 2", morning: true, order: 2, start_time: '08:05:00', end_time: '08:35:00' },
//         { name: "Tiết 3", morning: true, order: 3, start_time: '08:40:00', end_time: '09:25:00' },
//         { name: "Ra chơi", morning: true, order: 4, start_time: '09:30:00', end_time: '10:15:00' },
//         { name: "Tiết 5", morning: true, order: 5, start_time: '10:20:00', end_time: '11:05:00' },
//         { name: "Tiết 1", morning: true, order: 6, start_time: '11:10:00', end_time: '11:55:00' }, // Đã sửa morning: true
//         { name: "Tiết 2", morning: false, order: 7, start_time: '13:00:00', end_time: '13:45:00' },
//         { name: "Tiết 3", morning: false, order: 8, start_time: '13:50:00', end_time: '14:35:00' },
//         { name: "Ra chơi", morning: false, order: 9, start_time: '14:40:00', end_time: '15:25:00' },
//         { name: "Tiết 4", morning: false, order: 10, start_time: '15:30:00', end_time: '16:15:00' },
//         { name: "Tiết 5", morning: false, order: 11, start_time: '16:20:00', end_time: '17:05:00' },
       
//     ];
//     // --- KẾT THÚC SỬA ĐỔI ---

//     async function fetchSchedule() {
//         try {
//             const response = await fetch(apiUrl, {
//                 method: 'GET',
//                 headers: {
//                     'Content-Type': 'application/json',
//                     'Authorization': `Token ${token}`
//                 }
//             });

//             if (!response.ok) {
//                 if (response.status === 401 || response.status === 403) {
//                     localStorage.removeItem('authToken');
//                     localStorage.removeItem('userId');
//                     localStorage.removeItem('userEmail');
//                     localStorage.removeItem('userRole');
//                     localStorage.removeItem('userFullName');
//                     localStorage.removeItem('teacherAuthToken'); // Xóa cả teacherAuthToken nếu có

//                     alert('Phiên đăng nhập của bạn đã hết hạn hoặc bạn không có quyền truy cập. Vui lòng đăng nhập lại.');
//                     window.location.href = '/dangnhap'; // Chuyển hướng về trang đăng nhập
//                     return; // Dừng hàm
//                 }
//                 throw new Error(`Lỗi HTTP: ${response.status} - ${response.statusText}`);
//             }

//             const data = await response.json();
//             renderSchedule(data);
//         } catch (error) {
//             console.error('Lỗi khi tải dữ liệu thời khóa biểu:', error);
//             errorMessageElement.textContent = `Không thể tải thời khóa biểu: ${error.message}. Vui lòng thử lại sau.`;
//         }
//     }

//     function renderSchedule(scheduleData) {
//         // Tạo một đối tượng để dễ dàng truy cập dữ liệu theo ngày và SỐ THỨ TỰ tiết
//         const organizedSchedule = {};
//         for (const dayKey in daysOfWeek) {
//             organizedSchedule[dayKey] = {};
//             timeSlots.forEach(slot => { // Lặp qua các tiết học đã định nghĩa
//                 organizedSchedule[dayKey][slot.order] = null; // Khởi tạo rỗng, dùng 'order' làm khóa
//             });
//         }

//         scheduleData.forEach(item => {
//             const day = item.day_of_week;
//             const timeSlotOrder = item.time_slot_info.order; // Lấy số thứ tự tiết từ dữ liệu API
//             const sessionType = item.session_type; // "MORNING" hoặc "AFTERNOON"

//             if (organizedSchedule[day] && timeSlotOrder) { // Kiểm tra nếu ngày và số tiết hợp lệ
//                 const slotConfig = timeSlots.find(ts => ts.order === timeSlotOrder); // Tìm cấu hình tiết tương ứng

//                 // Kiểm tra xem kiểu phiên (sáng/chiều) từ API có khớp với cấu hình tiết không
//                 if (slotConfig && ((sessionType === "MORNING" && slotConfig.morning) || (sessionType === "AFTERNOON" && !slotConfig.morning))) {
//                     organizedSchedule[day][timeSlotOrder] = item;
//                 }
//             }
//         });

//         let currentSession = ''; // "MORNING" hoặc "AFTERNOON"

//         // Xóa nội dung cũ trong tbody trước khi render lại
//         scheduleTableBody.innerHTML = '';

//         timeSlots.forEach((slot, index) => { // Lặp qua các tiết học đã được định nghĩa
//             const row = scheduleTableBody.insertRow();
//             let sessionCellAdded = false;

//             // Thêm ô Buổi (Morning/Afternoon)
//             // Số hàng chiếm (rowSpan) sẽ là số tiết trong buổi đó (6 tiết)
//             if (slot.morning && currentSession !== "MORNING") {
//                 const sessionCell = row.insertCell();
//                 sessionCell.rowSpan = timeSlots.filter(s => s.morning).length; // 6 tiết buổi sáng
//                 sessionCell.textContent = 'Sáng';
//                 sessionCell.classList.add('session-header');
//                 sessionCellAdded = true;
//                 currentSession = "MORNING";
//             } else if (!slot.morning && currentSession !== "AFTERNOON") {
//                 const sessionCell = row.insertCell();
//                 sessionCell.rowSpan = timeSlots.filter(s => !s.morning).length; // 6 tiết buổi chiều
//                 sessionCell.textContent = 'Chiều';
//                 sessionCell.classList.add('session-header');
//                 sessionCellAdded = true;
//                 currentSession = "AFTERNOON";
//             }

//             // Thêm ô Thời gian (Tiết 1, Tiết 2,...) kèm theo khoảng thời gian
//             const timeSlotCell = row.insertCell();
//             // timeSlotCell.classList.add('time-slot');
//             // --- ĐÃ SỬA ĐỔI ĐÂY ---
//             timeSlotCell.innerHTML = `${slot.name}<br>(${slot.start_time.substring(0, 5)} - ${slot.end_time.substring(0, 5)})`;
//             // --- KẾT THÚC SỬA ĐỔI ---

//             // Thêm các ô cho Thứ Hai đến Thứ Bảy
//             for (const dayKey in daysOfWeek) {
//                 const cell = row.insertCell();
//                 const lesson = organizedSchedule[dayKey][slot.order]; // Lấy dữ liệu tiết theo 'order'

//                 if (lesson) {
//                     let content = `<div class="subject-info">`;
//                     if (lesson.subject_or_course_name) {
//                         content += `<div class="subject-name">${lesson.subject_or_course_name}</div>`;
//                     }
//                     if (lesson.faculty_info && lesson.faculty_info.full_name) {
//                         content += `<div class="teacher-name">GV: ${lesson.faculty_info.full_name}</div>`;
//                     }
//                     if (lesson.location_info && lesson.location_info.name) {
//                         content += `<div class="location-name">${lesson.location_info.name} - ${lesson.location_info.address || 'N/A'}</div>`; // Thêm || 'N/A' phòng trường hợp address không có
//                     }
//                     content += `</div>`;
//                     cell.innerHTML = content;
//                 } else {
//                     cell.textContent = ''; // Ô trống nếu không có lịch
//                 }
//             }
//         });
//     }

//     fetchSchedule();
// });





document.addEventListener('DOMContentLoaded', () => {
    const timetableBody = document.querySelector('#facultyTimetable tbody'); // Đảm bảo ID này khớp với HTML
    const timetableHead = document.querySelector('#facultyTimetable thead'); // Đảm bảo ID này khớp với HTML
    const semesterSelect = document.getElementById('semesterSelect');
    const weekSelect = document.getElementById('weekSelect');

    const prevWeekBtn = document.getElementById('prevWeekBtn');
    const nextWeekBtn = document.getElementById('nextWeekBtn');
    const weekInfoSpan = document.getElementById('weekInfo');

    let currentDisplayDate = new Date(); // Sẽ lưu trữ ngày BẮT ĐẦU của tuần hiện tại (luôn là Thứ Hai)
    let selectedSemesterDetails = null; // Để lưu thông tin học kỳ đã chọn

    const semesterApiUrl = 'https://saigongiadinh.pythonanywhere.com/SemesterListView/';
    // URL API cho sinh viên
    const studentScheduleApiUrl = 'https://saigongiadinh.pythonanywhere.com/StudentScheduleView/';


    function getAuthToken() {
        return localStorage.getItem('authToken'); // Lấy token sinh viên
    }
    const token = getAuthToken();
    console.log('Authorization token:', token);

    const dayOrder = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
    const dayDisplayNames = {
        'MON': 'Thứ 2', 'TUE': 'Thứ 3', 'WED': 'Thứ 4', 'THU': 'Thứ 5',
        'FRI': 'Thứ 6', 'SAT': 'Thứ 7'
    };

    // Định nghĩa cố định các tiết học và buổi
    const fixedTimeSlots = [
        { session: 'MORNING', label: 'Sáng', slots: [
            { id: 1, order: 1, start_time: '07:00:00', end_time: '07:45:00' },
            { id: 2, order: 2, start_time: '07:50:00', end_time: '08:35:00' },
            { id: 3, order: 3, start_time: '08:40:00', end_time: '09:25:00' },
            { id: 4, order: 4, start_time: '09:30:00', end_time: '10:15:00' },
            { id: 5, order: 5, start_time: '10:20:00', end_time: '11:05:00' },
            { id: 6, order: 6, start_time: '11:10:00', end_time: '11:55:00' }
        ]},
        { session: 'AFTERNOON', label: 'Chiều', slots: [
            { id: 7, order: 7, start_time: '13:00:00', end_time: '13:45:00' },
            { id: 8, order: 8, start_time: '13:50:00', end_time: '14:35:00' },
            { id: 9, order: 9, start_time: '14:40:00', end_time: '15:25:00' },
            { id: 10, order: 10, start_time: '15:30:00', end_time: '16:15:00' },
            { id: 11, order: 11, start_time: '16:20:00', end_time: '17:05:00' },
            { id: 12, order: 12, start_time: '17:10:00', end_time: '17:55:00' }
        ]}
    ];

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

    // function createTableHeaders(weekDays) {
    //     let headerHtml = '<tr><th class="session-column-header">BUỔI</th><th class="time-column-header">TIẾT</th>';
    //     weekDays.forEach(day => {
    //         headerHtml += `<th class="day-header">${day.name}<br>${day.date}</th>`;
    //     });
    //     headerHtml += '</tr>';
    //     timetableHead.innerHTML = headerHtml;
    // }

    function createTableHeaders(weekDays) {
    // Sửa đổi chỗ này trong JS để thêm class vào <th>
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
        const url = `${studentScheduleApiUrl}?semester_id=${semesterId}`; // Sử dụng studentScheduleApiUrl
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
                    localStorage.removeItem('teacherAuthToken'); // Xóa cả teacherAuthToken nếu có

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
            fixedTimeSlots.forEach(sessionBlock => {
                sessionBlock.slots.forEach(slot => {
                    organizedSchedule[day][slot.id] = null;
                });
            });
        });

        scheduleData.forEach(entry => {
            const day = entry.day_of_week;
            const timeSlotId = entry.time_slot_info.id; // Sử dụng time_slot_info.id
            const sessionType = entry.session_type;

            // Kiểm tra xem tiết học có khớp với buổi không (MORNING/AFTERNOON)
            const correspondingTimeSlot = fixedTimeSlots.flatMap(block => block.slots).find(s => s.id === timeSlotId);

            if (correspondingTimeSlot) { // Đảm bảo timeSlotId hợp lệ
                const expectedSession = correspondingTimeSlot.id <= 6 ? 'MORNING' : 'AFTERNOON';

                if (dayOrder.includes(day) && sessionType === expectedSession) {
                    // Kiểm tra xem dữ liệu đã tồn tại chưa để tránh ghi đè không mong muốn
                    if (!organizedSchedule[day][timeSlotId]) {
                         organizedSchedule[day][timeSlotId] = entry;
                    } else {
                        // Nếu có nhiều hơn 1 mục cho cùng một ô, có thể xử lý ở đây
                        // Ví dụ: log cảnh báo hoặc chọn cách hiển thị cụ thể
                        console.warn(`Cảnh báo: Phát hiện nhiều mục cho cùng một ô (${day}, tiết ${timeSlotId}).`);
                        // Hoặc bạn có thể chọn ghi đè: organizedSchedule[day][timeSlotId] = entry;
                    }
                }
            } else {
                console.warn(`Cảnh báo: Không tìm thấy time_slot_info.id ${timeSlotId} trong fixedTimeSlots.`);
            }
        });

        fixedTimeSlots.forEach(sessionBlock => {
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
                timeSlotLabelCell.innerHTML = `Tiết ${timeSlot.order}<br>(${timeSlot.start_time.substring(0, 5)} - ${timeSlot.end_time.substring(0, 5)})`;
                row.appendChild(timeSlotLabelCell);

                weekDays.forEach(day => {
                    const cell = document.createElement('td');
                    cell.classList.add('schedule-cell');
                    cell.classList.add('empty-cell');

                    // Lấy dữ liệu theo day.apiName và timeSlot.id
                    const entry = organizedSchedule[day.apiName] ? organizedSchedule[day.apiName][timeSlot.id] : null;

                    // Chỉ hiển thị nếu có dữ liệu và khớp với session hiện tại
                    if (entry && entry.session_type === sessionName) {
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
            const dayOfWeek = lastSaturdayOfSemester.getDay();
            const diff = dayOfWeek === 6 ? 0 : 6 - dayOfWeek;
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

    // Tải dữ liệu học kỳ khi trang tải
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
                 return null; // Trả về null để dừng chuỗi .then
            }
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
    })
    .then(data => {
        if (data) {
            data.sort((a, b) => b.id - a.id); // Sắp xếp theo ID giảm dần để học kỳ mới nhất lên đầu
            data.forEach(semester => {
                const option = document.createElement('option');
                option.value = semester.id;
                option.textContent = semester.name;
                // Lưu startDate và endDate vào dataset để dễ dàng truy cập
                option.dataset.startDate = semester.start_date;
                option.dataset.endDate = semester.end_date;
                semesterSelect.appendChild(option);
            });

            // Tự động chọn học kỳ đầu tiên (mới nhất) sau khi tải
            if (semesterSelect.options.length > 0) {
                semesterSelect.value = semesterSelect.options[0].value;
                const firstOption = semesterSelect.options[0];
                selectedSemesterDetails = {
                    startDate: new Date(firstOption.dataset.startDate),
                    endDate: new Date(firstOption.dataset.endDate)
                };
                populateWeeksDropdown(selectedSemesterDetails.startDate, selectedSemesterDetails.endDate);
            }
        }
    })
    .catch(error => {
        console.error('Lỗi khi tải danh sách học kỳ:', error);
        document.getElementById('errorMessage').textContent = `Không thể tải danh sách học kỳ: ${error.message}. Vui lòng thử lại sau.`;
    });
});
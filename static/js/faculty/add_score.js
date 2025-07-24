document.addEventListener('DOMContentLoaded', () => {
    const classSelect = document.getElementById('class');
    const subjectSelect = document.getElementById('subject');
    const scoreTable = document.getElementById('scoreTable');
    const scoreTableBody = document.getElementById('scoreTableBody');
    const scoreTableHeader = document.getElementById('scoreTableHeader');
    const tableTitle = document.querySelector('.table-container h2');
    const saveGradesBtn = document.getElementById('saveGradesBtn');
    const editGradesBtn = document.getElementById('editGradesBtn');
    const cancelEditBtn = document.getElementById('cancelEditBtn');
    const exportExcelBtn = document.getElementById('exportExcelBtn');
    const loadingSpinner = document.getElementById('loadingSpinner');

    let gradeTypes = [];
    let currentSemesterName = 'các môn học';
    let selectedSubjectId = null;
    let isEditingMode = false;

    function getFacultyAuthToken() {
        const token = localStorage.getItem('authToken');
        return token;
    }
    const token = getFacultyAuthToken();

    const showSpinner = () => {
        if (loadingSpinner) {
            loadingSpinner.style.display = 'flex';
        }
    };

    const hideSpinner = () => {
        if (loadingSpinner) {
            loadingSpinner.style.display = 'none';
        }
    };

    // --- HÀM MỚI ĐỂ QUẢN LÝ TRẠNG THÁI NÚT EXCEL ---
    const updateExportButtonState = () => {
        const hasSelectedClass = classSelect.value !== "" && classSelect.value !== null;
        const hasSelectedSubject = subjectSelect.value !== "" && subjectSelect.value !== null;
        const hasTableData = scoreTableBody.children.length > 0 && 
                             scoreTableBody.children[0].textContent.trim() !== 'Vui lòng chọn Lớp và Môn học để xem bảng điểm.' &&
                             scoreTableBody.children[0].textContent.trim() !== 'Không có dữ liệu điểm cho lớp và môn học đã chọn.' &&
                             scoreTableBody.children[0].textContent.trim() !== 'Không thể tải dữ liệu điểm. Vui lòng thử lại sau.' &&
                             scoreTableBody.children[0].textContent.trim() !== 'Không thể tải cấu hình điểm. Vui lòng thử lại sau.';


        if (hasSelectedClass && hasSelectedSubject && hasTableData && !isEditingMode) {
            exportExcelBtn.disabled = false;
            exportExcelBtn.style.backgroundColor = '#28a745'; // Màu xanh lá
        } else {
            exportExcelBtn.disabled = true;
            exportExcelBtn.style.backgroundColor = '#cccccc'; // Màu xám
        }
    };
    // --------------------------------------------------

    const fetchGradeTypes = async () => {
        showSpinner();
        const apiUrl = 'https://saigongiadinh.pythonanywhere.com/grade-types/';
        const headers = {};
        if (token) {
            headers['Authorization'] = `Token ${token}`;
        }

        try {
            const response = await fetch(apiUrl, { headers: headers });
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            gradeTypes = data.filter(type =>
                ['ORAL', 'FIFTEEN_MIN', 'ONE_LESSON', 'MIDTERM', 'FINAL'].includes(type.code)
            );
            const order = { 'ORAL': 1, 'FIFTEEN_MIN': 2, 'ONE_LESSON': 3, 'MIDTERM': 4, 'FINAL': 5 };
            gradeTypes.sort((a, b) => order[a.code] - order[b.code]);

            updateTableHeader();
            return gradeTypes;
        } catch (error) {
            console.error('Lỗi khi lấy danh sách loại điểm từ API:', error);
            gradeTypes = [];
            alert('Không thể tải cấu hình loại điểm. Vui lòng thử lại sau.');
            return [];
        } finally {
            hideSpinner();
            updateExportButtonState(); // Cập nhật trạng thái nút sau khi tải xong
        }
    };

    const fetchSemestersAndSetCurrent = async () => {
        showSpinner();
        const apiUrl = 'https://saigongiadinh.pythonanywhere.com/semesters/';
        const headers = {};
        if (token) {
            headers['Authorization'] = `Token ${token}`;
        }

        try {
            const response = await fetch(apiUrl, { headers: headers });
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const semesters = await response.json();
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            let foundSemester = null;

            for (const semester of semesters) {
                const startDate = new Date(semester.start_date);
                const endDate = new Date(semester.end_date);
                startDate.setHours(0, 0, 0, 0);
                endDate.setHours(0, 0, 0, 0);

                if (today >= startDate && today <= endDate) {
                    foundSemester = semester;
                    break;
                }
            }

            if (foundSemester) {
                currentSemesterName = foundSemester.semester_type_display;
            } else {
                currentSemesterName = 'các môn học';
            }
            updateTableTitle();

        } catch (error) {
            console.error('Lỗi khi lấy danh sách kỳ học từ API:', error);
            currentSemesterName = 'các môn học';
            alert('Không thể tải danh sách kỳ học. Tiêu đề bảng có thể không chính xác.');
        } finally {
            hideSpinner();
            updateExportButtonState(); // Cập nhật trạng thái nút sau khi tải xong
        }
    };

    const updateTableTitle = () => {
        if (tableTitle) {
            tableTitle.textContent = `Bảng điểm ${currentSemesterName}`;
        }
    };

    const updateTableHeader = () => {
        scoreTableHeader.innerHTML = '';

        const row1 = document.createElement('tr');
        const row2 = document.createElement('tr');

        const fixedCols = [
            { text: 'STT', rowspan: 2 },
            { text: 'Họ tên', rowspan: 2 },
            { text: 'Ngày sinh', rowspan: 2 }
        ];

        fixedCols.forEach(col => {
            const th = document.createElement('th');
            th.textContent = col.text;
            th.rowSpan = col.rowspan;
            row1.appendChild(th);
        });

        gradeTypes.forEach(type => {
            const th1 = document.createElement('th');
            th1.textContent = type.name;

            let maxInputs = 1;
            if (type.code === 'ORAL') {
                maxInputs = 3;
            } else if (type.code === 'FIFTEEN_MIN') {
                maxInputs = 3;
            } else if (type.code === 'ONE_LESSON') {
                th1.textContent = 'Điểm 1 tiết';
                maxInputs = 2;
            }

            if (maxInputs > 1) {
                th1.colSpan = maxInputs;
                row1.appendChild(th1);

                for (let i = 1; i <= maxInputs; i++) {
                    const th2 = document.createElement('th');
                    th2.textContent = i;
                    row2.appendChild(th2);
                }
            } else {
                th1.rowSpan = 2;
                row1.appendChild(th1);
            }
        });

        const tbmTh = document.createElement('th');
        tbmTh.textContent = 'TBM';
        tbmTh.rowSpan = 2;
        row1.appendChild(tbmTh);

        scoreTableHeader.appendChild(row1);
        if (row2.children.length > 0) {
            scoreTableHeader.appendChild(row2);
        }
    };

    const fetchClassesAndPopulateSelect = async () => {
        showSpinner();
        const apiUrl = 'https://saigongiadinh.pythonanywhere.com/classesId/';
        const headers = {};
        if (token) {
            headers['Authorization'] = `Token ${token}`;
        }

        try {
            const response = await fetch(apiUrl, { headers: headers });
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const classes = await response.json();

            classSelect.innerHTML = '<option value="">-- Chọn lớp --</option>';

            classes.forEach(classItem => {
                const option = document.createElement('option');
                option.value = classItem.class_id;
                option.textContent = classItem.class_id;
                classSelect.appendChild(option);
            });
        } catch (error) {
            console.error('Lỗi khi lấy danh sách lớp học từ API:', error);
            alert('Không thể tải danh sách lớp học. Vui lòng thử lại sau.');
        } finally {
            hideSpinner();
            updateExportButtonState(); // Cập nhật trạng thái nút sau khi tải xong
        }
    };

    const fetchSubjectsAndPopulateSelect = async () => {
        showSpinner();
        const apiUrl = 'https://saigongiadinh.pythonanywhere.com/subjects/';
        const headers = {};
        if (token) {
            headers['Authorization'] = `Token ${token}`;
        }

        try {
            const response = await fetch(apiUrl, { headers: headers });
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const subjects = await response.json();

            subjectSelect.innerHTML = '<option value="">-- Chọn môn học --</option>';

            subjects.forEach(subject => {
                const option = document.createElement('option');
                option.value = subject.id;
                option.textContent = subject.title;
                subjectSelect.appendChild(option);
            });
        } catch (error) {
            console.error('Lỗi khi lấy danh sách môn học từ API:', error);
            alert('Không thể tải danh sách môn học. Vui lòng thử lại sau.');
        } finally {
            hideSpinner();
            updateExportButtonState(); // Cập nhật trạng thái nút sau khi tải xong
        }
    };

    const fetchDataAndPopulateTable = async () => {
        const selectedClass = classSelect.value;
        selectedSubjectId = subjectSelect.value;

        if (!selectedClass || selectedClass === "" || !selectedSubjectId || selectedSubjectId === "") {
            const totalCols = 3 + gradeTypes.reduce((sum, type) => {
                if (type.code === 'ORAL') return sum + 3;
                if (type.code === 'FIFTEEN_MIN') return sum + 3;
                if (type.code === 'ONE_LESSON') return sum + 2;
                return sum + 1;
            }, 0) + 1;
            const msgCellColspan = totalCols > 0 ? totalCols : 10;

            scoreTableBody.innerHTML = `<tr><td colspan="${msgCellColspan}" style="text-align: center; color: #6c757d;">Vui lòng chọn Lớp và Môn học để xem bảng điểm.</td></tr>`;
            setEditingMode(false);
            hideSpinner();
            updateExportButtonState(); // Cập nhật trạng thái nút
            return;
        }

        if (gradeTypes.length === 0) {
            const totalCols = 3 + gradeTypes.reduce((sum, type) => {
                if (type.code === 'ORAL') return sum + 3;
                if (type.code === 'FIFTEEN_MIN') return sum + 3;
                if (type.code === 'ONE_LESSON') return sum + 2;
                return sum + 1;
            }, 0) + 1;
            const msgCellColspan = totalCols > 0 ? totalCols : 10;
            scoreTableBody.innerHTML = `<tr><td colspan="${msgCellColspan}" style="color: red;">Không thể tải cấu hình điểm. Vui lòng thử lại sau.</td></tr>`;
            hideSpinner();
            updateExportButtonState(); // Cập nhật trạng thái nút
            return;
        }

        showSpinner();
        const apiUrl = `https://saigongiadinh.pythonanywhere.com/grade-management/class/${selectedClass}/subject/${selectedSubjectId}/`;
        const headers = {};
        if (token) {
            headers['Authorization'] = `Token ${token}`;
        }

        try {
            const response = await fetch(apiUrl, { headers: headers });
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            populateTable(data);
            setEditingMode(false);
        } catch (error) {
            console.error('Lỗi khi lấy dữ liệu điểm từ API:', error);
            const totalCols = 3 + gradeTypes.reduce((sum, type) => {
                if (type.code === 'ORAL') return sum + 3;
                if (type.code === 'FIFTEEN_MIN') return sum + 3;
                if (type.code === 'ONE_LESSON') return sum + 2;
                return sum + 1;
            }, 0) + 1;
            const msgCellColspan = totalCols > 0 ? totalCols : 10;
            scoreTableBody.innerHTML = `<tr><td colspan="${msgCellColspan}" style="color: red;">Không thể tải dữ liệu điểm. Vui lòng thử lại sau.</td></tr>`;
        } finally {
            hideSpinner();
            updateExportButtonState(); // Cập nhật trạng thái nút sau khi tải xong
        }
    };

    const populateTable = (studentsData) => {
        scoreTableBody.innerHTML = '';

        if (studentsData.length === 0) {
            const totalCols = 3 + gradeTypes.reduce((sum, type) => {
                if (type.code === 'ORAL') return sum + 3;
                if (type.code === 'FIFTEEN_MIN') return sum + 3;
                if (type.code === 'ONE_LESSON') return sum + 2;
                return sum + 1;
            }, 0) + 1;
            const msgCellColspan = totalCols > 0 ? totalCols : 10;
            scoreTableBody.innerHTML = `<tr><td colspan="${msgCellColspan}">Không có dữ liệu điểm cho lớp và môn học đã chọn.</td></tr>`;
            updateExportButtonState(); // Cập nhật trạng thái nút
            return;
        }

        studentsData.forEach((student, index) => {
            const row = document.createElement('tr');
            row.dataset.studentCode = student.student_code;

            const sttCell = document.createElement('td');
            sttCell.textContent = index + 1;
            row.appendChild(sttCell);

            const nameCell = document.createElement('td');
            nameCell.textContent = student.student_full_name;
            row.appendChild(nameCell);

            const dobCell = document.createElement('td');
            if (student.student_birthday) {
                const date = new Date(student.student_birthday);
                const day = String(date.getDate()).padStart(2, '0');
                const month = String(date.getMonth() + 1).padStart(2, '0');
                const year = date.getFullYear();
                dobCell.textContent = `${day}/${month}/${year}`;
            } else {
                dobCell.textContent = '';
            }
            row.appendChild(dobCell);

            gradeTypes.forEach(type => {
                if (['ORAL', 'FIFTEEN_MIN', 'ONE_LESSON'].includes(type.code)) {
                    const gradesForType = student.grades[type.code] || [];
                    const existingGradesMap = new Map(gradesForType.map(g => [g.entry_index, g.score]));

                    let maxInputs = 0;
                    if (type.code === 'ORAL') {
                        maxInputs = 3;
                    } else if (type.code === 'FIFTEEN_MIN') {
                        maxInputs = 3;
                    } else if (type.code === 'ONE_LESSON') {
                        maxInputs = 2;
                    }

                    for (let i = 1; i <= maxInputs; i++) {
                        const td = document.createElement('td');
                        const scoreValue = existingGradesMap.has(i) ? existingGradesMap.get(i) : '';

                        const span = document.createElement('span');
                        span.textContent = scoreValue;
                        span.classList.add('score-display');

                        const input = document.createElement('input');
                        input.type = 'number';
                        input.step = '0.1';
                        input.min = '0';
                        input.max = '10';
                        input.value = scoreValue;
                        input.dataset.gradeCategory = type.code;
                        input.dataset.entryIndex = i;
                        input.dataset.studentCode = student.student_code;
                        input.dataset.subjectId = selectedSubjectId;
                        input.classList.add('score-input');

                        td.appendChild(span);
                        td.appendChild(input);
                        row.appendChild(td);
                    }
                } else if (['MIDTERM', 'FINAL'].includes(type.code)) {
                    const td = document.createElement('td');
                    const gradeObject = student.grades[type.code];
                    const scoreValue = gradeObject && gradeObject.score !== null ? gradeObject.score : '';

                    const span = document.createElement('span');
                    span.textContent = scoreValue;
                    span.classList.add('score-display');

                    const input = document.createElement('input');
                    input.type = 'number';
                    input.step = '0.1';
                    input.min = '0';
                    input.max = '10';
                    input.value = scoreValue;
                    input.dataset.gradeCategory = type.code;
                    input.dataset.studentCode = student.student_code;
                    input.dataset.subjectId = selectedSubjectId;
                    if (gradeObject && gradeObject.entry_index) {
                         input.dataset.entryIndex = gradeObject.entry_index;
                    } else {
                         input.dataset.entryIndex = 1;
                    }
                    input.classList.add('score-input');

                    td.appendChild(span);
                    td.appendChild(input);
                    row.appendChild(td);
                }
            });

            const tbmCell = document.createElement('td');
            const tbmSpan = document.createElement('span');
            tbmSpan.textContent = student.final_average_score !== null ? parseFloat(student.final_average_score).toFixed(1) : '';
            tbmSpan.classList.add('score-display');
            
            const tbmInput = document.createElement('input');
            tbmInput.type = 'number';
            tbmInput.value = student.final_average_score !== null ? parseFloat(student.final_average_score).toFixed(1) : '';
            tbmInput.readOnly = true;
            tbmInput.style.backgroundColor = '#e9ecef';
            tbmInput.classList.add('score-input');

            tbmCell.appendChild(tbmSpan);
            tbmCell.appendChild(tbmInput);
            row.appendChild(tbmCell);

            scoreTableBody.appendChild(row);
        });

        updateInputDisplay();
        updateExportButtonState(); // Cập nhật trạng thái nút sau khi populate bảng
    };

    const setEditingMode = (enable) => {
        isEditingMode = enable;
        const scoreInputs = scoreTableBody.querySelectorAll('.score-input');
        const scoreDisplays = scoreTableBody.querySelectorAll('.score-display');
        const tbmInputs = scoreTableBody.querySelectorAll('td:last-child input');

        scoreInputs.forEach(input => {
            if (input.readOnly) {
                input.style.display = 'block';
            } else {
                input.style.display = isEditingMode ? 'block' : 'none';
            }
        });

        scoreDisplays.forEach(span => {
            if (span.parentElement.querySelector('input[readonly]')) {
                span.style.display = 'none';
            } else {
                span.style.display = isEditingMode ? 'none' : 'block';
            }
        });
        
        if (isEditingMode) {
            editGradesBtn.style.display = 'none';
            saveGradesBtn.style.display = 'inline-block';
            cancelEditBtn.style.display = 'inline-block';
            exportExcelBtn.style.display = 'none'; // Ẩn nút xuất Excel khi đang chỉnh sửa
        } else {
            editGradesBtn.style.display = 'inline-block';
            saveGradesBtn.style.display = 'none';
            cancelEditBtn.style.display = 'none';
            exportExcelBtn.style.display = 'inline-block'; // Hiển thị nút xuất Excel khi không chỉnh sửa
        }
        updateExportButtonState(); // Cập nhật trạng thái nút sau khi thay đổi chế độ
    };

    const updateInputDisplay = () => {
        setEditingMode(isEditingMode);
    };

    const saveGrades = async () => {
        showSpinner();
        const studentGradesData = [];
        const rows = scoreTableBody.querySelectorAll('tr');

        rows.forEach(row => {
            const studentCode = row.dataset.studentCode;
            if (!studentCode) return;

            const gradesBySubject = {};
            const inputs = row.querySelectorAll('input[data-grade-category]:not([readonly])');

            inputs.forEach(input => {
                const gradeCategory = input.dataset.gradeCategory;
                const entryIndex = input.dataset.entryIndex ? parseInt(input.dataset.entryIndex) : null;
                const score = input.value === '' ? null : parseFloat(input.value);
                const subjectId = input.dataset.subjectId;

                if (!subjectId) return;

                if (!gradesBySubject[subjectId]) {
                    gradesBySubject[subjectId] = {};
                }

                if (['ORAL', 'FIFTEEN_MIN', 'ONE_LESSON'].includes(gradeCategory)) {
                    if (score !== null) {
                        if (!gradesBySubject[subjectId][gradeCategory]) {
                            gradesBySubject[subjectId][gradeCategory] = [];
                        }
                        gradesBySubject[subjectId][gradeCategory].push({
                            entry_index: entryIndex,
                            score: score
                        });
                    }
                } else if (['MIDTERM', 'FINAL'].includes(gradeCategory)) {
                    if (score !== null) {
                        gradesBySubject[subjectId][gradeCategory] = { score: score, entry_index: entryIndex };
                    }
                }
            });

            if (Object.keys(gradesBySubject).length > 0) {
                studentGradesData.push({
                    student_code: studentCode,
                    grades_by_subject: gradesBySubject
                });
            }
        });

        if (studentGradesData.length === 0) {
            alert('Không có dữ liệu điểm để lưu.');
            hideSpinner();
            updateExportButtonState(); // Cập nhật trạng thái nút
            return;
        }

        const apiUrl = 'https://saigongiadinh.pythonanywhere.com/grade-management/bulk-update-grades/';
        const headers = {
            'Content-Type': 'application/json',
        };
        if (token) {
            headers['Authorization'] = `Token ${token}`;
        }

        try {
            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: headers,
                body: JSON.stringify(studentGradesData)
            });

            if (!response.ok) {
                const errorText = await response.text();
                let errorData = null;
                try {
                    errorData = JSON.parse(errorText);
                } catch (e) {
                    console.error('Không thể phân tích phản hồi lỗi thành JSON:', errorText);
                    errorData = { message: 'Phản hồi lỗi không phải JSON', raw: errorText };
                }

                console.error('Lỗi khi lưu điểm - Mã trạng thái:', response.status);
                console.error('Lỗi khi lưu điểm - Dữ liệu lỗi:', errorData);
                alert(`Lưu điểm thất bại: ${JSON.stringify(errorData.detail || errorData)}`);
            } else {
                const responseData = await response.json();
                console.log('Lưu điểm thành công:', responseData);
                alert('Lưu điểm thành công!');
                setEditingMode(false);
                fetchDataAndPopulateTable();
            }
        } catch (error) {
            console.error('Lỗi mạng hoặc lỗi không xác định khi lưu điểm:', error);
            alert('Đã xảy ra lỗi khi kết nối đến máy chủ. Vui lòng thử lại.');
        } finally {
            hideSpinner();
            updateExportButtonState(); // Cập nhật trạng thái nút sau khi lưu
        }
    };

    const exportTableToExcel = () => {
        const selectedClass = classSelect.value;
        const selectedSubject = subjectSelect.options[subjectSelect.selectedIndex].text;

        if (!selectedClass || selectedClass === "" || !selectedSubjectId || selectedSubjectId === "") {
            alert('Vui lòng chọn Lớp và Môn học để xuất bảng điểm.');
            return;
        }

        // Tạo một bản sao của bảng để thao tác, loại bỏ các input/span không cần thiết
        const tableClone = scoreTable.cloneNode(true);
        // Loại bỏ loading overlay khỏi bản sao
        const spinnerInClone = tableClone.querySelector('#loadingSpinner');
        if (spinnerInClone) {
            spinnerInClone.remove();
        }

        const rows = tableClone.querySelectorAll('tbody tr');
        rows.forEach(row => {
            const cells = row.querySelectorAll('td');
            cells.forEach(cell => {
                const span = cell.querySelector('.score-display');
                const input = cell.querySelector('.score-input');
                
                // Chỉ lấy giá trị hiển thị (span) hoặc giá trị của input nếu nó là readonly (TBM)
                if (input && input.readOnly) {
                    cell.textContent = input.value;
                } else if (span) {
                    cell.textContent = span.textContent;
                }
                // Nếu không có span hoặc input (như cột STT, Tên, Ngày sinh), giữ nguyên textContent
            });
        });

        // Lấy dữ liệu header
        const headerRows = scoreTableHeader.querySelectorAll('tr');
        const headerData = [];
        headerRows.forEach(row => {
            const rowCells = [];
            row.querySelectorAll('th').forEach(th => {
                const colSpan = th.colSpan || 1;
                const rowSpan = th.rowSpan || 1;
                // Thay vì push nhiều lần, push một đối tượng có thông tin colspan/rowspan
                rowCells.push({ v: th.textContent, s: { colSpan: colSpan, rowSpan: rowSpan } });
            });
            headerData.push(rowCells);
        });

        // Lấy dữ liệu body
        const bodyData = [];
        scoreTableBody.querySelectorAll('tr').forEach(row => {
            const rowData = [];
            row.querySelectorAll('td').forEach(cell => {
                // Lấy nội dung hiển thị của ô (span nếu không ở chế độ chỉnh sửa, hoặc giá trị của input nếu là TBM)
                const span = cell.querySelector('.score-display');
                const input = cell.querySelector('.score-input');
                let cellValue = '';

                if (input && input.readOnly) { // Đối với TBM
                    cellValue = input.value;
                } else if (span) { // Các điểm khác
                    cellValue = span.textContent;
                } else { // Các ô cố định (STT, Tên, Ngày sinh)
                    cellValue = cell.textContent;
                }
                rowData.push(cellValue);
            });
            bodyData.push(rowData);
        });

        const ws_data = headerData.concat(bodyData);

        const ws = XLSX.utils.aoa_to_sheet(ws_data, { cellDates: true }); // cellDates để xử lý ngày tháng tốt hơn

        // Merge cells for headers
        const merges = [];
        headerRows.forEach((row, rIdx) => {
            let cAcc = 0; // Accumulated columns for calculating merge range
            row.querySelectorAll('th').forEach(th => {
                const colSpan = th.colSpan || 1;
                const rowSpan = th.rowSpan || 1;
                if (colSpan > 1 || rowSpan > 1) {
                    merges.push({
                        s: { r: rIdx, c: cAcc }, // Start cell: row, col
                        e: { r: rIdx + rowSpan - 1, c: cAcc + colSpan - 1 } // End cell: row, col
                    });
                }
                cAcc += colSpan;
            });
        });
        if (merges.length > 0) {
            ws['!merges'] = merges;
        }

        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Bảng điểm");

        const fileName = `Bang_diem_Lop_${selectedClass}_Mon_${selectedSubject.replace(/\s/g, '_')}.xlsx`;
        XLSX.writeFile(wb, fileName);
    };


    // Lắng nghe sự kiện thay đổi của select Lớp và Môn học
    classSelect.addEventListener('change', fetchDataAndPopulateTable);
    subjectSelect.addEventListener('change', fetchDataAndPopulateTable);

    // Lắng nghe sự kiện click vào nút "Nhập/Sửa điểm"
    editGradesBtn.addEventListener('click', () => {
        if (classSelect.value && subjectSelect.value) {
            setEditingMode(true);
        } else {
            alert('Vui lòng chọn Lớp và Môn học trước khi nhập/sửa điểm.');
        }
    });

    // Lắng nghe sự kiện click vào nút "Hủy"
    cancelEditBtn.addEventListener('click', () => {
        if (confirm('Bạn có chắc muốn hủy các thay đổi chưa lưu?')) {
            setEditingMode(false);
            fetchDataAndPopulateTable();
        }
    });

    // Lắng nghe sự kiện click vào nút "Lưu điểm"
    saveGradesBtn.addEventListener('click', saveGrades);

    // Lắng nghe sự kiện click vào nút "Xuất Excel"
    exportExcelBtn.addEventListener('click', exportTableToExcel);


    // Khi trang được tải:
    // 1. Vô hiệu hóa nút Excel ban đầu
    // 2. Tải các dữ liệu cần thiết
    // 3. Cập nhật trạng thái nút sau khi tải xong
    fetchSemestersAndSetCurrent().then(() => {
        return fetchGradeTypes();
    }).then(() => {
        fetchClassesAndPopulateSelect();
        fetchSubjectsAndPopulateSelect();
        const totalCols = 3 + gradeTypes.reduce((sum, type) => {
            if (type.code === 'ORAL') return sum + 3;
            if (type.code === 'FIFTEEN_MIN') return sum + 3;
            if (type.code === 'ONE_LESSON') return sum + 2;
            return sum + 1;
        }, 0) + 1;
        const msgCellColspan = totalCols > 0 ? totalCols : 10;
        scoreTableBody.innerHTML = `<tr><td colspan="${msgCellColspan}" style="text-align: center; color: #6c757d;">Vui lòng chọn Lớp và Môn học để xem bảng điểm.</td></tr>`;
        setEditingMode(false); // Đảm bảo trạng thái ban đầu là không chỉnh sửa
        hideSpinner();
        updateExportButtonState(); // Cập nhật trạng thái nút sau khi tải xong tất cả ban đầu
    });
});
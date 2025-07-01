// search_score.js - Cập nhật để hoạt động khi được include trong edit_score.html

// Lấy các phần tử DOM (đảm bảo các ID này tồn tại trong search_score.html)
const gradeLevelSelect = document.getElementById('gradeLevelSelect');
const subjectSelect = document.getElementById('subjectSelect');
const searchSubjectsButton = document.getElementById('searchSubjectsButton');
const messageBox1 = document.getElementById('messageBox'); // Dùng chung messageBox của edit_score.js

/**
 * Hiển thị thông báo lên giao diện người dùng.
 * @param {HTMLElement} targetMessageBox Phần tử message box để hiển thị thông báo.
 * @param {string} message Nội dung thông báo.
 * @param {string} type Loại thông báo ('success' hoặc 'error').
 */
function showMessage(targetMessageBox, message, type) {
    targetMessageBox.textContent = message;
    targetMessageBox.className = `message-box ${type}`;
    targetMessageBox.classList.remove('hidden');
    setTimeout(() => {
        targetMessageBox.classList.add('hidden');
    }, 5000);
}

/**
 * Tải danh sách môn học dựa trên khối và điền vào dropdown.
 * @param {string|null} gradeLevel Khối (ví dụ: 'KHOI_10', 'KHOI_11', 'KHOI_12'). Nếu null hoặc rỗng, tải tất cả.
 */
async function populateSubjectsDropdown(gradeLevel = null) {
    subjectSelect.innerHTML = '<option value="">Đang tải môn học...</option>';
    subjectSelect.disabled = true;

    let url = `https://saigongiadinh.pythonanywhere.com/SubjectViewSet/`;
    const queryParams = [];

    if (gradeLevel) {
        queryParams.push(`grade_level=${gradeLevel}`);
    }

    if (queryParams.length > 0) {
        url += `?${queryParams.join('&')}`;
    }

    try {
        const response = await fetch(url);
        if (!response.ok) {
            const errorText = await response.text();
            console.error(`[populateSubjectsDropdown] HTTP error! status: ${response.status}, response: ${errorText}`);
            throw new Error(`Lỗi HTTP! Trạng thái: ${response.status}`);
        }
        const subjects = await response.json();

        subjectSelect.innerHTML = '<option value="">Chọn môn học</option>'; 
        if (subjects.length === 0) {
            subjectSelect.innerHTML = '<option value="">Không có môn học</option>';
        } else {
            subjects.forEach(subject => {
                const option = document.createElement('option');
                option.value = subject.id;
                option.textContent = subject.title;
                subjectSelect.appendChild(option);
            });
        }

        subjectSelect.disabled = false;
        showMessage(messageBox1, `Đã tải ${subjects.length} môn học.`, 'success');

    } catch (error) {
        console.error('[populateSubjectsDropdown] Lỗi khi tải danh sách môn học:', error);
        subjectSelect.innerHTML = '<option value="">Không thể tải môn học</option>';
        subjectSelect.disabled = true;
        showMessage(messageBox1, `Lỗi khi tải danh sách môn học: ${error.message}`, 'error');
    }
}

// Event Listener khi thay đổi khối lớp
gradeLevelSelect.addEventListener('change', (event) => {
    const selectedGradeLevel = event.target.value;
    if (selectedGradeLevel) {
        populateSubjectsDropdown(selectedGradeLevel); 
    } else {
        subjectSelect.innerHTML = '<option value="">Chọn Khối trước</option>';
        subjectSelect.disabled = true;
        showMessage(messageBox1, 'Vui lòng chọn một Khối để lọc môn học.', 'error');
    }
    subjectSelect.value = ""; 
});

// Event Listener cho nút Tìm kiếm Môn học
searchSubjectsButton.addEventListener('click', () => {
    const selectedGradeLevel = gradeLevelSelect.value;
    const selectedSubjectId = subjectSelect.value;
    
    if (!selectedGradeLevel) {
        showMessage(messageBox1, "Vui lòng chọn một Khối để tìm kiếm.", 'error');
        return;
    }

    // Gọi hàm fetchGradeEntries của edit_score.js
    // Giả định fetchGradeEntries được định nghĩa trong phạm vi toàn cục hoặc được gắn vào window
    if (typeof fetchGradeEntries === 'function') {
        showMessage(messageBox1, "Đang lọc điểm...", 'info');
        fetchGradeEntries(selectedGradeLevel, selectedSubjectId || null);
    } else {
        console.error("Hàm fetchGradeEntries không khả dụng. Đảm bảo edit_score.js đã được tải trước.");
        showMessage(messageBox1, "Lỗi nội bộ: Không thể tải điểm. Vui lòng liên hệ quản trị viên.", 'error');
    }
});

// Khởi tạo ứng dụng khi DOM đã sẵn sàng
document.addEventListener('DOMContentLoaded', () => {
    subjectSelect.disabled = true;
    subjectSelect.innerHTML = '<option value="">Chọn Khối trước</option>';
    // Vì search_score.js được include trong edit_score.html, messageBox1 đã là messageBox chính
    // và edit_score.js sẽ chịu trách nhiệm tải điểm ban đầu.
});
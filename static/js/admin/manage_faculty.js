// Hàm để lấy token xác thực từ localStorage
// Bạn cần đảm bảo token được lưu trữ đúng cách sau khi admin đăng nhập
function getAuthToken() {
    // Thay 'adminAuthToken' bằng khóa bạn dùng để lưu token
    // Ví dụ: return "YOUR_ADMIN_TOKEN_HERE"; // Dùng để test tạm
    return localStorage.getItem('adminAuthToken'); 
}

async function fetchFacultyData() {
    const apiUrl = "https://saigongiadinh.pythonanywhere.com/FacultyList/";
    const token = getAuthToken();

    const loadingMessage = document.getElementById('loadingMessage');
    const errorMessage = document.getElementById('errorMessage');
    const facultyTable = document.getElementById('facultyTable');
    const facultyTableBody = document.getElementById('facultyTableBody');

    // Hiển thị thông báo tải, ẩn bảng và thông báo lỗi
    loadingMessage.classList.remove('d-none');
    errorMessage.classList.add('d-none');
    facultyTable.classList.add('d-none');
    facultyTableBody.innerHTML = ''; // Xóa dữ liệu cũ nếu có

    if (!token) {
        errorMessage.textContent = 'Lỗi: Không tìm thấy token xác thực admin. Vui lòng đăng nhập lại.';
        errorMessage.classList.remove('d-none');
        loadingMessage.classList.add('d-none');
        console.error('Không tìm thấy token xác thực.');
        // Có thể chuyển hướng đến trang đăng nhập admin nếu token không có
        // setTimeout(() => { window.location.href = '/admin/login'; }, 2000);
        return;
    }

    try {
        const response = await axios.get(apiUrl, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Token ${token}` // Gửi token dưới dạng Token <your_token>
            }
        });

        const facultyData = response.data;
        console.log("Dữ liệu giảng viên đã tải:", facultyData);

        if (facultyData.length === 0) {
            facultyTableBody.innerHTML = '<tr><td colspan="10" class="text-center">Không có giảng viên nào trong hệ thống.</td></tr>'; // Cập nhật colspan
            facultyTable.classList.remove('d-none'); // Vẫn hiển thị bảng để thấy thông báo không có dữ liệu
        } else {
            facultyData.forEach((faculty, index) => {
                const row = document.createElement('tr');
                const photoSrc = `https://res.cloudinary.com/dftarzzfw/${faculty.user_photo}`
                
                row.innerHTML = `
                    <td>${index + 1}</td>
                    <td>${faculty.faculty_code || 'N/A'}</td>
                    <td><img src="${photoSrc}" alt="Ảnh đại diện" class="user-photo"></td>
                    <td>${faculty.first_name || ''} ${faculty.last_name || 'N/A'}</td>
                    <td>${faculty.email || 'N/A'}</td>
                    <td>${faculty.department_name}</td>
                    <td>${faculty.position || 'N/A'}</td>
                    <td >
                    <div class="action-buttons">
                        <button class="btn btn-sm view-faculty-btn" data-id="${faculty.id}" title="Xem chi tiết">
                            <i class="fas fa-eye"></i>&nbsp;Xem
                        </button>
                        <button class="btn btn-sm edit-faculty-btn" data-id="${faculty.id}" title="Chỉnh sửa">
                            <i class="fas fa-edit"></i>&nbsp; Sửa
                        </button>
                        <button class="btn btn-sm delete-faculty-btn" data-id="${faculty.id}" title="Xóa">
                            <i class="fas fa-trash-alt"></i>&nbsp; Xóa
                        </button>
                        </div>
                    </td>
                `;
                facultyTableBody.appendChild(row);
            });
            facultyTable.classList.remove('d-none');
        }

    } catch (error) {
        let errorDetail = 'Lỗi không xác định.';
        let statusCode = 0;

        if (axios.isAxiosError(error)) { // Kiểm tra nếu là lỗi từ Axios
            if (error.response) {
                statusCode = error.response.status;
                errorDetail = error.response.data.detail || `Lỗi ${statusCode}: ${error.response.statusText}`;
            } else if (error.request) {
                errorDetail = 'Không nhận được phản hồi từ server. Vui lòng kiểm tra kết nối mạng hoặc cấu hình CORS.';
            } else {
                errorDetail = `Lỗi trong quá trình thiết lập request: ${error.message}`;
            }
        } else { // Các lỗi không phải từ Axios
            errorDetail = `Lỗi hệ thống: ${error.message}`;
        }
        
        if (statusCode === 401 || statusCode === 403) {
            errorMessage.textContent = `Lỗi xác thực: ${errorDetail}. Vui lòng đăng nhập lại.`;
            localStorage.removeItem('adminAuthToken'); // Xóa token cũ
            // Optional: chuyển hướng đến trang đăng nhập
            // setTimeout(() => { window.location.href = '/admin/login'; }, 1500);
        } else {
            errorMessage.textContent = `Lỗi khi tải dữ liệu: ${errorDetail}.`;
        }
        errorMessage.classList.remove('d-none');
        console.error('Lỗi khi tải dữ liệu giảng viên:', error);

    } finally {
        loadingMessage.classList.add('d-none'); // Ẩn thông báo tải sau khi hoàn tất
    }
}

// Bổ sung các hàm xử lý sự kiện cho nút Thêm, Sửa, Xóa (cần các API endpoint tương ứng)
document.addEventListener('DOMContentLoaded', () => {
    fetchFacultyData();

    // Ví dụ: Bắt sự kiện click cho nút "Thêm giảng viên mới"
    const addFacultyBtn = document.getElementById('addFacultyBtn');
    if (addFacultyBtn) {
        addFacultyBtn.addEventListener('click', () => {
            alert('Chức năng thêm giảng viên mới sẽ được triển khai tại đây!');
            // Chuyển hướng đến trang thêm mới hoặc mở modal
            // window.location.href = '/admin/faculty/add'; 
        });
    }

    // Bắt sự kiện click cho các nút Sửa/Xóa (sử dụng event delegation)
    document.getElementById('facultyTableBody').addEventListener('click', (event) => {
        const target = event.target.closest('button'); // Tìm nút gần nhất
        if (!target) return; // Không phải nút

        const facultyId = target.dataset.id; // Lấy ID giảng viên từ data-id

        if (target.classList.contains('view-faculty-btn')) {
            alert(`Xem chi tiết giảng viên ID: ${facultyId}`);
            // Logic để hiển thị chi tiết (mở modal, chuyển trang)
            // window.location.href = `/admin/faculty/${facultyId}/view`;
        } else if (target.classList.contains('edit-faculty-btn')) {
            alert(`Chỉnh sửa giảng viên ID: ${facultyId}`);
            // Logic để chỉnh sửa (mở modal form điền sẵn dữ liệu, chuyển trang)
            // window.location.href = `/admin/faculty/${facultyId}/edit`;
        } else if (target.classList.contains('delete-faculty-btn')) {
            if (confirm(`Bạn có chắc chắn muốn xóa giảng viên ID: ${facultyId} không?`)) {
                // Logic để xóa giảng viên (gọi API DELETE)
                deleteFaculty(facultyId);
            }
        }
    });
});

// Hàm mẫu để gọi API xóa (chưa có endpoint thực tế)
async function deleteFaculty(facultyId) {
    const apiUrl = `https://saigongiadinh.pythonanywhere.com/FacultyList/${facultyId}/`; // Endpoint DELETE
    const token = getAuthToken();

    if (!token) {
        alert('Lỗi: Không tìm thấy token xác thực để xóa.');
        return;
    }

    try {
        await axios.delete(apiUrl, {
            headers: {
                'Authorization': `Token ${token}`
            }
        });
        alert(`Giảng viên ID ${facultyId} đã được xóa thành công.`);
        // Tải lại dữ liệu sau khi xóa
        fetchFacultyData(); 
    } catch (error) {
        let errorMsg = 'Có lỗi xảy ra khi xóa giảng viên.';
        if (axios.isAxiosError(error) && error.response) {
            errorMsg = `Lỗi ${error.response.status}: ${error.response.data.detail || error.response.statusText}`;
        } else {
            errorMsg = `Lỗi: ${error.message}`;
        }
        alert(errorMsg);
        console.error('Lỗi khi xóa giảng viên:', error);
    }
}
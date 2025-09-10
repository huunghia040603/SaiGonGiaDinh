// auth.js

// Quản lý phiên đăng nhập và các hàm tiện ích
const AUTH_KEY = 'authToken';
const ROLE_KEY = 'userRole';
const SESSION_DURATION_MS = 1000 * 60 * 15; // 15 phút

const Auth = {
    /**
     * Lưu thông tin người dùng từ phản hồi API vào localStorage.
     * @param {object} data - Dữ liệu trả về từ API đăng nhập.
     */
    saveSession: (data) => {
        localStorage.setItem('sessionStartTime', Date.now().toString());

        if (data.token) {
            localStorage.setItem(AUTH_KEY, data.token);
        }
        
        const userData = data.user_data;
        if (userData) {
            const userDetails = {
                userId: data.user_id,
                userEmail: userData.email || '',
                userFirstName: userData.first_name || '',
                userLastName: userData.last_name || '',
                userFullName: `${userData.last_name || ''} ${userData.first_name || ''}`.trim(),
                userPhone: userData.phone || '',
                userGender: userData.gender || '',
                userGenderDisplay: userData.gender_display || '',
                userAddress: [userData.address, userData.district, userData.city].filter(Boolean).join(', ') || '',
                userRole: userData.role || '',
                userRoleDisplay: userData.role_display || '',
                userIsActive: userData.is_active ? 'true' : 'false',
                userDateJoined: userData.date_joined || '',
                userLastLogin: userData.last_login || '',
                userNationalIdCard: userData.national_id_card || '',
                userDateOfBirth: userData.date_of_birth || '',
                userPlaceOfBirth: userData.place_of_birth || '',
                userNationality: userData.nationality || '',
                userEnrollmentDate: userData.enrollment_date || '',
                userPhoto: userData.user_photo || '',
            };
            
            if (userData.role === 'SINH_VIEN') {
                userDetails.studentIdNumber = userData.student_id_number || '';
                userDetails.studentMajor = userData.major || '';
                userDetails.studentEnrollmentYear = userData.enrollment_year || '';
            } else if (userData.role === 'CBCNV') {
                userDetails.facultyCode = userData.faculty_code || '';
                userDetails.facultyType = userData.type || '';
                userDetails.facultyDepartmentName = userData.department_name || '';
                userDetails.facultyPosition = userData.position || '';
                userDetails.facultyDegree = userData.degree || '';
                userDetails.facultyOfficeLocation = userData.office_location || '';
                userDetails.facultyIsDepartmentHead = userData.is_department_head ? 'true' : 'false';
            }

            for (const key in userDetails) {
                localStorage.setItem(key, userDetails[key]);
            }
        }
    },

    /**
     * Xóa toàn bộ thông tin phiên làm việc khỏi localStorage.
     */
    clearSession: () => {
        const keysToRemove = [
            'userId', 'authToken', 'userEmail', 'userFirstName', 'userLastName', 'userFullName', 'userPhone',
            'userGender', 'userGenderDisplay', 'userAddress', 'userRole',
            'userRoleDisplay', 'userIsActive', 'userDateJoined', 'userLastLogin',
            'userNationalIdCard', 'userDateOfBirth', 'userPlaceOfBirth',
            'userNationality', 'userEnrollmentDate', 'userPhoto',
            'facultyCode', 'facultyType', 'facultyDepartmentName',
            'facultyPosition', 'facultyDegree', 'facultyOfficeLocation',
            'facultyIsDepartmentHead', 'sessionStartTime',
            'studentIdNumber', 'studentMajor', 'studentEnrollmentYear'
        ];
        keysToRemove.forEach(key => localStorage.removeItem(key));
    },

    /**
     * Kiểm tra xem phiên làm việc có hợp lệ hay không.
     * @returns {boolean} True nếu phiên hợp lệ, ngược lại là False.
     */
    isAuthenticated: () => {
        const authToken = localStorage.getItem(AUTH_KEY);
        const userRole = localStorage.getItem(ROLE_KEY);
        const sessionStartTime = localStorage.getItem('sessionStartTime');
        
        if (!authToken || (userRole !== 'CBCNV' && userRole !== 'SINH_VIEN')) {
            return false;
        }

        const currentTime = Date.now();
        const elapsedTime = currentTime - parseInt(sessionStartTime);
        
        if (elapsedTime > SESSION_DURATION_MS) {
            console.warn('[Auth] Phiên đăng nhập đã hết hạn.');
            Auth.clearSession();
            return false;
        }
        
        return true;
    },

    /**
     * Lấy token xác thực đã lưu.
     * @returns {string|null} Token hoặc null nếu không tồn tại.
     */
    getAuthToken: () => {
        return localStorage.getItem(AUTH_KEY);
    },

    /**
     * Lấy thông tin người dùng đã lưu.
     * @returns {object} Đối tượng chứa thông tin người dùng.
     */
    getUserInfo: () => {
        return {
            userId: localStorage.getItem('userId'),
            userEmail: localStorage.getItem('userEmail'),
            userFirstName: localStorage.getItem('userFirstName'),
            userFullName: localStorage.getItem('userFullName'),
            userRole: localStorage.getItem(ROLE_KEY),
            userPhoto: localStorage.getItem('userPhoto'),
        };
    },

    /**
     * Cập nhật giao diện người dùng dựa trên trạng thái đăng nhập.
     */
    updateLoginUI: () => {
        const loginStatusLink = document.getElementById('loginStatusLink');
        const facultyHomeLink = document.getElementById('facultyHomeLink');
        const logoutButton = document.getElementById('logoutButton');
        const topBar = document.querySelector('.top-links');

        if (!loginStatusLink) {
            return;
        }

        if (Auth.isAuthenticated()) {
            const userInfo = Auth.getUserInfo();
            const userDisplayName = userInfo.userFirstName || userInfo.userFullName || userInfo.userEmail || 'Bạn';
            
            // Tạo nút "Trở về GV" nếu người dùng là giảng viên
            if (userInfo.userRole === 'CBCNV') {
                const newFacultyLink = document.createElement('a');
                newFacultyLink.id = 'facultyHomeLink';
                newFacultyLink.href = '/gv/home_faculty/';
                newFacultyLink.innerHTML = `<i class="fas fa-arrow-alt-circle-left"></i> TRỞ VỀ GV`;
                newFacultyLink.style.color = 'white';
                newFacultyLink.style.marginLeft = '15px';
                
                
                if (topBar) {
                    topBar.insertBefore(newFacultyLink, loginStatusLink);
                }
            }

            // Cập nhật liên kết Đăng nhập
            loginStatusLink.innerHTML = `<i class="fas fa-user"></i> CHÀO, ${userDisplayName.toUpperCase()}`;
            loginStatusLink.href = '/profile';
            loginStatusLink.style.color = 'white';
            loginStatusLink.style.fontWeight = 'normal';

            // Xóa nút trở về GV cũ nếu có
            if (facultyHomeLink) {
                facultyHomeLink.remove();
            }

            

            // Tạo nút Đăng xuất
            const newLogoutButton = document.createElement('a');
            newLogoutButton.id = 'logoutButton';
            newLogoutButton.href = '#';
            newLogoutButton.innerHTML = `<i class="fas fa-sign-out-alt"></i> ĐĂNG XUẤT`;
            newLogoutButton.style.color = '#dc3545';
            newLogoutButton.style.marginLeft = '15px';
            newLogoutButton.style.fontWeight = 'bold';

            // Gắn sự kiện click cho nút Đăng xuất
            newLogoutButton.addEventListener('click', (event) => {
                event.preventDefault();
                Auth.clearSession();
                alert('Bạn đã đăng xuất thành công!');
                window.location.reload();
            });

            // Chỉ thêm nút Đăng xuất nếu nó chưa tồn tại
            if (!document.getElementById('logoutButton')) {
                if (topBar) {
                    topBar.appendChild(newLogoutButton);
                }
            }
        } else {
            // Trở về trạng thái ban đầu
            loginStatusLink.innerHTML = `<i class="fas fa-user"></i> ĐĂNG NHẬP SGC`;
            loginStatusLink.href = '/dangnhap';
            loginStatusLink.style.color = '';
            loginStatusLink.style.fontWeight = '';
            
            // Xóa nút Đăng xuất và "Trở về GV" nếu chúng tồn tại
            if (logoutButton) {
                logoutButton.remove();
            }
            if (facultyHomeLink) {
                facultyHomeLink.remove();
            }
        }
    }
};

// Gán Auth vào đối tượng window để có thể gọi từ các script khác
window.Auth = Auth;

// Gọi hàm cập nhật UI khi trang tải
document.addEventListener('DOMContentLoaded', () => {
    Auth.updateLoginUI();
});
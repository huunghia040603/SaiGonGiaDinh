
// /static/js/login.js
document.addEventListener('DOMContentLoaded', function() {
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const loginBtn = document.getElementById('loginBtn');
    const messageDiv = document.getElementById('message');

    const headerUserNameElement = document.getElementById('headerUserName');
    const headerUserAvatarElement = document.getElementById('headerUserAvatar');
    const headerUserAvatarLink = document.getElementById('headerUserAvatarLink');

    const loginApiUrl = 'https://saigongiadinh.pythonanywhere.com/auth/faculty_login/';

    const SESSION_DURATION_MS = 10 * 60 * 1000; // 10 phút tính bằng mili giây

    function showMessage(msg, type) {
        if (messageDiv) {
            messageDiv.textContent = msg;
            messageDiv.className = `message ${type}`;
            messageDiv.style.display = msg ? 'block' : 'none';
        }
    }

    function updateHeaderUserInfo(fullName, userPhotoUrl, role) {
        if (headerUserNameElement) {
            if (fullName && role === 'CBCNV') {
                headerUserNameElement.textContent = `Chào, ${fullName}!`;
                headerUserNameElement.style.display = 'inline';
            } else {
                headerUserNameElement.textContent = `Chào mừng!`;
            }
        }

        if (headerUserAvatarElement) {
            if (userPhotoUrl && role === 'CBCNV') {
                headerUserAvatarElement.src = userPhotoUrl;
                headerUserAvatarElement.alt = `${fullName} Avatar`;
                if (headerUserAvatarLink) {
                    headerUserAvatarLink.style.display = 'block';
                }
            } else {
                headerUserAvatarElement.src = "https://via.placeholder.com/40";
                headerUserAvatarElement.alt = "User Avatar";
                if (headerUserAvatarLink) {
                    headerUserAvatarLink.style.display = 'block';
                }
            }
        }
    }

    function clearLocalStorageSession() {
        const keysToRemove = [
            'userId', 'authToken', 'userEmail', 'userFullName', 'userPhone',
            'userGender', 'userGenderDisplay', 'userAddress', 'userRole',
            'userRoleDisplay', 'userIsActive', 'userDateJoined', 'userLastLogin',
            'userNationalIdCard', 'userDateOfBirth', 'userPlaceOfBirth',
            'userNationality', 'userEnrollmentDate', 'userPhoto',
            'facultyCode', 'facultyType', 'facultyDepartmentName',
            'facultyPosition', 'facultyDegree', 'facultyOfficeLocation',
            'facultyIsDepartmentHead',
            'time_login'
        ];
        keysToRemove.forEach(key => localStorage.removeItem(key));
        console.log('Đã xóa dữ liệu Local Storage của phiên đăng nhập.');
    }

    async function handleLogin(event) {
        event.preventDefault();

        const email = emailInput.value.trim();
        const password = passwordInput.value.trim();

        if (!email || !password) {
            showMessage('Vui lòng nhập đầy đủ email và mật khẩu.', 'error');
            return;
        }

        if (loginBtn) {
            loginBtn.disabled = true;
            loginBtn.textContent = 'Đang đăng nhập...';
        }
        showMessage('', '');

        try {
            const response = await fetch(loginApiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email: email, password: password })
            });

            const data = await response.json();

            if (response.ok) {
                showMessage(data.message || 'Đăng nhập thành công!', 'success');

                clearLocalStorageSession();
                console.log('Đã xóa dữ liệu Local Storage cũ của người dùng trước khi lưu dữ liệu mới.');

                if (data.user_id) localStorage.setItem('userId', data.user_id);
                if (data.token) localStorage.setItem('authToken', data.token);

                localStorage.setItem('time_login', Date.now().toString()); // Lưu thời gian đăng nhập

                if (data.user_data) {
                    const userData = data.user_data;

                    localStorage.setItem('userEmail', userData.email || '');
                    const userFullName = `${userData.last_name || ''} ${userData.first_name || ''}`.trim();
                    localStorage.setItem('userFullName', userFullName);

                    localStorage.setItem('userPhone', userData.phone || '');
                    localStorage.setItem('userGender', userData.gender || '');
                    localStorage.setItem('userGenderDisplay', userData.gender_display || '');

                    const fullAddress = [
                        userData.address,
                        userData.district,
                        userData.city
                    ].filter(Boolean).join(', ');
                    localStorage.setItem('userAddress', fullAddress || '');

                    localStorage.setItem('userRole', userData.role || '');
                    localStorage.setItem('userRoleDisplay', userData.role_display || '');

                    localStorage.setItem('userIsActive', userData.is_active ? 'true' : 'false');
                    localStorage.setItem('userDateJoined', userData.date_joined || '');
                    localStorage.setItem('userLastLogin', userData.last_login || '');
                    localStorage.setItem('userNationalIdCard', userData.national_id_card || '');
                    localStorage.setItem('userDateOfBirth', userData.date_of_birth || '');
                    localStorage.setItem('userPlaceOfBirth', userData.place_of_birth || '');
                    localStorage.setItem('userNationality', userData.nationality || '');
                    localStorage.setItem('userEnrollmentDate', userData.enrollment_date || '');

                    localStorage.setItem('userPhoto', userData.user_photo || '');

                    localStorage.setItem('facultyCode', userData.faculty_code || '');
                    localStorage.setItem('facultyType', userData.type || '');
                    localStorage.setItem('facultyDepartmentName', userData.department_name || '');
                    localStorage.setItem('facultyPosition', userData.position || '');
                    localStorage.setItem('facultyDegree', userData.degree || '');
                    localStorage.setItem('facultyOfficeLocation', userData.office_location || '');
                    localStorage.setItem('facultyIsDepartmentHead', userData.is_department_head ? 'true' : 'false');

                    updateHeaderUserInfo(userFullName, userData.user_photo, userData.role);
                }

                if (data.user_data && data.user_data.role === 'CBCNV') {
                    window.location.href = '/sggd/gv/manage/home_faculty/';
                } else {
                    showMessage('Đăng nhập thành công nhưng tài khoản không có quyền truy cập giảng viên/cán bộ.', 'error');
                    clearLocalStorageSession();
                }

            } else {
                let errorMessage = 'Đăng nhập thất bại. Vui lòng thử lại.';
                if (data.detail) {
                    errorMessage = data.detail;
                } else if (data.email) {
                    errorMessage = data.email[0];
                } else if (data.password) {
                    errorMessage = data.password[0];
                } else if (data.non_field_errors) {
                    errorMessage = data.non_field_errors[0];
                }
                showMessage(errorMessage, 'error');
            }
        } catch (error) {
            console.error('Lỗi khi gửi yêu cầu đăng nhập:', error);
            showMessage('Đã xảy ra lỗi kết nối. Vui lòng kiểm tra lại mạng.', 'error');
        } finally {
            if (loginBtn) {
                loginBtn.disabled = false;
                loginBtn.textContent = 'Đăng nhập';
            }
        }
    }

    // --- LOGIC KIỂM TRA PHIÊN HẾT HẠN TRÊN CLIENT ---
    function checkFrontendSessionExpiry() {
        const timeLogin = localStorage.getItem('time_login');
        const authToken = localStorage.getItem('authToken');

        if (!timeLogin || !authToken) {
            console.log('%c[Phiên Đăng Nhập] Không có phiên hoặc token.', 'color: gray;');
            return false;
        }

        const loginTimestamp = parseInt(timeLogin);
        const currentTime = Date.now();
        const elapsedTime = currentTime - loginTimestamp; // Thời gian đã trôi qua

        // Định dạng thời gian cho console
        const formatTime = (timestamp) => {
            const date = new Date(timestamp);
            return date.toLocaleTimeString('vi-VN', {hour: '2-digit', minute:'2-digit', second:'2-digit'}) + ` (${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()})`;
        };

        const remainingTimeMs = SESSION_DURATION_MS - elapsedTime;

        if (remainingTimeMs <= 0) {
            console.log('%c[Phiên Đăng Nhập] Phiên đã hết hạn!', 'color: red; font-weight: bold;');
            console.log(`%c[Phiên Đăng Nhập] Thời gian đăng nhập: ${formatTime(loginTimestamp)}`, 'color: orange;');
            console.log(`%c[Phiên Đăng Nhập] Thời gian hiện tại: ${formatTime(currentTime)}`, 'color: orange;');
            clearLocalStorageSession();

            if (window.location.pathname !== '/login' && window.location.pathname !== '/auth/login/') {
                const confirmLogout = confirm('Phiên đăng nhập của bạn đã hết hạn. Vui lòng đăng nhập lại.');
                if (confirmLogout) {
                    window.location.href = '/auth/login';
                } else {
                    window.location.href = '/auth/login';
                }
            }
            return false;
        } else {
            const remainingMinutes = Math.floor(remainingTimeMs / (1000 * 60));
            const remainingSeconds = Math.floor((remainingTimeMs % (1000 * 60)) / 1000);
            console.log(`%c[Phiên Đăng Nhập] Thời gian còn lại: ${remainingMinutes} phút ${remainingSeconds} giây`, 'color: blue;');
            return true;
        }
    }

    // Kiểm tra ngay khi DOM được tải (trừ trang đăng nhập)
    if (window.location.pathname !== '/login' && window.location.pathname !== '/auth/login/') {
        checkFrontendSessionExpiry();
    }

    // Kiểm tra khi người dùng quay lại tab hoặc cửa sổ trình duyệt (focus)
    document.addEventListener('visibilitychange', function() {
        if (document.visibilityState === 'visible') {
            console.log('%c[Kiểm tra Phiên] Trang trở lại hiển thị, đang kiểm tra phiên...', 'color: purple;');
            if (window.location.pathname !== '/login' && window.location.pathname !== '/auth/login/') {
                checkFrontendSessionExpiry();
            }
        }
    });

    // Thêm kiểm tra định kỳ mỗi 5 giây (hoặc bất kỳ khoảng thời gian nào bạn muốn)
    // Việc này giúp cập nhật thời gian còn lại trong console ngay cả khi không chuyển tab
    setInterval(() => {
        if (localStorage.getItem('authToken') && window.location.pathname !== '/login' && window.location.pathname !== '/auth/login/') {
            console.log('%c--- Kiểm tra phiên định kỳ ---', 'color: gray;');
            checkFrontendSessionExpiry();
        }
    }, 5000); // Kiểm tra mỗi 5 giây

    // --- KẾT THÚC LOGIC KIỂM TRA PHIÊN HẾT HẠN TRÊN CLIENT ---


    if (loginBtn) {
        loginBtn.addEventListener('click', handleLogin);
    }

    if (emailInput) {
        emailInput.addEventListener('keypress', function(event) {
            if (event.key === 'Enter') {
                handleLogin(event);
            }
        });
    }
    if (passwordInput) {
        passwordInput.addEventListener('keypress', function(event) {
            if (event.key === 'Enter') {
                handleLogin(event);
            }
        });
    }

    const storedUserFullName = localStorage.getItem('userFullName');
    const storedUserPhoto = localStorage.getItem('userPhoto');
    const storedUserRole = localStorage.getItem('userRole');

    if (checkFrontendSessionExpiry()) {
        updateHeaderUserInfo(storedUserFullName, storedUserPhoto, storedUserRole);
    } else {
        updateHeaderUserInfo('', '', '');
    }
});
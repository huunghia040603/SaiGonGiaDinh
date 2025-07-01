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

    const SESSION_DURATION_MS = 1000 * 60 * 1000; // 10 phút tính bằng mili giây

    function showMessage(msg, type) {
        if (messageDiv) {
            messageDiv.textContent = msg;
            messageDiv.className = `message ${type}`;
            messageDiv.style.display = msg ? 'block' : 'none';
        }
    }

    function updateHeaderUserInfo(fullName, userPhotoUrl, role) {
        if (headerUserNameElement) {
            if (fullName && role === 'CBCNV') { // Chỉ hiển thị nếu là CBCNV
                headerUserNameElement.textContent = `Chào, ${fullName}!`;
                headerUserNameElement.style.display = 'inline';
            } else {
                headerUserNameElement.textContent = ''; // Xóa tên nếu không phải CBCNV
                headerUserNameElement.style.display = 'none'; // Ẩn luôn
            }
        }

        if (headerUserAvatarElement) {
            if (userPhotoUrl && role === 'CBCNV') { // Chỉ hiển thị nếu là CBCNV
                headerUserAvatarElement.src = userPhotoUrl;
                headerUserAvatarElement.alt = `${fullName} Avatar`;
                if (headerUserAvatarLink) {
                    headerUserAvatarLink.style.display = 'block';
                }
            } else {
                headerUserAvatarElement.src = "https://via.placeholder.com/40"; // Ảnh placeholder nếu không phải CBCNV hoặc không có ảnh
                headerUserAvatarElement.alt = "User Avatar";
                if (headerUserAvatarLink) {
                    headerUserAvatarLink.style.display = 'block'; // Vẫn hiển thị link ảnh placeholder
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

    // Hàm mới để xử lý đăng xuất
    function handleLogout() {
        clearLocalStorageSession();
        alert('Bạn đã đăng xuất thành công!'); // Hoặc dùng showMessage
        window.location.href = '/sggd/gv/manage/'; // Chuyển hướng về trang đăng nhập
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
                // Kiểm tra vai trò ngay lập tức sau khi đăng nhập thành công
                if (data.user_data && data.user_data.role === 'CBCNV') {
                    showMessage(data.message || 'Đăng nhập thành công!', 'success');

                    clearLocalStorageSession();

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
                    // Chuyển hướng chỉ khi role là CBCNV
                    window.location.href = '/sggd/gv/manage/home_faculty/';
                } else {
                    // Nếu đăng nhập thành công nhưng không phải CBCNV
                    alert('Vui lòng đăng nhập bằng tài khoản CBCNV để truy cập khu vực này.');
                    showMessage('Đăng nhập thành công nhưng tài khoản không có quyền truy cập giảng viên/cán bộ. Vui lòng đăng nhập lại với tài khoản CBCNV.', 'error');
                    clearLocalStorageSession(); // Xóa session nếu không đúng role
                    // Không chuyển hướng, giữ người dùng ở trang đăng nhập
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

    // Biến cờ để tránh hiển thị nhiều alert cùng lúc
    let isSessionExpiredAlertShown = false;

    // Hàm kiểm tra và xử lý phiên hết hạn
    function checkFrontendSessionExpiry() {
        const timeLogin = localStorage.getItem('time_login');
        const authToken = localStorage.getItem('authToken');
        const userRole = localStorage.getItem('userRole');

        // Nếu người dùng đang ở trang đăng nhập, không cần kiểm tra phiên hết hạn
        const isLoginPage = window.location.pathname === '/sggd/gv/manage/' || window.location.pathname === '/sggd/gv/manage';

        if (!isLoginPage && (!timeLogin || !authToken || userRole !== 'CBCNV')) {
            console.log('%c[Phiên Đăng Nhập] Không có phiên, token hoặc role không đúng.', 'color: gray;');
            // Nếu đã hiển thị alert rồi thì không hiển thị nữa
            if (!isSessionExpiredAlertShown) {
                isSessionExpiredAlertShown = true; // Đặt cờ
                clearLocalStorageSession();
                alert('Phiên đăng nhập của bạn đã hết hạn hoặc bạn không có quyền truy cập. Vui lòng đăng nhập lại.');
                // Đảm bảo chuyển hướng ngay sau khi alert được đóng hoặc người dùng cố gắng bỏ qua
                setTimeout(() => {
                    window.location.href = '/sggd/gv/manage/';
                }, 100); // Độ trễ nhỏ để đảm bảo alert kịp hiển thị
            }
            return false;
        }

        if (isLoginPage) {
            // Nếu đang ở trang đăng nhập, reset cờ để cho phép alert khi rời khỏi trang này
            isSessionExpiredAlertShown = false; 
            return true; // Không kiểm tra hết hạn nếu đang ở trang login
        }

        const loginTimestamp = parseInt(timeLogin);
        const currentTime = Date.now();
        const elapsedTime = currentTime - loginTimestamp;

        const remainingTimeMs = SESSION_DURATION_MS - elapsedTime;

        if (remainingTimeMs <= 0) {
            // Phiên hết hạn
            if (!isSessionExpiredAlertShown) { // Chỉ hiển thị alert nếu chưa hiển thị
                isSessionExpiredAlertShown = true; // Đặt cờ
                clearLocalStorageSession();
                alert('Phiên đăng nhập của bạn đã hết hạn. Vui lòng đăng nhập lại.');
                // Bắt buộc chuyển hướng sau một khoảng thời gian ngắn
                setTimeout(() => {
                    window.location.href = '/sggd/gv/manage/';
                }, 100); 
            }
            return false;
        } else {
            const remainingMinutes = Math.floor(remainingTimeMs / (1000 * 60));
            const remainingSeconds = Math.floor((remainingTimeMs % (1000 * 60)) / 1000);
            // console.log(`[Phiên Đăng Nhập] Còn lại: ${remainingMinutes} phút ${remainingSeconds} giây.`); // Chỉ để debug
            isSessionExpiredAlertShown = false; // Reset cờ nếu phiên vẫn còn hạn
            return true;
        }
    }

    // Kiểm tra ngay khi DOM được tải (trừ trang đăng nhập)
    checkFrontendSessionExpiry();

    // Kiểm tra khi người dùng quay lại tab hoặc cửa sổ trình duyệt (focus)
    document.addEventListener('visibilitychange', function() {
        if (document.visibilityState === 'visible') {
            checkFrontendSessionExpiry();
        }
    });

    // Thêm kiểm tra định kỳ mỗi 5 giây
    setInterval(() => {
        checkFrontendSessionExpiry();
    }, 5000);

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

    // Gắn sự kiện click cho nút Đăng xuất
    const sidebarLogoutBtn = document.getElementById('sidebarLogoutBtn');
    if (sidebarLogoutBtn) {
        sidebarLogoutBtn.addEventListener('click', function(event) {
            event.preventDefault(); // Ngăn hành vi mặc định của thẻ 'a'
            handleLogout();
        });
    }

    const storedUserFullName = localStorage.getItem('userFullName');
    const storedUserPhoto = localStorage.getItem('userPhoto');
    const storedUserRole = localStorage.getItem('userRole');

    // Cần đảm bảo rằng `updateHeaderUserInfo` được gọi đúng cách khi tải trang
    // Dựa trên trạng thái phiên và vai trò
    if (localStorage.getItem('authToken') && localStorage.getItem('userRole') === 'CBCNV') {
        updateHeaderUserInfo(storedUserFullName, storedUserPhoto, storedUserRole);
    } else {
        // Nếu phiên không hợp lệ hoặc role không phải CBCNV, reset header
        updateHeaderUserInfo('', '', '');
    }
});
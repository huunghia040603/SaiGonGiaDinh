document.addEventListener('DOMContentLoaded', function() {
    // --- Lấy các phần tử DOM ---
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const loginBtn = document.getElementById('loginBtn');
    const messageDiv = document.getElementById('message'); // Dành cho các thông báo chung
    const errorMessageDisplay = document.getElementById('errorMessageDisplay'); // Dành cho thông báo lỗi cụ thể trên form

    const headerUserNameElement = document.getElementById('headerUserName');
    const headerUserAvatarElement = document.getElementById('headerUserAvatar');
    const headerUserAvatarLink = document.getElementById('headerUserAvatarLink');

    const togglePassword = document.querySelector('.toggle-password');

    const characterOrange = document.querySelector('.character-orange');
    const characterPurple = document.querySelector('.character-purple');
    const characterBlack = document.querySelector('.character-black');

    // --- Cấu hình API và thời gian phiên ---
    const loginApiUrl = 'https://saigongiadinh.pythonanywhere.com/auth/login/';
    const SESSION_DURATION_MS = 1000 * 60 * 10; // 10 phút tính bằng mili giây (đã sửa từ 1000 * 60 * 1000 để dễ test, bạn có thể chỉnh lại)

    // Lưu nội dung gốc của nút đăng nhập
    let originalButtonContent = loginBtn ? loginBtn.innerHTML : '<i class="fas fa-sign-in-alt"></i> Đăng Nhập';

    // --- Hàm hiển thị thông báo ---
    function showMessage(msg, type) {
        if (messageDiv) {
            messageDiv.textContent = msg;
            messageDiv.className = `message ${type}`;
            messageDiv.style.display = msg ? 'block' : 'none';
        }
    }

    function showErrorMessage(message) {
        if (errorMessageDisplay) {
            errorMessageDisplay.innerHTML = `<i class="fas fa-exclamation-circle"></i> ${message}`;
            errorMessageDisplay.style.display = 'flex';
            errorMessageDisplay.classList.add('fade-in');
        }
    }

    function clearErrorMessage() {
        if (errorMessageDisplay) {
            errorMessageDisplay.innerHTML = '';
            errorMessageDisplay.style.display = 'none';
            errorMessageDisplay.classList.remove('fade-in');
        }
    }

    // --- Cập nhật thông tin Header (Avatar và Tên) ---
    function updateHeaderUserInfo(fullName, userPhotoUrl, role) {
        // Cập nhật tên
        if (headerUserNameElement) {
            // Hiển thị tên nếu có và là CBCNV hoặc SINH_VIEN
            if (fullName && (role === 'CBCNV' || role === 'SINH_VIEN')) {
                headerUserNameElement.textContent = `Chào, ${fullName}!`;
                headerUserNameElement.style.display = 'inline';
            } else {
                headerUserNameElement.textContent = '';
                headerUserNameElement.style.display = 'none';
            }
        }

        // Cập nhật avatar
        if (headerUserAvatarElement) {
            // Hiển thị ảnh thật nếu có và là CBCNV/SINH_VIEN, ngược lại dùng placeholder
            const finalUserPhotoUrl = (userPhotoUrl && (role === 'CBCNV' || role === 'SINH_VIEN')) ? userPhotoUrl : "https://via.placeholder.com/40";
            headerUserAvatarElement.src = finalUserPhotoUrl;
            headerUserAvatarElement.alt = fullName ? `${fullName} Avatar` : "User Avatar";
            if (headerUserAvatarLink) {
                headerUserAvatarLink.style.display = 'block'; // Luôn hiển thị link avatar
            }
        }
    }

    // --- Quản lý Local Storage (Phiên đăng nhập) ---
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
            'time_login', 'sessionStartTime', // Bao gồm cả time_login và sessionStartTime
            'studentIdNumber', 'studentMajor', 'studentEnrollmentYear' // Các key riêng của sinh viên
        ];
        keysToRemove.forEach(key => localStorage.removeItem(key));
        console.log('Đã xóa dữ liệu Local Storage của phiên đăng nhập.');
    }

    // Hàm lưu thông tin người dùng vào localStorage từ phản hồi API chung
    function saveUserInfoToLocalStorage(data) {
        localStorage.setItem('time_login', Date.now().toString()); // Đồng bộ cả hai tên key
        localStorage.setItem('sessionStartTime', Date.now().toString()); // Đồng bộ cả hai tên key

        if (data.token) localStorage.setItem('authToken', data.token);
        if (data.user_id) localStorage.setItem('userId', data.user_id);
        if (data.email) localStorage.setItem('userEmail', data.email);
        if (data.role) localStorage.setItem('userRole', data.role);

        // Lưu dữ liệu chi tiết từ user_data
        const userData = data.user_data;
        if (userData) {
            localStorage.setItem('userEmail', userData.email || '');
            const userFullName = `${userData.last_name || ''} ${userData.first_name || ''}`.trim();
            localStorage.setItem('userFullName', userFullName);

            localStorage.setItem('userPhone', userData.phone || '');
            localStorage.setItem('userGender', userData.gender || '');
            localStorage.setItem('userGenderDisplay', userData.gender_display || ''); // Giả định có

            const fullAddress = [
                userData.address,
                userData.district, // Giả định có
                userData.city // Giả định có
            ].filter(Boolean).join(', ');
            localStorage.setItem('userAddress', fullAddress || '');

            localStorage.setItem('userRole', userData.role || '');
            localStorage.setItem('userRoleDisplay', userData.role_display || ''); // Giả định có

            localStorage.setItem('userIsActive', userData.is_active ? 'true' : 'false');
            localStorage.setItem('userDateJoined', userData.date_joined || '');
            localStorage.setItem('userLastLogin', userData.last_login || '');

            localStorage.setItem('userNationalIdCard', userData.national_id_card || ''); // Có thể là của sinh viên/cán bộ
            localStorage.setItem('userDateOfBirth', userData.date_of_birth || ''); // Có thể là của sinh viên/cán bộ
            localStorage.setItem('userPlaceOfBirth', userData.place_of_birth || ''); // Có thể là của sinh viên/cán bộ
            localStorage.setItem('userNationality', userData.nationality || ''); // Có thể là của sinh viên/cán bộ
            localStorage.setItem('userEnrollmentDate', userData.enrollment_date || ''); // Có thể là của sinh viên

            // Cụ thể cho sinh viên (nếu có các trường riêng biệt trong StudentProfileSerializer)
            if (userData.role === 'SINH_VIEN') {
                localStorage.setItem('studentIdNumber', userData.student_id_number || '');
                localStorage.setItem('studentMajor', userData.major || '');
                localStorage.setItem('studentEnrollmentYear', userData.enrollment_year || '');
                // ... thêm các trường khác của Student
            }

            // Cụ thể cho giảng viên/CBCNV (nếu có các trường riêng biệt trong FacultyDetailSerializer)
            if (userData.role === 'CBCNV') {
                localStorage.setItem('facultyCode', userData.faculty_code || '');
                localStorage.setItem('facultyType', userData.type || ''); // Nếu có trường 'type'
                localStorage.setItem('facultyDepartmentName', userData.department_name || '');
                localStorage.setItem('facultyPosition', userData.position || '');
                localStorage.setItem('facultyDegree', userData.degree || '');
                localStorage.setItem('facultyOfficeLocation', userData.office_location || '');
                localStorage.setItem('facultyIsDepartmentHead', userData.is_department_head ? 'true' : 'false');
            }

            // Ảnh đại diện (chung cho cả 2)
            localStorage.setItem('userPhoto', userData.user_photo || '');
        }
    }

    // Hàm xử lý đăng xuất
    function handleLogout() {
        clearLocalStorageSession();
        alert('Bạn đã đăng xuất thành công!'); // Hoặc dùng showMessage
        window.location.href = '/dangnhap'; // Chuyển hướng về trang đăng nhập
    }

    // --- Logic Đăng nhập chính ---
    async function handleLogin(event) {
        event.preventDefault();

        const email = emailInput.value.trim();
        const password = passwordInput.value.trim();

        clearErrorMessage(); // Xóa thông báo lỗi cũ
        showMessage('', ''); // Xóa thông báo chung cũ

        if (!email || !password) {
            showErrorMessage('Vui lòng nhập đầy đủ email và mật khẩu.');
            return;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            showErrorMessage('Email chưa hợp lệ, hãy kiểm tra lại nhé!');
            emailInput.focus();
            return;
        }

        if (password.length < 3) {
            showErrorMessage('Mật khẩu của bạn cần ít nhất 3 ký tự. Hãy thử lại!');
            passwordInput.focus();
            return;
        }

        if (loginBtn) {
            loginBtn.disabled = true;
            loginBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Đang đăng nhập...';
        }

        // Đặt trạng thái hạnh phúc cho các nhân vật khi bắt đầu đăng nhập
        if (characterPurple) characterPurple.classList.add('character-purple--happy');
        if (characterBlack) characterBlack.classList.add('character-black--happy');
        if (characterOrange) characterOrange.classList.add('character-orange--happy');

        const payload = {
            email: email,
            password: password
        };

        console.log('Attempting login with:', payload);

        try {
            const response = await fetch(loginApiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload)
            });

            const data = await response.json();

            if (response.ok) {
                console.log('Login successful:', data);
                showMessage(data.message || 'Đăng nhập thành công!', 'success');
                saveUserInfoToLocalStorage(data); // Lưu tất cả thông tin vào Local Storage

                // Chuyển hướng dựa trên vai trò
                if (data.role === 'CBCNV') {
                    setTimeout(() => {
                        window.location.href = '/gv/home_faculty/'; // Chuyển hướng tới trang giảng viên
                    }, 1000);
                } else if (data.role === 'SINH_VIEN') {
                    setTimeout(() => {
                        window.location.href = '/'; // Chuyển hướng về trang gốc cho sinh viên
                    }, 1000);
                } else {
                    // Xử lý các vai trò khác hoặc vai trò không xác định
                    showErrorMessage('Đăng nhập thành công nhưng tài khoản không có quyền truy cập cụ thể. Bạn sẽ được chuyển hướng về trang đăng nhập.');
                    setTimeout(() => {
                        window.location.href = '/dangnhap'; // Chuyển hướng mặc định
                    }, 2000);
                }

            } else {
                console.error(`Login failed (Status: ${response.status}):`, data);
                let displayMsg = 'Có vẻ email hoặc mật khẩu chưa đúng. Vui lòng thử lại!';
                if (data.detail) {
                    displayMsg = data.detail;
                } else if (data.message) { // Thêm trường message từ API
                    displayMsg = data.message;
                } else if (data.non_field_errors && data.non_field_errors.length > 0) {
                    displayMsg = data.non_field_errors.join(' ');
                } else if (data.email && data.email.length > 0) {
                    displayMsg = `Email: ${data.email.join(' ')}`;
                } else if (data.password && data.password.length > 0) {
                    displayMsg = `Mật khẩu: ${data.password.join(' ')}`;
                } else if (response.status === 401 || response.status === 403) {
                    displayMsg = 'Email hoặc mật khẩu không chính xác. Hãy kiểm tra lại nhé!';
                } else if (response.status === 405) {
                    displayMsg = 'Có lỗi máy chủ. Vui lòng liên hệ quản trị viên.';
                }
                showErrorMessage(displayMsg);

                // Đặt lại trạng thái nhân vật khi đăng nhập thất bại
                if (characterPurple) characterPurple.classList.remove('character-purple--happy');
                if (characterBlack) characterBlack.classList.remove('character-black--happy');
                if (characterOrange) characterOrange.classList.remove('character-orange--happy');
            }

        } catch (error) {
            console.error('Lỗi khi gửi yêu cầu đăng nhập:', error);
            if (error.response) {
                const statusCode = error.response.status;
                const errorData = error.response.data;
                console.error(`Login failed (Status: ${statusCode}):`, errorData);

                let displayMsg = 'Đã có lỗi xảy ra. Vui lòng thử lại!';
                if (errorData.message) {
                    displayMsg = errorData.message;
                } else if (errorData.detail) {
                    displayMsg = errorData.detail;
                } else if (errorData.non_field_errors && errorData.non_field_errors.length > 0) {
                    displayMsg = errorData.non_field_errors.join(' ');
                } else if (errorData.email && errorData.email.length > 0) {
                    displayMsg = `Email: ${errorData.email.join(' ')}`;
                } else if (errorData.password && errorData.password.length > 0) {
                    displayMsg = `Mật khẩu: ${errorData.password.join(' ')}`;
                } else if (statusCode === 401 || statusCode === 403) {
                    displayMsg = 'Thông tin đăng nhập không hợp lệ. Vui lòng kiểm tra lại!';
                } else if (statusCode === 405) {
                    displayMsg = 'Có lỗi cấu hình máy chủ. Vui lòng liên hệ hỗ trợ!';
                }
                showErrorMessage(displayMsg);

            } else if (error.request) {
                console.error('No response received from server:', error.request);
                showErrorMessage('Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối mạng của bạn!');
            } else {
                console.error('Error setting up login request:', error.message);
                showErrorMessage('Đã xảy ra lỗi hệ thống. Vui lòng thử lại!');
            }

            // Đặt lại trạng thái nhân vật khi có lỗi
            if (characterPurple) characterPurple.classList.remove('character-purple--happy');
            if (characterBlack) characterBlack.classList.remove('character-black--happy');
            if (characterOrange) characterOrange.classList.remove('character-orange--happy');

        } finally {
            if (loginBtn) {
                loginBtn.disabled = false;
                loginBtn.innerHTML = originalButtonContent;
            }
        }
    }

    // --- Logic kiểm tra phiên hết hạn trên client ---
    let isSessionExpiredAlertShown = false; // Biến cờ để tránh hiển thị nhiều alert cùng lúc

    function checkFrontendSessionExpiry() {
        const timeLogin = localStorage.getItem('time_login');
        const authToken = localStorage.getItem('authToken');
        const userRole = localStorage.getItem('userRole');

        // Lấy đường dẫn hiện tại của trang
        const currentPathname = window.location.pathname;

        // Định nghĩa các đường dẫn là trang đăng nhập (bao gồm cả '/dangnhap' và trang gốc '/')
        const isLoginPageOrRoot = currentPathname === '/dangnhap' || currentPathname === '/login/' || currentPathname === '/' || currentPathname === '/gv/home_faculty/';

        // 1. Nếu người dùng đang ở trang đăng nhập hoặc trang gốc, KHÔNG cần kiểm tra phiên hết hạn
        if (isLoginPageOrRoot) {
            isSessionExpiredAlertShown = false; // Đặt lại cờ nếu đang ở trang đăng nhập hoặc trang gốc
            return true; // Không cần làm gì thêm trên các trang này
        }

        // 2. Nếu không có token hoặc time_login hoặc role không hợp lệ, thì coi như chưa đăng nhập hoặc phiên không hợp lệ.
        // Chỉ xử lý nếu không phải trang đăng nhập hoặc trang gốc.
        if (!timeLogin || !authToken || (userRole !== 'CBCNV' && userRole !== 'SINH_VIEN')) {
            console.log('%c[Phiên Đăng Nhập] Không có phiên, token hoặc role không đúng. Đã xóa session.', 'color: gray;');
            // Chỉ hiển thị alert nếu chưa từng hiển thị và không phải trang đăng nhập/gốc
            if (!isSessionExpiredAlertShown) {
    isSessionExpiredAlertShown = true; // Đặt cờ để tránh alert lặp lại
    clearLocalStorageSession();
    alert('Phiên đăng nhập của bạn đã hết hạn hoặc bạn không có quyền truy cập. Vui lòng đăng nhập lại.');
    
    // **Thay đổi quan trọng ở đây:** Chuyển hướng ngay lập tức sau khi alert đóng
    window.location.href = '/dangnhap'; 
}
            return false;
        }

        // 3. Nếu đã có token và time_login và không phải trang đăng nhập/gốc, tiến hành kiểm tra thời gian
        const loginTimestamp = parseInt(timeLogin);
        const currentTime = Date.now();
        const elapsedTime = currentTime - loginTimestamp;
        const remainingTimeMs = SESSION_DURATION_MS - elapsedTime;

        if (remainingTimeMs <= 0) {
            // Phiên hết hạn
            if (!isSessionExpiredAlertShown) {
    isSessionExpiredAlertShown = true; // Đặt cờ để tránh alert lặp lại
    clearLocalStorageSession();
    alert('Phiên đăng nhập của bạn đã hết hạn hoặc bạn không có quyền truy cập. Vui lòng đăng nhập lại.');
    
    // **Thay đổi quan trọng ở đây:** Chuyển hướng ngay lập tức sau khi alert đóng
    window.location.href = '/dangnhap'; 
}
            return false;
        } else {
            const remainingMinutes = Math.floor(remainingTimeMs / (1000 * 60));
            const remainingSeconds = Math.floor((remainingTimeMs % (1000 * 60)) / 1000);
            console.log(`%c[Phiên Đăng Nhập] Còn lại: ${remainingMinutes} phút ${remainingSeconds} giây.`, 'color: green;');
            isSessionExpiredAlertShown = false; // Reset cờ nếu phiên còn hiệu lực
            return true;
        }
    }

    // --- Gắn sự kiện ---
    // Gắn sự kiện click cho nút đăng nhập
    if (loginBtn) {
        loginBtn.addEventListener('click', handleLogin);
    }

    // Gắn sự kiện Enter cho các trường input
    if (emailInput) {
        emailInput.addEventListener('keypress', function(event) {
            if (event.key === 'Enter') {
                handleLogin(event);
            }
        });
        emailInput.addEventListener('input', clearErrorMessage);
    }
    if (passwordInput) {
        passwordInput.addEventListener('keypress', function(event) {
            if (event.key === 'Enter') {
                handleLogin(event);
            }
        });
        passwordInput.addEventListener('input', clearErrorMessage);
    }

    // Gắn sự kiện toggle password
    if (togglePassword && passwordInput) {
        togglePassword.addEventListener('click', () => {
            const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
            passwordInput.setAttribute('type', type);
            const eyeOpen = togglePassword.querySelector('.eye-open');
            const eyeClosed = togglePassword.querySelector('.eye-closed');
            if (eyeOpen && eyeClosed) {
                if (type === 'password') {
                    eyeOpen.style.display = 'block';
                    eyeClosed.style.display = 'none';
                } else {
                    eyeOpen.style.display = 'none';
                    eyeClosed.style.display = 'block';
                }
            }
        });
    }

    // Gắn sự kiện mousemove cho chuyển động mắt của nhân vật
    document.addEventListener('mousemove', (e) => {
        const eyes = document.querySelectorAll('.eye');
        eyes.forEach(eye => {
            const character = eye.closest('.character');
            if (!character) return;
            const characterRect = character.getBoundingClientRect();
            const characterCenterX = characterRect.left + characterRect.width / 2;
            const characterCenterY = characterRect.top + characterRect.height / 2;
            const deltaX = e.clientX - characterCenterX;
            const deltaY = e.clientY - characterCenterY;
            const angle = Math.atan2(deltaY, deltaX);
            const maxMovement = 3;
            const eyeX = Math.cos(angle) * maxMovement;
            const eyeY = Math.sin(angle) * maxMovement;
            eye.style.transform = `translate(${eyeX}px, ${eyeY}px)`;
        });
    });

    // Gắn sự kiện hover cho nút login để thay đổi trạng thái nhân vật
    if (loginBtn) {
        [characterOrange, characterPurple, characterBlack].forEach(char => {
            if (char) {
                loginBtn.addEventListener('mouseenter', () => { char.classList.add(`${char.classList[1]}--happy`); });
                loginBtn.addEventListener('mouseleave', () => { char.classList.remove(`${char.classList[1]}--happy`); });
            }
        });
    }

    // Gắn sự kiện click cho nút Đăng xuất (sidebarLogoutBtn)
    const sidebarLogoutBtn = document.getElementById('sidebarLogoutBtn');
    if (sidebarLogoutBtn) {
        sidebarLogoutBtn.addEventListener('click', function(event) {
            event.preventDefault(); // Ngăn hành vi mặc định của thẻ 'a'
            handleLogout();
        });
    }

    // --- Khởi tạo và kiểm tra khi tải trang ---
    clearErrorMessage();
    if (emailInput) { emailInput.value = ''; }
    if (passwordInput) { passwordInput.value = ''; }

    // Chỉ gọi checkFrontendSessionExpiry nếu người dùng KHÔNG ở trang đăng nhập hoặc trang gốc
    const currentPathname = window.location.pathname;
    const isLoginPageOrRootOnLoad = currentPathname === '/dangnhap' || currentPathname === '/login/' || currentPathname === '/' || currentPathname === '/gv/home_faculty/';

    if (!isLoginPageOrRootOnLoad) {
        // Nếu không phải các trang này, ta sẽ kiểm tra xem có token và vai trò hợp lệ không
        const authToken = localStorage.getItem('authToken');
        const userRole = localStorage.getItem('userRole');

        if (authToken && (userRole === 'CBCNV' || userRole === 'SINH_VIEN')) {
            // Nếu có token và vai trò hợp lệ, tiến hành kiểm tra phiên
            checkFrontendSessionExpiry();
            // Thiết lập kiểm tra định kỳ
            setInterval(() => {
                checkFrontendSessionExpiry();
            }, 5000); // Mỗi 5 giây
        } else {
            // Nếu không có token hoặc vai trò không hợp lệ, và không ở trang đăng nhập/gốc, thì coi như chưa đăng nhập
            // và chuyển hướng về trang đăng nhập
            console.log('%c[Khởi tạo] Không có phiên đăng nhập hợp lệ. Chuyển hướng về trang đăng nhập.', 'color: red;');
            clearLocalStorageSession(); // Đảm bảo clear session cũ nếu có
            alert('Bạn cần đăng nhập để truy cập trang này.');
            window.location.href = '/dangnhap'; // Chuyển hướng về trang đăng nhập chính (/dangnhap)
        }
    } else {
        // Nếu đang ở trang đăng nhập hoặc trang gốc, không cần alert hay chuyển hướng ngay lập tức
        console.log('%c[Khởi tạo] Đang ở trang đăng nhập hoặc trang gốc. Không kiểm tra phiên.', 'color: blue;');
    }


    // Kiểm tra khi người dùng quay lại tab hoặc cửa sổ trình duyệt (focus)
    document.addEventListener('visibilitychange', function() {
        if (document.visibilityState === 'visible') {
            const currentPathname = window.location.pathname;
            const isLoginPageOrRootOnFocus = currentPathname === '/dangnhap' || currentPathname === '/login/' || currentPathname === '/' || currentPathname === '/gv/home_faculty/';

            if (!isLoginPageOrRootOnFocus) { // Chỉ kiểm tra khi không ở trang đăng nhập/gốc
                checkFrontendSessionExpiry();
            }
        }
    });


    // Cập nhật thông tin header khi tải trang, dựa trên session hiện có
    const storedUserFullName = localStorage.getItem('userFullName');
    const storedUserPhoto = localStorage.getItem('userPhoto');
    const storedUserRole = localStorage.getItem('userRole');

    if (localStorage.getItem('authToken') && (storedUserRole === 'CBCNV' || storedUserRole === 'SINH_VIEN')) {
        updateHeaderUserInfo(storedUserFullName, storedUserPhoto, storedUserRole);
    } else {
        // Nếu phiên không hợp lệ hoặc không có vai trò phù hợp, reset header
        updateHeaderUserInfo('', '', '');
    }
});
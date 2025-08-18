document.addEventListener('DOMContentLoaded', function() {
    // --- Lấy các phần tử DOM ---
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const loginBtn = document.getElementById('loginBtn');
    const messageDiv = document.getElementById('message'); // Dành cho các thông báo chung
    const errorMessageDisplay = document.getElementById('errorMessageDisplay'); // Dành cho thông báo lỗi cụ thể trên form

    // CÁC BIẾN NÀY LIÊN QUAN ĐẾN SIDEBAR HOẶC HEADER CỦA CÁC TRANG KHÁC
    const sidebarUserNameElement = document.getElementById('sidebarUserName');
    const sidebarUserAvatarElement = document.getElementById('sidebarUserAvatar');
    const sidebarUserInfoDiv = document.querySelector('.sidebar-user-info');

    const togglePassword = document.querySelector('.toggle-password');

    const characterOrange = document.querySelector('.character-orange');
    const characterPurple = document.querySelector('.character-purple');
    const characterBlack = document.querySelector('.character-black');

    // --- Cấu hình API và thời gian phiên ---
    const loginApiUrl = 'https://saigongiadinh.pythonanywhere.com/auth/login/'; // Cập nhật API của bạn
    const SESSION_DURATION_MS = 10000 * 60 * 10; // 10 phút tính bằng mili giây
// const SESSION_DURATION_MS = 1000 * 60 * 10;
    // Lưu nội dung gốc của nút đăng nhập
    let originalButtonContent = loginBtn ? loginBtn.innerHTML : '<i class="fas fa-sign-in-alt"></i> Đăng Nhập';

    // Hàm kiểm tra phiên đăng nhập hiện tại
    function isAuthenticated() {
        const authToken = localStorage.getItem('authToken');
        const userRole = localStorage.getItem('userRole');
        return authToken && (userRole === 'CBCNV' || userRole === 'SINH_VIEN');
    }

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
            const loginContainer = document.querySelector('.login-container');
            if (loginContainer) {
                loginContainer.classList.add('shaking');
                loginContainer.addEventListener('animationend', () => {
                    loginContainer.classList.remove('shaking');
                }, { once: true });
            }
        }
    }

    function clearErrorMessage() {
        if (errorMessageDisplay) {
            errorMessageDisplay.innerHTML = '';
            errorMessageDisplay.style.display = 'none';
            errorMessageDisplay.classList.remove('fade-in');
        }
    }

    // --- Cập nhật thông tin User Info trong Sidebar (Avatar và Tên) ---
    function updateSidebarUserInfo(fullName, userPhotoUrl, role, hide = false) {
        if (sidebarUserInfoDiv) {
            if (hide || !fullName || (role !== 'CBCNV' && role !== 'SINH_VIEN')) {
                sidebarUserInfoDiv.style.display = 'none';
                return;
            }
            sidebarUserInfoDiv.style.display = 'flex';

            if (sidebarUserNameElement) {
                sidebarUserNameElement.textContent = fullName;
                sidebarUserNameElement.style.display = 'inline';
            }

            if (sidebarUserAvatarElement) {
                const finalUserPhotoUrl = userPhotoUrl || "/static/images/default_avatar.png";
                sidebarUserAvatarElement.src = finalUserPhotoUrl;
                sidebarUserAvatarElement.alt = fullName ? `${fullName} Avatar` : "User Avatar";
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
            'time_login', 'sessionStartTime',
            'studentIdNumber', 'studentMajor', 'studentEnrollmentYear'
        ];
        keysToRemove.forEach(key => localStorage.removeItem(key));
      
        updateSidebarUserInfo('', '', '', true);
    }

    // Hàm lưu thông tin người dùng vào localStorage từ phản hồi API chung
    function saveUserInfoToLocalStorage(data) {
        localStorage.setItem('time_login', Date.now().toString());
        localStorage.setItem('sessionStartTime', Date.now().toString());

        if (data.token) {
            localStorage.setItem('authToken', data.token);
            // THÊM DÒNG NÀY ĐỂ LOG TOKEN RA CONSOLE
            
        }
        if (data.user_id) localStorage.setItem('userId', data.user_id);
        if (data.email) localStorage.setItem('userEmail', data.email);
        if (data.role) localStorage.setItem('userRole', data.role);

        const userData = data.user_data;
        if (userData) {
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

            if (userData.role === 'SINH_VIEN') {
                localStorage.setItem('studentIdNumber', userData.student_id_number || '');
                localStorage.setItem('studentMajor', userData.major || '');
                localStorage.setItem('studentEnrollmentYear', userData.enrollment_year || '');
            }

            if (userData.role === 'CBCNV') {
                localStorage.setItem('facultyCode', userData.faculty_code || '');
                localStorage.setItem('facultyType', userData.type || '');
                localStorage.setItem('facultyDepartmentName', userData.department_name || '');
                localStorage.setItem('facultyPosition', userData.position || '');
                localStorage.setItem('facultyDegree', userData.degree || '');
                localStorage.setItem('facultyOfficeLocation', userData.office_location || '');
                localStorage.setItem('facultyIsDepartmentHead', userData.is_department_head ? 'true' : 'false');
            }

            localStorage.setItem('userPhoto', userData.user_photo || '');
        }
        
    }

    // Hàm xử lý đăng xuất
    function handleLogout() {
        clearLocalStorageSession();
          setTimeout(() => {
                        alert('Bạn đã đăng xuất thành công!');
                    }, 500); 
        window.location.href = '/dangnhap';
    }

    // --- Logic Đăng nhập chính ---
    async function handleLogin(event) {
        event.preventDefault();

        const email = emailInput.value.trim();
        const password = passwordInput.value.trim();

        // --- Console Log: Dữ liệu đầu vào ---
        
        clearErrorMessage();
        showMessage('', '');

        if (!email || !password) {
            showErrorMessage('Vui lòng nhập đầy đủ email và mật khẩu.');
            console.warn('[Login Process] Lỗi: Email hoặc mật khẩu trống.');
            return;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            showErrorMessage('Email chưa hợp lệ, hãy kiểm tra lại nhé!');
            emailInput.focus();
            console.warn('[Login Process] Lỗi: Định dạng email không hợp lệ.');
            return;
        }

        if (password.length < 3) {
            showErrorMessage('Mật khẩu của bạn cần ít nhất 3 ký tự. Hãy thử lại!');
            passwordInput.focus();
            console.warn('[Login Process] Lỗi: Mật khẩu quá ngắn.');
            return;
        }

        if (loginBtn) {
            loginBtn.disabled = true;
            loginBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Đang đăng nhập...';
        }

        if (characterPurple) characterPurple.classList.add('character-purple--happy');
        if (characterBlack) characterBlack.classList.add('character-black--happy');
        if (characterOrange) characterOrange.classList.add('character-orange--happy');

        const payload = {
            email: email,
            password: password
        };

        // --- Console Log: Payload và Headers gửi đi ---
       
        const requestHeaders = {
            'Content-Type': 'application/json',
        };
        try {
            const response = await fetch(loginApiUrl, {
                method: 'POST',
                headers: requestHeaders, // Sử dụng headers đã định nghĩa
                body: JSON.stringify(payload)
            });

            const data = await response.json();

           if (response.ok) {
                console.log('Thành công!');

                showMessage(data.message || 'Đăng nhập thành công!', 'success');
                saveUserInfoToLocalStorage(data); // Lưu tất cả thông tin vào Local Storage

                // Gọi hàm ghi nhận lượt truy cập sau khi đăng nhập thành công
                // Đảm bảo user_visit_web.js đã được tải trước dangnhap.js
                if (typeof window.sendUserVisit === 'function') {
                    window.sendUserVisit(); 
                } else {
                    console.warn('[UserVisit] Hàm sendUserVisit không tồn tại. Đảm bảo user_visit_web.js được tải trước.');
                }

                const userFullName = localStorage.getItem('userFullName');
                const userPhoto = localStorage.getItem('userPhoto');
                const userRole = localStorage.getItem('userRole');
                updateSidebarUserInfo(userFullName, userPhoto, userRole);

                if (data.role === 'CBCNV') {
                    console.log('Giảng viên...');
                    setTimeout(() => {
                        window.location.href = '/gv/home_faculty/';
                    }, 500); 
                } else if (data.role === 'SINH_VIEN') {
                    console.log('Sinh viên...');
                    setTimeout(() => {
                        window.location.href = '/';
                    }, 500);
                } else {
                    console.warn('[Login Process] Vai trò người dùng không xác định. Chuyển hướng về trang đăng nhập.');
                    showErrorMessage('Đăng nhập thành công nhưng tài khoản không có quyền truy cập cụ thể. Bạn sẽ được chuyển hướng về trang đăng nhập.');
                    clearLocalStorageSession();
                    setTimeout(() => {
                        window.location.href = '/dangnhap';
                    }, 1500);
                }

            } else {
                // --- Console Log: Phản hồi lỗi từ API ---
                console.error('%c[Login API Call] LỖI khi đăng nhập! Phản hồi từ API:', 'color: red; font-weight: bold;', response.status, response.statusText, data);

                let displayMsg = 'Có vẻ email hoặc mật khẩu chưa đúng. Vui lòng thử lại!';
                if (data.detail) {
                    displayMsg = data.detail;
                } else if (data.message) {
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

                if (characterPurple) characterPurple.classList.remove('character-purple--happy');
                if (characterBlack) characterBlack.classList.remove('character-black--happy');
                if (characterOrange) characterOrange.classList.remove('character-orange--happy');
            }

        } catch (error) {
            // --- Console Log: Lỗi mạng hoặc lỗi khác ---
            console.error('%c[Login API Call] LỖI MẠNG hoặc lỗi khác khi gửi yêu cầu đăng nhập:', 'color: red; font-weight: bold;', error);

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
    let isSessionExpiredAlertShown = false;

    function checkFrontendSessionExpiry() {
        const timeLogin = localStorage.getItem('time_login');
        const authToken = localStorage.getItem('authToken');
        const userRole = localStorage.getItem('userRole');

        const currentPathname = window.location.pathname;
        const isLoginPage = currentPathname === '/dangnhap' || currentPathname === '/login/';

        if (isLoginPage) {
            isSessionExpiredAlertShown = false;
            return true;
        }

        if (!timeLogin || !authToken || (userRole !== 'CBCNV' && userRole !== 'SINH_VIEN')) {
            if (!isSessionExpiredAlertShown) {
                isSessionExpiredAlertShown = true;
                console.warn('%c[Session Check] Phiên không hợp lệ hoặc thiếu thông tin. Đang xóa session và chuyển hướng.', 'color: darkred; font-weight: bold;');
                clearLocalStorageSession();
                alert('Phiên đăng nhập của bạn đã hết hạn hoặc bạn không có quyền truy cập. Vui lòng đăng nhập lại.');
                window.location.href = '/dangnhap';
            }
            return false;
        }

        const loginTimestamp = parseInt(timeLogin);
        const currentTime = Date.now();
        const elapsedTime = currentTime - loginTimestamp;
        const remainingTimeMs = SESSION_DURATION_MS - elapsedTime;

        if (remainingTimeMs <= 0) {
            if (!isSessionExpiredAlertShown) {
                isSessionExpiredAlertShown = true;
                console.warn('%c[Session Check] Phiên đã hết hạn. Đang xóa session và chuyển hướng.', 'color: darkred; font-weight: bold;');
                clearLocalStorageSession();
                alert('Phiên đăng nhập của bạn đã hết hạn hoặc bạn không có quyền truy cập. Vui lòng đăng nhập lại.');
                window.location.href = '/dangnhap';
            }
            return false;
        } else {
            const remainingMinutes = Math.floor(remainingTimeMs / (1000 * 60));
            const remainingSeconds = Math.floor((remainingTimeMs % (1000 * 60)) / 1000);
   
            isSessionExpiredAlertShown = false;
            return true;
        }
    }

    // --- Gắn sự kiện ---
    if (loginBtn) {
        loginBtn.addEventListener('click', handleLogin);
    }

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

    // Toggle hiển thị mật khẩu
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

    // Hiệu ứng mắt của nhân vật theo chuột
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

    // Hiệu ứng nhân vật vui vẻ khi hover nút đăng nhập
    if (loginBtn) {
        [characterOrange, characterPurple, characterBlack].forEach(char => {
            if (char) {
                loginBtn.addEventListener('mouseenter', () => { char.classList.add(`${char.classList[1]}--happy`); });
                loginBtn.addEventListener('mouseleave', () => { char.classList.remove(`${char.classList[1]}--happy`); });
            }
        });
    }

    // Xử lý nút Đăng xuất (Nếu có trên trang khác, không phải trang login này)
    const sidebarLogoutBtn = document.getElementById('sidebarLogoutBtn');
    if (sidebarLogoutBtn) {
        sidebarLogoutBtn.addEventListener('click', function(event) {
            event.preventDefault();
            handleLogout();
        });
    }

    // --- Khởi tạo và kiểm tra khi tải trang ---
    clearErrorMessage();
    if (emailInput) { emailInput.value = ''; }
    if (passwordInput) { passwordInput.value = ''; }

    const currentPathname = window.location.pathname;
    const isLoginPage = currentPathname === '/dangnhap' || currentPathname === '/login/';

    // **Logic chính để ngăn nút Back khi đã đăng nhập**
    if (isLoginPage && isAuthenticated()) {
        const userRole = localStorage.getItem('userRole');
        let redirectPath = '/';
        if (userRole === 'CBCNV') {
            redirectPath = '/gv/home_faculty/';
        }
     
        window.location.replace(redirectPath);
        return;
    }

    // Logic kiểm tra phiên cho CÁC TRANG KHÔNG PHẢI TRANG ĐĂNG NHẬP
    if (!isLoginPage) {
        if (isAuthenticated()) {
          
            checkFrontendSessionExpiry();
            setInterval(() => {
                checkFrontendSessionExpiry();
            }, 5000);
        } else {
          
            clearLocalStorageSession();
            alert('Bạn cần đăng nhập để truy cập trang này.');
            window.location.href = '/dangnhap';
        }
    } else {
        console.log('Đang ở đăng nhập', 'color: blue;');
    }

    // Kiểm tra lại phiên khi tab trình duyệt được focus trở lại
    document.addEventListener('visibilitychange', function() {
        if (document.visibilityState === 'visible') {
            const currentPathnameOnFocus = window.location.pathname;
            if (!(currentPathnameOnFocus === '/dangnhap' || currentPathnameOnFocus === '/login/')) {
                checkFrontendSessionExpiry();
            }
        }
    });

    const storedUserFullName = localStorage.getItem('userFullName');
    const storedUserPhoto = localStorage.getItem('userPhoto');
    const storedUserRole = localStorage.getItem('userRole');

    if (isAuthenticated()) {
        updateSidebarUserInfo(storedUserFullName, storedUserPhoto, storedUserRole);
    } else {
        updateSidebarUserInfo('', '', '', true);
    }

    // Bổ sung các hàm xử lý UX mobile từ script nội tuyến
    const inputs = document.querySelectorAll('input');
    inputs.forEach(input => {
        input.addEventListener('dblclick', function() {
            this.value = '';
        });
        input.addEventListener('focus', function() {
            setTimeout(() => {
                this.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }, 300);
        });
    });

    window.addEventListener('orientationchange', function() {
        window.scrollTo(0, 0);
        document.activeElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
    });
});
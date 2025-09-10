// dangnhap.js
document.addEventListener('DOMContentLoaded', function() {
    // --- Lấy các phần tử DOM ---
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const loginBtn = document.getElementById('loginBtn');
    const messageDiv = document.getElementById('message');
    const errorMessageDisplay = document.getElementById('errorMessageDisplay');

    // Các biến này liên quan đến các trang khác, nhưng cần để xử lý logic chuyển hướng và hiển thị
    const sidebarUserNameElement = document.getElementById('sidebarUserName');
    const sidebarUserAvatarElement = document.getElementById('sidebarUserAvatar');
    const sidebarUserInfoDiv = document.querySelector('.sidebar-user-info');
    const sidebarLogoutBtn = document.getElementById('sidebarLogoutBtn');

    const togglePassword = document.querySelector('.toggle-password');
    const characterOrange = document.querySelector('.character-orange');
    const characterPurple = document.querySelector('.character-purple');
    const characterBlack = document.querySelector('.character-black');

    let originalButtonContent = loginBtn ? loginBtn.innerHTML : '<i class="fas fa-sign-in-alt"></i> Đăng Nhập';
    let isSessionExpiredAlertShown = false;

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

    // --- Cập nhật thông tin User Info trong Sidebar ---
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

    // --- Logic Đăng nhập chính ---
    async function handleLogin(event) {
        event.preventDefault();

        const email = emailInput.value.trim();
        const password = passwordInput.value.trim();

        clearErrorMessage();
        showMessage('', '');

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

        if (characterPurple) characterPurple.classList.add('character-purple--happy');
        if (characterBlack) characterBlack.classList.add('character-black--happy');
        if (characterOrange) characterOrange.classList.add('character-orange--happy');

        const loginApiUrl = 'https://saigongiadinh.pythonanywhere.com/auth/login/';
        const payload = { email: email, password: password };

        try {
            const response = await fetch(loginApiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            const data = await response.json();

            if (response.ok) {
                showMessage(data.message || 'Đăng nhập thành công!', 'success');
                window.Auth.saveSession(data); // Sử dụng hàm từ auth.js

                if (typeof window.sendUserVisit === 'function') {
                    window.sendUserVisit();
                }

                const userInfo = window.Auth.getUserInfo();
                updateSidebarUserInfo(userInfo.userFullName, userInfo.userPhoto, userInfo.userRole);

                if (data.role === 'CBCNV') {
                    setTimeout(() => window.location.href = '/gv/home_faculty/', 500);
                } else if (data.role === 'SINH_VIEN') {
                    setTimeout(() => window.location.href = '/', 500);
                } else {
                    showErrorMessage('Đăng nhập thành công nhưng tài khoản không có quyền truy cập cụ thể. Bạn sẽ được chuyển hướng về trang đăng nhập.');
                    window.Auth.clearSession(); // Sử dụng hàm từ auth.js
                    setTimeout(() => window.location.href = '/dangnhap', 1500);
                }

            } else {
                let displayMsg = 'Có vẻ email hoặc mật khẩu chưa đúng. Vui lòng thử lại!';
                if (data.detail) { displayMsg = data.detail; }
                else if (data.message) { displayMsg = data.message; }
                else if (response.status === 401 || response.status === 403) { displayMsg = 'Email hoặc mật khẩu không chính xác. Hãy kiểm tra lại nhé!'; }
                showErrorMessage(displayMsg);
            }

        } catch (error) {
            showErrorMessage('Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối mạng của bạn!');
        } finally {
            if (loginBtn) {
                loginBtn.disabled = false;
                loginBtn.innerHTML = originalButtonContent;
            }
            if (characterPurple) characterPurple.classList.remove('character-purple--happy');
            if (characterBlack) characterBlack.classList.remove('character-black--happy');
            if (characterOrange) characterOrange.classList.remove('character-orange--happy');
        }
    }

    // --- Logic kiểm tra phiên trên client ---
    function checkFrontendSessionExpiry() {
        const isLoginPage = window.location.pathname.includes('/dangnhap') || window.location.pathname.includes('/login');

        if (isLoginPage) {
            isSessionExpiredAlertShown = false;
            return;
        }

        if (!window.Auth.isAuthenticated()) {
            if (!isSessionExpiredAlertShown) {
                isSessionExpiredAlertShown = true;
                alert('Phiên đăng nhập của bạn đã hết hạn. Vui lòng đăng nhập lại.');
                window.location.href = '/dangnhap';
            }
        } else {
            isSessionExpiredAlertShown = false;
        }
    }

    // --- Gắn sự kiện ---
    if (loginBtn) {
        loginBtn.addEventListener('click', handleLogin);
    }
    if (emailInput) {
        emailInput.addEventListener('keypress', function(event) { if (event.key === 'Enter') handleLogin(event); });
        emailInput.addEventListener('input', clearErrorMessage);
    }
    if (passwordInput) {
        passwordInput.addEventListener('keypress', function(event) { if (event.key === 'Enter') handleLogin(event); });
        passwordInput.addEventListener('input', clearErrorMessage);
    }
    if (togglePassword && passwordInput) {
        togglePassword.addEventListener('click', () => {
            const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
            passwordInput.setAttribute('type', type);
            const eyeOpen = togglePassword.querySelector('.eye-open');
            const eyeClosed = togglePassword.querySelector('.eye-closed');
            if (eyeOpen && eyeClosed) {
                eyeOpen.style.display = (type === 'password') ? 'block' : 'none';
                eyeClosed.style.display = (type === 'password') ? 'none' : 'block';
            }
        });
    }
    if (loginBtn) {
        [characterOrange, characterPurple, characterBlack].forEach(char => {
            if (char) {
                loginBtn.addEventListener('mouseenter', () => { char.classList.add(`${char.classList[1]}--happy`); });
                loginBtn.addEventListener('mouseleave', () => { char.classList.remove(`${char.classList[1]}--happy`); });
            }
        });
    }
    if (sidebarLogoutBtn) {
        sidebarLogoutBtn.addEventListener('click', function(event) {
            event.preventDefault();
            window.Auth.clearSession();
            setTimeout(() => {
                alert('Bạn đã đăng xuất thành công!');
                window.location.href = '/dangnhap';
            }, 500);
        });
    }
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

    // --- Khởi tạo và kiểm tra khi tải trang ---
    clearErrorMessage();
    if (emailInput) { emailInput.value = ''; }
    if (passwordInput) { passwordInput.value = ''; }

    const isLoginPage = window.location.pathname.includes('/dangnhap') || window.location.pathname.includes('/login');

    if (isLoginPage && window.Auth.isAuthenticated()) {
        const userRole = window.Auth.getUserInfo().userRole;
        let redirectPath = '/';
        if (userRole === 'CBCNV') {
            redirectPath = '/gv/home_faculty/';
        }
        window.location.replace(redirectPath);
    } else if (!isLoginPage) {
        if (window.Auth.isAuthenticated()) {
            checkFrontendSessionExpiry();
            setInterval(checkFrontendSessionExpiry, 5000); // Kiểm tra mỗi 5 giây
        } else {
            window.Auth.clearSession();
            alert('Bạn cần đăng nhập để truy cập trang này.');
            window.location.href = '/dangnhap';
        }
    }

    // Cập nhật UI sidebar khi tải trang
    if (window.Auth.isAuthenticated()) {
        const userInfo = window.Auth.getUserInfo();
        updateSidebarUserInfo(userInfo.userFullName, userInfo.userPhoto, userInfo.userRole);
    } else {
        updateSidebarUserInfo('', '', '', true);
    }

    // Bổ sung các hàm xử lý UX mobile
    const inputs = document.querySelectorAll('input');
    inputs.forEach(input => {
        input.addEventListener('dblclick', function() { this.value = ''; });
        input.addEventListener('focus', function() {
            setTimeout(() => { this.scrollIntoView({ behavior: 'smooth', block: 'center' }); }, 300);
        });
    });

    window.addEventListener('orientationchange', function() {
        window.scrollTo(0, 0);
        document.activeElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
    });

    // Chặn chuột phải và F12
    document.addEventListener('contextmenu', function(e) { e.preventDefault(); });
    document.onkeydown = function(e) {
        if (e.keyCode == 123 || (e.ctrlKey && e.shiftKey && (e.keyCode == 73 || e.keyCode == 74 || e.keyCode == 67)) || (e.ctrlKey && e.keyCode == 85)) {
            return false;
        }
    };
});
// dangnhap.js
document.addEventListener('DOMContentLoaded', () => {
    const loginBtn = document.getElementById('loginBtn');
    const characterOrange = document.querySelector('.character-orange');
    const characterPurple = document.querySelector('.character-purple');
    const characterBlack = document.querySelector('.character-black');

    const togglePassword = document.querySelector('.toggle-password');
    const passwordInput = document.getElementById('password');
    const emailInput = document.getElementById('email');
    const errorMessageDisplay = document.getElementById('errorMessageDisplay'); // Lấy phần tử thông báo lỗi mới

    const loginTitle = document.getElementById('loginTitle'); // Nếu có phần tử này

    let originalButtonContent = '<i class="fas fa-sign-in-alt"></i> Đăng Nhập'; // Giá trị mặc định

    if (loginBtn) {
        originalButtonContent = loginBtn.innerHTML;
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

    // ====================================================================
    // CÁC HÀNH ĐỘNG ĐỂ "XÓA SẠCH" TRẠNG THÁI TRÊN FORM KHI TRANG TẢI LẠI
    // ====================================================================

    clearErrorMessage();
    if (emailInput) {
        emailInput.value = '';
    }
    if (passwordInput) {
        passwordInput.value = '';
    }
    if (loginBtn) {
        loginBtn.innerHTML = originalButtonContent;
        loginBtn.disabled = false;
    }
    
    // ====================================================================
    // END: CÁC HÀNH ĐỘNG XÓA SẠCH
    // ====================================================================

    // Toggle password visibility
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

    // Eye movement tracking
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

    if (loginBtn && emailInput && passwordInput) {
        // Adding visual feedback for login button hover
        if (characterOrange) {
            loginBtn.addEventListener('mouseenter', () => {
                characterOrange.classList.add('character-orange--happy');
            });
            loginBtn.addEventListener('mouseleave', () => {
                characterOrange.classList.remove('character-orange--happy');
            });
        }
        if (characterPurple) {
            loginBtn.addEventListener('mouseenter', () => {
                characterPurple.classList.add('character-purple--happy');
            });
            loginBtn.addEventListener('mouseleave', () => {
                characterPurple.classList.remove('character-purple--happy');
            });
        }
        if (characterBlack) {
            loginBtn.addEventListener('mouseenter', () => {
                characterBlack.classList.add('character-black--happy');
            });
            loginBtn.addEventListener('mouseleave', () => {
                characterBlack.classList.remove('character-black--happy');
            });
        }

        emailInput.addEventListener('input', clearErrorMessage);
        passwordInput.addEventListener('input', clearErrorMessage);

        loginBtn.addEventListener('click', async (event) => {
            event.preventDefault();
            clearErrorMessage();

            const email = emailInput.value;
            const password = passwordInput.value;

            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                showErrorMessage('Email chưa hợp lệ, hãy kiểm tra lại nhé!');
                emailInput.focus();
                loginBtn.innerHTML = originalButtonContent; 
                loginBtn.disabled = false;
                return;
            }

            if (password.length < 3) {
                showErrorMessage('Mật khẩu của bạn cần ít nhất 3 ký tự. Hãy thử lại!');
                passwordInput.focus();
                loginBtn.innerHTML = originalButtonContent;
                loginBtn.disabled = false;
                return;
            }
            
            loginBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Đang đăng nhập...';
            loginBtn.disabled = true;

            const payload = {
                email: email,
                password: password
            };

            console.log('Attempting login with:', payload);

            try {
                const response = await axios.post('https://saigongiadinh.pythonanywhere.com/auth/login/', payload, {
                    headers: {
                        'Content-Type': 'application/json',
                    }
                });

                const statusCode = response.status;
                const data = response.data;

                if (statusCode === 200) {
                    console.log('Login successful:', data);

                    if (characterPurple) characterPurple.classList.add('character-purple--happy');
                    if (characterBlack) characterBlack.classList.add('character-black--happy');
                    if (characterOrange) characterOrange.classList.add('character-orange--happy');

                    // Store token/user info in localStorage
                    if (data.token) {
                        localStorage.setItem('authToken', data.token);
                        // LƯU THÊM THỜI GIAN ĐĂNG NHẬP (TIMESTAMP)
                        localStorage.setItem('loginTime', Date.now().toString()); 
                    }
                    if (data.user_id) {
                        localStorage.setItem('userId', data.user_id);
                    }
                    if (data.email) {
                        localStorage.setItem('userEmail', data.email);
                    }
                    if (data.role) {
                        localStorage.setItem('userRole', data.role);
                    }
                    if (data.user && data.user.full_name) {
                        localStorage.setItem('userFullName', data.user.full_name);
                    }

                    if (loginTitle && data.user && data.user.full_name) {
                        loginTitle.textContent = `Chào, ${data.user.full_name}! Sẵn sàng khám phá chưa?`;
                    } else if (loginTitle) {
                        loginTitle.textContent = `Đăng nhập thành công! Cùng bắt đầu nào!`;
                    }

                    loginBtn.innerHTML = '<i class="fas fa-check"></i> Đăng nhập thành công!'; 
                    loginBtn.disabled = true; 

                    setTimeout(() => {
                        window.location.href = '/';
                    }, 1500);

                } else {
                    console.error(`Login failed (Status: ${statusCode}):`, data);
                    
                    let displayMsg = 'Có vẻ email hoặc mật khẩu chưa đúng. Vui lòng thử lại!'; 

                    if (data.message) {
                        displayMsg = data.message;
                    } else if (data.detail) {
                        displayMsg = data.detail;
                    } else if (data.non_field_errors && data.non_field_errors.length > 0) {
                        displayMsg = data.non_field_errors.join(' ');
                    } else if (data.email && data.email.length > 0) {
                        displayMsg = `Email: ${data.email.join(' ')}`;
                    } else if (data.password && data.password.length > 0) {
                        displayMsg = `Mật khẩu: ${data.password.join(' ')}`;
                    } else if (statusCode === 401 || statusCode === 403) {
                        displayMsg = 'Email hoặc mật khẩu không chính xác. Hãy kiểm tra lại nhé!';
                    } else if (statusCode === 405) {
                        displayMsg = 'Có lỗi máy chủ. Vui lòng liên hệ quản trị viên.';
                    } else { 
                             displayMsg = 'Đã xảy ra lỗi không xác định. Vui lòng thử lại sau!';
                    }
                    
                    showErrorMessage(displayMsg);

                    if (characterPurple) characterPurple.classList.remove('character-purple--happy');
                    if (characterBlack) characterBlack.classList.remove('character-black--happy');
                    if (characterOrange) characterOrange.classList.remove('character-orange--happy');

                    loginBtn.innerHTML = originalButtonContent; 
                    loginBtn.disabled = false;
                }

            } catch (error) {
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
                    } else {
                        displayMsg = 'Đã xảy ra lỗi không xác định. Vui lòng thử lại!';
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

                loginBtn.innerHTML = originalButtonContent; 
                loginBtn.disabled = false;
            } 
        });
    } else {
        console.warn('One or more required elements for login functionality are missing:', {
            loginBtn: loginBtn,
            emailInput: emailInput,
            passwordInput: passwordInput
        });
    }
});
// document.addEventListener('DOMContentLoaded', () => {
//     const loginBtn = document.getElementById('loginBtn');
//     const characterOrange = document.querySelector('.character-orange');
//     const characterPurple = document.querySelector('.character-purple');
//     const characterBlack = document.querySelector('.character-black');

//     const togglePassword = document.querySelector('.toggle-password');
//     const passwordInput = document.getElementById('password');
//     const emailInput = document.getElementById('email');

//     // Toggle password visibility
//     if (togglePassword && passwordInput) {
//         togglePassword.addEventListener('click', () => {
//             const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
//             passwordInput.setAttribute('type', type);
//             // Change the eye icon based on visibility
//             togglePassword.textContent = type === 'password' ? '👁' : '✖';
//         });
//     }

//     // Eye movement tracking (purely visual)
//     document.addEventListener('mousemove', (e) => {
//         const eyes = document.querySelectorAll('.eye');
//         eyes.forEach(eye => {
//             const character = eye.closest('.character');
//             if (!character) return;
//             const characterRect = character.getBoundingClientRect();
//             const characterCenterX = characterRect.left + characterRect.width / 2;
//             const characterCenterY = characterRect.top + characterRect.height / 2;
//             const deltaX = e.clientX - characterCenterX;
//             const deltaY = e.clientY - characterCenterY;
//             const angle = Math.atan2(deltaY, deltaX);
//             const maxMovement = 3; // Adjust for desired eye movement range
//             const eyeX = Math.cos(angle) * maxMovement;
//             const eyeY = Math.sin(angle) * maxMovement;
//             eye.style.transform = `translate(${eyeX}px, ${eyeY}px)`;
//         });
//     });

//     // Ensure all necessary elements are present before adding event listeners
//     if (loginBtn && emailInput && passwordInput) {
//         // Adding visual feedback for login button hover (characters becoming 'happy')
//         if (characterOrange) {
//             loginBtn.addEventListener('mouseenter', () => {
//                 characterOrange.classList.add('character-orange--happy');
//             });
//             loginBtn.addEventListener('mouseleave', () => {
//                 characterOrange.classList.remove('character-orange--happy');
//             });
//         }
//         if (characterPurple) {
//             loginBtn.addEventListener('mouseenter', () => {
//                 characterPurple.classList.add('character-purple--happy');
//             });
//             loginBtn.addEventListener('mouseleave', () => {
//                 characterPurple.classList.remove('character-purple--happy');
//             });
//         }
//         if (characterBlack) {
//             loginBtn.addEventListener('mouseenter', () => {
//                 characterBlack.classList.add('character-black--happy');
//             });
//             loginBtn.addEventListener('mouseleave', () => {
//                 characterBlack.classList.remove('character-black--happy');
//             });
//         }

//         loginBtn.addEventListener('click', async (event) => {
//             event.preventDefault(); // Prevent default form submission

//             const email = emailInput.value;
//             const password = passwordInput.value;

//             // Client-side validation
//             const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
//             if (!emailRegex.test(email)) {
//                 alert('Vui lòng nhập email hợp lệ');
//                 emailInput.focus();
//                 return;
//             }

//             if (password.length < 6) {
//                 alert('Mật khẩu phải có ít nhất 6 ký tự');
//                 passwordInput.focus();
//                 return;
//             }

//             const payload = {
//                 email: email,
//                 password: password
//             };

//             console.log('Attempting login with:', payload);

//             try {
//                 // Ensure axios library is included in your HTML before this script
//                 // Example: <script src="https://cdn.jsdelivr.net/npm/axios/dist/axios.min.js"></script>

//                 const response = await axios.post('https://saigongiadinh.pythonanywhere.com/auth/login/', payload, {
//                     headers: {
//                         'Content-Type': 'application/json',
//                     }
//                 });

//                 const statusCode = response.status;
//                 const data = response.data;

//                 if (statusCode === 200) {
//                     console.log('Login successful:', data);
//                     alert('Đăng nhập thành công!');

//                     // Add happy classes if characters exist
//                     if (characterPurple) characterPurple.classList.add('character-purple--happy');
//                     if (characterBlack) characterBlack.classList.add('character-black--happy');

//                     // Store token/user info if needed (e.g., in localStorage)
//                     if (data.token) {
//                         localStorage.setItem('authToken', data.token);
//                     }
//                     if (data.user_id) {
//                         localStorage.setItem('userId', data.user_id);
//                     }
//                     if (data.email) {
//                         localStorage.setItem('userEmail', data.email);
//                     }
//                     if (data.role) {
//                         localStorage.setItem('userRole', data.role);
//                     }

//                     // Redirect after a short delay
//                     setTimeout(() => {
//                         window.location.href = '/'; // Adjust this to your actual root page
//                     }, 1000);

//                 } else {
//                     console.error(`Login failed (Status: ${statusCode}):`, data);
//                     const errorMessage = data.message || data.detail || 'Email hoặc mật khẩu không đúng.';
//                     alert('Đăng nhập thất bại: ' + errorMessage);

//                     // Remove happy classes on failure
//                     if (characterPurple) characterPurple.classList.remove('character-purple--happy');
//                     if (characterBlack) characterBlack.classList.remove('character-black--happy');
//                 }

//             } catch (error) {
//                 if (error.response) {
//                     const statusCode = error.response.status;
//                     const errorData = error.response.data;
//                     console.error(`Login failed (Status: ${statusCode}):`, errorData);

//                     let errorMessage = errorData.message || errorData.detail;
//                     if (statusCode === 405) {
//                         errorMessage = 'Phương thức không được phép. Lỗi cấu hình máy chủ hoặc CORS.';
//                     } else if (!errorMessage) {
//                         errorMessage = 'Email hoặc mật khẩu không đúng.';
//                     }
//                     alert('Đăng nhập thất bại: ' + errorMessage);

//                 } else if (error.request) {
//                     console.error('No response received from server:', error.request);
//                     alert('Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối mạng của bạn hoặc lỗi CORS.');
//                 } else {
//                     console.error('Error setting up login request:', error.message);
//                     alert('Đã xảy ra lỗi khi cố gắng gửi yêu cầu. Vui lòng thử lại.');
//                 }

//                 // Ensure characters are reset on error
//                 if (characterPurple) characterPurple.classList.remove('character-purple--happy');
//                 if (characterBlack) characterBlack.classList.remove('character-black--happy');
//             }
//         });
//     } else {
//         console.warn('One or more required elements for login functionality are missing:', {
//             loginBtn: loginBtn,
//             emailInput: emailInput,
//             passwordInput: passwordInput
//         });
//     }
// });


// dangnhap.js (đã sửa đổi)
document.addEventListener('DOMContentLoaded', () => {
    const loginBtn = document.getElementById('loginBtn');
    const characterOrange = document.querySelector('.character-orange');
    const characterPurple = document.querySelector('.character-purple');
    const characterBlack = document.querySelector('.character-black');

    const togglePassword = document.querySelector('.toggle-password');
    const passwordInput = document.getElementById('password');
    const emailInput = document.getElementById('email');

    // BỎ DÒNG NÀY: const loginStatusLink = document.getElementById('loginStatusLink');
    const loginTitle = document.getElementById('loginTitle'); // Giữ lại nếu bạn muốn cập nhật tiêu đề trên trang đăng nhập

    // BỎ HÀM NÀY: function updateLoginStatusUI() { ... }
    // BỎ DÒNG NÀY: updateLoginStatusUI(); // Không gọi ở đây nữa


    // Toggle password visibility (giữ nguyên)
    if (togglePassword && passwordInput) {
        togglePassword.addEventListener('click', () => {
            const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
            passwordInput.setAttribute('type', type);
            togglePassword.textContent = type === 'password' ? '👁' : '✖';
        });
    }

    // Eye movement tracking (giữ nguyên)
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

    // Ensure all necessary elements are present before adding event listeners (giữ nguyên)
    if (loginBtn && emailInput && passwordInput) {
        // Adding visual feedback for login button hover (giữ nguyên)
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

        loginBtn.addEventListener('click', async (event) => {
            event.preventDefault();

            const email = emailInput.value;
            const password = passwordInput.value;

            // Client-side validation (giữ nguyên)
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                alert('Vui lòng nhập email hợp lệ');
                emailInput.focus();
                return;
            }

            if (password.length < 6) {
                alert('Mật khẩu phải có ít nhất 6 ký tự');
                passwordInput.focus();
                return;
            }

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

                    // Store token/user info in localStorage (giữ nguyên)
                    if (data.token) {
                        localStorage.setItem('authToken', data.token);
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

                    // BỎ DÒNG NÀY: updateLoginStatusUI(); // Không gọi ở đây nữa

                    // Cập nhật tiêu đề trên trang đăng nhập (nếu đang ở trang đăng nhập)
                    if (loginTitle && data.user && data.user.full_name) {
                        loginTitle.textContent = `Chào, ${data.user.full_name}!`;
                    }

                    // Redirect after a short delay (giữ nguyên)
                    setTimeout(() => {
                        window.location.href = '/'; // Điều hướng về trang chủ
                    }, 100);

                } else {
                    console.error(`Login failed (Status: ${statusCode}):`, data);
                    const errorMessage = data.message || data.detail || 'Email hoặc mật khẩu không đúng.';
                    alert('Đăng nhập thất bại: ' + errorMessage);

                    if (characterPurple) characterPurple.classList.remove('character-purple--happy');
                    if (characterBlack) characterBlack.classList.remove('character-black--happy');
                }

            } catch (error) {
                // Xử lý lỗi (giữ nguyên)
                if (error.response) {
                    const statusCode = error.response.status;
                    const errorData = error.response.data;
                    console.error(`Login failed (Status: ${statusCode}):`, errorData);

                    let errorMessage = errorData.message || errorData.detail;
                    if (statusCode === 405) {
                        errorMessage = 'Phương thức không được phép. Lỗi cấu hình máy chủ hoặc CORS.';
                    } else if (!errorMessage) {
                        errorMessage = 'Email hoặc mật khẩu không đúng.';
                    }
                    alert('Đăng nhập thất bại: ' + errorMessage);

                } else if (error.request) {
                    console.error('No response received from server:', error.request);
                    alert('Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối mạng của bạn hoặc lỗi CORS.');
                } else {
                    console.error('Error setting up login request:', error.message);
                    alert('Đã xảy ra lỗi khi cố gắng gửi yêu cầu. Vui lòng thử lại.');
                }

                if (characterPurple) characterPurple.classList.remove('character-purple--happy');
                if (characterBlack) characterBlack.classList.remove('character-black--happy');
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
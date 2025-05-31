// document.addEventListener('DOMContentLoaded', () => {
//     const loginBtn = document.getElementById('loginBtn');
//     const characterOrange = document.querySelector('.character-orange');
//     const characterPurple = document.querySelector('.character-purple');
//     const characterBlack = document.querySelector('.character-black');

//     const togglePassword = document.querySelector('.toggle-password');
//     const passwordInput = document.getElementById('password');

//     if (togglePassword && passwordInput) {
//         togglePassword.addEventListener('click', () => {
//             const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
//             passwordInput.setAttribute('type', type);
//             togglePassword.textContent = type === 'password' ? '👁' : '✖';
//         });
//     }

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
//             const maxMovement = 3;
//             const eyeX = Math.cos(angle) * maxMovement;
//             const eyeY = Math.sin(angle) * maxMovement;
//             eye.style.transform = `translate(${eyeX}px, ${eyeY}px)`;
//         });
//     });

//     const emailInput = document.getElementById('email');

//     if (loginBtn && emailInput && passwordInput && characterOrange && characterPurple && characterBlack) {
//         loginBtn.addEventListener('mouseenter', () => {
//             characterOrange.classList.add('character-orange--happy');
//             characterPurple.classList.add('character-purple--happy');
//             characterBlack.classList.add('character-black--happy');
//         });

//         loginBtn.addEventListener('mouseleave', () => {
//             characterOrange.classList.remove('character-orange--happy');
//             characterPurple.classList.remove('character-purple--happy');
//             characterBlack.classList.remove('character-black--happy');
//         });

//         loginBtn.addEventListener('click', async (event) => {
//             event.preventDefault(); // Ngăn chặn form submit mặc định

//             const email = emailInput.value;
//             const password = passwordInput.value;

//             if (!email || !password) {
//                 alert('Vui lòng nhập Email và Mật khẩu.');
//                 return;
//             }

//             console.log('Đang cố gắng đăng nhập với:', { email, password });

//             try {
                
//                 const response = await axios.post('https://saigongiadinh.pythonanywhere.com/auth/login/', {
//                     email: "sinhvien123@gmail.com",
//                     password: "123456789012"
//                 }, {
//                     headers: {
//                         'Content-Type': 'application/json'
//                     }
//                 });

//                 const statusCode = response.status;
//                 const data = response.data;

//                 if (statusCode === 200) {
//                     console.log('Đăng nhập thành công:', data);
//                     alert('Đăng nhập thành công!');
                    
                    
//                     characterPurple.classList.add('character-purple--happy');
//                     characterBlack.classList.add('character-black--happy');

//                     // Điều hướng về trang gốc của ứng dụng (nếu index.html là trang gốc)
//                     // HOẶC nếu bạn đang chạy local bằng cách mở file trực tiếp, thì 'index.html' là đúng
//                     setTimeout(() => {
//                         window.location.href = '/'; // Thay bằng '/' nếu index.html là trang gốc của domain
//                                                 // Hoặc 'index.html' nếu bạn mở file trực tiếp
//                     }, 1000); 
                    
//                 } else {
//                     console.error(`Đăng nhập thất bại (Status: ${statusCode}):`, data);
//                     const errorMessage = data.message || data.detail || 'Email hoặc mật khẩu không đúng.';
//                     alert('Đăng nhập thất bại: ' + errorMessage);
                    
                   
//                     characterPurple.classList.remove('character-purple--happy');
//                     characterBlack.classList.remove('character-black--happy');
//                 }

//             } catch (error) {
//                 if (error.response) {
//                     const statusCode = error.response.status;
//                     const errorData = error.response.data;
//                     console.error(`Đăng nhập thất bại (Status: ${statusCode}):`, errorData);
//                     const errorMessage = errorData.message || errorData.detail || 'Email hoặc mật khẩu không đúng.';
//                     alert('Đăng nhập thất bại: ' + errorMessage);
//                 } else if (error.request) {
//                     console.error('Không nhận được phản hồi từ máy chủ:', error.request);
//                     alert('Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối mạng của bạn.');
//                 } else {
//                     console.error('Lỗi khi gửi yêu cầu đăng nhập:', error.message);
//                     alert('Đã xảy ra lỗi khi cố gắng gửi yêu cầu. Vui lòng thử lại.');
//                 }
                
              
//                 characterPurple.classList.remove('character-purple--happy');
//                 characterBlack.classList.remove('character-black--happy');
//             }
//         });
//     } else {
       
//         console.log('loginBtn:', loginBtn);
//         console.log('emailInput:', emailInput);
//         console.log('passwordInput:', passwordInput);
//         console.log('characterPurple:', characterPurple);
//         console.log('characterBlack:', characterBlack);
//     }
// });


document.addEventListener('DOMContentLoaded', () => {
    const loginBtn = document.getElementById('loginBtn');
    const characterOrange = document.querySelector('.character-orange');
    const characterPurple = document.querySelector('.character-purple');
    const characterBlack = document.querySelector('.character-black');

    const togglePassword = document.querySelector('.toggle-password');
    const passwordInput = document.getElementById('password');
    const emailInput = document.getElementById('email');

    // Toggle password visibility
    if (togglePassword && passwordInput) {
        togglePassword.addEventListener('click', () => {
            const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
            passwordInput.setAttribute('type', type);
            // Change the eye icon based on visibility
            togglePassword.textContent = type === 'password' ? '👁' : '✖';
        });
    }

    // Eye movement tracking (purely visual)
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
            const maxMovement = 3; // Adjust for desired eye movement range
            const eyeX = Math.cos(angle) * maxMovement;
            const eyeY = Math.sin(angle) * maxMovement;
            eye.style.transform = `translate(${eyeX}px, ${eyeY}px)`;
        });
    });

    // Ensure all necessary elements are present before adding event listeners
    if (loginBtn && emailInput && passwordInput) {
        // Adding visual feedback for login button hover (characters becoming 'happy')
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
            event.preventDefault(); // Prevent default form submission

            const email = emailInput.value;
            const password = passwordInput.value;

            // Client-side validation
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
                // Ensure axios library is included in your HTML before this script
                // Example: <script src="https://cdn.jsdelivr.net/npm/axios/dist/axios.min.js"></script>

                const response = await axios.post('https://saigongiadinh.pythonanywhere.com/auth/login/', payload, {
                    headers: {
                        'Content-Type': 'application/json',
                    }
                });

                const statusCode = response.status;
                const data = response.data;

                if (statusCode === 200) {
                    console.log('Login successful:', data);
                    alert('Đăng nhập thành công!');

                    // Add happy classes if characters exist
                    if (characterPurple) characterPurple.classList.add('character-purple--happy');
                    if (characterBlack) characterBlack.classList.add('character-black--happy');

                    // Store token/user info if needed (e.g., in localStorage)
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

                    // Redirect after a short delay
                    setTimeout(() => {
                        window.location.href = '/'; // Adjust this to your actual root page
                    }, 1000);

                } else {
                    console.error(`Login failed (Status: ${statusCode}):`, data);
                    const errorMessage = data.message || data.detail || 'Email hoặc mật khẩu không đúng.';
                    alert('Đăng nhập thất bại: ' + errorMessage);

                    // Remove happy classes on failure
                    if (characterPurple) characterPurple.classList.remove('character-purple--happy');
                    if (characterBlack) characterBlack.classList.remove('character-black--happy');
                }

            } catch (error) {
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

                // Ensure characters are reset on error
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



// document.addEventListener('DOMContentLoaded', function() {
//     // --- Lấy các phần tử DOM ---
//     const emailInput = document.getElementById('email');
//     const passwordInput = document.getElementById('password');
//     const loginBtn = document.getElementById('loginBtn');
//     const messageDiv = document.getElementById('message'); // Dành cho các thông báo chung
//     const errorMessageDisplay = document.getElementById('errorMessageDisplay'); // Dành cho thông báo lỗi cụ thể trên form

//     // THAY ĐỔI CÁC BIẾN NÀY ĐỂ KHỚP VỚI ID MỚI TRONG HTML
//     const sidebarUserNameElement = document.getElementById('sidebarUserName'); // Đổi từ headerUserName
//     const sidebarUserAvatarElement = document.getElementById('sidebarUserAvatar'); // Đổi từ headerUserAvatar
//     const sidebarUserAvatarLink = document.getElementById('sidebarUserAvatarLink'); // Đổi từ headerUserAvatarLink
//     const sidebarUserInfoDiv = document.querySelector('.sidebar-user-info'); // Lấy div cha để có thể ẩn/hiện

//     const togglePassword = document.querySelector('.toggle-password');

//     const characterOrange = document.querySelector('.character-orange');
//     const characterPurple = document.querySelector('.character-purple');
//     const characterBlack = document.querySelector('.character-black');

//     // --- Cấu hình API và thời gian phiên ---
//     const loginApiUrl = 'https://saigongiadinh.pythonanywhere.com/auth/login/';
//     const SESSION_DURATION_MS = 1000 * 60 * 10; // 10 phút tính bằng mili giây

//     // Lưu nội dung gốc của nút đăng nhập
//     let originalButtonContent = loginBtn ? loginBtn.innerHTML : '<i class="fas fa-sign-in-alt"></i> Đăng Nhập';

//     // --- Hàm hiển thị thông báo ---
//     function showMessage(msg, type) {
//         if (messageDiv) {
//             messageDiv.textContent = msg;
//             messageDiv.className = `message ${type}`;
//             messageDiv.style.display = msg ? 'block' : 'none';
//         }
//     }

//     function showErrorMessage(message) {
//         if (errorMessageDisplay) {
//             errorMessageDisplay.innerHTML = `<i class="fas fa-exclamation-circle"></i> ${message}`;
//             errorMessageDisplay.style.display = 'flex';
//             errorMessageDisplay.classList.add('fade-in');
//         }
//     }

//     function clearErrorMessage() {
//         if (errorMessageDisplay) {
//             errorMessageDisplay.innerHTML = '';
//             errorMessageDisplay.style.display = 'none';
//             errorMessageDisplay.classList.remove('fade-in');
//         }
//     }

//     // --- Cập nhật thông tin User Info trong Sidebar (Avatar và Tên) ---
//     // Thêm tham số `hide` để ẩn/hiện toàn bộ div `.sidebar-user-info`
//     function updateSidebarUserInfo(fullName, userPhotoUrl, role, hide = false) {
//         if (sidebarUserInfoDiv) {
//             if (hide || !fullName || (role !== 'CBCNV' && role !== 'SINH_VIEN')) {
//                 sidebarUserInfoDiv.style.display = 'none'; // Ẩn toàn bộ div nếu không có thông tin hợp lệ hoặc yêu cầu ẩn
//                 return;
//             }
//             sidebarUserInfoDiv.style.display = 'flex'; // Hiện div nếu có thông tin hợp lệ

//             // Cập nhật tên
//             if (sidebarUserNameElement) {
//                 sidebarUserNameElement.textContent = fullName; // Không cần "Chào, "
//                 sidebarUserNameElement.style.display = 'inline';
//             }

//             // Cập nhật avatar
//             if (sidebarUserAvatarElement) {
//                 const finalUserPhotoUrl = userPhotoUrl || "/static/images/default_avatar.png"; // Ảnh mặc định nếu không có ảnh
//                 sidebarUserAvatarElement.src = finalUserPhotoUrl;
//                 sidebarUserAvatarElement.alt = fullName ? `${fullName} Avatar` : "User Avatar";
//             }
//         }
//     }

//     // --- Quản lý Local Storage (Phiên đăng nhập) ---
//     function clearLocalStorageSession() {
//         const keysToRemove = [
//             'userId', 'authToken', 'userEmail', 'userFullName', 'userPhone',
//             'userGender', 'userGenderDisplay', 'userAddress', 'userRole',
//             'userRoleDisplay', 'userIsActive', 'userDateJoined', 'userLastLogin',
//             'userNationalIdCard', 'userDateOfBirth', 'userPlaceOfBirth',
//             'userNationality', 'userEnrollmentDate', 'userPhoto',
//             'facultyCode', 'facultyType', 'facultyDepartmentName',
//             'facultyPosition', 'facultyDegree', 'facultyOfficeLocation',
//             'facultyIsDepartmentHead',
//             'time_login', 'sessionStartTime',
//             'studentIdNumber', 'studentMajor', 'studentEnrollmentYear'
//         ];
//         keysToRemove.forEach(key => localStorage.removeItem(key));
//         console.log('Đã xóa dữ liệu Local Storage của phiên đăng nhập.');
//         // Sau khi xóa, cập nhật lại UI sidebar để ẩn thông tin người dùng
//         updateSidebarUserInfo('', '', '', true);
//     }

//     // Hàm lưu thông tin người dùng vào localStorage từ phản hồi API chung
//     function saveUserInfoToLocalStorage(data) {
//         localStorage.setItem('time_login', Date.now().toString());
//         localStorage.setItem('sessionStartTime', Date.now().toString());

//         if (data.token) localStorage.setItem('authToken', data.token);
//         if (data.user_id) localStorage.setItem('userId', data.user_id);
//         if (data.email) localStorage.setItem('userEmail', data.email);
//         if (data.role) localStorage.setItem('userRole', data.role);

//         const userData = data.user_data;
//         if (userData) {
//             localStorage.setItem('userEmail', userData.email || '');
//             const userFullName = `${userData.last_name || ''} ${userData.first_name || ''}`.trim();
//             localStorage.setItem('userFullName', userFullName);

//             localStorage.setItem('userPhone', userData.phone || '');
//             localStorage.setItem('userGender', userData.gender || '');
//             localStorage.setItem('userGenderDisplay', userData.gender_display || '');

//             const fullAddress = [
//                 userData.address,
//                 userData.district,
//                 userData.city
//             ].filter(Boolean).join(', ');
//             localStorage.setItem('userAddress', fullAddress || '');

//             localStorage.setItem('userRole', userData.role || '');
//             localStorage.setItem('userRoleDisplay', userData.role_display || '');

//             localStorage.setItem('userIsActive', userData.is_active ? 'true' : 'false');
//             localStorage.setItem('userDateJoined', userData.date_joined || '');
//             localStorage.setItem('userLastLogin', userData.last_login || '');

//             localStorage.setItem('userNationalIdCard', userData.national_id_card || '');
//             localStorage.setItem('userDateOfBirth', userData.date_of_birth || '');
//             localStorage.setItem('userPlaceOfBirth', userData.place_of_birth || '');
//             localStorage.setItem('userNationality', userData.nationality || '');
//             localStorage.setItem('userEnrollmentDate', userData.enrollment_date || '');

//             if (userData.role === 'SINH_VIEN') {
//                 localStorage.setItem('studentIdNumber', userData.student_id_number || '');
//                 localStorage.setItem('studentMajor', userData.major || '');
//                 localStorage.setItem('studentEnrollmentYear', userData.enrollment_year || '');
//             }

//             if (userData.role === 'CBCNV') {
//                 localStorage.setItem('facultyCode', userData.faculty_code || '');
//                 localStorage.setItem('facultyType', userData.type || '');
//                 localStorage.setItem('facultyDepartmentName', userData.department_name || '');
//                 localStorage.setItem('facultyPosition', userData.position || '');
//                 localStorage.setItem('facultyDegree', userData.degree || '');
//                 localStorage.setItem('facultyOfficeLocation', userData.office_location || '');
//                 localStorage.setItem('facultyIsDepartmentHead', userData.is_department_head ? 'true' : 'false');
//             }

//             // LƯU Ý QUAN TRỌNG: Đảm bảo user_photo là URL tuyệt đối hoặc tương đối đúng
//             // Nếu API trả về đường dẫn tương đối (ví dụ: /media/photos/avatar.jpg),
//             // bạn có thể cần nối với base URL của server của bạn nếu nó không tự động xử lý.
//             // Ví dụ: `https://saigongiadinh.pythonanywhere.com` + `userData.user_photo`
//             localStorage.setItem('userPhoto', userData.user_photo || ''); 
//         }
//     }

//     // Hàm xử lý đăng xuất
//     function handleLogout() {
//         clearLocalStorageSession();
//         alert('Bạn đã đăng xuất thành công!');
//         window.location.href = '/dangnhap';
//     }

//     // --- Logic Đăng nhập chính ---
//     async function handleLogin(event) {
//         event.preventDefault();

//         const email = emailInput.value.trim();
//         const password = passwordInput.value.trim();

//         clearErrorMessage();
//         showMessage('', '');

//         if (!email || !password) {
//             showErrorMessage('Vui lòng nhập đầy đủ email và mật khẩu.');
//             return;
//         }

//         const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
//         if (!emailRegex.test(email)) {
//             showErrorMessage('Email chưa hợp lệ, hãy kiểm tra lại nhé!');
//             emailInput.focus();
//             return;
//         }

//         if (password.length < 3) {
//             showErrorMessage('Mật khẩu của bạn cần ít nhất 3 ký tự. Hãy thử lại!');
//             passwordInput.focus();
//             return;
//         }

//         if (loginBtn) {
//             loginBtn.disabled = true;
//             loginBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Đang đăng nhập...';
//         }

//         if (characterPurple) characterPurple.classList.add('character-purple--happy');
//         if (characterBlack) characterBlack.classList.add('character-black--happy');
//         if (characterOrange) characterOrange.classList.add('character-orange--happy');

//         const payload = {
//             email: email,
//             password: password
//         };

//         // console.log('Attempting login with:', payload);

//         try {
//             const response = await fetch(loginApiUrl, {
//                 method: 'POST',
//                 headers: {
//                     'Content-Type': 'application/json',
//                 },
//                 body: JSON.stringify(payload)
//             });

//             const data = await response.json();

//             if (response.ok) {
//                 // console.log('Login successful:', data);
//                 showMessage(data.message || 'Đăng nhập thành công!', 'success');
//                 saveUserInfoToLocalStorage(data); // Lưu tất cả thông tin vào Local Storage

//                 // Cập nhật thông tin người dùng trên sidebar ngay sau khi đăng nhập thành công
//                 const userFullName = localStorage.getItem('userFullName');
//                 const userPhoto = localStorage.getItem('userPhoto');
//                 const userRole = localStorage.getItem('userRole');
//                 updateSidebarUserInfo(userFullName, userPhoto, userRole);


//                 if (data.role === 'CBCNV') {
//                     setTimeout(() => {
//                         window.location.href = '/gv/home_faculty/';
//                     }, 1000);
//                 } else if (data.role === 'SINH_VIEN') {
//                     setTimeout(() => {
//                         window.location.href = '/';
//                     }, 1000);
//                 } else {
//                     showErrorMessage('Đăng nhập thành công nhưng tài khoản không có quyền truy cập cụ thể. Bạn sẽ được chuyển hướng về trang đăng nhập.');
//                     setTimeout(() => {
//                         window.location.href = '/dangnhap';
//                     }, 2000);
//                 }

//             } else {
//                 console.error(`Login failed (Status: ${response.status}):`, data);
//                 let displayMsg = 'Có vẻ email hoặc mật khẩu chưa đúng. Vui lòng thử lại!';
//                 if (data.detail) {
//                     displayMsg = data.detail;
//                 } else if (data.message) {
//                     displayMsg = data.message;
//                 } else if (data.non_field_errors && data.non_field_errors.length > 0) {
//                     displayMsg = data.non_field_errors.join(' ');
//                 } else if (data.email && data.email.length > 0) {
//                     displayMsg = `Email: ${data.email.join(' ')}`;
//                 } else if (data.password && data.password.length > 0) {
//                     displayMsg = `Mật khẩu: ${data.password.join(' ')}`;
//                 } else if (response.status === 401 || response.status === 403) {
//                     displayMsg = 'Email hoặc mật khẩu không chính xác. Hãy kiểm tra lại nhé!';
//                 } else if (response.status === 405) {
//                     displayMsg = 'Có lỗi máy chủ. Vui lòng liên hệ quản trị viên.';
//                 }
//                 showErrorMessage(displayMsg);

//                 if (characterPurple) characterPurple.classList.remove('character-purple--happy');
//                 if (characterBlack) characterBlack.classList.remove('character-black--happy');
//                 if (characterOrange) characterOrange.classList.remove('character-orange--happy');
//             }

//         } catch (error) {
//             console.error('Lỗi khi gửi yêu cầu đăng nhập:', error);
//             if (error.response) {
//                 const statusCode = error.response.status;
//                 const errorData = error.response.data;
//                 console.error(`Login failed (Status: ${statusCode}):`, errorData);

//                 let displayMsg = 'Đã có lỗi xảy ra. Vui lòng thử lại!';
//                 if (errorData.message) {
//                     displayMsg = errorData.message;
//                 } else if (errorData.detail) {
//                     displayMsg = errorData.detail;
//                 } else if (errorData.non_field_errors && errorData.non_field_errors.length > 0) {
//                     displayMsg = errorData.non_field_errors.join(' ');
//                 } else if (errorData.email && errorData.email.length > 0) {
//                     displayMsg = `Email: ${errorData.email.join(' ')}`;
//                 } else if (errorData.password && errorData.password.length > 0) {
//                     displayMsg = `Mật khẩu: ${errorData.password.join(' ')}`;
//                 } else if (statusCode === 401 || statusCode === 403) {
//                     displayMsg = 'Thông tin đăng nhập không hợp lệ. Vui lòng kiểm tra lại!';
//                 } else if (statusCode === 405) {
//                     displayMsg = 'Có lỗi cấu hình máy chủ. Vui lòng liên hệ hỗ trợ!';
//                 }
//                 showErrorMessage(displayMsg);

//             } else if (error.request) {
//                 console.error('No response received from server:', error.request);
//                 showErrorMessage('Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối mạng của bạn!');
//             } else {
//                 console.error('Error setting up login request:', error.message);
//                 showErrorMessage('Đã xảy ra lỗi hệ thống. Vui lòng thử lại!');
//             }

//             if (characterPurple) characterPurple.classList.remove('character-purple--happy');
//             if (characterBlack) characterBlack.classList.remove('character-black--happy');
//             if (characterOrange) characterOrange.classList.remove('character-orange--happy');

//         } finally {
//             if (loginBtn) {
//                 loginBtn.disabled = false;
//                 loginBtn.innerHTML = originalButtonContent;
//             }
//         }
//     }

//     // --- Logic kiểm tra phiên hết hạn trên client ---
//     let isSessionExpiredAlertShown = false;

//     function checkFrontendSessionExpiry() {
//         const timeLogin = localStorage.getItem('time_login');
//         const authToken = localStorage.getItem('authToken');
//         const userRole = localStorage.getItem('userRole');

//         const currentPathname = window.location.pathname;
//         const isLoginPageOrRoot = currentPathname === '/dangnhap' || currentPathname === '/login/' || currentPathname === '/' || currentPathname === '/gv/home_faculty/';

//         if (isLoginPageOrRoot) {
//             isSessionExpiredAlertShown = false;
//             return true;
//         }

//         if (!timeLogin || !authToken || (userRole !== 'CBCNV' && userRole !== 'SINH_VIEN')) {
//             // console.log('%c[Phiên Đăng Nhập] Không có phiên, token hoặc role không đúng. Đã xóa session.', 'color: gray;');
//             if (!isSessionExpiredAlertShown) {
//                 isSessionExpiredAlertShown = true;
//                 clearLocalStorageSession();
//                 alert('Phiên đăng nhập của bạn đã hết hạn hoặc bạn không có quyền truy cập. Vui lòng đăng nhập lại.');
//                 window.location.href = '/dangnhap';
//             }
//             return false;
//         }

//         const loginTimestamp = parseInt(timeLogin);
//         const currentTime = Date.now();
//         const elapsedTime = currentTime - loginTimestamp;
//         const remainingTimeMs = SESSION_DURATION_MS - elapsedTime;

//         if (remainingTimeMs <= 0) {
//             if (!isSessionExpiredAlertShown) {
//                 isSessionExpiredAlertShown = true;
//                 clearLocalStorageSession();
//                 alert('Phiên đăng nhập của bạn đã hết hạn hoặc bạn không có quyền truy cập. Vui lòng đăng nhập lại.');
//                 window.location.href = '/dangnhap';
//             }
//             return false;
//         } else {
//             const remainingMinutes = Math.floor(remainingTimeMs / (1000 * 60));
//             const remainingSeconds = Math.floor((remainingTimeMs % (1000 * 60)) / 1000);
//             // console.log(`%c[Phiên Đăng Nhập] Còn lại: ${remainingMinutes} phút ${remainingSeconds} giây.`, 'color: green;');
//             isSessionExpiredAlertShown = false;
//             return true;
//         }
//     }

//     // --- Gắn sự kiện ---
//     if (loginBtn) {
//         loginBtn.addEventListener('click', handleLogin);
//     }

//     if (emailInput) {
//         emailInput.addEventListener('keypress', function(event) {
//             if (event.key === 'Enter') {
//                 handleLogin(event);
//             }
//         });
//         emailInput.addEventListener('input', clearErrorMessage);
//     }
//     if (passwordInput) {
//         passwordInput.addEventListener('keypress', function(event) {
//             if (event.key === 'Enter') {
//                 handleLogin(event);
//             }
//         });
//         passwordInput.addEventListener('input', clearErrorMessage);
//     }

//     if (togglePassword && passwordInput) {
//         togglePassword.addEventListener('click', () => {
//             const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
//             passwordInput.setAttribute('type', type);
//             const eyeOpen = togglePassword.querySelector('.eye-open');
//             const eyeClosed = togglePassword.querySelector('.eye-closed');
//             if (eyeOpen && eyeClosed) {
//                 if (type === 'password') {
//                     eyeOpen.style.display = 'block';
//                     eyeClosed.style.display = 'none';
//                 } else {
//                     eyeOpen.style.display = 'none';
//                     eyeClosed.style.display = 'block';
//                 }
//             }
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

//     if (loginBtn) {
//         [characterOrange, characterPurple, characterBlack].forEach(char => {
//             if (char) {
//                 loginBtn.addEventListener('mouseenter', () => { char.classList.add(`${char.classList[1]}--happy`); });
//                 loginBtn.addEventListener('mouseleave', () => { char.classList.remove(`${char.classList[1]}--happy`); });
//             }
//         });
//     }

//     const sidebarLogoutBtn = document.getElementById('sidebarLogoutBtn');
//     if (sidebarLogoutBtn) {
//         sidebarLogoutBtn.addEventListener('click', function(event) {
//             event.preventDefault();
//             handleLogout();
//         });
//     }

//     // --- Khởi tạo và kiểm tra khi tải trang ---
//     clearErrorMessage();
//     if (emailInput) { emailInput.value = ''; }
//     if (passwordInput) { passwordInput.value = ''; }

//     const currentPathname = window.location.pathname;
//     const isLoginPageOrRootOnLoad = currentPathname === '/dangnhap' || currentPathname === '/login/' || currentPathname === '/' || currentPathname === '/gv/home_faculty/';

//     if (!isLoginPageOrRootOnLoad) {
//         const authToken = localStorage.getItem('authToken');
//         const userRole = localStorage.getItem('userRole');

//         if (authToken && (userRole === 'CBCNV' || userRole === 'SINH_VIEN')) {
//             checkFrontendSessionExpiry();
//             setInterval(() => {
//                 checkFrontendSessionExpiry();
//             }, 5000);
//         } else {
//             console.log('%c[Khởi tạo] Không có phiên đăng nhập hợp lệ. Chuyển hướng về trang đăng nhập.', 'color: red;');
//             clearLocalStorageSession();
//             alert('Bạn cần đăng nhập để truy cập trang này.');
//             window.location.href = '/dangnhap';
//         }
//     } else {
//         // console.log('%c[Khởi tạo] Đang ở trang đăng nhập hoặc trang gốc. Không kiểm tra phiên.', 'color: blue;');
//     }


//     document.addEventListener('visibilitychange', function() {
//         if (document.visibilityState === 'visible') {
//             const currentPathname = window.location.pathname;
//             const isLoginPageOrRootOnFocus = currentPathname === '/dangnhap' || currentPathname === '/login/' || currentPathname === '/' || currentPathname === '/gv/home_faculty/';

//             if (!isLoginPageOrRootOnFocus) {
//                 checkFrontendSessionExpiry();
//             }
//         }
//     });


//     // Cập nhật thông tin user info trong sidebar khi tải trang, dựa trên session hiện có
//     const storedUserFullName = localStorage.getItem('userFullName');
//     const storedUserPhoto = localStorage.getItem('userPhoto');
//     const storedUserRole = localStorage.getItem('userRole');

//     // Kiểm tra xem có token và vai trò hợp lệ không để quyết định hiển thị thông tin người dùng
//     if (localStorage.getItem('authToken') && (storedUserRole === 'CBCNV' || storedUserRole === 'SINH_VIEN')) {
//         updateSidebarUserInfo(storedUserFullName, storedUserPhoto, storedUserRole);
//     } else {
//         // Nếu không có phiên hoặc vai trò không hợp lệ, ẩn phần thông tin người dùng
//         updateSidebarUserInfo('', '', '', true); // Gọi với hide = true để ẩn
//     }
// });



document.addEventListener('DOMContentLoaded', function() {
    // --- Lấy các phần tử DOM ---
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const loginBtn = document.getElementById('loginBtn');
    const messageDiv = document.getElementById('message'); // Dành cho các thông báo chung
    const errorMessageDisplay = document.getElementById('errorMessageDisplay'); // Dành cho thông báo lỗi cụ thể trên form

    // CÁC BIẾN NÀY LIÊN QUAN ĐẾN SIDEBAR HOẶC HEADER CỦA CÁC TRANG KHÁC
    // Trên trang login.js, chúng ta không thực sự cần chúng để trang login hoạt động,
    // nhưng nếu bạn muốn tái sử dụng hàm updateSidebarUserInfo ở đây, bạn có thể giữ.
    // Tuy nhiên, tốt nhất là code cập nhật UI sidebar nên nằm trong file JS của layout chính.
    const sidebarUserNameElement = document.getElementById('sidebarUserName');
    const sidebarUserAvatarElement = document.getElementById('sidebarUserAvatar');
    const sidebarUserAvatarLink = document.getElementById('sidebarUserAvatarLink');
    const sidebarUserInfoDiv = document.querySelector('.sidebar-user-info');

    const togglePassword = document.querySelector('.toggle-password');

    const characterOrange = document.querySelector('.character-orange');
    const characterPurple = document.querySelector('.character-purple');
    const characterBlack = document.querySelector('.character-black');

    // --- Cấu hình API và thời gian phiên ---
    const loginApiUrl = 'https://saigongiadinh.pythonanywhere.com/auth/login/'; // Cập nhật API của bạn
    const SESSION_DURATION_MS = 1000 * 60 * 10; // 10 phút tính bằng mili giây

    // Lưu nội dung gốc của nút đăng nhập
    let originalButtonContent = loginBtn ? loginBtn.innerHTML : '<i class="fas fa-sign-in-alt"></i> Đăng Nhập';

    // Hàm kiểm tra phiên đăng nhập hiện tại
    function isAuthenticated() {
        const authToken = localStorage.getItem('authToken');
        const userRole = localStorage.getItem('userRole');
        // Kiểm tra xem có token và vai trò hợp lệ không
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
    // Hàm này chủ yếu dùng trên các trang đã đăng nhập, không thực sự cần thiết trên trang login.
    // Tôi giữ lại nhưng lưu ý rằng nó có thể không được gọi hoặc các phần tử DOM của nó không tồn tại.
    function updateSidebarUserInfo(fullName, userPhotoUrl, role, hide = false) {
        if (sidebarUserInfoDiv) {
            if (hide || !fullName || (role !== 'CBCNV' && role !== 'SINH_VIEN')) {
                sidebarUserInfoDiv.style.display = 'none'; // Ẩn toàn bộ div nếu không có thông tin hợp lệ hoặc yêu cầu ẩn
                return;
            }
            sidebarUserInfoDiv.style.display = 'flex'; // Hiện div nếu có thông tin hợp lệ

            // Cập nhật tên
            if (sidebarUserNameElement) {
                sidebarUserNameElement.textContent = fullName;
                sidebarUserNameElement.style.display = 'inline';
            }

            // Cập nhật avatar
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
        console.log('Đã xóa dữ liệu Local Storage của phiên đăng nhập.');
        // Sau khi xóa, cập nhật lại UI sidebar để ẩn thông tin người dùng (nếu có các phần tử này trên trang)
        updateSidebarUserInfo('', '', '', true);
    }

    // Hàm lưu thông tin người dùng vào localStorage từ phản hồi API chung
    function saveUserInfoToLocalStorage(data) {
        localStorage.setItem('time_login', Date.now().toString());
        localStorage.setItem('sessionStartTime', Date.now().toString());

        if (data.token) localStorage.setItem('authToken', data.token);
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

            // LƯU Ý QUAN TRỌNG: Đảm bảo user_photo là URL tuyệt đối hoặc tương đối đúng
            localStorage.setItem('userPhoto', userData.user_photo || '');
        }
    }

    // Hàm xử lý đăng xuất (chủ yếu dùng cho nút Đăng xuất trên các trang khác)
    function handleLogout() {
        clearLocalStorageSession();
        alert('Bạn đã đăng xuất thành công!');
        window.location.href = '/dangnhap';
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

        // Kích hoạt hiệu ứng "vui vẻ" cho các nhân vật
        if (characterPurple) characterPurple.classList.add('character-purple--happy');
        if (characterBlack) characterBlack.classList.add('character-black--happy');
        if (characterOrange) characterOrange.classList.add('character-orange--happy');

        const payload = {
            email: email,
            password: password
        };

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
                showMessage(data.message || 'Đăng nhập thành công!', 'success');
                saveUserInfoToLocalStorage(data); // Lưu tất cả thông tin vào Local Storage

                // Cập nhật thông tin người dùng trên sidebar (chỉ nếu các phần tử tồn tại)
                const userFullName = localStorage.getItem('userFullName');
                const userPhoto = localStorage.getItem('userPhoto');
                const userRole = localStorage.getItem('userRole');
                updateSidebarUserInfo(userFullName, userPhoto, userRole);

                // Chuyển hướng người dùng dựa trên vai trò
                if (data.role === 'CBCNV') {
                    setTimeout(() => {
                        window.location.href = '/gv/home_faculty/';
                    }, 500); // Chuyển hướng nhanh chóng
                } else if (data.role === 'SINH_VIEN') {
                    setTimeout(() => {
                        window.location.href = '/'; // Hoặc trang dashboard sinh viên
                    }, 500); // Chuyển hướng nhanh chóng
                } else {
                    // Nếu role không xác định, vẫn thông báo và chuyển về đăng nhập
                    showErrorMessage('Đăng nhập thành công nhưng tài khoản không có quyền truy cập cụ thể. Bạn sẽ được chuyển hướng về trang đăng nhập.');
                    clearLocalStorageSession(); // Xóa phiên không hợp lệ
                    setTimeout(() => {
                        window.location.href = '/dangnhap';
                    }, 1500); // Giảm thời gian chờ
                }

            } else {
                // Xử lý lỗi từ API
                console.error(`Login failed (Status: ${response.status}):`, data);
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

                // Tắt hiệu ứng "vui vẻ" khi đăng nhập thất bại
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

            // Tắt hiệu ứng "vui vẻ" khi có lỗi
            if (characterPurple) characterPurple.classList.remove('character-purple--happy');
            if (characterBlack) characterBlack.classList.remove('character-black--happy');
            if (characterOrange) characterOrange.classList.remove('character-orange--happy');

        } finally {
            // Luôn reset nút đăng nhập
            if (loginBtn) {
                loginBtn.disabled = false;
                loginBtn.innerHTML = originalButtonContent;
            }
        }
    }

    // --- Logic kiểm tra phiên hết hạn trên client ---
    let isSessionExpiredAlertShown = false; // Biến cờ để tránh hiển thị nhiều alert

    function checkFrontendSessionExpiry() {
        const timeLogin = localStorage.getItem('time_login');
        const authToken = localStorage.getItem('authToken');
        const userRole = localStorage.getItem('userRole');

        const currentPathname = window.location.pathname;
        // Trang đăng nhập hoặc trang root không cần kiểm tra phiên hết hạn định kỳ tại đây
        // vì chúng ta đã có logic chuyển hướng đầu trang cho trang login.
        // Các trang dashboard (home_faculty, /) sẽ tự kiểm tra và chuyển hướng nếu hết hạn.
        const isLoginPage = currentPathname === '/dangnhap' || currentPathname === '/login/';

        if (isLoginPage) {
            isSessionExpiredAlertShown = false; // Reset cờ nếu đang ở trang login
            return true; // Không cần kiểm tra phiên trên trang login (logic chuyển hướng đã lo)
        }

        // Nếu không có token, thời gian đăng nhập hoặc vai trò không hợp lệ
        if (!timeLogin || !authToken || (userRole !== 'CBCNV' && userRole !== 'SINH_VIEN')) {
            if (!isSessionExpiredAlertShown) {
                isSessionExpiredAlertShown = true;
                clearLocalStorageSession();
                alert('Phiên đăng nhập của bạn đã hết hạn hoặc bạn không có quyền truy cập. Vui lòng đăng nhập lại.');
                window.location.href = '/dangnhap'; // Chuyển hướng về trang đăng nhập
            }
            return false;
        }

        const loginTimestamp = parseInt(timeLogin);
        const currentTime = Date.now();
        const elapsedTime = currentTime - loginTimestamp;
        const remainingTimeMs = SESSION_DURATION_MS - elapsedTime;

        if (remainingTimeMs <= 0) { // Phiên đã hết hạn
            if (!isSessionExpiredAlertShown) {
                isSessionExpiredAlertShown = true;
                clearLocalStorageSession();
                alert('Phiên đăng nhập của bạn đã hết hạn hoặc bạn không có quyền truy cập. Vui lòng đăng nhập lại.');
                window.location.href = '/dangnhap'; // Chuyển hướng về trang đăng nhập
            }
            return false;
        } else {
            // const remainingMinutes = Math.floor(remainingTimeMs / (1000 * 60));
            // const remainingSeconds = Math.floor((remainingTimeMs % (1000 * 60)) / 1000);
            // console.log(`%c[Phiên Đăng Nhập] Còn lại: ${remainingMinutes} phút ${remainingSeconds} giây.`, 'color: green;');
            isSessionExpiredAlertShown = false; // Đảm bảo cờ được reset nếu phiên còn hiệu lực
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
        emailInput.addEventListener('input', clearErrorMessage); // Xóa lỗi khi gõ
    }
    if (passwordInput) {
        passwordInput.addEventListener('keypress', function(event) {
            if (event.key === 'Enter') {
                handleLogin(event);
            }
        });
        passwordInput.addEventListener('input', clearErrorMessage); // Xóa lỗi khi gõ
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
        let redirectPath = '/'; // Mặc định là trang chủ sinh viên
        if (userRole === 'CBCNV') {
            redirectPath = '/gv/home_faculty/'; // Nếu là giảng viên, chuyển hướng đến trang của giảng viên
        }
        console.log(`%c[Kiểm tra phiên] Đã có phiên đăng nhập hợp lệ trên trang đăng nhập. Chuyển hướng đến ${redirectPath}`, 'color: green;');
        window.location.replace(redirectPath); // Dùng replace để ngăn nút back
        return; // Dừng mọi thứ trên trang đăng nhập
    }

    // Logic kiểm tra phiên cho CÁC TRANG KHÔNG PHẢI TRANG ĐĂNG NHẬP
    if (!isLoginPage) {
        if (isAuthenticated()) {
            // Bắt đầu kiểm tra phiên định kỳ 5 giây một lần
            checkFrontendSessionExpiry(); // Kiểm tra ngay lập tức
            setInterval(() => {
                checkFrontendSessionExpiry();
            }, 5000);
        } else {
            console.log('%c[Khởi tạo] Không có phiên đăng nhập hợp lệ. Chuyển hướng về trang đăng nhập.', 'color: red;');
            clearLocalStorageSession();
            alert('Bạn cần đăng nhập để truy cập trang này.');
            window.location.href = '/dangnhap'; // Chuyển hướng về trang đăng nhập
        }
    } else {
        // Nếu đang ở trang đăng nhập và không có phiên hợp lệ (hoặc phiên hết hạn)
        console.log('%c[Khởi tạo] Đang ở trang đăng nhập. Không có phiên hợp lệ để tự động chuyển hướng.', 'color: blue;');
    }

    // Kiểm tra lại phiên khi tab trình duyệt được focus trở lại
    document.addEventListener('visibilitychange', function() {
        if (document.visibilityState === 'visible') {
            const currentPathnameOnFocus = window.location.pathname;
            // Chỉ kiểm tra phiên nếu KHÔNG phải trang đăng nhập
            if (!(currentPathnameOnFocus === '/dangnhap' || currentPathnameOnFocus === '/login/')) {
                checkFrontendSessionExpiry();
            }
        }
    });

    // Cập nhật thông tin user info trong sidebar khi tải trang, dựa trên session hiện có
    // (Đây là logic dùng cho các trang khác có sidebar, không phải trang login này)
    const storedUserFullName = localStorage.getItem('userFullName');
    const storedUserPhoto = localStorage.getItem('userPhoto');
    const storedUserRole = localStorage.getItem('userRole');

    if (isAuthenticated()) { // Kiểm tra lại xem có phiên hợp lệ không
        updateSidebarUserInfo(storedUserFullName, storedUserPhoto, storedUserRole);
    } else {
        updateSidebarUserInfo('', '', '', true); // Ẩn nếu không có phiên hoặc vai trò không hợp lệ
    }
});
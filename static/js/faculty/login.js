// // /static/js/faculty_login.js
// document.addEventListener('DOMContentLoaded', function() {
//     const emailInput = document.getElementById('email');
//     const passwordInput = document.getElementById('password');
//     const loginBtn = document.getElementById('loginBtn');
//     const loginStatusElement = document.getElementById('loginStatus'); // Đổi tên biến để rõ ràng hơn
//     const messageDiv = document.getElementById('message');

//     // URL của API đăng nhập giảng viên
//     const loginApiUrl = 'https://saigongiadinh.pythonanywhere.com/auth/faculty_login/';

//     /**
//      * Hiển thị thông báo cho người dùng.
//      * @param {string} msg - Nội dung thông báo.
//      * @param {string} type - Loại thông báo ('success', 'error', 'warning').
//      */
//     function showMessage(msg, type) {
//         if (messageDiv) {
//             messageDiv.textContent = msg;
//             messageDiv.className = `message ${type}`;
//             messageDiv.style.display = msg ? 'block' : 'none'; // Ẩn div nếu không có tin nhắn
//         }
//     }

//     /**
//      * Cập nhật trạng thái đăng nhập trên giao diện (ví dụ: header/navbar).
//      * @param {string|null} fullName - Tên đầy đủ của người dùng.
//      * @param {string|null} role - Vai trò của người dùng.
//      */
//     function updateLoginStatusDisplay(fullName, role) {
//         if (loginStatusElement) {
//             if (fullName && role === 'CBCNV') {
//                 // Hiển thị "Chào, [Tên đầy đủ]" và làm cho nó clickable đến trang profile
//                 loginStatusElement.innerHTML = `<i class="fas fa-user-circle"></i> Chào, ${fullName}`;
//                 loginStatusElement.href = "/sggd/gv/manage/profile_faculty";
//                 loginStatusElement.style.display = 'block'; // Đảm bảo hiển thị
//             } else {
//                 // Hiển thị trạng thái chưa đăng nhập
//                 loginStatusElement.innerHTML = `<i class="fas fa-sign-in-alt"></i> Đăng nhập`;
//                 loginStatusElement.href = '/auth/faculty_login/'; // URL trang đăng nhập
//                 // Có thể thêm logic ẩn/hiện các phần tử khác nếu cần
//             }
//         }
//     }

//     /**
//      * Xử lý sự kiện đăng nhập khi người dùng nhấn nút hoặc Enter.
//      * @param {Event} event - Đối tượng sự kiện.
//      */
//     async function handleLogin(event) {
//         event.preventDefault(); // Ngăn chặn hành vi submit mặc định của form (nếu có)

//         const email = emailInput.value.trim();
//         const password = passwordInput.value.trim();

//         if (!email || !password) {
//             showMessage('Vui lòng nhập đầy đủ email và mật khẩu.', 'error');
//             return;
//         }

//         if (loginBtn) { // Đảm bảo nút tồn tại trước khi thao tác
//             loginBtn.disabled = true; // Vô hiệu hóa nút đăng nhập khi đang xử lý
//             loginBtn.textContent = 'Đang đăng nhập...';
//         }
//         showMessage('', ''); // Xóa thông báo cũ

//         try {
//             const response = await fetch(loginApiUrl, {
//                 method: 'POST',
//                 headers: {
//                     'Content-Type': 'application/json',
//                     // Nếu bạn có CSRF token cho Django và view KHÔNG @csrf_exempt, hãy thêm vào đây
//                     // 'X-CSRFToken': getCookie('csrftoken'),
//                 },
//                 body: JSON.stringify({ email: email, password: password })
//             });

//             const data = await response.json();

//             if (response.ok) {
//                 showMessage(data.message || 'Đăng nhập thành công!', 'success');

//                 // --- BẮT ĐẦU PHẦN LƯU TRỮ LOCAL STORAGE ---
//                 // Xóa tất cả dữ liệu cũ trước khi lưu dữ liệu mới để đảm bảo sạch sẽ
//                 localStorage.clear();
//                 console.log('Đã xóa Local Storage cũ trước khi lưu dữ liệu mới.');

//                 // Lưu các trường cấp cao nhất của phản hồi
//                 if (data.user_id) localStorage.setItem('userId', data.user_id);
//                 if (data.token) localStorage.setItem('authToken', data.token);

//                 // Lưu thông tin từ user_data object (các trường của User + Faculty)
//                 if (data.user_data) {
//                     const userData = data.user_data;

//                     localStorage.setItem('userEmail', userData.email || '');
//                     const userFullName = `${userData.last_name || ''} ${userData.first_name || ''}`.trim(); // Họ trước Tên sau
//                     localStorage.setItem('userFullName', userFullName);

//                     localStorage.setItem('userPhone', userData.phone || '');
//                     localStorage.setItem('userGender', userData.gender || '');
//                     localStorage.setItem('userGenderDisplay', userData.gender_display || ''); // Lưu cả giá trị hiển thị

//                     const fullAddress = [
//                         userData.address,
//                         userData.district,
//                         userData.city
//                     ].filter(Boolean).join(', ');
//                     localStorage.setItem('userAddress', fullAddress || '');

//                     localStorage.setItem('userRole', userData.role || '');
//                     localStorage.setItem('userRoleDisplay', userData.role_display || ''); // Lưu cả giá trị hiển thị

//                     localStorage.setItem('userIsActive', userData.is_active ? 'true' : 'false');
//                     localStorage.setItem('userDateJoined', userData.date_joined || '');
//                     localStorage.setItem('userLastLogin', userData.last_login || '');
//                     localStorage.setItem('userNationalIdCard', userData.national_id_card || '');
//                     localStorage.setItem('userDateOfBirth', userData.date_of_birth || '');
//                     localStorage.setItem('userPlaceOfBirth', userData.place_of_birth || '');
//                     localStorage.setItem('userNationality', userData.nationality || '');
//                     localStorage.setItem('userEnrollmentDate', userData.enrollment_date || '');
//                     localStorage.setItem('userPhoto', userData.user_photo || '');

//                     // Các thông tin đặc thù của Faculty (nếu có trong user_data)
//                     localStorage.setItem('facultyCode', userData.faculty_code || '');
//                     localStorage.setItem('facultyType', userData.type || '');
//                     localStorage.setItem('facultyDepartmentName', userData.department_name || '');
//                     localStorage.setItem('facultyPosition', userData.position || '');
//                     localStorage.setItem('facultyDegree', userData.degree || '');
//                     localStorage.setItem('facultyOfficeLocation', userData.office_location || '');
//                     localStorage.setItem('facultyIsDepartmentHead', userData.is_department_head ? 'true' : 'false');

//                     // Cập nhật hiển thị trạng thái đăng nhập ngay lập tức
//                     updateLoginStatusDisplay(userFullName, userData.role);
//                 }
//                 // --- KẾT THÚC PHẦN LƯU TRỮ LOCAL STORAGE ---

//                 // Chuyển hướng người dùng đến trang dashboard giảng viên/cán bộ
//                 if (data.user_data && data.user_data.role === 'CBCNV') {
//                     window.location.href = '/sggd/gv/manage/home_faculty/';
//                 } else {
//                     showMessage('Đăng nhập thành công nhưng tài khoản không có quyền truy cập giảng viên/cán bộ.', 'error');
//                 }

//             } else {
//                 // Xử lý lỗi đăng nhập từ server
//                 let errorMessage = 'Đăng nhập thất bại. Vui lòng thử lại.';
//                 if (data.detail) {
//                     errorMessage = data.detail;
//                 } else if (data.email) { // Lỗi từ trường email
//                     errorMessage = data.email[0];
//                 } else if (data.password) { // Lỗi từ trường password
//                     errorMessage = data.password[0];
//                 } else if (data.non_field_errors) { // Lỗi chung không thuộc về trường cụ thể
//                     errorMessage = data.non_field_errors[0];
//                 }
//                 showMessage(errorMessage, 'error');
//             }
//         } catch (error) {
//             console.error('Lỗi khi gửi yêu cầu đăng nhập:', error);
//             showMessage('Đã xảy ra lỗi kết nối. Vui lòng kiểm tra lại mạng.', 'error');
//         } finally {
//             if (loginBtn) {
//                 loginBtn.disabled = false; // Kích hoạt lại nút đăng nhập
//                 loginBtn.textContent = 'Đăng nhập';
//             }
//         }
//     }

//     // --- GẮN CÁC SỰ KIỆN ---
//     if (loginBtn) {
//         loginBtn.addEventListener('click', handleLogin);
//     }

//     if (emailInput) {
//         emailInput.addEventListener('keypress', function(event) {
//             if (event.key === 'Enter') {
//                 handleLogin(event);
//             }
//         });
//     }
//     if (passwordInput) {
//         passwordInput.addEventListener('keypress', function(event) {
//             if (event.key === 'Enter') {
//                 handleLogin(event);
//             }
//         });
//     }

//     // --- KIỂM TRA TRẠNG THÁI ĐĂNG NHẬP KHI TẢI TRANG ---
//     // Phần này đảm bảo hiển thị trạng thái đúng khi người dùng quay lại trang
//     const storedUserFullName = localStorage.getItem('userFullName');
//     const storedUserRole = localStorage.getItem('userRole');
//     updateLoginStatusDisplay(storedUserFullName, storedUserRole);

//     // (Tùy chọn) Hàm để lấy CSRF token từ cookie Django
//     // Bạn chỉ cần hàm này nếu bạn đang sử dụng Session Authentication
//     // VÀ view API của bạn không @csrf_exempt
//     /*
//     function getCookie(name) {
//         let cookieValue = null;
//         if (document.cookie && document.cookie !== '') {
//             const cookies = document.cookie.split(';');
//             for (let i = 0; i < cookies.length; i++) {
//                 const cookie = cookies[i].trim();
//                 if (cookie.substring(0, name.length + 1) === (name + '=')) {
//                     cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
//                     break;
//                 }
//             }
//         }
//         return cookieValue;
//     }
//     */
// });


// /static/js/faculty_login.js
document.addEventListener('DOMContentLoaded', function() {
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const loginBtn = document.getElementById('loginBtn');
    const messageDiv = document.getElementById('message');

    // Thêm các element mới cho header
    const headerUserNameElement = document.getElementById('headerUserName');
    const headerUserAvatarElement = document.getElementById('headerUserAvatar');
    const headerUserAvatarLink = document.getElementById('headerUserAvatarLink'); // Lấy link avatar

    // URL của API đăng nhập giảng viên
    const loginApiUrl = 'https://saigongiadinh.pythonanywhere.com/auth/faculty_login/';

    /**
     * Hiển thị thông báo cho người dùng.
     * @param {string} msg - Nội dung thông báo.
     * @param {string} type - Loại thông báo ('success', 'error', 'warning').
     */
    function showMessage(msg, type) {
        if (messageDiv) {
            messageDiv.textContent = msg;
            messageDiv.className = `message ${type}`;
            messageDiv.style.display = msg ? 'block' : 'none'; // Ẩn div nếu không có tin nhắn
        }
    }

    /**
     * Cập nhật trạng thái đăng nhập và thông tin người dùng trên header.
     * @param {string|null} fullName - Tên đầy đủ của người dùng.
     * @param {string|null} userPhotoUrl - URL ảnh đại diện của người dùng.
     * @param {string|null} role - Vai trò của người dùng.
     */
    function updateHeaderUserInfo(fullName, userPhotoUrl, role) {
        // Cập nhật tên người dùng
        if (headerUserNameElement) {
            if (fullName && role === 'CBCNV') {
                headerUserNameElement.textContent = `Chào, ${fullName}!`;
                headerUserNameElement.style.display = 'inline'; // Đảm bảo hiển thị
            } else {
                headerUserNameElement.textContent = `Chào mừng!`; // Hoặc "Đăng nhập" tùy ý
                // Có thể ẩn hoặc chuyển hướng nếu không phải là CBCNV
            }
        }

        // Cập nhật ảnh đại diện và link
        if (headerUserAvatarElement) {
            if (userPhotoUrl && role === 'CBCNV') {
                headerUserAvatarElement.src = userPhotoUrl;
                headerUserAvatarElement.alt = `${fullName} Avatar`;
                if (headerUserAvatarLink) {
                    headerUserAvatarLink.style.display = 'block'; // Hiển thị avatar link
                }
            } else {
                // Nếu không có ảnh hoặc không phải CBCNV, hiển thị ảnh mặc định hoặc ẩn
                headerUserAvatarElement.src = "https://via.placeholder.com/40"; // Ảnh placeholder mặc định
                headerUserAvatarElement.alt = "User Avatar";
                if (headerUserAvatarLink) {
                    headerUserAvatarLink.style.display = 'block'; // Vẫn hiển thị link đến profile mặc định
                }
            }
        }
    }

    /**
     * Xử lý sự kiện đăng nhập khi người dùng nhấn nút hoặc Enter.
     * @param {Event} event - Đối tượng sự kiện.
     */
    async function handleLogin(event) {
        event.preventDefault(); // Ngăn chặn hành vi submit mặc định của form (nếu có)

        const email = emailInput.value.trim();
        const password = passwordInput.value.trim();

        if (!email || !password) {
            showMessage('Vui lòng nhập đầy đủ email và mật khẩu.', 'error');
            return;
        }

        if (loginBtn) { // Đảm bảo nút tồn tại trước khi thao tác
            loginBtn.disabled = true; // Vô hiệu hóa nút đăng nhập khi đang xử lý
            loginBtn.textContent = 'Đang đăng nhập...';
        }
        showMessage('', ''); // Xóa thông báo cũ

        try {
            const response = await fetch(loginApiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    // Nếu bạn có CSRF token cho Django và view KHÔNG @csrf_exempt, hãy thêm vào đây
                    // 'X-CSRFToken': getCookie('csrftoken'),
                },
                body: JSON.stringify({ email: email, password: password })
            });

            const data = await response.json();

            if (response.ok) {
                showMessage(data.message || 'Đăng nhập thành công!', 'success');

                // --- BẮT ĐẦU PHẦN LƯU TRỮ LOCAL STORAGE ---
                // Xóa tất cả dữ liệu cũ trước khi lưu dữ liệu mới để đảm bảo sạch sẽ
                localStorage.clear();
                console.log('Đã xóa Local Storage cũ trước khi lưu dữ liệu mới.');

                // Lưu các trường cấp cao nhất của phản hồi
                if (data.user_id) localStorage.setItem('userId', data.user_id);
                if (data.token) localStorage.setItem('authToken', data.token);

                // Lưu thông tin từ user_data object (các trường của User + Faculty)
                if (data.user_data) {
                    const userData = data.user_data;

                    localStorage.setItem('userEmail', userData.email || '');
                    const userFullName = `${userData.last_name || ''} ${userData.first_name || ''}`.trim(); // Họ trước Tên sau
                    localStorage.setItem('userFullName', userFullName);

                    localStorage.setItem('userPhone', userData.phone || '');
                    localStorage.setItem('userGender', userData.gender || '');
                    localStorage.setItem('userGenderDisplay', userData.gender_display || ''); // Lưu cả giá trị hiển thị

                    const fullAddress = [
                        userData.address,
                        userData.district,
                        userData.city
                    ].filter(Boolean).join(', ');
                    localStorage.setItem('userAddress', fullAddress || '');

                    localStorage.setItem('userRole', userData.role || '');
                    localStorage.setItem('userRoleDisplay', userData.role_display || ''); // Lưu cả giá trị hiển thị

                    localStorage.setItem('userIsActive', userData.is_active ? 'true' : 'false');
                    localStorage.setItem('userDateJoined', userData.date_joined || '');
                    localStorage.setItem('userLastLogin', userData.last_login || '');
                    localStorage.setItem('userNationalIdCard', userData.national_id_card || '');
                    localStorage.setItem('userDateOfBirth', userData.date_of_birth || '');
                    localStorage.setItem('userPlaceOfBirth', userData.place_of_birth || '');
                    localStorage.setItem('userNationality', userData.nationality || '');
                    localStorage.setItem('userEnrollmentDate', userData.enrollment_date || '');
                    
                    // LƯU Ý: Đảm bảo 'user_photo' tồn tại trong user_data từ API của bạn
                    localStorage.setItem('userPhoto', userData.user_photo || ''); 

                    // Các thông tin đặc thù của Faculty (nếu có trong user_data)
                    localStorage.setItem('facultyCode', userData.faculty_code || '');
                    localStorage.setItem('facultyType', userData.type || '');
                    localStorage.setItem('facultyDepartmentName', userData.department_name || '');
                    localStorage.setItem('facultyPosition', userData.position || '');
                    localStorage.setItem('facultyDegree', userData.degree || '');
                    localStorage.setItem('facultyOfficeLocation', userData.office_location || '');
                    localStorage.setItem('facultyIsDepartmentHead', userData.is_department_head ? 'true' : 'false');

                    // Cập nhật hiển thị header ngay lập tức
                    updateHeaderUserInfo(userFullName, userData.user_photo, userData.role);
                }
                // --- KẾT THÚC PHẦN LƯU TRỮ LOCAL STORAGE ---

                // Chuyển hướng người dùng đến trang dashboard giảng viên/cán bộ
                if (data.user_data && data.user_data.role === 'CBCNV') {
                    window.location.href = '/sggd/gv/manage/home_faculty/';
                } else {
                    showMessage('Đăng nhập thành công nhưng tài khoản không có quyền truy cập giảng viên/cán bộ.', 'error');
                }

            } else {
                // Xử lý lỗi đăng nhập từ server
                let errorMessage = 'Đăng nhập thất bại. Vui lòng thử lại.';
                if (data.detail) {
                    errorMessage = data.detail;
                } else if (data.email) { // Lỗi từ trường email
                    errorMessage = data.email[0];
                } else if (data.password) { // Lỗi từ trường password
                    errorMessage = data.password[0];
                } else if (data.non_field_errors) { // Lỗi chung không thuộc về trường cụ thể
                    errorMessage = data.non_field_errors[0];
                }
                showMessage(errorMessage, 'error');
            }
        } catch (error) {
            console.error('Lỗi khi gửi yêu cầu đăng nhập:', error);
            showMessage('Đã xảy ra lỗi kết nối. Vui lòng kiểm tra lại mạng.', 'error');
        } finally {
            if (loginBtn) {
                loginBtn.disabled = false; // Kích hoạt lại nút đăng nhập
                loginBtn.textContent = 'Đăng nhập';
            }
        }
    }

    // --- GẮN CÁC SỰ KIỆN ---
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

    // --- KIỂM TRA TRẠNG THÁI ĐĂNG NHẬP KHI TẢI TRANG ---
    // Phần này đảm bảo hiển thị trạng thái đúng khi người dùng quay lại trang
    const storedUserFullName = localStorage.getItem('userFullName');
    const storedUserPhoto = localStorage.getItem('userPhoto'); // Lấy ảnh từ localStorage
    const storedUserRole = localStorage.getItem('userRole');
    
    // Cập nhật header ngay khi DOMContentLoaded
    updateHeaderUserInfo(storedUserFullName, storedUserPhoto, storedUserRole);

});
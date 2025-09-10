
        // const API_URL = "https://saigongiadinh.pythonanywhere.com/students/me/";
        // const LOGIN_PAGE_URL = "/dangnhap"; 
        // const LOGOUT_API_URL = "https://saigongiadinh.pythonanywhere.com/auth/logout/";
       

        // // Lấy các phần tử DOM (unchanged, but re-order for clarity)
        // const studentInfoDiv = document.getElementById('student-info');
        // const errorMessageDiv = document.getElementById('error-message');
        // const loginRequiredDiv = document.getElementById('login-required');
        // const logoutBtn = document.getElementById('logoutBtn');
        // const containerDiv = document.querySelector('.container7');
        
      

        // async function fetchStudentInfo() {
        //     const authToken = localStorage.getItem('authToken');

        //     if (containerDiv) {
        //         containerDiv.classList.add('fade-in-container7');
        //     }

        //     if (!authToken) {
        //         studentInfoDiv.innerHTML = '';
        //         loginRequiredDiv.style.display = 'flex';
        //         logoutBtn.style.display = 'none'; 
        //         if (changePasswordTrigger) { 
        //             changePasswordTrigger.style.display = 'none'; // Ẩn nút nếu chưa đăng nhập
        //         }
        //         return;
        //     }

        //     logoutBtn.style.display = 'flex'; // Sử dụng 'flex' để phù hợp với flexbox của action-buttons-container
        //     if (changePasswordTrigger) { 
        //         changePasswordTrigger.style.display = 'flex'; // Hiển thị nút nếu đã đăng nhập
        //     }

        //     studentInfoDiv.innerHTML = '<p class="loading7">Đang tải thông tin...</p>';
        //     errorMessageDiv.style.display = 'none';
        //     loginRequiredDiv.style.display = 'none';

        //     const loadingParagraph = studentInfoDiv.querySelector('.loading7');
        //     if (loadingParagraph) {
        //         loadingParagraph.classList.remove('hide7');
        //     }

        //     try {
        //         const response = await fetch(API_URL, {
        //             method: 'GET',
        //             headers: {
        //                 'Content-Type': 'application/json',
        //                 'Authorization': `Token ${authToken}`
        //             }
        //         });

        //         if (!response.ok) {
        //             if (response.status === 401 || response.status === 403) {
        //                 localStorage.removeItem('authToken');
        //                 localStorage.removeItem('userId');
        //                 localStorage.removeItem('userEmail');
        //                 localStorage.removeItem('userRole');
        //                 localStorage.removeItem('userFullName');
        //                 window.location.href = LOGIN_PAGE_URL;
        //                 return;
        //             }
        //             const errorData = await response.json();
        //             throw new Error(errorData.detail || `Lỗi khi tải thông tin: ${response.status} ${response.statusText}`);
        //         }

        //         const data = await response.json();
        //         displayStudentInfo(data);

        //     } catch (error) {
        //         console.error("Lỗi khi fetch thông tin sinh viên:", error);
        //         studentInfoDiv.innerHTML = '';
        //         errorMessageDiv.innerHTML = `
        //             <i class="fas fa-exclamation-circle"></i>
        //             <span class="error-text">Lỗi: ${error.message}</span>
        //         `;
        //         errorMessageDiv.style.display = 'flex';
        //     } finally {
        //         const finalLoadingParagraph = studentInfoDiv.querySelector('.loading7');
        //         if (finalLoadingParagraph) {
        //             finalLoadingParagraph.classList.add('hide7');
        //         }
        //     }
        // }

        
    
   
   


        // function displayStudentInfo(student) {
        //     const loadingParagraph = studentInfoDiv.querySelector('.loading7');
        //     if (loadingParagraph) {
        //         loadingParagraph.classList.add('hide7');
        //     }

        //     studentInfoDiv.innerHTML = `
        //         <div class="profile-header7">
        //             <img src="${student.user_photo}" 
        //                  alt="${student.full_name || 'Ảnh đại diện'}" 
        //                  class="profile-avatar7" 
        //                  id="profile-avatar7"
        //                  >
        //             <h2 id="student-name7">${student.full_name || 'N/A'}</h2>
        //             <p id="student-id7"><i class="fas fa-id-card"></i> ${student.student_code || 'N/A'}</p>
        //         </div>
        //         <div class="profile-details7">
        //             <div class="detail-item7">
        //                 <span class="detail-label7"><i class="fas fa-envelope"></i> Email</span>
        //                 <span class="detail-value7" id="student-email7">${student.email || 'N/A'}</span>
        //             </div>
        //             <div class="detail-item7">
        //                 <span class="detail-label7"><i class="fas fa-user"></i> Họ</span>
        //                 <span class="detail-value7" id="student-lastname7">${student.last_name || 'N/A'}</span>
        //             </div>
        //             <div class="detail-item7">
        //                 <span class="detail-label7"><i class="fas fa-user-circle"></i> Tên đệm & Tên</span>
        //                 <span class="detail-value7" id="student-firstname7">${student.first_name || 'N/A'}</span>
        //             </div>
        //             <div class="detail-item7">
        //                 <span class="detail-label7"><i class="fa-solid fa-cake-candles"></i>Ngày sinh</span>
        //                 <span class="detail-value7" id="student-firstname7">
        //                     ${
        //                         student.date_of_birth
        //                             ? new Date(student.date_of_birth).toLocaleDateString('vi-VN', {
        //                                 day: '2-digit',
        //                                 month: '2-digit',
        //                                 year: 'numeric',
        //                             })
        //                             : 'N/A'
        //                     }
        //                 </span>
        //             </div>
        //             <div class="detail-item7">
        //                 <span class="detail-label7"><i class="fa-solid fa-briefcase"></i> Khoa</span>
        //                 <span class="detail-value7" id="student-firstname7">${student.department_name || 'N/A'}</span>
        //             </div>
        //             <div class="detail-item7">
        //                 <span class="detail-label7"><i class="fa-solid fa-chalkboard"></i>Ngành</span>
        //                 <span class="detail-value7" id="student-firstname7">${student.major_name || 'N/A'}</span>
        //             </div>
                    
        //            <div class="detail-item7">
        //                 <span class="detail-label7"><i class="fa-solid fa-box-archive"></i>Hệ đào tạo</span>
        //                 <span class="detail-value7" id="student-firstname7">
        //                     ${
        //                         (() => {
        //                             switch (student.program_name) {
        //                                 case 'CHINH_QUY':
        //                                     return 'CHÍNH QUY';
        //                                 case 'PHO_THONG_CAO_DANG':
        //                                     return 'Phổ thông cao đẳng 9+';
        //                                 case 'LIEN_THONG_VAN_BANG_2_CAO_DANG':
        //                                     return 'Liên thông/Văn bằng 2 cao đẳng';
        //                                 case 'LIEN_THONG_VAN_BANG_2_DAI_HOC':
        //                                     return 'Liên thông/Văn bằng 2 đại học';
        //                                 default:
        //                                     return student.program_name || 'N/A';
        //                             }
        //                         })()
        //                     }
        //                 </span>
        //             </div>
        //             <div class="detail-item7">
        //                 <span class="detail-label7"><i class="fa-solid fa-graduation-cap"></i>Niên khóa</span>
        //                 <span class="detail-value7" id="student-firstname7">${student.academic_year_name || 'N/A'}</span>
        //             </div>
        //         </div>
        //     `;
        // }

        // async function handleLogout() {
        //     const originalButtonText = logoutBtn.innerHTML;

        //     logoutBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Đang đăng xuất...';
        //     logoutBtn.disabled = true;

        //     const authToken = localStorage.getItem('authToken'); 
        //     if (authToken) { 
        //         try {
        //             const response = await fetch(LOGOUT_API_URL, {
        //                 method: 'POST',
        //                 headers: {
        //                     'Content-Type': 'application/json',
        //                     'Authorization': `Token ${authToken}`
        //                 }
        //             });

        //             if (response.ok) {
        //                 console.log('Đăng xuất thành công trên server.');
        //             } else {
        //                 const errorData = await response.json();
        //                 console.error('Lỗi khi gửi yêu cầu logout tới server:', errorData.detail || 'Lỗi không xác định.');
        //             }
        //         } catch (error) {
        //             console.error('Lỗi khi gửi yêu cầu logout (mạng hoặc CORS):', error);
        //         }
        //     }

        //     localStorage.removeItem('authToken');
        //     localStorage.removeItem('userId');
        //     localStorage.removeItem('userEmail');
        //     localStorage.removeItem('userRole');
        //     localStorage.removeItem('userFullName');

        //     setTimeout(() => {
        //         logoutBtn.innerHTML = originalButtonText;
        //         logoutBtn.disabled = false;
        //         window.location.href = LOGIN_PAGE_URL;
        //     }, 1000);
        // }
        // document.addEventListener('DOMContentLoaded', () => {
        //     fetchStudentInfo();

        //     if (logoutBtn) {
        //         logoutBtn.addEventListener('click', handleLogout);
        //     }

        //     const loginPromptLink = document.querySelector('#login-required a');
        //     if (loginPromptLink) {
        //         loginPromptLink.href = LOGIN_PAGE_URL;
        //     }

        //     if (changePasswordTrigger) {
        //         changePasswordTrigger.addEventListener('click', () => {
        //             changePasswordModal.style.display = 'flex';
        //             passwordMessageDiv.style.display = 'none';
        //             passwordMessageDiv.classList.remove('success', 'error');
        //             document.getElementById('current-password').value = '';
        //             document.getElementById('new-password').value = '';
        //             document.getElementById('confirm-new-password').value = '';
        //         });
        //     }

        //     if (closeModalBtn) {
        //         closeModalBtn.addEventListener('click', () => {
        //             changePasswordModal.style.display = 'none';
        //         });
        //     }

        //     window.addEventListener('click', (event) => {
        //         if (event.target == changePasswordModal) {
        //             changePasswordModal.style.display = 'none';
        //         }
        //     });

        //     if (changePasswordForm) {
        //         changePasswordForm.addEventListener('submit', handleChangePassword);
        //     }
        // });



// const API_URL = "https://saigongiadinh.pythonanywhere.com/students/me/";
// const LOGIN_PAGE_URL = "/dangnhap";
// const LOGOUT_API_URL = "https://saigongiadinh.pythonanywhere.com/auth/logout/";
// const CHANGE_PASSWORD_API_URL = "https://saigongiadinh.pythonanywhere.com/auth/change-password/";

// // Lấy các phần tử DOM
// const studentInfoDiv = document.getElementById('student-info');
// const errorMessageDiv = document.getElementById('error-message');
// const loginRequiredDiv = document.getElementById('login-required');
// const logoutBtn = document.getElementById('logoutBtn');
// const changePasswordTrigger = document.getElementById('changePasswordTrigger');
// const containerDiv = document.querySelector('.container7');
// const changePasswordModal = document.getElementById('changePasswordModal');
// const closeModalBtn = document.getElementById('closeModalBtn');
// const changePasswordForm = document.getElementById('changePasswordForm');
// const oldPasswordInput = document.getElementById('oldPassword');
// const newPasswordInput = document.getElementById('newPassword');
// const confirmNewPasswordInput = document.getElementById('confirmNewPassword');
// const submitPasswordBtn = document.getElementById('submitPasswordBtn');
// const passwordMessageDiv = document.getElementById('passwordMessage');


// async function fetchStudentInfo() {
//     const authToken = localStorage.getItem('authToken');

//     if (containerDiv) {
//         containerDiv.classList.add('fade-in-container7');
//     }

//     if (!authToken) {
//         studentInfoDiv.innerHTML = '';
//         loginRequiredDiv.style.display = 'flex';
//         logoutBtn.style.display = 'none';
//         if (changePasswordTrigger) {
//             changePasswordTrigger.style.display = 'none'; // Ẩn nút nếu chưa đăng nhập
//         }
//         return;
//     }

//     logoutBtn.style.display = 'flex';
//     if (changePasswordTrigger) {
//         changePasswordTrigger.style.display = 'flex'; // Hiển thị nút nếu đã đăng nhập
//     }

//     studentInfoDiv.innerHTML = '<p class="loading7">Đang tải thông tin...</p>';
//     errorMessageDiv.style.display = 'none';
//     loginRequiredDiv.style.display = 'none';

//     const loadingParagraph = studentInfoDiv.querySelector('.loading7');
//     if (loadingParagraph) {
//         loadingParagraph.classList.remove('hide7');
//     }

//     try {
//         const response = await fetch(API_URL, {
//             method: 'GET',
//             headers: {
//                 'Content-Type': 'application/json',
//                 'Authorization': `Token ${authToken}`
//             }
//         });

//         if (!response.ok) {
//             if (response.status === 401 || response.status === 403) {
//                 localStorage.removeItem('authToken');
//                 localStorage.removeItem('userId');
//                 localStorage.removeItem('userEmail');
//                 localStorage.removeItem('userRole');
//                 localStorage.removeItem('userFullName');
//                 window.location.href = LOGIN_PAGE_URL;
//                 return;
//             }
//             const errorData = await response.json();
//             throw new Error(errorData.detail || `Lỗi khi tải thông tin: ${response.status} ${response.statusText}`);
//         }

//         const data = await response.json();
//         displayStudentInfo(data);

//     } catch (error) {
//         console.error("Lỗi khi fetch thông tin sinh viên:", error);
//         studentInfoDiv.innerHTML = '';
//         errorMessageDiv.innerHTML = `
//             <i class="fas fa-exclamation-circle"></i>
//             <span class="error-text">Lỗi: ${error.message}</span>
//         `;
//         errorMessageDiv.style.display = 'flex';
//     } finally {
//         const finalLoadingParagraph = studentInfoDiv.querySelector('.loading7');
//         if (finalLoadingParagraph) {
//             finalLoadingParagraph.classList.add('hide7');
//         }
//     }
// }


// function displayStudentInfo(student) {
//     const loadingParagraph = studentInfoDiv.querySelector('.loading7');
//     if (loadingParagraph) {
//         loadingParagraph.classList.add('hide7');
//     }

//     studentInfoDiv.innerHTML = `
//         <div class="profile-header7">
//             <img src="${student.user_photo}"
//                  alt="${student.full_name || 'Ảnh đại diện'}"
//                  class="profile-avatar7"
//                  id="profile-avatar7"
//                  >
//             <h2 id="student-name7">${student.full_name || 'N/A'}</h2>
//             <p id="student-id7"><i class="fas fa-id-card"></i> ${student.student_code || 'N/A'}</p>
//         </div>
//         <div class="profile-details7">
//             <div class="detail-item7">
//                 <span class="detail-label7"><i class="fas fa-envelope"></i> Email</span>
//                 <span class="detail-value7" id="student-email7">${student.email || 'N/A'}</span>
//             </div>
//             <div class="detail-item7">
//                 <span class="detail-label7"><i class="fas fa-user"></i> Họ</span>
//                 <span class="detail-value7" id="student-lastname7">${student.last_name || 'N/A'}</span>
//             </div>
//             <div class="detail-item7">
//                 <span class="detail-label7"><i class="fas fa-user-circle"></i> Tên đệm & Tên</span>
//                 <span class="detail-value7" id="student-firstname7">${student.first_name || 'N/A'}</span>
//             </div>
//             <div class="detail-item7">
//                 <span class="detail-label7"><i class="fa-solid fa-cake-candles"></i>Ngày sinh</span>
//                 <span class="detail-value7" id="student-firstname7">
//                     ${
//                         student.date_of_birth
//                             ? new Date(student.date_of_birth).toLocaleDateString('vi-VN', {
//                                   day: '2-digit',
//                                   month: '2-digit',
//                                   year: 'numeric',
//                               })
//                             : 'N/A'
//                     }
//                 </span>
//             </div>
//             <div class="detail-item7">
//                 <span class="detail-label7"><i class="fa-solid fa-briefcase"></i> Khoa</span>
//                 <span class="detail-value7" id="student-firstname7">${student.department_name || 'N/A'}</span>
//             </div>
//             <div class="detail-item7">
//                 <span class="detail-label7"><i class="fa-solid fa-chalkboard"></i>Ngành</span>
//                 <span class="detail-value7" id="student-firstname7">${student.major_name || 'N/A'}</span>
//             </div>
            
//            <div class="detail-item7">
//                 <span class="detail-label7"><i class="fa-solid fa-box-archive"></i>Hệ đào tạo</span>
//                 <span class="detail-value7" id="student-firstname7">
//                     ${
//                         (() => {
//                             switch (student.program_name) {
//                                 case 'CHINH_QUY':
//                                     return 'CHÍNH QUY';
//                                 case 'PHO_THONG_CAO_DANG':
//                                     return 'Phổ thông cao đẳng 9+';
//                                 case 'LIEN_THONG_VAN_BANG_2_CAO_DANG':
//                                     return 'Liên thông/Văn bằng 2 cao đẳng';
//                                 case 'LIEN_THONG_VAN_BANG_2_DAI_HOC':
//                                     return 'Liên thông/Văn bằng 2 đại học';
//                                 default:
//                                     return student.program_name || 'N/A';
//                             }
//                         })()
//                     }
//                 </span>
//             </div>
//             <div class="detail-item7">
//                 <span class="detail-label7"><i class="fa-solid fa-graduation-cap"></i>Niên khóa</span>
//                 <span class="detail-value7" id="student-firstname7">${student.academic_year_name || 'N/A'}</span>
//             </div>
//         </div>
//     `;
// }

// async function handleLogout() {
//     const originalButtonText = logoutBtn.innerHTML;

//     logoutBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Đang đăng xuất...';
//     logoutBtn.disabled = true;

//     const authToken = localStorage.getItem('authToken');
//     if (authToken) {
//         try {
//             const response = await fetch(LOGOUT_API_URL, {
//                 method: 'POST',
//                 headers: {
//                     'Content-Type': 'application/json',
//                     'Authorization': `Token ${authToken}`
//                 }
//             });

//             if (response.ok) {
//                 console.log('Đăng xuất thành công trên server.');
//             } else {
//                 const errorData = await response.json();
//                 console.error('Lỗi khi gửi yêu cầu logout tới server:', errorData.detail || 'Lỗi không xác định.');
//             }
//         } catch (error) {
//             console.error('Lỗi khi gửi yêu cầu logout (mạng hoặc CORS):', error);
//         }
//     }

//     localStorage.removeItem('authToken');
//     localStorage.removeItem('userId');
//     localStorage.removeItem('userEmail');
//     localStorage.removeItem('userRole');
//     localStorage.removeItem('userFullName');

//     setTimeout(() => {
//         logoutBtn.innerHTML = originalButtonText;
//         logoutBtn.disabled = false;
//         window.location.href = LOGIN_PAGE_URL;
//     }, 1000);
// }

// function showMessage(message, type) {
//     passwordMessageDiv.textContent = message;
//     passwordMessageDiv.className = `password-message ${type}`;
//     passwordMessageDiv.style.display = 'block';
//     if (type === 'success') {
//         setTimeout(() => {
//             passwordMessageDiv.style.display = 'none';
//         }, 5000); // Ẩn thông báo sau 5 giây nếu thành công
//     }
// }

// async function handleChangePassword(event) {
//     event.preventDefault();

//     const oldPassword = oldPasswordInput.value;
//     const newPassword = newPasswordInput.value;
//     const confirmNewPassword = confirmNewPasswordInput.value;

//     if (newPassword !== confirmNewPassword) {
//         showMessage('Mật khẩu mới và xác nhận mật khẩu không khớp.', 'error');
//         return;
//     }

//     const authToken = localStorage.getItem('authToken');
//     if (!authToken) {
//         showMessage('Bạn chưa đăng nhập. Vui lòng đăng nhập lại.', 'error');
//         return;
//     }

//     submitPasswordBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Đang xử lý...';
//     submitPasswordBtn.disabled = true;
//     passwordMessageDiv.style.display = 'none';

//     try {
//         const response = await fetch(CHANGE_PASSWORD_API_URL, {
//             method: 'POST',
//             headers: {
//                 'Content-Type': 'application/json',
//                 'Authorization': `Token ${authToken}`
//             },
//             body: JSON.stringify({
//                 old_password: oldPassword,
//                 new_password: newPassword
//             })
//         });

//         if (response.ok) {
//             showMessage('Đổi mật khẩu thành công! Vui lòng đăng nhập lại.', 'success');
//             // Tự động đăng xuất sau khi đổi mật khẩu thành công để bảo mật hơn
//             setTimeout(() => {
//                 handleLogout();
//             }, 2000);
//         } else {
//             const errorData = await response.json();
//             const errorMessage = errorData.old_password ? errorData.old_password[0] : (errorData.new_password ? errorData.new_password[0] : (errorData.detail || 'Có lỗi xảy ra khi đổi mật khẩu.'));
//             showMessage(`Lỗi: ${errorMessage}`, 'error');
//         }
//     } catch (error) {
//         console.error("Lỗi khi đổi mật khẩu:", error);
//         showMessage('Lỗi kết nối hoặc mạng. Vui lòng thử lại.', 'error');
//     } finally {
//         submitPasswordBtn.innerHTML = 'Cập Nhật Mật Khẩu';
//         submitPasswordBtn.disabled = false;
//     }
// }


// document.addEventListener('DOMContentLoaded', () => {
//     fetchStudentInfo();

//     if (logoutBtn) {
//         logoutBtn.addEventListener('click', handleLogout);
//     }

//     const loginPromptLink = document.querySelector('#login-required a');
//     if (loginPromptLink) {
//         loginPromptLink.href = LOGIN_PAGE_URL;
//     }

//     // Event listener cho nút mở modal đổi mật khẩu
//     if (changePasswordTrigger) {
//         changePasswordTrigger.addEventListener('click', () => {
//             changePasswordModal.style.display = 'flex';
           
          
//             oldPasswordInput.value = '';
//             newPasswordInput.value = '';
//             confirmNewPasswordInput.value = '';
//         });
//     }

//     // Event listener cho nút đóng modal
//     if (closeModalBtn) {
//         closeModalBtn.addEventListener('click', () => {
//             changePasswordModal.style.display = 'none';
//         });
//     }

//     // Event listener đóng modal khi click ra ngoài
//     window.addEventListener('click', (event) => {
//         if (event.target === changePasswordModal) {
//             changePasswordModal.style.display = 'none';
//         }
//     });

//     // Event listener cho form đổi mật khẩu
//     if (changePasswordForm) {
//         changePasswordForm.addEventListener('submit', handleChangePassword);
//     }
// });



const API_URL = "https://saigongiadinh.pythonanywhere.com/students/me/";
const LOGIN_PAGE_URL = "/dangnhap";
const LOGOUT_API_URL = "https://saigongiadinh.pythonanywhere.com/auth/logout/";
const CHANGE_PASSWORD_API_URL = "https://saigongiadinh.pythonanywhere.com/forgot-password/confirm-reset/";

// Lấy các phần tử DOM
const studentInfoDiv = document.getElementById('student-info');
const errorMessageDiv = document.getElementById('error-message');
const loginRequiredDiv = document.getElementById('login-required');
const logoutBtn = document.getElementById('logoutBtn');
const changePasswordTrigger = document.getElementById('changePasswordTrigger');
const containerDiv = document.querySelector('.container7');
const changePasswordModal = document.getElementById('changePasswordModal');
const closeModalBtn = document.getElementById('closeModalBtn');
const changePasswordForm = document.getElementById('changePasswordForm');
const oldPasswordInput = document.getElementById('oldPassword');
const newPasswordInput = document.getElementById('newPassword');
const confirmNewPasswordInput = document.getElementById('confirmNewPassword');
const submitPasswordBtn = document.getElementById('submitPasswordBtn');
const passwordMessageDiv = document.getElementById('passwordMessage');


async function fetchStudentInfo() {
    const authToken = localStorage.getItem('authToken');

    if (containerDiv) {
        containerDiv.classList.add('fade-in-container7');
    }

    if (!authToken) {
        studentInfoDiv.innerHTML = '';
        loginRequiredDiv.style.display = 'flex';
        logoutBtn.style.display = 'none';
        if (changePasswordTrigger) {
            changePasswordTrigger.style.display = 'none';
        }
        return;
    }

    logoutBtn.style.display = 'flex';
    if (changePasswordTrigger) {
        changePasswordTrigger.style.display = 'flex';
    }

    studentInfoDiv.innerHTML = '<p class="loading7">Đang tải thông tin...</p>';
    errorMessageDiv.style.display = 'none';
    loginRequiredDiv.style.display = 'none';

    const loadingParagraph = studentInfoDiv.querySelector('.loading7');
    if (loadingParagraph) {
        loadingParagraph.classList.remove('hide7');
    }

    try {
        const response = await fetch(API_URL, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Token ${authToken}`
            }
        });

        if (!response.ok) {
            if (response.status === 401 || response.status === 403) {
                localStorage.removeItem('authToken');
                localStorage.removeItem('userId');
                localStorage.removeItem('userEmail');
                localStorage.removeItem('userRole');
                localStorage.removeItem('userFullName');
                window.location.href = LOGIN_PAGE_URL;
                return;
            }
            const errorData = await response.json();
            throw new Error(errorData.detail || `Lỗi khi tải thông tin: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        displayStudentInfo(data);

    } catch (error) {
        console.error("Lỗi khi fetch thông tin sinh viên:", error);
        studentInfoDiv.innerHTML = '';
        errorMessageDiv.innerHTML = `
            <i class="fas fa-exclamation-circle"></i>
            <span class="error-text">Lỗi: ${error.message}</span>
        `;
        errorMessageDiv.style.display = 'flex';
    } finally {
        const finalLoadingParagraph = studentInfoDiv.querySelector('.loading7');
        if (finalLoadingParagraph) {
            finalLoadingParagraph.classList.add('hide7');
        }
    }
}


function displayStudentInfo(student) {
    const loadingParagraph = studentInfoDiv.querySelector('.loading7');
    if (loadingParagraph) {
        loadingParagraph.classList.add('hide7');
    }

    function formatProgramName(name) {
        switch (name) {
            case 'CHINH_QUY':
                return 'CHÍNH QUY';
            case 'PHO_THONG_CAO_DANG':
                return 'Phổ thông cao đẳng 9+';
            case 'LIEN_THONG_VAN_BANG_2_CAO_DANG':
                return 'Liên thông/Văn bằng 2 cao đẳng';
            case 'LIEN_THONG_VAN_BANG_2_DAI_HOC':
                return 'Liên thông/Văn bằng 2 đại học';
            default:
                return name || 'N/A';
        }
    }

    const details = [
        { label: 'Email', value: student.email, icon: 'fas fa-envelope' },
        { label: 'Họ', value: student.last_name, icon: 'fas fa-user' },
        { label: 'Tên đệm & Tên', value: student.first_name, icon: 'fas fa-user-circle' },
        {
            label: 'Ngày sinh',
            value: student.date_of_birth ? new Date(student.date_of_birth).toLocaleDateString('vi-VN', {
                day: '2-digit', month: '2-digit', year: 'numeric'
            }) : 'N/A',
            icon: 'fa-solid fa-cake-candles'
        },
        { label: 'Khoa', value: student.department_name, icon: 'fa-solid fa-briefcase' },
        { label: 'Ngành', value: student.major_name, icon: 'fa-solid fa-chalkboard' },
        { label: 'Hệ đào tạo', value: formatProgramName(student.program_name), icon: 'fa-solid fa-box-archive' },
        { label: 'Niên khóa', value: student.academic_year_name, icon: 'fa-solid fa-graduation-cap' }
    ];

    const detailsHtml = details.map(item => `
        <div class="detail-item7">
            <span class="detail-label7"><i class="${item.icon}"></i> ${item.label}</span>
            <span class="detail-value7">${item.value || 'N/A'}</span>
        </div>
    `).join('');

    studentInfoDiv.innerHTML = `
        <div class="profile-header7">
            <img src="${student.user_photo || ''}"
                 alt="${student.full_name || 'Ảnh đại diện'}"
                 class="profile-avatar7"
                 id="profile-avatar7">
            <h2 id="student-name7">${student.full_name || 'N/A'}</h2>
            <p id="student-id7"><i class="fas fa-id-card"></i> ${student.student_code || 'N/A'}</p>
        </div>
        <div class="profile-details7">
            ${detailsHtml}
        </div>
    `;
}


async function handleLogout() {
    const originalButtonText = logoutBtn.innerHTML;

    logoutBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Đang đăng xuất...';
    logoutBtn.disabled = true;

    const authToken = localStorage.getItem('authToken');
    if (authToken) {
        try {
            const response = await fetch(LOGOUT_API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Token ${authToken}`
                }
            });

            if (response.ok) {
                console.log('Đăng xuất thành công trên server.');
            } else {
                const errorData = await response.json();
                console.error('Lỗi khi gửi yêu cầu logout tới server:', errorData.detail || 'Lỗi không xác định.');
            }
        } catch (error) {
            console.error('Lỗi khi gửi yêu cầu logout (mạng hoặc CORS):', error);
        }
    }

    localStorage.removeItem('authToken');
    localStorage.removeItem('userId');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userFullName');

    setTimeout(() => {
        logoutBtn.innerHTML = originalButtonText;
        logoutBtn.disabled = false;
        window.location.href = LOGIN_PAGE_URL;
    }, 1000);
}

function showMessage(message, type) {
    passwordMessageDiv.textContent = message;
    passwordMessageDiv.className = `password-message ${type}`;
    passwordMessageDiv.style.display = 'block';
    if (type === 'success') {
        setTimeout(() => {
            passwordMessageDiv.style.display = 'none';
        }, 5000);
    }
}

async function handleChangePassword(event) {
    event.preventDefault();

    const oldPassword = oldPasswordInput.value;
    const newPassword = newPasswordInput.value;
    const confirmNewPassword = confirmNewPasswordInput.value;

    if (newPassword !== confirmNewPassword) {
        showMessage('Mật khẩu mới và xác nhận mật khẩu không khớp.', 'error');
        return;
    }

    const authToken = localStorage.getItem('authToken');
    if (!authToken) {
        showMessage('Bạn chưa đăng nhập. Vui lòng đăng nhập lại.', 'error');
        return;
    }

    submitPasswordBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Đang xử lý...';
    submitPasswordBtn.disabled = true;
    passwordMessageDiv.style.display = 'none';

    try {
        const response = await fetch(CHANGE_PASSWORD_API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Token ${authToken}`
            },
            body: JSON.stringify({
                old_password: oldPassword,
                new_password: newPassword,
                confirm_new_password: confirmNewPassword
            })
        });

        if (response.ok) {
            showMessage('Đổi mật khẩu thành công! Vui lòng đăng nhập lại.', 'success');
            setTimeout(() => {
                handleLogout();
            }, 2000);
        } else {
            const errorData = await response.json();
            const errorMessage = errorData.old_password ? errorData.old_password[0] : (errorData.new_password ? errorData.new_password[0] : (errorData.detail || 'Có lỗi xảy ra khi đổi mật khẩu.'));
            showMessage(`Lỗi: ${errorMessage}`, 'error');
        }
    } catch (error) {
        console.error("Lỗi khi đổi mật khẩu:", error);
        showMessage('Lỗi kết nối hoặc mạng. Vui lòng thử lại.', 'error');
    } finally {
        submitPasswordBtn.innerHTML = 'Cập Nhật Mật Khẩu';
        submitPasswordBtn.disabled = false;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    fetchStudentInfo();

    if (logoutBtn) {
        logoutBtn.addEventListener('click', handleLogout);
    }

    const loginPromptLink = document.querySelector('#login-required a');
    if (loginPromptLink) {
        loginPromptLink.href = LOGIN_PAGE_URL;
    }

    // Event listener cho nút mở modal đổi mật khẩu
    if (changePasswordTrigger) {
        changePasswordTrigger.addEventListener('click', () => {
            changePasswordModal.style.display = 'flex';
            // Thêm dòng này để xóa thông báo cũ khi mở lại modal
            passwordMessageDiv.style.display = 'none';
            passwordMessageDiv.classList.remove('success', 'error');

            oldPasswordInput.value = '';
            newPasswordInput.value = '';
            confirmNewPasswordInput.value = '';
        });
    }

    // Event listener cho nút đóng modal
    if (closeModalBtn) {
        closeModalBtn.addEventListener('click', () => {
            changePasswordModal.style.display = 'none';
        });
    }

    // Event listener đóng modal khi click ra ngoài
    window.addEventListener('click', (event) => {
        if (event.target === changePasswordModal) {
            changePasswordModal.style.display = 'none';
        }
    });

    // Event listener cho form đổi mật khẩu
    if (changePasswordForm) {
        changePasswordForm.addEventListener('submit', handleChangePassword);
    }
});
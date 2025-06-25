// document.addEventListener('DOMContentLoaded', () => {
//     const loginStatusLink = document.getElementById('loginStatusLink');
//  studentMenuLink = document.getElementById('studentMenuLink');
//     // Thêm dòng này để lấy phần tử HỌC BỔNG
//     const scholarshipMenuLink = document.getElementById('scholarshipMenuLink'); 


//     // Thời gian hết hạn của phiên (1 giờ = 60 * 60 * 1000 milliseconds)
//     const SESSION_EXPIRATION_TIME = 60 * 60 * 1000;

//     // Hàm xử lý đăng xuất
//     async function handleLogout(event) {
//         if (event) event.preventDefault();

//         const authToken = localStorage.getItem('authToken');

//         // Xóa token nếu đã có, để đảm bảo logout cục bộ ngay cả khi API lỗi
//         localStorage.removeItem('authToken');
//         localStorage.removeItem('userId');
//         localStorage.removeItem('userEmail');
//         localStorage.removeItem('userRole');
//         localStorage.removeItem('userFullName');
//         localStorage.removeItem('loginTime'); // Xóa cả thời gian đăng nhập

//         if (authToken) {
//             try {
//                 await axios.post('https://saigongiadinh.pythonanywhere.com/auth/logout/', {}, {
//                     headers: {
//                         'Authorization': `Token ${authToken}`
//                     }
//                 });
             
//             } catch (error) {
                
//                 // Vẫn tiếp tục xóa dữ liệu cục bộ ngay cả khi API lỗi
//             }
//         } else {
//             console.log('No auth token found, proceeding with local logout.');
//         }

//         alert('Bạn đã đăng xuất.');
//         updateLoginStatusUI(); // Cập nhật lại UI sau khi đăng xuất
//         window.location.href = '/'; // Điều hướng về trang chủ
//     }

//     // Hàm kiểm tra trạng thái đăng nhập và cập nhật UI
//     function updateLoginStatusUI() {
//         let authToken = localStorage.getItem('authToken');
//         let loginTime = localStorage.getItem('loginTime'); // Lấy thời gian đăng nhập
//         const userFullName = localStorage.getItem('userFullName');
//         const userRole = localStorage.getItem('userRole');

//         // Kiểm tra thời gian hết hạn
//         if (authToken && loginTime) {
//             const currentTime = Date.now();
//             const timeElapsed = currentTime - parseInt(loginTime); // Chuyển đổi loginTime về số

//             // Tính toán thời gian còn lại (có thể dùng để hiển thị cho người dùng)
//             const timeLeft = SESSION_EXPIRATION_TIME - timeElapsed;
//             const timeLeftMinutes = Math.floor(timeLeft / (60 * 1000));
//             const timeLeftSeconds = Math.floor((timeLeft % (60 * 1000)) / 1000);

            

//             if (timeElapsed > SESSION_EXPIRATION_TIME) {
//                 console.warn('Session expired. Clearing login data.');
//                 // Phiên đã hết hạn, xóa tất cả dữ liệu đăng nhập
//                 localStorage.removeItem('authToken');
//                 localStorage.removeItem('userId');
//                 localStorage.removeItem('userEmail');
//                 localStorage.removeItem('userRole');
//                 localStorage.removeItem('userFullName');
//                 localStorage.removeItem('loginTime');
//                 authToken = null; // Đặt lại authToken để force hiển thị trạng thái chưa đăng nhập
//             }
//         } else {
//             console.log('Không có phiên đăng nhập hoặc thông tin.');
//         }

//         if (authToken && userFullName && loginStatusLink) {
//             // Người dùng đã đăng nhập (và phiên chưa hết hạn)
//             loginStatusLink.innerHTML = `<i class="fas fa-user-circle"></i> Chào, ${userFullName}`;
//             loginStatusLink.href = "/profile";

//             if (studentMenuLink) {
//                 if (userRole === 'SINH_VIEN') {
//                     studentMenuLink.style.display = 'block';
//                 } else {
//                     studentMenuLink.style.display = 'none';
//                 }
//             }
            
//             // Ẩn mục HỌC BỔNG khi đã đăng nhập
//             if (scholarshipMenuLink) {
//                 scholarshipMenuLink.style.display = 'none';
//             }

//         } else if (loginStatusLink) {
//             // Người dùng chưa đăng nhập hoặc đã đăng xuất / phiên hết hạn
//             loginStatusLink.innerHTML = `<i class="fas fa-user"></i> ĐĂNG NHẬP SGC`;
//             // loginStatus.innerHTML = ``; // Dòng này có thể không cần thiết hoặc cần ngữ cảnh

//             loginStatusLink.href = "/dangnhap";

//             loginStatusLink.removeEventListener('click', (e) => e.preventDefault()); 
//             loginStatusLink.removeEventListener('click', handleLogout); 
            
           

//             if (studentMenuLink) {
//                 studentMenuLink.style.display = 'none';
//             }

//             // Hiện mục HỌC BỔNG khi chưa đăng nhập
//             if (scholarshipMenuLink) {
//                 scholarshipMenuLink.style.display = 'block';
//             }
//         } else {
            
//         }
//     }

//     // Gọi hàm cập nhật UI khi tải trang
//     updateLoginStatusUI();

//     // Lắng nghe sự kiện thay đổi localStorage để cập nhật UI giữa các tab
//     window.addEventListener('storage', (event) => {
//         if (event.key === 'userFullName' || event.key === 'authToken' || event.key === 'userRole' || event.key === 'loginTime') {
//             console.log('localStorage changed, updating UI...');
//             updateLoginStatusUI();
//         }
//     });

//     // Gắn sự kiện click cho nút đăng xuất (nếu có)
//     const logoutButton = document.getElementById('logoutButton'); 
//     if (logoutButton) {
//         logoutButton.addEventListener('click', handleLogout);
        
//     }

//     // Xử lý thanh điều hướng cố định khi cuộn
//     const mainNav = document.querySelector('.main-nav');
//     const scrollThreshold = 250; 

//     window.addEventListener('scroll', function() {
//         if (mainNav) {
//             if (window.scrollY >= scrollThreshold) {
//                 mainNav.classList.add('fixed');
//             } else {
//                 mainNav.classList.remove('fixed');
//             }
//         }
//     });

    
// });



document.addEventListener('DOMContentLoaded', () => {
    const loginStatusLink = document.getElementById('loginStatusLink');
    const studentMenuLink = document.getElementById('studentMenuLink');
    const scholarshipMenuLink = document.getElementById('scholarshipMenuLink'); 

    // Thời gian hết hạn của phiên (1 giờ = 60 * 60 * 1000 milliseconds)
    const SESSION_EXPIRATION_TIME = 60 * 60 * 1000;

    // Hàm xử lý đăng xuất
    async function handleLogout(event) {
        if (event) event.preventDefault();

        const authToken = localStorage.getItem('authToken');

        // Xóa token nếu đã có, để đảm bảo logout cục bộ ngay cả khi API lỗi
        localStorage.removeItem('authToken');
        localStorage.removeItem('userId');
        localStorage.removeItem('userEmail');
        localStorage.removeItem('userRole');
        localStorage.removeItem('userFullName');
        localStorage.removeItem('userPhone'); // Thêm dòng này để xóa phone
        localStorage.removeItem('loginTime'); // Xóa cả thời gian đăng nhập

        if (authToken) {
            try {
                await axios.post('https://saigongiadinh.pythonanywhere.com/auth/logout/', {}, {
                    headers: {
                        'Authorization': `Token ${authToken}`
                    }
                });
            } catch (error) {
                // Vẫn tiếp tục xóa dữ liệu cục bộ ngay cả khi API lỗi
            }
        } else {
            console.log('No auth token found, proceeding with local logout.');
        }

        alert('Bạn đã đăng xuất.');
        updateLoginStatusUI(); // Cập nhật lại UI sau khi đăng xuất
        window.location.href = '/'; // Điều hướng về trang chủ
    }

    // Hàm kiểm tra trạng thái đăng nhập và cập nhật UI
    function updateLoginStatusUI() {
        let authToken = localStorage.getItem('authToken');
        let loginTime = localStorage.getItem('loginTime'); // Lấy thời gian đăng nhập
        const userFullName = localStorage.getItem('userFullName');
        const userRole = localStorage.getItem('userRole');
        const userPhone = localStorage.getItem('userPhone'); // Lấy số điện thoại

        // Kiểm tra thời gian hết hạn
        if (authToken && loginTime) {
            const currentTime = Date.now();
            const timeElapsed = currentTime - parseInt(loginTime); // Chuyển đổi loginTime về số

            // Tính toán thời gian còn lại (có thể dùng để hiển thị cho người dùng)
            const timeLeft = SESSION_EXPIRATION_TIME - timeElapsed;
            const timeLeftMinutes = Math.floor(timeLeft / (60 * 1000));
            const timeLeftSeconds = Math.floor((timeLeft % (60 * 1000)) / 1000);

            if (timeElapsed > SESSION_EXPIRATION_TIME) {
                console.warn('Session expired. Clearing login data.');
                // Phiên đã hết hạn, xóa tất cả dữ liệu đăng nhập
                localStorage.removeItem('authToken');
                localStorage.removeItem('userId');
                localStorage.removeItem('userEmail');
                localStorage.removeItem('userRole');
                localStorage.removeItem('userFullName');
                localStorage.removeItem('userPhone'); // Xóa phone khi hết hạn
                localStorage.removeItem('loginTime');
                authToken = null; // Đặt lại authToken để force hiển thị trạng thái chưa đăng nhập
            }
        } else {
            console.log('Không có phiên đăng nhập hoặc thông tin.');
        }

        if (authToken && userFullName && loginStatusLink) {
            // Người dùng đã đăng nhập (và phiên chưa hết hạn)
            loginStatusLink.innerHTML = `<i class="fas fa-user-circle"></i> Chào, ${userFullName}`;
            loginStatusLink.href = "/profile";

            if (studentMenuLink) {
                if (userRole === 'SINH_VIEN') {
                    studentMenuLink.style.display = 'block';
                } else {
                    studentMenuLink.style.display = 'none';
                }
            }
            
            // Ẩn mục HỌC BỔNG khi đã đăng nhập
            if (scholarshipMenuLink) {
                scholarshipMenuLink.style.display = 'none';
            }

        } else if (loginStatusLink) {
            // Người dùng chưa đăng nhập hoặc đã đăng xuất / phiên hết hạn
            loginStatusLink.innerHTML = `<i class="fas fa-user"></i> ĐĂNG NHẬP SGC`;
            loginStatusLink.href = "/dangnhap";

            loginStatusLink.removeEventListener('click', (e) => e.preventDefault()); 
            loginStatusLink.removeEventListener('click', handleLogout); 
            
            if (studentMenuLink) {
                studentMenuLink.style.display = 'none';
            }

            // Hiện mục HỌC BỔNG khi chưa đăng nhập
            if (scholarshipMenuLink) {
                scholarshipMenuLink.style.display = 'block';
            }
        } else {
            
        }
    }

    // Gọi hàm cập nhật UI khi tải trang
    updateLoginStatusUI();

    // Lắng nghe sự kiện thay đổi localStorage để cập nhật UI giữa các tab
    window.addEventListener('storage', (event) => {
        if (event.key === 'userFullName' || event.key === 'authToken' || event.key === 'userRole' || event.key === 'loginTime' || event.key === 'userPhone') { // Thêm userPhone vào đây
            console.log('localStorage changed, updating UI...');
            updateLoginStatusUI();
        }
    });

    // Gắn sự kiện click cho nút đăng xuất (nếu có)
    const logoutButton = document.getElementById('logoutButton'); 
    if (logoutButton) {
        logoutButton.addEventListener('click', handleLogout);
        
    }

    // Xử lý thanh điều hướng cố định khi cuộn
    const mainNav = document.querySelector('.main-nav');
    const scrollThreshold = 250; 

    window.addEventListener('scroll', function() {
        if (mainNav) {
            if (window.scrollY >= scrollThreshold) {
                mainNav.classList.add('fixed');
            } else {
                mainNav.classList.remove('fixed');
            }
        }
    });

    // --- PHẦN BẠN CẦN THÊM VÀO KHI XỬ LÝ ĐĂNG NHẬP THÀNH CÔNG ---
    // Ví dụ về cách lưu dữ liệu sau khi nhận phản hồi từ API
    // Bạn cần tích hợp phần này vào hàm xử lý phản hồi đăng nhập của bạn (ví dụ: trong một sự kiện submit form)
    // Giả sử bạn có một hàm `handleLoginSuccess` được gọi khi API trả về dữ liệu thành công
    window.handleLoginSuccess = (responseData) => {
        const { token, user_id, email, role, user} = responseData;
        
        localStorage.setItem('authToken', token);
        localStorage.setItem('userId', user_id);
        localStorage.setItem('userEmail', email);
        localStorage.setItem('userRole', role);
        localStorage.setItem('userFullName', `${user.first_name} ${user.last_name}`);
        localStorage.setItem('userPhone', user.phone); // LƯU TRƯỜNG PHONE Ở ĐÂY
        localStorage.setItem('loginTime', Date.now()); // Lưu thời điểm đăng nhập

        updateLoginStatusUI(); // Cập nhật giao diện người dùng
        alert(responseData.message);
        window.location.href = '/'; // Chuyển hướng về trang chủ
    };
});
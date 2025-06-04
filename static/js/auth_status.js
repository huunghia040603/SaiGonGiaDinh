// /static/js/auth_status.js
document.addEventListener('DOMContentLoaded', () => {
    const loginStatusLink = document.getElementById('loginStatusLink');
    const studentMenuLink = document.getElementById('studentMenuLink'); 

    // Hàm xử lý đăng xuất
    async function handleLogout(event) {
        if (event) event.preventDefault(); // Ngăn chặn hành vi mặc định của link nếu được gọi từ sự kiện click

        const authToken = localStorage.getItem('authToken');
        console.log('Attempting logout...');

        if (authToken) {
            try {
                // Gửi request đến API logout của bạn
                await axios.post('https://saigongiadinh.pythonanywhere.com/auth/logout/', {}, {
                    headers: {
                        'Authorization': `Token ${authToken}`
                    }
                });
                console.log('Successfully logged out from API.');
            } catch (error) {
                console.error('Error logging out from API:', error);
                // Xử lý lỗi từ API nhưng vẫn tiếp tục xóa dữ liệu cục bộ
            }
        } else {
            console.log('No auth token found, proceeding with local logout.');
        }

        // Xóa tất cả các mục liên quan đến người dùng khỏi localStorage
        localStorage.removeItem('authToken');
        localStorage.removeItem('userId');
        localStorage.removeItem('userEmail');
        localStorage.removeItem('userRole');
        localStorage.removeItem('userFullName');

        alert('Bạn đã đăng xuất.');
        updateLoginStatusUI(); // Cập nhật lại UI sau khi đăng xuất
        window.location.href = '/'; // Điều hướng về trang chủ hoặc trang đăng nhập
    }

    // Hàm kiểm tra trạng thái đăng nhập và cập nhật UI
    function updateLoginStatusUI() {
        const authToken = localStorage.getItem('authToken');
        const userFullName = localStorage.getItem('userFullName');
        const userRole = localStorage.getItem('userRole');

        console.log('auth_status.js: Checking login status...');
        console.log('auth_status.js: authToken:', authToken ? 'Exist' : 'Not Exist');
        console.log('auth_status.js: userFullName:', userFullName);
        console.log('auth_status.js: userRole:', userRole);

        if (authToken && userFullName && loginStatusLink) {
            // Người dùng đã đăng nhập
            loginStatusLink.innerHTML = `<i class="fas fa-user-circle"></i> Chào, ${userFullName}`;
            loginStatusLink.href = "/profile"; 
            
            // XÓA DÒNG NÀY: loginStatusLink.removeEventListener('click', handleLogout); 
            // XÓA DÒNG NÀY: loginStatusLink.addEventListener('click', handleLogout); 
            // KHÔNG GÁN SỰ KIỆN ĐĂNG XUẤT TRỰC TIẾP CHO loginStatusLink KHI ĐÃ ĐĂNG NHẬP

            console.log(`auth_status.js: User "${userFullName}" is logged in. Header updated.`);

            if (studentMenuLink) {
                if (userRole === 'SINH_VIEN') { // Đảm bảo khớp chính xác role từ API
                    studentMenuLink.style.display = 'block'; 
                    console.log('auth_status.js: Student menu is visible.');
                } else {
                    studentMenuLink.style.display = 'none';
                    console.log('auth_status.js: Student menu is hidden (not a student).');
                }
            }
        } else if (loginStatusLink) {
            // Người dùng chưa đăng nhập hoặc đã đăng xuất
            loginStatusLink.innerHTML = `<i class="fas fa-user"></i> ĐĂNG NHẬP SGC`;
            loginStatusLink.href = "/dangnhap";

            // Khi chưa đăng nhập, gán sự kiện click để chuyển hướng đến trang đăng nhập
            // Xóa listener cũ trước khi thêm mới để tránh nhân đôi sự kiện
            loginStatusLink.removeEventListener('click', (e) => e.preventDefault()); // Xóa event listener của profile nếu có
            loginStatusLink.removeEventListener('click', handleLogout); // Đảm bảo xóa cả handleLogout nếu nó đã từng được gán
            // Không cần thêm listener cho "/dangnhap" vì thẻ <a> tự chuyển hướng
            
            console.log('auth_status.js: No user logged in. Header set to "ĐĂNG NHẬP SGC".');

            if (studentMenuLink) {
                studentMenuLink.style.display = 'none';
                console.log('auth_status.js: Student menu is hidden (not logged in).');
            }
        } else {
            console.warn('auth_status.js: loginStatusLink element not found on this page.');
        }
    }

    // Gọi hàm khi trang tải để kiểm tra trạng thái đăng nhập ban đầu
    updateLoginStatusUI();

    // Lắng nghe sự kiện 'storage' để cập nhật UI nếu localStorage thay đổi từ tab khác
    window.addEventListener('storage', (event) => {
        if (event.key === 'userFullName' || event.key === 'authToken' || event.key === 'userRole') {
            console.log('auth_status.js: localStorage changed, updating UI...');
            updateLoginStatusUI();
        }
    });

    // --- Thêm một nút hoặc liên kết Đăng Xuất riêng biệt ---
    // Ví dụ: Giả sử bạn có một nút/link Đăng xuất với id="logoutButton"
    const logoutButton = document.getElementById('logoutButton'); 
    if (logoutButton) {
        logoutButton.addEventListener('click', handleLogout);
        console.log('auth_status.js: Logout button event listener attached.');
    }
    // Nếu bạn muốn tích hợp đăng xuất vào menu thả xuống của profile, 
    // bạn sẽ cần điều chỉnh HTML của dropdown menu trong header.html và gán sự kiện cho item đó.

    // Phần code cho Sticky Navigation Bar (giữ nguyên)
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
});
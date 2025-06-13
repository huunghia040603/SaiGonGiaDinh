// /static/js/auth_status.js
document.addEventListener('DOMContentLoaded', () => {
    const loginStatusLink = document.getElementById('loginStatusLink');
    
    const studentMenuLink = document.getElementById('studentMenuLink'); 

    // Thời gian hết hạn của phiên (10 phút = 10 * 60 * 1000 milliseconds)
    const SESSION_EXPIRATION_TIME = 60 * 60 * 1000; // 1 giờ

    // Hàm xử lý đăng xuất
    async function handleLogout(event) {
        if (event) event.preventDefault();

        const authToken = localStorage.getItem('authToken');
        // console.log('Attempting logout...'); // Đã xóa

        // Xóa token nếu đã có, để đảm bảo logout cục bộ ngay cả khi API lỗi
        localStorage.removeItem('authToken');
        localStorage.removeItem('userId');
        localStorage.removeItem('userEmail');
        localStorage.removeItem('userRole');
        localStorage.removeItem('userFullName');
        localStorage.removeItem('loginTime'); // Xóa cả thời gian đăng nhập

        if (authToken) {
            try {
                await axios.post('https://saigongiadinh.pythonanywhere.com/auth/logout/', {}, {
                    headers: {
                        'Authorization': `Token ${authToken}`
                    }
                });
                // console.log('Successfully logged out from API.'); // Đã xóa
            } catch (error) {
                console.error('Error logging out from API:', error);
                // Vẫn tiếp tục xóa dữ liệu cục bộ ngay cả khi API lỗi
            }
        } else {
            // console.log('No auth token found, proceeding with local logout.'); // Đã xóa
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

        // console.log('auth_status.js: Checking login status...'); // Đã xóa
        // console.log('auth_status.js: authToken:', authToken ? 'Exist' : 'Not Exist'); // Đã xóa
        // console.log('auth_status.js: userFullName:', userFullName); // Đã xóa
        // console.log('auth_status.js: userRole:', userRole); // Đã xóa

        // Kiểm tra thời gian hết hạn
        if (authToken && loginTime) {
            const currentTime = Date.now();
            const timeElapsed = currentTime - parseInt(loginTime); // Chuyển đổi loginTime về số

            // Tính toán thời gian còn lại
            const timeLeft = SESSION_EXPIRATION_TIME - timeElapsed; // Thời gian còn lại tính bằng mili giây
            const timeLeftMinutes = Math.floor(timeLeft / (60 * 1000));
            const timeLeftSeconds = Math.floor((timeLeft % (60 * 1000)) / 1000);

            // console.log(`auth_status.js: Thời gian đăng nhập: ${new Date(parseInt(loginTime)).toLocaleString()}`); // Đã xóa
            
            if (timeLeft > 0) {
                // console.log(`auth_status.js: Thời gian còn lại của phiên: ${timeLeftMinutes} phút ${timeLeftSeconds} giây.`); // Đã xóa
            } else {
                console.warn('auth_status.js: Phiên đã hết hạn.');
            }


            if (timeElapsed > SESSION_EXPIRATION_TIME) {
                console.warn('auth_status.js: Session expired. Clearing login data.');
                // Phiên đã hết hạn, xóa tất cả dữ liệu đăng nhập
                localStorage.removeItem('authToken');
                localStorage.removeItem('userId');
                localStorage.removeItem('userEmail');
                localStorage.removeItem('userRole');
                localStorage.removeItem('userFullName');
                localStorage.removeItem('loginTime');
                authToken = null; // Đặt lại authToken để force hiển thị trạng thái chưa đăng nhập
            }
        } else {
            // console.log('auth_status.js: Không có phiên đăng nhập hoặc thông tin thời gian đăng nhập.'); // Đã xóa
        }

        if (authToken && userFullName && loginStatusLink) {
            // Người dùng đã đăng nhập (và phiên chưa hết hạn)
            loginStatusLink.innerHTML = `<i class="fas fa-user-circle"></i> Chào, ${userFullName}`;
            
            loginStatusLink.href = "/profile";
               
            

            if (studentMenuLink) {
                if (userRole === 'SINH_VIEN') {
                    studentMenuLink.style.display = 'block'; 
                    // console.log('auth_status.js: Student menu is visible.'); // Đã xóa
                } else {
                    studentMenuLink.style.display = 'none';
                    // console.log('auth_status.js: Student menu is hidden (not a student).'); // Đã xóa
                }
            }
        } else if (loginStatusLink) {
            // Người dùng chưa đăng nhập hoặc đã đăng xuất / phiên hết hạn
            loginStatusLink.innerHTML = `<i class="fas fa-user"></i> ĐĂNG NHẬP SGC`;
            loginStatus.innerHTML = ``;
            loginStatusLink.href = "/dangnhap";

            loginStatusLink.removeEventListener('click', (e) => e.preventDefault()); 
            loginStatusLink.removeEventListener('click', handleLogout); 
            
            // console.log('auth_status.js: No user logged in. Header set to "ĐĂNG NHẬP SGC".'); // Đã xóa

            if (studentMenuLink) {
                studentMenuLink.style.display = 'none';
                // console.log('auth_status.js: Student menu is hidden (not logged in).'); // Đã xóa
            }
        } else {
            console.warn('auth_status.js: loginStatusLink element not found on this page.');
        }
    }

    updateLoginStatusUI();

    window.addEventListener('storage', (event) => {
        if (event.key === 'userFullName' || event.key === 'authToken' || event.key === 'userRole' || event.key === 'loginTime') {
            // console.log('auth_status.js: localStorage changed, updating UI...'); // Đã xóa
            updateLoginStatusUI();
        }
    });

    const logoutButton = document.getElementById('logoutButton'); 
    if (logoutButton) {
        logoutButton.addEventListener('click', handleLogout);
        // console.log('auth_status.js: Logout button event listener attached.'); // Đã xóa
    }

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
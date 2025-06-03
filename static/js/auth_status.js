// /static/js/auth_status.js
document.addEventListener('DOMContentLoaded', () => {
    const loginStatusLink = document.getElementById('loginStatusLink');

    // Hàm kiểm tra trạng thái đăng nhập và cập nhật UI
    function updateLoginStatusUI() {
        const userName = localStorage.getItem('userFullName'); // Lấy tên từ localStorage
        console.log('auth_status.js: Checking login status...'); // Console log để kiểm tra
        if (userName && loginStatusLink) {
            loginStatusLink.innerHTML = `<i class="fas fa-user"></i> Chào, ${userName}`;
            loginStatusLink.href = "/profile"; // Thay đổi link tới trang cá nhân nếu cần
            console.log(`auth_status.js: User "${userName}" is logged in. Header updated.`); // Console log khi đăng nhập
        } else if (loginStatusLink) {
            loginStatusLink.innerHTML = `<i class="fas fa-user"></i> ĐĂNG NHẬP SGC`;
            loginStatusLink.href = "/dangnhap"; // Đảm bảo link trở lại trang đăng nhập
            console.log('auth_status.js: No user logged in. Header set to "ĐĂNG NHẬP SGC".'); // Console log khi chưa đăng nhập
        } else {
            console.warn('auth_status.js: loginStatusLink element not found on this page.'); // Cảnh báo nếu không tìm thấy phần tử
        }
    }

    // Gọi hàm khi trang tải để kiểm tra trạng thái đăng nhập ban đầu
    updateLoginStatusUI();

    // Bạn có thể thêm sự kiện 'storage' để lắng nghe thay đổi localStorage từ các tab khác
    window.addEventListener('storage', (event) => {
        if (event.key === 'userFullName' || event.key === 'authToken') {
            console.log('auth_status.js: localStorage changed, updating UI...');
            updateLoginStatusUI();
        }
    });

    // Thêm logic đăng xuất vào đây (nếu bạn có nút đăng xuất trong header.html)
    // const logoutButton = document.getElementById('logoutButton'); // Giả sử bạn có ID này cho nút đăng xuất
    // if (logoutButton) {
    //     logoutButton.addEventListener('click', (event) => {
    //         event.preventDefault();
    //         console.log('Logging out...');
    //         localStorage.clear(); // Xóa tất cả các mục liên quan đến người dùng
    //         updateLoginStatusUI(); // Cập nhật lại UI sau khi đăng xuất
    //         window.location.href = '/dangnhap'; // Chuyển hướng về trang đăng nhập
    //     });
    // }
});


    document.addEventListener('DOMContentLoaded', function() {
        const mainNav = document.querySelector('.main-nav');
        const scrollThreshold = 250; // Ngưỡng cuộn (px)

        window.addEventListener('scroll', function() {
            if (window.scrollY >= scrollThreshold) {
                mainNav.classList.add('fixed');
            } else {
                mainNav.classList.remove('fixed');
            }
        });
    });

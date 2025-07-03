document.addEventListener('DOMContentLoaded', () => {
    const logoutBtn = document.getElementById('sidebarLogoutBtn');

    if (logoutBtn) {
        logoutBtn.addEventListener('click', (event) => {
            event.preventDefault(); // Ngăn chặn hành vi mặc định của thẻ <a>

            // Xóa tất cả các thông tin liên quan đến phiên đăng nhập khỏi localStorage
            localStorage.removeItem('authToken');
            localStorage.removeItem('userId');
            localStorage.removeItem('userEmail');
            localStorage.removeItem('userRole');
            localStorage.removeItem('userFullName');
            localStorage.removeItem('teacherAuthToken'); // Đảm bảo xóa teacherAuthToken nếu có

            // Thông báo cho người dùng (tùy chọn)
            alert('Bạn đã đăng xuất thành công.');

            // Chuyển hướng về trang đăng nhập
            window.location.href = '/dangnhap'; 
        });
    } else {
        console.warn('Không tìm thấy nút đăng xuất với ID "sidebarLogoutBtn".');
    }
});
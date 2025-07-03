document.addEventListener('DOMContentLoaded', () => {
    const hamburgerBtn = document.getElementById('hamburgerMenuBtn');
    const closeBtn = document.getElementById('closeSidebarBtn');
    const sidebar = document.getElementById('sidebar');
    const layoutWrapper = document.querySelector('.layout-wrapper'); // Thêm lớp overlay

    if (hamburgerBtn && sidebar && layoutWrapper) {
        hamburgerBtn.addEventListener('click', () => {
            sidebar.classList.add('active'); // Hiển thị sidebar
            layoutWrapper.classList.add('sidebar-open'); // Thêm lớp để tạo overlay/shift
        });
    }

    if (closeBtn && sidebar && layoutWrapper) {
        closeBtn.addEventListener('click', () => {
            sidebar.classList.remove('active'); // Ẩn sidebar
            layoutWrapper.classList.remove('sidebar-open'); // Xóa lớp overlay/shift
        });
    }

    
   
});
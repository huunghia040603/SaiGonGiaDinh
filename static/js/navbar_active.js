document.addEventListener('DOMContentLoaded', function() {
    const navLinks = document.querySelectorAll('.nav-list a'); // Lấy tất cả các thẻ <a> trong nav-list
    const currentPath = window.location.pathname; // Lấy đường dẫn hiện tại của URL (ví dụ: /about)

    // Duyệt qua từng link trong menu
    navLinks.forEach(link => {
        // Lấy href của link và chuẩn hóa nó (loại bỏ dấu # nếu có, để chỉ lấy đường dẫn)
        let linkPath = link.getAttribute('href');
        if (linkPath && linkPath.includes('#')) {
            linkPath = linkPath.split('#')[0];
        }

        // Loại bỏ dấu gạch chéo cuối cùng nếu có, trừ khi đó là gốc "/"
        if (linkPath.endsWith('/') && linkPath.length > 1) {
            linkPath = linkPath.slice(0, -1);
        }
        if (currentPath.endsWith('/') && currentPath.length > 1) {
            currentPath = currentPath.slice(0, -1);
        }

        
        if (link.classList.contains('dropdown-toggle')) {
            const dropdownMenu = link.nextElementSibling; // Lấy ul.dropdown-menu
            if (dropdownMenu) {
                const dropdownItems = dropdownMenu.querySelectorAll('li a');
                let foundMatchInDropdown = false;
                dropdownItems.forEach(item => {
                    let itemPath = item.getAttribute('href');
                    if (itemPath && itemPath.includes('#')) {
                        itemPath = itemPath.split('#')[0];
                    }
                    if (itemPath.endsWith('/') && itemPath.length > 1) {
                        itemPath = itemPath.slice(0, -1);
                    }

                    if (currentPath === itemPath) {
                        link.classList.add('nav-item-active'); // Đánh dấu parent link là active
                        foundMatchInDropdown = true;
                    }
                });
                if (foundMatchInDropdown) {
                    return; // Nếu đã tìm thấy match trong dropdown, không kiểm tra link parent nữa
                }
            }
        }

        // Kiểm tra các link không phải dropdown-toggle hoặc link gốc
        if (currentPath === linkPath) {
            link.classList.add('nav-item-active');
        }
    });

    // Xử lý trường hợp Trang Chủ (/) nếu không có link con nào được active
    // Đảm bảo Trang Chủ vẫn active nếu không có đường dẫn cụ thể nào khác khớp
    // (ví dụ: khi ở trang gốc /)
    const homeLink = document.querySelector('.nav-list a[href="/"]');
    if (homeLink && currentPath === '/' && !document.querySelector('.nav-list a.nav-item-active')) {
        homeLink.classList.add('nav-item-active');
    }
});
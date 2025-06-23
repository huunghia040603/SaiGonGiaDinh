document.addEventListener('DOMContentLoaded', function() {
    const sidebarLinks = document.querySelectorAll('.sidebar ul li a');
    let currentPath = window.location.pathname;

    // Chuẩn hóa currentPath bằng cách loại bỏ dấu gạch chéo cuối cùng nếu không phải là gốc
    if (currentPath.endsWith('/') && currentPath.length > 1) {
        currentPath = currentPath.slice(0, -1);
    }
    // Đối với trang chủ tuyệt đối, đảm bảo nó là '/'
    if (currentPath === '') {
        currentPath = '/';
    }

    let bestMatchLink = null;
    let bestMatchLength = 0;

    sidebarLinks.forEach(link => {
        // Luôn loại bỏ lớp 'active' khỏi liên kết này trước khi kiểm tra
        link.classList.remove('active');

        let linkHref = link.getAttribute('href'); // Lấy thuộc tính href gốc

        // Bỏ qua các liên kết chỉ có '#'
        if (linkHref === '#') {
            return; // Bỏ qua liên kết này, không xem xét nó là active
        }

        let linkPath;
        try {
            linkPath = new URL(linkHref, window.location.origin).pathname; // Lấy đường dẫn từ href
        } catch (e) {
            console.error("Invalid URL in sidebar link:", linkHref, e);
            return; // Bỏ qua nếu href không phải là URL hợp lệ
        }

        // Chuẩn hóa linkPath bằng cách loại bỏ dấu gạch chéo cuối cùng nếu không phải là gốc
        if (linkPath.endsWith('/') && linkPath.length > 1) {
            linkPath = linkPath.slice(0, -1);
        }
        // Đối với trang chủ tuyệt đối, đảm bảo nó là '/'
        if (linkPath === '') {
            linkPath = '/';
        }

        // Kiểm tra xem liên kết có khớp với đường dẫn hiện tại không
        // Ưu tiên khớp chính xác hoặc đường dẫn dài hơn
        if (currentPath === linkPath) {
            // Khớp chính xác luôn là ưu tiên cao nhất
            // Nếu có nhiều khớp chính xác (không nên xảy ra với URL duy nhất, nhưng đề phòng)
            // thì liên kết đầu tiên khớp sẽ được chọn
            bestMatchLink = link;
            bestMatchLength = linkPath.length;
            // Dừng ngay nếu tìm thấy khớp chính xác hoàn hảo, vì không cần tìm kiếm thêm
            // break; // Bạn có thể thêm break ở đây nếu bạn chắc chắn không có URL trùng lặp
        } else if (currentPath.startsWith(linkPath) && linkPath !== '/') {
            // Nếu là tiền tố và không phải là Trang chủ
            // (Ví dụ: /registrations/123.html khớp với /registrations)
            if (linkPath.length > bestMatchLength) {
                bestMatchLink = link;
                bestMatchLength = linkPath.length;
            }
        }
    });

    // Chỉ thêm lớp 'active' cho liên kết phù hợp nhất được tìm thấy
    if (bestMatchLink) {
        bestMatchLink.classList.add('active');
    } else {
        // Fallback: nếu không tìm thấy liên kết nào khớp chính xác hoặc là tiền tố,
        // kiểm tra nếu đang ở trang chủ (/) và không có link nào active thì active Trang chủ
        const homeLink = document.querySelector('.sidebar ul li a[href="{{ url_for(`faculty.faculty_home`) }}"]');
        // Kiểm tra thêm để đảm bảo linkPath của homeLink là '/'
        let homeLinkPath = homeLink ? new URL(homeLink.href, window.location.origin).pathname : '';
        if (homeLinkPath.endsWith('/') && homeLinkPath.length > 1) {
            homeLinkPath = homeLinkPath.slice(0, -1);
        }
        if (homeLinkPath === '' ) { // Xử lý nếu homeLinkPath là rỗng sau chuẩn hóa, ví dụ domain chính
            homeLinkPath = '/';
        }


        if (homeLink && currentPath === homeLinkPath) { // Chỉ active homeLink nếu currentPath thực sự là homeLinkPath
             homeLink.classList.add('active');
        }
    }
});
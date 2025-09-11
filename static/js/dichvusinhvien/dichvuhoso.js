// JavaScript để xử lý chuyển đổi giữa các dịch vụ và tự động tick checkbox
document.addEventListener('DOMContentLoaded', function() {
    // Lấy tham số từ URL để xác định loại dịch vụ
    const urlParams = new URLSearchParams(window.location.search);
    const serviceType = urlParams.get('service');
    
    // Nếu có tham số service trong URL, tự động tick checkbox tương ứng
    if (serviceType) {
        autoSelectService(serviceType);
    }
    
    // Xử lý click cho các thẻ dịch vụ
    const serviceCards = document.querySelectorAll('.service-card8');
    serviceCards.forEach(card => {
        card.addEventListener('click', function(e) {
            e.preventDefault();
            
            const serviceType = this.getAttribute('data-service');
            if (serviceType) {
                // Chuyển hướng đến trang đăng ký với tham số service
                window.location.href = `/dichvuhoso?service=${serviceType}`;
            }
        });
    });
});

function autoSelectService(serviceType) {
    // Mapping giữa service type và checkbox ID thực tế trong form
    const serviceMapping = {
        'dang-ky-chung-nhan': 'check-nvqs',        // Giấy hoãn NVQS
        'dang-ky-the-sinh-vien': 'check-cnsv',     // Giấy chứng nhận sinh viên
        'dang-ky-xac-nhan-vay-von': 'check-vayvon' // Giấy xác nhận vay vốn
    };
    
    const checkboxId = serviceMapping[serviceType];
    if (checkboxId) {
        const checkbox = document.getElementById(checkboxId);
        if (checkbox) {
            checkbox.checked = true;
            // Trigger change event để các handler khác có thể phản ứng
            checkbox.dispatchEvent(new Event('change', { bubbles: true }));
        }
    }
}

// Hàm để lấy service type từ URL (có thể dùng ở các trang khác)
function getServiceTypeFromURL() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('service');
}

// Hàm để chuyển hướng đến dịch vụ cụ thể
function redirectToService(serviceType) {
    window.location.href = `/dichvuhoso?service=${serviceType}`;
}
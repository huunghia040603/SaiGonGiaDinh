// Hàm để lấy token xác thực, giống như trong các script admin khác
function getAuthToken() {
    if (window.location.pathname.startsWith('/sggd/gv/manage')) {
        return localStorage.getItem('authToken');
    } else if (window.location.pathname.startsWith('/sggd/qtv/admin')) {
        return localStorage.getItem('adminAuthToken');
    }
    return null;
}

// Hàm để lấy tham số 'ip' từ URL
function getIpFromUrl() {
    const params = new URLSearchParams(window.location.search);
    return params.get('ip');
}

// Hàm để tải dữ liệu và hiển thị chi tiết IP
async function loadIPDetailData() {
    const ipAddress = getIpFromUrl();
    const token = getAuthToken();
    const isAdminOrGVPage = window.location.pathname.startsWith('/sggd/qtv/admin') || window.location.pathname.startsWith('/sggd/gv/manage');

    if (!ipAddress) {
        document.getElementById('ipDetailContent').innerHTML = '<p class="text-danger text-center">Không tìm thấy địa chỉ IP trong URL.</p>';
        return;
    }

    if (isAdminOrGVPage && !token) {
        console.warn('Lỗi: Không tìm thấy token xác thực. Vui lòng đăng nhập lại.');
        const messageBox = document.createElement('div');
        messageBox.className = 'message-box-overlay'; // Thêm overlay
        messageBox.innerHTML = `
            <div class="message-box">
                <p>Bạn cần đăng nhập để xem chi tiết IP. Chuyển hướng đến trang đăng nhập.</p>
                <button onclick="this.parentNode.parentNode.remove()" class="btn btn-primary">OK</button>
            </div>
        `;
        document.body.appendChild(messageBox);

        setTimeout(() => {
            if (window.location.pathname.startsWith('/sggd/qtv/admin')) {
                window.location.href = '/admin/login';
            } else if (window.location.pathname.startsWith('/sggd/gv/manage')) {
                window.location.href = '/sggd/gv/login';
            }
        }, 1000);
        return;
    }

    const apiUrl = `https://saigongiadinh.pythonanywhere.com/api/admin/IPDetail/?ip=${encodeURIComponent(ipAddress)}`;

    try {
        const fetchOptions = {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            }
        };

        if (token) {
            fetchOptions.headers['Authorization'] = `Token ${token}`;
        }

        const response = await fetch(apiUrl, fetchOptions);

        if (!response.ok) {
            let errorMessage = `Lỗi ${response.status}: ${response.statusText}`;
            try {
                const errorData = await response.json();
                errorMessage = errorData.detail || errorMessage;
            } catch (jsonError) {
                console.warn('Server did not return JSON for error:', jsonError);
            }

            if (response.status === 401 || response.status === 403) {
                errorMessage = 'Phiên đăng nhập đã hết hạn hoặc bạn không có quyền truy cập. Vui lòng đăng nhập lại.';
                localStorage.removeItem('adminAuthToken');
                localStorage.removeItem('authToken');
                const messageBox = document.createElement('div');
                messageBox.className = 'message-box-overlay'; // Thêm overlay
                messageBox.innerHTML = `
                    <div class="message-box">
                        <p>${errorMessage}</p>
                        <button onclick="this.parentNode.parentNode.remove()" class="btn btn-primary">OK</button>
                    </div>
                `;
                document.body.appendChild(messageBox);

                setTimeout(() => {
                    if (window.location.pathname.startsWith('/sggd/qtv/admin')) {
                        window.location.href = '/admin/login';
                    } else if (window.location.pathname.startsWith('/sggd/gv/manage')) {
                        window.location.href = '/sggd/gv/login';
                    }
                }, 500);
            } else {
                const messageBox = document.createElement('div');
                messageBox.className = 'message-box-overlay'; // Thêm overlay
                messageBox.innerHTML = `
                    <div class="message-box">
                        <p>Lỗi khi tải dữ liệu: ${errorMessage}</p>
                        <button onclick="this.parentNode.parentNode.remove()" class="btn btn-primary">OK</button>
                    </div>
                `;
                document.body.appendChild(messageBox);
            }
            console.error('Lỗi API:', response.status, response.statusText, errorMessage);
            throw new Error(`API Error: ${response.status} - ${response.statusText}`);
        }

        const data = await response.json();
        const ipDetail = data.results && data.results.length > 0 ? data.results[0] : null;

        renderIPDetail(ipDetail);

    } catch (error) {
        console.error('Lỗi khi tải dữ liệu chi tiết IP:', error);
        const messageBox = document.createElement('div');
        messageBox.className = 'message-box-overlay'; // Thêm overlay
        messageBox.innerHTML = `
            <div class="message-box">
                <p>Không thể tải dữ liệu chi tiết IP. Vui lòng kiểm tra console của trình duyệt để biết chi tiết lỗi.</p>
                <button onclick="this.parentNode.parentNode.remove()" class="btn btn-primary">OK</button>
            </div>
        `;
        document.body.appendChild(messageBox);
    }
}

// Hàm để render dữ liệu chi tiết IP ra HTML với icon và phong cách mới
function renderIPDetail(detail) {
    const contentDiv = document.getElementById('ipDetailContent');
    contentDiv.innerHTML = ''; // Xóa nội dung cũ

    if (!detail) {
        contentDiv.innerHTML = `<p class="text-center text-muted">Không tìm thấy chi tiết cho địa chỉ IP này.</p>`;
        return;
    }

    contentDiv.innerHTML = `
        <div class="card mb-3">
            <div class="card-header">
                <i class="fas fa-search-location"></i> Chi tiết IP: ${detail.ip_address || 'N/A'}
            </div>
            <ul class="list-group list-group-flush">
                <li class="list-group-item">
                    <i class="fas fa-globe"></i>
                    <strong>Địa chỉ IP:</strong>
                    <span>${detail.ip_address || 'N/A'}</span>
                </li>
                <li class="list-group-item">
                    <i class="fas fa-clock"></i>
                    <strong>Lần cuối truy cập:</strong>
                    <span>${detail.last_view || 'N/A'}</span>
                </li>
                <li class="list-group-item">
                    <i class="fas fa-user-secret"></i>
                    <strong>Thông tin người truy cập:</strong>
                    <span>${detail.visitor_info || 'N/A'}</span>
                </li>
                <li class="list-group-item">
                    <i class="fas fa-map-marker-alt"></i>
                    <strong>Vị trí:</strong>
                    <span>${detail.location_info || 'N/A'}</span>
                </li>
                <li class="list-group-item">
                    <i class="fas fa-share-square"></i>
                    <strong>Người giới thiệu:</strong>
                    <span>${detail.referrer_display || 'Truy cập trực tiếp'}</span>
                </li>
                <li class="list-group-item">
                    <i class="fas fa-file-alt"></i>
                    <strong>Trang vào:</strong>
                    <span>${detail.entry_page || 'N/A'}</span>
                </li>
                <li class="list-group-item">
                    <i class="fas fa-user-tag"></i>
                    <strong>Loại người dùng:</strong>
                    <span>${detail.user_type || 'N/A'}</span>
                </li>
                <li class="list-group-item">
                    <i class="fab fa-chrome"></i> <strong>Trình duyệt:</strong>
                    <span>${detail.browser_family || 'N/A'}</span>
                </li>
                <li class="list-group-item">
                    <i class="fab fa-windows"></i> <strong>Hệ điều hành:</strong>
                    <span>${detail.os_family || 'N/A'}</span>
                </li>
                <li class="list-group-item">
                    <i class="fas fa-mobile-alt"></i> <strong>Thiết bị:</strong>
                    <span>${detail.device_family || 'N/A'}</span>
                </li>
            </ul>
        </div>
        <button type="button" class="btn btn-secondary mt-3" onclick="window.history.back()">
            <i class="fas fa-arrow-left"></i> Quay lại
        </button>
    `;
    // Thêm logic để chọn icon trình duyệt/HĐH phù hợp hơn nếu bạn muốn.
    // Ví dụ: if (detail.browser_family.includes('Chrome')) { iconClass = 'fab fa-chrome'; }
}

// Tải dữ liệu ban đầu khi trang được load
document.addEventListener('DOMContentLoaded', () => {
    loadIPDetailData();
});
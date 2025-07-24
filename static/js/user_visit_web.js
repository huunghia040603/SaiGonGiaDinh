// user_visit_web.js

// Đặt toàn bộ logic gửi visit vào một hàm
function sendUserVisit() {
    const path = window.location.pathname;
    const referrer = document.referrer;
    const userAgent = navigator.userAgent;

    // Lấy token xác thực từ Local Storage (nếu có)
    const authToken = localStorage.getItem('authToken');

    let visitData = {
        path: path,
        referrer: referrer,
        user_agent: userAgent
    };

    let headers = {
        'Content-Type': 'application/json'
    };

    if (authToken) {
        // Nếu có token, thêm vào header Authorization
        headers['Authorization'] = `Token ${authToken}`; // Hoặc 'Bearer ${authToken}' tùy thuộc vào API của bạn
       
    } else {
        console.log('[UserVisit] Không tìm thấy Token. (GUEST).');
    }

  

    fetch('https://saigongiadinh.pythonanywhere.com/record-user-visit/', { // Đảm bảo đây là endpoint API đúng của bạn
        method: 'POST',
        headers: headers,
        body: JSON.stringify(visitData)
    })
    .then(response => {
        if (response.ok) {
            console.log('(Status: 20x)');
        } else {
            console.error('[UserVisit] Lỗi');
            return response.json().then(errorData => {
                console.error('[UserVisit] lỗi:', errorData);
            }).catch(() => {}); // Catch nếu phản hồi không phải JSON
        }
    })
    .catch(error => {
        console.error(error);
    });
}

// Chạy hàm này khi DOM đã tải hoàn chỉnh (đối với lần tải trang ban đầu)
document.addEventListener('DOMContentLoaded', function() {
    sendUserVisit();
});

// Quan trọng: Phơi bày hàm này ra global scope để có thể gọi từ các script khác
window.sendUserVisit = sendUserVisit;
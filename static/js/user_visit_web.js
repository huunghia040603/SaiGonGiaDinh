// static/js/user_visit_web.js

/**
 * Ghi nhận lượt truy cập của người dùng bằng cách gửi dữ liệu đến Django backend API.
 * Hàm này sẽ thu thập thông tin về đường dẫn hiện tại, referrer, và user agent.
 */
async function recordUserVisit() {
    // Địa chỉ API endpoint của Django backend để ghi nhận lượt truy cập
    // Đảm bảo URL này khớp với URL bạn đã cấu hình trong Django (RecordUserVisitAPIView)
    const apiUrl = 'https://saigongiadinh.pythonanywhere.com/RecordUserVisitAPIView/'; 
    
    // Thu thập dữ liệu từ trình duyệt
    const data = {
        path: window.location.pathname, // Đường dẫn tương đối của trang hiện tại (ví dụ: /cong-nghe-thong-tin)
        referrer: document.referrer,   // URL của trang trước đó đã giới thiệu người dùng đến (trống nếu trực tiếp)
        user_agent: navigator.userAgent // Chuỗi User-Agent của trình duyệt
    };

    console.log('Đang gửi dữ liệu lượt truy cập:', data);

    try {
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                // Không cần thêm CSRF token vì chúng ta đã tắt nó cho API này
                // Tuy nhiên, nếu bạn có CSRF token cho Flask, bạn có thể cân nhắc gửi lên nếu cần
            },
            body: JSON.stringify(data), // Chuyển đổi đối tượng JS thành chuỗi JSON
        });

        if (response.ok) { // Kiểm tra xem response có thành công không (status 2xx)
            console.log('Lượt truy cập đã được ghi nhận thành công tại backend!');
            // const responseData = await response.json(); // Nếu backend trả về dữ liệu
            // console.log('Response từ backend:', responseData);
        } else {
            const errorData = await response.json(); // Lấy thông tin lỗi nếu có
            console.error('Lỗi khi ghi nhận lượt truy cập:', response.status, response.statusText, errorData);
        }
    } catch (error) {
        // Xử lý các lỗi mạng (ví dụ: không thể kết nối đến server)
        console.error('Lỗi mạng khi gửi dữ liệu lượt truy cập:', error);
    }
}

// Gọi hàm recordUserVisit khi toàn bộ DOM của trang đã được tải
// Điều này đảm bảo rằng tất cả các yếu tố của trang đã sẵn sàng trước khi gửi dữ liệu.
document.addEventListener('DOMContentLoaded', recordUserVisit);

// Bạn có thể thêm một số logic bổ sung nếu muốn ghi nhận các sự kiện khác (ví dụ: chuyển trang bằng AJAX)
// Nhưng đối với việc đếm lượt truy cập cơ bản, DOMContentLoaded là đủ cho mỗi lần tải trang.
let trafficChart = null;
let currentRawTrafficData = []; // Biến toàn cục mới để lưu trữ dữ liệu thô từ API
let currentPeriod = 'day'; // Biến toàn cục mới để lưu trữ thời gian hiện tại ('day', 'month', 'year')

// Hàm để lấy token xác thực, giống như trong admin_registrations.js
function getAuthToken() {
    // Lấy token từ localStorage, nơi login_admin.html đã lưu trữ
    return localStorage.getItem('adminAuthToken');
}

// Hàm để tải dữ liệu và vẽ biểu đồ
async function loadTrafficData(period) {
    currentPeriod = period; // Cập nhật biến toàn cục period
    // Kiểm tra xem trang hiện tại có phải là trang admin không
    // Nếu không phải trang admin, không cần kiểm tra token và thoát hàm
    if (!window.location.pathname.startsWith('/admin')) {
        console.log('Không phải trang admin, bỏ qua kiểm tra xác thực.');
        return;
    }

    // Sử dụng URL tuyệt đối để nhất quán với admin_registrations.js
    const apiUrl = `https://saigongiadinh.pythonanywhere.com/api/admin/traffic-stats/?period=${period}`;

    // Lấy token xác thực
    const token = getAuthToken();
    console.log('Token từ localStorage (traffic.js):', token ? 'Có token' : 'Không có token');

    // Kiểm tra nếu token không tồn tại (null hoặc undefined) và đang ở trang admin
    if (!token) {
        console.warn('Lỗi: Không tìm thấy token xác thực admin. Vui lòng đăng nhập lại.');
        alert('Bạn cần đăng nhập để xem thống kê. Chuyển hướng đến trang đăng nhập.');
        // Chuyển hướng về trang đăng nhập nếu không có token
        setTimeout(() => {
            window.location.href = '/admin/login';
        }, 1000); // Đợi 1 giây trước khi chuyển hướng
        return; // Ngừng thực thi nếu không có token
    }

    try {
        const response = await fetch(apiUrl, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Token ${token}`, // Gửi token dưới dạng 'Token <your_token>'
                'Accept': 'application/json'
            }
        });

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
                localStorage.removeItem('adminAuthToken'); // Xóa token đã lưu
                alert(errorMessage);
                setTimeout(() => {
                    window.location.href = '/admin/login';
                }, 500);
            } else {
                alert(`Lỗi khi tải dữ liệu: ${errorMessage}`);
            }
            console.error('Lỗi API:', response.status, response.statusText, errorMessage);
            throw new Error(`API Error: ${response.status} - ${response.statusText}`);
        }

        const rawData = await response.json();
        console.log('Dữ liệu API nhận được:', rawData);

        let data = rawData;

        // Lọc dữ liệu nếu period là 'day' và loại bỏ các ngày trước 30/5/2025
        if (period === 'day') {
            const startDate = new Date('2025-05-30T00:00:00'); // Ngày bắt đầu lọc
            data = rawData.filter(item => {
                const itemDate = new Date(item.date + 'T00:00:00'); // Đảm bảo so sánh cùng múi giờ hoặc không có múi giờ
                return itemDate >= startDate;
            });
            console.log('Dữ liệu sau khi lọc (từ 30/5):', data);
        }

        // Lưu dữ liệu thô (đã lọc nếu có) vào biến toàn cục để xuất Excel
        currentRawTrafficData = data;

        // Xử lý và chuẩn bị dữ liệu cho biểu đồ
        const labels = data.map(item => {
            if (period === 'day') {
                const [year, month, day] = item.date.split('-').map(Number);
                const date = new Date(year, month - 1, day);
                return date.toLocaleDateString('vi-VN');
            }
            else if (period === 'month') {
                return `T${item.date.split('-')[1]}/${item.date.split('-')[0]}`;
            } else if (period === 'year') {
                return item.date;
            }
            return item.date;
        });
        const totalVisits = data.map(item => item.total_visits);
        const guestVisits = data.map(item => item.guest_visits);
        const loggedInVisits = data.map(item => item.logged_in_visits);

        // Hủy biểu đồ cũ nếu có để tránh lỗi trùng lặp
        if (trafficChart) {
            trafficChart.destroy();
        }

        // Tạo datasets dựa trên period
        let datasets = [];

        if (period === 'day') {
            // Đối với 'day', kết hợp biểu đồ đường và cột
            datasets.push({
                label: 'Tổng lượt truy cập',
                data: totalVisits,
                type: 'bar', // Chuyển sang biểu đồ cột
                backgroundColor: 'rgba(54, 162, 235, 0.6)', // Màu sắc cho cột, làm cho nó trong suốt hơn một chút
                borderColor: 'rgba(54, 162, 235, 1)',
                borderWidth: 1, // Độ dày của viền cột
                yAxisID: 'y'
            });
            datasets.push({
                label: 'Lượt truy cập của khách',
                data: guestVisits,
                type: 'bar', // Loại biểu đồ cột cho khách
                backgroundColor: 'rgba(255, 99, 132, 0.6)', // Màu cột đậm hơn để dễ nhìn
                borderColor: 'rgba(255, 99, 132, 1)',
                borderWidth: 1,
                yAxisID: 'y'
            });
            datasets.push({
                label: 'Lượt truy cập đã đăng nhập',
                data: loggedInVisits,
                type: 'bar', // Loại biểu đồ cột cho đã đăng nhập
                backgroundColor: 'rgba(75, 192, 192, 0.6)', // Màu cột đậm hơn để dễ nhìn
                borderColor: 'rgba(75, 192, 192, 1)',
                borderWidth: 1,
                yAxisID: 'y'
            });
        } else {
            // Đối với 'month' và 'year', giữ nguyên biểu đồ đường cho tất cả
            datasets.push({
                label: 'Tổng lượt truy cập',
                data: totalVisits,
                type: 'line',
                backgroundColor: 'rgba(54, 162, 235, 0.2)',
                borderColor: 'rgba(54, 162, 235, 1)',
                borderWidth: 2,
                fill: true,
                tension: 0.4,
                pointBackgroundColor: 'rgba(54, 162, 235, 1)',
                pointBorderColor: '#fff',
                pointHoverBackgroundColor: '#fff',
                pointHoverBorderColor: 'rgba(54, 162, 235, 1)'
            });
            datasets.push({
                label: 'Lượt truy cập của khách',
                data: guestVisits,
                type: 'line',
                backgroundColor: 'rgba(255, 99, 132, 0.2)',
                borderColor: 'rgba(255, 99, 132, 1)',
                borderWidth: 2,
                fill: true,
                tension: 0.4,
                pointBackgroundColor: 'rgba(255, 99, 132, 1)',
                pointBorderColor: '#fff',
                pointHoverBackgroundColor: '#fff',
                pointHoverBorderColor: 'rgba(255, 99, 132, 1)'
            });
            datasets.push({
                label: 'Lượt truy cập đã đăng nhập',
                data: loggedInVisits,
                type: 'line',
                backgroundColor: 'rgba(75, 192, 192, 0.2)',
                borderColor: 'rgba(75, 192, 192, 1)',
                borderWidth: 2,
                fill: true,
                tension: 0.4,
                pointBackgroundColor: 'rgba(75, 192, 192, 1)',
                pointBorderColor: '#fff',
                pointHoverBackgroundColor: '#fff',
                pointHoverBorderColor: 'rgba(75, 192, 192, 1)'
            });
        }

        // Vẽ biểu đồ mới
        const ctx = document.getElementById('trafficChart').getContext('2d');
        trafficChart = new Chart(ctx, {
            type: 'bar', // Mặc định là bar để hỗ trợ mixed chart
            data: {
                labels: labels,
                datasets: datasets
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Số lượt truy cập'
                        },
                        ticks: {
                            stepSize: 1,
                            callback: function(value) {
                                if (value % 1 === 0) {
                                    return value;
                                }
                            }
                        }
                    },
                    x: {
                        title: {
                            display: true,
                            text: `Thời gian (${period === 'day' ? 'ngày' : period === 'month' ? 'tháng' : 'năm'})`
                        },
                        ticks: {
                            autoSkip: false, // Không tự động bỏ qua nhãn
                            maxRotation: 45,
                            minRotation: 0,
                            callback: function(value, index, values) {
                                if (period === 'day') {
                                    const dateStr = this.getLabelForValue(value); // ví dụ: "30/5/2025"
                                    return dateStr; // Trả về ngày trực tiếp
                                }
                                return this.getLabelForValue(value);
                            }
                        }
                    }

                },
                plugins: {
                    tooltip: {
                        mode: 'index',
                        intersect: false
                    },
                    title: {
                        display: true,
                        text: `Thống kê lượt truy cập theo ${period === 'day' ? 'ngày' : period === 'month' ? 'tháng' : 'năm'}`
                    }
                }
            }
        });

    } catch (error) {
        console.error('Lỗi khi tải dữ liệu thống kê:', error);
        alert('Không thể tải dữ liệu thống kê. Vui lòng kiểm tra console của trình duyệt để biết chi tiết lỗi.');
    }
}

// Hàm mới: Xuất dữ liệu ra Excel
function exportToExcel() {
    if (!currentRawTrafficData || currentRawTrafficData.length === 0) {
        alert('Không có dữ liệu để xuất Excel.');
        return;
    }

    const ws_data = [
        ['Thời gian', 'Tổng lượt truy cập', 'Lượt truy cập của khách', 'Lượt truy cập đã đăng nhập'] // Tiêu đề cột
    ];

    currentRawTrafficData.forEach(item => {
        let timeLabel = item.date;
        if (currentPeriod === 'day') {
            const [year, month, day] = item.date.split('-').map(Number);
            const date = new Date(year, month - 1, day);
            timeLabel = date.toLocaleDateString('vi-VN'); // Định dạng ngày tháng cho dễ đọc
        } else if (currentPeriod === 'month') {
            timeLabel = `Tháng ${item.date.split('-')[1]}/${item.date.split('-')[0]}`;
        }
        // Đối với 'year', item.date đã là năm

        ws_data.push([
            timeLabel,
            item.total_visits,
            item.guest_visits,
            item.logged_in_visits
        ]);
    });

    const ws = XLSX.utils.aoa_to_sheet(ws_data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Thống kê lượt truy cập");

    let fileName = `thong_ke_luot_truy_cap_theo_${currentPeriod}`;
    const date = new Date();
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    fileName += `_${year}${month}${day}_${hours}${minutes}.xlsx`;

    XLSX.writeFile(wb, fileName);
    alert('Dữ liệu đã được xuất ra Excel thành công!');
}


// Tải dữ liệu ban đầu khi trang được load (mặc định theo ngày)
document.addEventListener('DOMContentLoaded', () => {
    // Để đảm bảo DOM đã sẵn sàng và tất cả các script đã tải,
    // đặc biệt là thư viện Chart.js và XLSX, bạn có thể gọi
    // loadTrafficData sau một khoảng trễ nhỏ hoặc đảm bảo
    // rằng script này được đặt ở cuối body sau các thư viện.
    // Dòng setTimeout ban đầu của bạn là một cách để làm điều này.
    setTimeout(() => loadTrafficData('day'), 100); // Giảm thời gian trễ xuống 100ms
});
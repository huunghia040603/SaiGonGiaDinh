

let trafficChart = null;
let currentRawTrafficData = []; // Biến toàn cục mới để lưu trữ dữ liệu thô từ API
let currentPeriod = 'day'; // Biến toàn cục mới để lưu trữ thời gian hiện tại ('day', 'month', 'year')

// Hàm để lấy token xác thực, giống như trong admin_registrations.js
function getAuthToken() {
    // Kiểm tra xem URL hiện tại có phải là đường dẫn của giảng viên không
    if (window.location.pathname.startsWith('/gv')) {
        // Nếu là trang quản lý giảng viên, lấy 'authToken' của giảng viên
        return localStorage.getItem('authToken'); 
    } 
    // Nếu là trang admin, lấy 'adminAuthToken'
    else if (window.location.pathname.startsWith('/sggd/qtv/admin')) {
        return localStorage.getItem('adminAuthToken');
    }
    // Trường hợp khác, không có token mặc định nào được trả về (hoặc bạn có thể thêm logic khác)
    return null; 
}

// Hàm để tải dữ liệu và vẽ biểu đồ
async function loadTrafficData(period) {
    currentPeriod = period; // Cập nhật biến toàn cục period
    
    // Chỉ kiểm tra và yêu cầu token nếu đang ở trang admin hoặc giảng viên
    const isAdminOrGVPage = window.location.pathname.startsWith('/sggd/qtv/admin') || window.location.pathname.startsWith('/gv');
    
    const token = getAuthToken();

    // Kiểm tra nếu token không tồn tại và đang ở trang admin/giảng viên
    if (isAdminOrGVPage && !token) {
        console.warn('Lỗi: Không tìm thấy token xác thực. Vui lòng đăng nhập lại.');
        const messageBox = document.createElement('div');
        messageBox.innerHTML = `
            <div style="
                position: fixed;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                background-color: white;
                padding: 20px;
                border-radius: 8px;
                box-shadow: 0 0 15px rgba(0,0,0,0.2);
                z-index: 1000;
                text-align: center;
                max-width: 300px;
            ">
                <p>Bạn cần đăng nhập để xem thống kê. Chuyển hướng đến trang đăng nhập.</p>
                <button onclick="this.parentNode.remove()" style="
                    background-color: #007bff;
                    color: white;
                    border: none;
                    padding: 10px 20px;
                    border-radius: 5px;
                    cursor: pointer;
                    margin-top: 10px;
                ">OK</button>
            </div>
        `;
        document.body.appendChild(messageBox);
        
        setTimeout(() => {
            if (window.location.pathname.startsWith('/sggd/qtv/admin')) {
                window.location.href = '/admin/login'; // Chuyển hướng về trang đăng nhập admin
            } else if (window.location.pathname.startsWith('/gv')) {
                window.location.href = '/gv/'; // Chuyển hướng về trang đăng nhập giảng viên
            }
        }, 1000); 
        return; // Ngừng thực thi nếu không có token
    }

    const apiUrl = `https://saigongiadinh.pythonanywhere.com/api/admin/traffic-stats/?period=${period}`;

    try {
        const fetchOptions = {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            }
        };

        if (token) { // Chỉ thêm header Authorization nếu có token
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
                localStorage.removeItem('adminAuthToken'); // Xóa token đã lưu
                localStorage.removeItem('authToken'); // Xóa cả token giảng viên nếu có
                const messageBox = document.createElement('div');
                messageBox.innerHTML = `
                    <div style="
                        position: fixed;
                        top: 50%;
                        left: 50%;
                        transform: translate(-50%, -50%);
                        background-color: white;
                        padding: 20px;
                        border-radius: 8px;
                        box-shadow: 0 0 15px rgba(0,0,0,0.2);
                        z-index: 1000;
                        text-align: center;
                        max-width: 300px;
                    ">
                        <p>${errorMessage}</p>
                        <button onclick="this.parentNode.remove()" style="
                            background-color: #007bff;
                            color: white;
                            border: none;
                            padding: 10px 20px;
                            border-radius: 5px;
                            cursor: pointer;
                            margin-top: 10px;
                        ">OK</button>
                    </div>
                `;
                document.body.appendChild(messageBox);
                
                setTimeout(() => {
                    if (window.location.pathname.startsWith('/sggd/qtv/admin')) {
                        window.location.href = '/admin/login';
                    } else if (window.location.pathname.startsWith('/gv')) {
                        window.location.href = '/gv/';
                    }
                }, 500);
            } else {
                const messageBox = document.createElement('div');
                messageBox.innerHTML = `
                    <div style="
                        position: fixed;
                        top: 50%;
                        left: 50%;
                        transform: translate(-50%, -50%);
                        background-color: white;
                        padding: 20px;
                        border-radius: 8px;
                        box-shadow: 0 0 15px rgba(0,0,0,0.2);
                        z-index: 1000;
                        text-align: center;
                        max-width: 300px;
                    ">
                        <p>Lỗi khi tải dữ liệu: ${errorMessage}</p>
                        <button onclick="this.parentNode.remove()" style="
                            background-color: #007bff;
                            color: white;
                            border: none;
                            padding: 10px 20px;
                            border-radius: 5px;
                            cursor: pointer;
                            margin-top: 10px;
                        ">OK</button>
                    </div>
                `;
                document.body.appendChild(messageBox);
            }
            console.error('Lỗi API:', response.status, response.statusText, errorMessage);
            throw new Error(`API Error: ${response.status} - ${response.statusText}`);
        }

        const rawData = await response.json();

        let data = rawData;

        // Lọc dữ liệu nếu period là 'day' và loại bỏ các ngày trước 30/5/2025
        if (period === 'day') {
            // Bước 1: Sắp xếp dữ liệu theo ngày tăng dần để đảm bảo các ngày gần đây nhất nằm ở cuối mảng
            data.sort((a, b) => new Date(a.date) - new Date(b.date));
            
            // Bước 2: Chỉ lấy 10 phần tử cuối cùng (10 ngày gần đây nhất)
            // Đảm bảo không lấy nhiều hơn số lượng dữ liệu hiện có
            data = data.slice(Math.max(data.length - 10, 0));

            // (Tùy chọn) Nếu bạn muốn giữ lại bộ lọc ngày 30/5/2025 CÙNG VỚI 10 ngày gần nhất
            // Bạn có thể kết hợp như sau:
            // const startDate = new Date('2025-05-30T00:00:00');
            // let filteredByDate = rawData.filter(item => {
            //     const itemDate = new Date(item.date + 'T00:00:00');
            //     return itemDate >= startDate;
            // });
            // filteredByDate.sort((a, b) => new Date(a.date) - new Date(b.date));
            // data = filteredByDate.slice(Math.max(filteredByDate.length - 10, 0));
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
        const messageBox = document.createElement('div');
        messageBox.innerHTML = `
            <div style="
                position: fixed;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                background-color: white;
                padding: 20px;
                border-radius: 8px;
                box-shadow: 0 0 15px rgba(0,0,0,0.2);
                z-index: 1000;
                text-align: center;
                max-width: 300px;
            ">
                <p>Không thể tải dữ liệu thống kê. Vui lòng kiểm tra console của trình duyệt để biết chi tiết lỗi.</p>
                <button onclick="this.parentNode.remove()" style="
                    background-color: #007bff;
                    color: white;
                    border: none;
                    padding: 10px 20px;
                    border-radius: 5px;
                    cursor: pointer;
                    margin-top: 10px;
                ">OK</button>
            </div>
        `;
        document.body.appendChild(messageBox);
    }
}

// Hàm mới: Xuất dữ liệu ra Excel
function exportToExcel() {
    if (!currentRawTrafficData || currentRawTrafficData.length === 0) {
        const messageBox = document.createElement('div');
        messageBox.innerHTML = `
            <div style="
                position: fixed;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                background-color: white;
                padding: 20px;
                border-radius: 8px;
                box-shadow: 0 0 15px rgba(0,0,0,0.2);
                z-index: 1000;
                text-align: center;
                max-width: 300px;
            ">
                <p>Không có dữ liệu để xuất Excel.</p>
                <button onclick="this.parentNode.remove()" style="
                    background-color: #007bff;
                    color: white;
                    border: none;
                    padding: 10px 20px;
                    border-radius: 5px;
                    cursor: pointer;
                    margin-top: 10px;
                ">OK</button>
            </div>
        `;
        document.body.appendChild(messageBox);
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
    const messageBox = document.createElement('div');
    messageBox.innerHTML = `
        <div style="
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background-color: white;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 0 15px rgba(0,0,0,0.2);
            z-index: 1000;
            text-align: center;
            max-width: 300px;
        ">
            <p>Dữ liệu đã được xuất ra Excel thành công!</p>
            <button onclick="this.parentNode.remove()" style="
                background-color: #007bff;
                color: white;
                border: none;
                padding: 10px 20px;
                border-radius: 5px;
                cursor: pointer;
                margin-top: 10px;
            ">OK</button>
        </div>
    `;
    document.body.appendChild(messageBox);
}

// Tải dữ liệu ban đầu khi trang được load (mặc định theo ngày)
document.addEventListener('DOMContentLoaded', () => {
    loadTrafficData('day');
});
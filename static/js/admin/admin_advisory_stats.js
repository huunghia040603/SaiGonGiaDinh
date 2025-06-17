document.addEventListener('DOMContentLoaded', function() {
    const ctxMonthly = document.getElementById('monthlyRegistrationsChart').getContext('2d');
    const ctxStatus = document.getElementById('statusRegistrationsChart').getContext('2d');

    const loadingMessageMonthly = document.getElementById('loading-message-monthly');
    const errorMessageMonthly = document.getElementById('error-message-monthly');
    const loadingMessageStatus = document.getElementById('loading-message-status');
    const errorMessageStatus = document.getElementById('error-message-status');

    let monthlyChart;
    let statusChart;

    // Hàm hiển thị message box
    function showMessageBox(message, type = 'error', callback = null) {
        const messageBoxOverlay = document.createElement('div');
        messageBoxOverlay.className = 'message-box-overlay';
        messageBoxOverlay.innerHTML = `
            <div class="message-box">
                <p>${message}</p>
                <button id="messageBoxCloseBtn">OK</button>
            </div>
        `;
        document.body.appendChild(messageBoxOverlay);

        document.getElementById('messageBoxCloseBtn').addEventListener('click', () => {
            messageBoxOverlay.remove();
            if (callback) {
                callback();
            }
        });
    }

    // Hàm lấy token xác thực
    function getAuthToken() {
        if (window.location.pathname.startsWith('/sggd/gv/manage')) {
            return localStorage.getItem('authToken');
        } else if (window.location.pathname.startsWith('/sggd/qtv/admin')) {
            return localStorage.getItem('adminAuthToken');
        }
        return null;
    }

    async function fetchAdvisoryStats() {
        // Reset trạng thái hiển thị
        loadingMessageMonthly.style.display = 'block';
        errorMessageMonthly.style.display = 'none';
        loadingMessageStatus.style.display = 'block';
        errorMessageStatus.style.display = 'none';

        if (monthlyChart) monthlyChart.destroy();
        if (statusChart) statusChart.destroy();

        const token = getAuthToken();
        const isAdminOrGVPage = window.location.pathname.startsWith('/sggd/qtv/admin') || window.location.pathname.startsWith('/sggd/gv/manage');

        if (isAdminOrGVPage && !token) {
            loadingMessageMonthly.style.display = 'none';
            loadingMessageStatus.style.display = 'none';
            errorMessageMonthly.textContent = 'Lỗi: Không tìm thấy token xác thực. Vui lòng đăng nhập lại.';
            errorMessageMonthly.style.display = 'block';
            errorMessageStatus.textContent = 'Lỗi: Không tìm thấy token xác thực. Vui lòng đăng nhập lại.';
            errorMessageStatus.style.display = 'block';
            showMessageBox('Bạn cần đăng nhập để xem báo cáo. Chuyển hướng đến trang đăng nhập.', 'error', () => {
                if (window.location.pathname.startsWith('/sggd/qtv/admin')) {
                    window.location.href = '/admin/login';
                } else if (window.location.pathname.startsWith('/sggd/gv/manage')) {
                    window.location.href = '/sggd/gv/login';
                }
            });
            return;
        }

        const apiUrl = 'https://saigongiadinh.pythonanywhere.com/api/admin/advisory-stats/';

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
                let errorDetail = `Lỗi ${response.status}: ${response.statusText}`;
                try {
                    const errorJson = await response.json();
                    errorDetail = errorJson.detail || errorDetail;
                } catch (e) {
                    console.warn('Không thể parse lỗi JSON:', e);
                }

                if (response.status === 401 || response.status === 403) {
                    showMessageBox('Phiên đăng nhập đã hết hạn hoặc bạn không có quyền truy cập. Vui lòng đăng nhập lại.', 'error', () => {
                        localStorage.removeItem('adminAuthToken');
                        localStorage.removeItem('authToken');
                        if (window.location.pathname.startsWith('/sggd/qtv/admin')) {
                            window.location.href = '/admin/login';
                        } else if (window.location.pathname.startsWith('/sggd/gv/manage')) {
                            window.location.href = '/sggd/gv/login';
                        }
                    });
                } else {
                    showMessageBox(`Lỗi khi tải dữ liệu báo cáo: ${errorDetail}`);
                }
                errorMessageMonthly.textContent = `Lỗi: ${errorDetail}`;
                errorMessageMonthly.style.display = 'block';
                errorMessageStatus.textContent = `Lỗi: ${errorDetail}`;
                errorMessageStatus.style.display = 'block';
                return;
            }

            const data = await response.json();

            // Render Monthly Registrations Chart
            const monthlyData = data.monthly_registrations;
            if (monthlyData) {
                renderMonthlyChart(monthlyData.labels, monthlyData.data, monthlyData.title);
            } else {
                errorMessageMonthly.textContent = 'Không có dữ liệu báo cáo tháng.';
                errorMessageMonthly.style.display = 'block';
            }

            // Render Status Registrations Chart
            const statusData = data.status_registrations;
            if (statusData) {
                renderStatusChart(statusData.labels, statusData.data, statusData.title);
            } else {
                errorMessageStatus.textContent = 'Không có dữ liệu báo cáo trạng thái.';
                errorMessageStatus.style.display = 'block';
            }

        } catch (error) {
            console.error('Lỗi khi fetch dữ liệu báo cáo:', error);
            errorMessageMonthly.textContent = `Lỗi mạng hoặc server không phản hồi: ${error.message}`;
            errorMessageMonthly.style.display = 'block';
            errorMessageStatus.textContent = `Lỗi mạng hoặc server không phản hồi: ${error.message}`;
            errorMessageStatus.style.display = 'block';
            showMessageBox('Không thể kết nối đến máy chủ để lấy dữ liệu báo cáo. Vui lòng thử lại sau.');
        } finally {
            loadingMessageMonthly.style.display = 'none';
            loadingMessageStatus.style.display = 'none';
        }
    }

    function renderMonthlyChart(labels, data, title) {
        if (monthlyChart) {
            monthlyChart.destroy();
        }

        monthlyChart = new Chart(ctxMonthly, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Lượt đăng ký',
                    data: data,
                    backgroundColor: 'rgba(75, 192, 192, 0.7)',
                    borderColor: 'rgba(75, 192, 192, 1)',
                    borderWidth: 1,
                    hoverBackgroundColor: 'rgba(54, 162, 235, 0.8)',
                    hoverBorderColor: 'rgba(54, 162, 235, 1)'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: {
                        display: true,
                        text: title,
                        font: { size: 16, weight: 'bold' }, // Kích thước phù hợp cho 2 biểu đồ
                        color: '#495057'
                    },
                    legend: {
                        display: true,
                        position: 'top',
                        labels: { font: { size: 12 } }
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                let label = context.dataset.label || '';
                                if (label) { label += ': '; }
                                if (context.parsed.y !== null) {
                                    label += new Intl.NumberFormat('vi-VN').format(context.parsed.y) + ' lượt';
                                }
                                return label;
                            }
                        },
                        backgroundColor: 'rgba(0,0,0,0.7)',
                        titleFont: { size: 13 },
                        bodyFont: { size: 12 },
                        padding: 8,
                        cornerRadius: 4
                    }
                },
                scales: {
                    x: {
                        grid: { display: false },
                        ticks: { font: { size: 11 } }
                    },
                    y: {
                        beginAtZero: true,
                        ticks: {
                            stepSize: 1,
                            callback: function(value) {
                                if (value % 1 === 0) return value;
                            },
                            font: { size: 11 }
                        },
                        grid: { color: 'rgba(200, 200, 200, 0.2)' }
                    }
                }
            }
        });
    }

    function renderStatusChart(labels, data, title) {
        if (statusChart) {
            statusChart.destroy();
        }

        // Tạo màu sắc ngẫu nhiên cho biểu đồ tròn nếu cần nhiều màu
        const backgroundColors = [
            'rgba(255, 99, 132, 0.7)', // Red
            'rgba(54, 162, 235, 0.7)', // Blue
            'rgba(255, 206, 86, 0.7)', // Yellow
            'rgba(75, 192, 192, 0.7)', // Green
            'rgba(153, 102, 255, 0.7)',// Purple
            'rgba(255, 159, 64, 0.7)'  // Orange
        ];
        const borderColors = [
            'rgba(255, 99, 132, 1)',
            'rgba(54, 162, 235, 1)',
            'rgba(255, 206, 86, 1)',
            'rgba(75, 192, 192, 1)',
            'rgba(153, 102, 255, 1)',
            'rgba(255, 159, 64, 1)'
        ];

        // Lấy đủ màu sắc cho số lượng labels
        const colors = [];
        for (let i = 0; i < labels.length; i++) {
            colors.push(backgroundColors[i % backgroundColors.length]);
        }
        const borders = [];
        for (let i = 0; i < labels.length; i++) {
            borders.push(borderColors[i % borderColors.length]);
        }

        statusChart = new Chart(ctxStatus, {
            type: 'doughnut', // Biểu đồ hình bánh doughnut
            data: {
                labels: labels,
                datasets: [{
                    label: 'Số lượt',
                    data: data,
                    backgroundColor: colors,
                    borderColor: borders,
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: {
                        display: true,
                        text: title,
                        font: { size: 16, weight: 'bold' },
                        color: '#495057'
                    },
                    legend: {
                        display: true,
                        position: 'right', // Đặt chú thích bên phải
                        labels: {
                            font: { size: 12 }
                        }
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                const label = context.label || '';
                                if (context.parsed !== null) {
                                    // Tính phần trăm
                                    const total = context.dataset.data.reduce((acc, value) => acc + value, 0);
                                    const percentage = total > 0 ? ((context.parsed / total) * 100).toFixed(1) + '%' : '0%';
                                    return `${label}: ${new Intl.NumberFormat('vi-VN').format(context.parsed)} (${percentage})`;
                                }
                                return label;
                            }
                        },
                        backgroundColor: 'rgba(0,0,0,0.7)',
                        titleFont: { size: 13 },
                        bodyFont: { size: 12 },
                        padding: 8,
                        cornerRadius: 4
                    },
                    datalabels: { // Cấu hình plugin datalabels
                        color: '#fff', // Màu chữ nhãn dữ liệu
                        font: {
                            weight: 'bold',
                            size: 10
                        },
                        formatter: (value, context) => {
                            // Chỉ hiển thị nhãn nếu giá trị lớn hơn 0
                            if (value > 0) {
                                return new Intl.NumberFormat('vi-VN').format(value); // Hiển thị số lượt
                            }
                            return '';
                        },
                        textShadowBlur: 2,
                        textShadowColor: 'rgba(0, 0, 0, 0.5)'
                    }
                },
                layout: {
                    padding: 20 // Khoảng cách xung quanh biểu đồ
                }
            }
        });
    }

    // Tải dữ liệu khi trang được load
    fetchAdvisoryStats();
});
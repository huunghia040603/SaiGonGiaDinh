let currentIpSummaryData = []; // Biến toàn cục để lưu trữ dữ liệu IP thô
let currentPage = 1; // Biến toàn cục để theo dõi trang hiện tại
let totalPages = 1; // Biến toàn cục để lưu tổng số trang

function showTableLoading() {
    const tableBody = document.getElementById('ipSummaryTableBody');
    if (tableBody) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="8">
                    <div class="spinner-container" style="text-align: center; padding: 20px;">
                        <div class="spinner-border" role="status">
                            <span class="visually-hidden">Đang tải...</span>
                        </div>
                        <div class="loading-text mt-2">Đang tải dữ liệu IP...</div>
                    </div>
                </td>
            </tr>
        `;
    }
}

function hideTableLoading() {
    const tableBody = document.getElementById('ipSummaryTableBody');
    if (tableBody) {
        tableBody.innerHTML = '';
    }
}

function getAuthToken() {
    if (window.location.pathname.startsWith('/sggd/gv/manage')) {
        return localStorage.getItem('authToken');
    } else if (window.location.pathname.startsWith('/sggd/qtv/admin')) {
        return localStorage.getItem('adminAuthToken');
    }
    return null;
}

// Hàm để tải dữ liệu và hiển thị bảng, có hỗ trợ lọc và phân trang
async function loadIPSummaryData(page = 1) {
    showTableLoading();
    
    const isAdminOrGVPage = window.location.pathname.startsWith('/sggd/qtv/admin') || window.location.pathname.startsWith('/sggd/gv/manage');
    const token = getAuthToken();

    if (isAdminOrGVPage && !token) {
        hideTableLoading();
        // Giữ nguyên logic xử lý lỗi token
        return;
    }

    const apiUrlBase = 'https://saigongiadinh.pythonanywhere.com/api/admin/ip-summary/';
    let apiUrl = apiUrlBase;
    
    const startDate = document.getElementById('startDate').value;
    const endDate = document.getElementById('endDate').value;
    const exactDate = document.getElementById('exactDate').value;

    const params = new URLSearchParams();

    if (exactDate) {
        params.append('date', exactDate);
    } else if (startDate && endDate) {
        params.append('start_date', startDate);
        params.append('end_date', endDate);
    } else if (startDate) {
        params.append('start_date', startDate);
    } else if (endDate) {
        params.append('end_date', endDate);
    }
    
    // Thêm tham số trang vào URL
    params.append('page', page);

    apiUrl += '?' + params.toString();

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
            // Giữ nguyên logic xử lý lỗi API
            throw new Error(`API Error: ${response.status} - ${response.statusText}`);
        }

        const data = await response.json();
        currentIpSummaryData = data.results;
        currentPage = page;
        totalPages = data.num_pages;

        renderTable(currentIpSummaryData);
        renderPagination(totalPages, currentPage);

    } catch (error) {
        console.error('Lỗi khi tải dữ liệu tóm tắt IP:', error);
        // Giữ nguyên logic hiển thị thông báo lỗi
    } finally {
        hideTableLoading();
    }
}

// Hàm để render dữ liệu ra bảng HTML
function renderTable(data) {
    const tableBody = document.getElementById('ipSummaryTableBody');
    tableBody.innerHTML = '';

    if (!data || data.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="8" class="text-center">Không có dữ liệu lượt truy cập IP.</td></tr>';
        return;
    }

    data.forEach(item => {
        const row = tableBody.insertRow();
        
        const ipAddressCell = row.insertCell();
        const ipLink = document.createElement('a');
        ipLink.href = `/sggd/qtv/admin/IPDetail/?ip=${encodeURIComponent(item.ip_address || '')}`;
        ipLink.textContent = item.ip_address || 'N/A';
        ipAddressCell.appendChild(ipLink);

        row.insertCell().textContent = item.total_visits || 0;
        row.insertCell().textContent = item.latest_page || 'N/A';
        row.insertCell().textContent = item.last_visit_time || 'N/A';
        row.insertCell().textContent = item.location_info || 'N/A';
        row.insertCell().textContent = item.os_family || 'N/A';
        row.insertCell().textContent = item.browser_family || 'N/A';
        row.insertCell().textContent = item.device_family || 'N/A';
    });
}

// Hàm để render thanh phân trang
function renderPagination(num_pages, current_page) {
    const paginationUl = document.getElementById('pagination');
    paginationUl.innerHTML = '';

    if (num_pages <= 1) {
        return;
    }

    // Nút "Trước"
    const prevLi = document.createElement('li');
    prevLi.className = `page-item ${current_page === 1 ? 'disabled' : ''}`;
    prevLi.innerHTML = `<a class="page-link" href="#" onclick="loadIPSummaryData(${current_page - 1})">Trước</a>`;
    paginationUl.appendChild(prevLi);

    // Các nút số trang
    for (let i = 1; i <= num_pages; i++) {
        const pageLi = document.createElement('li');
        pageLi.className = `page-item ${i === current_page ? 'active' : ''}`;
        pageLi.innerHTML = `<a class="page-link" href="#" onclick="loadIPSummaryData(${i})">${i}</a>`;
        paginationUl.appendChild(pageLi);
    }

    // Nút "Sau"
    const nextLi = document.createElement('li');
    nextLi.className = `page-item ${current_page === num_pages ? 'disabled' : ''}`;
    nextLi.innerHTML = `<a class="page-link" href="#" onclick="loadIPSummaryData(${current_page + 1})">Sau</a>`;
    paginationUl.appendChild(nextLi);
}

// Hàm để áp dụng bộ lọc (gọi lại loadIPSummaryData từ trang 1)
function applyFilters() {
    loadIPSummaryData(1);
}

// Hàm để xóa bộ lọc và tải lại dữ liệu ban đầu
function clearFilters() {
    document.getElementById('startDate').value = '';
    document.getElementById('endDate').value = '';
    document.getElementById('exactDate').value = '';
    loadIPSummaryData(1);
}

// Hàm mới: Xuất dữ liệu ra Excel
function exportToExcel() {
    if (!currentIpSummaryData || currentIpSummaryData.length === 0) {
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
                <p>Không có dữ liệu IP để xuất Excel.</p>
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
        ['Địa chỉ IP', 'Tổng lượt truy cập', 'Trang truy cập cuối', 'Thời gian truy cập cuối', 'Vị trí', 'Hệ điều hành', 'Trình duyệt', 'Thiết bị'] // Tiêu đề cột
    ];

    currentIpSummaryData.forEach(item => {
        ws_data.push([
            item.ip_address || 'N/A',
            item.total_visits || 0,
            item.latest_page || 'N/A',
            item.last_visit_time || 'N/A',
            item.location_info || 'N/A',
            item.os_family || 'N/A',
            item.browser_family || 'N/A',
            item.device_family || 'N/A'
        ]);
    });

    const ws = XLSX.utils.aoa_to_sheet(ws_data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Thống kê IP truy cập");

    let fileName = `thong_ke_ip_truy_cap`;
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
            <p>Dữ liệu IP đã được xuất ra Excel thành công!</p>
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

// Gắn event listener cho nút Lọc và Xóa lọc
document.addEventListener('DOMContentLoaded', () => {
    // Bỏ event listener cho các ô input ngày tháng để tránh gọi API liên tục
    // Thay vào đó, chúng ta sẽ dùng nút "Lọc"
    document.getElementById('applyFilters').addEventListener('click', applyFilters);
    document.getElementById('clearFilters').addEventListener('click', clearFilters);
    document.getElementById('exportToExcel').addEventListener('click', exportToExcel);

    loadIPSummaryData(); // Tải dữ liệu ban đầu khi trang được load
});
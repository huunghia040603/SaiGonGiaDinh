// let currentIpSummaryData = []; // Biến toàn cục để lưu trữ dữ liệu IP thô

// // Hàm để lấy token xác thực, giống như trong admin_registrations.js
// function getAuthToken() {
//     // Kiểm tra xem URL hiện tại có phải là đường dẫn của giảng viên không
//     if (window.location.pathname.startsWith('/sggd/gv/manage')) {
//         // Nếu là trang quản lý giảng viên, lấy 'authToken' của giảng viên
//         return localStorage.getItem('authToken'); 
//     } 
//     // Nếu là trang admin, lấy 'adminAuthToken'
//     else if (window.location.pathname.startsWith('/sggd/qtv/admin')) {
//         return localStorage.getItem('adminAuthToken');
//     }
//     // Trường hợp khác, không có token mặc định nào được trả về (hoặc bạn có thể thêm logic khác)
//     return null; 
// }

// // Hàm để tải dữ liệu và hiển thị bảng
// async function loadIPSummaryData() {
//     const isAdminOrGVPage = window.location.pathname.startsWith('/sggd/qtv/admin') || window.location.pathname.startsWith('/sggd/gv/manage');
//     const token = getAuthToken();

//     if (isAdminOrGVPage && !token) {
//         console.warn('Lỗi: Không tìm thấy token xác thực. Vui lòng đăng nhập lại.');
//         const messageBox = document.createElement('div');
//         messageBox.innerHTML = `
//             <div style="
//                 position: fixed;
//                 top: 50%;
//                 left: 50%;
//                 transform: translate(-50%, -50%);
//                 background-color: white;
//                 padding: 20px;
//                 border-radius: 8px;
//                 box-shadow: 0 0 15px rgba(0,0,0,0.2);
//                 z-index: 1000;
//                 text-align: center;
//                 max-width: 300px;
//             ">
//                 <p>Bạn cần đăng nhập để xem thống kê IP. Chuyển hướng đến trang đăng nhập.</p>
//                 <button onclick="this.parentNode.remove()" style="
//                     background-color: #007bff;
//                     color: white;
//                     border: none;
//                     padding: 10px 20px;
//                     border-radius: 5px;
//                     cursor: pointer;
//                     margin-top: 10px;
//                 ">OK</button>
//             </div>
//         `;
//         document.body.appendChild(messageBox);
        
//         setTimeout(() => {
//             if (window.location.pathname.startsWith('/sggd/qtv/admin')) {
//                 window.location.href = '/admin/login'; 
//             } else if (window.location.pathname.startsWith('/sggd/gv/manage')) {
//                 window.location.href = '/sggd/gv/login'; 
//             }
//         }, 1000); 
//         return; 
//     }

//     const apiUrl = 'https://saigongiadinh.pythonanywhere.com/api/admin/ip-summary/';

//     try {
//         const fetchOptions = {
//             method: 'GET',
//             headers: {
//                 'Content-Type': 'application/json',
//                 'Accept': 'application/json'
//             }
//         };

//         if (token) {
//             fetchOptions.headers['Authorization'] = `Token ${token}`;
//         }

//         const response = await fetch(apiUrl, fetchOptions);

//         if (!response.ok) {
//             let errorMessage = `Lỗi ${response.status}: ${response.statusText}`;
//             try {
//                 const errorData = await response.json();
//                 errorMessage = errorData.detail || errorMessage;
//             } catch (jsonError) {
//                 console.warn('Server did not return JSON for error:', jsonError);
//             }

//             if (response.status === 401 || response.status === 403) {
//                 errorMessage = 'Phiên đăng nhập đã hết hạn hoặc bạn không có quyền truy cập. Vui lòng đăng nhập lại.';
//                 localStorage.removeItem('adminAuthToken'); 
//                 localStorage.removeItem('authToken'); 
//                 const messageBox = document.createElement('div');
//                 messageBox.innerHTML = `
//                     <div style="
//                         position: fixed;
//                         top: 50%;
//                         left: 50%;
//                         transform: translate(-50%, -50%);
//                         background-color: white;
//                         padding: 20px;
//                         border-radius: 8px;
//                         box-shadow: 0 0 15px rgba(0,0,0,0.2);
//                         z-index: 1000;
//                         text-align: center;
//                         max-width: 300px;
//                     ">
//                         <p>${errorMessage}</p>
//                         <button onclick="this.parentNode.remove()" style="
//                             background-color: #007bff;
//                             color: white;
//                             border: none;
//                             padding: 10px 20px;
//                             border-radius: 5px;
//                             cursor: pointer;
//                             margin-top: 10px;
//                         ">OK</button>
//                     </div>
//                 `;
//                 document.body.appendChild(messageBox);
                
//                 setTimeout(() => {
//                     if (window.location.pathname.startsWith('/sggd/qtv/admin')) {
//                         window.location.href = '/admin/login';
//                     } else if (window.location.pathname.startsWith('/sggd/gv/manage')) {
//                         window.location.href = '/sggd/gv/login';
//                     }
//                 }, 500);
//             } else {
//                 const messageBox = document.createElement('div');
//                 messageBox.innerHTML = `
//                     <div style="
//                         position: fixed;
//                         top: 50%;
//                         left: 50%;
//                         transform: translate(-50%, -50%);
//                         background-color: white;
//                         padding: 20px;
//                         border-radius: 8px;
//                         box-shadow: 0 0 15px rgba(0,0,0,0.2);
//                         z-index: 1000;
//                         text-align: center;
//                         max-width: 300px;
//                     ">
//                         <p>Lỗi khi tải dữ liệu: ${errorMessage}</p>
//                         <button onclick="this.parentNode.remove()" style="
//                             background-color: #007bff;
//                             color: white;
//                             border: none;
//                             padding: 10px 20px;
//                             border-radius: 5px;
//                             cursor: pointer;
//                             margin-top: 10px;
//                         ">OK</button>
//                     </div>
//                 `;
//                 document.body.appendChild(messageBox);
//             }
//             console.error('Lỗi API:', response.status, response.statusText, errorMessage);
//             throw new Error(`API Error: ${response.status} - ${response.statusText}`);
//         }

//         const data = await response.json();
//         currentIpSummaryData = data.results; // Lưu trữ mảng results vào biến toàn cục

//         renderTable(currentIpSummaryData);

//     } catch (error) {
//         console.error('Lỗi khi tải dữ liệu tóm tắt IP:', error);
//         const messageBox = document.createElement('div');
//         messageBox.innerHTML = `
//             <div style="
//                 position: fixed;
//                 top: 50%;
//                 left: 50%;
//                 transform: translate(-50%, -50%);
//                 background-color: white;
//                 padding: 20px;
//                 border-radius: 8px;
//                 box-shadow: 0 0 15px rgba(0,0,0,0.2);
//                 z-index: 1000;
//                 text-align: center;
//                 max-width: 300px;
//             ">
//                 <p>Không thể tải dữ liệu thống kê IP. Vui lòng kiểm tra console của trình duyệt để biết chi tiết lỗi.</p>
//                 <button onclick="this.parentNode.remove()" style="
//                     background-color: #007bff;
//                     color: white;
//                     border: none;
//                     padding: 10px 20px;
//                     border-radius: 5px;
//                     cursor: pointer;
//                     margin-top: 10px;
//                 ">OK</button>
//             </div>
//         `;
//         document.body.appendChild(messageBox);
//     }
// }

// // Hàm để render dữ liệu ra bảng HTML
// function renderTable(data) {
//     const tableBody = document.getElementById('ipSummaryTableBody');
//     tableBody.innerHTML = ''; // Xóa dữ liệu cũ

//     if (!data || data.length === 0) {
//         tableBody.innerHTML = '<tr><td colspan="9" class="text-center">Không có dữ liệu lượt truy cập IP.</td></tr>';
//         return;
//     }

//     data.forEach(item => {
//         const row = tableBody.insertRow();
        
//         // Tạo thẻ <a> cho cột Địa chỉ IP, trỏ đến trang chi tiết IP cục bộ
//         const ipAddressCell = row.insertCell();
//         const ipLink = document.createElement('a');
//         // Thay đổi đường dẫn href tại đây:
//         ipLink.href = `http://127.0.0.1:5000/sggd/qtv/admin/IPDetail/?ip=${encodeURIComponent(item.ip_address || '')}`;
//         ipLink.textContent = item.ip_address || 'N/A';
//         ipAddressCell.appendChild(ipLink);

//         row.insertCell().textContent = item.total_visits || 0;
//         row.insertCell().textContent = item.latest_page || 'N/A';
//         row.insertCell().textContent = item.last_visit_time || 'N/A';
//         row.insertCell().textContent = item.location_info || 'N/A';
//         row.insertCell().textContent = item.os_family || 'N/A';
//         row.insertCell().textContent = item.browser_family || 'N/A';
//         row.insertCell().textContent = item.device_family || 'N/A';
//     });
// }

// // Hàm mới: Xuất dữ liệu ra Excel
// function exportToExcel() {
//     if (!currentIpSummaryData || currentIpSummaryData.length === 0) {
//         const messageBox = document.createElement('div');
//         messageBox.innerHTML = `
//             <div style="
//                 position: fixed;
//                 top: 50%;
//                 left: 50%;
//                 transform: translate(-50%, -50%);
//                 background-color: white;
//                 padding: 20px;
//                 border-radius: 8px;
//                 box-shadow: 0 0 15px rgba(0,0,0,0.2);
//                 z-index: 1000;
//                 text-align: center;
//                 max-width: 300px;
//             ">
//                 <p>Không có dữ liệu IP để xuất Excel.</p>
//                 <button onclick="this.parentNode.remove()" style="
//                     background-color: #007bff;
//                     color: white;
//                     border: none;
//                     padding: 10px 20px;
//                     border-radius: 5px;
//                     cursor: pointer;
//                     margin-top: 10px;
//                 ">OK</button>
//             </div>
//         `;
//         document.body.appendChild(messageBox);
//         return;
//     }

//     const ws_data = [
//         ['Địa chỉ IP', 'Tổng lượt truy cập', 'Trang truy cập cuối', 'Thời gian truy cập cuối', 'Vị trí', 'Hệ điều hành', 'Trình duyệt', 'Thiết bị'] // Tiêu đề cột
//     ];

//     currentIpSummaryData.forEach(item => {
//         ws_data.push([
//             item.ip_address || 'N/A',
//             item.total_visits || 0,
//             item.latest_page || 'N/A',
//             item.last_visit_time || 'N/A',
//             item.location_info || 'N/A',
//             item.os_family || 'N/A',
//             item.browser_family || 'N/A',
//             item.device_family || 'N/A'
//         ]);
//     });

//     const ws = XLSX.utils.aoa_to_sheet(ws_data);
//     const wb = XLSX.utils.book_new();
//     XLSX.utils.book_append_sheet(wb, ws, "Thống kê IP truy cập");

//     let fileName = `thong_ke_ip_truy_cap`;
//     const date = new Date();
//     const year = date.getFullYear();
//     const month = (date.getMonth() + 1).toString().padStart(2, '0');
//     const day = date.getDate().toString().padStart(2, '0');
//     const hours = date.getHours().toString().padStart(2, '0');
//     const minutes = date.getMinutes().toString().padStart(2, '0');
//     fileName += `_${year}${month}${day}_${hours}${minutes}.xlsx`;

//     XLSX.writeFile(wb, fileName);
//     const messageBox = document.createElement('div');
//     messageBox.innerHTML = `
//         <div style="
//             position: fixed;
//             top: 50%;
//             left: 50%;
//             transform: translate(-50%, -50%);
//             background-color: white;
//             padding: 20px;
//             border-radius: 8px;
//             box-shadow: 0 0 15px rgba(0,0,0,0.2);
//             z-index: 1000;
//             text-align: center;
//             max-width: 300px;
//         ">
//             <p>Dữ liệu IP đã được xuất ra Excel thành công!</p>
//             <button onclick="this.parentNode.remove()" style="
//                 background-color: #007bff;
//                 color: white;
//                 border: none;
//                 padding: 10px 20px;
//                 border-radius: 5px;
//                 cursor: pointer;
//                 margin-top: 10px;
//             ">OK</button>
//         </div>
//     `;
//     document.body.appendChild(messageBox);
// }

// // Tải dữ liệu ban đầu khi trang được load
// document.addEventListener('DOMContentLoaded', () => {
//     loadIPSummaryData();
// });



let currentIpSummaryData = []; // Biến toàn cục để lưu trữ dữ liệu IP thô

// Hàm để hiển thị loading spinner ngay trong tbody
function showTableLoading() {
    const tableBody = document.getElementById('ipSummaryTableBody');
    if (tableBody) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="9">
                    <div class="spinner-container">
                        <div class="spinner"></div>
                        <div class="loading-text">Đang tải dữ liệu IP...</div>
                    </div>
                </td>
            </tr>
        `;
    }
}

// Hàm để ẩn loading spinner và chuẩn bị tbody để render dữ liệu
function hideTableLoading() {
    const tableBody = document.getElementById('ipSummaryTableBody');
    if (tableBody) {
        tableBody.innerHTML = ''; // Xóa spinner để chuẩn bị render dữ liệu hoặc thông báo không có dữ liệu
    }
}

// Hàm để lấy token xác thực, giống như trong admin_registrations.js
function getAuthToken() {
    // Kiểm tra xem URL hiện tại có phải là đường dẫn của giảng viên không
    if (window.location.pathname.startsWith('/sggd/gv/manage')) {
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

// Hàm để tải dữ liệu và hiển thị bảng
async function loadIPSummaryData() {
    showTableLoading(); // HIỂN THỊ LOADING TRƯỚC KHI BẮT ĐẦU TẢI DỮ LIỆU
    
    const isAdminOrGVPage = window.location.pathname.startsWith('/sggd/qtv/admin') || window.location.pathname.startsWith('/sggd/gv/manage');
    const token = getAuthToken();

    if (isAdminOrGVPage && !token) {
        hideTableLoading(); // ẨN LOADING NẾU CÓ LỖI TOKEN
        console.warn('Lỗi: Không tìm thấy token xác thực. Vui lòng đăng nhập lại.');
        // Phần hiển thị thông báo lỗi và chuyển hướng vẫn giữ nguyên
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
                <p>Bạn cần đăng nhập để xem thống kê IP. Chuyển hướng đến trang đăng nhập.</p>
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
            } else if (window.location.pathname.startsWith('/sggd/gv/manage')) {
                window.location.href = '/sggd/gv/login';
            }
        }, 1000);
        return;
    }

    const apiUrl = 'https://saigongiadinh.pythonanywhere.com/api/admin/ip-summary/';

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
                    } else if (window.location.pathname.startsWith('/sggd/gv/manage')) {
                        window.location.href = '/sggd/gv/login';
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

        const data = await response.json();
        currentIpSummaryData = data.results; // Lưu trữ mảng results vào biến toàn cục

        renderTable(currentIpSummaryData);

    } catch (error) {
        console.error('Lỗi khi tải dữ liệu tóm tắt IP:', error);
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
                <p>Không thể tải dữ liệu thống kê IP. Vui lòng kiểm tra console của trình duyệt để biết chi tiết lỗi.</p>
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
    } finally {
        hideTableLoading(); // ẨN LOADING DÙ THÀNH CÔNG HAY THẤT BẠI
    }
}

// Hàm để render dữ liệu ra bảng HTML
function renderTable(data) {
    const tableBody = document.getElementById('ipSummaryTableBody');
    tableBody.innerHTML = ''; // Xóa dữ liệu cũ (bao gồm cả spinner)

    if (!data || data.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="9" class="text-center">Không có dữ liệu lượt truy cập IP.</td></tr>';
        return;
    }

    data.forEach(item => {
        const row = tableBody.insertRow();
        
        // Tạo thẻ <a> cho cột Địa chỉ IP, trỏ đến trang chi tiết IP cục bộ
        const ipAddressCell = row.insertCell();
        const ipLink = document.createElement('a');
        // Thay đổi đường dẫn href tại đây:
        ipLink.href = `http://127.0.0.1:5000/sggd/qtv/admin/IPDetail/?ip=${encodeURIComponent(item.ip_address || '')}`;
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

// Tải dữ liệu ban đầu khi trang được load
document.addEventListener('DOMContentLoaded', () => {
    loadIPSummaryData();
});


document.addEventListener('DOMContentLoaded', () => {
    const apiUrl = 'https://saigongiadinh.pythonanywhere.com/dang-ky-nhap-hoc/';
    const tableBody = document.getElementById('table-body');
    const loadingIndicator = document.getElementById('loading');
    const errorMessage = document.getElementById('error-message');
    const exportExcelBtn = document.getElementById('exportExcelBtn'); // Nút xuất Excel

    // Modal elements
    const detailsModal = document.getElementById('detailsModal');
    const closeModalBtn = document.getElementById('closeModalBtn');
    const modalBody = document.getElementById('modal-body');

    // Biến để lưu trữ tất cả dữ liệu đã fetch, dùng cho chức năng xuất Excel
    let allFetchedData = [];

    // Hàm để tải dữ liệu từ API
    async function fetchData() {
        try {
            loadingIndicator.classList.remove('hidden'); // Hiển thị thông báo tải
            errorMessage.classList.add('hidden'); // Ẩn thông báo lỗi nếu có

            const response = await fetch(apiUrl);

            // Kiểm tra nếu phản hồi không thành công
            if (!response.ok) {
                throw new Error(`Lỗi HTTP: ${response.status}`);
            }

            const data = await response.json();
            allFetchedData = data; // Lưu trữ dữ liệu đã fetch
            displayData(data); // Hiển thị dữ liệu
        } catch (error) {
            console.error('Lỗi khi fetch dữ liệu:', error);
            errorMessage.classList.remove('hidden'); // Hiển thị thông báo lỗi
            tableBody.innerHTML = '<tr><td colspan="7" class="px-3 py-2 text-center text-red-600">Không thể tải dữ liệu. Vui lòng thử lại sau.</td></tr>'; // Thông báo lỗi trong bảng, colspan thay đổi
        } finally {
            loadingIndicator.classList.add('hidden'); // Ẩn thông báo tải
        }
    }

    // Hàm để hiển thị dữ liệu trong bảng
    function displayData(data) {
        tableBody.innerHTML = ''; // Xóa nội dung bảng hiện có
        if (data.length === 0) {
            tableBody.innerHTML = '<tr><td colspan="7" class="px-3 py-2 text-center text-gray-500">Không có dữ liệu để hiển thị.</td></tr>'; // colspan thay đổi
            return;
        }

        data.forEach((item, index) => { // Thêm tham số index vào forEach
            const row = document.createElement('tr');
            row.classList.add('hover:bg-gray-50'); // Hiệu ứng hover

            row.appendChild(createTableCell(index + 1)); // Sử dụng index + 1 làm STT
            row.appendChild(createTableCell(item.ho_ten));
            row.appendChild(createTableCell(formatDate(item.ngay_sinh)));
            row.appendChild(createTableCell(item.nganh_dang_ky_1));
            row.appendChild(createTableCell(item.nganh_dang_ky_2));
            row.appendChild(createTableCell(item.nganh_dang_ky_3));

            // Thêm nút "Xem Chi Tiết"
            const detailsCell = document.createElement('td');
            detailsCell.classList.add('px-3', 'py-2', 'whitespace-nowrap', 'text-sm', 'text-gray-900');
            const detailsButton = document.createElement('button');
            detailsButton.textContent = 'Xem Chi Tiết';
            detailsButton.classList.add('bg-blue-500', 'hover:bg-blue-700', 'text-white', 'font-bold', 'py-1', 'px-2', 'rounded', 'text-xs', 'shadow-sm');
            detailsButton.onclick = () => showDetailsModal(item); // Gán sự kiện click
            detailsCell.appendChild(detailsButton);
            row.appendChild(detailsCell);

            tableBody.appendChild(row);
        });
    }

    // Hàm helper để tạo ô bảng (td)
    function createTableCell(content) {
        const td = document.createElement('td');
        td.classList.add('px-3', 'py-2', 'whitespace-nowrap', 'text-sm', 'text-gray-900');
        td.textContent = content !== null ? content : ''; // Hiển thị rỗng nếu dữ liệu null
        return td;
    }

    // Hàm để hiển thị modal chi tiết
    function showDetailsModal(item) {
        modalBody.innerHTML = ''; // Xóa nội dung cũ
        // Tạo các cặp key-value để hiển thị trong modal
        const detailsMap = {
            "ID": item.id, // Vẫn giữ ID gốc trong modal chi tiết
            "Họ Tên": item.ho_ten,
            "Ngày Sinh": formatDate(item.ngay_sinh),
            "Giới Tính": item.gioi_tinh,
            "Dân Tộc": item.dan_toc,
            "Số CMND": item.so_cmnd,
            "Ngày Cấp CMND": formatDate(item.ngay_cap_cmnd),
            "Nơi Cấp CMND": item.noi_cap_cmnd,
            "Thành Phố": item.thanh_pho,
            "Quận": item.quan,
            "Phường": item.phuong,
            "Số Nhà/Tên Đường": item.so_nha_ten_duong,
            "Số Điện Thoại": item.so_dien_thoai,
            "Email": item.email,
            "Họ Tên Phụ Huynh": item.ho_ten_phu_huynh,
            "SĐT Phụ Huynh": item.so_dien_thoai_phu_huynh,
            "Ngành ĐK 1": item.nganh_dang_ky_1,
            "Ngành ĐK 2": item.nganh_dang_ky_2,
            "Ngành ĐK 3": item.nganh_dang_ky_3,
            "Ảnh CMND Mặt Trước": item.anh_cmnd_mat_truoc,
            "Ảnh CMND Mặt Sau": item.anh_cmnd_mat_sau,
            "Bản Sao Tốt Nghiệp THPT": item.ban_sao_tot_nghiep_thpt,
            "Ngày Tạo": formatDateTime(item.ngay_tao)
        };

        for (const key in detailsMap) {
            const value = detailsMap[key];
            const div = document.createElement('div');
            div.classList.add('mb-2');

            const label = document.createElement('strong');
            label.textContent = key + ': ';
            div.appendChild(label);

            if (key.includes('Ảnh CMND') && value && (value.startsWith('http://') || value.startsWith('https://'))) {
                const a = document.createElement('a');
                a.href = value;
                a.target = '_blank';
                const img = document.createElement('img');
                img.src = value;
                img.alt = key;
                img.classList.add('w-24', 'h-24', 'object-cover', 'rounded-md', 'cursor-pointer', 'shadow-sm', 'inline-block', 'ml-2');
                img.onerror = function() {
                    this.onerror=null;
                    this.src='https://placehold.co/96x96/cccccc/ffffff?text=Lỗi';
                    this.alt='Không tải được ảnh';
                    this.classList.add('border', 'border-red-400');
                };
                a.appendChild(img);
                div.appendChild(a);
            } else if (key === 'Bản Sao Tốt Nghiệp THPT' && value && (value.startsWith('http://') || value.startsWith('https://'))) {
                const a = document.createElement('a');
                a.href = value;
                a.textContent = 'Tải xuống';
                a.target = '_blank';
                a.classList.add('text-blue-600', 'hover:underline', 'ml-2');
                div.appendChild(a);
            } else {
                const span = document.createElement('span');
                span.textContent = value !== null ? value : '';
                div.appendChild(span);
            }
            modalBody.appendChild(div);
        }

        detailsModal.style.display = 'flex'; // Hiển thị modal
    }

    // Hàm đóng modal
    closeModalBtn.onclick = function() {
        detailsModal.style.display = 'none';
    }

    // Đóng modal khi click ra ngoài
    window.onclick = function(event) {
        if (event.target == detailsModal) {
            detailsModal.style.display = 'none';
        }
    }

    // Hàm định dạng ngày tháng (YYYY-MM-DD)
    function formatDate(dateString) {
        if (!dateString) return '';
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString('vi-VN'); // Định dạng theo ngôn ngữ Việt Nam
        } catch (e) {
            return dateString; // Trả về nguyên bản nếu không thể định dạng
        }
    }

    // Hàm định dạng ngày giờ (YYYY-MM-DDTHH:MM:SS)
    function formatDateTime(dateTimeString) {
        if (!dateTimeString) return '';
        try {
            const date = new Date(dateTimeString);
            return date.toLocaleDateString('vi-VN') + ' ' + date.toLocaleTimeString('vi-VN');
        } catch (e) {
            return dateTimeString;
        }
    }

    // Hàm xuất dữ liệu ra file Excel (.xlsx)
    function exportToExcel() {
        if (allFetchedData.length === 0) {
            alert('Không có dữ liệu để xuất Excel.');
            return;
        }

        // Định nghĩa các tiêu đề cột cho file Excel
        const headers = [
            "ID", "Họ Tên", "Ngày Sinh", "Giới Tính", "Dân Tộc", "Số CMND", "Ngày Cấp CMND",
            "Nơi Cấp CMND", "Thành Phố", "Quận", "Phường", "Số Nhà/Tên Đường", "Số Điện Thoại",
            "Email", "Họ Tên Phụ Huynh", "SĐT Phụ Huynh", "Ngành ĐK 1", "Ngành ĐK 2", "Ngành ĐK 3",
            "Ảnh CMND Mặt Trước", "Ảnh CMND Mặt Sau", "Bản Sao Tốt Nghiệp THPT", "Ngày Tạo"
        ];

        // Chuẩn bị dữ liệu cho worksheet
        const dataForSheet = [headers]; // Hàng đầu tiên là tiêu đề

        allFetchedData.forEach(item => {
            const row = [
                item.id,
                item.ho_ten,
                formatDate(item.ngay_sinh),
                item.gioi_tinh,
                item.dan_toc,
                item.so_cmnd,
                formatDate(item.ngay_cap_cmnd),
                item.noi_cap_cmnd,
                item.thanh_pho,
                item.quan,
                item.phuong,
                item.so_nha_ten_duong,
                item.so_dien_thoai,
                item.email,
                item.ho_ten_phu_huynh,
                item.so_dien_thoai_phu_huynh,
                item.nganh_dang_ky_1,
                item.nganh_dang_ky_2,
                item.nganh_dang_ky_3,
                item.anh_cmnd_mat_truoc,
                item.anh_cmnd_mat_sau,
                item.ban_sao_tot_nghiep_thpt,
                formatDateTime(item.ngay_tao)
            ];
            dataForSheet.push(row);
        });

        // Tạo một workbook mới
        const wb = XLSX.utils.book_new();
        // Tạo một worksheet từ mảng dữ liệu
        const ws = XLSX.utils.aoa_to_sheet(dataForSheet);

       

        // Tự động điều chỉnh độ rộng cột (Autosize columns)
        const max_widths = dataForSheet[0].map((col, i) => Math.max(...dataForSheet.map(row => (row[i] ? row[i].toString().length : 0))));
        ws['!cols'] = max_widths.map(w => ({width: w + 2})); // Thêm một chút padding

        // Thêm worksheet vào workbook
        XLSX.utils.book_append_sheet(wb, ws, "Danh Sách Đăng Ký");

        // Ghi workbook ra file Excel
        XLSX.writeFile(wb, "dang_ky_nhap_hoc.xlsx");
    }

    // Gán sự kiện click cho nút xuất Excel
    exportExcelBtn.addEventListener('click', exportToExcel);

    // Tải dữ liệu khi trang được tải
    fetchData();
});
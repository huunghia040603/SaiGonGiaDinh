document.addEventListener('DOMContentLoaded', function() {
    const searchInput = document.getElementById('searchInput');
    const searchIcon = document.getElementById('searchIcon');

    // Đảm bảo các phần tử HTML tồn tại trước khi thêm event listeners
    if (searchInput && searchIcon) {
        // Hàm để thực hiện tìm kiếm
        async function performSearch() {
            const query = searchInput.value.trim(); // Lấy giá trị từ input và loại bỏ khoảng trắng thừa

            if (query === "") {
                alert("Vui lòng nhập từ khóa tìm kiếm!");
                return; // Không gửi request nếu từ khóa rỗng
            }

            // URL API tìm kiếm của bạn, đã xác định là 'https://saigongiadinh.pythonanywhere.com/api/search/'
            const API_URL = 'https://saigongiadinh.pythonanywhere.com/api/search/'; 

            try {
                // Gửi yêu cầu GET đến API với query parameter 'q'
                const response = await fetch(`${API_URL}?q=${encodeURIComponent(query)}`);
                const data = await response.json(); // Phân tích JSON response

                if (response.ok) { // Status code là 2xx (ví dụ: 200 OK)
                   
                    
                    const entityType = data.entity_type;
                    const entityIdentifier = data.entity_identifier;
                    

                    if (entityType && entityIdentifier) {
                        // Gọi hàm getFrontendUrlFromBackendHint đã được điều chỉnh
                        const frontendUrl = getFrontendUrlFromBackendHint(entityType, entityIdentifier); 
                        if (frontendUrl) {
                            console.log("Frontend sẽ điều hướng đến:", frontendUrl);
                            window.location.href = frontendUrl; // Tự động điều hướng
                        } else {
                            // Trường hợp không thể xây dựng URL (entityType không khớp)
                            console.warn("Không thể xây dựng URL điều hướng cho:", entityType, entityIdentifier);
                        }
                    } else {
                        // Trường hợp tìm thấy nhưng không có đủ thông tin điều hướng (entityType/Identifier là null)
                        console.log("Kết quả tìm kiếm không cung cấp thông tin điều hướng cụ thể.");
                    }

                } else { // Status code là 4xx hoặc 5xx (ví dụ: 404 Not Found, 400 Bad Request)
                    
                    console.error('Lỗi tìm kiếm:', data.message);
                }
            } catch (error) {
                // Xử lý lỗi mạng hoặc lỗi server không gửi được response hợp lệ
                console.error('Đã xảy ra lỗi khi kết nối đến API:', error);
                alert("Đã xảy ra lỗi khi tìm kiếm. Vui lòng thử lại sau.");
            }
        }

        // Lắng nghe sự kiện click vào biểu tượng tìm kiếm
        searchIcon.addEventListener('click', performSearch);

        // Lắng nghe sự kiện nhấn Enter trong ô input tìm kiếm
        searchInput.addEventListener('keypress', function(event) {
            if (event.key === 'Enter') {
                event.preventDefault(); // Ngăn chặn hành vi mặc định của Enter (ví dụ: submit form nếu có)
                performSearch();
            }
        });
    } else {
        console.warn("Không tìm thấy searchInput hoặc searchIcon. Chức năng tìm kiếm có thể không hoạt động.");
    }

    // Hàm này sẽ được điều chỉnh để đơn giản hóa URL điều hướng
    function getFrontendUrlFromBackendHint(entityType, identifier) { // Bỏ parentIdentifier khỏi params nếu không dùng
        switch (entityType) {
            case 'department':
                // Điều hướng đến /tên_department (ví dụ: /ketoan)
                return `/${identifier}`; 
            case 'major':
                // Điều hướng đến /tên_ngành (ví dụ: /cong-nghe-ke-toan)
                return `/${identifier}`;
            default:
                // Nếu entityType không khớp, trả về null (hoặc một URL mặc định)
                return null;
        }
    }
});
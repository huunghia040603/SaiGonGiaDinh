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

            const API_URL = 'https://saigongiadinh.pythonanywhere.com/api/search/'; 

            try {
                const response = await fetch(`${API_URL}?q=${encodeURIComponent(query)}`);
                const data = await response.json(); // Phân tích JSON response

                if (response.ok) { // Status code là 2xx (ví dụ: 200 OK)
                    // API giờ trả về một đối tượng với khóa 'results' chứa mảng
                    if (data.results && data.results.length > 0) {
                        const firstResult = data.results[0];
                        const entityName = firstResult.name; // Lấy tên của ngành/khoa

                        console.log("DEBUG (performSearch): entityName =", entityName);

                        // Chuyển đổi tên thành slug trực tiếp
                        const targetUrl = `/${convertToSlug(entityName)}`; 
                        
                        console.log("DEBUG (performSearch): Target URL (trước khi điều hướng) =", targetUrl); 

                        if (targetUrl) {
                            // Thực hiện điều hướng
                            window.location.href = targetUrl; 
                        } else {
                            // Trường hợp này khó xảy ra nếu convertToSlug luôn trả về chuỗi
                            console.warn("Không thể tạo URL điều hướng từ tên:", entityName);
                            alert("Không tìm thấy đường dẫn cụ thể cho kết quả tìm kiếm này.");
                        }
                    } else {
                        alert("Không tìm thấy kết quả phù hợp.");
                    }

                } else { // Status code là 4xx hoặc 5xx (ví dụ: 404 Not Found, 400 Bad Request)
                    console.error('Lỗi tìm kiếm:', data.message);
                    alert(data.message || "Đã xảy ra lỗi khi tìm kiếm.");
                }
            } catch (error) {
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

    // Hàm chuyển đổi chuỗi sang slug
    // Hàm này được giữ nguyên vì nó hoạt động tốt
    function convertToSlug(text) {
        return text
            .toString()
            .normalize('NFD') // Chuẩn hóa Unicode
            .replace(/[\u0300-\u036f]/g, '') // Xóa dấu
            .toLowerCase() // Chuyển thành chữ thường
            .trim() // Xóa khoảng trắng ở đầu/cuối
            .replace(/\s+/g, '-') // Thay khoảng trắng bằng dấu gạch ngang
            .replace(/[đĐ]/g, 'd') // Xử lý ký tự 'đ' trong tiếng Việt
            .replace(/[^a-z0-9-]/g, '') // Xóa các ký tự không phải chữ, số, dấu gạch ngang
            .replace(/--+/g, '-'); // Thay nhiều dấu gạch ngang liên tiếp bằng một dấu
    }
});
document.addEventListener('DOMContentLoaded', function() {
    const newsGridContainer = document.getElementById('news-grid-container');
    const loadingMessage = document.getElementById('loading-message');
    const paginationContainer = document.getElementById('pagination-container');
    const API_URL = 'https://saigongiadinh.pythonanywhere.com/NewsListView/';
    const ITEMS_PER_PAGE = 6; // Số lượng bài viết mỗi trang

    let allNews = []; // Đảm bảo đây luôn là một mảng
    let currentPage = 1;

    // Hàm định dạng ngày tháng
    function formatDate(dateString) {
        const options = { year: 'numeric', month: '2-digit', day: '2-digit' };
        return new Date(dateString).toLocaleDateString('vi-VN', options);
    }

    // Hàm tạo một thẻ tin tức (news card)
    function createNewsCard(newsItem) {
        const newsCard = document.createElement('div');
        newsCard.classList.add('news-card');

        // Extract image URL safely
        // Dựa trên cấu trúc JSON, featured_image là một đường dẫn tương đối hoặc cần tiền tố
        // Nếu API trả về "image/upload/v1749022077/Screenshot_...", thì cần tiền tố Cloudinary
        const imageUrl = `https://res.cloudinary.com/dftarzzfw/${newsItem.featured_image}`; 
        
        // Ensure category is not null and has a default
        // Dựa trên JSON, tags là một mảng, bạn có thể lấy tên tag đầu tiên
        const category = newsItem.tags && newsItem.tags.length > 0 ? newsItem.tags[0].name : 'Chung'; 

        // Limit title to 3 lines (CSS handles truncation, nhưng bạn có thể cắt ở đây nếu muốn)
        const truncatedTitle = newsItem.title; 
        
        // Limit description to 3 lines (CSS handles truncation, nhưng bạn có thể cắt ở đây nếu muốn)
        const truncatedDescription = newsItem.short_description; // Sử dụng short_description

        // Construct detail URL. Assuming your backend has a detail view, e.g., /news/<slug>
        const detailUrl = newsItem.slug ? `/news/${newsItem.slug}` : '#'; 

        newsCard.innerHTML = `
            <div class="card-image-wrapper">
                <img src="${imageUrl}" alt="${newsItem.title}" class="card-image">
                <span class="card-category">${category}</span>
            </div>
            <div class="card-content">
                <h3 class="card-title">${truncatedTitle}</h3>
                <p class="card-date"><i class="far fa-calendar-alt"></i> ${formatDate(newsItem.published_date)}</p>
                <p class="card-excerpt">${truncatedDescription}</p>
                <a href="${detailUrl}" class="read-more">Đọc thêm <i class="fas fa-arrow-right"></i></a>
            </div>
        `;
        return newsCard;
    }

    // Hàm hiển thị tin tức cho trang hiện tại
    function displayNews(page) {
        newsGridContainer.innerHTML = ''; // Xóa tin tức cũ
        const startIndex = (page - 1) * ITEMS_PER_PAGE;
        const endIndex = startIndex + ITEMS_PER_PAGE;
        const newsToDisplay = allNews.slice(startIndex, endIndex); // allNews giờ là mảng, slice() hoạt động

        if (newsToDisplay.length === 0 && page === 1) {
            newsGridContainer.innerHTML = '<p style="text-align: center; font-size: 1.2em; color: #555;">Không có tin tức nào để hiển thị.</p>';
            return;
        }

        newsToDisplay.forEach(newsItem => {
            const card = createNewsCard(newsItem);
            newsGridContainer.appendChild(card);
        });
    }

    // Hàm tạo phân trang
    function setupPagination(totalItems) {
        paginationContainer.innerHTML = ''; // Xóa phân trang cũ
        const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);

        // Nút "Trước"
        const prevLink = document.createElement('a');
        prevLink.href = '#';
        prevLink.classList.add('page-link');
        prevLink.innerHTML = '<i class="fas fa-chevron-left"></i> Trước';
        if (currentPage === 1) {
            prevLink.classList.add('disabled');
        } else {
            prevLink.addEventListener('click', (e) => {
                e.preventDefault();
                currentPage--;
                displayNews(currentPage);
                setupPagination(totalItems);
                window.scrollTo({ top: newsGridContainer.offsetTop - 100, behavior: 'smooth' }); // Cuộn lên đầu phần tin tức
            });
        }
        paginationContainer.appendChild(prevLink);

        // Các nút số trang
        for (let i = 1; i <= totalPages; i++) {
            const pageLink = document.createElement('a');
            pageLink.href = '#';
            pageLink.classList.add('page-link');
            pageLink.textContent = i;
            if (i === currentPage) {
                pageLink.classList.add('active');
            } else {
                pageLink.addEventListener('click', (e) => {
                    e.preventDefault();
                    currentPage = i;
                    displayNews(currentPage);
                    setupPagination(totalItems);
                    window.scrollTo({ top: newsGridContainer.offsetTop - 100, behavior: 'smooth' }); // Cuộn lên đầu phần tin tức
                });
            }
            paginationContainer.appendChild(pageLink);
        }

        // Nút "Sau"
        const nextLink = document.createElement('a');
        nextLink.href = '#';
        nextLink.classList.add('page-link');
        nextLink.innerHTML = 'Sau <i class="fas fa-chevron-right"></i>';
        if (currentPage === totalPages) {
            nextLink.classList.add('disabled');
        } else {
            nextLink.addEventListener('click', (e) => {
                e.preventDefault();
                currentPage++;
                displayNews(currentPage);
                setupPagination(totalItems);
                window.scrollTo({ top: newsGridContainer.offsetTop - 100, behavior: 'smooth' }); // Cuộn lên đầu phần tin tức
            });
        }
        paginationContainer.appendChild(nextLink);
    }

    // Hàm Fetch dữ liệu từ API



    
    async function fetchNews() {
        loadingMessage.style.display = 'block'; // Hiển thị thông báo đang tải
        newsGridContainer.innerHTML = ''; // Xóa nội dung cũ để chuẩn bị tải mới

        try {
            const response = await fetch(API_URL);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();

          
            allNews = data.results || []; 
            
            loadingMessage.style.display = 'none'; // Ẩn thông báo đang tải

            displayNews(currentPage); // Hiển thị trang đầu tiên
            setupPagination(allNews.length); // Thiết lập phân trang
        } catch (error) {
            console.error('Lỗi khi fetch dữ liệu:', error);
            loadingMessage.textContent = 'Không thể tải tin tức. Vui lòng thử lại sau.';
            loadingMessage.style.color = 'red';
        }
    }
    

    // Gọi hàm fetch dữ liệu khi trang được tải
    fetchNews();
});
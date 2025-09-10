

document.addEventListener('DOMContentLoaded', function() {
    const newsGridContainer = document.getElementById('news-grid-container');
    const loadingMessage = document.getElementById('loading-message');
    const paginationContainer = document.getElementById('pagination-container');
    const API_URL = 'https://saigongiadinh.pythonanywhere.com/news/';
    const ITEMS_PER_PAGE = 6; // Số lượng bài viết mỗi trang

    let currentPage = 1;
    let totalPages = 1;

    // Hàm định dạng ngày tháng
    function formatDate(dateString) {
        const options = { year: 'numeric', month: '2-digit', day: '2-digit' };
        return new Date(dateString).toLocaleDateString('vi-VN', options);
    }

    // Hàm tạo một thẻ tin tức (news card)
    function createNewsCard(newsItem) {
        const newsCard = document.createElement('div');
        newsCard.classList.add('news-card');

        const imageUrl = newsItem.featured_image; 
        const newsType = newsItem.type_display;
        const truncatedTitle = newsItem.title; 
        const truncatedDescription = newsItem.short_description;
        const detailUrl = newsItem.link || (newsItem.slug ? `/news/${newsItem.slug}` : '#');
        
        let displayCategory;
        const newsTypeKey = newsItem.type_display;
        switch (newsTypeKey) {
            case "TIN TỨC": displayCategory = "Tin tức";
                break;
            case "TUYỂN SINH": displayCategory = "Tuyển sinh";
                break;
            case "TƯ VẤN": displayCategory = "Tư vấn";
                break;
            case "GIAO_DUC": displayCategory = "Giáo dục";
                break;
            case "PHONG_TRAO": displayCategory = "Phong trào";
                break;
            case "SU_KIEN": displayCategory = "Sự kiện";
                break;
            case "HOAT_DONG": displayCategory = "Hoạt động";
                break;
            default: displayCategory = newsType;
                break;
        }

        newsCard.innerHTML = `
            <div class="card-image-wrapper">
                <img src="${imageUrl}" alt="Ảnh bìa" class="image" style="width: 100%; height: 100%; opacity: 0.9;">
                <span class="card-category">${displayCategory}</span>
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

    // Hàm hiển thị tin tức đã nhận từ API
    function displayNews(newsItems) {
        newsGridContainer.innerHTML = '';
        if (newsItems.length === 0) {
            newsGridContainer.innerHTML = '<p style="text-align: center; font-size: 1.2em; color: #555;">Không có tin tức nào để hiển thị.</p>';
        } else {
            newsItems.forEach(newsItem => {
                const card = createNewsCard(newsItem);
                newsGridContainer.appendChild(card);
            });
        }
    }

    // Hàm tạo phân trang
    function setupPagination() {
        paginationContainer.innerHTML = '';

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
                fetchNews(currentPage - 1);
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
                    fetchNews(i);
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
                fetchNews(currentPage + 1);
            });
        }
        paginationContainer.appendChild(nextLink);
    }

    // Hàm Fetch dữ liệu từ API
    async function fetchNews(page = 1) {
        loadingMessage.style.display = 'block';
        newsGridContainer.innerHTML = '';
        paginationContainer.innerHTML = '';

        try {
            const response = await fetch(`${API_URL}?page=${page}`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();

            currentPage = data.current_page;
            totalPages = data.num_pages;

            loadingMessage.style.display = 'none';
            displayNews(data.results);
            setupPagination();
            window.scrollTo({ top: newsGridContainer.offsetTop - 100, behavior: 'smooth' });

        } catch (error) {
            console.error('Lỗi khi fetch dữ liệu:', error);
            loadingMessage.textContent = 'Không thể tải tin tức. Vui lòng thử lại sau.';
            loadingMessage.style.color = 'red';
        }
    }
    
    // Gọi hàm fetch dữ liệu khi trang được tải
    fetchNews();
});
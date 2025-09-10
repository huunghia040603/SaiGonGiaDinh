

document.addEventListener('DOMContentLoaded', function() {
    const newsGridContainer = document.getElementById('news-grid-container');
    const loadingMessage = document.getElementById('loading-message');
    const paginationContainer = document.getElementById('pagination-container');
    const API_URL = 'https://saigongiadinh.pythonanywhere.com/news/?page_size=100'; // Tăng page_size để lấy nhiều tin tức hơn
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
<<<<<<< HEAD
        
        // Limit description to 3 lines (CSS handles truncation, nhưng bạn có thể cắt ở đây nếu muốn)
        const truncatedDescription = newsItem.short_description; // Sử dụng short_description

        // Tất cả bài viết đều chuyển đến trang chi tiết nội bộ
        const detailUrl = `/news-detail?id=${newsItem.id}`;
=======
        const truncatedDescription = newsItem.short_description;
        const detailUrl = newsItem.link || (newsItem.slug ? `/news/${newsItem.slug}` : '#');
>>>>>>> e3efaf6256f36eba406897369c506a04045e0c46
        
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
                ${newsItem.link ? '<span class="external-indicator"><i class="fas fa-external-link-alt"></i></span>' : ''}
            </div>
            <div class="card-content">
                <h3 class="card-title">${truncatedTitle}</h3>
                <p class="card-date"><i class="far fa-calendar-alt"></i> ${formatDate(newsItem.published_date)}</p>
                <p class="card-excerpt">${truncatedDescription}</p>
                <div class="read-more">
                    Đọc thêm <i class="fas fa-arrow-right"></i>
                    ${newsItem.link ? '<span class="external-hint">(có link bên ngoài)</span>' : ''}
                </div>
            </div>
        `;
        
        // Thêm event listener cho toàn bộ card
        newsCard.addEventListener('click', function(e) {
            // Ngăn chặn event khi click vào các element con có thể có event riêng
            if (e.target.closest('.card-category') || e.target.closest('.external-indicator')) {
                return;
            }
            window.location.href = detailUrl;
        });
        
        return newsCard;
    }

<<<<<<< HEAD
    // Hàm hiển thị tin tức cho trang hiện tại
    function displayNews(page) {
        if (!newsGridContainer) {
            console.error('News grid container not found');
            return;
        }
        
        newsGridContainer.innerHTML = ''; // Xóa tin tức cũ
        const startIndex = (page - 1) * ITEMS_PER_PAGE;
        const endIndex = startIndex + ITEMS_PER_PAGE;
        const newsToDisplay = allNews.slice(startIndex, endIndex);
        
        console.log('Displaying news:', { page, startIndex, endIndex, totalNews: allNews.length, newsToDisplay: newsToDisplay.length }); // Debug log

        if (newsToDisplay.length === 0 && page === 1) {
=======
    // Hàm hiển thị tin tức đã nhận từ API
    function displayNews(newsItems) {
        newsGridContainer.innerHTML = '';
        if (newsItems.length === 0) {
>>>>>>> e3efaf6256f36eba406897369c506a04045e0c46
            newsGridContainer.innerHTML = '<p style="text-align: center; font-size: 1.2em; color: #555;">Không có tin tức nào để hiển thị.</p>';
        } else {
            newsItems.forEach(newsItem => {
                const card = createNewsCard(newsItem);
                newsGridContainer.appendChild(card);
            });
        }
    }

    // Hàm tạo phân trang
<<<<<<< HEAD
    function setupPagination(totalItems) {
        if (!paginationContainer) {
            console.error('Pagination container not found');
            return;
        }
        
        paginationContainer.innerHTML = ''; // Xóa phân trang cũ
        const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);
        
        console.log('Setting up pagination:', { totalItems, totalPages, currentPage }); // Debug log

        // Chỉ hiển thị phân trang nếu có nhiều hơn 1 trang
        if (totalPages <= 1) {
            paginationContainer.style.display = 'none';
            return;
        }
        
        paginationContainer.style.display = 'flex';
=======
    function setupPagination() {
        paginationContainer.innerHTML = '';
>>>>>>> e3efaf6256f36eba406897369c506a04045e0c46

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
<<<<<<< HEAD
                currentPage--;
                displayNews(currentPage);
                setupPagination(totalItems);
                window.scrollTo({ top: newsGridContainer.offsetTop - 100, behavior: 'smooth' });
=======
                fetchNews(currentPage - 1);
>>>>>>> e3efaf6256f36eba406897369c506a04045e0c46
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
<<<<<<< HEAD
                    currentPage = i;
                    displayNews(currentPage);
                    setupPagination(totalItems);
                    window.scrollTo({ top: newsGridContainer.offsetTop - 100, behavior: 'smooth' });
=======
                    fetchNews(i);
>>>>>>> e3efaf6256f36eba406897369c506a04045e0c46
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
<<<<<<< HEAD
                currentPage++;
                displayNews(currentPage);
                setupPagination(totalItems);
                window.scrollTo({ top: newsGridContainer.offsetTop - 100, behavior: 'smooth' });
=======
                fetchNews(currentPage + 1);
>>>>>>> e3efaf6256f36eba406897369c506a04045e0c46
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
<<<<<<< HEAD
            // Thử fetch với page_size lớn trước
            const response = await fetch(API_URL);
=======
            const response = await fetch(`${API_URL}?page=${page}`);
>>>>>>> e3efaf6256f36eba406897369c506a04045e0c46
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
<<<<<<< HEAD
            
            console.log('API Response:', data); // Debug log
            
            let allNewsData = [];
            
            // Xử lý dữ liệu từ API
            if (data && Array.isArray(data.results)) {
                allNewsData = data.results;
                console.log('Using data.results, count:', allNewsData.length);
            } else if (Array.isArray(data)) {
                allNewsData = data;
                console.log('Using data directly, count:', allNewsData.length);
            } else {
                allNewsData = [];
                console.log('No valid data found');
            }
            
            // Nếu có ít hơn 10 tin tức, thử fetch thêm
            if (allNewsData.length < 10 && data.next) {
                console.log('Fetching additional pages...');
                let page = 2;
                let hasMoreData = true;
                
                while (hasMoreData && page <= 5) { // Giới hạn 5 trang
                    try {
                        const nextResponse = await fetch(`${API_URL}&page=${page}`);
                        if (nextResponse.ok) {
                            const nextData = await nextResponse.json();
                            console.log(`Page ${page}:`, nextData);
                            
                            if (nextData && Array.isArray(nextData.results) && nextData.results.length > 0) {
                                allNewsData = allNewsData.concat(nextData.results);
                                page++;
                                hasMoreData = !!nextData.next;
                            } else {
                                hasMoreData = false;
                            }
                        } else {
                            hasMoreData = false;
                        }
                    } catch (pageError) {
                        console.warn(`Error fetching page ${page}:`, pageError);
                        hasMoreData = false;
                    }
                }
            }
            
            allNews = allNewsData;
            console.log('Tổng số bài viết đã fetch:', allNews.length); // Debug log
            
            loadingMessage.style.display = 'none'; // Ẩn thông báo đang tải

            if (allNews.length > 0) {
                displayNews(currentPage); // Hiển thị trang đầu tiên
                setupPagination(allNews.length); // Thiết lập phân trang
            } else {
                newsGridContainer.innerHTML = '<p style="text-align: center; font-size: 1.2em; color: #555;">Không có tin tức nào để hiển thị.</p>';
                paginationContainer.innerHTML = ''; // Xóa phân trang nếu không có dữ liệu
            }
=======

            currentPage = data.current_page;
            totalPages = data.num_pages;

            loadingMessage.style.display = 'none';
            displayNews(data.results);
            setupPagination();
            window.scrollTo({ top: newsGridContainer.offsetTop - 100, behavior: 'smooth' });

>>>>>>> e3efaf6256f36eba406897369c506a04045e0c46
        } catch (error) {
            console.error('Lỗi khi fetch dữ liệu:', error);
            loadingMessage.textContent = 'Không thể tải tin tức. Vui lòng thử lại sau.';
            loadingMessage.style.color = 'red';
            paginationContainer.innerHTML = ''; // Xóa phân trang khi có lỗi
        }
    }
    
    // Gọi hàm fetch dữ liệu khi trang được tải
    fetchNews();
});
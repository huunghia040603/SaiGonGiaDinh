document.addEventListener('DOMContentLoaded', function() {
    const API_BASE_URL = 'https://saigongiadinh.pythonanywhere.com/NewsListView/';
    const TAGS_API_URL = 'https://saigongiadinh.pythonanywhere.com/TagView/';
    const ALBUMS_API_URL = 'https://saigongiadinh.pythonanywhere.com/AlbumDetailView/';

    function getAuthToken() {
        return localStorage.getItem('adminAuthToken');
    }
    const AUTH_TOKEN = getAuthToken();

    const newsForm = document.getElementById('newsForm');
    const newsIdInput = document.getElementById('newsId');
    const titleInput = document.getElementById('title');
    const shortDescriptionInput = document.getElementById('short_description');
    const contentInput = document.getElementById('content');
    const featuredImageInput = document.getElementById('featured_image');
    const activeInput = document.getElementById('active');
    const tagsSelect = document.getElementById('tags');
    const albumGallerySelect = document.getElementById('album_gallery');
    const submitBtn = document.getElementById('submitBtn');
    const cancelFormBtn = document.getElementById('cancelFormBtn'); // Nút Hủy mới
    const newsListDiv = document.getElementById('newsList');
    const messageDiv = document.getElementById('message');
    const addNewsButton = document.getElementById('addNewsButton'); // Nút thêm tin tức

    // Hàm hiển thị thông báo
    function showMessage(msg, type) {
        messageDiv.textContent = msg;
        messageDiv.className = `message ${type}`;
        messageDiv.style.display = 'block'; // Đảm bảo thông báo hiển thị
        setTimeout(() => {
            messageDiv.style.display = 'none'; // Ẩn sau 5 giây
        }, 5000);
    }

    // Hàm ẩn form và nút hủy sửa
    function hideForm() {
        newsForm.classList.add('hidden');
        cancelFormBtn.classList.remove('hidden'); // Đảm bảo nút "Hủy" không bị ẩn khi form bị ẩn (chỉ ẩn khi form hiển thị)
        submitBtn.textContent = 'Tạo Tin tức'; // Đảm bảo nút trở lại trạng thái tạo
        addNewsButton.classList.remove('hidden'); // Hiển thị lại nút "Thêm Tin tức Mới"
        newsForm.reset(); // Reset form khi ẩn
        newsIdInput.value = ''; // Đảm bảo ID trống
        // Reset select tags và album
        Array.from(tagsSelect.options).forEach(option => option.selected = false);
        albumGallerySelect.value = '';
    }

    // Hàm hiển thị form
    function showForm() {
        newsForm.classList.remove('hidden');
        addNewsButton.classList.add('hidden'); // Ẩn nút "Thêm Tin tức Mới" khi form hiển thị
        cancelFormBtn.classList.remove('hidden'); // Đảm bảo nút "Hủy" được hiển thị cùng form
    }

    // Hàm fetch dữ liệu từ API
    async function fetchData(url, method = 'GET', data = null) {
        const headers = {
            'Content-Type': 'application/json',
            'Authorization': `Token ${AUTH_TOKEN}`
        };

        const options = {
            method: method,
            headers: headers,
        };

        if (data) {
            options.body = JSON.stringify(data);
        }

        try {
            const response = await fetch(url, options);
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.detail || JSON.stringify(errorData) || 'Có lỗi xảy ra!');
            }
            if (method === 'DELETE') {
                return null;
            }
            return await response.json();
        } catch (error) {
            console.error('Lỗi khi fetch dữ liệu:', error);
            showMessage(`Lỗi: ${error.message}`, 'error');
            throw error;
        }
    }

    // Hàm tải tags và albums vào dropdown
    async function loadTagsAndAlbums() {
        try {
            const tagsResponse = await axios.get(TAGS_API_URL);
        const tags = tagsResponse.data; // Lấy dữ liệu từ thuộc tính .data của response
        tagsSelect.innerHTML = '';
        tags.forEach(tag => {
            const option = document.createElement('option');
            option.value = tag.id;
            option.textContent = tag.name;
            tagsSelect.appendChild(option);
        });

        // Tương tự, nếu ALBUMS_API_URL trả về response object, bạn cũng cần truy cập .data
        const albumsResponse = await axios.get('https://saigongiadinh.pythonanywhere.com/AlbumDetailView/'); // Đảm bảo URL này là đúng để lấy danh sách album
        const albums = albumsResponse.data; // Lấy dữ liệu từ thuộc tính .data của response
        albumGallerySelect.innerHTML = '<option value="">-- Chọn Album --</option>';
        albums.forEach(album => {
            const option = document.createElement('option');
            option.value = album.id;
            option.textContent = album.title;
            albumGallerySelect.appendChild(option);
        });

        } catch (error) {
            console.error('Lỗi khi tải tags/albums:', error);
            setTimeout(showMessage('Không thể tải danh sách Tags hoặc Album.', 'error'),1000)
            
        }
    }

    // Hàm tải danh sách tin tức
    async function loadNews() {
        try {
            const news = await fetchData(API_BASE_URL);
            newsListDiv.innerHTML = '';
            if (news.length === 0) {
                newsListDiv.innerHTML = '<p>Chưa có tin tức nào.</p>';
                return;
            }
            news.forEach(item => {
                const newsItemDiv = document.createElement('div');
                newsItemDiv.className = 'news-item';
                newsItemDiv.innerHTML = `
                     <div>
                        <img class="image" src="https://res.cloudinary.com/dftarzzfw/${item.featured_image}" ></img>
                    </div>
                    <div>&nbsp;</div>
                    <span><strong>${item.title}</strong> (${item.active ? 'Đang hoạt động' : 'Không hoạt động'})</span>
                    <div>
                        <button class="edit-btn" data-id="${item.id}">Sửa</button>
                        <button class="delete-btn" data-id="${item.id}">Xóa</button>
                    </div>
                `;
                newsListDiv.appendChild(newsItemDiv);
            });
            addEventListenerToButtons(); // Thêm event listeners sau khi load tin tức
        } catch (error) {
            newsListDiv.innerHTML = `<p>Lỗi khi tải tin tức: ${error.message}</p>`;
        }
    }

    // Hàm xử lý tạo/cập nhật tin tức
    newsForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const newsId = newsIdInput.value;
        // Kiểm tra URL API: Nếu API_BASE_URL là danh sách, thì cho chi tiết sẽ là API_BASE_URL + id + '/'
        const url = newsId ? `https://saigongiadinh.pythonanywhere.com/NewsDetailView/${newsId}/` : API_BASE_URL;
        const method = newsId ? 'PUT' : 'POST'; // Sử dụng PUT cho cập nhật toàn bộ (nếu API hỗ trợ) hoặc PATCH

        const selectedTags = Array.from(tagsSelect.selectedOptions).map(option => parseInt(option.value)); // Chuyển sang số nguyên
        const selectedAlbum = albumGallerySelect.value ? parseInt(albumGallerySelect.value) : null; // Chuyển sang số nguyên hoặc null

        const newsData = {
            title: titleInput.value,
            short_description: shortDescriptionInput.value,
            content: contentInput.value,
            featured_image: featuredImageInput.value,
            active: activeInput.checked,
            tags: selectedTags,
            album_gallery: selectedAlbum
        };

        try {
            await fetchData(url, method, newsData);
            showMessage(newsId ? 'Cập nhật tin tức thành công!' : 'Tạo tin tức thành công!', 'success');
            hideForm(); // Ẩn form sau khi tạo/sửa thành công
            loadNews(); // Tải lại danh sách
        } catch (error) {
            // Lỗi đã được show trong fetchData
        }
    });

    // Hàm điền dữ liệu vào form để sửa
    async function editNews(id) {
        try {
            // Kiểm tra URL API: Nếu API_BASE_URL là danh sách, thì cho chi tiết sẽ là API_BASE_URL + id + '/'
            const news = await fetchData(`https://saigongiadinh.pythonanywhere.com/NewsDetailView/${id}/`);
            
            newsIdInput.value = news.id;
            titleInput.value = news.title;
            shortDescriptionInput.value = news.short_description;
            contentInput.value = news.content;
            featuredImageInput.value = news.featured_image || '';
            activeInput.checked = news.active;

            // Chọn tags
            Array.from(tagsSelect.options).forEach(option => {
                // Đảm bảo so sánh đúng kiểu dữ liệu (số nguyên)
                option.selected = news.tags.includes(parseInt(option.value));
            });

            // Chọn album
            albumGallerySelect.value = news.album_gallery || '';

            submitBtn.textContent = 'Cập nhật Tin tức';
            showForm(); // Hiển thị form để sửa
            window.scrollTo({ top: 0, behavior: 'smooth' }); // Cuộn lên đầu form
        } catch (error) {
            // Lỗi đã được show trong fetchData
        }
    }

    // Hàm xóa tin tức
    async function deleteNews(id) {
        if (confirm('Bạn có chắc chắn muốn xóa tin tức này không?')) {
            try {
                // Kiểm tra URL API: Nếu API_BASE_URL là danh sách, thì cho chi tiết sẽ là API_BASE_URL + id + '/'
                await fetchData(`https://saigongiadinh.pythonanywhere.com/NewsDetailView/${id}/`, 'DELETE');
                showMessage('Xóa tin tức thành công!', 'success');
                loadNews(); // Tải lại danh sách
            } catch (error) {
                // Lỗi đã được show trong fetchData
            }
        }
    }

    // Thêm event listeners cho các nút Sửa/Xóa sau khi tin tức được tải
    function addEventListenerToButtons() {
        document.querySelectorAll('.edit-btn').forEach(button => {
            button.addEventListener('click', (e) => editNews(e.target.dataset.id));
        });
        document.querySelectorAll('.delete-btn').forEach(button => {
            button.addEventListener('click', (e) => deleteNews(e.target.dataset.id));
        });
    }

    // Xử lý nút "Hủy" mới
    cancelFormBtn.addEventListener('click', () => {
        hideForm(); // Gọi hàm hideForm để reset và ẩn form
    });

    // Xử lý nút "Thêm Tin tức Mới"
    addNewsButton.addEventListener('click', () => {
        showForm(); // Hiển thị form
        newsForm.reset(); // Đảm bảo form trống
        newsIdInput.value = ''; // Đảm bảo không có ID cũ
        submitBtn.textContent = 'Tạo Tin tức'; // Đặt lại text nút
        // Đảm bảo các select về trạng thái mặc định
        Array.from(tagsSelect.options).forEach(option => option.selected = false);
        albumGallerySelect.value = '';
    });

    // Tải dữ liệu ban đầu khi trang load
    // Form sẽ được ẩn ban đầu qua CSS (class="hidden")
    loadTagsAndAlbums();
    loadNews();
});
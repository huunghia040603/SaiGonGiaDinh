const CLOUDINARY_CLOUD_NAME = 'dftarzzfw';
const CLOUDINARY_UPLOAD_PRESET = 'SGGDCollege';
const CLOUDINARY_UPLOAD_URL = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`;

if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_UPLOAD_PRESET || CLOUDINARY_CLOUD_NAME === 'your_cloudinary_cloud_name') {
    alert("Lỗi cấu hình Cloudinary: Vui lòng cập nhật CLOUDINARY_CLOUD_NAME và CLOUDINARY_UPLOAD_PRESET trong manage_news.js!");
}

// --- API Endpoints ---

const NEWS_API_URL = `https://saigongiadinh.pythonanywhere.com/news/`;
const TAGS_API_URL = `https://saigongiadinh.pythonanywhere.com/TagView/`;
const ALBUMS_API_URL = `https://saigongiadinh.pythonanywhere.com/albums/`;
const IMAGES_API_URL = `https://saigongiadinh.pythonanywhere.com/images/`; // Endpoint để tạo Image model trong DB

// --- DOM Elements ---
const newsForm = document.getElementById('newsForm');
const addNewsButton = document.getElementById('addNewsButton');
const cancelFormBtn = document.getElementById('cancelFormBtn');
const submitBtn = document.getElementById('submitBtn');
const newsIdInput = document.getElementById('newsId');
const titleInput = document.getElementById('title');
const shortDescriptionInput = document.getElementById('short_description');
const contentInput = document.getElementById('content_textarea');
const featuredImageInput = document.getElementById('featured_image');
const activeCheckbox = document.getElementById('active');
const tagsSelect = document.getElementById('tags');
// const albumGallerySelect = document.getElementById('album_gallery'); // Loại bỏ trường này vì không dùng cho việc gửi dữ liệu lồng ghép
const messageDiv = document.getElementById('message');
const newsListAllDiv = document.getElementById('news-list-all');
const paginationAllDiv = document.getElementById('pagination-all');

const featuredImageUploadInput = document.getElementById('featuredImageUpload'); // Input type="file"
const featuredImagePreview = document.getElementById('featuredImagePreview'); // <img> tag for preview
const featuredImageUrlHiddenInput = document.getElementById('featured_image_url_hidden'); // Hidden input to store the final URL


// New elements for image upload
const albumImagesInput = document.getElementById('albumImagesInput');
const imagePreviewContainer = document.getElementById('imagePreviewContainer');
const uploadImagesBtn = document.getElementById('uploadImagesBtn');
const imageUploadArea = document.getElementById('imageUploadArea');


// --- Global Variables ---
let availableTags = [];
let currentPage = 1;
const ITEMS_PER_PAGE = 5;
let filesToUpload = []; // Array to store files selected by the user for album upload
let uploadedImageUrls = []; // Array to store Cloudinary URLs for album
let featuredImageFile = null; // New: Variable to store the selected featured image file
let uploadedFeaturedImageUrl = ''; // New: Variable to store the Cloudinary URL for featured image


// --- Utility Functions ---

function showMessage(msg, type) {
    messageDiv.textContent = msg;
    messageDiv.className = `message ${type}`;
    messageDiv.style.display = 'block';
    console.log(`[showMessage] Loại: ${type}, Nội dung: ${msg}`); // CONSOLE LOG ĐÃ THÊM
    setTimeout(() => {
        messageDiv.style.display = 'none';
    }, 5000);
}
function displayFeaturedImagePreview(file) {
    console.log("[displayFeaturedImagePreview] Hiển thị bản xem trước ảnh bìa.");
    if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            featuredImagePreview.src = e.target.result;
            featuredImagePreview.style.display = 'block';
        };
        reader.readAsDataURL(file);
    } else {
        featuredImagePreview.src = '';
        featuredImagePreview.style.display = 'none';
        featuredImageUrlHiddenInput.value = ''; // Clear hidden input if no file
    }
}

function getDisplayTagName(rawName) {
    return rawName.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, c => c.toUpperCase());
}

// Function to get CSRF token (still needed for backend API calls)
 function getAuthToken() {
        return localStorage.getItem('adminAuthToken');
    }
 const authToken = getAuthToken();

// --- Fetch Data Functions ---

async function fetchTags() {
    console.log("[fetchTags] Bắt đầu tải tags..."); // CONSOLE LOG ĐÃ THÊM
    try {
        const response = await fetch(TAGS_API_URL);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        console.log("[fetchTags] Dữ liệu tags nhận được:", data); // CONSOLE LOG ĐÃ THÊM

        let tagsToProcess = [];

        if (Array.isArray(data)) {
            tagsToProcess = data;
        } else if (data && Array.isArray(data.results)) {
            tagsToProcess = data.results;
        } else {
            console.warn("Tag API did not return expected array format (direct array or .results array):", data);
            showMessage('Không thể tải danh sách tags: Định dạng dữ liệu không hợp lệ.', 'error');
            return;
        }

        availableTags = tagsToProcess;
        tagsSelect.innerHTML = '<option value="">-- Chọn Tag --</option>';
        tagsToProcess.forEach(tag => {
            const option = document.createElement('option');
            option.value = tag.id;
            option.textContent = getDisplayTagName(tag.name);
            tagsSelect.appendChild(option);
        });
        console.log("[fetchTags] Tags đã được tải và hiển thị thành công."); // CONSOLE LOG ĐÃ THÊM

    } catch (error) {
        console.error('Lỗi khi tải tags:', error);
        showMessage('Không thể tải danh sách tags. Vui lòng kiểm tra kết nối hoặc API.', 'error');
    }
}

async function fetchNews(page = 1) {
    console.log(`[fetchNews] Bắt đầu tải tin tức, trang: ${page}`); // CONSOLE LOG ĐÃ THÊM
    try {
        const response = await fetch(`${NEWS_API_URL}?page=${page}&page_size=${ITEMS_PER_PAGE}`);
        if (!response.ok) throw new Error('Không thể tải tin tức');
        const data = await response.json();
        console.log("[fetchNews] Dữ liệu tin tức nhận được:", data); // CONSOLE LOG ĐÃ THÊM
        displayNews(data.results);
        setupPagination(data.count, page);
        currentPage = page; // Cập nhật trang hiện tại
        console.log("[fetchNews] Tin tức và phân trang đã được cập nhật."); // CONSOLE LOG ĐÃ THÊM
    } catch (error) {
        console.error('Lỗi khi tải tin tức:', error);
        newsListAllDiv.innerHTML = '<p style="text-align: center; color: red;">Không thể tải tin tức.</p>';
        showMessage('Không thể tải tin tức.', 'error'); // CONSOLE LOG ĐÃ THÊM
    }
}

// --- Display Functions ---

function displayNews(newsItems) {
    console.log("[displayNews] Hiển thị danh sách tin tức...");
    newsListAllDiv.innerHTML = '';
    if (newsItems.length === 0) {
        newsListAllDiv.innerHTML = '<p style="text-align: center;">Chưa có tin tức nào.</p>';
        console.log("[displayNews] Không có tin tức để hiển thị.");
        return;
    }
    newsItems.forEach(news => {
        const newsItemDiv = document.createElement('div');
        newsItemDiv.className = 'news-item';
        const tagsHtml = news.tags.map(tag => getDisplayTagName(tag.name)).join(', ');

        const formattedDate = new Date(news.published_date || news.created_at).toLocaleDateString('vi-VN', {
            day: '2-digit', month: '2-digit', year: 'numeric'
        });

        // Xây dựng URL đầy đủ cho ảnh bìa khi hiển thị
        const fullFeaturedImageUrl = news.featured_image ;

        newsItemDiv.innerHTML = `
            <img src="${fullFeaturedImageUrl}" alt="Ảnh bìa" class="image">
            <span>
                <strong>${news.title}</strong>
                <span class="news-meta">
                    Ngày đăng: ${formattedDate} | Loại tin tức: <span class="tags">${tagsHtml}</span>
                </span>
            </span>
            <div>
                <button class="edit-btn" data-id="${news.id}">Sửa</button>
                <button class="delete-btn" data-id="${news.id}">Xóa</button>
            </div>
        `;
        newsListAllDiv.appendChild(newsItemDiv);
    });
    addNewsEventListeners();
    console.log("[displayNews] Danh sách tin tức đã được hiển thị.");
}

function setupPagination(totalItems, currentPage) {
    console.log(`[setupPagination] Thiết lập phân trang: Tổng số mục = ${totalItems}, Trang hiện tại = ${currentPage}`); // CONSOLE LOG ĐÃ THÊM
    paginationAllDiv.innerHTML = '';
    const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);

    if (totalPages <= 1) return; // No pagination needed for 1 or fewer pages

    const createPageLink = (page, text, isDisabled = false, isActive = false) => {
        const link = document.createElement('a');
        link.href = '#';
        link.textContent = text;
        link.classList.add('page-link');
        if (isDisabled) link.classList.add('disabled');
        if (isActive) link.classList.add('active');
        link.addEventListener('click', (e) => {
            e.preventDefault();
            if (!isDisabled && !isActive) {
                fetchNews(page);
            }
        });
        return link;
    };

    // Previous button
    paginationAllDiv.appendChild(createPageLink(currentPage - 1, 'Trước', currentPage === 1));

    // Page numbers
    for (let i = 1; i <= totalPages; i++) {
        paginationAllDiv.appendChild(createPageLink(i, i, false, i === currentPage));
    }

    // Next button
    paginationAllDiv.appendChild(createPageLink(currentPage + 1, 'Sau', currentPage === totalPages));
    console.log("[setupPagination] Phân trang đã được thiết lập."); // CONSOLE LOG ĐÃ THÊM
}

async function uploadFeaturedImage(file) {
    console.log(`[Cloudinary Upload] Đang tải lên ảnh bìa: ${file.name}`);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);

    try {
        const cloudinaryResponse = await axios.post(
            `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
            formData
        );

        if (cloudinaryResponse.data && cloudinaryResponse.data.secure_url) {
            const fullUrl = cloudinaryResponse.data.secure_url;
            
            uploadedFeaturedImageUrl = fullUrl; // LƯU URL ĐẦY ĐỦ
            console.log(`[Cloudinary Upload] Tải lên ảnh bìa thành công: ${fullUrl}`);
            return fullUrl; // TRẢ VỀ URL ĐẦY ĐỦ
        } else {
            throw new Error(`Upload ảnh bìa ${file.name} lên Cloudinary thất bại.`);
        }
    } catch (error) {
        console.error('Lỗi khi tải ảnh bìa lên Cloudinary:', error);
        throw error;
    }
}

// --- Form Handling ---

function resetForm() {
    console.log("[resetForm] Đặt lại biểu mẫu...");
    newsForm.reset();
    newsIdInput.value = '';
    submitBtn.textContent = 'Tạo Tin tức';
    newsForm.classList.add('hidden');
    
    // Clear album image upload related fields
    filesToUpload = [];
    uploadedImageUrls = [];
    imagePreviewContainer.innerHTML = '';
    uploadImagesBtn.classList.add('hidden');
    uploadImagesBtn.textContent = 'Tải ảnh đã chọn lên Cloudinary';
    uploadImagesBtn.disabled = false;

    // New: Clear featured image related fields
    featuredImageFile = null;
    uploadedFeaturedImageUrl = '';
    displayFeaturedImagePreview(null); // Clear featured image preview
    featuredImageUploadInput.value = ''; // Reset file input

    showMessage('', ''); // Clear any previous messages
    currentNewsAlbumData = null;
    console.log("[resetForm] Biểu mẫu đã được đặt lại hoàn toàn.");
}

async function populateFormForEdit(news) {
    console.log("[populateFormForEdit] Điền dữ liệu vào form để chỉnh sửa tin tức:", news);
    newsIdInput.value = news.id;
    titleInput.value = news.title;
    shortDescriptionInput.value = news.short_description;
    contentInput.value = news.content;
    
    // New: Handle existing featured image for edit mode
    uploadedFeaturedImageUrl = news.featured_image; // Lưu URL đã cắt của ảnh hiện có
    if (news.featured_image) {
        // Tạo URL đầy đủ để hiển thị preview
        featuredImagePreview.src = `https://res.cloudinary.com/${CLOUDINARY_CLOUD_NAME}/${news.featured_image}`;
        featuredImagePreview.style.display = 'block';
    } else {
        displayFeaturedImagePreview(null);
    }
    featuredImageUploadInput.value = ''; // Xóa giá trị của input file để người dùng có thể chọn ảnh mới
    featuredImageFile = null; // Reset file đã chọn

    activeCheckbox.checked = news.active;
    
    if (news.tags && news.tags.length > 0) {
        tagsSelect.value = news.tags[0].id;
        console.log("[populateFormForEdit] Tag đã chọn:", tagsSelect.value);
    } else {
        tagsSelect.value = '';
        console.log("[populateFormForEdit] Không có tag nào được chọn.");
    }
    
    currentNewsAlbumData = news.album_gallery;
    console.log("[populateFormForEdit] Dữ liệu album hiện tại:", currentNewsAlbumData);

    // Khi chỉnh sửa, xóa các trường chọn ảnh album mới để tránh nhầm lẫn
    filesToUpload = [];
    uploadedImageUrls = [];
    imagePreviewContainer.innerHTML = '';
    uploadImagesBtn.classList.add('hidden');
    uploadImagesBtn.textContent = 'Tải ảnh đã chọn lên Cloudinary';
    uploadImagesBtn.disabled = false;

    submitBtn.textContent = 'Cập nhật Tin tức';
    newsForm.classList.remove('hidden');
    window.scrollTo(0, 0);
    console.log("[populateFormForEdit] Form đã được điền đầy đủ và sẵn sàng chỉnh sửa.");
}

async function handleFormSubmit(event) {
    event.preventDefault();
    console.log("[handleFormSubmit] Form đã được submit.");

    const newsId = newsIdInput.value;
    const method = newsId ? 'PUT' : 'POST';
    const url = newsId ? `${NEWS_API_URL}${newsId}/` : NEWS_API_URL;
    console.log(`[handleFormSubmit] Phương thức: ${method}, URL: ${url}`);

    if (!titleInput.value || !shortDescriptionInput.value || !contentInput.value || !tagsSelect.value) {
        showMessage('Vui lòng điền đầy đủ các trường bắt buộc (Tiêu đề, Mô tả ngắn, Nội dung, Loại tin tức).', 'error');
        console.warn("[handleFormSubmit] Lỗi xác thực: Các trường bắt buộc bị thiếu.");
        return;
    }

    // --- Xử lý upload ảnh bìa (Featured Image) ---
    let finalFeaturedImageUrl = uploadedFeaturedImageUrl; // Mặc định là URL đã có (nếu sửa) hoặc rỗng
    if (featuredImageFile) { // Nếu người dùng đã chọn một file ảnh bìa mới
        showMessage('Đang tải ảnh bìa lên Cloudinary...', 'info');
        try {
            finalFeaturedImageUrl = await uploadFeaturedImage(featuredImageFile); // Upload và lấy URL đã cắt
            showMessage('Ảnh bìa đã tải lên thành công. Đang xử lý tin tức...', 'info');
            console.log("[handleFormSubmit] Ảnh bìa mới đã được tải lên Cloudinary.");
        } catch (error) {
            showMessage(`Lỗi khi tải ảnh bìa: ${error.message}. Vui lòng thử lại.`, 'error');
            console.error("[handleFormSubmit] Lỗi tải ảnh bìa:", error);
            return; // Dừng quá trình submit nếu có lỗi upload ảnh bìa
        }
    } else if (newsId && !uploadedFeaturedImageUrl) {
        // Nếu đang sửa và không có ảnh bìa cũ, cũng không có ảnh bìa mới, thì báo lỗi hoặc để trống tùy nghiệp vụ
        console.warn("[handleFormSubmit] Không có ảnh bìa được chọn cho tin tức đang sửa.");
        // Bạn có thể đặt validation ở đây nếu ảnh bìa là bắt buộc
    }
    // featured_image_url_hidden.value = finalFeaturedImageUrl; // Cập nhật hidden input (tùy chọn, không bắt buộc nếu gửi trực tiếp)


    let albumGalleryPayload = null;
    console.log("[handleFormSubmit] uploadedImageUrls.length:", uploadedImageUrls.length);
    console.log("[handleFormSubmit] newsId:", newsId);
    console.log("[handleFormSubmit] currentNewsAlbumData:", currentNewsAlbumData);

    // Priority 1: Nếu có ảnh mới được tải lên Cloudinary (cho album), tạo album mới hoặc thêm ảnh vào album hiện có
    if (uploadedImageUrls.length > 0) {
        albumGalleryPayload = {
            title: titleInput.value ? `Album của ${titleInput.value}` : `Album Tin tức - ${new Date().toLocaleString()}`,
            description: `Ảnh liên quan đến tin tức: ${titleInput.value || ''}`,
            image_urls_for_creation: uploadedImageUrls.map(img => img.image_file)
        };
        if (newsId && currentNewsAlbumData && currentNewsAlbumData.id) {
            albumGalleryPayload.id = currentNewsAlbumData.id;
        }
        console.log("[handleFormSubmit] Đã chuẩn bị albumGalleryPayload với ảnh mới:", albumGalleryPayload);
    } else {
        if (newsId && currentNewsAlbumData) {
            albumGalleryPayload = {
                id: currentNewsAlbumData.id,
                title: currentNewsAlbumData.title,
                description: currentNewsAlbumData.description,
            };
            console.log("[handleFormSubmit] Đã chuẩn bị albumGalleryPayload giữ nguyên album cũ:", albumGalleryPayload);
        } else {
            console.log("[handleFormSubmit] Không có ảnh mới nào được tải lên và không có album cũ để giữ lại. albumGalleryPayload = null.");
        }
    }

    const newsData = {
        title: titleInput.value,
        short_description: shortDescriptionInput.value,
        content: contentInput.value,
        featured_image: finalFeaturedImageUrl, // <-- Gửi URL ảnh bìa đã được xử lý
        active: activeCheckbox.checked,
        tags: tagsSelect.value ? [parseInt(tagsSelect.value)] : [],
        album_gallery: albumGalleryPayload
    };

    console.log("[handleFormSubmit] Dữ liệu NEWS_API_URL sẽ gửi:", newsData);
    console.log("[handleFormSubmit] Headers sẽ gửi:", {
        'Content-Type': 'application/json',
        'Authorization': `Token ${authToken}`
    });

    try {
        const response = await fetch(url, {
            method: method,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Token ${authToken}`
            },
            body: JSON.stringify(newsData)
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error('Lỗi API:', errorData);
            let errorMessage = `Đã xảy ra lỗi khi ${newsId ? 'cập nhật' : 'tạo'} tin tức.`;
            if (errorData && typeof errorData === 'object') {
                errorMessage += ' Chi tiết: ' + Object.values(errorData).flat().join('; ');
            }
            throw new Error(errorMessage);
        }

        const result = await response.json();
        console.log(`[handleFormSubmit] Phản hồi API thành công:`, result);
        showMessage(`Tin tức đã được ${newsId ? 'cập nhật' : 'tạo'} thành công!`, 'success');
        resetForm();
        fetchNews(currentPage);
    } catch (error) {
        console.error('Lỗi:', error);
        showMessage(error.message, 'error');
    }
}


// --- Event Listeners ---

addNewsButton.addEventListener('click', () => {
    console.log("[EventListener] Nút 'Thêm Tin tức' được nhấp."); // CONSOLE LOG ĐÃ THÊM
    resetForm();
    newsForm.classList.remove('hidden');
    window.scrollTo(0, 0);
});

cancelFormBtn.addEventListener('click', () => {
    console.log("[EventListener] Nút 'Hủy' được nhấp."); // CONSOLE LOG ĐÃ THÊM
    resetForm();
});

featuredImageUploadInput.addEventListener('change', (event) => {
    console.log("[EventListener] Tệp ảnh bìa đã được chọn.");
    const file = event.target.files[0];
    featuredImageFile = file; // Lưu file đã chọn vào biến toàn cục
    displayFeaturedImagePreview(file); // Hiển thị bản xem trước
});
newsForm.addEventListener('submit', handleFormSubmit); // Nút submit sẽ kích hoạt toàn bộ quy trình

function addNewsEventListeners() {
    document.querySelectorAll('.edit-btn').forEach(button => {
        button.onclick = async (e) => {
            const newsId = e.target.dataset.id;
            console.log(`[EventListener] Nút 'Sửa' cho tin tức ID ${newsId} được nhấp.`); // CONSOLE LOG ĐÃ THÊM
            try {
                const response = await fetch(`${NEWS_API_URL}${newsId}/`);
                if (!response.ok) throw new Error('Không thể tải chi tiết tin tức');
                const news = await response.json();
                populateFormForEdit(news);
            } catch (error) {
                console.error('Lỗi khi tải tin tức để sửa:', error);
                showMessage('Không thể tải chi tiết tin tức để sửa.', 'error');
            }
        };
    });

    document.querySelectorAll('.delete-btn').forEach(button => {
        button.onclick = async (e) => {
            const newsId = e.target.dataset.id;
            console.log(`[EventListener] Nút 'Xóa' cho tin tức ID ${newsId} được nhấp.`); // CONSOLE LOG ĐÃ THÊM
            if (!confirm('Bạn có chắc chắn muốn xóa tin tức này?')) {
                console.log("[EventListener] Xóa tin tức đã bị hủy."); // CONSOLE LOG ĐÃ THÊM
                return;
            }
            
            try {
                const response = await fetch(`${NEWS_API_URL}${newsId}/`, {
                    method: 'DELETE',
                    headers: {
                       'Authorization':  `Token ${authToken}`
                    }
                });
                if (!response.ok) throw new Error('Không thể xóa tin tức');
                showMessage('Tin tức đã được xóa thành công!', 'success');
                fetchNews(currentPage);
                console.log(`[EventListener] Tin tức ID ${newsId} đã được xóa thành công.`); // CONSOLE LOG ĐÃ THÊM
            } catch (error) {
                console.error('Lỗi khi xóa tin tức:', error);
                showMessage('Không thể xóa tin tức.', 'error');
            }
        };
    });
}

// --- Image Upload Logic (Frontend Direct Cloudinary Upload) ---

// Handle file selection
albumImagesInput.addEventListener('change', (event) => {
    console.log("[EventListener] Tệp ảnh đã được chọn."); // CONSOLE LOG ĐÃ THÊM
    filesToUpload = Array.from(event.target.files);
    displayImagePreviews();
});

// Handle drag and drop
imageUploadArea.addEventListener('dragover', (event) => {
    event.preventDefault();
    imageUploadArea.style.backgroundColor = '#e0f7fa'; // Highlight on drag over
});

imageUploadArea.addEventListener('dragleave', (event) => {
    event.preventDefault();
    imageUploadArea.style.backgroundColor = '#f9f9f9'; // Reset on drag leave
});

imageUploadArea.addEventListener('drop', (event) => {
    event.preventDefault();
    imageUploadArea.style.backgroundColor = '#f9f9f9'; // Reset on drop
    console.log("[EventListener] Ảnh đã được thả vào vùng tải lên."); // CONSOLE LOG ĐÃ THÊM
    filesToUpload = Array.from(event.dataTransfer.files).filter(file => file.type.startsWith('image/'));
    displayImagePreviews();
});


function displayImagePreviews() {
    console.log("[displayImagePreviews] Hiển thị các bản xem trước ảnh. Số lượng tệp đã chọn:", filesToUpload.length); // CONSOLE LOG ĐÃ THÊM
    imagePreviewContainer.innerHTML = ''; // Xóa các bản xem trước hiện có
    uploadedImageUrls = []; // Đặt lại các URL đã tải lên khi chọn tệp mới
    if (filesToUpload.length > 0) {
        uploadImagesBtn.classList.remove('hidden'); // Hiện nút upload
        filesToUpload.forEach((file, index) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                const previewItem = document.createElement('div');
                previewItem.className = 'image-preview-item';
                previewItem.innerHTML = `
                    <img src="${e.target.result}" alt="Preview">
                    <button class="remove-image-btn" data-index="${index}">&times;</button>
                `;
                imagePreviewContainer.appendChild(previewItem);
            };
            reader.readAsDataURL(file);
        });
    } else {
        uploadImagesBtn.classList.add('hidden'); // Ẩn nút upload nếu không có tệp nào
    }
}

// Remove image from preview
imagePreviewContainer.addEventListener('click', (event) => {
    if (event.target.classList.contains('remove-image-btn')) {
        const indexToRemove = parseInt(event.target.dataset.index);
        console.log(`[EventListener] Nút 'Xóa ảnh' cho ảnh index ${indexToRemove} được nhấp.`); // CONSOLE LOG ĐÃ THÊM
        filesToUpload.splice(indexToRemove, 1); // Xóa khỏi mảng
        displayImagePreviews(); // Hiển thị lại các bản xem trước
    }
});

uploadImagesBtn.addEventListener('click', async () => {
    console.log("[EventListener] Nút 'Tải ảnh lên Cloudinary' được nhấp."); // CONSOLE LOG ĐÃ THÊM
    if (filesToUpload.length === 0) {
        showMessage('Vui lòng chọn ảnh để tải lên.', 'error');
        console.warn("[uploadImagesBtn] Không có ảnh để tải lên."); // CONSOLE LOG ĐÃ THÊM
        return;
    }

    showMessage('Đang tải ảnh lên Cloudinary...', 'info');
    uploadImagesBtn.disabled = true; // Tắt nút trong khi tải lên
    uploadedImageUrls = []; // Xóa các URL cũ

    try {
        for (const file of filesToUpload) {
            console.log(`[Cloudinary Upload] Đang tải lên tệp: ${file.name}`); // CONSOLE LOG ĐÃ THÊM
            const formData = new FormData();
            formData.append('file', file);
            formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
            // formData.append('folder', 'your_folder_name'); // Tùy chọn: Thêm folder nếu bạn muốn tổ chức ảnh trên Cloudinary

            const cloudinaryResponse = await axios.post(
                `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
                formData
            );

            if (cloudinaryResponse.data && cloudinaryResponse.data.secure_url) {
                const fullUrl = cloudinaryResponse.data.secure_url;
                
                
                uploadedImageUrls.push({
                    image_file: fullUrl, // <-- Trở lại URL đầy đủ
                    title: file.name
                });
                console.log(`[Cloudinary Upload] Tải lên thành công tệp ${file.name}: ${fullUrl}`); // Cập nhật console.log để hiển thị cả 2
            } else {
                throw new Error(`Upload ảnh ${file.name} lên Cloudinary thất bại.`);
            }
        }
        showMessage('Tất cả ảnh đã được tải lên Cloudinary thành công. Sẵn sàng tạo album!', 'success');
        uploadImagesBtn.textContent = 'Đã tải lên!';
        console.log("[Cloudinary Upload] Tất cả ảnh đã tải lên Cloudinary thành công. uploadedImageUrls:", uploadedImageUrls); // CONSOLE LOG ĐÃ THÊM
    } catch (error) {
        console.error('Lỗi khi tải ảnh lên Cloudinary:', error);
        showMessage(`Lỗi khi tải ảnh lên Cloudinary: ${error.message}`, 'error');
        uploadImagesBtn.disabled = false; // Bật lại nút khi có lỗi
    }
});

// --- Initial Load ---
document.addEventListener('DOMContentLoaded', () => {
    console.log("[DOMContentLoaded] DOM đã tải. Bắt đầu tải dữ liệu ban đầu."); // CONSOLE LOG ĐÃ THÊM
    fetchTags();
    fetchNews();
});
const CLOUDINARY_CLOUD_NAME = 'dftarzzfw'; // Thay thế bằng Cloud Name của bạn
const CLOUDINARY_UPLOAD_PRESET = 'SGGDCollege'; // Thay thế bằng Upload Preset của bạn

// Kiểm tra cấu hình Cloudinary ngay từ đầu
if (!CLOUDINARY_CLOUD_NAME || CLOUDINARY_CLOUD_NAME === 'your_cloudinary_cloud_name' || !CLOUDINARY_UPLOAD_PRESET || CLOUDINARY_UPLOAD_PRESET === 'your_cloudinary_upload_preset') {
    alert("Lỗi cấu hình Cloudinary: Vui lòng cập nhật CLOUDINARY_CLOUD_NAME và CLOUDINARY_UPLOAD_PRESET trong manage_news.js!");
}

// --- API Endpoints ---
const BASE_URL = 'https://saigongiadinh.pythonanywhere.com';
const NEWS_API_URL = `${BASE_URL}/news/`;
const ALBUMS_API_URL = `${BASE_URL}/albums/`;
const IMAGES_API_URL = `${BASE_URL}/images/`; // Endpoint để tạo Image model trong DB
const TYPE_NEWS_API_URL = `${BASE_URL}/type-news/`; // Endpoint để lấy danh sách loại tin tức

// --- DOM Elements ---
const newsForm = document.getElementById('newsForm');
const addNewsButton = document.getElementById('addNewsButton');
const cancelFormBtn = document.getElementById('cancelFormBtn');
const submitBtn = document.getElementById('submitBtn');
const newsIdInput = document.getElementById('newsId');
const titleInput = document.getElementById('title');
const shortDescriptionInput = document.getElementById('short_description');
const link = document.getElementById('link'); // Đây là DOM element link, giữ nguyên
const linkFieldContainer = document.getElementById('linkFieldContainer'); // Thêm tham chiếu đến container của trường link
const contentInput = document.getElementById('content_textarea');
const typeNewsSelect = document.getElementById('type_news');
const activeCheckbox = document.getElementById('active');
const messageDiv = document.getElementById('message');

// Các nút radio cho loại tin tức
const newsTypeInternalRadio = document.getElementById('newsTypeInternal');
const newsTypeExternalRadio = document.getElementById('newsTypeExternal');


// SỬ DỤNG CHỈ MỘT VÙNG HIỂN THỊ TIN TỨC CHO CẢ "TẤT CẢ" VÀ "LỌC THEO THẺ"
const newsListDisplayDiv = document.getElementById('news-list-by-tag'); // Sử dụng vùng này làm vùng hiển thị chính
const paginationDisplayDiv = document.getElementById('pagination-by-tag'); // Sử dụng vùng này làm phân trang chính

const featuredImageUploadInput = document.getElementById('featuredImageUpload');
const featuredImagePreview = document.getElementById('featuredImagePreview');
const featuredImageUrlHiddenInput = document.getElementById('featured_image_url_hidden');

const albumImagesInput = document.getElementById('albumImagesInput');
const imagePreviewContainer = document.getElementById('imagePreviewContainer');
const uploadImagesBtn = document.getElementById('uploadImagesBtn');
const imageUploadArea = document.getElementById('imageUploadArea');


// --- Global Variables ---
let availableNewsTypes = []; // Lưu trữ các loại tin tức từ API
let currentPage = 1; // Trang hiện tại cho danh sách tin tức hiển thị (dù là "Tất cả" hay "Theo thẻ")

const ITEMS_PER_PAGE = 5;
let filesToUpload = []; // Array to store files selected by the user for new album images
let uploadedAlbumImageUrls = []; // Array to store Cloudinary URLs for NEW album images (will be used to create new Image objects)
let featuredImageFile = null; // Variable to store the selected featured image file for NEW upload
let currentNewsAlbumData = null; // Stores album data if editing existing news with an album (includes existing image objects)


// --- Utility Functions ---

function showMessage(msg, type) {
    messageDiv.textContent = msg;
    messageDiv.className = `message ${type}`;
    messageDiv.style.display = 'block';

    setTimeout(() => {
        messageDiv.style.display = 'none';
    }, 5000);
}

function displayFeaturedImagePreview(file, imageUrl = null) {
    if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            featuredImagePreview.src = e.target.result;
            featuredImagePreview.style.display = 'block';
        };
        reader.readAsDataURL(file);
    } else if (imageUrl) {
        featuredImagePreview.src = imageUrl;
        featuredImagePreview.style.display = 'block';
    } else {
        featuredImagePreview.src = '';
        featuredImagePreview.style.display = 'none';
        featuredImageUrlHiddenInput.value = ''; // Clear hidden input if no file or URL
    }
}

function getAuthToken() {
    const token = localStorage.getItem('adminAuthToken');
    if (!token) {
        console.warn("Không tìm thấy token xác thực. Vui lòng đăng nhập.");
        // Chuyển hướng về trang đăng nhập nếu không có token
        // window.location.href = 'login.html';
    }
    return token;
}
const authToken = getAuthToken(); // Lấy token ngay khi script được tải

// --- Fetch Data Functions ---

// Populate News Types Select (từ API)
async function populateNewsTypesSelect(selectedTypeKey = null) {
    try {
        const response = await fetch(TYPE_NEWS_API_URL);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();

        let typesToProcess = [];
        if (Array.isArray(data)) {
            typesToProcess = data;
        } else if (data && Array.isArray(data.results)) {
            typesToProcess = data.results;
        } else {
            console.warn("Type News API did not return expected array format (direct array or .results array):", data);
            showMessage('Không thể tải danh sách loại tin tức: Định dạng dữ liệu không hợp lệ.', 'error');
            return;
        }

        availableNewsTypes = typesToProcess; // Lưu trữ để sử dụng sau này
        typeNewsSelect.innerHTML = ''; // Clear existing options

        // Thêm option mặc định
        const defaultOption = document.createElement('option');
        defaultOption.value = '';
        defaultOption.textContent = '-- Chọn loại tin tức --';
        typeNewsSelect.appendChild(defaultOption);

        availableNewsTypes.forEach(type => {
            const option = document.createElement('option');
            option.value = type.key; // Giả sử API trả về 'key' và 'name'
            option.textContent = type.name;
            if (selectedTypeKey === type.key) {
                option.selected = true;
            }
            typeNewsSelect.appendChild(option);
        });
    } catch (error) {
        console.error('Lỗi khi tải loại tin tức:', error);
        showMessage('Không thể tải danh sách loại tin tức. Vui lòng kiểm tra kết nối hoặc API.', 'error');
    }
}

// Hàm tải TẤT CẢ tin tức
async function fetchAllNews(page = 1) {
    try {
        const response = await fetch(`${NEWS_API_URL}?page=${page}&page_size=${ITEMS_PER_PAGE}`);
        if (!response.ok) throw new Error('Không thể tải tin tức');
        const data = await response.json();

        displayNews(data.results, newsListDisplayDiv); // Hiển thị vào newsListDisplayDiv
        setupPagination(data.count, page, paginationDisplayDiv, fetchAllNews); // Phân trang cho tất cả tin tức
        currentPage = page; // Cập nhật trang hiện tại
    } catch (error) {
        console.error('Lỗi khi tải tất cả tin tức:', error);
        newsListDisplayDiv.innerHTML = '<p style="text-align: center; color: red;">Không thể tải tin tức.</p>';
        showMessage('Không thể tải tất cả tin tức.', 'error');
    }
}

// --- Display Functions ---

function displayNews(newsItems, listElement) {
    listElement.innerHTML = '';
    if (newsItems.length === 0) {
        listElement.innerHTML = '<p style="text-align: center;">Chưa có tin tức nào.</p>';
        return;
    }
    newsItems.forEach(news => {
        const newsItemDiv = document.createElement('div');
        newsItemDiv.className = 'news-item-by-tag'; // hoặc 'news-item' nếu bạn muốn kiểu dáng chung

        const formattedDate = new Date(news.published_date || news.created_at).toLocaleDateString('vi-VN', {
            day: '2-digit', month: '2-digit', year: 'numeric'
        });

        const fullFeaturedImageUrl = news.featured_image ?
                                     (news.featured_image.startsWith('http') ? news.featured_image : `https://res.cloudinary.com/${CLOUDINARY_CLOUD_NAME}/image/upload/${news.featured_image}`)
                                     : 'https://via.placeholder.com/150x100?text=No+Image'; // Kích thước có thể thay đổi

        // Lấy tên hiển thị cho loại tin tức từ availableNewsTypes
        const displayType = availableNewsTypes.find(choice => choice.key === news.type)?.name || news.type;

       newsItemDiv.innerHTML = `
            <img src="${fullFeaturedImageUrl}" alt="Ảnh bìa" class="image">
            <span>
                <strong>${news.title}</strong>
                <span class="news-meta">
                    ID: ${news.id} | Lượt xem: ${news.views_count || 0} | Ngày đăng: ${formattedDate}<br>
                    Loại: <strong>${displayType}</strong> | Trạng thái: ${news.active ? 'Đang hoạt động' : 'Đã ẩn'}
                </span>
            </span>
            <div>
                <button class="edit-btn" data-id="${news.id}"><i class="fa-solid fa-pen"></i>&nbsp;Sửa</button>
                <button class="delete-btn" data-id="${news.id}"><i class="fa-solid fa-trash"></i>&nbsp;Xóa</button>
            </div>
        `;
        listElement.appendChild(newsItemDiv);
    });
    // Gán lại event listeners cho các nút Sửa/Xóa sau khi render lại danh sách
    addNewsEventListeners();
}


function setupPagination(totalItems, page, paginationElement, fetchFunction) {
    paginationElement.innerHTML = '';
    const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);

    if (totalPages <= 1) return;

    const createPageLink = (pageNum, text, isDisabled = false, isActive = false) => {
        const link = document.createElement('a');
        link.href = '#';
        link.textContent = text;
        link.classList.add('page-link');
        if (isDisabled) link.classList.add('disabled');
        if (isActive) link.classList.add('active');
        link.addEventListener('click', (e) => {
            e.preventDefault();
            if (!isDisabled && !isActive) {
                fetchFunction(pageNum);
            }
        });
        return link;
    };

    // Previous button
    paginationElement.appendChild(createPageLink(page - 1, 'Trước', page === 1));

    // Page numbers
    let startPage = Math.max(1, page - 2);
    let endPage = Math.min(totalPages, page + 2);

    if (endPage - startPage < 4) {
        if (startPage === 1) {
            endPage = Math.min(totalPages, startPage + 4);
        } else if (endPage === totalPages) {
            startPage = Math.max(1, endPage - 4);
        }
    }

    if (startPage > 1) {
        paginationElement.appendChild(createPageLink(1, 1));
        if (startPage > 2) {
            const ellipsis = document.createElement('span');
            ellipsis.textContent = '...';
            paginationElement.appendChild(ellipsis);
        }
    }

    for (let i = startPage; i <= endPage; i++) {
        paginationElement.appendChild(createPageLink(i, i, false, i === page));
    }

    if (endPage < totalPages) {
        if (endPage < totalPages - 1) {
            const ellipsis = document.createElement('span');
            ellipsis.textContent = '...';
            paginationElement.appendChild(ellipsis);
        }
        paginationElement.appendChild(createPageLink(totalPages, totalPages));
    }

    // Next button
    paginationElement.appendChild(createPageLink(page + 1, 'Sau', page === totalPages));
}


async function uploadImageToCloudinary(file) {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET); // Sử dụng upload preset
    formData.append('folder', 'tintuc'); // <--- THÊM DÒNG NÀY ĐỂ CHỈ ĐỊNH THƯ MỤC

    try {
        const cloudinaryResponse = await axios.post(
            `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
            formData
        );

        if (cloudinaryResponse.data && cloudinaryResponse.data.secure_url) {
            const publicId = cloudinaryResponse.data.public_id;
            const fullUrl = cloudinaryResponse.data.secure_url;

            return { public_id: publicId, full_url: fullUrl };
        } else {
            throw new Error(`Upload ảnh ${file.name} lên Cloudinary thất bại: Không có secure_url.`);
        }
    } catch (error) {
        console.error('Lỗi khi tải ảnh lên Cloudinary:', error.response ? error.response.data : error.message);
        throw error;
    }
}

function resetForm() {
    newsForm.reset();
    newsIdInput.value = '';
    submitBtn.textContent = 'Tạo Tin tức';
    newsForm.classList.add('hidden'); // Ẩn form khi reset

    // Clear album image upload related fields
    filesToUpload = [];
    uploadedAlbumImageUrls = []; // Đặt lại cho album
    imagePreviewContainer.innerHTML = ''; // Xóa các ảnh xem trước trong album
    uploadImagesBtn.classList.add('hidden'); // Ẩn nút tải lên album
    uploadImagesBtn.textContent = 'Tải ảnh đã chọn lên Cloudinary';
    uploadImagesBtn.disabled = false;

    // Clear featured image related fields
    featuredImageFile = null;
    displayFeaturedImagePreview(null); // Clear featured image preview
    featuredImageUploadInput.value = ''; // Reset file input
    featuredImageUrlHiddenInput.value = ''; // Xóa URL ảnh bìa đã lưu

    // Reset select fields
    populateNewsTypesSelect(); // Gọi lại để reset option mặc định
    
    currentNewsAlbumData = null; // Đảm bảo reset album data khi reset form
    showMessage('', ''); // Clear any previous messages

    // Đặt lại toggle và ẩn trường link mặc định khi reset form
    newsTypeInternalRadio.checked = true;
    toggleLinkFieldVisibility();
}

// Hàm mới để điều khiển hiển thị trường link
function toggleLinkFieldVisibility() {
    if (newsTypeInternalRadio.checked) {
        linkFieldContainer.classList.add('hidden');
        link.removeAttribute('required'); // Xóa thuộc tính required
        link.value = ''; // Xóa giá trị khi ẩn
    } else {
        linkFieldContainer.classList.remove('hidden');
        link.setAttribute('required', 'required'); // Thêm lại thuộc tính required
    }
}


async function populateFormForEdit(news) {
    newsIdInput.value = news.id;
    titleInput.value = news.title;
    shortDescriptionInput.value = news.short_description;
    contentInput.value = news.content;

    // Đặt trạng thái toggle và giá trị link dựa trên dữ liệu tin tức
    if (news.link) {
        newsTypeExternalRadio.checked = true;
        link.value = news.link;
    } else {
        newsTypeInternalRadio.checked = true;
        link.value = ''; // Đảm bảo link rỗng nếu không có
    }
    toggleLinkFieldVisibility(); // Cập nhật hiển thị trường link

    // Set type select
    await populateNewsTypesSelect(news.type); // Truyền giá trị key để chọn đúng option

    // Handle existing featured image for edit mode
    if (news.featured_image) {
        const imageUrlForPreview = news.featured_image.startsWith('http') ? news.featured_image : `https://res.cloudinary.com/${CLOUDINARY_CLOUD_NAME}/image/upload/${news.featured_image}`;
        displayFeaturedImagePreview(null, imageUrlForPreview);
        featuredImageUrlHiddenInput.value = news.featured_image; // Lưu public_id hoặc full URL vào hidden input
    } else {
        displayFeaturedImagePreview(null);
    }
    featuredImageUploadInput.value = ''; // Xóa giá trị của input file để người dùng có thể chọn ảnh mới
    featuredImageFile = null; // Reset file đã chọn

    activeCheckbox.checked = news.active;

    // Handle Album Images
    if (news.album_gallery && news.album_gallery.images) { // Sử dụng news.album_gallery
        currentNewsAlbumData = news.album_gallery; // Lưu trữ dữ liệu album hiện tại
        displayAlbumImagesForEdit(news.album_gallery.images);
    } else {
        currentNewsAlbumData = null;
        imagePreviewContainer.innerHTML = '';
    }

    filesToUpload = []; // Reset filesToUpload cho các ảnh mới
    uploadedAlbumImageUrls = []; // Reset uploadedAlbumImageUrls

    submitBtn.textContent = 'Cập nhật Tin tức';
    newsForm.classList.remove('hidden'); // Hiển thị form khi chỉnh sửa
    window.scrollTo({ top: 0, behavior: 'smooth' }); // Cuộn lên đầu form
}

function displayAlbumImagesForEdit(images) {
    imagePreviewContainer.innerHTML = ''; // Clear existing previews
    images.forEach(img => {
        const imgWrapper = document.createElement('div');
        imgWrapper.className = 'image-preview-wrapper';
        imgWrapper.dataset.imageId = img.id; // Lưu ID của ảnh để dễ dàng xóa
        imgWrapper.dataset.imageUrl = img.image_url; // Lưu URL ảnh

        const imageElement = document.createElement('img');
        imageElement.src = img.image_url;
        imageElement.alt = "Album Image";
        imageElement.className = "image-preview";

        const removeButton = document.createElement('button');
        removeButton.className = 'remove-image-btn';
        removeButton.innerHTML = '&times;'; // Dấu 'x'
        removeButton.title = 'Xóa ảnh này khỏi album';
        removeButton.addEventListener('click', () => removeAlbumImage(img.id, imgWrapper));

        imgWrapper.appendChild(imageElement);
        imgWrapper.appendChild(removeButton);
        imagePreviewContainer.appendChild(imgWrapper);
    });
}

async function removeAlbumImage(imageId, imageWrapperElement) {
    if (!confirm('Bạn có chắc chắn muốn xóa ảnh này khỏi album?')) {
        return;
    }
    try {
        const response = await fetch(`${IMAGES_API_URL}${imageId}/`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Token ${authToken}`,
            },
        });

        if (!response.ok) {
            if (response.status === 404) {
                throw new Error('Ảnh không tồn tại trên máy chủ.');
            } else {
                const errorData = await response.json();
                throw new Error(`Lỗi khi xóa ảnh: ${JSON.stringify(errorData)}`);
            }
        }

        // Xóa ảnh khỏi DOM
        imageWrapperElement.remove();

        // Xóa ảnh khỏi currentNewsAlbumData nếu có (để đảm bảo đồng bộ khi cập nhật tin tức)
        if (currentNewsAlbumData && currentNewsAlbumData.images) {
            currentNewsAlbumData.images = currentNewsAlbumData.images.filter(img => img.id !== imageId);
        }

        showMessage('Ảnh đã được xóa khỏi album.', 'success');
    } catch (error) {
        console.error('Lỗi khi xóa ảnh album:', error);
        showMessage(`Không thể xóa ảnh: ${error.message}`, 'error');
    }
}


function handleAlbumImagesChange(event) {
    filesToUpload = Array.from(event.target.files);
    previewAlbumImages(filesToUpload);
    if (filesToUpload.length > 0) {
        uploadImagesBtn.classList.remove('hidden');
    } else {
        uploadImagesBtn.classList.add('hidden');
    }
}

function previewAlbumImages(files) {
    // Xóa chỉ các preview của ảnh MỚI, không phải ảnh đã có từ DB
    const newImagePreviews = imagePreviewContainer.querySelectorAll('.new-image-preview-wrapper');
    newImagePreviews.forEach(el => el.remove());

    files.forEach(file => {
        const reader = new FileReader();
        reader.onload = (e) => {
            const imgWrapper = document.createElement('div');
            imgWrapper.className = 'image-preview-wrapper new-image-preview-wrapper'; // Thêm class để dễ phân biệt
            const imageElement = document.createElement('img');
            imageElement.src = e.target.result;
            imageElement.alt = file.name;
            imageElement.className = "image-preview";
            imgWrapper.appendChild(imageElement);
            imagePreviewContainer.appendChild(imgWrapper);
        };
        reader.readAsDataURL(file);
    });
}

async function uploadSelectedAlbumImages() {
    if (filesToUpload.length === 0) {
        showMessage('Không có ảnh nào để tải lên.', 'warning');
        return;
    }

    uploadImagesBtn.disabled = true;
    uploadImagesBtn.textContent = 'Đang tải lên...';
    showMessage('Đang tải lên các ảnh album mới...', 'info');

    try {
        const uploadedUrls = [];
        for (const file of filesToUpload) {
            const result = await uploadImageToCloudinary(file);
            uploadedUrls.push(result); // result là {public_id, full_url}
        }
        uploadedAlbumImageUrls = uploadedUrls; // Lưu trữ các URL đã tải lên

        showMessage('Tất cả ảnh album đã được tải lên Cloudinary.', 'success');
        uploadImagesBtn.textContent = 'Đã tải lên!';
    } catch (error) {
        console.error('Lỗi khi tải lên ảnh album:', error);
        showMessage('Lỗi khi tải lên ảnh album. Vui lòng thử lại.', 'error');
        uploadImagesBtn.textContent = 'Tải ảnh đã chọn lên Cloudinary (Lỗi)';
        uploadedAlbumImageUrls = []; // Xóa các URL nếu có lỗi
    } finally {
        uploadImagesBtn.disabled = false;
        // Xóa các preview của ảnh mới sau khi tải lên xong (để tránh trùng lặp khi edit và lưu)
        const newImagePreviews = imagePreviewContainer.querySelectorAll('.new-image-preview-wrapper');
        newImagePreviews.forEach(el => el.remove());
    }
}


async function handleSubmitNews(event) {
    event.preventDefault();
    showMessage('Đang xử lý...', 'info');

    const newsId = newsIdInput.value;
    const isEditing = !!newsId; // True if newsId exists

    const title = titleInput.value.trim();
    const short_description = shortDescriptionInput.value.trim();
    let newsLink = null; // Mặc định là null
    const content = contentInput.value.trim();
    const type_news = typeNewsSelect.value;
    const active = activeCheckbox.checked;

    // Lấy giá trị link dựa trên lựa chọn toggle
    if (newsTypeExternalRadio.checked) {
        newsLink = link.value.trim();
    }
    // Nếu newsTypeInternalRadio.checked, newsLink sẽ giữ nguyên là null

    // Validation
    // Kiểm tra link chỉ khi nó là tin tức ngoài
    if (!title || !short_description || !content || !type_news || (newsTypeExternalRadio.checked && !newsLink)) {
        showMessage('Vui lòng điền đầy đủ các trường Tiêu đề, Mô tả ngắn, Nội dung, Phân loại tin tức và Link bài viết (nếu là tin tức ngoài).', 'error');
        return;
    }

    let featured_image_url = featuredImageUrlHiddenInput.value; // URL ảnh bìa đã có (khi chỉnh sửa) hoặc đã được tải lên trước đó

    try {
        // 1. Tải lên ảnh bìa nếu có file mới được chọn
        if (featuredImageFile) {
            showMessage('Đang tải lên ảnh bìa...', 'info');
            const featuredImageResult = await uploadImageToCloudinary(featuredImageFile);
            featured_image_url = featuredImageResult.full_url; // Gán URL đầy đủ từ Cloudinary
            console.log("Ảnh bìa đã tải lên:", featured_image_url);
        } else if (isEditing && !featuredImageUrlHiddenInput.value && featuredImagePreview.src !== 'https://via.placeholder.com/150x100?text=No+Image') {
             // Nếu đang chỉnh sửa và không có ảnh bìa cũ cũng như không có file mới được chọn
             // Và ảnh preview không phải ảnh placeholder (tức là người dùng đã xóa ảnh bìa)
             featured_image_url = null;
        }

        // 2. Tải lên các ảnh album MỚI nếu có
        if (filesToUpload.length > 0 && uploadedAlbumImageUrls.length === 0) {
            showMessage('Đang tải lên các ảnh album mới...', 'info');
            await uploadSelectedAlbumImages();
        }

        // 3. Chuẩn bị dữ liệu để gửi lên API
        const newsData = {
            title: title,
            short_description: short_description,
            link: newsLink, // newsLink sẽ là URL hoặc null
            content: content,
            type: type_news,
            active: active,
            featured_image: featured_image_url,
        };

        // Nếu đang chỉnh sửa và có dữ liệu album hiện tại, thêm ID album
        if (isEditing && currentNewsAlbumData) {
            newsData.album_id = currentNewsAlbumData.id;
            newsData.existing_album_image_ids = currentNewsAlbumData.images.map(img => img.id);
        }

        // Thêm các URL ảnh album MỚI đã tải lên
        if (uploadedAlbumImageUrls.length > 0) {
            if (!newsData.album_gallery) {
                try {
                    const albumResponse = await axios.post(ALBUMS_API_URL, { name: `${title} Album` }, {
                        headers: { 'Authorization': `Token ${authToken}` }
                    });
                    newsData.album_gallery = albumResponse.data.id;
                } catch (albumError) {
                    console.error('Lỗi khi tạo Album mới:', albumError.response ? albumError.response.data : albumError.message);
                    showMessage('Lỗi khi tạo Album mới. Vui lòng thử lại.', 'error');
                    return; // Dừng xử lý nếu không tạo được album
                }
            }

            const imageCreationPromises = uploadedAlbumImageUrls.map(imgData => {
                return axios.post(IMAGES_API_URL, {
                    image_url: imgData.full_url,
                    album: newsData.album_gallery,
                    public_id: imgData.public_id
                }, {
                    headers: { 'Authorization': `Token ${authToken}` }
                });
            });
            await Promise.all(imageCreationPromises);
        }


        // --- CONSOLE LOG DỮ LIỆU TRƯỚC KHI GỬI API ---
        console.log("Dữ liệu tin tức gửi đi:", newsData);
        // ---------------------------------------------

        let response;
        if (isEditing) {
            // Cập nhật tin tức hiện có
            response = await axios.put(`${NEWS_API_URL}${newsId}/`, newsData, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Token ${authToken}`,
                },
            });
            showMessage('Tin tức đã được cập nhật thành công!', 'success');
        } else {
            // Tạo tin tức mới
            response = await axios.post(NEWS_API_URL, newsData, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Token ${authToken}`,
                },
            });
            showMessage('Tin tức đã được tạo thành công!', 'success');
        }

        resetForm(); // Đặt lại biểu mẫu sau khi thành công
        newsForm.classList.add('hidden'); // Ẩn form/modal sau khi thao tác thành công
        // Sau khi submit thành công, chúng ta muốn quay lại hiển thị "Tất cả tin tức"
        fetchAllNews(1); // Tải lại tất cả tin tức và đặt về trang 1

    } catch (error) {
        console.error('Lỗi khi lưu tin tức:', error.response ? error.response.data : error.message);
        showMessage(`Lỗi khi lưu tin tức: ${error.response && error.response.data ? JSON.stringify(error.response.data) : error.message}`, 'error');
    }
}


async function handleEditNews(id) {
    try {
        const response = await fetch(`${NEWS_API_URL}${id}/`);
        if (!response.ok) throw new Error('Không thể tải tin tức để chỉnh sửa.');
        const news = await response.json();
        populateFormForEdit(news);
        addNewsButton.scrollIntoView({ behavior: 'smooth' }); // Cuộn đến nút thêm tin tức
    } catch (error) {
        console.error('Lỗi khi lấy tin tức để chỉnh sửa:', error);
        showMessage('Không thể tải tin tức để chỉnh sửa.', 'error');
    }
}

async function handleDeleteNews(id) {
    if (!confirm('Bạn có chắc chắn muốn xóa tin tức này không?')) {
        return;
    }
    try {
        const response = await fetch(`${NEWS_API_URL}${id}/`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Token ${authToken}`,
            },
        });

        if (!response.ok) {
            if (response.status === 404) {
                throw new Error('Ảnh không tồn tại trên máy chủ.');
            } else {
                const errorData = await response.json();
                throw new Error(`Lỗi khi xóa tin tức: ${JSON.stringify(errorData)}`);
            }
        }

        showMessage('Tin tức đã được xóa thành công.', 'success');

        // Sau khi xóa, tải lại danh sách
        fetchAllNews(currentPage); // Tải lại tin tức ở trang hiện tại
    } catch (error) {
        console.error('Lỗi khi xóa tin tức:', error);
        showMessage(`Không thể xóa tin tức: ${error.message}`, 'error');
    }
}

// --- Event Listeners ---

addNewsButton.addEventListener('click', () => {
    resetForm(); // Reset form trước khi hiển thị để đảm bảo trạng thái sạch
    newsForm.classList.remove('hidden'); // Hiển thị form
    titleInput.focus();
    window.scrollTo({ top: 0, behavior: 'smooth' }); // Cuộn lên đầu form
});

cancelFormBtn.addEventListener('click', (event) => {
    event.preventDefault();
    resetForm(); // Reset form và ẩn nó
});

newsForm.addEventListener('submit', handleSubmitNews);

featuredImageUploadInput.addEventListener('change', (event) => {
    featuredImageFile = event.target.files[0];
    displayFeaturedImagePreview(featuredImageFile);
});

albumImagesInput.addEventListener('change', handleAlbumImagesChange);

uploadImagesBtn.addEventListener('click', uploadSelectedAlbumImages);

// Event listeners cho các nút radio toggle
newsTypeInternalRadio.addEventListener('change', toggleLinkFieldVisibility);
newsTypeExternalRadio.addEventListener('change', toggleLinkFieldVisibility);


function addNewsEventListeners() {
    document.querySelectorAll('.edit-btn').forEach(button => {
        button.onclick = () => handleEditNews(button.dataset.id);
    });
    document.querySelectorAll('.delete-btn').forEach(button => {
        button.onclick = () => handleDeleteNews(button.dataset.id);
    });
}

// --- Initialization ---

document.addEventListener('DOMContentLoaded', async () => {
    await populateNewsTypesSelect();
    fetchAllNews(1); // Tải tất cả tin tức khi trang tải, bắt đầu từ trang 1
    addNewsEventListeners(); // Gán event listeners cho các nút Sửa/Xóa

    // Gọi hàm này để thiết lập trạng thái ban đầu của trường link khi tải trang
    toggleLinkFieldVisibility();
});
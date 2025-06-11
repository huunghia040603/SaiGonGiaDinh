// const CLOUDINARY_CLOUD_NAME = 'dftarzzfw'; // Thay thế bằng Cloud Name của bạn
// const CLOUDINARY_UPLOAD_PRESET = 'SGGDCollege'; // Thay thế bằng Upload Preset của bạn

// // Kiểm tra cấu hình Cloudinary ngay từ đầu
// if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_UPLOAD_PRESET || CLOUDINARY_CLOUD_NAME === 'your_cloudinary_cloud_name') {
//     alert("Lỗi cấu hình Cloudinary: Vui lòng cập nhật CLOUDINARY_CLOUD_NAME và CLOUDINARY_UPLOAD_PRESET trong manage_news.js!");
// }

// // --- API Endpoints ---
// const BASE_URL = 'https://saigongiadinh.pythonanywhere.com';
// const NEWS_API_URL = `${BASE_URL}/news/`;
// const TAGS_API_URL = `${BASE_URL}/TagView/`;
// const ALBUMS_API_URL = `${BASE_URL}/albums/`;
// const IMAGES_API_URL = `${BASE_URL}/images/`; // Endpoint để tạo Image model trong DB
// const TYPE_NEWS_API_URL = `${BASE_URL}/TypeNewsView/`; // Endpoint để lấy danh sách loại tin tức

// // --- DOM Elements ---
// const newsForm = document.getElementById('newsForm');
// const addNewsButton = document.getElementById('addNewsButton');
// const cancelFormBtn = document.getElementById('cancelFormBtn');
// const submitBtn = document.getElementById('submitBtn');
// const newsIdInput = document.getElementById('newsId');
// const titleInput = document.getElementById('title');
// const shortDescriptionInput = document.getElementById('short_description');
// const contentInput = document.getElementById('content_textarea');
// const typeNewsSelect = document.getElementById('type_news');
// const activeCheckbox = document.getElementById('active');
// const tagsSelect = document.getElementById('tags');
// const messageDiv = document.getElementById('message');
// const newsListAllDiv = document.getElementById('news-list-all');
// const paginationAllDiv = document.getElementById('pagination-all');

// const featuredImageUploadInput = document.getElementById('featuredImageUpload');
// const featuredImagePreview = document.getElementById('featuredImagePreview');
// const featuredImageUrlHiddenInput = document.getElementById('featured_image_url_hidden');

// const albumImagesInput = document.getElementById('albumImagesInput');
// const imagePreviewContainer = document.getElementById('imagePreviewContainer');
// const uploadImagesBtn = document.getElementById('uploadImagesBtn');
// const imageUploadArea = document.getElementById('imageUploadArea');

// // Các phần tử mới cho tính năng lọc theo thẻ
// const tagFiltersDiv = document.getElementById('tag-filters');
// const newsListByTagDiv = document.getElementById('news-list-by-tag');
// const paginationByTagDiv = document.getElementById('pagination-by-tag');


// // --- Global Variables ---
// let availableTags = [];
// let availableNewsTypes = []; // Lưu trữ các loại tin tức từ API
// let currentPageAll = 1; // Trang hiện tại cho "Tất cả Tin tức"
// let currentPageByTag = 1; // Trang hiện tại cho "Tin tức theo Thẻ"
// let currentTagFilter = 'all'; // ID của thẻ đang được chọn để lọc (mặc định 'all' cho tất cả)

// const ITEMS_PER_PAGE = 5;
// let filesToUpload = []; // Array to store files selected by the user for new album images
// let uploadedAlbumImageUrls = []; // Array to store Cloudinary URLs for NEW album images (will be used to create new Image objects)
// let featuredImageFile = null; // Variable to store the selected featured image file for NEW upload
// let currentNewsAlbumData = null; // Stores album data if editing existing news with an album (includes existing image objects)


// // --- Utility Functions ---

// function showMessage(msg, type) {
//     messageDiv.textContent = msg;
//     messageDiv.className = `message ${type}`;
//     messageDiv.style.display = 'block';
//     console.log(`[showMessage] Loại: ${type}, Nội dung: ${msg}`);
//     setTimeout(() => {
//         messageDiv.style.display = 'none';
//     }, 5000);
// }

// function showNewsSection(section) {
//     if (section === 'all') {
//         newsListAllDiv.classList.remove('hidden');
//         paginationAllDiv.classList.remove('hidden');
//         newsListByTagDiv.classList.add('hidden');
//         paginationByTagDiv.classList.add('hidden');
//     } else if (section === 'byTag') {
//         newsListByTagDiv.classList.remove('hidden');
//         paginationByTagDiv.classList.remove('hidden');
//         newsListAllDiv.classList.add('hidden');
//         paginationAllDiv.classList.add('hidden');
//     }
// }

// function displayFeaturedImagePreview(file, imageUrl = null) {
//     console.log("[displayFeaturedImagePreview] Hiển thị bản xem trước ảnh bìa.");
//     if (file) {
//         const reader = new FileReader();
//         reader.onload = (e) => {
//             featuredImagePreview.src = e.target.result;
//             featuredImagePreview.style.display = 'block';
//         };
//         reader.readAsDataURL(file);
//     } else if (imageUrl) {
//         featuredImagePreview.src = imageUrl;
//         featuredImagePreview.style.display = 'block';
//     } else {
//         featuredImagePreview.src = '';
//         featuredImagePreview.style.display = 'none';
//         featuredImageUrlHiddenInput.value = ''; // Clear hidden input if no file
//     }
// }

// function getDisplayTagName(rawName) {
//     // Chuyển đổi tên tag từ ALL_CAPS_WITH_UNDERSCORES sang Title Case với khoảng trắng
//     if (typeof rawName !== 'string') return ''; // Đảm bảo rawName là string
//     return rawName.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, c => c.toUpperCase());
// }

// function getAuthToken() {
//     const token = localStorage.getItem('adminAuthToken');
//     if (!token) {
//         console.warn("Không tìm thấy token xác thực. Vui lòng đăng nhập.");
//         // Chuyển hướng về trang đăng nhập nếu không có token
//         // window.location.href = 'login.html'; 
//     }
//     return token;
// }
// const authToken = getAuthToken();

// // --- Fetch Data Functions ---

// // Populate News Types Select (từ API)
// async function populateNewsTypesSelect(selectedTypeKey = null) {
//     console.log("[populateNewsTypesSelect] Đang tải các loại tin tức...");
//     try {
//         const response = await fetch(TYPE_NEWS_API_URL);
//         if (!response.ok) {
//             throw new Error(`HTTP error! status: ${response.status}`);
//         }
//         const data = await response.json();
//         console.log("[populateNewsTypesSelect] Dữ liệu loại tin tức nhận được:", data);

//         let typesToProcess = [];
//         if (Array.isArray(data)) {
//             typesToProcess = data;
//         } else if (data && Array.isArray(data.results)) {
//             typesToProcess = data.results;
//         } else {
//             console.warn("Type News API did not return expected array format (direct array or .results array):", data);
//             showMessage('Không thể tải danh sách loại tin tức: Định dạng dữ liệu không hợp lệ.', 'error');
//             return;
//         }

//         availableNewsTypes = typesToProcess; // Lưu trữ để sử dụng sau này
//         typeNewsSelect.innerHTML = ''; // Clear existing options
        
//         // Thêm option mặc định
//         const defaultOption = document.createElement('option');
//         defaultOption.value = '';
//         defaultOption.textContent = '-- Chọn loại tin tức --';
//         typeNewsSelect.appendChild(defaultOption);

//         availableNewsTypes.forEach(type => {
//             const option = document.createElement('option');
//             option.value = type.key; // Giả sử API trả về 'key' và 'name'
//             option.textContent = type.name;
//             if (selectedTypeKey === type.key) {
//                 option.selected = true;
//             }
//             typeNewsSelect.appendChild(option);
//         });
//         console.log("[populateNewsTypesSelect] Đã điền các loại tin tức vào select.");
//     } catch (error) {
//         console.error('Lỗi khi tải loại tin tức:', error);
//         showMessage('Không thể tải danh sách loại tin tức. Vui lòng kiểm tra kết nối hoặc API.', 'error');
//     }
// }

// async function fetchTags(selectedTagIds = []) {
//     console.log("[fetchTags] Bắt đầu tải tags...");
//     try {
//         const response = await fetch(TAGS_API_URL);
//         if (!response.ok) {
//             throw new Error(`HTTP error! status: ${response.status}`);
//         }
//         const data = await response.json();
//         console.log("[fetchTags] Dữ liệu tags nhận được:", data);

//         let tagsToProcess = [];
//         if (Array.isArray(data)) {
//             tagsToProcess = data;
//         } else if (data && Array.isArray(data.results)) {
//             tagsToProcess = data.results;
//         } else {
//             console.warn("Tag API did not return expected array format (direct array or .results array):", data);
//             showMessage('Không thể tải danh sách thẻ: Định dạng dữ liệu không hợp lệ.', 'error');
//             return;
//         }

//         availableTags = tagsToProcess;
//         tagsSelect.innerHTML = ''; // Clear existing options
        
//         availableTags.forEach(tag => {
//             const option = document.createElement('option');
//             option.value = tag.id;
//             option.textContent = getDisplayTagName(tag.name);
//             if (selectedTagIds.includes(tag.id)) {
//                 option.selected = true;
//             }
//             tagsSelect.appendChild(option);
//         });
//         tagsSelect.setAttribute('multiple', 'multiple'); // Cho phép chọn nhiều thẻ
//         console.log("[fetchTags] Tags đã được tải và hiển thị thành công.");
//         populateTagFilters(); // Cập nhật bộ lọc tags
//     } catch (error) {
//         console.error('Lỗi khi tải tags:', error);
//         showMessage('Không thể tải danh sách tags. Vui lòng kiểm tra kết nối hoặc API.', 'error');
//     }
// }

// // async function fetchNews(page = 1) {
// //     console.log(`[fetchNews] Bắt đầu tải tất cả tin tức, trang: ${page}`);
// //     try {
// //         const response = await fetch(`${NEWS_API_URL}?page=${page}&page_size=${ITEMS_PER_PAGE}`);
// //         if (!response.ok) throw new Error('Không thể tải tin tức');
// //         const data = await response.json();
// //         console.log("[fetchNews] Dữ liệu tất cả tin tức nhận được:", data);
// //         displayNews(data.results, newsListAllDiv);
// //         setupPagination(data.count, page, paginationAllDiv, fetchNews);
// //         currentPageAll = page; // Cập nhật trang hiện tại cho phần "Tất cả tin tức"
// //         console.log("[fetchNews] Tất cả tin tức và phân trang đã được cập nhật.");
// //     } catch (error) {
// //         console.error('Lỗi khi tải tất cả tin tức:', error);
// //         newsListAllDiv.innerHTML = '<p style="text-align: center; color: red;">Không thể tải tin tức.</p>';
// //         showMessage('Không thể tải tất cả tin tức.', 'error');
// //     }
// // }


// async function fetchNews(page = 1) {
//     console.log(`[fetchNews] Bắt đầu tải tất cả tin tức, trang: ${page}`);
//     try {
//         const response = await fetch(`${NEWS_API_URL}?page=${page}&page_size=${ITEMS_PER_PAGE}`);
//         if (!response.ok) throw new Error('Không thể tải tin tức');
//         const data = await response.json();
//         console.log("[fetchNews] Dữ liệu tất cả tin tức nhận được:", data);
//         displayNews(data.results, newsListAllDiv);
//         setupPagination(data.count, page, paginationAllDiv, fetchNews);
//         currentPageAll = page; // Cập nhật trang hiện tại cho phần "Tất cả tin tức"
//         showNewsSection('all'); // Hiển thị phần "Tất cả Tin tức"
//         console.log("[fetchNews] Tất cả tin tức và phân trang đã được cập nhật.");
//     } catch (error) {
//         console.error('Lỗi khi tải tất cả tin tức:', error);
//         newsListAllDiv.innerHTML = '<p style="text-align: center; color: red;">Không thể tải tin tức.</p>';
//         showMessage('Không thể tải tất cả tin tức.', 'error');
//     }
// }
// // async function fetchNewsByTag(tagId, page = 1) {
// //     console.log(`[fetchNewsByTag] Bắt đầu tải tin tức theo thẻ: ${tagId}, trang: ${page}`);
// //     try {
// //         let url = `${NEWS_API_URL}?page=${page}&page_size=${ITEMS_PER_PAGE}`;
// //         if (tagId !== 'all') {
// //             url += `&tags__id=${tagId}`; // Giả định backend hỗ trợ lọc theo ID của tag
// //         }
// //         const response = await fetch(url);
// //         if (!response.ok) throw new Error('Không thể tải tin tức theo thẻ');
// //         const data = await response.json();
// //         console.log("[fetchNewsByTag] Dữ liệu tin tức theo thẻ nhận được:", data);
// //         displayNewsByTag(data.results, newsListByTagDiv);
// //         setupPagination(data.count, page, paginationByTagDiv, (p) => fetchNewsByTag(tagId, p));
// //         currentPageByTag = page; // Cập nhật trang hiện tại cho phần lọc theo thẻ
// //         console.log("[fetchNewsByTag] Tin tức theo thẻ và phân trang đã được cập nhật.");
// //     } catch (error) {
// //         console.error('Lỗi khi tải tin tức theo thẻ:', error);
// //         newsListByTagDiv.innerHTML = '<p style="text-align: center; color: red;">Không thể tải tin tức theo thẻ.</p>';
// //         showMessage('Không thể tải tin tức theo thẻ.', 'error');
// //     }
// // }

// // --- Display Functions ---


// async function fetchNewsByTag(tagId, page = 1) {
//     console.log(`[fetchNewsByTag] Bắt đầu tải tin tức theo thẻ: ${tagId}, trang: ${page}`); // cite: 1
//     try {
//         let url = `${NEWS_API_URL}?page=${page}&page_size=${ITEMS_PER_PAGE}`;
//         if (tagId !== 'all') {
//             url += `&tag=${tagId}`; // Giả định backend hỗ trợ lọc theo ID của tag
//         }
//         const response = await fetch(url);
//         if (!response.ok) throw new Error('Không thể tải tin tức theo thẻ');
//         const data = await response.json();
//         console.log("[fetchNewsByTag] Dữ liệu tin tức theo thẻ nhận được:", data); // cite: 1
//         displayNews(data.results, newsListByTagDiv); // Sử dụng displayNews chung, nhưng truyền newsListByTagDiv
//         setupPagination(data.count, page, paginationByTagDiv, (p) => fetchNewsByTag(tagId, p));
//         currentPageByTag = page; // Cập nhật trang hiện tại cho phần lọc theo thẻ
//         showNewsSection('byTag'); // Hiển thị phần "Tin tức theo Thẻ"
//         console.log("[fetchNewsByTag] Tin tức theo thẻ và phân trang đã được cập nhật."); // cite: 1
//     } catch (error) {
//         console.error('Lỗi khi tải tin tức theo thẻ:', error);
//         newsListByTagDiv.innerHTML = '<p style="text-align: center; color: red;">Không thể tải tin tức theo thẻ.</p>';
//         showMessage('Không thể tải tin tức theo thẻ.', 'error');
//     }
// }

// function displayNews(newsItems, listElement) {
//     console.log("[displayNews] Hiển thị danh sách tin tức...");
//     listElement.innerHTML = '';
//     if (newsItems.length === 0) {
//         listElement.innerHTML = '<p style="text-align: center;">Chưa có tin tức nào.</p>';
//         console.log("[displayNews] Không có tin tức để hiển thị.");
//         return;
//     }
//     newsItems.forEach(news => {
//         const newsItemDiv = document.createElement('div');
//         newsItemDiv.className = 'news-item';
//         const tagsHtml = news.tags.map(tag => getDisplayTagName(tag.name)).join(', ');

//         const formattedDate = new Date(news.published_date || news.created_at).toLocaleDateString('vi-VN', {
//             day: '2-digit', month: '2-digit', year: 'numeric'
//         });

//         const fullFeaturedImageUrl = news.featured_image ? 
//                                      (news.featured_image.startsWith('http') ? news.featured_image : `https://res.cloudinary.com/${CLOUDINARY_CLOUD_NAME}/image/upload/${news.featured_image}`)
//                                      : 'https://via.placeholder.com/100?text=No+Image';

//         // Lấy tên hiển thị cho loại tin tức từ availableNewsTypes
//         const displayType = availableNewsTypes.find(choice => choice.key === news.type)?.name || news.type;
        
//         newsItemDiv.innerHTML = `
//             <img src="${fullFeaturedImageUrl}" alt="Ảnh bìa" class="image">
//             <span>
//                 <strong>${news.title}</strong>
//                 <span class="news-meta">
//                     ID: ${news.id} | Lượt xem: ${news.views_count || 0} | Ngày đăng: ${formattedDate}
//                     <br>
//                     Loại: <strong>${displayType}</strong> | Trạng thái: ${news.active ? 'Đang hoạt động' : 'Đã ẩn'}
//                     <br>
//                     Thẻ: <span class="tags">${tagsHtml || 'Không có'}</span>
//                 </span>
//             </span>
//             <div>
//                 <button class="edit-btn" data-id="${news.id}">Sửa</button>
//                 <button class="delete-btn" data-id="${news.id}">Xóa</button>
//             </div>
//         `;
//         listElement.appendChild(newsItemDiv);
//     });
//     // Gán lại event listeners cho các nút Sửa/Xóa sau khi render lại danh sách
//     addNewsEventListeners();
//     console.log("[displayNews] Danh sách tin tức đã được hiển thị.");
// }

// function displayNewsByTag(newsItems, listElement) {
//     console.log("[displayNewsByTag] Hiển thị danh sách tin tức theo thẻ...");
//     listElement.innerHTML = '';
//     if (newsItems.length === 0) {
//         listElement.innerHTML = '<p style="text-align: center;">Không có tin tức nào với thẻ này.</p>';
//         console.log("[displayNewsByTag] Không có tin tức theo thẻ để hiển thị.");
//         return;
//     }
//     newsItems.forEach(news => {
//         const newsItemDiv = document.createElement('div');
//         newsItemDiv.className = 'news-item-by-tag'; // Class riêng cho phần lọc theo thẻ
//         const tagsHtml = news.tags.map(tag => getDisplayTagName(tag.name)).join(', ');

//         const formattedDate = new Date(news.published_date || news.created_at).toLocaleDateString('vi-VN', {
//             day: '2-digit', month: '2-digit', year: 'numeric'
//         });

//         const fullFeaturedImageUrl = news.featured_image ? 
//                                      (news.featured_image.startsWith('http') ? news.featured_image : `https://res.cloudinary.com/${CLOUDINARY_CLOUD_NAME}/image/upload/${news.featured_image}`)
//                                      : 'https://via.placeholder.com/150x100?text=No+Image'; // Kích thước khác cho phần này

//         const displayType = availableNewsTypes.find(choice => choice.key === news.type)?.name || news.type;

//         newsItemDiv.innerHTML = `
//             <img src="${fullFeaturedImageUrl}" alt="Ảnh bìa" class="image">
//             <span>
//                 <strong>${news.title}</strong>
//                 <span class="news-meta">
//                     Loại: <strong>${displayType}</strong> | Ngày đăng: ${formattedDate}
//                     <br>
//                     Thẻ: <span class="tags">${tagsHtml || 'Không có'}</span>
//                 </span>
//             </span>
//         `;
//         listElement.appendChild(newsItemDiv);
//     });
//     console.log("[displayNewsByTag] Danh sách tin tức theo thẻ đã được hiển thị.");
// }


// function setupPagination(totalItems, currentPage, paginationElement, fetchFunction) {
//     console.log(`[setupPagination] Thiết lập phân trang: Tổng số mục = ${totalItems}, Trang hiện tại = ${currentPage}`);
//     paginationElement.innerHTML = '';
//     const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);

//     if (totalPages <= 1) return;

//     const createPageLink = (page, text, isDisabled = false, isActive = false) => {
//         const link = document.createElement('a');
//         link.href = '#';
//         link.textContent = text;
//         link.classList.add('page-link');
//         if (isDisabled) link.classList.add('disabled');
//         if (isActive) link.classList.add('active');
//         link.addEventListener('click', (e) => {
//             e.preventDefault();
//             if (!isDisabled && !isActive) {
//                 fetchFunction(page);
//             }
//         });
//         return link;
//     };

//     // Previous button
//     paginationElement.appendChild(createPageLink(currentPage - 1, 'Trước', currentPage === 1));

//     // Page numbers
//     // Hiển thị tối đa 5 nút trang (ví dụ: 1, 2, ..., totalPages)
//     let startPage = Math.max(1, currentPage - 2);
//     let endPage = Math.min(totalPages, currentPage + 2);

//     if (endPage - startPage < 4) { // Nếu ít hơn 5 nút, mở rộng ra
//         if (startPage === 1) {
//             endPage = Math.min(totalPages, startPage + 4);
//         } else if (endPage === totalPages) {
//             startPage = Math.max(1, endPage - 4);
//         }
//     }

//     if (startPage > 1) {
//         paginationElement.appendChild(createPageLink(1, 1));
//         if (startPage > 2) {
//             const ellipsis = document.createElement('span');
//             ellipsis.textContent = '...';
//             paginationElement.appendChild(ellipsis);
//         }
//     }

//     for (let i = startPage; i <= endPage; i++) {
//         paginationElement.appendChild(createPageLink(i, i, false, i === currentPage));
//     }

//     if (endPage < totalPages) {
//         if (endPage < totalPages - 1) {
//             const ellipsis = document.createElement('span');
//             ellipsis.textContent = '...';
//             paginationElement.appendChild(ellipsis);
//         }
//         paginationElement.appendChild(createPageLink(totalPages, totalPages));
//     }

//     // Next button
//     paginationElement.appendChild(createPageLink(currentPage + 1, 'Sau', currentPage === totalPages));
//     console.log("[setupPagination] Phân trang đã được thiết lập.");
// }

// async function uploadImageToCloudinary(file) {
//     console.log(`[Cloudinary Upload] Đang tải lên tệp: ${file.name}`);
//     const formData = new FormData();
//     formData.append('file', file);
//     formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET); // Sử dụng upload preset

//     try {
//         const cloudinaryResponse = await axios.post(
//             `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
//             formData
//         );

//         if (cloudinaryResponse.data && cloudinaryResponse.data.secure_url) {
//             const publicId = cloudinaryResponse.data.public_id; // Lấy public_id
//             const fullUrl = cloudinaryResponse.data.secure_url; // Lấy URL đầy đủ
//             console.log(`[Cloudinary Upload] Tải lên thành công tệp ${file.name}: Public ID: ${publicId}, URL: ${fullUrl}`);
//             return { public_id: publicId, full_url: fullUrl }; // Trả về cả public_id và full_url
//         } else {
//             throw new Error(`Upload ảnh ${file.name} lên Cloudinary thất bại: Không có secure_url.`);
//         }
//     } catch (error) {
//         console.error('Lỗi khi tải ảnh lên Cloudinary:', error.response ? error.response.data : error.message);
//         throw error;
//     }
// }

// // --- Form Handling ---

// function resetForm() {
//     console.log("[resetForm] Đặt lại biểu mẫu...");
//     newsForm.reset();
//     newsIdInput.value = '';
//     submitBtn.textContent = 'Tạo Tin tức';
//     newsForm.classList.add('hidden');
    
//     // Clear album image upload related fields
//     filesToUpload = [];
//     uploadedAlbumImageUrls = []; // Đặt lại cho album
//     imagePreviewContainer.innerHTML = ''; // Xóa các ảnh xem trước trong album
//     uploadImagesBtn.classList.add('hidden'); // Ẩn nút tải lên album
//     uploadImagesBtn.textContent = 'Tải ảnh đã chọn lên Cloudinary';
//     uploadImagesBtn.disabled = false;

//     // Clear featured image related fields
//     featuredImageFile = null;
//     displayFeaturedImagePreview(null); // Clear featured image preview
//     featuredImageUploadInput.value = ''; // Reset file input
//     featuredImageUrlHiddenInput.value = ''; // Xóa URL ảnh bìa đã lưu

//     // Reset select fields
//     populateNewsTypesSelect(); // Gọi lại để reset option mặc định
//     Array.from(tagsSelect.options).forEach(option => {
//         option.selected = false;
//     });

//     currentNewsAlbumData = null; // Đảm bảo reset album data khi reset form
//     showMessage('', ''); // Clear any previous messages
//     console.log("[resetForm] Biểu mẫu đã được đặt lại hoàn toàn.");
// }

// async function populateFormForEdit(news) {
//     console.log("[populateFormForEdit] Điền dữ liệu vào form để chỉnh sửa tin tức:", news);
//     newsIdInput.value = news.id;
//     titleInput.value = news.title;
//     shortDescriptionInput.value = news.short_description;
//     contentInput.value = news.content;
    
//     // Set type select
//     await populateNewsTypesSelect(news.type); // Truyền giá trị key để chọn đúng option

//     // Handle existing featured image for edit mode
//     if (news.featured_image) {
//         const imageUrlForPreview = news.featured_image.startsWith('http') ? news.featured_image : `https://res.cloudinary.com/${CLOUDINARY_CLOUD_NAME}/image/upload/${news.featured_image}`;
//         displayFeaturedImagePreview(null, imageUrlForPreview);
//         featuredImageUrlHiddenInput.value = news.featured_image; // Lưu public_id hoặc full URL vào hidden input
//     } else {
//         displayFeaturedImagePreview(null);
//     }
//     featuredImageUploadInput.value = ''; // Xóa giá trị của input file để người dùng có thể chọn ảnh mới
//     featuredImageFile = null; // Reset file đã chọn

//     activeCheckbox.checked = news.active;

//     // Populate Tags
//     const newsTagIds = news.tags.map(tag => tag.id);
//     await fetchTags(newsTagIds); // Truyền các tag ID đã chọn để populate select

//     // Handle Album Images
//     if (news.album && news.album.images) {
//         currentNewsAlbumData = news.album; // Lưu trữ dữ liệu album hiện tại
//         displayAlbumImagesForEdit(news.album.images);
//     } else {
//         currentNewsAlbumData = null;
//         imagePreviewContainer.innerHTML = '';
//     }

//     filesToUpload = []; // Reset filesToUpload cho các ảnh mới
//     uploadedAlbumImageUrls = []; // Reset uploadedAlbumImageUrls

//     submitBtn.textContent = 'Cập nhật Tin tức';
//     newsForm.classList.remove('hidden');
//     window.scrollTo({ top: 0, behavior: 'smooth' }); // Cuộn lên đầu form
//     console.log("[populateFormForEdit] Form đã được điền dữ liệu.");
// }

// function displayAlbumImagesForEdit(images) {
//     console.log("[displayAlbumImagesForEdit] Hiển thị các ảnh album hiện có...");
//     imagePreviewContainer.innerHTML = ''; // Clear existing previews
//     images.forEach(img => {
//         const imgWrapper = document.createElement('div');
//         imgWrapper.className = 'image-preview-wrapper';
//         imgWrapper.dataset.imageId = img.id; // Lưu ID của ảnh để dễ dàng xóa
//         imgWrapper.dataset.imageUrl = img.image_url; // Lưu URL ảnh

//         const imageElement = document.createElement('img');
//         imageElement.src = img.image_url;
//         imageElement.alt = "Album Image";
//         imageElement.className = "image-preview";

//         const removeButton = document.createElement('button');
//         removeButton.className = 'remove-image-btn';
//         removeButton.innerHTML = '&times;'; // Dấu 'x'
//         removeButton.title = 'Xóa ảnh này khỏi album';
//         removeButton.addEventListener('click', () => removeAlbumImage(img.id, imgWrapper));

//         imgWrapper.appendChild(imageElement);
//         imgWrapper.appendChild(removeButton);
//         imagePreviewContainer.appendChild(imgWrapper);
//     });
//     console.log("[displayAlbumImagesForEdit] Đã hiển thị các ảnh album hiện có.");
// }

// async function removeAlbumImage(imageId, imageWrapperElement) {
//     if (!confirm('Bạn có chắc chắn muốn xóa ảnh này khỏi album?')) {
//         return;
//     }
//     console.log(`[removeAlbumImage] Đang xóa ảnh với ID: ${imageId}`);
//     try {
//         const response = await fetch(`${IMAGES_API_URL}${imageId}/`, {
//             method: 'DELETE',
//             headers: {
//                 'Authorization': `Token ${authToken}`,
//             },
//         });

//         if (!response.ok) {
//             if (response.status === 404) {
//                 throw new Error('Ảnh không tồn tại trên máy chủ.');
//             } else {
//                 const errorData = await response.json();
//                 throw new Error(`Lỗi khi xóa ảnh: ${JSON.stringify(errorData)}`);
//             }
//         }

//         // Xóa ảnh khỏi DOM
//         imageWrapperElement.remove();

//         // Xóa ảnh khỏi currentNewsAlbumData nếu có (để đảm bảo đồng bộ khi cập nhật tin tức)
//         if (currentNewsAlbumData && currentNewsAlbumData.images) {
//             currentNewsAlbumData.images = currentNewsAlbumData.images.filter(img => img.id !== imageId);
//         }

//         showMessage('Ảnh đã được xóa khỏi album.', 'success');
//         console.log(`[removeAlbumImage] Ảnh ${imageId} đã được xóa thành công.`);
//     } catch (error) {
//         console.error('Lỗi khi xóa ảnh khỏi album:', error);
//         showMessage(`Không thể xóa ảnh: ${error.message}`, 'error');
//     }
// }


// function handleAlbumImagesChange(event) {
//     filesToUpload = Array.from(event.target.files);
//     previewAlbumImages(filesToUpload);
//     if (filesToUpload.length > 0) {
//         uploadImagesBtn.classList.remove('hidden');
//     } else {
//         uploadImagesBtn.classList.add('hidden');
//     }
//     console.log(`[handleAlbumImagesChange] Đã chọn ${filesToUpload.length} tệp cho album.`);
// }

// function previewAlbumImages(files) {
//     console.log("[previewAlbumImages] Tạo bản xem trước cho ảnh album mới...");
//     // Xóa chỉ các preview của ảnh MỚI, không phải ảnh đã có từ DB
//     const newImagePreviews = imagePreviewContainer.querySelectorAll('.new-image-preview-wrapper');
//     newImagePreviews.forEach(el => el.remove());

//     files.forEach(file => {
//         const reader = new FileReader();
//         reader.onload = (e) => {
//             const imgWrapper = document.createElement('div');
//             imgWrapper.className = 'image-preview-wrapper new-image-preview-wrapper'; // Thêm class để dễ phân biệt
//             const imageElement = document.createElement('img');
//             imageElement.src = e.target.result;
//             imageElement.alt = file.name;
//             imageElement.className = "image-preview";
//             imgWrapper.appendChild(imageElement);
//             imagePreviewContainer.appendChild(imgWrapper);
//         };
//         reader.readAsDataURL(file);
//     });
// }

// async function uploadSelectedAlbumImages() {
//     if (filesToUpload.length === 0) {
//         showMessage('Không có ảnh nào để tải lên.', 'warning');
//         return;
//     }

//     uploadImagesBtn.disabled = true;
//     uploadImagesBtn.textContent = 'Đang tải lên...';
//     showMessage('Đang tải lên các ảnh album mới...', 'info');

//     try {
//         const uploadedUrls = [];
//         for (const file of filesToUpload) {
//             const result = await uploadImageToCloudinary(file);
//             uploadedUrls.push(result); // result là {public_id, full_url}
//         }
//         uploadedAlbumImageUrls = uploadedUrls; // Lưu trữ các URL đã tải lên

//         showMessage('Tất cả ảnh album đã được tải lên Cloudinary.', 'success');
//         console.log("[uploadSelectedAlbumImages] Tất cả ảnh album đã được tải lên Cloudinary:", uploadedAlbumImageUrls);
//         uploadImagesBtn.textContent = 'Đã tải lên!';
//     } catch (error) {
//         console.error('Lỗi khi tải lên ảnh album:', error);
//         showMessage('Lỗi khi tải lên ảnh album. Vui lòng thử lại.', 'error');
//         uploadImagesBtn.textContent = 'Tải ảnh đã chọn lên Cloudinary (Lỗi)';
//         uploadedAlbumImageUrls = []; // Xóa các URL nếu có lỗi
//     } finally {
//         uploadImagesBtn.disabled = false;
//         // Xóa các preview của ảnh mới sau khi tải lên xong (để tránh trùng lặp khi edit và lưu)
//         const newImagePreviews = imagePreviewContainer.querySelectorAll('.new-image-preview-wrapper');
//         newImagePreviews.forEach(el => el.remove());
//     }
// }


// async function handleSubmitNews(event) {
//     event.preventDefault();
//     showMessage('Đang xử lý...', 'info');

//     const newsId = newsIdInput.value;
//     const isEditing = !!newsId; // True if newsId exists

//     const title = titleInput.value.trim();
//     const short_description = shortDescriptionInput.value.trim();
//     const content = contentInput.value.trim();
//     const type_news = typeNewsSelect.value;
//     const active = activeCheckbox.checked;
    
//     // Lấy các tag đã chọn
//     const selectedTagIds = Array.from(tagsSelect.selectedOptions).map(option => parseInt(option.value));

//     // Validation
//     if (!title || !short_description || !content || !type_news) {
//         showMessage('Vui lòng điền đầy đủ các trường Tên, Mô tả ngắn, Nội dung và Loại tin tức.', 'error');
//         return;
//     }

//     if (featuredImageFile && featuredImageUrlHiddenInput.value) {
//         // Đây là trường hợp người dùng đã chọn ảnh mới VÀ input hidden đã có giá trị.
//         // Có thể do người dùng chọn ảnh, sau đó sửa và không chọn lại.
//         // Để tránh lỗi, ta sẽ ưu tiên file mới được chọn.
//         console.warn("Cảnh báo: Có cả featuredImageFile và featuredImageUrlHiddenInput.value. Ưu tiên featuredImageFile.");
//         featuredImageUrlHiddenInput.value = ''; // Xóa giá trị cũ để đảm bảo upload mới
//     }


//     let featured_image_url = featuredImageUrlHiddenInput.value; // URL ảnh bìa đã có (khi chỉnh sửa) hoặc đã được tải lên trước đó
//     let album_id = currentNewsAlbumData ? currentNewsAlbumData.id : null; // ID album hiện có
//     let existing_album_images_to_keep = []; // Các ID ảnh album đã có mà không bị xóa

//     if (currentNewsAlbumData && currentNewsAlbumData.images) {
//         existing_album_images_to_keep = currentNewsAlbumData.images.map(img => img.id);
//     }
    
//     try {
//         // 1. Tải lên ảnh bìa nếu có file mới được chọn
//         if (featuredImageFile) {
//             showMessage('Đang tải lên ảnh bìa...', 'info');
//             const featuredImageResult = await uploadImageToCloudinary(featuredImageFile);
//             featured_image_url = featuredImageResult.full_url; // Lấy full URL hoặc public_id tùy backend
//             console.log("Ảnh bìa đã tải lên:", featured_image_url);
//         } else if (isEditing && !featuredImageUrlHiddenInput.value) {
//             // Nếu đang chỉnh sửa và không có ảnh bìa cũ cũng như không có file mới được chọn
//             // Điều này có nghĩa là người dùng đã xóa ảnh bìa hoặc không có ảnh bìa từ đầu.
//             featured_image_url = null;
//         }

//         // 2. Tải lên các ảnh album MỚI nếu có
//         if (filesToUpload.length > 0 && uploadedAlbumImageUrls.length === 0) {
//             // Chỉ tải lên nếu người dùng đã chọn file nhưng chưa nhấn "Tải ảnh đã chọn lên Cloudinary"
//             // (Mặc dù chúng ta khuyến khích họ nhấn trước, nhưng phòng trường hợp họ submit luôn)
//             showMessage('Đang tải lên các ảnh album mới...', 'info');
//             await uploadSelectedAlbumImages();
//         }

//         // 3. Chuẩn bị dữ liệu để gửi lên API
//         const newsData = {
//             title: title,
//             short_description: short_description,
//             content: content,
//             type: type_news,
//             active: active,
//             tags: selectedTagIds, // Gửi mảng các ID tags
//             featured_image: featured_image_url,
//         };

//         // Nếu có album hiện tại, thêm album_id vào dữ liệu
//         if (album_id) {
//             newsData.album_id = album_id;
//         }

//         // Thêm các URL ảnh album MỚI đã tải lên
//         if (uploadedAlbumImageUrls.length > 0) {
//             // Backend cần nhận một danh sách các URL ảnh mới để tạo Image objects
//             // Ví dụ: new_album_images: [{image_url: 'url1', public_id: 'pid1'}, ...]
//             newsData.new_album_images = uploadedAlbumImageUrls.map(img => ({
//                 image_url: img.full_url,
//                 public_id: img.public_id
//             }));
//         }

//         // Nếu đang chỉnh sửa, cần gửi danh sách các ảnh album CŨ muốn giữ lại
//         // (Nếu backend không tự động xử lý, bạn có thể cần gửi `existing_album_image_ids`
//         // hoặc logic phức tạp hơn tùy thuộc vào thiết kế API của bạn)
//         // Ví dụ: newsData.existing_album_images_to_keep = existing_album_images_to_keep;
//         // Hoặc backend sẽ xóa các ảnh không nằm trong album.images của request PUT/PATCH
//         // mà bạn gửi lên. Đây là điểm cần khớp với thiết kế backend.
//         // Với cách làm hiện tại (xóa ảnh riêng lẻ bằng removeAlbumImage),
//         // chúng ta không cần gửi danh sách các ảnh cũ để giữ lại trong payload PUT/PATCH,
//         // vì chúng đã được xử lý riêng.

//         console.log("[handleSubmitNews] Dữ liệu tin tức gửi đi:", newsData);

//         let response;
//         if (isEditing) {
//             // Cập nhật tin tức hiện có
//             response = await axios.put(`${NEWS_API_URL}${newsId}/`, newsData, {
//                 headers: {
//                     'Content-Type': 'application/json',
//                     'Authorization': `Token ${authToken}`,
//                 },
//             });
//             showMessage('Tin tức đã được cập nhật thành công!', 'success');
//             console.log("[handleSubmitNews] Tin tức đã được cập nhật:", response.data);
//         } else {
//             // Tạo tin tức mới
//             response = await axios.post(NEWS_API_URL, newsData, {
//                 headers: {
//                     'Content-Type': 'application/json',
//                     'Authorization': `Token ${authToken}`,
//                 },
//             });
//             showMessage('Tin tức đã được tạo thành công!', 'success');
//             console.log("[handleSubmitNews] Tin tức mới đã được tạo:", response.data);
//         }

//         resetForm(); // Đặt lại biểu mẫu sau khi thành công
//         fetchNews(currentPageAll); // Tải lại danh sách tin tức
//         fetchNewsByTag(currentTagFilter, currentPageByTag); // Tải lại danh sách tin tức theo thẻ

//     } catch (error) {
//         console.error('Lỗi khi lưu tin tức:', error.response ? error.response.data : error.message);
//         showMessage(`Lỗi khi lưu tin tức: ${error.response ? JSON.stringify(error.response.data) : error.message}`, 'error');
//     }
// }


// async function handleEditNews(id) {
//     console.log(`[handleEditNews] Đang tải tin tức để chỉnh sửa: ${id}`);
//     try {
//         const response = await fetch(`${NEWS_API_URL}${id}/`);
//         if (!response.ok) throw new Error('Không thể tải tin tức để chỉnh sửa.');
//         const news = await response.json();
//         populateFormForEdit(news);
//         addNewsButton.scrollIntoView({ behavior: 'smooth' }); // Cuộn đến nút thêm tin tức
//     } catch (error) {
//         console.error('Lỗi khi lấy tin tức để chỉnh sửa:', error);
//         showMessage('Không thể tải tin tức để chỉnh sửa.', 'error');
//     }
// }

// async function handleDeleteNews(id) {
//     if (!confirm('Bạn có chắc chắn muốn xóa tin tức này không?')) {
//         return;
//     }
//     console.log(`[handleDeleteNews] Đang xóa tin tức: ${id}`);
//     try {
//         const response = await fetch(`${NEWS_API_URL}${id}/`, {
//             method: 'DELETE',
//             headers: {
//                 'Authorization': `Token ${authToken}`,
//             },
//         });

//         if (!response.ok) {
//             const errorData = await response.json();
//             throw new Error(`Lỗi khi xóa tin tức: ${JSON.stringify(errorData)}`);
//         }

//         showMessage('Tin tức đã được xóa thành công.', 'success');
//         console.log(`[handleDeleteNews] Tin tức ${id} đã được xóa.`);
//         fetchNews(currentPageAll); // Tải lại danh sách tin tức
//         fetchNewsByTag(currentTagFilter, currentPageByTag); // Tải lại danh sách tin tức theo thẻ
//     } catch (error) {
//         console.error('Lỗi khi xóa tin tức:', error);
//         showMessage(`Không thể xóa tin tức: ${error.message}`, 'error');
//     }
// }

// // --- Event Listeners ---

// addNewsButton.addEventListener('click', () => {
//     newsForm.classList.remove('hidden');
//     resetForm(); // Đảm bảo form sạch khi thêm mới
//     titleInput.focus();
//     console.log("[Event] Nút 'Thêm Tin tức mới' được nhấn.");
// });

// cancelFormBtn.addEventListener('click', (event) => {
//     event.preventDefault();
//     resetForm();
//     newsForm.classList.add('hidden');
//     console.log("[Event] Nút 'Hủy' được nhấn.");
// });

// newsForm.addEventListener('submit', handleSubmitNews);

// featuredImageUploadInput.addEventListener('change', (event) => {
//     featuredImageFile = event.target.files[0];
//     displayFeaturedImagePreview(featuredImageFile);
//     console.log("[Event] Ảnh bìa được chọn.");
// });

// albumImagesInput.addEventListener('change', handleAlbumImagesChange);

// uploadImagesBtn.addEventListener('click', uploadSelectedAlbumImages);


// function addNewsEventListeners() {
//     document.querySelectorAll('.edit-btn').forEach(button => {
//         button.onclick = () => handleEditNews(button.dataset.id);
//     });
//     document.querySelectorAll('.delete-btn').forEach(button => {
//         button.onclick = () => handleDeleteNews(button.dataset.id);
//     });
//     console.log("[addNewsEventListeners] Đã thêm event listeners cho các nút Sửa/Xóa.");
// }

// // --- Tag Filtering ---

// // function populateTagFilters() {
// //     console.log("[populateTagFilters] Tạo các nút lọc theo thẻ.");
// //     tagFiltersDiv.innerHTML = ''; // Clear existing filters

// //     // Add "All" filter button
// //     const allButton = document.createElement('button');
// //     allButton.textContent = 'Tất cả';
// //     allButton.classList.add('tag-filter-btn');
// //     if (currentTagFilter === 'all') {
// //         allButton.classList.add('active');
// //     }
// //     allButton.addEventListener('click', () => {
// //         currentTagFilter = 'all';
// //         updateTagFilterButtons();
// //         fetchNewsByTag('all');
// //     });
// //     tagFiltersDiv.appendChild(allButton);

// //     availableTags.forEach(tag => {
// //         const button = document.createElement('button');
// //         button.textContent = getDisplayTagName(tag.name);
// //         button.classList.add('tag-filter-btn');
// //         if (currentTagFilter === tag.id) {
// //             button.classList.add('active');
// //         }
// //         button.addEventListener('click', () => {
// //             currentTagFilter = tag.id;
// //             updateTagFilterButtons();
// //             fetchNewsByTag(tag.id);
// //         });
// //         tagFiltersDiv.appendChild(button);
// //     });
// //     console.log("[populateTagFilters] Các nút lọc thẻ đã được tạo.");
// // }


// function populateTagFilters() {
//     console.log("[populateTagFilters] Tạo các nút lọc theo thẻ.");
//     tagFiltersDiv.innerHTML = ''; // Clear existing filters

//     // Add "All" filter button
//     const allButton = document.createElement('button');
//     allButton.textContent = 'Tất cả';
//     allButton.classList.add('tag-filter-btn');
//     if (currentTagFilter === 'all') {
//         allButton.classList.add('active');
//     }
//     allButton.addEventListener('click', () => {
//         currentTagFilter = 'all';
//         updateTagFilterButtons();
//         fetchNews(currentPageAll); // Khi chọn "Tất cả", gọi fetchNews để hiển thị tất cả tin tức
//     });
//     tagFiltersDiv.appendChild(allButton);

//     availableTags.forEach(tag => {
//         const button = document.createElement('button');
//         button.textContent = getDisplayTagName(tag.name);
//         button.classList.add('tag-filter-btn');
//         if (currentTagFilter === tag.id) {
//             button.classList.add('active');
//         }
//         button.addEventListener('click', () => {
//             currentTagFilter = tag.id;
//             updateTagFilterButtons();
//             fetchNewsByTag(tag.id, 1); // Đặt lại về trang 1 khi lọc theo thẻ mới
//         });
//         tagFiltersDiv.appendChild(button);
//     });
//     console.log("[populateTagFilters] Các nút lọc thẻ đã được tạo.");
// }

// function updateTagFilterButtons() {
//     document.querySelectorAll('.tag-filter-btn').forEach(button => {
//         button.classList.remove('active');
//         if (button.textContent === 'Tất cả' && currentTagFilter === 'all') {
//             button.classList.add('active');
//         } else if (currentTagFilter === availableTags.find(t => getDisplayTagName(t.name) === button.textContent)?.id) {
//             button.classList.add('active');
//         }
//     });
//     console.log(`[updateTagFilterButtons] Đã cập nhật trạng thái nút lọc thẻ. Thẻ hiện tại: ${currentTagFilter}`);
// }


// // --- Initialization ---

// document.addEventListener('DOMContentLoaded', async () => {
//     console.log("[DOMContentLoaded] Trang đã tải. Bắt đầu khởi tạo...");
//     await populateNewsTypesSelect();
//     await fetchTags();
//     fetchNews(currentPageAll); // Tải tất cả tin tức khi trang tải
//     // Không cần gọi fetchNewsByTag ở đây vì fetchNews đã hiển thị "all"
//     addNewsEventListeners();
//     console.log("[DOMContentLoaded] Khởi tạo hoàn tất.");
// });



const CLOUDINARY_CLOUD_NAME = 'dftarzzfw'; // Thay thế bằng Cloud Name của bạn
const CLOUDINARY_UPLOAD_PRESET = 'SGGDCollege'; // Thay thế bằng Upload Preset của bạn

// Kiểm tra cấu hình Cloudinary ngay từ đầu
if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_UPLOAD_PRESET || CLOUDINARY_CLOUD_NAME === 'your_cloudinary_cloud_name') {
    alert("Lỗi cấu hình Cloudinary: Vui lòng cập nhật CLOUDINARY_CLOUD_NAME và CLOUDINARY_UPLOAD_PRESET trong manage_news.js!");
}

// --- API Endpoints ---
const BASE_URL = 'https://saigongiadinh.pythonanywhere.com';
const NEWS_API_URL = `${BASE_URL}/news/`;
const TAGS_API_URL = `${BASE_URL}/TagView/`;
const ALBUMS_API_URL = `${BASE_URL}/albums/`;
const IMAGES_API_URL = `${BASE_URL}/images/`; // Endpoint để tạo Image model trong DB
const TYPE_NEWS_API_URL = `${BASE_URL}/TypeNewsView/`; // Endpoint để lấy danh sách loại tin tức

// --- DOM Elements ---
const newsForm = document.getElementById('newsForm');
const addNewsButton = document.getElementById('addNewsButton');
const cancelFormBtn = document.getElementById('cancelFormBtn');
const submitBtn = document.getElementById('submitBtn');
const newsIdInput = document.getElementById('newsId');
const titleInput = document.getElementById('title');
const shortDescriptionInput = document.getElementById('short_description');
const contentInput = document.getElementById('content_textarea');
const typeNewsSelect = document.getElementById('type_news');
const activeCheckbox = document.getElementById('active');
const tagsSelect = document.getElementById('tags');
const messageDiv = document.getElementById('message');

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

// Các phần tử mới cho tính năng lọc theo thẻ (giữ nguyên)
const tagFiltersDiv = document.getElementById('tag-filters');

// --- Global Variables ---
let availableTags = [];
let availableNewsTypes = []; // Lưu trữ các loại tin tức từ API
let currentPage = 1; // Trang hiện tại cho danh sách tin tức hiển thị (dù là "Tất cả" hay "Theo thẻ")
let currentTagFilter = 'all'; // ID của thẻ đang được chọn để lọc (mặc định 'all' cho tất cả)

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
    console.log(`[showMessage] Loại: ${type}, Nội dung: ${msg}`);
    setTimeout(() => {
        messageDiv.style.display = 'none';
    }, 5000);
}

function displayFeaturedImagePreview(file, imageUrl = null) {
    console.log("[displayFeaturedImagePreview] Hiển thị bản xem trước ảnh bìa.");
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
        featuredImageUrlHiddenInput.value = ''; // Clear hidden input if no file
    }
}

function getDisplayTagName(rawName) {
    // Chuyển đổi tên tag từ ALL_CAPS_WITH_UNDERSCORES sang Title Case với khoảng trắng
    if (typeof rawName !== 'string') return ''; // Đảm bảo rawName là string
    return rawName.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, c => c.toUpperCase());
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
const authToken = getAuthToken();

// --- Fetch Data Functions ---

// Populate News Types Select (từ API)
async function populateNewsTypesSelect(selectedTypeKey = null) {
    console.log("[populateNewsTypesSelect] Đang tải các loại tin tức...");
    try {
        const response = await fetch(TYPE_NEWS_API_URL);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        console.log("[populateNewsTypesSelect] Dữ liệu loại tin tức nhận được:", data);

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
        console.log("[populateNewsTypesSelect] Đã điền các loại tin tức vào select.");
    } catch (error) {
        console.error('Lỗi khi tải loại tin tức:', error);
        showMessage('Không thể tải danh sách loại tin tức. Vui lòng kiểm tra kết nối hoặc API.', 'error');
    }
}

async function fetchTags(selectedTagIds = []) {
    console.log("[fetchTags] Bắt đầu tải tags...");
    try {
        const response = await fetch(TAGS_API_URL);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        console.log("[fetchTags] Dữ liệu tags nhận được:", data);

        let tagsToProcess = [];
        if (Array.isArray(data)) {
            tagsToProcess = data;
        } else if (data && Array.isArray(data.results)) {
            tagsToProcess = data.results;
        } else {
            console.warn("Tag API did not return expected array format (direct array or .results array):", data);
            showMessage('Không thể tải danh sách thẻ: Định dạng dữ liệu không hợp lệ.', 'error');
            return;
        }

        availableTags = tagsToProcess;
        tagsSelect.innerHTML = ''; // Clear existing options

        availableTags.forEach(tag => {
            const option = document.createElement('option');
            option.value = tag.id;
            option.textContent = getDisplayTagName(tag.name);
            if (selectedTagIds.includes(tag.id)) {
                option.selected = true;
            }
            tagsSelect.appendChild(option);
        });
        tagsSelect.setAttribute('multiple', 'multiple'); // Cho phép chọn nhiều thẻ
        console.log("[fetchTags] Tags đã được tải và hiển thị thành công.");
        populateTagFilters(); // Cập nhật bộ lọc tags
    } catch (error) {
        console.error('Lỗi khi tải tags:', error);
        showMessage('Không thể tải danh sách tags. Vui lòng kiểm tra kết nối hoặc API.', 'error');
    }
}

// Hàm tải TẤT CẢ tin tức
async function fetchAllNews(page = 1) {
    console.log(`[fetchAllNews] Bắt đầu tải tất cả tin tức, trang: ${page}`);
    try {
        const response = await fetch(`${NEWS_API_URL}?page=${page}&page_size=${ITEMS_PER_PAGE}`);
        if (!response.ok) throw new Error('Không thể tải tin tức');
        const data = await response.json();
        console.log("[fetchAllNews] Dữ liệu tất cả tin tức nhận được:", data);
        displayNews(data.results, newsListDisplayDiv); // Hiển thị vào newsListDisplayDiv
        setupPagination(data.count, page, paginationDisplayDiv, fetchAllNews); // Phân trang cho tất cả tin tức
        currentPage = page; // Cập nhật trang hiện tại
        console.log("[fetchAllNews] Tất cả tin tức và phân trang đã được cập nhật.");
    } catch (error) {
        console.error('Lỗi khi tải tất cả tin tức:', error);
        newsListDisplayDiv.innerHTML = '<p style="text-align: center; color: red;">Không thể tải tin tức.</p>';
        showMessage('Không thể tải tất cả tin tức.', 'error');
    }
}

// Hàm tải tin tức theo thẻ
async function fetchNewsByTag(tagId, page = 1) {
    console.log(`[fetchNewsByTag] Bắt đầu tải tin tức theo thẻ: ${tagId}, trang: ${page}`);
    if (tagId === 'all') {
        // Nếu tagId là 'all', chúng ta gọi hàm tải tất cả tin tức
        fetchAllNews(page);
        return;
    }

    try {
        let url = `${NEWS_API_URL}?page=${page}&page_size=${ITEMS_PER_PAGE}&tag=${tagId}`;
        const response = await fetch(url);
        if (!response.ok) throw new Error('Không thể tải tin tức theo thẻ');
        const data = await response.json();
        console.log("[fetchNewsByTag] Dữ liệu tin tức theo thẻ nhận được:", data);
        displayNews(data.results, newsListDisplayDiv); // Hiển thị vào newsListDisplayDiv
        setupPagination(data.count, page, paginationDisplayDiv, (p) => fetchNewsByTag(tagId, p));
        currentPage = page; // Cập nhật trang hiện tại
        console.log("[fetchNewsByTag] Tin tức theo thẻ và phân trang đã được cập nhật.");
    } catch (error) {
        console.error('Lỗi khi tải tin tức theo thẻ:', error);
        newsListDisplayDiv.innerHTML = '<p style="text-align: center; color: red;">Không thể tải tin tức theo thẻ.</p>';
        showMessage('Không thể tải tin tức theo thẻ.', 'error');
    }
}

// --- Display Functions ---

function displayNews(newsItems, listElement) {
    console.log("[displayNews] Hiển thị danh sách tin tức...");
    listElement.innerHTML = '';
    if (newsItems.length === 0) {
        listElement.innerHTML = '<p style="text-align: center;">Chưa có tin tức nào.</p>';
        console.log("[displayNews] Không có tin tức để hiển thị.");
        return;
    }
    newsItems.forEach(news => {
        const newsItemDiv = document.createElement('div');
        // Sử dụng class chung cho cả hai kiểu hiển thị (nếu bạn muốn chúng giống nhau)
        // Nếu bạn muốn giữ kiểu dáng riêng biệt, hãy điều chỉnh CSS hoặc thêm class khác ở đây
        newsItemDiv.className = 'news-item-by-tag'; // hoặc 'news-item' nếu bạn muốn kiểu dáng chung

        const tagsHtml = news.tags.map(tag => getDisplayTagName(tag.name)).join(', ');

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
                    <br>
                    Thẻ: <span class="tags">${tagsHtml || 'Không có'}</span>
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
    console.log("[displayNews] Danh sách tin tức đã được hiển thị.");
}


function setupPagination(totalItems, page, paginationElement, fetchFunction) {
    console.log(`[setupPagination] Thiết lập phân trang: Tổng số mục = ${totalItems}, Trang hiện tại = ${page}`);
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
    console.log("[setupPagination] Phân trang đã được thiết lập.");
}


async function uploadImageToCloudinary(file) {
    console.log(`[Cloudinary Upload] Đang tải lên tệp: ${file.name}`);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET); // Sử dụng upload preset

    try {
        const cloudinaryResponse = await axios.post(
            `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
            formData
        );

        if (cloudinaryResponse.data && cloudinaryResponse.data.secure_url) {
            const publicId = cloudinaryResponse.data.public_id; // Lấy public_id
            const fullUrl = cloudinaryResponse.data.secure_url; // Lấy URL đầy đủ
            console.log(`[Cloudinary Upload] Tải lên thành công tệp ${file.name}: Public ID: ${publicId}, URL: ${fullUrl}`);
            return { public_id: publicId, full_url: fullUrl }; // Trả về cả public_id và full_url
        } else {
            throw new Error(`Upload ảnh ${file.name} lên Cloudinary thất bại: Không có secure_url.`);
        }
    } catch (error) {
        console.error('Lỗi khi tải ảnh lên Cloudinary:', error.response ? error.response.data : error.message);
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
    Array.from(tagsSelect.options).forEach(option => {
        option.selected = false;
    });

    currentNewsAlbumData = null; // Đảm bảo reset album data khi reset form
    showMessage('', ''); // Clear any previous messages
    console.log("[resetForm] Biểu mẫu đã được đặt lại hoàn toàn.");
}

async function populateFormForEdit(news) {
    console.log("[populateFormForEdit] Điền dữ liệu vào form để chỉnh sửa tin tức:", news);
    newsIdInput.value = news.id;
    titleInput.value = news.title;
    shortDescriptionInput.value = news.short_description;
    contentInput.value = news.content;

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

    // Populate Tags
    const newsTagIds = news.tags.map(tag => tag.id);
    await fetchTags(newsTagIds); // Truyền các tag ID đã chọn để populate select

    // Handle Album Images
    if (news.album && news.album.images) {
        currentNewsAlbumData = news.album; // Lưu trữ dữ liệu album hiện tại
        displayAlbumImagesForEdit(news.album.images);
    } else {
        currentNewsAlbumData = null;
        imagePreviewContainer.innerHTML = '';
    }

    filesToUpload = []; // Reset filesToUpload cho các ảnh mới
    uploadedAlbumImageUrls = []; // Reset uploadedAlbumImageUrls

    submitBtn.textContent = 'Cập nhật Tin tức';
    newsForm.classList.remove('hidden');
    window.scrollTo({ top: 0, behavior: 'smooth' }); // Cuộn lên đầu form
    console.log("[populateFormForEdit] Form đã được điền dữ liệu.");
}

function displayAlbumImagesForEdit(images) {
    console.log("[displayAlbumImagesForEdit] Hiển thị các ảnh album hiện có...");
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
    console.log("[displayAlbumImagesForEdit] Đã hiển thị các ảnh album hiện có.");
}

async function removeAlbumImage(imageId, imageWrapperElement) {
    if (!confirm('Bạn có chắc chắn muốn xóa ảnh này khỏi album?')) {
        return;
    }
    console.log(`[removeAlbumImage] Đang xóa ảnh với ID: ${imageId}`);
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
        console.log(`[removeAlbumImage] Ảnh ${imageId} đã được xóa thành công.`);
    } catch (error) {
        console.error('Lỗi khi xóa ảnh khỏi album:', error);
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
    console.log(`[handleAlbumImagesChange] Đã chọn ${filesToUpload.length} tệp cho album.`);
}

function previewAlbumImages(files) {
    console.log("[previewAlbumImages] Tạo bản xem trước cho ảnh album mới...");
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
        console.log("[uploadSelectedAlbumImages] Tất cả ảnh album đã được tải lên Cloudinary:", uploadedAlbumImageUrls);
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
    const content = contentInput.value.trim();
    const type_news = typeNewsSelect.value;
    const active = activeCheckbox.checked;

    // Lấy các tag đã chọn
    const selectedTagIds = Array.from(tagsSelect.selectedOptions).map(option => parseInt(option.value));

    // Validation
    if (!title || !short_description || !content || !type_news) {
        showMessage('Vui lòng điền đầy đủ các trường Tên, Mô tả ngắn, Nội dung và Loại tin tức.', 'error');
        return;
    }

    if (featuredImageFile && featuredImageUrlHiddenInput.value) {
        // Đây là trường hợp người dùng đã chọn ảnh mới VÀ input hidden đã có giá trị.
        // Có thể do người dùng chọn ảnh, sau đó sửa và không chọn lại.
        // Để tránh lỗi, ta sẽ ưu tiên file mới được chọn.
        console.warn("Cảnh báo: Có cả featuredImageFile và featuredImageUrlHiddenInput.value. Ưu tiên featuredImageFile.");
        featuredImageUrlHiddenInput.value = ''; // Xóa giá trị cũ để đảm bảo upload mới
    }


    let featured_image_url = featuredImageUrlHiddenInput.value; // URL ảnh bìa đã có (khi chỉnh sửa) hoặc đã được tải lên trước đó
    let album_id = currentNewsAlbumData ? currentNewsAlbumData.id : null; // ID album hiện có
    let existing_album_images_to_keep = []; // Các ID ảnh album đã có mà không bị xóa

    if (currentNewsAlbumData && currentNewsAlbumData.images) {
        existing_album_images_to_keep = currentNewsAlbumData.images.map(img => img.id);
    }

    try {
        // 1. Tải lên ảnh bìa nếu có file mới được chọn
        if (featuredImageFile) {
            showMessage('Đang tải lên ảnh bìa...', 'info');
            const featuredImageResult = await uploadImageToCloudinary(featuredImageFile);
            featured_image_url = featuredImageResult.full_url; // Lấy full URL hoặc public_id tùy backend
            console.log("Ảnh bìa đã tải lên:", featured_image_url);
        } else if (isEditing && !featuredImageUrlHiddenInput.value) {
            // Nếu đang chỉnh sửa và không có ảnh bìa cũ cũng như không có file mới được chọn
            // Điều này có nghĩa là người dùng đã xóa ảnh bìa hoặc không có ảnh bìa từ đầu.
            featured_image_url = null;
        }

        // 2. Tải lên các ảnh album MỚI nếu có
        if (filesToUpload.length > 0 && uploadedAlbumImageUrls.length === 0) {
            // Chỉ tải lên nếu người dùng đã chọn file nhưng chưa nhấn "Tải ảnh đã chọn lên Cloudinary"
            // (Mặc dù chúng ta khuyến khích họ nhấn trước, nhưng phòng trường hợp họ submit luôn)
            showMessage('Đang tải lên các ảnh album mới...', 'info');
            await uploadSelectedAlbumImages();
        }

        // 3. Chuẩn bị dữ liệu để gửi lên API
        const newsData = {
            title: title,
            short_description: short_description,
            content: content,
            type: type_news,
            active: active,
            tags: selectedTagIds, // Gửi mảng các ID tags
            featured_image: featured_image_url,
        };

        // Nếu có album hiện tại, thêm album_id vào dữ liệu
        if (album_id) {
            newsData.album_id = album_id;
        }

        // Thêm các URL ảnh album MỚI đã tải lên
        if (uploadedAlbumImageUrls.length > 0) {
            // Backend cần nhận một danh sách các URL ảnh mới để tạo Image objects
            // Ví dụ: new_album_images: [{image_url: 'url1', public_id: 'pid1'}, ...]
            newsData.new_album_images = uploadedAlbumImageUrls.map(img => ({
                image_url: img.full_url,
                public_id: img.public_id
            }));
        }

        // Nếu đang chỉnh sửa, cần gửi danh sách các ảnh album CŨ muốn giữ lại
        // (Nếu backend không tự động xử lý, bạn có thể cần gửi `existing_album_image_ids`
        // hoặc logic phức tạp hơn tùy thuộc vào thiết kế API của bạn)
        // Ví dụ: newsData.existing_album_images_to_keep = existing_album_images_to_keep;
        // Hoặc backend sẽ xóa các ảnh không nằm trong album.images của request PUT/PATCH
        // mà bạn gửi lên. Đây là điểm cần khớp với thiết kế backend.
        // Với cách làm hiện tại (xóa ảnh riêng lẻ bằng removeAlbumImage),
        // chúng ta không cần gửi danh sách các ảnh cũ để giữ lại trong payload PUT/PATCH,
        // vì chúng đã được xử lý riêng.

        console.log("[handleSubmitNews] Dữ liệu tin tức gửi đi:", newsData);

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
            console.log("[handleSubmitNews] Tin tức đã được cập nhật:", response.data);
        } else {
            // Tạo tin tức mới
            response = await axios.post(NEWS_API_URL, newsData, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Token ${authToken}`,
                },
            });
            showMessage('Tin tức đã được tạo thành công!', 'success');
            console.log("[handleSubmitNews] Tin tức mới đã được tạo:", response.data);
        }

        resetForm(); // Đặt lại biểu mẫu sau khi thành công
        // Sau khi submit thành công, chúng ta muốn quay lại hiển thị "Tất cả tin tức"
        // và đảm bảo nút "Tất cả" được kích hoạt
        currentTagFilter = 'all'; // Đảm bảo trạng thái lọc là "tất cả"
        updateTagFilterButtons(); // Kích hoạt nút "Tất cả"
        fetchAllNews(1); // Tải lại tất cả tin tức và đặt về trang 1
        // Không cần gọi fetchNewsByTag nữa vì fetchAllNews đã đảm nhiệm

    } catch (error) {
        console.error('Lỗi khi lưu tin tức:', error.response ? error.response.data : error.message);
        showMessage(`Lỗi khi lưu tin tức: ${error.response ? JSON.stringify(error.response.data) : error.message}`, 'error');
    }
}


async function handleEditNews(id) {
    console.log(`[handleEditNews] Đang tải tin tức để chỉnh sửa: ${id}`);
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
    console.log(`[handleDeleteNews] Đang xóa tin tức: ${id}`);
    try {
        const response = await fetch(`${NEWS_API_URL}${id}/`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Token ${authToken}`,
            },
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(`Lỗi khi xóa tin tức: ${JSON.stringify(errorData)}`);
        }

        showMessage('Tin tức đã được xóa thành công.', 'success');
        console.log(`[handleDeleteNews] Tin tức ${id} đã được xóa.`);
        // Sau khi xóa, tải lại danh sách dựa trên bộ lọc hiện tại
        fetchNewsByTag(currentTagFilter, currentPage);
    } catch (error) {
        console.error('Lỗi khi xóa tin tức:', error);
        showMessage(`Không thể xóa tin tức: ${error.message}`, 'error');
    }
}

// --- Event Listeners ---

addNewsButton.addEventListener('click', () => {
    newsForm.classList.remove('hidden');
    resetForm(); // Đảm bảo form sạch khi thêm mới
    titleInput.focus();
    console.log("[Event] Nút 'Thêm Tin tức mới' được nhấn.");
});

cancelFormBtn.addEventListener('click', (event) => {
    event.preventDefault();
    resetForm();
    newsForm.classList.add('hidden');
    console.log("[Event] Nút 'Hủy' được nhấn.");
});

newsForm.addEventListener('submit', handleSubmitNews);

featuredImageUploadInput.addEventListener('change', (event) => {
    featuredImageFile = event.target.files[0];
    displayFeaturedImagePreview(featuredImageFile);
    console.log("[Event] Ảnh bìa được chọn.");
});

albumImagesInput.addEventListener('change', handleAlbumImagesChange);

uploadImagesBtn.addEventListener('click', uploadSelectedAlbumImages);


function addNewsEventListeners() {
    document.querySelectorAll('.edit-btn').forEach(button => {
        button.onclick = () => handleEditNews(button.dataset.id);
    });
    document.querySelectorAll('.delete-btn').forEach(button => {
        button.onclick = () => handleDeleteNews(button.dataset.id);
    });
    console.log("[addNewsEventListeners] Đã thêm event listeners cho các nút Sửa/Xóa.");
}

// --- Tag Filtering ---

function populateTagFilters() {
    console.log("[populateTagFilters] Tạo các nút lọc theo thẻ.");
    tagFiltersDiv.innerHTML = ''; // Clear existing filters

    // Add "All" filter button - LUÔN CÓ VÀ ĐƯỢC CHỌN BAN ĐẦU
    const allButton = document.createElement('button');
    allButton.textContent = 'Tất cả';
    allButton.classList.add('tag-button'); // Giữ class 'tag-button' của bạn
    allButton.setAttribute('data-tag-id', 'all'); // Đặt data-tag-id
    // Kích hoạt nút "Tất cả" ngay từ đầu
    if (currentTagFilter === 'all') {
        allButton.classList.add('active');
    }
    allButton.addEventListener('click', () => {
        currentTagFilter = 'all'; // Cập nhật biến trạng thái
        updateTagFilterButtons(); // Cập nhật trạng thái active của các nút
        fetchAllNews(1); // Gọi hàm tải tất cả tin tức, đặt về trang 1
    });
    tagFiltersDiv.appendChild(allButton);

    availableTags.forEach(tag => {
        const button = document.createElement('button');
        button.textContent = getDisplayTagName(tag.name);
        button.classList.add('tag-button'); // Giữ class 'tag-button' của bạn
        button.setAttribute('data-tag-id', tag.id); // Đặt data-tag-id
        if (currentTagFilter === tag.id) {
            button.classList.add('active');
        }
        button.addEventListener('click', () => {
            currentTagFilter = tag.id; // Cập nhật biến trạng thái
            updateTagFilterButtons(); // Cập nhật trạng thái active của các nút
            fetchNewsByTag(tag.id, 1); // Gọi hàm tải tin tức theo thẻ, đặt về trang 1
        });
        tagFiltersDiv.appendChild(button);
    });
    console.log("[populateTagFilters] Các nút lọc thẻ đã được tạo.");
}

function updateTagFilterButtons() {
    document.querySelectorAll('.tag-button').forEach(button => {
        button.classList.remove('active');
        const tagId = button.getAttribute('data-tag-id');
        if (tagId == currentTagFilter) { // So sánh bằng '==' vì tagId từ DOM là string
            button.classList.add('active');
        }
    });
    console.log(`[updateTagFilterButtons] Đã cập nhật trạng thái nút lọc thẻ. Thẻ hiện tại: ${currentTagFilter}`);
}


// --- Initialization ---

document.addEventListener('DOMContentLoaded', async () => {
    console.log("[DOMContentLoaded] Trang đã tải. Bắt đầu khởi tạo...");
    await populateNewsTypesSelect();
    await fetchTags();
    // Ban đầu, đảm bảo nút "Tất cả" được kích hoạt và hiển thị tất cả tin tức
    currentTagFilter = 'all'; // Đặt mặc định là 'all'
    updateTagFilterButtons(); // Kích hoạt nút "Tất cả"
    fetchAllNews(1); // Tải tất cả tin tức khi trang tải, bắt đầu từ trang 1
    addNewsEventListeners(); // Gán event listeners cho các nút Sửa/Xóa
    console.log("[DOMContentLoaded] Khởi tạo hoàn tất.");
});
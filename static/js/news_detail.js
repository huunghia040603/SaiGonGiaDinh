document.addEventListener('DOMContentLoaded', function() {
    const API_BASE_URL = 'https://saigongiadinh.pythonanywhere.com';
    const NEWS_API_URL = `${API_BASE_URL}/news/`;
    
    // DOM elements
    const loadingContainer = document.getElementById('loading-container');
    const errorContainer = document.getElementById('error-container');
    const articleContent = document.getElementById('article-content');
    const errorMessage = document.getElementById('error-message');
    
    // Article elements
    const breadcrumbTitle = document.getElementById('breadcrumb-title');
    const articleCategory = document.getElementById('article-category');
    const articleTitle = document.getElementById('article-title');
    const articleDate = document.getElementById('article-date');
    const articleViews = document.getElementById('article-views');
    const articleAuthor = document.getElementById('article-author');
    const articleImage = document.getElementById('article-image');
    const articleDescription = document.getElementById('article-description');
    const articleBody = document.getElementById('article-body');
    const articleTags = document.getElementById('article-tags');
    
    // Share buttons
    const shareFacebook = document.getElementById('share-facebook');
    const shareTwitter = document.getElementById('share-twitter');
    const shareLinkedin = document.getElementById('share-linkedin');
    
    // Related articles
    const relatedArticles = document.getElementById('related-articles');

    // Get article ID from URL
    function getArticleIdFromUrl() {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get('id') || urlParams.get('slug');
    }

    // Format date
    function formatDate(dateString) {
        const options = { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        };
        return new Date(dateString).toLocaleDateString('vi-VN', options);
    }

    // Get category display name
    function getCategoryDisplayName(typeKey, typeDisplay) {
        const categoryMap = {
            'TU_VAN': 'Tư vấn',
            'GIAO_DUC': 'Giáo dục',
            'PHONG_TRAO': 'Phong trào',
            'SU_KIEN': 'Sự kiện',
            'HOAT_DONG': 'Hoạt động'
        };
        return categoryMap[typeKey] || typeDisplay || 'Tin tức';
    }

    // Format plain text to HTML with proper formatting
    function formatPlainTextToHtml(text) {
        if (!text) return '';
        
        // Tách thành các đoạn văn dựa trên dấu xuống dòng
        const paragraphs = text.split(/\n\s*\n/);
        
        // Xử lý từng đoạn
        const processedParagraphs = paragraphs.map(paragraph => {
            if (!paragraph.trim()) return '';
            
            // Chỉ cần trim và wrap trong thẻ p
            const processedParagraph = paragraph.trim();
            return `<p class="article-paragraph">${processedParagraph}</p>`;
        });
        
        // Kết hợp các đoạn văn
        return processedParagraphs.filter(p => p).join('\n');
    }



    // Create related article card
    function createRelatedArticleCard(article) {
        const card = document.createElement('div');
        card.className = 'related-card';
        
        const imageUrl = article.featured_image || 'https://via.placeholder.com/300x200?text=No+Image';
        const detailUrl = `/news-detail?id=${article.id}`;
        
        card.innerHTML = `
            <img src="${imageUrl}" alt="${article.title}" onerror="this.src='https://via.placeholder.com/300x200?text=No+Image'">
            <div class="related-card-content">
                <h4 class="related-card-title">
                    <a href="${detailUrl}" style="color: inherit; text-decoration: none;">
                        ${article.title}
                        ${article.link ? '<i class="fas fa-external-link-alt" style="font-size: 0.8em; color: #007bff; margin-left: 5px;"></i>' : ''}
                    </a>
                </h4>
                <div class="related-card-date">
                    <i class="far fa-calendar-alt"></i> ${formatDate(article.published_date)}
                    ${article.link ? '<span style="color: #007bff; margin-left: 10px;"><i class="fas fa-link"></i> Nội dung bên ngoài</span>' : ''}
                </div>
            </div>
        `;
        
        return card;
    }

    // Setup share buttons
    function setupShareButtons(article) {
        const currentUrl = window.location.href;
        const encodedUrl = encodeURIComponent(currentUrl);
        const encodedTitle = encodeURIComponent(article.title);
        const encodedDescription = encodeURIComponent(article.short_description);

        // Facebook share
        if (shareFacebook) {
            shareFacebook.href = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`;
            shareFacebook.target = '_blank';
        }

        // Twitter share (nếu có)
        if (shareTwitter) {
            shareTwitter.href = `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`;
            shareTwitter.target = '_blank';
        }

        // LinkedIn share (nếu có)
        if (shareLinkedin) {
            shareLinkedin.href = `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`;
            shareLinkedin.target = '_blank';
        }
    }

    // Display article content
    function displayArticle(article) {
        // Update breadcrumb
        if (breadcrumbTitle) {
            breadcrumbTitle.textContent = article.title;
        }

        // Update article header
        if (articleCategory) {
            articleCategory.textContent = getCategoryDisplayName(article.type?.key, article.type_display);
        }
        if (articleTitle) {
            articleTitle.textContent = article.title;
        }
        if (articleDate) {
            articleDate.textContent = formatDate(article.published_date);
        }
        if (articleViews) {
            articleViews.textContent = article.views_count || 0;
        }
        if (articleAuthor) {
            articleAuthor.textContent = article.author || 'Ban biên tập';
        }

        // Update article image
        if (articleImage) {
            if (article.featured_image) {
                articleImage.src = article.featured_image;
                articleImage.alt = article.title;
            } else {
                articleImage.style.display = 'none';
            }
        }

        // Update article description
        if (articleDescription) {
            if (article.short_description) {
                articleDescription.textContent = article.short_description;
            } else {
                articleDescription.style.display = 'none';
            }
        }

        // Update article body
        if (articleBody) {
            if (article.content) {
                let processedContent = article.content;
                
                // Kiểm tra xem content có phải là HTML hay text thô
                const hasHtmlTags = /<[^>]*>/g.test(article.content);
                
                if (!hasHtmlTags) {
                    // Nếu là text thô, xử lý để tạo HTML có định dạng
                    processedContent = formatPlainTextToHtml(article.content);
                }
                
                // Xử lý nội dung HTML an toàn
                const tempDiv = document.createElement('div');
                tempDiv.innerHTML = processedContent;
                
                // Thêm class cho các thẻ để styling tốt hơn
                const paragraphs = tempDiv.querySelectorAll('p');
                paragraphs.forEach(p => {
                    p.className = 'article-paragraph';
                });
                
                const headings = tempDiv.querySelectorAll('h1, h2, h3, h4, h5, h6');
                headings.forEach(h => {
                    h.className = 'article-heading';
                });
                
                const images = tempDiv.querySelectorAll('img');
                images.forEach(img => {
                    img.className = 'article-content-image';
                    img.style.maxWidth = '100%';
                    img.style.height = 'auto';
                    img.style.borderRadius = '8px';
                    img.style.margin = '20px 0';
                    img.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.1)';
                });
                
                articleBody.innerHTML = tempDiv.innerHTML;
            } else {
                articleBody.innerHTML = '<p class="article-paragraph">Nội dung bài viết đang được cập nhật...</p>';
            }

            // Thêm link bên ngoài nếu có
            if (article.link) {
                const externalLinkDiv = document.createElement('div');
                externalLinkDiv.className = 'external-link-container';
                externalLinkDiv.innerHTML = `
                    <div class="external-link">
                        <i class="fas fa-external-link-alt"></i>
                        <a href="${article.link}" target="_blank" rel="noopener noreferrer">
                            Xem bài viết gốc tại ${new URL(article.link).hostname}
                        </a>
                    </div>
                `;
                articleBody.appendChild(externalLinkDiv);
            }

            // Hiển thị album ảnh nếu có
            if (article.album_gallery && article.album_gallery.images && article.album_gallery.images.length > 0) {
                // Lưu trữ danh sách ảnh cho modal
                currentAlbumImages = article.album_gallery.images;
                
                const albumSection = document.createElement('section');
                albumSection.className = 'article-album';
                albumSection.innerHTML = `
                    <h3 class="article-heading">Thư viện ảnh</h3>
                    <div class="album-grid">
                        ${article.album_gallery.images.map(image => `
                            <div class="album-item">
                                <img src="${image.image_url}" alt="${image.caption || 'Ảnh trong album'}" 
                                     onclick="openImageModal('${image.image_url}', '${image.caption || ''}')">
                            </div>
                        `).join('')}
                    </div>
                `;
                articleBody.appendChild(albumSection);
            }
        }

        // Setup share buttons
        setupShareButtons(article);

        // Show article content
        if (loadingContainer) {
            loadingContainer.style.display = 'none';
        }
        if (articleContent) {
            articleContent.style.display = 'block';
        }
    }

    // Load related articles
    async function loadRelatedArticles(currentArticleId, currentType) {
        if (!relatedArticles) return;
        
        try {
            const response = await fetch(`${NEWS_API_URL}?page_size=3`);
            if (!response.ok) throw new Error('Không thể tải bài viết liên quan');
            
            const data = await response.json();
            const articles = data.results || [];
            
            // Filter out current article and get articles of same type
            const relatedArticlesList = articles
                .filter(article => article.id !== currentArticleId)
                .slice(0, 3);

            // Clear existing content
            relatedArticles.innerHTML = '';

            if (relatedArticlesList.length === 0) {
                relatedArticles.innerHTML = '<p style="text-align: center; color: #666;">Chưa có bài viết liên quan.</p>';
                return;
            }

            // Add related articles
            relatedArticlesList.forEach(article => {
                const card = createRelatedArticleCard(article);
                relatedArticles.appendChild(card);
            });

        } catch (error) {
            console.error('Lỗi khi tải bài viết liên quan:', error);
            if (relatedArticles) {
                relatedArticles.innerHTML = '<p style="text-align: center; color: #666;">Không thể tải bài viết liên quan.</p>';
            }
        }
    }

    // Load article detail
    async function loadArticleDetail() {
        const articleId = getArticleIdFromUrl();
        
        if (!articleId) {
            showError('Không tìm thấy ID bài viết trong URL.');
            return;
        }

        try {
            const response = await fetch(`${NEWS_API_URL}${articleId}/`);
            if (!response.ok) {
                if (response.status === 404) {
                    throw new Error('Bài viết không tồn tại hoặc đã bị xóa.');
                } else {
                    throw new Error(`Lỗi server: ${response.status}`);
                }
            }

            const article = await response.json();
            
            // Display article
            displayArticle(article);
            
            // Load related articles
            loadRelatedArticles(article.id, article.type?.key);

        } catch (error) {
            console.error('Lỗi khi tải bài viết:', error);
            showError(error.message);
        }
    }

    // Show error
    function showError(message) {
        if (loadingContainer) {
            loadingContainer.style.display = 'none';
        }
        if (errorContainer) {
            errorContainer.style.display = 'block';
        }
        if (errorMessage) {
            errorMessage.textContent = message;
        }
    }

    // Initialize
    loadArticleDetail();
});

// Global variables for image modal
let currentAlbumImages = [];
let currentImageIndex = 0;

// Open image modal
function openImageModal(imageUrl, caption) {
    const modal = document.getElementById('imageModal');
    const modalImage = document.getElementById('modalImage');
    const modalCaption = document.getElementById('modalCaption');
    
    if (!modal || !modalImage || !modalCaption) return;
    
    modalImage.src = imageUrl;
    modalCaption.textContent = caption;
    
    // Find current image index in album
    currentImageIndex = currentAlbumImages.findIndex(img => img.image_url === imageUrl);
    
    modal.style.display = 'block';
    document.body.style.overflow = 'hidden'; // Prevent scrolling
}

// Close image modal
function closeImageModal() {
    const modal = document.getElementById('imageModal');
    if (!modal) return;
    
    modal.style.display = 'none';
    document.body.style.overflow = 'auto'; // Restore scrolling
}

// Change image in modal
function changeImage(direction) {
    if (currentAlbumImages.length === 0) return;
    
    const modalImage = document.getElementById('modalImage');
    const modalCaption = document.getElementById('modalCaption');
    
    if (!modalImage || !modalCaption) return;
    
    currentImageIndex += direction;
    
    if (currentImageIndex >= currentAlbumImages.length) {
        currentImageIndex = 0;
    } else if (currentImageIndex < 0) {
        currentImageIndex = currentAlbumImages.length - 1;
    }
    
    const image = currentAlbumImages[currentImageIndex];
    
    modalImage.src = image.image_url;
    modalCaption.textContent = image.caption || '';
}

// Close modal when clicking outside
window.onclick = function(event) {
    const modal = document.getElementById('imageModal');
    if (modal && event.target === modal) {
        closeImageModal();
    }
}

// Keyboard navigation
document.addEventListener('keydown', function(event) {
    const modal = document.getElementById('imageModal');
    if (modal && modal.style.display === 'block') {
        if (event.key === 'Escape') {
            closeImageModal();
        } else if (event.key === 'ArrowLeft') {
            changeImage(-1);
        } else if (event.key === 'ArrowRight') {
            changeImage(1);
        }
    }
}); 
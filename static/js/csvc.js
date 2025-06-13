// static/js/facility_script.js
document.addEventListener('DOMContentLoaded', () => {

    // Hàm để hiển thị sao (có thể dùng chung với getStarsHtml của giảng viên)
    const getStarsHtml = (rating) => {
        const fullStars = Math.floor(rating);
        const halfStar = rating % 1 >= 0.5 ? '★' : '';
        const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);
        return '★'.repeat(fullStars) + halfStar + '☆'.repeat(emptyStars);
    };

    // --- Xử lý trên trang index.html (chức năng tìm kiếm cơ sở vật chất) ---
    const facilitySearchButton = document.getElementById('facility-search-button');
    const facilitySearchInput = document.getElementById('facility-search-input');
    
    if (facilitySearchButton && facilitySearchInput) {
        facilitySearchButton.addEventListener('click', () => {
            const searchTerm = facilitySearchInput.value.toLowerCase();
            console.log("Searching for facility:", searchTerm);
            alert("Chức năng tìm kiếm cơ sở vật chất đang được phát triển.");
            // Tương tự, bạn sẽ cần backend API cho tìm kiếm thực tế
        });

        facilitySearchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                facilitySearchButton.click();
            }
        });
    }

    // --- XỬ LÝ MODAL THÊM ĐÁNH GIÁ TRÊN TRANG CHI TIẾT CƠ SỞ VẬT CHẤT ---
    const openFacilityReviewModalBtn = document.getElementById('open-facility-review-modal');
    const facilityReviewModal = document.getElementById('facility-review-modal');
    const facilityCloseButton = facilityReviewModal ? facilityReviewModal.querySelector('.close-button') : null;
    const facilityStarRatingContainer = document.getElementById('facility-star-rating');
    const facilitySelectedStarsInput = document.getElementById('facility-selected-stars');
    const facilityReviewForm = document.getElementById('facility-review-form');

    if (openFacilityReviewModalBtn && facilityReviewModal && facilityCloseButton && facilityStarRatingContainer && facilitySelectedStarsInput && facilityReviewForm) {
        console.log('Facility modal elements found. Initializing modal interactions.');

        // 1. Mở Modal
        openFacilityReviewModalBtn.addEventListener('click', () => {
            console.log('Clicked "Thêm đánh giá cơ sở vật chất" button.');
            facilityReviewModal.style.display = 'block';
            facilitySelectedStarsInput.value = '0';
            Array.from(facilityStarRatingContainer.children).forEach(star => {
                star.classList.remove('selected');
                star.textContent = '☆';
            });
            facilityReviewForm.reset();
        });

        // 2. Đóng Modal khi click nút 'x'
        facilityCloseButton.addEventListener('click', () => {
            console.log('Clicked facility modal close button.');
            facilityReviewModal.style.display = 'none';
        });

        // 3. Đóng Modal khi click ra ngoài
        window.addEventListener('click', (event) => {
            if (event.target === facilityReviewModal) {
                console.log('Clicked outside facility modal.');
                facilityReviewModal.style.display = 'none';
            }
        });

        // 4. Xử lý logic chọn sao
        facilityStarRatingContainer.addEventListener('mouseover', (e) => {
            if (e.target.classList.contains('star')) {
                const hoverValue = parseInt(e.target.dataset.value);
                Array.from(facilityStarRatingContainer.children).forEach(star => {
                    const starValue = parseInt(star.dataset.value);
                    if (starValue <= hoverValue) {
                        star.textContent = '★';
                        star.classList.add('selected');
                    } else {
                        star.textContent = '☆';
                        star.classList.remove('selected');
                    }
                });
            }
        });

        facilityStarRatingContainer.addEventListener('click', (e) => {
            if (e.target.classList.contains('star')) {
                const clickedValue = parseInt(e.target.dataset.value);
                facilitySelectedStarsInput.value = clickedValue;
                console.log('Selected facility stars:', clickedValue);
                Array.from(facilityStarRatingContainer.children).forEach(star => {
                    const starValue = parseInt(star.dataset.value);
                    if (starValue <= clickedValue) {
                        star.textContent = '★';
                        star.classList.add('selected');
                    } else {
                        star.textContent = '☆';
                        star.classList.remove('selected');
                    }
                });
            }
        });

        facilityStarRatingContainer.addEventListener('mouseout', () => {
            const currentSelected = parseInt(facilitySelectedStarsInput.value);
            Array.from(facilityStarRatingContainer.children).forEach(star => {
                const starValue = parseInt(star.dataset.value);
                if (starValue <= currentSelected) {
                    star.textContent = '★';
                    star.classList.add('selected');
                } else {
                    star.textContent = '☆';
                    star.classList.remove('selected');
                }
            });
        });

        // 5. Xử lý gửi form đánh giá (giả lập)
        facilityReviewForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const stars = facilitySelectedStarsInput.value;
            const comment = document.getElementById('facility-review-comment').value;

            if (stars === '0' || comment.trim() === '') {
                alert('Vui lòng chọn số sao và nhập nhận xét của bạn.');
                return;
            }

            const pathSegments = window.location.pathname.split('/');
            const facilityIdIndex = pathSegments.indexOf('facility') + 1;
            const facilityId = parseInt(pathSegments[facilityIdIndex]);

            if (isNaN(facilityId)) {
                console.error('Không thể lấy Facility ID từ URL để gửi đánh giá.');
                alert('Có lỗi xảy ra: Không xác định được hạng mục.');
                return;
            }

            console.log(`Gửi đánh giá cho hạng mục ID ${facilityId}:`);
            console.log(`Số sao: ${stars}`);
            console.log(`Nhận xét: ${comment}`);

            // TRONG ỨNG DỤNG THỰC TẾ: Gửi dữ liệu này đến backend bằng fetch()
            // fetch(`/api/facilities/${facilityId}/reviews`, {
            //     method: 'POST',
            //     headers: { 'Content-Type': 'application/json' },
            //     body: JSON.stringify({ stars: parseInt(stars), comment: comment })
            // })
            // .then(response => {
            //     if (response.ok) return response.json();
            //     throw new Error('Network response was not ok.');
            // })
            // .then(data => {
            //     alert('Đánh giá của bạn đã được gửi thành công!');
            //     facilityReviewModal.style.display = 'none';
            //     facilityReviewForm.reset();
            //     facilitySelectedStarsInput.value = '0';
            //     window.location.reload(); // Tải lại trang để thấy đánh giá mới
            // })
            // .catch(error => {
            //     console.error('Lỗi khi gửi đánh giá:', error);
            //     alert('Có lỗi xảy ra khi gửi đánh giá.');
            // });

            alert('Cảm ơn bạn đã gửi đánh giá! (Đây là chức năng giả lập, cần tích hợp backend)');
            facilityReviewModal.style.display = 'none';
            facilityReviewForm.reset();
            facilitySelectedStarsInput.value = '0';
        });
    } else {
        console.log('This page does not contain facility modal elements or they are not fully loaded.');
    }
});
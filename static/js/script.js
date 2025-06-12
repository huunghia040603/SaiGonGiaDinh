document.addEventListener('DOMContentLoaded', () => {
    // Dữ liệu mẫu (trong thực tế sẽ lấy từ API/backend)
    const teachers = [
        {
            id: 1,
            name: "PGS. TS. Nguyễn Văn A",
            university: "Đại học Bách Khoa TP.HCM",
            avgRating: 4.8,
            totalReviews: 120,
            description: "Chuyên gia về Trí tuệ nhân tạo và Học máy. Giảng viên có kinh nghiệm lâu năm, phương pháp giảng dạy hiện đại, luôn cập nhật kiến thức mới và khuyến khích sinh viên tư duy phản biện."
        },
        {
            id: 2,
            name: "ThS. Trần Thị B",
            university: "Đại học Khoa học Tự nhiên TP.HCM",
            avgRating: 4.2,
            totalReviews: 85,
            description: "Giảng viên môn Lập trình Web và Phát triển Ứng dụng Di động. Cô B rất nhiệt tình, giải đáp mọi thắc mắc của sinh viên và có nhiều bài tập thực hành sát với thực tế."
        },
        {
            id: 3,
            name: "TS. Lê Thanh C",
            university: "Đại học Kinh tế TP.HCM",
            avgRating: 4.5,
            totalReviews: 95,
            description: "Chuyên ngành Tài chính và Đầu tư. Thầy C có phong cách giảng dạy lôi cuốn, cung cấp nhiều case study thú vị, giúp sinh viên hiểu rõ hơn về thị trường tài chính."
        },
        {
            id: 4,
            name: "ThS. Phạm Ngọc D",
            university: "Đại học Sư phạm TP.HCM",
            avgRating: 4.0,
            totalReviews: 70,
            description: "Giảng viên môn Phương pháp giảng dạy và Tâm lý học giáo dục. Cô D rất tận tâm với sinh viên, truyền đạt kiến thức một cách dễ hiểu và luôn tạo không khí học tập thoải mái."
        }
    ];

    const reviews = [
        {"id": 1, "teacherId": 1, "stars": 5, "comment": "Thầy A giảng bài rất dễ hiểu, nhiệt tình và luôn sẵn lòng giải đáp thắc mắc của sinh viên. Rất khuyến khích học môn này!", "date": "10/05/2024", "reviewer": "Sinh viên K20"},
        {"id": 2, "teacherId": 1, "stars": 3, "comment": "Nội dung bài giảng hơi nặng, cần bổ sung thêm ví dụ thực tế. Giảng viên có kiến thức tốt nhưng đôi khi khó theo kịp.", "date": "01/03/2024", "reviewer": "Sinh viên K19"},
        {"id": 3, "teacherId": 2, "stars": 4, "comment": "Cô B rất tận tâm và có nhiều bài tập thực hành hữu ích. Môn học thú vị!", "date": "22/04/2024", "reviewer": "Sinh viên K21"},
        {"id": 4, "teacherId": 3, "stars": 5, "comment": "Thầy C có kiến thức sâu rộng và truyền đạt rất lôi cuốn. Học được nhiều điều mới lạ.", "date": "15/05/2024", "reviewer": "Sinh viên K20"},
        {"id": 5, "teacherId": 4, "stars": 4, "comment": "Cô D tạo không khí học tập thoải mái. Môn học giúp ích nhiều cho công việc sau này.", "date": "03/04/2024", "reviewer": "Sinh viên K22"},
    ];

    // Hàm để hiển thị sao
    const getStarsHtml = (rating) => {
        const fullStars = Math.floor(rating);
        const halfStar = rating % 1 >= 0.5 ? '★' : ''; // Sử dụng ký tự sao đầy cho nửa sao để đồng bộ
        const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);
        return '★'.repeat(fullStars) + halfStar + '☆'.repeat(emptyStars);
    };

    // --- Xử lý trên trang index.html ---
    const searchButton = document.getElementById('search-button');
    const searchInput = document.getElementById('search-input');
    const teacherListContainer = document.getElementById('teacher-list');

    // Hàm render danh sách giảng viên
    const renderTeachers = (teacherArr) => {
        if (!teacherListContainer) return; // Chỉ chạy nếu phần tử này tồn tại (tức là đang ở index.html)

        teacherListContainer.innerHTML = '';
        if (teacherArr.length === 0) {
            teacherListContainer.innerHTML = '<p style="text-align: center; color: var(--secondary-color);">Không tìm thấy giảng viên nào.</p>';
            return;
        }

        teacherArr.forEach(teacher => {
            const teacherCard = document.createElement('div');
            teacherCard.classList.add('teacher-card');
            // Cập nhật URL để khớp với định tuyến backend của bạn
            teacherCard.innerHTML = `
                <h3>${teacher.name}</h3>
                <p class="university">${teacher.university}</p>
                <div class="rating">
                    <span class="stars">${getStarsHtml(teacher.avgRating)}</span>
                    <span class="average-rating">${teacher.avgRating.toFixed(1)}</span> (${teacher.totalReviews} đánh giá)
                </div>
                <a href="/teacher/${teacher.id}" class="btn-view-detail">Xem chi tiết</a>
            `;
            teacherListContainer.appendChild(teacherCard);
        });
    };

    // Gọi lần đầu để hiển thị tất cả giảng viên nếu đang ở trang chủ
    if (teacherListContainer) {
        renderTeachers(teachers);
    }

    // Xử lý tìm kiếm trên trang chủ
    if (searchButton && searchInput) {
        searchButton.addEventListener('click', () => {
            const searchTerm = searchInput.value.toLowerCase();
            const filteredTeachers = teachers.filter(teacher =>
                teacher.name.toLowerCase().includes(searchTerm) ||
                teacher.university.toLowerCase().includes(searchTerm)
            );
            renderTeachers(filteredTeachers);
        });

        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                searchButton.click();
            }
        });
    }

    // --- Xử lý trên trang teacher-detail.html ---
    const urlParams = new URLSearchParams(window.location.search);
    // Để lấy ID giảng viên từ URL (ví dụ: /teacher/1), bạn cần parse URL khác
    // Nếu bạn đang dùng Flask với route '/teacher/<int:teacher_id>', thì ID sẽ nằm trong path, không phải query param.
    // Ví dụ, lấy ID từ path (nếu URL là '/teacher/1'):
    const pathSegments = window.location.pathname.split('/');
    const teacherIdIndex = pathSegments.indexOf('teacher') + 1; // Tìm vị trí của 'teacher' và lấy phần tử tiếp theo
    const teacherId = parseInt(pathSegments[teacherIdIndex]); // Chuyển đổi thành số nguyên

    // Log để kiểm tra giá trị teacherId
    console.log('Detected Teacher ID:', teacherId);

    if (!isNaN(teacherId)) { // Chỉ chạy nếu teacherId là một số hợp lệ
        const teacher = teachers.find(t => t.id === teacherId);

        if (teacher) {
            console.log('Teacher found:', teacher.name);

            // Cập nhật thông tin giảng viên trên trang
            const teacherNameElem = document.getElementById('teacher-name');
            const teacherUniversityElem = document.getElementById('teacher-university');
            const overallStarsElem = document.getElementById('overall-stars');
            const overallAverageRatingElem = document.getElementById('overall-average-rating');
            const totalReviewsElem = document.getElementById('total-reviews');
            const teacherDescriptionElem = document.getElementById('teacher-description');

            if (teacherNameElem) teacherNameElem.textContent = teacher.name;
            if (teacherUniversityElem) teacherUniversityElem.textContent = teacher.university;
            if (overallStarsElem) overallStarsElem.innerHTML = getStarsHtml(teacher.avgRating);
            if (overallAverageRatingElem) overallAverageRatingElem.textContent = teacher.avgRating.toFixed(1);
            if (totalReviewsElem) totalReviewsElem.textContent = teacher.totalReviews;
            if (teacherDescriptionElem) teacherDescriptionElem.textContent = teacher.description;

            // Load và hiển thị đánh giá
            const teacherReviews = reviews.filter(review => review.teacherId === teacherId);
            const reviewListContainer = document.getElementById('review-list');
            if (reviewListContainer) {
                reviewListContainer.innerHTML = ''; // Xóa các review mẫu trong HTML
                if (teacherReviews.length > 0) {
                    teacherReviews.forEach(review => {
                        const reviewCard = document.createElement('div');
                        reviewCard.classList.add('review-card');
                        reviewCard.innerHTML = `
                            <div class="review-header">
                                <span class="review-stars">${getStarsHtml(review.stars)}</span>
                                <span class="review-date">${review.date}</span>
                            </div>
                            <p class="review-comment">${review.comment}</p>
                            <p class="reviewer-name">- ${review.reviewer}</p>
                        `;
                        reviewListContainer.appendChild(reviewCard);
                    });
                } else {
                    reviewListContainer.innerHTML = '<p style="text-align: center; color: var(--secondary-color);">Chưa có đánh giá nào cho giảng viên này. Hãy là người đầu tiên!</p>';
                }
            }


            // --- XỬ LÝ MODAL THÊM ĐÁNH GIÁ ---
            const openReviewModalBtn = document.getElementById('open-review-modal');
            const reviewModal = document.getElementById('review-modal');
            const closeButton = document.querySelector('.modal-content .close-button'); // Nút đóng trên modal
            const starRatingContainer = document.getElementById('star-rating');
            const selectedStarsInput = document.getElementById('selected-stars');
            const reviewForm = document.getElementById('review-form');

            // Log để kiểm tra xem các phần tử modal có được tìm thấy không
            console.log('Modal elements check:');
            console.log('openReviewModalBtn:', openReviewModalBtn);
            console.log('reviewModal:', reviewModal);
            console.log('closeButton:', closeButton);
            console.log('starRatingContainer:', starRatingContainer);
            console.log('selectedStarsInput:', selectedStarsInput);
            console.log('reviewForm:', reviewForm);


            // 1. Mở Modal khi click nút "Thêm đánh giá của bạn"
            if (openReviewModalBtn && reviewModal) {
                openReviewModalBtn.addEventListener('click', () => {
                    console.log('Clicked "Thêm đánh giá của bạn" button.');
                    reviewModal.style.display = 'block'; // Hiển thị modal
                    // Reset trạng thái sao và input khi mở modal
                    selectedStarsInput.value = '0';
                    if (starRatingContainer) {
                        Array.from(starRatingContainer.children).forEach(star => {
                            star.classList.remove('selected');
                            star.textContent = '☆';
                        });
                    }
                    if (reviewForm) {
                        reviewForm.reset(); // Reset form nếu có
                    }
                });
            }

            // 2. Đóng Modal khi click nút 'x'
            if (closeButton && reviewModal) {
                closeButton.addEventListener('click', () => {
                    console.log('Clicked close button.');
                    reviewModal.style.display = 'none'; // Ẩn modal
                });
            }

            // 3. Đóng Modal khi click ra ngoài vùng modal-content
            if (reviewModal) {
                window.addEventListener('click', (event) => {
                    if (event.target == reviewModal) {
                        console.log('Clicked outside modal.');
                        reviewModal.style.display = 'none'; // Ẩn modal
                    }
                });
            }

            // 4. Xử lý logic chọn sao
            if (starRatingContainer && selectedStarsInput) {
                starRatingContainer.addEventListener('mouseover', (e) => {
                    if (e.target.classList.contains('star')) {
                        const hoverValue = parseInt(e.target.dataset.value);
                        Array.from(starRatingContainer.children).forEach(star => {
                            const starValue = parseInt(star.dataset.value);
                            if (starValue <= hoverValue) {
                                star.textContent = '★'; // Đầy sao
                                star.classList.add('selected');
                            } else {
                                star.textContent = '☆'; // Rỗng sao
                                star.classList.remove('selected');
                            }
                        });
                    }
                });

                starRatingContainer.addEventListener('click', (e) => {
                    if (e.target.classList.contains('star')) {
                        const clickedValue = parseInt(e.target.dataset.value);
                        selectedStarsInput.value = clickedValue; // Lưu giá trị sao đã chọn
                        console.log('Selected stars:', clickedValue);
                        // Cập nhật trạng thái sao sau khi click
                        Array.from(starRatingContainer.children).forEach(star => {
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

                starRatingContainer.addEventListener('mouseout', () => {
                    const currentSelected = parseInt(selectedStarsInput.value);
                    Array.from(starRatingContainer.children).forEach(star => {
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
            }

            // 5. Xử lý gửi form đánh giá (giả lập)
            if (reviewForm) {
                reviewForm.addEventListener('submit', (e) => {
                    e.preventDefault(); // Ngăn chặn form submit truyền thống
                    const stars = selectedStarsInput.value;
                    const comment = document.getElementById('review-comment').value;

                    if (stars === '0' || comment.trim() === '') {
                        alert('Vui lòng chọn số sao và nhập nhận xét của bạn.');
                        return;
                    }

                    console.log(`Gửi đánh giá cho giảng viên ID ${teacherId}:`);
                    console.log(`Số sao: ${stars}`);
                    console.log(`Nhận xét: ${comment}`);

                    // Trong ứng dụng thực tế: Gửi dữ liệu này đến backend bằng fetch() hoặc XMLHttpRequest
                    // Ví dụ:
                    // fetch(`/api/teachers/${teacherId}/reviews`, {
                    //     method: 'POST',
                    //     headers: { 'Content-Type': 'application/json' },
                    //     body: JSON.stringify({ stars: parseInt(stars), comment: comment })
                    // })
                    // .then(response => response.json())
                    // .then(data => {
                    //     alert('Đánh giá của bạn đã được gửi thành công!');
                    //     reviewModal.style.display = 'none';
                    //     reviewForm.reset();
                    //     selectedStarsInput.value = '0';
                    //     // Có thể cập nhật UI với đánh giá mới
                    // })
                    // .catch(error => {
                    //     console.error('Lỗi khi gửi đánh giá:', error);
                    //     alert('Có lỗi xảy ra khi gửi đánh giá.');
                    // });

                    alert('Cảm ơn bạn đã gửi đánh giá! (Đây là chức năng giả lập)');
                    reviewModal.style.display = 'none'; // Đóng modal
                    reviewForm.reset(); // Reset form
                    selectedStarsInput.value = '0'; // Reset sao đã chọn
                    // Cập nhật lại giao diện hiển thị đánh giá (hoặc reload trang)
                    // (Bạn có thể thêm logic để thêm đánh giá mới vào reviewListContainer mà không cần reload trang)
                });
            }

        } else {
            console.error('Không tìm thấy giảng viên với ID này. Teacher ID:', teacherId);
            // Có thể chuyển hướng về trang chủ hoặc hiển thị thông báo lỗi
        }
    } else {
        console.log('Không phải trang chi tiết giảng viên hoặc Teacher ID không hợp lệ.');
    }
});
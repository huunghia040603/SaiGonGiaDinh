document.addEventListener('DOMContentLoaded', () => {
    // ... (Các khai báo DOM và hàm cho modal 02 không thay đổi) ...

    // --- Khai báo các phần tử DOM liên quan đến DANH SÁCH VÀ MODAL CHI TIẾT PHÒNG (02) ---
    const roomListContainer02 = document.getElementById('roomListContainer02');
    const roomDetailModal02 = document.getElementById('roomDetailModal02');
    const closeButton02 = document.querySelector('.close-button02'); // Nút đóng modal chi tiết phòng
    const detailMainImage02 = document.getElementById('detailMainImage02');
    const detailThumbnails02 = document.getElementById('detailThumbnails02');
    const detailTitle02 = document.getElementById('detailTitle02');
    const detailPrice02 = document.getElementById('detailPrice02');
    const detailSize02 = document.getElementById('detailSize02');
    const detailAddress02 = document.getElementById('detailAddress02');
    const detailDescription02 = document.getElementById('detailDescription02');
    const contactName02 = document.getElementById('contactName02');
    const contactPhone02 = document.getElementById('contactPhone02');
    const contactEmail02 = document.getElementById('contactEmail02');
    const detailFeatures02 = document.getElementById('detailFeatures02');
    const detailLocation02 = document.getElementById('detailLocation02');
    const detailRules02 = document.getElementById('detailRules02');
    const prevBtn02 = document.querySelector('.prev-btn02');
    const nextBtn02 = document.querySelector('.next-btn02');
    const showFavoritesBtn02 = document.getElementById('showFavoritesBtn02');
    const showAllRoomsBtn02 = document.getElementById('showAllRoomsBtn02');
    const favoriteCountSpan02 = document.getElementById('favoriteCount02');
    const searchBar02 = document.getElementById('searchBar02');
    const searchButton02 = document.getElementById('searchButton02');

    // Biến toàn cục để theo dõi ảnh hiện tại trong gallery (cho modal 02)
    let currentGalleryImages02 = [];
    let currentImageIndex02 = 0;

    // --- KHAI BÁO CÁC PHẦN TỬ DOM LIÊN QUAN ĐẾN MODAL ĐẶT PHÒNG (03) ---
    const bookingModal03 = document.getElementById('bookingModal03'); // ID của modal đặt phòng
    const closeBookingModal03 = document.querySelector('.close-booking-modal-button03'); // Class của nút đóng trong booking modal
    const bookingForm03 = document.getElementById('bookingForm03'); // ID của form đặt phòng

    // --- Hàm Helper: Load dữ liệu yêu thích từ Local Storage ---
    const loadFavorites02 = () => {
        const favorites = localStorage.getItem('favoriteRooms02');
        return favorites ? JSON.parse(favorites) : [];
    };

    // --- Hàm Helper: Lưu dữ liệu yêu thích vào Local Storage ---
    const saveFavorites02 = (favorites) => {
        localStorage.setItem('favoriteRooms02', JSON.stringify(favorites));
        updateFavoriteCount02();
    };

    // --- Hàm Helper: Cập nhật số lượng phòng yêu thích trên nút ---
    const updateFavoriteCount02 = () => {
        const favorites = loadFavorites02();
        favoriteCountSpan02.textContent = favorites.length;
    };

    // --- Hàm Render phòng trọ ra danh sách ---
    const renderRoomCard02 = (room) => {
        const isFavorite = loadFavorites02().includes(room.id);
        const statusClass = room.conPhong ? '' : 'out-of-stock02';
        const statusText = room.conPhong ? 'Còn phòng' : 'Hết phòng';
        const favoriteActiveClass = isFavorite ? 'active02' : '';
        const bookButtonDisabled = room.conPhong ? '' : 'disabled'; // Vô hiệu hóa nút nếu hết phòng
        const bookButtonText = room.conPhong ? 'Đặt phòng ngay' : 'Hết phòng'; // Text cho nút

        return `
            <div class="room-card02" data-id="${room.id}">
                <div class="card-image02">
                    <img src="${room.anhDaiDien}" alt="${room.tieuDe}">
                </div>
                <span class="status-badge02 ${statusClass}">${statusText}</span>
                <button class="favorite-button02 ${favoriteActiveClass}" data-id="${room.id}">
                    <i class="fas fa-heart"></i>
                </button>
                <div class="card-content02">
                    <h3 class="card-title02">${room.tieuDe}</h3>
                    <p class="card-price02">${room.gia}</p>
                    <div class="card-info02">
                        <span><i class="fas fa-expand-arrows-alt"></i> ${room.kichThuoc}</span>
                        <span><i class="fas fa-map-marker-alt"></i> ${room.diaChiNganGon}</span>
                    </div>
                    <button class="detail-button02" data-id="${room.id}">Xem chi tiết</button>
                    <button class="book-room-card-btn02 ${bookButtonDisabled}" data-id="${room.id}" ${bookButtonDisabled}>
                        <i class="fas fa-calendar-check"></i> ${bookButtonText}
                    </button>
                </div>
            </div>
        `;
    };

    // --- Hàm hiển thị danh sách phòng trọ ---
    const displayRooms02 = (roomsToDisplay) => {
        roomListContainer02.innerHTML = ''; // Clear existing rooms
        if (roomsToDisplay.length === 0) {
            roomListContainer02.innerHTML = '<p style="text-align: center; font-size: 1.2em; color: var(--secondary-color-02);">Không tìm thấy phòng trọ nào.</p>';
            return;
        }
        roomsToDisplay.forEach(room => {
            roomListContainer02.innerHTML += renderRoomCard02(room);
        });

        // Attach event listeners for favorite, detail, and booking buttons
        document.querySelectorAll('.favorite-button02').forEach(button => {
            button.addEventListener('click', toggleFavorite02);
        });
        document.querySelectorAll('.detail-button02').forEach(button => {
            button.addEventListener('click', showRoomDetail02);
        });
        // --- GẮN EVENT LISTENER CHO NÚT ĐẶT PHÒNG TRÊN TỪNG THẺ PHÒNG (sẽ mở modal 03) ---
        document.querySelectorAll('.book-room-card-btn02:not([disabled])').forEach(button => {
            button.addEventListener('click', (event) => {
                const roomId = event.currentTarget.dataset.id;
                console.log("Đang đặt phòng cho ID:", roomId); // Để debug
                showBookingModal03(roomId); // Gọi hàm hiển thị modal 03
            });
        });
    };

    // --- Hàm xử lý yêu thích/bỏ yêu thích ---
    const toggleFavorite02 = (event) => {
        const button = event.currentTarget;
        const roomId = button.dataset.id;
        let favorites = loadFavorites02();

        if (favorites.includes(roomId)) {
            // Remove from favorites
            favorites = favorites.filter(id => id !== roomId);
            button.classList.remove('active02');
        } else {
            // Add to favorites
            favorites.push(roomId);
            button.classList.add('active02');
        }
        saveFavorites02(favorites);
    };

    // --- Hàm hiển thị chi tiết phòng trọ (Modal 02) ---
    const showRoomDetail02 = (event) => {
        const roomId = event.currentTarget.dataset.id;
        const room = duLieuPhongTro02.find(r => r.id === roomId);

        if (!room) {
            console.error('Không tìm thấy phòng trọ với ID:', roomId);
            return;
        }

        // ẨN DANH SÁCH PHÒNG KHI HIỆN MODAL CHI TIẾT (02)
        // if (roomListContainer02) {
        //     roomListContainer02.style.display = 'none';
        // }

        // Cập nhật thông tin modal
        detailTitle02.textContent = room.tieuDe;
        detailPrice02.textContent = room.gia;
        detailSize02.textContent = room.kichThuoc;
        detailAddress02.textContent = room.diaChiNganGon;
        detailDescription02.textContent = room.moTaChiTiet;
        contactName02.textContent = room.thongTinLienHe.ten;
        contactPhone02.textContent = room.thongTinLienHe.sdt;
        contactEmail02.textContent = room.thongTinLienHe.email;
        detailLocation02.textContent = room.viTriTro;

        // Render đặc điểm phòng trọ
        detailFeatures02.innerHTML = '';
        room.dacDiemPhongTro.forEach(feature => {
            const li = document.createElement('li');
            li.textContent = feature;
            detailFeatures02.appendChild(li);
        });

        // Render nội quy cấm
        detailRules02.innerHTML = '';
        if (room.noiQuyCam && room.noiQuyCam.length > 0) {
            room.noiQuyCam.forEach(rule => {
                const li = document.createElement('li');
                li.textContent = rule;
                detailRules02.appendChild(li);
            });
        } else {
            detailRules02.innerHTML = '<li>Không có nội quy cấm cụ thể. Vui lòng giữ gìn vệ sinh chung và trật tự.</li>';
        }

        // Xử lý Gallery ảnh
        currentGalleryImages02 = room.anhChiTiet;
        currentImageIndex02 = 0;
        updateGallery02();

        roomDetailModal02.classList.add('show02'); // Giả sử modal 02 có class 'show02' để hiện
        
        // --- Đảm bảo không bị nhảy layout khi mở modal 02 ---
        // document.body.style.overflow = 'hidden';
        // document.body.style.paddingRight = getScrollbarWidth() + 'px'; // Thêm padding để bù trừ
    };

    // --- Hàm đóng Modal chi tiết phòng (Modal 02) ---
    const hideRoomDetail02 = () => {
        roomDetailModal02.classList.remove('show02'); // Giả sử modal 02 có class 'show02' để ẩn
        
        // Đặt timeout để chờ animation kết thúc trước khi loại bỏ padding và hiện cuộn
        setTimeout(() => {
            // document.body.style.overflow = ''; // Cho phép cuộn trang chính trở lại
            // document.body.style.paddingRight = ''; // Xóa padding
            // HIỆN LẠI DANH SÁCH PHÒNG KHI ĐÓNG MODAL CHI TIẾT (02)
            // if (roomListContainer02) {
            //     roomListContainer02.style.display = 'block'; // Hoặc 'flex', 'grid' tùy cách bố trí
            // }
        }, 300); // 300ms = 0.3s, khớp với transition duration của modal 02
    };

    // --- Hàm cập nhật Gallery ảnh trong modal (02) ---
    const updateGallery02 = () => {
        if (currentGalleryImages02.length === 0) {
            detailMainImage02.src = 'https://via.placeholder.com/800x600/CCCCCC/555555?text=No+Image';
            detailThumbnails02.innerHTML = '';
            prevBtn02.style.display = 'none';
            nextBtn02.style.display = 'none';
            return;
        }

        detailMainImage02.src = currentGalleryImages02[currentImageIndex02];

        detailThumbnails02.innerHTML = '';
        currentGalleryImages02.forEach((imageSrc, index) => {
            const img = document.createElement('img');
            img.src = imageSrc;
            img.alt = `Thumbnail ${index + 1}`;
            img.classList.add('thumbnail-item02');
            if (index === currentImageIndex02) {
                img.classList.add('active-thumb02');
            }
            img.addEventListener('click', () => {
                currentImageIndex02 = index;
                updateGallery02();
            });
            detailThumbnails02.appendChild(img);
        });

        // Ẩn/hiện nút điều hướng nếu chỉ có 1 ảnh
        if (currentGalleryImages02.length <= 1) {
            prevBtn02.style.display = 'none';
            nextBtn02.style.display = 'none';
        } else {
            prevBtn02.style.display = 'block';
            nextBtn02.style.display = 'block';
        }
    };

    // --- Hàm điều hướng ảnh trong Gallery (Prev/Next) của modal 02 ---
    const navigateGallery02 = (direction) => {
        currentImageIndex02 += direction;
        if (currentImageIndex02 < 0) {
            currentImageIndex02 = currentGalleryImages02.length - 1;
        } else if (currentImageIndex02 >= currentGalleryImages02.length) {
            currentImageIndex02 = 0;
        }
        updateGallery02();
    };

    // --- Hàm lọc phòng trọ theo yêu thích ---
    const displayFavorites02 = () => {
        const favoriteIds = loadFavorites02();
        const favoriteRooms = duLieuPhongTro02.filter(room => favoriteIds.includes(room.id));
        displayRooms02(favoriteRooms);
        showFavoritesBtn02.style.display = 'none';
        showAllRoomsBtn02.style.display = 'inline-flex'; // Show the "Show All" button
    };

    // --- Hàm hiển thị tất cả phòng trọ ---
    const displayAllRooms02 = () => {
        displayRooms02(duLieuPhongTro02);
        showFavoritesBtn02.style.display = 'inline-flex';
        showAllRoomsBtn02.style.display = 'none'; // Hide the "Show All" button
    };

    // --- Hàm tìm kiếm phòng trọ ---
    const searchRooms02 = () => {
        const searchTerm = searchBar02.value.toLowerCase().trim();
        if (!searchTerm) {
            displayAllRooms02(); // Nếu ô tìm kiếm trống, hiển thị tất cả
            return;
        }

        const filteredRooms = duLieuPhongTro02.filter(room => {
            // Tìm kiếm trong tiêu đề, địa chỉ, mô tả, đặc điểm, vị trí
            return room.tieuDe.toLowerCase().includes(searchTerm) ||
                   room.diaChiNganGon.toLowerCase().includes(searchTerm) ||
                   room.moTaChiTiet.toLowerCase().includes(searchTerm) ||
                   room.viTriTro.toLowerCase().includes(searchTerm) ||
                   room.dacDiemPhongTro.some(feature => feature.toLowerCase().includes(searchTerm));
        });
        displayRooms02(filteredRooms);
    };

    // --- Hàm tính toán chiều rộng của thanh cuộn ---
    // Điều này là cần thiết để bù đắp khi ẩn/hiện thanh cuộn, tránh nhảy layout
    const getScrollbarWidth = () => {
        // Tạo một div tạm thời
        const outer = document.createElement('div');
        outer.style.visibility = 'hidden';
        outer.style.overflow = 'scroll'; // Sẽ có thanh cuộn
        document.body.appendChild(outer);

        // Tạo một div bên trong
        const inner = document.createElement('div');
        outer.appendChild(inner);

        // Chiều rộng của thanh cuộn = chiều rộng outer - chiều rộng inner
        const scrollbarWidth = outer.offsetWidth - inner.offsetWidth;

        // Xóa div tạm thời
        outer.parentNode.removeChild(outer);

        return scrollbarWidth;
    };


    // --- CÁC HÀM ĐỂ ĐIỀU KHIỂN MODAL ĐẶT PHÒNG (03) ---
    const showBookingModal03 = (roomId) => {
        if (bookingModal03) {
            // Bước 1: Đặt display: block để modal chiếm không gian và sẵn sàng cho transition
            bookingModal03.style.display = 'block'; 
            
            // Bước 2: Dùng setTimeout nhỏ để đảm bảo trình duyệt đã render display: block
            // trước khi thêm class 'show'. Điều này cho phép transition chạy mượt mà.
            setTimeout(() => { 
                bookingModal03.classList.add('show');
            }, 10); // 10ms là đủ nhanh để không thấy độ trễ

            // --- Khắc phục lỗi nhảy layout: Thêm padding vào body để bù trừ chiều rộng scrollbar ---
            // document.body.style.overflow = 'hidden'; // Ngăn cuộn trang chính
            document.body.style.paddingRight = getScrollbarWidth() + 'px'; // Thêm padding

            // ẨN DANH SÁCH PHÒNG KHI MODAL ĐẶT PHÒNG (03) HIỆN (nếu cần)
            // if (roomListContainer02) {
            //     roomListContainer02.style.display = 'none';
            // }
            // Nếu bạn muốn điền sẵn thông tin phòng vào form (ví dụ: roomId vào input ẩn)
            // const bookingRoomIdInput = document.getElementById('bookingRoomIdHiddenField'); 
            // if (bookingRoomIdInput) {
            //     bookingRoomIdInput.value = roomId;
            // }
        }
    };

    const hideBookingModal03 = () => {
        if (bookingModal03) {
            // Bước 1: Xóa class 'show' để kích hoạt transition ngược lại (mờ dần, trượt xuống)
            bookingModal03.classList.remove('show');
            
            // Bước 2: Đặt timeout để chờ transition kết thúc (phải khớp với CSS transition duration)
            setTimeout(() => {
                bookingModal03.style.display = 'none'; // Ẩn hoàn toàn sau animation
                // --- Khắc phục lỗi nhảy layout: Xóa padding và cho phép cuộn trở lại ---
                // document.body.style.overflow = ''; // Cho phép cuộn trang chính trở lại
                document.body.style.paddingRight = ''; // Xóa padding
                
                // HIỆN LẠI DANH SÁCH PHÒNG KHI MODAL ĐẶT PHÒNG (03) ẨN (nếu cần)
                // if (roomListContainer02) {
                //     roomListContainer02.style.display = 'block'; // Hoặc 'flex', 'grid' tùy cách bố trí
                // }
            }, 300); // 300ms = 0.3s, khớp với `transition` trong CSS
        }
    };


    // --- Event Listeners (chung và cho modal 02) ---
    closeButton02.addEventListener('click', hideRoomDetail02); // Đóng modal chi tiết (02)
    window.addEventListener('click', (event) => {
        if (event.target === roomDetailModal02) {
            hideRoomDetail02();
        }
    });

    prevBtn02.addEventListener('click', () => navigateGallery02(-1));
    nextBtn02.addEventListener('click', () => navigateGallery02(1));

    showFavoritesBtn02.addEventListener('click', displayFavorites02);
    showAllRoomsBtn02.addEventListener('click', displayAllRooms02);

    searchButton02.addEventListener('click', searchRooms02);
    searchBar02.addEventListener('keypress', (event) => {
        if (event.key === 'Enter') {
            searchRooms02();
        }
    });


    // --- THÊM EVENT LISTENERS CHO MODAL ĐẶT PHÒNG (03) ---
    if (closeBookingModal03) { 
        closeBookingModal03.addEventListener('click', hideBookingModal03);
    }

    // Đóng modal 03 khi click ra ngoài vùng content
    window.addEventListener('click', (event) => {
        if (event.target === bookingModal03) {
            hideBookingModal03();
        }
    });

    // Xử lý gửi form đặt phòng (ví dụ)
    if (bookingForm03) { 
        bookingForm03.addEventListener('submit', (event) => {
            event.preventDefault();
            // Lấy dữ liệu form và xử lý (gửi AJAX, console.log...)
            const formData = new FormData(bookingForm03);
            const bookingData = Object.fromEntries(formData.entries());
            console.log('Dữ liệu đặt phòng:', bookingData);
            alert('Yêu cầu đặt phòng của bạn đã được gửi!');
            bookingForm03.reset(); // Đặt lại form
            hideBookingModal03(); // Đóng modal 03 sau khi gửi
        });
    }


    // --- Khởi tạo ban đầu ---
    displayAllRooms02(); // Hiển thị tất cả phòng khi tải trang
    updateFavoriteCount02(); // Cập nhật số lượng yêu thích
});
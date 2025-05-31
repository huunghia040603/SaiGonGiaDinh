document.addEventListener('DOMContentLoaded', function () {
    // Thông tin chi tiết cho từng ngành
    const majorDetails = {
        'kinh-te': {
            title: 'KINH TẾ - TÀI CHÍNH',
            details: [
                'KẾ TOÁN DOANH NGHIỆP',
                'QUẢN TRỊ KINH DOANH',
                'TÀI CHÍNH - NGÂN HÀNG',
                'THƯƠNG MẠI ĐIỆN TỬ',
                'LOGISTICS'
            ]
        },
        'thu-y': {
            title: 'THÚ Y - CHĂN NUÔI',
            details: [
                'THÚ Y'

            ]
        },
        'cong-nghe': {
            title: 'CÔNG NGHỆ - KỸ THUẬT',
            details: [
                'CÔNG NGHỆ THÔNG TIN',
                '  + QUẢN TRỊ CƠ SỞ DỮ LIỆU ',
                '  + THIẾT KẾ ĐỒ HOẠ',
                '  + LẬP TRÌNH MÁY TÍNH',
                'CÔNG NGHỆ Ô TÔ',
                'CÔNG NGHỆ THỰC PHẨM'
            ]
        },
        'y-duoc': {
            title: 'Y - DƯỢC',
            details: [
                'DƯỢC',
                'ĐIỀU DƯỠNG',
                'Y SĨ ĐA KHOA',
                'KỸ THUẬT PHỤC HÌNH RĂNG ( Răng - Hàm - Mặt )',
                'KỸ THUẬT PHỤC HỒI CHỨC NĂNG ( Vật lý trị liệu & Phục hồi chức năng )',
                'Y HỌC CỔ TRUYỀN'
            ]
        },
        'xa-hoi': {
            title: 'XÃ HỘI - DU LỊCH - PHÁP LUẬT',
            details: [
                'DU LỊCH',
                'Hướng dẫn du lịch',
                'Quản trị nhà hàng - Khách sạn',
                'NGÔN NGỮ ANH',
                'LUẬT - DỊCH VỤ PHÁP LÝ',
                'SƯ PHẠM MẦM NON *'
            ]
        },
        'van-hoa': {
            title: 'VĂN HOÁ THPT 9+',
            details: [
                'Chương trình văn hóa THPT',
                'Kỹ năng mềm',
                'Định hướng nghề nghiệp',
                'Ngoại ngữ tăng cường',
                'Tin học ứng dụng'
            ]
        }
    };

    // Wrap existing content in card-front and add card-back
    const serviceCards = document.querySelectorAll('.service-card');
    serviceCards.forEach((card, index) => {
        // Get the major key based on index
        const majorKey = Object.keys(majorDetails)[index];
        const majorInfo = majorDetails[majorKey];

        // Store original content
        const originalContent = card.innerHTML;

        // Create card inner structure
        const cardInner = document.createElement('div');
        cardInner.className = 'card-inner';

        // Create front of card
        const cardFront = document.createElement('div');
        cardFront.className = 'card-front';
        cardFront.innerHTML = originalContent;

        // Create back of card
        const cardBack = document.createElement('div');
        cardBack.className = 'card-back';

        // Create details content
        const detailsContent = document.createElement('div');
        detailsContent.className = 'card-details';
        detailsContent.innerHTML = `
            <h3 class="detail-title">${majorInfo.title}</h3>
            <ul class="detail-list">
                ${majorInfo.details.map(detail => `<li>${detail}</li>`).join('')}
            </ul>
            <a href="#" class="learn-more-link">
                Tìm hiểu thêm <i class="fas fa-arrow-right"></i>
            </a>
        `;

        // Assemble the card
        cardBack.appendChild(detailsContent);
        cardInner.appendChild(cardFront);
        cardInner.appendChild(cardBack);
        card.innerHTML = '';
        card.appendChild(cardInner);
    });

    // Add hover effect for details
    document.querySelectorAll('.card-back').forEach(back => {
        back.addEventListener('mouseenter', function () {
            this.querySelector('.card-details').style.opacity = '1';
            this.querySelector('.card-details').style.transform = 'translateY(0)';
        });
    });

    // Add touch support for mobile devices
    serviceCards.forEach(card => {
        card.addEventListener('touchstart', function (e) {
            e.preventDefault();
            const cardInner = this.querySelector('.card-inner');
            const isFlipped = cardInner.style.transform === 'rotateY(180deg)';

            // Reset all cards
            serviceCards.forEach(c => {
                c.querySelector('.card-inner').style.transform = 'rotateY(0deg)';
            });

            // Flip the touched card if it wasn't flipped
            if (!isFlipped) {
                cardInner.style.transform = 'rotateY(180deg)';
            }
        });
    });

    // Prevent card flip animation on window resize
    let resizeTimer;
    window.addEventListener('resize', function () {
        document.body.classList.add('resize-animation-stopper');
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
            document.body.classList.remove('resize-animation-stopper');
        }, 400);
    });

    // Initialize AOS
    AOS.init({
        duration: 1000,
        once: true,
        offset: 100
    });

    // Handle major card clicks for redirection
    const majorCards = document.querySelectorAll('.major-card');
    majorCards.forEach(card => {
        const link = card.querySelector('.major-link');
        if (link) {
            const href = link.getAttribute('href');
            card.style.cursor = 'pointer';
            
            // Add click event to the entire card
            card.addEventListener('click', function(e) {
                // Prevent default behavior if clicking on the link itself
                if (e.target.closest('.major-link')) {
                    e.preventDefault();
                }
                window.location.href = href;
            });

            // Prevent card flip on mobile when intending to navigate
            card.addEventListener('touchstart', function(e) {
                e.preventDefault();
                window.location.href = href;
            });
        }
    });

    // Animation for major cards
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('fade-up', 'active');
            }
        });
    }, {
        threshold: 0.1
    });

    // Observe each major card for animations
    majorCards.forEach((card, index) => {
        card.style.transitionDelay = `${index * 0.1}s`;
        observer.observe(card);

        // Mouse enter animation for image
        card.addEventListener('mouseenter', function() {
            const img = this.querySelector('.major-front img');
            if (img) {
                img.style.transform = 'scale(1.1)';
            }
        });

        // Mouse leave animation for image
        card.addEventListener('mouseleave', function() {
            const img = this.querySelector('.major-front img');
            if (img) {
                img.style.transform = 'scale(1)';
            }
        });
    });

    // Smooth scroll for major links
    document.querySelectorAll('.major-link').forEach(link => {
        link.addEventListener('click', function (e) {
            e.preventDefault();
            const href = this.getAttribute('href');
            const offsetTop = document.querySelector(href).offsetTop;

            scroll({
                top: offsetTop,
                behavior: "smooth"
            });
        });
    });
});

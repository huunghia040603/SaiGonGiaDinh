document.addEventListener('DOMContentLoaded', function () {
    const slider = document.querySelector('.slides');
    const slides = document.querySelectorAll('.slide');
    const dots = document.querySelectorAll('.dot');
    const prevBtn = document.querySelector('.prev-btn');
    const nextBtn = document.querySelector('.next-btn');

    let currentSlide = 0;
    const totalSlides = slides.length;
    let autoSlideInterval;

    // Function to move to specific slide
    function goToSlide(index) {
        if (index < 0) {
            currentSlide = totalSlides - 1;
        } else if (index >= totalSlides) {
            currentSlide = 0;
        } else {
            currentSlide = index;
        }

        // Update slider position
        slider.style.transform = `translateX(-${currentSlide * 33.333}%)`;

        // Update dots
        dots.forEach((dot, i) => {
            dot.classList.toggle('active', i === currentSlide);
        });
    }

    // Next slide function
    function nextSlide() {
        goToSlide(currentSlide + 1);
    }

    // Previous slide function
    function prevSlide() {
        goToSlide(currentSlide - 1);
    }

    // Auto slide function
    function startAutoSlide() {
        stopAutoSlide(); // Clear any existing interval
        autoSlideInterval = setInterval(nextSlide, 3000); // Changed from 5000 to 3000 (3 seconds)
    }

    // Stop auto slide
    function stopAutoSlide() {
        if (autoSlideInterval) {
            clearInterval(autoSlideInterval);
        }
    }

    // Event Listeners
    prevBtn.addEventListener('click', () => {
        prevSlide();
        startAutoSlide(); // Reset timer after manual navigation
    });

    nextBtn.addEventListener('click', () => {
        nextSlide();
        startAutoSlide(); // Reset timer after manual navigation
    });

    // Dot navigation
    dots.forEach((dot, index) => {
        dot.addEventListener('click', () => {
            goToSlide(index);
            startAutoSlide(); // Reset timer after manual navigation
        });
    });

    // Touch events for mobile swipe
    let touchStartX = 0;
    let touchEndX = 0;

    // slider.addEventListener('touchstart', (e) => {
    //     touchStartX = e.touches[0].clientX;
    //     stopAutoSlide();
    // }, false);

    slider.addEventListener('touchmove', (e) => {
        touchEndX = e.touches[0].clientX;
    }, false);

    slider.addEventListener('touchend', () => {
        const swipeDistance = touchEndX - touchStartX;
        if (Math.abs(swipeDistance) > 50) { // Minimum swipe distance
            if (swipeDistance > 0) {
                prevSlide();
            } else {
                nextSlide();
            }
        }
        startAutoSlide();
    }, false);

    // // Pause auto-slide when mouse is over the slider
    slider.addEventListener('mouseenter', stopAutoSlide);
    slider.addEventListener('mouseleave', startAutoSlide);

    // Start auto-sliding
    startAutoSlide();
}); 
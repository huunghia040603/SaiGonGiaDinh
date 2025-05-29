document.addEventListener('DOMContentLoaded', function () {
    // Initialize AOS
    AOS.init({
        duration: 800,
        once: true,
        offset: 50
    });

    // Basic image loading
    const images = document.querySelectorAll('.about-image');
    images.forEach(img => {
        // Create new image object to preload
        const tempImage = new Image();
        tempImage.src = img.src;

        // Handle error
        tempImage.onerror = function () {
            img.src = '/static/images/placeholder.jpg';
        };
    });

    // Smooth scroll for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}); 
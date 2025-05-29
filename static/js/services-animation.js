document.addEventListener('DOMContentLoaded', function () {
    // Initialize animation on scroll
    const animateOnScroll = () => {
        const cards = document.querySelectorAll('.service-card');
        const header = document.querySelector('.services-header');

        // Animate header elements
        if (header && isInViewport(header)) {
            const title = header.querySelector('.services-title');
            const intro = header.querySelector('.services-intro');

            if (title) title.classList.add('slide-in-left', 'active');
            if (intro) intro.classList.add('slide-in-right', 'active');
        }

        // Animate cards with delay
        cards.forEach((card, index) => {
            if (isInViewport(card)) {
                setTimeout(() => {
                    card.classList.add('fade-up', 'active');
                }, index * 100); // 100ms delay between each card
            }
        });
    };

    // Check if element is in viewport
    const isInViewport = (element) => {
        const rect = element.getBoundingClientRect();
        return (
            rect.top <= (window.innerHeight || document.documentElement.clientHeight) * 0.8 &&
            rect.bottom >= 0 &&
            rect.left >= 0 &&
            rect.right <= (window.innerWidth || document.documentElement.clientWidth)
        );
    };

    // Add initial classes
    const cards = document.querySelectorAll('.service-card');
    cards.forEach(card => {
        card.classList.add('fade-up');
    });

    const title = document.querySelector('.services-title');
    const intro = document.querySelector('.services-intro');
    if (title) title.classList.add('slide-in-left');
    if (intro) intro.classList.add('slide-in-right');

    // Handle scroll events with throttling
    let ticking = false;
    window.addEventListener('scroll', () => {
        if (!ticking) {
            window.requestAnimationFrame(() => {
                animateOnScroll();
                ticking = false;
            });
            ticking = true;
        }
    });

    // Initial check for elements in viewport
    animateOnScroll();

    // Add hover effects for service cards
    cards.forEach(card => {
        card.addEventListener('mouseenter', () => {
            const link = card.querySelector('.service-link');
            if (link) {
                link.style.transform = 'translateX(10px)';
            }
        });

        card.addEventListener('mouseleave', () => {
            const link = card.querySelector('.service-link');
            if (link) {
                link.style.transform = 'translateX(0)';
            }
        });
    });
}); 
document.addEventListener('DOMContentLoaded', function () {
    // Counter animation function
    function animateCounter(element, target) {
        let current = 0;
        const increment = target / 50; // Divide animation into 50 steps
        const duration = 2000; // 2 seconds
        const stepTime = duration / 50;

        // Set initial state
        if (target === 100) {
            element.innerHTML = `0<span class="percent-sign">%</span>`;
        } else {
            element.innerHTML = `0<span class="plus-sign">+</span>`;
        }

        const timer = setInterval(() => {
            current += increment;
            if (current >= target) {
                if (target === 100) {
                    element.innerHTML = `${Math.round(target)}<span class="percent-sign">%</span>`;
                } else {
                    element.innerHTML = `${Math.round(target)}<span class="plus-sign">+</span>`;
                }
                clearInterval(timer);
            } else {
                if (target === 100) {
                    element.innerHTML = `${Math.round(current)}<span class="percent-sign">%</span>`;
                } else {
                    element.innerHTML = `${Math.round(current)}<span class="plus-sign">+</span>`;
                }
            }
        }, stepTime);
    }

    // Start counter animations when elements are visible
    const observerOptions = {
        root: null,
        threshold: 0.1,
        rootMargin: "0px"
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const counter = entry.target;
                counter.textContent = counter.textContent.replace(/[+%]/g, '');
                const target = parseInt(counter.textContent);
                animateCounter(counter, target);
                observer.unobserve(counter);
            }
        });
    }, observerOptions);

    // Observe counter elements
    document.querySelectorAll('.counter').forEach(counter => {
        observer.observe(counter);
    });

    // Worker Image Animation
    const workerContainer = document.querySelector('.worker-image-container');
    if (workerContainer) {
        const imageObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    // Add slide-in class when the element is visible
                    setTimeout(() => {
                        workerContainer.classList.add('slide-in');
                    }, 100); // Small delay for better visual effect
                    imageObserver.unobserve(workerContainer);
                }
            });
        }, {
            threshold: 0.2, // Trigger when 20% of the element is visible
            rootMargin: '0px'
        });

        // Start observing the worker image container
        imageObserver.observe(workerContainer);
    }
}); 
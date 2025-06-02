document.addEventListener('DOMContentLoaded', () => {
    const pricingCards4 = document.querySelectorAll('.fade-in-on-scroll4');

    const observerOptions4 = {
        root: null, // Sử dụng viewport làm root
        rootMargin: '0px',
        threshold: 0.2 // Khi 20% của phần tử hiển thị trong viewport thì kích hoạt
    };

    const observerCallback4 = (entries4, observer4) => {
        entries4.forEach(entry4 => {
            if (entry4.isIntersecting) {
                entry4.target.classList.add('show4'); // Thêm class 'show4'
                observer4.unobserve(entry4.target); // Ngừng theo dõi sau khi đã thêm hiệu ứng
            }
        });
    };

    const observer4 = new IntersectionObserver(observerCallback4, observerOptions4);

    pricingCards4.forEach(card4 => {
        observer4.observe(card4);
    });
});
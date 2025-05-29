document.addEventListener('DOMContentLoaded', function () {
    // Mobile menu functionality
    const initMobileMenu = () => {
        const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
        const nav = document.querySelector('.main-nav');

        if (mobileMenuBtn) {
            mobileMenuBtn.addEventListener('click', () => {
                nav.classList.toggle('mobile-menu-open');
            });
        }
    };

    // Dropdown menu functionality for mobile
    const initDropdowns = () => {
        const dropdownToggles = document.querySelectorAll('.dropdown-toggle');

        dropdownToggles.forEach(toggle => {
            toggle.addEventListener('click', (e) => {
                if (window.innerWidth <= 768) {
                    e.preventDefault();
                    const dropdown = toggle.parentElement;
                    const dropdownMenu = dropdown.querySelector('.dropdown-menu');

                    // Close other dropdowns
                    document.querySelectorAll('.dropdown-menu.show').forEach(menu => {
                        if (menu !== dropdownMenu) {
                            menu.classList.remove('show');
                        }
                    });

                    // Toggle current dropdown
                    dropdownMenu.classList.toggle('show');
                }
            });
        });
    };

    // Search functionality
    const initSearch = () => {
        const searchBox = document.querySelector('.search-box');
        const searchInput = searchBox.querySelector('input');
        const searchButton = searchBox.querySelector('button');

        // Focus effects
        searchInput.addEventListener('focus', () => {
            searchBox.classList.add('focused');
        });

        searchInput.addEventListener('blur', () => {
            searchBox.classList.remove('focused');
        });

        // Search form submission
        searchBox.addEventListener('submit', (e) => {
            e.preventDefault();
            const query = searchInput.value.trim();
            if (query) {
                window.location.href = `/search?q=${encodeURIComponent(query)}`;
            }
        });
    };

    // Fixed header on scroll
    const initScrollEffects = () => {
        let lastScroll = 0;
        const header = document.querySelector('.header');
        const nav = document.querySelector('.main-nav');
        const topBar = document.querySelector('.top-bar');

        window.addEventListener('scroll', () => {
            const currentScroll = window.pageYOffset;
            const headerHeight = header.offsetHeight + topBar.offsetHeight;

            if (currentScroll > headerHeight) {
                nav.classList.add('fixed');
                if (currentScroll > lastScroll) {
                    // Scrolling down
                    header.style.transform = 'translateY(-100%)';
                    topBar.style.transform = 'translateY(-100%)';
                } else {
                    // Scrolling up
                    header.style.transform = 'translateY(0)';
                    topBar.style.transform = 'translateY(0)';
                }
            } else {
                nav.classList.remove('fixed');
                header.style.transform = 'translateY(0)';
                topBar.style.transform = 'translateY(0)';
            }

            lastScroll = currentScroll;
        });
    };

    // Close dropdowns when clicking outside
    const initClickOutside = () => {
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.dropdown')) {
                document.querySelectorAll('.dropdown-menu.show').forEach(menu => {
                    menu.classList.remove('show');
                });
            }
        });
    };

    // Initialize all features
    initMobileMenu();
    initDropdowns();
    initSearch();
    initScrollEffects();
    initClickOutside();
});

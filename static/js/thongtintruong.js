// services2.js

document.addEventListener('DOMContentLoaded', () => {
    const workerImage = document.querySelector('.worker-image2');
    const infoBoxes = document.querySelectorAll('.info-box2');
    // const mainContainer = document.querySelector('.main-container2');

    // Hàm để kiểm tra xem một phần tử có nằm trong viewport hay không
    const isElementInViewport = (el) => {
        const rect = el.getBoundingClientRect();
        return (
            rect.top <= (window.innerHeight || document.documentElement.clientHeight) &&
            rect.left <= (window.innerWidth || document.documentElement.clientWidth) &&
            rect.bottom >= 0 &&
            rect.right >= 0
        );
    };

    // Hàm xử lý khi cuộn trang
    const handleScroll = () => {
        // Lấy vị trí scroll của main-container2
        // const mainContainerRect = mainContainer.getBoundingClientRect();
        // const mainContainerTriggerPoint = mainContainerRect.top + mainContainerRect.height * 0.3; // Kích hoạt khi 30% container hiển thị

        // Hiệu ứng người công nhân
        // if (mainContainerTriggerPoint < (window.innerHeight || document.documentElement.clientHeight)) {
        //     workerImage.classList.add('slide-in');
        // } else {
        //     // Tùy chọn: nếu bạn muốn hiệu ứng reset khi cuộn ngược lên
        //     // workerImage.classList.remove('slide-in');
        // }

        // Hiệu ứng 3 ô thông tin
        // const infoBoxTriggerPoint = mainContainerRect.top + mainContainerRect.height * 0.5; // Kích hoạt khi 50% container hiển thị
        // if (infoBoxTriggerPoint < (window.innerHeight || document.documentElement.clientHeight)) {
        //     infoBoxes.forEach(box => {
        //         box.classList.add('fade-in');
        //     });
        // } else {
        //      // Tùy chọn: nếu bạn muốn hiệu ứng reset khi cuộn ngược lên
        //      // infoBoxes.forEach(box => {
        //      //     box.classList.remove('fade-in');
        //      // });
        // }
    };

    // Lắng nghe sự kiện cuộn
    window.addEventListener('scroll', handleScroll);

    // Chạy handleScroll một lần khi tải trang để xử lý nếu các phần tử đã nằm trong viewport ngay từ đầu
    handleScroll(); 
});
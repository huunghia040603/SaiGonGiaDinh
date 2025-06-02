document.addEventListener('DOMContentLoaded', function() {
    // Lấy tất cả các phần tử câu hỏi
    const faqQuestions3 = document.querySelectorAll('.faq-question3');

    // Mặc định câu hỏi đầu tiên được mở
    const firstFaqItem3 = document.querySelector('.faq-item3');
    if (firstFaqItem3) {
        firstFaqItem3.classList.add('active'); // Đặt lớp active cho item đầu tiên
        const firstAnswer3 = firstFaqItem3.querySelector('.faq-answer3');
        const firstAnswerP3 = firstAnswer3.querySelector('p');
        const firstToggle3 = firstFaqItem3.querySelector('.toggle-icon3');
        
        // Đảm bảo maxHeight được đặt đúng sau khi DOMContentLoaded
        requestAnimationFrame(() => {
            firstAnswer3.style.maxHeight = firstAnswer3.scrollHeight + 'px';
            firstAnswerP3.style.opacity = 1; // Hiện chữ
            firstAnswerP3.style.transform = 'translateY(0)'; // Dịch chữ về 0
        });
        firstToggle3.textContent = '-'; // Dấu trừ cho câu hỏi đầu tiên
    }

    faqQuestions3.forEach(question => {
        question.addEventListener('click', function() {
            // Lấy phần tử cha (faq-item3) của câu hỏi hiện tại
            const faqItem3 = this.closest('.faq-item3');

            // Lấy phần tử câu trả lời (faq-answer3) và biểu tượng (+/-)
            const faqAnswer3 = faqItem3.querySelector('.faq-answer3');
            const faqAnswerP3 = faqAnswer3.querySelector('p'); // Thêm để điều khiển <p> bên trong
            const toggleIcon3 = this.querySelector('.toggle-icon3');

            // Kiểm tra xem faq-item3 hiện tại có đang active không
            const isActive = faqItem3.classList.contains('active');

            // Đóng tất cả các faq-item3 khác trước khi mở cái mới
            document.querySelectorAll('.faq-item3.active').forEach(item => {
                if (item !== faqItem3) { // Đảm bảo không đóng chính nó
                    item.classList.remove('active');
                    const otherAnswer3 = item.querySelector('.faq-answer3');
                    const otherAnswerP3 = otherAnswer3.querySelector('p');
                    otherAnswer3.style.maxHeight = 0;
                    otherAnswerP3.style.opacity = 0; // Ẩn chữ
                    otherAnswerP3.style.transform = 'translateY(-10px)'; // Dịch chữ lên trên
                    item.querySelector('.toggle-icon3').textContent = '+'; // Đặt lại dấu cộng
                }
            });

            // Nếu câu hỏi hiện tại không active, thì active nó
            if (!isActive) {
                faqItem3.classList.add('active');
                faqAnswer3.style.maxHeight = faqAnswer3.scrollHeight + 'px'; // Đặt maxHeight động
                faqAnswerP3.style.opacity = 1; // Hiện chữ
                faqAnswerP3.style.transform = 'translateY(0)'; // Dịch chữ về 0
                toggleIcon3.textContent = '-'; // Thay đổi dấu + thành -
            } else {
                // Nếu đã active, thì đóng nó lại
                faqItem3.classList.remove('active');
                faqAnswer3.style.maxHeight = 0;
                faqAnswerP3.style.opacity = 0; // Ẩn chữ
                faqAnswerP3.style.transform = 'translateY(-10px)'; // Dịch chữ lên trên
                toggleIcon3.textContent = '+'; // Thay đổi dấu - thành +
            }
        });
    });
});
 document.addEventListener('DOMContentLoaded', () => {
            const chatToggle = document.getElementById('sgdg-chatbot-toggle');
            const chatWindow = document.getElementById('sgdg-chat-window');
            const closeChatButton = document.getElementById('sgdg-close-chat');
            const chatBox = document.getElementById('sgdg-chat-box');
            const userInput = document.getElementById('sgdg-user-input');
            const sendButton = document.getElementById('sgdg-send-button');
            const welcomePopup = document.getElementById('sgdg-welcome-popup'); // Lấy phần tử popup chào hỏi
            const welcomeCloseButton = welcomePopup.querySelector('.sgdg-welcome-close-button'); // Nút đóng popup

            let welcomePopupInterval; // Biến lưu trữ interval cho popup chào hỏi
            const WELCOME_POPUP_DISPLAY_TIME = 3000; // Thời gian chờ giữa các lần hiển thị popup (2 giây)

            // Hàm để thêm tin nhắn vào khung chat (không thay đổi nhiều, chỉ đảm bảo link hoạt động)
            function addMessage(sender, text) {
                const messageDiv = document.createElement('div');
                messageDiv.classList.add('sgdg-message');
                messageDiv.classList.add(sender === 'user' ? 'sgdg-user-message' : 'sgdg-bot-message');
                
                // Xử lý các đường link có thể nhấp được trong tin nhắn của bot
                if (sender === 'bot') {
                    const linkRegex = /(https?:\/\/[^\s]+|www\.[^\s]+)/g;
                    const formattedText = text.replace(linkRegex, (url) => {
                        let fullUrl = url;
                        if (!fullUrl.startsWith('http://') && !fullUrl.startsWith('https://')) {
                            fullUrl = 'http://' + fullUrl; // Đảm bảo URL có protocol để href hoạt động
                        }
                        return `<a href="${fullUrl}" target="_blank" style="color: #007bff; text-decoration: underline;">${url}</a>`;
                    });
                    messageDiv.innerHTML = formattedText; // Dùng innerHTML vì có thẻ <a>
                } else {
                    messageDiv.textContent = text;
                }
                
                chatBox.appendChild(messageDiv);
                chatBox.scrollTop = chatBox.scrollHeight;
            }

            // Hàm gửi tin nhắn đến backend
            async function sendMessage() {
                const message = userInput.value.trim();
                if (message === '') return;

                addMessage('user', message);
                userInput.value = '';

                // Ẩn popup chào hỏi ngay lập tức khi người dùng gửi tin nhắn
                hideWelcomePopup();
                // Dừng interval popup chào hỏi
                clearInterval(welcomePopupInterval);

                try {
                    // Địa chỉ của Flask server của bạn
                    const response = await fetch('http://127.0.0.1:5000/chat', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({ message: message })
                    });
                    const data = await response.json();
                    addMessage('bot', data.response);
                } catch (error) {
                    console.error('Error:', error);
                    addMessage('bot', 'Xin lỗi, tôi không thể kết nối với bot lúc này. Vui lòng thử lại sau.');
                }
            }

            // Hàm hiển thị popup chào hỏi
            function showWelcomePopup() {
                // Chỉ hiển thị nếu cửa sổ chat đang đóng và popup chưa active
                if (!chatWindow.classList.contains('sgdg-chat-window-active') && !welcomePopup.classList.contains('active')) {
                    welcomePopup.classList.add('active');
                    welcomePopup.classList.remove('hidden'); // Đảm bảo remove hidden class
                }
            }

            // Hàm ẩn popup chào hỏi
            function hideWelcomePopup() {
                welcomePopup.classList.remove('active');
                welcomePopup.classList.add('hidden'); // Thêm class hidden để kích hoạt hiệu ứng ẩn
            }

            // Hàm quản lý vòng lặp hiển thị popup chào hỏi
            function startWelcomePopupLoop() {
                // Dừng interval cũ để tránh trùng lặp
                clearInterval(welcomePopupInterval);

                welcomePopupInterval = setInterval(() => {
                    // Kiểm tra nếu chat window đang đóng
                    if (!chatWindow.classList.contains('sgdg-chat-window-active')) {
                        showWelcomePopup();
                        // Đặt hẹn giờ để ẩn popup sau một khoảng thời gian ngắn
                        setTimeout(() => {
                            hideWelcomePopup();
                        }, 5000); // Ẩn sau 5 giây hiển thị
                    } else {
                        // Nếu chat window đang mở, đảm bảo popup bị ẩn
                        hideWelcomePopup();
                    }
                }, WELCOME_POPUP_DISPLAY_TIME + 6000 + 2000); // Khoảng thời gian cho lần hiển thị tiếp theo
                // Công thức: WELCOME_POPUP_DISPLAY_TIME (2s) + thời gian popup hiển thị (5s) + thời gian nghỉ trước lần hiển thị mới (1s)
                // Tổng cộng mỗi ~8 giây, popup sẽ thử hiện lại nếu chat đóng
            }

            // --- Các sự kiện chính ---

            // Khởi tạo tin nhắn đầu tiên trong khung chat
            addMessage('bot', 'Chào mừng bạn đến với Cao đẳng Sài Gòn Gia Định. Tôi có thể giúp gì cho bạn?');
            
            // Bắt đầu vòng lặp hiển thị popup chào hỏi khi tải trang
            startWelcomePopupLoop();

            // Xử lý sự kiện khi click nút toggle để mở/đóng chatbot
            chatToggle.addEventListener('click', () => {
                chatWindow.classList.toggle('sgdg-chat-window-active');
                if (chatWindow.classList.contains('sgdg-chat-window-active')) {
                    userInput.focus();
                    // Ẩn popup chào hỏi khi chat được mở
                    hideWelcomePopup();
                    // Dừng vòng lặp hiển thị popup
                    clearInterval(welcomePopupInterval);
                } else {
                    // Bắt đầu lại vòng lặp khi chat đóng
                    startWelcomePopupLoop();
                }
            });

            // Xử lý sự kiện khi click nút đóng chatbot
            closeChatButton.addEventListener('click', () => {
                chatWindow.classList.remove('sgdg-chat-window-active');
                // Bắt đầu lại vòng lặp khi chat đóng
                startWelcomePopupLoop();
            });

            // Xử lý sự kiện khi click nút đóng trên popup chào hỏi
            welcomeCloseButton.addEventListener('click', () => {
                hideWelcomePopup();
                // Dừng interval hiện tại để nó không xuất hiện lại ngay lập tức
                clearInterval(welcomePopupInterval);
                // Bạn có thể đặt lại interval sau một thời gian dài hơn nếu muốn
                // Ví dụ: setTimeout(startWelcomePopupLoop, 30000); // Sau 30 giây mới bắt đầu lại
            });

            // Gửi tin nhắn khi nhấn nút Gửi
            sendButton.addEventListener('click', sendMessage);

            // Gửi tin nhắn khi nhấn Enter trong ô nhập liệu
            userInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    sendMessage();
                }
            });
        });
const FORGOT_PASSWORD_API = 'https://saigongiadinh.pythonanywhere.com/forgot-password/request-reset/';
const CHANGE_PASSWORD_API = 'https://saigongiadinh.pythonanywhere.com/forgot-password/confirm-reset/';

const forgotPasswordForm = document.getElementById('forgotPasswordForm');
const changePasswordForm = document.getElementById('changePasswordForm');
const requestFormDiv = document.getElementById('request-form');
const confirmFormDiv = document.getElementById('confirm-form');
const messageDiv = document.getElementById('message');

// Xử lý form gửi yêu cầu quên mật khẩu
forgotPasswordForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const submitButton = forgotPasswordForm.querySelector('button[type="submit"]');

    // Hiển thị hiệu ứng loading và vô hiệu hóa nút
    submitButton.textContent = 'Đang xử lý...';
    submitButton.disabled = true;
    submitButton.style.opacity = 0.7; // Giảm độ mờ để người dùng nhận biết nút đang bị vô hiệu hóa

    try {
        const response = await fetch(FORGOT_PASSWORD_API, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email: email })
        });

        const data = await response.json();

        if (response.ok) {
            showMessage(data.message, 'success');
            // Bạn có thể giữ nút disabled nếu muốn ngăn người dùng gửi lại yêu cầu
            // hoặc kích hoạt lại nếu muốn.
            // submitButton.disabled = false;
        } else {
            const errorMessage = data.email ? data.email[0] : 'Có lỗi xảy ra. Vui lòng thử lại.';
            showMessage(errorMessage, 'error');
        }
    } catch (error) {
        showMessage('Không thể kết nối đến máy chủ. Vui lòng kiểm tra lại.', 'error');
        console.error('Lỗi fetch:', error);
    } finally {
        // Luôn luôn khôi phục trạng thái ban đầu của nút sau khi request kết thúc
        submitButton.textContent = 'Gửi mật khẩu mới';
        submitButton.disabled = false;
        submitButton.style.opacity = 1;
    }
});

// Xử lý form đổi mật khẩu mới (dành cho người dùng đã đăng nhập)
changePasswordForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const oldPassword = document.getElementById('oldPassword').value;
    const newPassword = document.getElementById('newPassword').value;
    const confirmNewPassword = document.getElementById('confirmNewPassword').value;
    const submitButton = changePasswordForm.querySelector('button[type="submit"]');

    // Hiển thị hiệu ứng loading và vô hiệu hóa nút
    submitButton.textContent = 'Đang cập nhật...';
    submitButton.disabled = true;
    submitButton.style.opacity = 0.7;

    const accessToken = localStorage.getItem('access_token'); 

    if (!accessToken) {
        showMessage('Vui lòng đăng nhập để đổi mật khẩu.', 'error');
        submitButton.textContent = 'Cập Nhật Mật Khẩu';
        submitButton.disabled = false;
        submitButton.style.opacity = 1;
        return;
    }

    try {
        const response = await fetch(CHANGE_PASSWORD_API, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${accessToken}`
            },
            body: JSON.stringify({
                old_password: oldPassword,
                new_password: newPassword,
                confirm_new_password: confirmNewPassword
            })
        });

        const data = await response.json();

        if (response.ok) {
            showMessage(data.message, 'success');
            localStorage.removeItem('access_token');
        } else {
            const errorMessage = data.old_password ? data.old_password[0] : 'Có lỗi xảy ra. Vui lòng thử lại.';
            showMessage(errorMessage, 'error');
        }
    } catch (error) {
        showMessage('Không thể kết nối đến máy chủ. Vui lòng kiểm tra lại.', 'error');
        console.error('Lỗi fetch:', error);
    } finally {
        // Luôn luôn khôi phục trạng thái ban đầu của nút
        submitButton.textContent = 'Cập Nhật Mật Khẩu';
        submitButton.disabled = false;
        submitButton.style.opacity = 1;
    }
});


// Hàm hiển thị thông báo
function showMessage(msg, type) {
    messageDiv.textContent = msg;
    messageDiv.className = type;
}

function showChangePasswordForm() {
    requestFormDiv.classList.add('hidden');
    confirmFormDiv.classList.remove('hidden');
    showMessage('Bạn đã đăng nhập thành công. Vui lòng đổi mật khẩu mới.', 'success');
}
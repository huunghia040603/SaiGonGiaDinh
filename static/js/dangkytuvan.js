document.addEventListener('DOMContentLoaded', () => {
    const tourForm = document.getElementById('tourForm');
    const majorSelect = document.getElementById('major_of_interest_select');
    const graduatedSelect = document.getElementById('has_graduated_select');

    // Lấy các phần tử liên quan đến modal hướng dẫn nhập học
    const modal = document.getElementById('myModal_5');
    const closeButton = document.querySelector('.close-button_5');
    const understandButton = document.getElementById('understandButton_5');
    const body = document.body;
    const consultationSuccessMessageDiv = document.getElementById('consultation-success-message'); // Element mới

    // --- Hàm tải dữ liệu Ngành học từ API với caching ---
    async function loadMajors() {
        const majorsApiUrl = "https://saigongiadinh.pythonanywhere.com/Major/";
        const CACHE_KEY = 'cachedMajors';
        const CACHE_EXPIRY_TIME = 60 * 60 * 1000; // 1 giờ (milliseconds)

        const cachedData = localStorage.getItem(CACHE_KEY);
        if (cachedData) {
            try {
                const { data, timestamp } = JSON.parse(cachedData);
                if (Date.now() - timestamp < CACHE_EXPIRY_TIME) {
                 
                    populateMajorSelect(data);
                    return;
                } else {
                   
                    localStorage.removeItem(CACHE_KEY);
                }
            } catch (e) {
                console.error("Lỗi khi đọc cache Majors, sẽ fetch lại:");
                localStorage.removeItem(CACHE_KEY);
            }
        }

        try {
            const response = await fetch(majorsApiUrl);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const majors = await response.json();

            localStorage.setItem(CACHE_KEY, JSON.stringify({ data: majors, timestamp: Date.now() }));

            populateMajorSelect(majors);
        } catch (error) {
            console.error("Lỗi khi tải danh sách ngành học:", error);
            majorSelect.innerHTML = '<option value="">Không thể tải ngành học</option>';
            alert("Không thể tải danh sách ngành học. Vui lòng thử lại sau.");
        }
    }

    // --- Hàm điền dữ liệu vào dropdown ngành học ---
    function populateMajorSelect(majors) {
        majorSelect.innerHTML = '<option value="">Chọn ngành đăng ký</option>';
        majors.forEach(major => {
            const option = document.createElement('option');
            option.value = major.id;
            option.textContent = major.name;
            majorSelect.appendChild(option);
        });
    }

    // --- Hàm tải dữ liệu Trình độ Tốt nghiệp (giữ nguyên hardcode) ---
    async function loadGraduatedChoices() {
        const graduatedChoices = [
            { key: 'THCS', value: 'Trung học cơ sở' },
            { key: 'THPT', value: 'Trung học phổ thông' },
            { key: 'TC', value: 'Trung cấp' },
            { key: 'CD', value: 'Cao đẳng' },
            { key: 'DH', value: 'Đại học' },
        ];

        graduatedSelect.innerHTML = '<option value="">Chọn Bạn Đã Tốt Nghiệp</option>';
        graduatedChoices.forEach(choice => {
            const option = document.createElement('option');
            option.value = choice.key;
            option.textContent = choice.value;
            graduatedSelect.appendChild(option);
        });
    }

    // --- Gọi các hàm tải dữ liệu khi trang được tải ---
    loadMajors();
    loadGraduatedChoices();

    // --- Hàm mở modal (Đã chỉnh sửa để chấp nhận thông báo) ---
    function openModal(message = '') {
        if (message) {
            consultationSuccessMessageDiv.textContent = message; // Đặt thông báo vào đây
        } else {
            consultationSuccessMessageDiv.textContent = ''; // Xóa thông báo nếu không có
        }
        modal.style.display = 'flex';
        body.classList.add('modal-open_5');
        setTimeout(() => {
            modal.classList.add('active_5');
        }, 10);
    }

    // Hàm đóng modal (không thay đổi)
    function closeModal() {
        modal.classList.remove('active_5');
        modal.addEventListener('transitionend', function handler() {
            modal.style.display = 'none';
            body.classList.remove('modal-open_5');
            modal.removeEventListener('transitionend', handler);
        }, { once: true });
    }

    // Gán sự kiện cho nút đóng modal (x trên góc)
    if (closeButton) {
        closeButton.addEventListener('click', closeModal);
    }

    // Gán sự kiện cho nút "Tôi đã hiểu"
    if (understandButton) {
        understandButton.addEventListener('click', closeModal);
    }

    // Gán sự kiện đóng modal khi nhấp ra ngoài
    window.addEventListener('click', function(event) {
        if (event.target === modal) {
            closeModal();
        }
    });

    // Gán sự kiện đóng modal khi nhấn phím Esc
    document.addEventListener('keydown', function(event) {
        if (event.key === 'Escape' && modal.classList.contains('active_5')) {
            closeModal();
        }
    });

    // --- Xử lý sự kiện gửi form ---
    if (tourForm) {
        tourForm.addEventListener('submit', async (event) => {
            event.preventDefault(); // Ngăn chặn hành vi gửi form mặc định

            const submitBtn = document.getElementById('submitConsultationBtn'); // Đã đổi ID
            if (submitBtn) {
                submitBtn.disabled = true; // Vô hiệu hóa nút gửi để tránh gửi nhiều lần
                submitBtn.textContent = 'Đang gửi...';
            }

            // Lấy giá trị từ các trường input trong form
            const fullName = document.getElementById('full_name_input').value;
            const phoneNumber = document.getElementById('phone_number_input').value;
            const email = document.getElementById('email_input').value;
            const address = document.getElementById('address_input').value;

            const majorId = majorSelect.value;
            const hasGraduatedValue = graduatedSelect.value;

            // Kiểm tra các trường bắt buộc VÀ checkbox chính sách bảo mật
            if (!fullName || !phoneNumber || majorId === "" || hasGraduatedValue === "" || !document.getElementById('privacy').checked) {
                alert("Vui lòng điền đầy đủ các trường bắt buộc (có dấu *) và đồng ý chính sách bảo mật.");
                if (submitBtn) {
                    submitBtn.disabled = false;
                    submitBtn.textContent = 'Gửi thông tin';
                }
                return; // Dừng hàm nếu thiếu thông tin
            }

            // Chuẩn bị dữ liệu để gửi đi
            const dataToPost = {
                full_name: fullName,
                phone_number: phoneNumber,
                email: email || null, // Đảm bảo gửi null nếu trường email rỗng
                address: address || null, // Đảm bảo gửi null nếu trường address rỗng
                major_of_interest_id: parseInt(majorId),
                has_graduated: hasGraduatedValue
            };

            const apiUrl = "https://saigongiadinh.pythonanywhere.com/create-registrations/";

            try {
                const response = await fetch(apiUrl, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(dataToPost),
                });

                if (response.ok) {
                    const result = await response.json();
                    
                    
                    // Thay thế alert bằng việc hiển thị modal với thông báo
                    openModal("Đăng ký tư vấn thành công! Chúng tôi sẽ liên hệ lại với bạn sớm nhất.");
                    tourForm.reset(); // Xóa dữ liệu form sau khi gửi thành công
                } else {
                    const errorData = await response.json();
                    console.error("Lỗi khi đăng ký tư vấn:");

                    let errorMessage = "Đăng ký tư vấn thất bại. Vui lòng thử lại.";

                    if (response.status === 400 && errorData) {
                        const errors = [];
                        if (errorData.email) {
                            errors.push(errorData.email.join('\n'));
                        }
                        if (errorData.phone_number) {
                            errors.push(errorData.phone_number.join('\n'));
                        }
                        // Thêm các lỗi khác nếu có
                        if (errorData.full_name) { errors.push(`Họ và tên: ${errorData.full_name.join(', ')}`); }
                        if (errorData.address) { errors.push(`Địa chỉ: ${errorData.address.join(', ')}`); }
                        if (errorData.major_of_interest_id) { errors.push(`Ngành học: ${errorData.major_of_interest_id.join(', ')}`); }
                        if (errorData.has_graduated) { errors.push(`Trình độ tốt nghiệp: ${errorData.has_graduated.join(', ')}`); }


                        if (errors.length > 0) {
                            errorMessage = "Có lỗi xảy ra:\n" + errors.join('\n');
                        } else if (errorData.detail) {
                            errorMessage = errorData.detail;
                        } else {
                            errorMessage = JSON.stringify(errorData);
                        }
                    } else if (errorData.detail) {
                        errorMessage = errorData.detail;
                    }

                    alert(errorMessage);
                }
            } catch (error) {
                console.error("Có lỗi xảy ra khi gọi API");
                alert("Đã xảy ra lỗi kết nối. Vui lòng kiểm tra lại mạng.");
            } finally {
                if (submitBtn) {
                    submitBtn.disabled = false; // Bật lại nút gửi
                    submitBtn.textContent = 'Gửi thông tin';
                }
            }
        });
    }
});
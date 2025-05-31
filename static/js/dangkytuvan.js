

// document.addEventListener('DOMContentLoaded', () => {
//     const tourForm = document.getElementById('tourForm');
//     const majorSelect = document.getElementById('major_of_interest_select');
//     const graduatedSelect = document.getElementById('has_graduated_select');

//     // --- Hàm tải dữ liệu Ngành học từ API với caching ---
//     async function loadMajors() {
//         const majorsApiUrl = "https://saigongiadinh.pythonanywhere.com/Major/";
//         const CACHE_KEY = 'cachedMajors';
//         const CACHE_EXPIRY_TIME = 60 * 60 * 1000; // 1 giờ (milliseconds)

//         // Thử lấy từ cache trước
//         const cachedData = localStorage.getItem(CACHE_KEY);
//         if (cachedData) {
//             try {
//                 const { data, timestamp } = JSON.parse(cachedData);
//                 if (Date.now() - timestamp < CACHE_EXPIRY_TIME) {
//                     console.log("Sử dụng dữ liệu Majors từ cache.");
//                     populateMajorSelect(data);
//                     return; // Dừng hàm nếu dữ liệu từ cache hợp lệ
//                 } else {
//                     console.log("Cache Majors đã hết hạn.");
//                     localStorage.removeItem(CACHE_KEY); // Xóa cache cũ
//                 }
//             } catch (e) {
//                 console.error("Lỗi khi đọc cache Majors, sẽ fetch lại:", e);
//                 localStorage.removeItem(CACHE_KEY); // Xóa cache bị lỗi
//             }
//         }

//         // Nếu không có cache hoặc cache hết hạn/lỗi, fetch từ API
//         try {
//             const response = await fetch(majorsApiUrl);
//             if (!response.ok) {
//                 throw new Error(`HTTP error! status: ${response.status}`);
//             }
//             const majors = await response.json();

//             // Lưu vào cache
//             localStorage.setItem(CACHE_KEY, JSON.stringify({ data: majors, timestamp: Date.now() }));

//             populateMajorSelect(majors);
//         } catch (error) {
//             console.error("Lỗi khi tải danh sách ngành học:", error);
//             majorSelect.innerHTML = '<option value="">Không thể tải ngành học</option>';
//             alert("Không thể tải danh sách ngành học. Vui lòng thử lại sau.");
//         }
//     }

//     // --- Hàm điền dữ liệu vào dropdown ngành học ---
//     function populateMajorSelect(majors) {
//         majorSelect.innerHTML = '<option value="">Chọn ngành đăng ký</option>';
//         majors.forEach(major => {
//             const option = document.createElement('option');
//             option.value = major.id;
//             option.textContent = major.name;
//             majorSelect.appendChild(option);
//         });
//     }

//     // --- Hàm tải dữ liệu Trình độ Tốt nghiệp (giữ nguyên hardcode) ---
//     async function loadGraduatedChoices() {
//         const graduatedChoices = [
//             { key: 'THCS', value: 'Trung học cơ sở' },
//             { key: 'THPT', value: 'Trung học phổ thông' },
//             { key: 'TC', value: 'Trung cấp' },
//             { key: 'CD', value: 'Cao đẳng' },
//             { key: 'DH', value: 'Đại học' },
//         ];

//         graduatedSelect.innerHTML = '<option value="">Chọn Bạn Đã Tốt Nghiệp</option>';
//         graduatedChoices.forEach(choice => {
//             const option = document.createElement('option');
//             option.value = choice.key;
//             option.textContent = choice.value;
//             graduatedSelect.appendChild(option);
//         });
//     }

//     // --- Gọi các hàm tải dữ liệu khi trang được tải ---
//     loadMajors();
//     loadGraduatedChoices();

//     // --- Xử lý sự kiện gửi form ---
//     if (tourForm) {
//         tourForm.addEventListener('submit', async (event) => {
//             event.preventDefault(); // Ngăn chặn hành vi gửi form mặc định

//             // Lấy giá trị từ các trường input trong form
//             const fullName = document.getElementById('full_name_input').value;
//             const phoneNumber = document.getElementById('phone_number_input').value;
//             const email = document.getElementById('email_input').value;
//             const address = document.getElementById('address_input').value;
            
//             // Lấy giá trị ID từ dropdown ngành học
//             const majorId = majorSelect.value; 
//             // Lấy giá trị key từ dropdown trình độ tốt nghiệp
//             const hasGraduatedValue = graduatedSelect.value; 

//             // Kiểm tra các trường bắt buộc
//             if (!fullName || !phoneNumber || majorId === "" || hasGraduatedValue === "") {
//                 alert("Vui lòng điền đầy đủ các trường bắt buộc (có dấu *).");
//                 return;
//             }

//             // Chuẩn bị dữ liệu để gửi đi
//             const dataToPost = {
//                 full_name: fullName,
//                 phone_number: phoneNumber,
//                 email: email || null,
//                 address: address || null,
//                 major_of_interest_id: parseInt(majorId), // majorId đã được kiểm tra không rỗng
//                 has_graduated: hasGraduatedValue
//             };

//             const apiUrl = "https://saigongiadinh.pythonanywhere.com/create-registrations/";

//             try {
//                 const response = await fetch(apiUrl, {
//                     method: "POST",
//                     headers: {
//                         "Content-Type": "application/json",
//                     },
//                     body: JSON.stringify(dataToPost),
//                 });

//                 if (response.ok) {
//                     const result = await response.json();
//                     console.log("Đăng ký tư vấn thành công:", result);
//                     alert("Đăng ký tư vấn thành công! Chúng tôi sẽ liên hệ lại với bạn sớm nhất.");
//                     tourForm.reset(); // Xóa dữ liệu form sau khi gửi thành công
//                 } else {
//                     const errorData = await response.json();
//                     console.error("Lỗi khi đăng ký tư vấn:", response.status, errorData);
//                     alert(`Đăng ký tư vấn thất bại: ${errorData.message || JSON.stringify(errorData)}`);
//                 }
//             } catch (error) {
//                 console.error("Có lỗi xảy ra khi gọi API:", error);
//                 alert("Đã xảy ra lỗi trong quá trình gửi đăng ký. Vui lòng thử lại sau.");
//             }
//         });
//     }
// });


// dangkytuvan.js

document.addEventListener('DOMContentLoaded', () => {
    const tourForm = document.getElementById('tourForm');
    const majorSelect = document.getElementById('major_of_interest_select');
    const graduatedSelect = document.getElementById('has_graduated_select');

    // --- Hàm tải dữ liệu Ngành học từ API với caching ---
    async function loadMajors() {
        const majorsApiUrl = "https://saigongiadinh.pythonanywhere.com/Major/";
        const CACHE_KEY = 'cachedMajors';
        const CACHE_EXPIRY_TIME = 60 * 60 * 1000; // 1 giờ (milliseconds)

        // Thử lấy từ cache trước
        const cachedData = localStorage.getItem(CACHE_KEY);
        if (cachedData) {
            try {
                const { data, timestamp } = JSON.parse(cachedData);
                if (Date.now() - timestamp < CACHE_EXPIRY_TIME) {
                    console.log("Sử dụng dữ liệu Majors từ cache.");
                    populateMajorSelect(data);
                    return; // Dừng hàm nếu dữ liệu từ cache hợp lệ
                } else {
                    console.log("Cache Majors đã hết hạn.");
                    localStorage.removeItem(CACHE_KEY); // Xóa cache cũ
                }
            } catch (e) {
                console.error("Lỗi khi đọc cache Majors, sẽ fetch lại:", e);
                localStorage.removeItem(CACHE_KEY); // Xóa cache bị lỗi
            }
        }

        // Nếu không có cache hoặc cache hết hạn/lỗi, fetch từ API
        try {
            const response = await fetch(majorsApiUrl);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const majors = await response.json();

            // Lưu vào cache
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

    // --- Xử lý sự kiện gửi form ---
    if (tourForm) {
        tourForm.addEventListener('submit', async (event) => {
            event.preventDefault(); // Ngăn chặn hành vi gửi form mặc định

            // Lấy giá trị từ các trường input trong form
            const fullName = document.getElementById('full_name_input').value;
            const phoneNumber = document.getElementById('phone_number_input').value;
            const email = document.getElementById('email_input').value;
            const address = document.getElementById('address_input').value;

            // Lấy giá trị ID từ dropdown ngành học
            const majorId = majorSelect.value;
            // Lấy giá trị key từ dropdown trình độ tốt nghiệp
            const hasGraduatedValue = graduatedSelect.value;

            // Kiểm tra các trường bắt buộc
            if (!fullName || !phoneNumber || majorId === "" || hasGraduatedValue === "") {
                alert("Vui lòng điền đầy đủ các trường bắt buộc (có dấu *).");
                return;
            }

            // Chuẩn bị dữ liệu để gửi đi
            const dataToPost = {
                full_name: fullName,
                phone_number: phoneNumber,
                // Đảm bảo gửi null nếu trường email/address rỗng để phù hợp với backend
                email: email || null,
                address: address || null,
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
                    console.log("Đăng ký tư vấn thành công:", result);
                    alert("Đăng ký tư vấn thành công! Chúng tôi sẽ liên hệ lại với bạn sớm nhất.");
                    tourForm.reset(); // Xóa dữ liệu form sau khi gửi thành công
                } else {
                    const errorData = await response.json();
                    console.error("Lỗi khi đăng ký tư vấn:", response.status, errorData);

                    let errorMessage = "Đăng ký tư vấn thất bại. Vui lòng thử lại.";

                    // Kiểm tra và hiển thị lỗi cụ thể từ backend
                    if (response.status === 400 && errorData) {
                        const errors = [];
                        if (errorData.email) {
                            errors.push(errorData.email.join('\n'));
                        }
                        if (errorData.phone_number) {
                            errors.push(errorData.phone_number.join('\n'));
                        }
                        // Thêm các lỗi khác nếu có
                        if (errors.length > 0) {
                            errorMessage = errors.join('\n'); // Nối các thông báo lỗi lại
                        } else if (errorData.detail) {
                            errorMessage = errorData.detail; // Lỗi chung từ DRF
                        } else {
                            errorMessage = JSON.stringify(errorData); // Fallback nếu cấu trúc lỗi khác
                        }
                    } else if (errorData.detail) {
                        errorMessage = errorData.detail; // Lỗi chung từ DRF (ví dụ: authentication)
                    }

                    alert(errorMessage);
                }
            } catch (error) {
                console.error("Có lỗi xảy ra khi gọi API:", error);
                alert("Đã xảy ra lỗi trong quá trình gửi đăng ký. Vui lòng thử lại sau.");
            }
        });
    }
});
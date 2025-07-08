document.addEventListener('DOMContentLoaded', () => {
    // --- Khai báo các phần tử DOM ---
    const registrationForm01 = document.getElementById('registrationForm01');
    const chuongTrinhDaoTao01Radios = document.querySelectorAll('input[name="chuongTrinhDaoTao01"]');
    const phoThong9PlusFields01 = document.getElementById('phoThothong9PlusFields01');

    const tinhThanhPho01Select = document.getElementById('tinhThanhPho01');
    const quanHuyen01Select = document.getElementById('quanHuyen01');
    const xaPhuong01Select = document.getElementById('xaPhuong01');
    const soNhaDuong01Input = document.getElementById('soNhaDuong01');

    const tinhThanhPhoTHCS01Select = document.getElementById('tinhThanhPhoTHCS01');
    const quanHuyenTHCS01Select = document.getElementById('quanHuyenTHCS01');
    const xaPhuongTHCS01Select = document.getElementById('xaPhuongTHCS01');
    const truongTHCS01Input = document.getElementById('truongTHCS01');
    const namTotNghiepTHCS01Select = document.getElementById('namTotNghiepTHCS01');

    const diaChiNhan01Radios = document.querySelectorAll('input[name="diaChiNhan01"]');
    const diaChiKhacGroup01 = document.getElementById('diaChiKhacGroup01');
    const diaChiNhanKhac01Textarea = document.getElementById('diaChiNhanKhac01');

    const fileInputs01 = document.querySelectorAll('input[type="file"]');

    // API Base URL của Django REST Framework
    const BASE_API_URL = 'https://saigongiadinh.pythonanyanywhere.com/'; // Đổi lại thành URL API của bạn

    // API Base URL của esgoo.net
    const ESGOO_API = {
        provinces: 'https://esgoo.net/api-tinhthanh/1/0.htm', // Biến {A}: giá trị 1, Biến {B}: giá trị 0
        districts: 'https://esgoo.net/api-tinhthanh/2/',     // Biến {A}: giá trị 2, Biến {B}: id tỉnh thành
        wards: 'https://esgoo.net/api-tinhthanh/3/'          // Biến {A}: giá trị 3, Biến {B}: id quận huyện
    };

    // --- Cấu hình Cloudinary ---
    const CLOUDINARY_CLOUD_NAME = 'dftarzzfw';
    const CLOUDINARY_UPLOAD_PRESET = 'SGGDCollege'; // Đảm bảo preset này là 'Unsigned'
    const CLOUDINARY_UPLOAD_URL = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`;
    const CLOUDINARY_FOLDER = 'CCCD'; 

    
    // Hàm load options cho select box từ API
    const loadOptionsFromApi = async (selectElement, apiUrl, defaultText) => {
        selectElement.innerHTML = `<option value="">${defaultText}</option>`;
        selectElement.disabled = true; // Tắt select trong khi đang load
        
        console.log(`Đang tải dữ liệu từ API: ${apiUrl}`); // LOG: URL API đang được gọi

        try {
            const response = await fetch(apiUrl);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            
            console.log(`Dữ liệu nhận được từ ${apiUrl}:`, data); // LOG: Dữ liệu API nhận được

            if (data && data.data && Array.isArray(data.data)) {
                data.data.forEach(item => {
                    const option = document.createElement('option');
                    option.value = item.id; // Giá trị là ID của tỉnh/huyện/xã
                    option.textContent = item.name; // Hiển thị tên
                    selectElement.appendChild(option);
                });
                selectElement.disabled = false; // Kích hoạt select sau khi load data
                console.log(`Đã tải xong và kích hoạt cho select: ${selectElement.id}`); // LOG: Đã tải xong
            } else {
                console.error('Dữ liệu API không đúng định dạng:', data);
            }
        } catch (error) {
            console.error(`Lỗi khi tải dữ liệu từ ${apiUrl}:`, error);
            selectElement.disabled = true; // Đảm bảo vô hiệu hóa nếu lỗi
        }
    };

    // Hàm reset các select con (quận/huyện, xã/phường)
    const resetChildSelects = (quanHuyenEl, xaPhuongEl) => {
        quanHuyenEl.innerHTML = '<option value="">Chọn quận/huyện</option>';
        quanHuyenEl.disabled = true;
        xaPhuongEl.innerHTML = '<option value="">Chọn xã/phường/thị trấn</option>';
        xaPhuongEl.disabled = true;
        console.log(`Đã reset các select con: ${quanHuyenEl.id}, ${xaPhuongEl.id}`); // LOG: Reset select con
    };

    // Hàm xử lý thay đổi Tỉnh/Thành phố
    const handleProvinceChange = async (provinceSelect, districtSelect, wardSelect) => {
        const selectedProvinceId = provinceSelect.value;
        console.log(`Tỉnh/Thành phố được chọn (ID): ${selectedProvinceId}`); // LOG: ID tỉnh được chọn
        resetChildSelects(districtSelect, wardSelect); // Reset cả quận/huyện và xã/phường

        if (selectedProvinceId) {
            const districtApiUrl = `${ESGOO_API.districts}${selectedProvinceId}.htm`;
            console.log(`URL API để tải Quận/Huyện: ${districtApiUrl}`); // LOG: URL API quận/huyện
            await loadOptionsFromApi(districtSelect, districtApiUrl, 'Chọn quận/huyện');
        } else {
            districtSelect.disabled = true;
            wardSelect.disabled = true;
            console.log('Không có tỉnh/thành phố nào được chọn, vô hiệu hóa quận/huyện và xã/phường.'); // LOG: Không chọn tỉnh
        }
    };

    // Hàm xử lý thay đổi Quận/Huyện
    const handleDistrictChange = async (provinceSelect, districtSelect, wardSelect) => {
        const selectedDistrictId = districtSelect.value;
        console.log(`Quận/Huyện được chọn (ID): ${selectedDistrictId}`); // LOG: ID huyện được chọn
        wardSelect.innerHTML = '<option value="">Chọn xã/phường/thị trấn</option>';
        wardSelect.disabled = true;

        if (selectedDistrictId) {
            const wardApiUrl = `${ESGOO_API.wards}${selectedDistrictId}.htm`;
            console.log(`URL API để tải Xã/Phường: ${wardApiUrl}`); // LOG: URL API xã/phường
            await loadOptionsFromApi(wardSelect, wardApiUrl, 'Chọn xã/phường/thị trấn');
        } else {
            wardSelect.disabled = true;
            console.log('Không có quận/huyện nào được chọn, vô hiệu hóa xã/phường.'); // LOG: Không chọn huyện
        }
    };

    // Hàm ẩn/hiện trường "Phổ thông Cao đẳng 9+"
    const togglePhoThong9PlusFields = () => {
        const selectedProgramRadio = document.querySelector('input[name="chuongTrinhDaoTao01"]:checked');
        const selectedProgram = selectedProgramRadio ? selectedProgramRadio.value : '';
        const isPhoThong9Plus = selectedProgram === 'phothong9plus';

        // phoThong9PlusFields01.style.display = isPhoThong9Plus ? 'block' : 'none';
        
if (phoThong9PlusFields01) {
    phoThong9PlusFields01.style.display = isPhoThong9Plus ? 'block' : 'none';
   
} else {
    console.error("Không tìm thấy phần tử với ID 'phoThothong9PlusFields01'. Vui lòng kiểm tra lại ID trong HTML.");
}
        console.log(`Chương trình đào tạo: ${selectedProgram}. Hiển thị trường PT9+: ${isPhoThong9Plus}`); // LOG: Tình trạng hiển thị PT9+

        const requiredElements = phoThong9PlusFields01.querySelectorAll('input, select');
        requiredElements.forEach(el => {
            if (isPhoThong9Plus) {
                el.setAttribute('required', 'required');
            } else {
                el.removeAttribute('required');
            }
        });

        if (!isPhoThong9Plus) {
            // Clear values and disable when hidden
            namTotNghiepTHCS01Select.value = '';
            truongTHCS01Input.value = '';
            tinhThanhPhoTHCS01Select.value = ''; // Clear province select
            resetChildSelects(quanHuyenTHCS01Select, xaPhuongTHCS01Select);
            console.log('Đã xóa giá trị và vô hiệu hóa các trường PT9+ khi ẩn.'); // LOG: Xóa giá trị PT9+
        } else {
            // Re-enable/reload if it was previously hidden and data is available
            if (!tinhThanhPhoTHCS01Select.options.length > 1) { // Check if only default option exists
                 loadOptionsFromApi(tinhThanhPhoTHCS01Select, ESGOO_API.provinces, 'Chọn tỉnh/thành phố');
                 console.log('Đang tải lại tỉnh/thành phố cho trường THCS.'); // LOG: Tải lại tỉnh THCS
            }
        }
    };

    // Hàm xử lý hiển thị tên file được chọn
    const handleFileSelect = (event) => {
        const input = event.target;
        const fileNameSpanId = 'file' + input.id.charAt(0).toUpperCase() + input.id.slice(1);
        const fileNameSpan = document.getElementById(fileNameSpanId);
        if (fileNameSpan) {
            if (input.files.length > 0) {
                fileNameSpan.textContent = input.files[0].name;
                console.log(`File chọn cho ${input.id}: ${input.files[0].name}`); // LOG: Tên file
            } else {
                fileNameSpan.textContent = 'Chưa có file nào được chọn';
                console.log(`Không có file nào được chọn cho ${input.id}.`); // LOG: Không có file
            }
        }
    };

    // Hàm tạo options cho năm tốt nghiệp THCS
    const populateNamTotNghiepTHCS = () => {
        const currentYear = new Date().getFullYear();
        namTotNghiepTHCS01Select.innerHTML = '<option value="">Chọn năm tốt nghiệp</option>';
        for (let i = currentYear; i >= currentYear - 12; i--) {
            const option = document.createElement('option');
            option.value = i;
            option.textContent = i;
            namTotNghiepTHCS01Select.appendChild(option);
        }
        console.log('Đã tạo các lựa chọn năm tốt nghiệp THCS.'); // LOG: Tạo năm tốt nghiệp
    };

    // --- CẬP NHẬT: Hàm tải ảnh lên Cloudinary để thêm tham số folder ---
    const uploadImageToCloudinary = async (file) => {
        if (!file) return null;

        const formData = new FormData();
        formData.append('file', file);
        formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
        // Thêm tham số folder để lưu ảnh vào thư mục 'CCCD'
        formData.append('folder', CLOUDINARY_FOLDER); 

        console.log(`Đang tải ảnh "${file.name}" lên Cloudinary...`); // LOG: Bắt đầu tải ảnh

        try {
            const response = await fetch(CLOUDINARY_UPLOAD_URL, {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                const errorData = await response.json();
                console.error('Lỗi khi tải ảnh lên Cloudinary:', errorData);
                throw new Error(`Tải ảnh lên Cloudinary thất bại: ${errorData.error.message || response.statusText}`);
            }

            const data = await response.json();
            console.log(`Ảnh "${file.name}" đã tải lên thành công: ${data.secure_url}`); // LOG: Tải ảnh thành công
            return data.secure_url; // Trả về URL an toàn của ảnh
        } catch (error) {
            console.error('Lỗi kết nối Cloudinary:', error);
            alert(`Không thể tải ảnh "${file.name}" lên Cloudinary. Vui lòng kiểm tra kết nối mạng hoặc thử lại.`);
            return null;
        }
    };

    // --- Khởi tạo ban đầu ---
    console.log('Khởi tạo ban đầu: Tải tỉnh/thành phố chính...'); // LOG: Khởi tạo
    loadOptionsFromApi(tinhThanhPho01Select, ESGOO_API.provinces, 'Chọn tỉnh/thành phố');
    populateNamTotNghiepTHCS();
    togglePhoThong9PlusFields();

    // --- Event Listeners ---
    chuongTrinhDaoTao01Radios.forEach(radio => {
        radio.addEventListener('change', togglePhoThong9PlusFields);
    });

    tinhThanhPho01Select.addEventListener('change', () => handleProvinceChange(tinhThanhPho01Select, quanHuyen01Select, xaPhuong01Select));
    quanHuyen01Select.addEventListener('change', () => handleDistrictChange(tinhThanhPho01Select, quanHuyen01Select, xaPhuong01Select));

    tinhThanhPhoTHCS01Select.addEventListener('change', () => handleProvinceChange(tinhThanhPhoTHCS01Select, quanHuyenTHCS01Select, xaPhuongTHCS01Select));
    quanHuyenTHCS01Select.addEventListener('change', () => handleDistrictChange(tinhThanhPhoTHCS01Select, quanHuyenTHCS01Select, xaPhuongTHCS01Select));

    diaChiNhan01Radios.forEach(radio => {
        radio.addEventListener('change', () => {
            if (document.querySelector('input[name="diaChiNhan01"]:checked').value === 'khac') {
                diaChiKhacGroup01.style.display = 'block';
                diaChiNhanKhac01Textarea.setAttribute('required', 'required');
                console.log('Chọn địa chỉ khác: hiển thị trường nhập liệu.'); // LOG: Địa chỉ khác
            } else {
                diaChiKhacGroup01.style.display = 'none';
                diaChiNhanKhac01Textarea.removeAttribute('required');
                diaChiNhanKhac01Textarea.value = '';
                console.log('Chọn địa chỉ mặc định: ẩn trường nhập liệu khác.'); // LOG: Địa chỉ mặc định
            }
        });
    });

    fileInputs01.forEach(input => {
        input.addEventListener('change', handleFileSelect);
    });

    // Xử lý gửi form
    registrationForm01.addEventListener('submit', async (event) => {
        event.preventDefault(); // Ngăn chặn form gửi đi mặc định
        console.log('Form đã được submit. Đang kiểm tra tính hợp lệ...'); // LOG: Submit form

        let isValid = registrationForm01.checkValidity();
        const camDoan01Checkbox = document.getElementById('camDoan01');

        if (!camDoan01Checkbox.checked) {
            isValid = false;
            alert('Bạn phải cam đoan những lời khai là đúng sự thật.');
            camDoan01Checkbox.focus();
            console.log('Checkbox cam đoan chưa được chọn.'); // LOG: Lỗi cam đoan
        }

        if (isValid) {
            // Hiển thị trạng thái đang tải (tùy chọn)
            alert('Đang tải ảnh và gửi thông tin. Vui lòng đợi...');
            console.log('Form hợp lệ, bắt đầu quá trình tải ảnh và gửi dữ liệu.'); // LOG: Form hợp lệ

            const formData = new FormData();
            
            // Lấy giá trị từ các trường input
            const hoTen = document.getElementById('hoTen01').value;
            const ngaySinh = document.getElementById('ngaySinh01').value;
            const gioiTinh = document.querySelector('input[name="gioiTinh01"]:checked').value;
            const danToc = document.getElementById('danToc01').value;
            const soCmnd = document.getElementById('cccd01').value;
            const ngayCapCmnd = document.getElementById('ngayCapCCCD01').value;
            const noiCapCmnd = document.getElementById('noiCapCCCD01').value;
            
            const thanhPhoText = tinhThanhPho01Select.options[tinhThanhPho01Select.selectedIndex].textContent;
            const quanHuyenText = quanHuyen01Select.options[quanHuyen01Select.selectedIndex].textContent;
            const phuongText = xaPhuong01Select.options[xaPhuong01Select.selectedIndex].textContent;
            
            const soNhaTenDuong = document.getElementById('soNhaDuong01').value;
            const soDienThoai = document.getElementById('sdtThiSinh01').value;
            const email = document.getElementById('emailThiSinh01').value;
            const hoTenPhuHuynh = document.getElementById('hoTenPhuHuynh01').value;
            const soDienThoaiPhuHuynh = document.getElementById('sdtPhuHuynh01').value;
            const nganhDangKy1 = document.getElementById('nganhHocDangKy01').value;
            const nganhDangKy2 = document.getElementById('nguyenVong201').value;
            const nganhDangKy3 = document.getElementById('nguyenVong301').value;

            // Lấy file ảnh gốc
            const anhCmndMatTruocFile = document.getElementById('anhCCCDTruoc01').files[0];
            const anhCmndMatSauFile = document.getElementById('anhCCCDSau01').files[0];
            const banSaoTotNghiepThptFile = document.getElementById('bangTotNghiepTHPT01').files[0];

            // --- Tải ảnh lên Cloudinary và lấy URL ---
            const anhCmndMatTruocUrl = await uploadImageToCloudinary(anhCmndMatTruocFile);
            const anhCmndMatSauUrl = await uploadImageToCloudinary(anhCmndMatSauFile);
            const banSaoTotNghiepThptUrl = await uploadImageToCloudinary(banSaoTotNghiepThptFile);

            // Kiểm tra nếu có bất kỳ ảnh nào không tải được
            if ((anhCmndMatTruocFile && !anhCmndMatTruocUrl) || 
                (anhCmndMatSauFile && !anhCmndMatSauUrl) ||
                (banSaoTotNghiepThptFile && !banSaoTotNghiepThptUrl)) {
                alert('Có lỗi khi tải lên một hoặc nhiều ảnh. Vui lòng kiểm tra lại.');
                console.error('Không thể gửi form do lỗi tải ảnh lên Cloudinary.'); // LOG: Lỗi tải ảnh
                return; // Ngừng quá trình gửi form nếu có lỗi tải ảnh
            }

            // Thêm dữ liệu vào FormData
            formData.append('ho_ten', hoTen);
            formData.append('ngay_sinh', ngaySinh);
            formData.append('gioi_tinh', gioiTinh);
            formData.append('dan_toc', danToc);
            formData.append('so_cmnd', soCmnd);
            formData.append('ngay_cap_cmnd', ngayCapCmnd);
            formData.append('noi_cap_cmnd', noiCapCmnd);
            formData.append('thanh_pho', thanhPhoText);
            formData.append('quan', quanHuyenText); // Thêm trường này nếu Django backend của bạn nhận
            formData.append('phuong', phuongText);
            formData.append('so_nha_ten_duong', soNhaTenDuong);
            formData.append('so_dien_thoai', soDienThoai);
            formData.append('email', email);
            formData.append('ho_ten_phu_huynh', hoTenPhuHuynh);
            formData.append('so_dien_thoai_phu_huynh', soDienThoaiPhuHuynh);
            formData.append('nganh_dang_ky_1', nganhDangKy1);
            if (nganhDangKy2) formData.append('nganh_dang_ky_2', nganhDangKy2);
            if (nganhDangKy3) formData.append('nganh_dang_ky_3', nganhDangKy3);

            // Thêm URL ảnh vào FormData thay vì File
            if (anhCmndMatTruocUrl) formData.append('anh_cmnd_mat_truoc', anhCmndMatTruocUrl);
            if (anhCmndMatSauUrl) formData.append('anh_cmnd_mat_sau', anhCmndMatSauUrl);
            if (banSaoTotNghiepThptUrl) {
                formData.append('ban_sao_tot_nghiep_thpt', banSaoTotNghiepThptUrl);
            }

            const selectedProgram = document.querySelector('input[name="chuongTrinhDaoTao01"]:checked').value;
            let apiUrl = '';

            if (selectedProgram === 'caodang') {
                apiUrl = `${BASE_API_URL}dang-ky-nhap-hoc/`;
                console.log('Chương trình Cao đẳng được chọn. API gửi: dang-ky-nhap-hoc/'); // LOG: API chương trình
            } else if (selectedProgram === 'phothong9plus') {
                apiUrl = `${BASE_API_URL}dang-ky-nhap-hoc-thpt/`;
                formData.append('nam_tot_nghiep_THCS', namTotNghiepTHCS01Select.value);
                formData.append('truong_tot_nghiep_THCS', truongTHCS01Input.value);
                const noiTotNghiepTHCS = `${xaPhuongTHCS01Select.options[xaPhuongTHCS01Select.selectedIndex].textContent}, ${quanHuyenTHCS01Select.options[quanHuyenTHCS01Select.selectedIndex].textContent}, ${tinhThanhPhoTHCS01Select.options[tinhThanhPhoTHCS01Select.selectedIndex].textContent}`;
                formData.append('noi_tot_nghiep', noiTotNghiepTHCS);
                console.log('Chương trình Phổ thông 9+ được chọn. API gửi: dang-ky-nhap-hoc-thpt/'); // LOG: API chương trình
            }
            
            console.log('Dữ liệu FormData trước khi gửi:', Object.fromEntries(formData.entries())); // LOG: Toàn bộ FormData

            try {
                const response = await fetch(apiUrl, {
                    method: 'POST',
                    body: formData, 
                });

                if (response.ok) {
                    const result = await response.json();
                    alert('Đăng ký thành công!');
                    console.log('Phản hồi từ API:', result);
                    registrationForm01.reset();
                    fileInputs01.forEach(input => {
                        const fileNameSpanId = 'file' + input.id.charAt(0).toUpperCase() + input.id.slice(1);
                        const fileNameSpan = document.getElementById(fileNameSpanId);
                        if (fileNameSpan) {
                            fileNameSpan.textContent = 'Chưa có file nào được chọn';
                        }
                    });
                    togglePhoThong9PlusFields();
                    loadOptionsFromApi(tinhThanhPho01Select, ESGOO_API.provinces, 'Chọn tỉnh/thành phố');
                    resetChildSelects(quanHuyen01Select, xaPhuong01Select);
                    console.log('Form đã reset và thiết lập lại.'); // LOG: Reset form
                } else {
                    const errorData = await response.json();
                    let errorMessage = 'Đăng ký thất bại. ';
                    if (errorData) {
                        for (const key in errorData) {
                            errorMessage += `${key}: ${errorData[key].join(', ')}\n`;
                        }
                    }
                    alert(errorMessage);
                    console.error('Lỗi khi gửi form:', errorData); // LOG: Lỗi gửi form
                }
            } catch (error) {
                console.error('Lỗi kết nối hoặc xử lý:', error); // LOG: Lỗi mạng/xử lý
                alert('Có lỗi xảy ra, vui lòng thử lại sau.');
            }
        } else {
            alert('Vui lòng điền đầy đủ và chính xác các thông tin bắt buộc.');
            console.log('Form không hợp lệ. Vui lòng điền đủ thông tin.'); // LOG: Form không hợp lệ
        }
    });
});
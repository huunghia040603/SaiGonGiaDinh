

document.addEventListener('DOMContentLoaded', () => {
    // --- Khai báo các phần tử DOM ---
    const registrationForm01 = document.getElementById('registrationForm01');
    const chuongTrinhDaoTao01Radios = document.querySelectorAll('input[name="chuongTrinhDaoTao01"]');
    const phoThong9PlusFields01 = document.getElementById('phoThong9PlusFields01');
    const fileBangTotNghiepInput = document.getElementById('bangTotNghiepTHPT01');
    const fileBangTotNghiepSpan = document.getElementById('fileBangTotNghiepTHPT01');
    const labelBangTotNghiep = document.querySelector('label[for="bangTotNghiepTHPT01"]');
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
    const submitButton = document.querySelector('#registrationForm01 button[type="submit"]');
    const anhCmndMatTruocInput = document.getElementById('anhCCCDTruoc01');
    const anhCmndMatSauInput = document.getElementById('anhCCCDSau01');
    
    // **Khai báo thêm các phần tử ngày sinh và ngày cấp CCCD**
    const ngaySinhInput = document.getElementById('ngaySinh01');
    const ngayCapCCCDInput = document.getElementById('ngayCapCCCD01');

    // **Khai báo thêm các phần tử xem trước ảnh**
    const previewCCCDTruoc = document.getElementById('previewCCCDTruoc');
    const previewCCCDSau = document.getElementById('previewCCCDSau');
    
    // Thêm biến để quản lý trạng thái tải lên của ảnh
    let isUploading = false;
    let cccdTruocUrl = null;
    let cccdSauUrl = null;

    // API Base URL của Django REST Framework
    const BASE_API_URL = 'https://saigongiadinh.pythonanywhere.com/';

    // API Base URL của esgoo.net
    const ESGOO_API = {
        provinces: 'https://esgoo.net/api-tinhthanh/1/0.htm',
        districts: 'https://esgoo.net/api-tinhthanh/2/',
        wards: 'https://esgoo.net/api-tinhthanh/3/'
    };

    // --- Cấu hình Cloudinary ---
    const CLOUDINARY_CLOUD_NAME = 'dftarzzfw';
    const CLOUDINARY_UPLOAD_PRESET = 'SGGDCollege';
    const CLOUDINARY_UPLOAD_URL = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`;
    const CLOUDINARY_FOLDER = 'CCCD';

    // **Hàm mới để xử lý trạng thái nút gửi**
    const toggleSubmitButton = (isSubmitting) => {
        if (!submitButton) return;
        if (isSubmitting) {
            submitButton.disabled = true;
            submitButton.innerHTML = `<span class="spinner"></span> Đang gửi...`;
        } else {
            submitButton.disabled = false;
            submitButton.innerHTML = `Gửi phiếu đăng ký`;
        }
    };

    // Hàm load options cho select box từ API
    const loadOptionsFromApi = async (selectElement, apiUrl, defaultText) => {
        selectElement.innerHTML = `<option value="">${defaultText}</option>`;
        selectElement.disabled = true;
        try {
            const response = await fetch(apiUrl);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            if (data && data.data && Array.isArray(data.data)) {
                data.data.forEach(item => {
                    const option = document.createElement('option');
                    option.value = item.id;
                    option.textContent = item.name;
                    selectElement.appendChild(option);
                });
                selectElement.disabled = false;
            } else {
                console.error('Dữ liệu API không đúng định dạng:', data);
            }
        } catch (error) {
            console.error(`Lỗi khi tải dữ liệu từ ${apiUrl}:`, error);
            selectElement.disabled = true;
        }
    };

    // Hàm reset các select con (quận/huyện, xã/phường)
    const resetChildSelects = (quanHuyenEl, xaPhuongEl) => {
        quanHuyenEl.innerHTML = '<option value="">Chọn quận/huyện</option>';
        quanHuyenEl.disabled = true;
        xaPhuongEl.innerHTML = '<option value="">Chọn xã/phường/thị trấn</option>';
        xaPhuongEl.disabled = true;
    };

    // Hàm xử lý thay đổi Tỉnh/Thành phố
    const handleProvinceChange = async (provinceSelect, districtSelect, wardSelect) => {
        const selectedProvinceId = provinceSelect.value;
        resetChildSelects(districtSelect, wardSelect);
        if (selectedProvinceId) {
            const districtApiUrl = `${ESGOO_API.districts}${selectedProvinceId}.htm`;
            await loadOptionsFromApi(districtSelect, districtApiUrl, 'Chọn quận/huyện');
        } else {
            districtSelect.disabled = true;
            wardSelect.disabled = true;
        }
    };

    // Hàm xử lý thay đổi Quận/Huyện
    const handleDistrictChange = async (provinceSelect, districtSelect, wardSelect) => {
        const selectedDistrictId = districtSelect.value;
        wardSelect.innerHTML = '<option value="">Chọn xã/phường/thị trấn</option>';
        wardSelect.disabled = true;
        if (selectedDistrictId) {
            const wardApiUrl = `${ESGOO_API.wards}${selectedDistrictId}.htm`;
            await loadOptionsFromApi(wardSelect, wardApiUrl, 'Chọn xã/phường/thị trấn');
        } else {
            wardSelect.disabled = true;
        }
    };

    // Hàm ẩn/hiện trường "Phổ thông Cao đẳng 9+"
    const togglePhoThong9PlusFields = () => {
        const selectedProgramRadio = document.querySelector('input[name="chuongTrinhDaoTao01"]:checked');
        const selectedProgram = selectedProgramRadio ? selectedProgramRadio.value : '';
        const isPhoThong9Plus = selectedProgram === 'phothong9plus';

        if (phoThong9PlusFields01) {
            phoThong9PlusFields01.style.display = isPhoThong9Plus ? 'block' : 'none';
        }

        let requiredElements = [];
        if (phoThong9PlusFields01) {
            requiredElements = phoThong9PlusFields01.querySelectorAll('input, select');
        }

        requiredElements.forEach(el => {
            if (isPhoThong9Plus) {
                el.setAttribute('required', 'required');
            } else {
                el.removeAttribute('required');
            }
        });

        if (fileBangTotNghiepInput && labelBangTotNghiep && fileBangTotNghiepSpan) {
            if (isPhoThong9Plus) {
                fileBangTotNghiepInput.setAttribute('required', 'required');
                labelBangTotNghiep.textContent = 'Bản sao Chứng nhận tốt nghiệp THCS:';
                fileBangTotNghiepSpan.textContent = 'Chưa có file chứng nhận THCS được chọn';
            } else {
                fileBangTotNghiepInput.removeAttribute('required');
                labelBangTotNghiep.textContent = 'Bản sao bằng tốt nghiệp THPT (Không bắt buộc cho Cao đẳng):';
                fileBangTotNghiepSpan.textContent = 'Chưa có file nào được chọn';
            }
        }

        if (!isPhoThong9Plus) {
            namTotNghiepTHCS01Select.value = '';
            truongTHCS01Input.value = '';
            tinhThanhPhoTHCS01Select.value = '';
            resetChildSelects(quanHuyenTHCS01Select, xaPhuongTHCS01Select);
        } else {
            if (tinhThanhPhoTHCS01Select && (!tinhThanhPhoTHCS01Select.options.length > 1 || tinhThanhPhoTHCS01Select.options.length === 0)) {
                loadOptionsFromApi(tinhThanhPhoTHCS01Select, ESGOO_API.provinces, 'Chọn tỉnh/thành phố');
            }
        }
    };
    
    // Hàm mới để kiểm tra chất lượng ảnh
    const checkImageQuality = (imageElement, callback) => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = imageElement.width;
        canvas.height = imageElement.height;
        ctx.drawImage(imageElement, 0, 0, canvas.width, canvas.height);

        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;

        let totalLuminance = 0;
        for (let i = 0; i < data.length; i += 4) {
            const r = data[i];
            const g = data[i + 1];
            const b = data[i + 2];
            const luminance = 0.299 * r + 0.587 * g + 0.114 * b;
            totalLuminance += luminance;
        }
        const avgLuminance = totalLuminance / (data.length / 4);

        let warnings = [];
        if (avgLuminance < 60) {
            warnings.push('Ảnh thiếu sáng.');
        } else if (avgLuminance > 220) {
            warnings.push('Ảnh bị chói sáng.');
        }

        callback(warnings.join('\n'));
    };

    // Hàm cập nhật để xem trước hình ảnh, tự động xoay và kiểm tra chất lượng
// Hàm cập nhật để xem trước hình ảnh, tự động xoay và kiểm tra chất lượng
const handleImagePreview = (fileInput, previewElement) => {
    if (fileInput.files && fileInput.files[0]) {
        const file = fileInput.files[0];
        
        // Sử dụng load-image để xử lý ảnh (xoay, nén)
        window.loadImage(
            file,
            (img) => {
                if(img.type === 'error') {
                    alert('Không thể tải hoặc xử lý file ảnh. Vui lòng chọn định dạng khác.');
                    fileInput.value = ''; // Xóa file đã chọn
                    previewElement.src = '';
                    previewElement.style.display = 'none';
                    return;
                }
                
                // Cải tiến: Kiểm tra chất lượng ảnh trước khi hiển thị
                checkImageQuality(img, (warnings) => {
                    if (warnings) {
                        alert(`Cảnh báo về chất lượng ảnh:\n${warnings}\nVui lòng chọn lại ảnh rõ nét hơn.`);
                        // Xóa file, ẩn preview VÀ XÓA TÊN FILE HIỂN THỊ
                        fileInput.value = ''; 
                        previewElement.src = '';
                        previewElement.style.display = 'none';

                        // **Đoạn code mới để xóa tên file**
                        const fileNameSpanId = 'file' + fileInput.id.charAt(0).toUpperCase() + fileInput.id.slice(1);
                        const fileNameSpan = document.getElementById(fileNameSpanId);
                        if (fileNameSpan) {
                            fileNameSpan.textContent = 'Chưa có file nào được chọn';
                        }
                    } else {
                        // Chỉ hiển thị ảnh nếu không có cảnh báo
                        previewElement.src = img.toDataURL();
                        previewElement.style.display = 'block';
                    }
                });
            },
            { 
                maxWidth: 600,
                maxHeight: 600,
                canvas: true,
                orientation: true 
            }
        );

    } else {
        previewElement.src = '';
        previewElement.style.display = 'none';
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
    };

    // Hàm tải ảnh lên Cloudinary, chỉ thực hiện nếu chưa có URL
    const uploadImageToCloudinary = async (file, currentUrl) => {
        if (currentUrl) {
            console.log('Ảnh đã được tải lên trước đó, sử dụng URL đã có.');
            return currentUrl;
        }
        if (!file) return null;
        const formData = new FormData();
        formData.append('file', file);
        formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
        formData.append('folder', CLOUDINARY_FOLDER);
        try {
            const response = await fetch(CLOUDINARY_UPLOAD_URL, {
                method: 'POST',
                body: formData,
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(`Tải ảnh lên Cloudinary thất bại: ${errorData.error.message || response.statusText}`);
            }
            const data = await response.json();
            return data.secure_url;
        } catch (error) {
            console.error('Lỗi kết nối Cloudinary:', error);
            alert(`Không thể tải ảnh "${file.name}" lên Cloudinary. Vui lòng kiểm tra kết nối mạng hoặc thử lại.`);
            return null;
        }
    };

    // **Hàm mới để kiểm tra form hợp lệ**
    const validateForm = () => {
        if (!registrationForm01.checkValidity()) {
            return false;
        }
        const camDoan01Checkbox = document.getElementById('camDoan01');
        if (!camDoan01Checkbox.checked) {
            alert('Bạn phải cam đoan những lời khai là đúng sự thật.');
            camDoan01Checkbox.focus();
            return false;
        }
        
        if (!anhCmndMatTruocInput.files[0] || !anhCmndMatSauInput.files[0]) {
            alert('Vui lòng tải lên cả hai mặt của CCCD/CMND.');
            return false;
        }

        const selectedProgram = document.querySelector('input[name="chuongTrinhDaoTao01"]:checked').value;
        if (selectedProgram === 'phothong9plus') {
            if (!namTotNghiepTHCS01Select.value || !truongTHCS01Input.value || !tinhThanhPhoTHCS01Select.value || !quanHuyenTHCS01Select.value || !xaPhuongTHCS01Select.value) {
                alert('Vui lòng điền đầy đủ thông tin tốt nghiệp THCS.');
                return false;
            }
            const chungNhanTotNghiepTHCSFile = fileBangTotNghiepInput.files[0];
            if (!chungNhanTotNghiepTHCSFile) {
                alert('Vui lòng tải lên bản sao chứng nhận tốt nghiệp THCS.');
                return false;
            }
        }
        
        return true;
    };

    // --- Khởi tạo Datepicker cho Ngày sinh và Ngày cấp CCCD ---
    const currentYear = new Date().getFullYear();
    const maxBirthYear = currentYear - 17;
    $("#ngaySinh01").datepicker({
        changeMonth: true,
        changeYear: true,
        dateFormat: 'yy-mm-dd',
        yearRange: `1950:${maxBirthYear}`,
        maxDate: '0',
        defaultDate: `-18y`
    });

    $("#ngayCapCCCD01").datepicker({
        changeMonth: true,
        changeYear: true,
        dateFormat: 'yy-mm-dd',
        yearRange: `1999:${currentYear}`,
        maxDate: '0'
    });

    // --- Khởi tạo ban đầu ---
    loadOptionsFromApi(tinhThanhPho01Select, ESGOO_API.provinces, 'Chọn tỉnh/thành phố');
    loadOptionsFromApi(tinhThanhPhoTHCS01Select, ESGOO_API.provinces, 'Chọn tỉnh/thành phố');
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
            } else {
                diaChiKhacGroup01.style.display = 'none';
                diaChiNhanKhac01Textarea.removeAttribute('required');
                diaChiNhanKhac01Textarea.value = '';
            }
        });
    });
    
    // Cập nhật event listener cho input file
    fileInputs01.forEach(input => {
        input.addEventListener('change', (event) => {
            const fileInput = event.target;
            const fileNameSpanId = 'file' + fileInput.id.charAt(0).toUpperCase() + fileInput.id.slice(1);
            const fileNameSpan = document.getElementById(fileNameSpanId);
            
            if (fileNameSpan) {
                if (fileInput.files.length > 0) {
                    fileNameSpan.textContent = fileInput.files[0].name;
                } else {
                    fileNameSpan.textContent = 'Chưa có file nào được chọn';
                }
            }

            // Gọi hàm xử lý hình ảnh cho CCCD
            if (fileInput.id === 'anhCCCDTruoc01') {
                handleImagePreview(fileInput, previewCCCDTruoc);
            } else if (fileInput.id === 'anhCCCDSau01') {
                handleImagePreview(fileInput, previewCCCDSau);
            }
        });
    });

    // Xử lý gửi form
    registrationForm01.addEventListener('submit', async (event) => {
        event.preventDefault();
        if (!validateForm()) {
            return;
        }

        // Kiểm tra biến cờ để ngăn chặn gửi trùng lặp
        if (isUploading) {
            console.log('Quá trình gửi đang diễn ra. Vui lòng đợi.');
            return;
        }
        
        isUploading = true;
        console.log('Form hợp lệ, bắt đầu quá trình tải ảnh và gửi dữ liệu.');
        toggleSubmitButton(true);

        try {
            const formData = new FormData();
            const hoTen = document.getElementById('hoTen01').value;
            const ngaySinh = ngaySinhInput.value;
            const gioiTinh = document.querySelector('input[name="gioiTinh01"]:checked').value;
            const danToc = document.getElementById('danToc01').value;
            const soCmnd = document.getElementById('cccd01').value;
            const ngayCapCmnd = ngayCapCCCDInput.value;
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

            // Tải ảnh lên Cloudinary
            const anhCmndMatTruocFile = anhCmndMatTruocInput.files[0];
            const anhCmndMatSauFile = anhCmndMatSauInput.files[0];
            
            // Sử dụng biến toàn cục để lưu URL ảnh
            cccdTruocUrl = await uploadImageToCloudinary(anhCmndMatTruocFile, cccdTruocUrl);
            cccdSauUrl = await uploadImageToCloudinary(anhCmndMatSauFile, cccdSauUrl);

            if (!cccdTruocUrl || !cccdSauUrl) {
                toggleSubmitButton(false);
                isUploading = false;
                return;
            }

            formData.append('ho_ten', hoTen);
            formData.append('ngay_sinh', ngaySinh);
            formData.append('gioi_tinh', gioiTinh);
            formData.append('dan_toc', danToc);
            formData.append('so_cmnd', soCmnd);
            formData.append('ngay_cap_cmnd', ngayCapCmnd);
            formData.append('noi_cap_cmnd', noiCapCmnd);
            formData.append('thanh_pho', thanhPhoText);
            formData.append('quan', quanHuyenText);
            formData.append('phuong', phuongText);
            formData.append('so_nha_ten_duong', soNhaTenDuong);
            formData.append('so_dien_thoai', soDienThoai);
            formData.append('email', email);
            formData.append('ho_ten_phu_huynh', hoTenPhuHuynh);
            formData.append('so_dien_thoai_phu_huynh', soDienThoaiPhuHuynh);
            formData.append('nganh_dang_ky_1', nganhDangKy1);
            if (nganhDangKy2) formData.append('nganh_dang_ky_2', nganhDangKy2);
            if (nganhDangKy3) formData.append('nganh_dang_ky_3', nganhDangKy3);
            formData.append('anh_cmnd_mat_truoc', cccdTruocUrl);
            formData.append('anh_cmnd_mat_sau', cccdSauUrl);

            const selectedProgram = document.querySelector('input[name="chuongTrinhDaoTao01"]:checked').value;
            let apiUrl = '';
            if (selectedProgram === 'caodang') {
                apiUrl = `${BASE_API_URL}dang-ky-nhap-hoc/`;
            } else if (selectedProgram === 'phothong9plus') {
                apiUrl = `${BASE_API_URL}dang-ky-nhap-hoc-thpt/`;
                const chungNhanTotNghiepTHCSFile = fileBangTotNghiepInput.files[0];
                formData.append('chung_nhan_tot_nghiep_thcs', chungNhanTotNghiepTHCSFile);
                formData.append('nam_tot_nghiep_THCS', namTotNghiepTHCS01Select.value);
                formData.append('truong_tot_nghiep_THCS', truongTHCS01Input.value);
                const noiTotNghiepTHCS = `${xaPhuongTHCS01Select.options[xaPhuongTHCS01Select.selectedIndex].textContent}, ${quanHuyenTHCS01Select.options[quanHuyenTHCS01Select.selectedIndex].textContent}, ${tinhThanhPhoTHCS01Select.options[tinhThanhPhoTHCS01Select.selectedIndex].textContent}`;
                formData.append('noi_tot_nghiep', noiTotNghiepTHCS);
            }

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
                previewCCCDTruoc.src = '';
                previewCCCDTruoc.style.display = 'none';
                previewCCCDSau.src = '';
                previewCCCDSau.style.display = 'none';
                togglePhoThong9PlusFields();
                loadOptionsFromApi(tinhThanhPho01Select, ESGOO_API.provinces, 'Chọn tỉnh/thành phố');
                resetChildSelects(quanHuyen01Select, xaPhuong01Select);
            } else {
                const errorData = await response.json();
                let errorMessage = 'Đăng ký thất bại. ';
                if (errorData) {
                    for (const key in errorData) {
                        errorMessage += `${key}: ${errorData[key].join(', ')}\n`;
                    }
                }
                alert(errorMessage);
                console.error('Lỗi khi gửi form:', errorData);
            }
        } catch (error) {
            console.error('Lỗi kết nối hoặc xử lý:', error);
            alert('Có lỗi xảy ra, vui lòng thử lại sau.');
        } finally {
            toggleSubmitButton(false);
            isUploading = false;
        }
    });
});
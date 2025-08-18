


document.addEventListener('DOMContentLoaded', () => {
    // --- Khai báo các phần tử DOM ---
    const registrationForm01 = document.getElementById('registrationForm01');
    const chuongTrinhDaoTao01Radios = document.querySelectorAll('input[name="chuongTrinhDaoTao01"]');
    const phoThong9PlusFields01 = document.getElementById('phoThong9PlusFields01');
    
    // Trường input file mà bạn dùng cho cả THPT (trước đây) và THCS (bây giờ cho 9+)
    const fileBangTotNghiepInput = document.getElementById('bangTotNghiepTHPT01'); 
    // Lấy phần tử span hiển thị tên file cho trường tốt nghiệp
    const fileBangTotNghiepSpan = document.getElementById('fileBangTotNghiepTHPT01'); 
    // Lấy label của trường input file để cập nhật text
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
    const CLOUDINARY_UPLOAD_PRESET = 'SGGDCollege'; // Đảm bảo preset này là 'Unsigned'
    const CLOUDINARY_UPLOAD_URL = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`;
    // Thư mục mặc định cho ảnh CCCD
    const CLOUDINARY_FOLDER_CCCD = 'CCCD'; 
    // Thư mục cho bản sao tốt nghiệp
    const CLOUDINARY_FOLDER_BANSAOTOTNGHIEP = 'bansaototnghiep'; 

    // Hàm load options cho select box từ API
    const loadOptionsFromApi = async (selectElement, apiUrl, defaultText) => {
        selectElement.innerHTML = `<option value="">${defaultText}</option>`;
        selectElement.disabled = true; // Tắt select trong khi đang load

        // console.log(`Đang tải dữ liệu từ API: ${apiUrl}`);

        try {
            const response = await fetch(apiUrl);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();

            // console.log(`Dữ liệu nhận được từ ${apiUrl}:`, data);

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
        console.log(`Tỉnh/Thành phố được chọn (ID): ${selectedProvinceId}`);
        resetChildSelects(districtSelect, wardSelect);

        if (selectedProvinceId) {
            const districtApiUrl = `${ESGOO_API.districts}${selectedProvinceId}.htm`;
          
            await loadOptionsFromApi(districtSelect, districtApiUrl, 'Chọn quận/huyện');
        } else {
            districtSelect.disabled = true;
            wardSelect.disabled = true;
            console.log('Không có tỉnh/thành phố nào được chọn, vô hiệu hóa quận/huyện và xã/phường.');
        }
    };

    // Hàm xử lý thay đổi Quận/Huyện
    const handleDistrictChange = async (provinceSelect, districtSelect, wardSelect) => {
        const selectedDistrictId = districtSelect.value;
        console.log(`Quận/Huyện được chọn (ID): ${selectedDistrictId}`);
        wardSelect.innerHTML = '<option value="">Chọn xã/phường/thị trấn</option>';
        wardSelect.disabled = true;

        if (selectedDistrictId) {
            const wardApiUrl = `${ESGOO_API.wards}${selectedDistrictId}.htm`;
          
            await loadOptionsFromApi(wardSelect, wardApiUrl, 'Chọn xã/phường/thị trấn');
        } else {
            wardSelect.disabled = true;
            console.log('Không có quận/huyện nào được chọn, vô hiệu hóa xã/phường.');
        }
    };

    // Hàm ẩn/hiện trường "Phổ thông Cao đẳng 9+" và cập nhật trạng thái required của file tốt nghiệp
    const togglePhoThong9PlusFields = () => {
        const selectedProgramRadio = document.querySelector('input[name="chuongTrinhDaoTao01"]:checked');
        const selectedProgram = selectedProgramRadio ? selectedProgramRadio.value : '';
        const isPhoThong9Plus = selectedProgram === 'phothong9plus';

        if (phoThong9PlusFields01) {
            phoThong9PlusFields01.style.display = isPhoThong9Plus ? 'block' : 'none';
        } else {
            console.error("Không tìm thấy phần tử với ID 'phoThong9PlusFields01'. Vui lòng kiểm tra lại ID trong HTML và JS.");
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

        // --- Cập nhật trạng thái 'required' và label cho trường file tốt nghiệp ---
        if (fileBangTotNghiepInput && labelBangTotNghiep && fileBangTotNghiepSpan) {
            if (isPhoThong9Plus) {
                // Nếu là 9+, yêu cầu chứng nhận tốt nghiệp THCS
                fileBangTotNghiepInput.setAttribute('required', 'required');
                labelBangTotNghiep.textContent = 'Bản sao Chứng nhận tốt nghiệp THCS:';
                fileBangTotNghiepSpan.textContent = 'Chưa có file chứng nhận THCS được chọn';
                console.log("Hệ 9+, đặt required cho file chứng nhận tốt nghiệp THCS và cập nhật label.");
            } else {
                // Nếu là Cao đẳng hoặc khác, KHÔNG yêu cầu file tốt nghiệp
                fileBangTotNghiepInput.removeAttribute('required');
                labelBangTotNghiep.textContent = 'Bản sao bằng tốt nghiệp THPT (Không bắt buộc cho Cao đẳng):'; // Cập nhật để rõ ràng
                fileBangTotNghiepSpan.textContent = 'Chưa có file nào được chọn';
                // console.log("Hệ Cao đẳng hoặc khác, bỏ required cho file tốt nghiệp và cập nhật label.");
            }
        } else {
            console.error("Không tìm thấy các phần tử cho trường file tốt nghiệp (input, label hoặc span).");
        }


        if (!isPhoThong9Plus) {
            // Clear values and disable when hidden
            namTotNghiepTHCS01Select.value = '';
            truongTHCS01Input.value = '';
            tinhThanhPhoTHCS01Select.value = '';
            resetChildSelects(quanHuyenTHCS01Select, xaPhuongTHCS01Select);
        } else {
            // Re-enable/reload if it was previously hidden and data is available
            if (tinhThanhPhoTHCS01Select && (!tinhThanhPhoTHCS01Select.options.length > 1 || tinhThanhPhoTHCS01Select.options.length === 0)) {
                loadOptionsFromApi(tinhThanhPhoTHCS01Select, ESGOO_API.provinces, 'Chọn tỉnh/thành phố');
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
                // console.log(`File chọn cho ${input.id}: ${input.files[0].name}`);
            } else {
                fileNameSpan.textContent = 'Chưa có file nào được chọn';
                console.log(`Không có file nào được chọn cho ${input.id}.`);
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
        
    };

    // Hàm tải ảnh lên Cloudinary
    // Thêm tham số folderName để có thể chỉ định thư mục tải lên
    const uploadImageToCloudinary = async (file, folderName) => {
        if (!file) return null;

        const formData = new FormData();
        formData.append('file', file);
        formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
        formData.append('folder', folderName); // Sử dụng folderName được truyền vào

        console.log(`Đang tải file "${file.name}" lên Cloudinary (thư mục: ${folderName})...`);

        try {
            const response = await fetch(CLOUDINARY_UPLOAD_URL, {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                const errorData = await response.json();
                console.error('Lỗi khi tải file lên Cloudinary:', errorData);
                throw new Error(`Tải file lên Cloudinary thất bại: ${errorData.error.message || response.statusText}`);
            }

            const data = await response.json();
            console.log(`File "${file.name}" đã tải lên thành công: ${data.secure_url}`);
            return data.secure_url;
        } catch (error) {
            console.error('Lỗi kết nối Cloudinary:', error);
            alert(`Không thể tải file "${file.name}" lên Cloudinary. Vui lòng kiểm tra kết nối mạng hoặc thử lại.`);
            return null;
        }
    };

    // --- Khởi tạo ban đầu ---
    
    loadOptionsFromApi(tinhThanhPho01Select, ESGOO_API.provinces, 'Chọn tỉnh/thành phố');
    populateNamTotNghiepTHCS();
    togglePhoThong9PlusFields(); // Gọi lần đầu để thiết lập trạng thái ban đầu

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
                console.log('Chọn địa chỉ khác: hiển thị trường nhập liệu.');
            } else {
                diaChiKhacGroup01.style.display = 'none';
                diaChiNhanKhac01Textarea.removeAttribute('required');
                diaChiNhanKhac01Textarea.value = '';
                console.log('Chọn địa chỉ mặc định: ẩn trường nhập liệu khác.');
            }
        });
    });

    fileInputs01.forEach(input => {
        input.addEventListener('change', handleFileSelect);
    });

    // Xử lý gửi form
    registrationForm01.addEventListener('submit', async (event) => {
        event.preventDefault(); // Ngăn chặn form gửi đi mặc định

        let isValid = registrationForm01.checkValidity();
        const camDoan01Checkbox = document.getElementById('camDoan01');

        if (!camDoan01Checkbox.checked) {
            isValid = false;
            alert('Bạn phải cam đoan những lời khai là đúng sự thật.');
            camDoan01Checkbox.focus();
            console.log('Checkbox cam đoan chưa được chọn.');
        }

        if (isValid) {
            alert('Đang tải ảnh và gửi thông tin. Vui lòng đợi...');
            console.log('Form hợp lệ, bắt đầu quá trình tải ảnh và gửi dữ liệu.');

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

            // Lấy file ảnh CCCD
            const anhCmndMatTruocFile = document.getElementById('anhCCCDTruoc01').files[0];
            const anhCmndMatSauFile = document.getElementById('anhCCCDSau01').files[0];

            // --- Tải ảnh CCCD lên Cloudinary và lấy URL ---
            const anhCmndMatTruocUrl = await uploadImageToCloudinary(anhCmndMatTruocFile, CLOUDINARY_FOLDER_CCCD);
            const anhCmndMatSauUrl = await uploadImageToCloudinary(anhCmndMatSauFile, CLOUDINARY_FOLDER_CCCD);

            // Kiểm tra nếu có bất kỳ ảnh CCCD nào không tải được
            if ((anhCmndMatTruocFile && !anhCmndMatTruocUrl) ||
                (anhCmndMatSauFile && !anhCmndMatSauUrl)) {
                alert('Có lỗi khi tải lên một hoặc nhiều ảnh CCCD. Vui lòng kiểm tra lại.');
                return; // Ngừng quá trình gửi form nếu có lỗi tải ảnh CCCD
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

            // Thêm URL ảnh CCCD vào FormData
            if (anhCmndMatTruocUrl) formData.append('anh_cmnd_mat_truoc', anhCmndMatTruocUrl);
            if (anhCmndMatSauUrl) formData.append('anh_cmnd_mat_sau', anhCmndMatSauUrl);

            const selectedProgram = document.querySelector('input[name="chuongTrinhDaoTao01"]:checked').value;
            let apiUrl = '';

            if (selectedProgram === 'caodang') {
                apiUrl = `${BASE_API_URL}dang-ky-nhap-hoc/`;
                console.log('Hệ Cao đẳng: Không đính kèm bất kỳ file tốt nghiệp nào.');
                // Đảm bảo rằng API cho Cao đẳng không yêu cầu trường này.
            } else if (selectedProgram === 'phothong9plus') {
                apiUrl = `${BASE_API_URL}dang-ky-nhap-hoc-thpt/`;

                // --- Chỉ tải và đính kèm URL chứng nhận tốt nghiệp THCS cho hệ 9+ ---
                const chungNhanTotNghiepTHCSFile = fileBangTotNghiepInput.files[0];
                if (chungNhanTotNghiepTHCSFile) {
                    const chungNhanTotNghiepTHCSUrl = await uploadImageToCloudinary(chungNhanTotNghiepTHCSFile, CLOUDINARY_FOLDER_BANSAOTOTNGHIEP);
                    if (chungNhanTotNghiepTHCSUrl) {
                        formData.append('chung_nhan_tot_nghiep_thcs', chungNhanTotNghiepTHCSUrl); // Gửi URL lên backend
                        console.log('Đã đính kèm URL file chứng nhận tốt nghiệp THCS cho hệ Phổ thông 9+.');
                    } else {
                        alert('Không thể tải file chứng nhận tốt nghiệp THCS lên Cloudinary. Vui lòng thử lại.');
                        return; // Ngừng nếu tải file tốt nghiệp thất bại
                    }
                } else {
                    console.warn('Không có file chứng nhận tốt nghiệp THCS được chọn cho hệ Phổ thông 9+. Nếu trường này bắt buộc, API sẽ báo lỗi.');
                }

                formData.append('nam_tot_nghiep_THCS', namTotNghiepTHCS01Select.value);
                formData.append('truong_tot_nghiep_THCS', truongTHCS01Input.value);
                // Lấy thông tin nơi tốt nghiệp THCS dưới dạng text
                const noiTotNghiepTHCS = `${xaPhuongTHCS01Select.options[xaPhuongTHCS01Select.selectedIndex].textContent}, ${quanHuyenTHCS01Select.options[quanHuyenTHCS01Select.selectedIndex].textContent}, ${tinhThanhPhoTHCS01Select.options[tinhThanhPhoTHCS01Select.selectedIndex].textContent}`;
                formData.append('noi_tot_nghiep', noiTotNghiepTHCS);
            }

            // console.log('Dữ liệu FormData trước khi gửi:', Object.fromEntries(formData.entries()));

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
                    // Reset các span hiển thị tên file
                    fileInputs01.forEach(input => {
                        const fileNameSpanId = 'file' + input.id.charAt(0).toUpperCase() + input.id.slice(1);
                        const fileNameSpan = document.getElementById(fileNameSpanId);
                        if (fileNameSpan) {
                            fileNameSpan.textContent = 'Chưa có file nào được chọn';
                        }
                    });
                    togglePhoThong9PlusFields(); // Gọi lại để reset trạng thái required và label
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
            }
        } else {
            alert('Vui lòng điền đầy đủ và chính xác các thông tin bắt buộc.');
            console.log('Form không hợp lệ. Vui lòng điền đủ thông tin.');
        }
    });
});
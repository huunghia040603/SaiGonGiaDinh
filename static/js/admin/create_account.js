
document.addEventListener('DOMContentLoaded', function() {


    // --- Lấy các phần tử DOM ---
    const createAccountForm = document.getElementById('createAccountForm');
    const roleRadios = document.querySelectorAll('input[name="account_role"]');
    const formHeading = document.getElementById('formHeading');
    const facultyDepartmentContainer = document.getElementById('facultyDepartmentContainer');


    const loadingOverlay = document.getElementById('loadingOverlay');
    const loadingText = document.getElementById('loadingText');
    const submitButton = document.getElementById('submitButton');

    // Các container chứa các trường dữ liệu đặc thù theo vai trò
    const roleSpecificFieldsContainers = {
        student: document.getElementById('studentFields'),
        highschool_student: document.getElementById('highschoolStudentFields'),
        staff: document.getElementById('staffFields'),
        faculty: document.getElementById('facultyFields')
    };

    // Các trường liên quan đến ảnh người dùng
    const userPhotoInput = document.getElementById('user_photo');
    const photoPreviewContainer = document.getElementById('photoPreviewContainer');
    const photoPreview = document.getElementById('photoPreview');
    const fileNameDisplay = document.getElementById('fileNameDisplay');

    // Các dropdown chung
    const nationalitySelect = document.getElementById('nationality');
    const placeOfBirthSelect = document.getElementById('place_of_birth');
    const citySelect = document.getElementById('city');
    const districtSelect = document.getElementById('district');
    const genderSelect = document.getElementById('gender');

    // Các dropdown/input cho Sinh viên
    const studentProgramSelect = document.getElementById('program');
    const studentMajorSelect = document.getElementById('major');
    const studentAcademicYearSelect = document.getElementById('academic_year');

    const studentAcademicYearSelect1 = document.getElementById('academic_year1');
    const studentDepartmentSelect = document.getElementById('department');
    const studentStatusSelect = document.getElementById('student_status');
    const classCollegeSelect = document.getElementById('classCollege'); // Thêm biến DOM cho dropdown lớp học

    // Các dropdown/input cho Học sinh 9+
    const hsGradeSelect = document.getElementById('hs_grade');
    // const hsAdmissionYearSelect = document.getElementById('hs_admission_year');
    // const hsRegistrationMajorSelect = document.getElementById('hs_registration_major');
    const classTHPTSelect = document.getElementById('classTHPT'); // THÊM BIẾN DOM CHO DROPDOWN LỚP THPT

    // Các dropdown/input cho Nhân viên
    const staffTypeSelect = document.getElementById('staff_type');
    const staffDepartmentSelect = document.getElementById('department_staff');
    const staffCodeInput = document.getElementById('staff_code'); // Lấy tham chiếu đến input staff_code

    // Các dropdown/input cho Giảng viên
    const facultyTypeSelect = document.getElementById('faculty_type');
    const facultyDepartmentSelect = document.getElementById('department_faculty');
    const officeLocationSelect = document.getElementById('office_location');

    // --- Định nghĩa các API Endpoint ---
    const API_ENDPOINTS = {
        student: 'https://saigongiadinh.pythonanywhere.com/create_student_account/',
        faculty: 'https://saigongiadinh.pythonanywhere.com/create_faculty_account/',
        departments: 'https://saigongiadinh.pythonanywhere.com/departments/',
        programs: 'https://saigongiadinh.pythonanywhere.com/programs/',
        majors: 'https://saigongiadinh.pythonanywhere.com/majors/',
        academicYears: 'https://saigongiadinh.pythonanywhere.com/academic-years/',
        majorsByDepartment: 'https://saigongiadinh.pythonanywhere.com/major-list-by-department/',
        countries: 'https://restcountries.com/v3.1/all?fields=name,cca2',
        provinces: 'https://esgoo.net/api-tinhthanh/1/0.htm',
        districts: 'https://esgoo.net/api-tinhthanh/2/',
        classCollege: 'https://saigongiadinh.pythonanywhere.com/classCollege/', // Thêm endpoint API cho lớp học
        classesId: 'https://saigongiadinh.pythonanywhere.com/classesId/', // THÊM ENDPOINT API CHO LỚP THPT
    };

    // --- Cấu hình Cloudinary ---
    const CLOUDINARY_CLOUD_NAME = 'dftarzzfw';
    const CLOUDINARY_UPLOAD_PRESET = 'SGGDCollege';
    const CLOUDINARY_UPLOAD_URL = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`;

    // --- Dữ liệu được cache cho các dropdown ---
    let allDepartments = [];
    let allPrograms = [];
    let allMajors = [];
    let allAcademicYears = [];
    let allProvinces = [];
    let allCountries = [];
    let allClassCollege = []; // Thêm biến cache cho dữ liệu lớp học
    let allHighschoolClasses = []; // THÊM BIẾN CACHE CHO DỮ LIỆU LỚP THPT

    // Dữ liệu cho office_location - Lấy từ OFFICE_TYPE_CHOICES trong models (frontend hardcoded)
    const OFFICE_LOCATIONS = [
        { value: 'TUYEN_SINH', name: 'Phòng tuyển sinh' },
        { value: 'KE_TOAN', name: 'Phòng kế toán' },
        { value: 'DAO_TAO', name: 'Phòng đào tạo' },
        { value: 'CNTT', name: 'Phòng công nghệ thông tin' },
        { value: 'KHAC', name: 'Phòng ban khác' },
    ];

    // Dữ liệu cho Staff Department - Mapping giữa value và phần viết tắt cho mã NV
    const STAFF_DEPARTMENTS_MAPPING = [
        { value: 'TUYEN_SINH', name: 'Phòng tuyển sinh', code_prefix: 'TS' },
        { value: 'KE_TOAN', name: 'Phòng kế toán', code_prefix: 'KT' },
        { value: 'CNTT', name: 'Phòng công nghệ thông tin', code_prefix: 'CNTT' },
        { value: 'KHAC', name: 'Phòng ban khác', code_prefix: 'KHAC' }
    ];

    // --- Các hàm tiện ích ---

    /**
     * Hiển thị thông báo trên giao diện.
     * @param {string} msg - Nội dung thông báo.
     * @param {'success'|'error'|''} type - Loại thông báo (success, error, hoặc rỗng để xóa).
     */

    /**
     * Hiển thị overlay tải dữ liệu.
     * @param {string} text - Văn bản hiển thị trên overlay.
     */
    function showLoading(text = 'Đang xử lý...') {
        loadingText.textContent = text;
        loadingOverlay.style.display = 'flex';
        submitButton.disabled = true; // Vô hiệu hóa nút gửi khi đang tải
    }

    /**
     * Ẩn overlay tải dữ liệu.
     */
    function hideLoading() {
        loadingOverlay.style.display = 'none';
        submitButton.disabled = false; // Kích hoạt lại nút gửi
    }

    /**
     * Tải ảnh lên Cloudinary.
     * @param {File} file - Đối tượng File ảnh.
     * @returns {Promise<string|null>} URL của ảnh đã tải lên hoặc null nếu lỗi.
     */
    async function uploadImageToCloudinary(file) {
        if (!file) return null;
        const formData = new FormData();
        formData.append('file', file);
        formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);

        try {
            const response = await fetch(CLOUDINARY_UPLOAD_URL, {
                method: 'POST',
                body: formData,
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(`Cloudinary upload failed: ${errorData.error.message || response.statusText}`);
            }
            const data = await response.json();
            return data.secure_url;
        } catch (error) {
            console.error('Lỗi khi upload ảnh lên Cloudinary:', error);
            alert(`Lỗi khi upload ảnh: ${error.message}`, 'error');
            return null;
        }
    }

    /**
     * Lấy token xác thực từ localStorage.
     * @returns {string|null} Token xác thực hoặc null nếu không có.
     */
    function getAuthToken() {
        return localStorage.getItem('adminAuthToken');
    }

    // --- Các hàm tải dữ liệu cho Dropdown ---

    /**
     * Tải dữ liệu từ một URL API.
     * @param {string} url - URL của API.
     * @returns {Promise<Array|Object>} Dữ liệu JSON hoặc mảng rỗng nếu lỗi.
     */
    async function fetchData(url) {
        try {
            const response = await fetch(url);
            if (!response.ok) {
                console.warn(`Cảnh báo: Lỗi HTTP ${response.status} khi tải dữ liệu từ ${url}`);
                return [];
            }
            return await response.json();
        } catch (error) {
            console.error(`Lỗi khi tải dữ liệu từ ${url}:`, error);
            return [];
        }
    }

    /**
     * Điền dữ liệu vào một dropdown (thẻ select).
     * @param {HTMLSelectElement} selectElement - Phần tử select.
     * @param {Array<Object>} data - Mảng dữ liệu để điền vào dropdown.
     * @param {string} valueKey - Khóa để lấy giá trị cho option.value.
     * @param {string} textKey - Khóa để lấy văn bản hiển thị cho option.textContent.
     * @param {string} defaultOptionText - Văn bản cho option mặc định.
     */
    function populateDropdown(selectElement, data, valueKey = 'id', textKey = 'name', defaultOptionText = 'Chọn...') {
        selectElement.innerHTML = `<option value="" disabled selected>${defaultOptionText}</option>`;
        data.forEach(item => {
            const option = document.createElement('option');
            option.value = item[valueKey];
            option.textContent = item[textKey];
            selectElement.appendChild(option);
        });
    }

    /**
     * Tải dữ liệu quốc gia từ Rest Countries API và điền vào dropdown.
     */
    async function loadRestCountriesData() {
        try {
            const countriesData = await fetchData(API_ENDPOINTS.countries);
            if (countriesData && countriesData.length > 0) {
                allCountries = countriesData.map(country => ({
                    id: country.cca2,
                    name: country.name.common
                }));

                const preferredCountryName = 'Vietnam';
                let vietnam = null;
                // Lọc Việt Nam ra để đưa lên đầu
                allCountries = allCountries.filter(country => {
                    if (country.name === preferredCountryName) {
                        vietnam = country;
                        return false;
                    }
                    return true;
                });
                // Sắp xếp các quốc gia còn lại theo bảng chữ cái
                allCountries.sort((a, b) => a.name.localeCompare(b.name));
                // Chèn Việt Nam vào đầu danh sách
                if (vietnam) {
                    allCountries.unshift(vietnam);
                }
                populateDropdown(nationalitySelect, allCountries, 'id', 'name', 'Chọn quốc tịch');
                // Chọn mặc định Việt Nam nếu có
                if (vietnam) {
                    nationalitySelect.value = vietnam.id;
                }
            } else {
                console.warn('Không có dữ liệu quốc gia từ Rest Countries API.');
                populateDropdown(nationalitySelect, [], 'id', 'name', 'Không thể tải quốc tịch');
            }
        } catch (error) {
            console.error('Lỗi khi tải dữ liệu quốc gia từ Rest Countries API:', error);
            alert('Không thể tải danh sách quốc gia. Vui lòng thử lại.', 'error');
        }
    }

    /**
     * Tải dữ liệu tỉnh/thành từ Esgoo.net API và điền vào dropdown.
     */
    async function loadEsgooProvincesAndDistricts() {
        showLoading('Đang tải dữ liệu địa lý Việt Nam...');
        try {
            const provincesResponse = await fetchData(API_ENDPOINTS.provinces);
            if (provincesResponse && provincesResponse.data) {
                allProvinces = provincesResponse.data;
                populateDropdown(placeOfBirthSelect, allProvinces, 'id', 'name', 'Chọn tỉnh/thành (nơi sinh)');
                populateDropdown(citySelect, allProvinces, 'id', 'name', 'Chọn tỉnh/thành (cư trú)');
            } else {
                console.warn('Không có dữ liệu tỉnh/thành từ Esgoo.net.');
                populateDropdown(placeOfBirthSelect, [], 'id', 'name', 'Không thể tải tỉnh/thành');
                populateDropdown(citySelect, [], 'id', 'name', 'Không thể tải tỉnh/thành');
            }
        } catch (error) {
            console.error('Lỗi khi tải dữ liệu tỉnh/thành từ Esgoo.net:', error);
            alert('Không thể tải dữ liệu tỉnh/thành. Vui lòng kiểm tra kết nối hoặc API.', 'error');
        } finally {
            hideLoading();
        }
    }

    /**
     * Tải dữ liệu quận/huyện dựa trên ID tỉnh/thành đã chọn.
     * @param {string} provinceId - ID của tỉnh/thành.
     * @param {HTMLSelectElement} targetSelectElement - Phần tử select để điền dữ liệu quận/huyện.
     * @param {string} defaultOptionText - Văn bản cho option mặc định.
     */
    async function loadDistricts(provinceId, targetSelectElement, defaultOptionText = 'Chọn quận/huyện') {
        populateDropdown(targetSelectElement, [], 'id', 'name', 'Đang tải quận/huyện...');
        targetSelectElement.disabled = true; // Vô hiệu hóa dropdown quận/huyện khi đang tải hoặc không có tỉnh/thành

        if (!provinceId) {
            populateDropdown(targetSelectElement, [], 'id', 'name', 'Chọn tỉnh/thành trước');
            return;
        }

        showLoading('Đang tải quận/huyện...');
        try {
            const districtsData = await fetchData(`${API_ENDPOINTS.districts}${provinceId}.htm`);
            if (districtsData && districtsData.data) {
                populateDropdown(targetSelectElement, districtsData.data, 'id', 'name', defaultOptionText);
                targetSelectElement.disabled = false; // Kích hoạt lại sau khi tải xong
            } else {
                populateDropdown(targetSelectElement, [], 'id', 'name', 'Không có quận/huyện');
            }
        } catch (error) {
            console.error(`Lỗi khi tải quận/huyện cho tỉnh ${provinceId}:`, error);
            populateDropdown(targetSelectElement, [], 'id', 'name', 'Không thể tải quận/huyện');
        } finally {
            hideLoading();
        }
    }

    /**
     * Tải dữ liệu lớp học dựa trên ID ngành đã chọn.
     * @param {string} majorId - ID của ngành học.
     */
    async function loadClassCollegeByMajor(majorId) {
        populateDropdown(classCollegeSelect, [], 'id', 'class_name', 'Đang tải lớp...'); //
        classCollegeSelect.disabled = true; // Vô hiệu hóa dropdown khi đang tải

        if (!majorId) {
            populateDropdown(classCollegeSelect, [], 'id', 'class_name', 'Chọn ngành trước'); //
            return;
        }

        showLoading('Đang tải danh sách lớp...'); //
        try {
            const classData = await fetchData(`${API_ENDPOINTS.classCollege}?major_id=${majorId}`); //
            if (classData && classData.length > 0) {
                allClassCollege = classData; // Cache dữ liệu lớp học
                populateDropdown(classCollegeSelect, allClassCollege, 'id', 'class_name', 'Chọn lớp'); // Sử dụng 'class_name' để hiển thị
                classCollegeSelect.disabled = false; // Kích hoạt lại sau khi tải xong
            } else {
                populateDropdown(classCollegeSelect, [], 'id', 'class_name', 'Không có lớp nào'); //
            }
        } catch (error) {
            console.error(`Lỗi khi tải lớp cho ngành ${majorId}:`, error); //
            populateDropdown(classCollegeSelect, [], 'id', 'class_name', 'Không thể tải lớp'); //
        } finally {
            hideLoading(); //
        }
    }

    /**
     * Tải dữ liệu lớp THPT dựa trên khối lớp đã chọn.
     * @param {string} gradeLevel - Khối lớp (ví dụ: 'KHOI_10', 'KHOI_11', 'KHOI_12').
     */
    async function loadHighschoolClasses(gradeLevel) {
        populateDropdown(classTHPTSelect, [], 'class_id', 'class_id', 'Đang tải lớp...');
        classTHPTSelect.disabled = true;

        if (!gradeLevel) {
            populateDropdown(classTHPTSelect, [], 'class_id', 'class_id', 'Chọn khối lớp trước');
            return;
        }

        showLoading('Đang tải danh sách lớp THPT...');
        try {
            const classesData = await fetchData(`${API_ENDPOINTS.classesId}?grade_level=${gradeLevel}`);
            if (classesData && classesData.length > 0) {
                allHighschoolClasses = classesData;
                populateDropdown(classTHPTSelect, allHighschoolClasses, 'class_id', 'class_id', 'Chọn lớp');
                classTHPTSelect.disabled = false;
            } else {
                populateDropdown(classTHPTSelect, [], 'class_id', 'class_id', 'Không có lớp nào');
            }
        } catch (error) {
            console.error(`Lỗi khi tải lớp THPT cho khối ${gradeLevel}:`, error);
            populateDropdown(classTHPTSelect, [], 'class_id', 'class_id', 'Không thể tải lớp');
        } finally {
            hideLoading();
        }
    }

    /**
     * Tải tất cả dữ liệu cần thiết cho các dropdown khi khởi tạo.
     */
    async function loadAllDropdownData() {
        showLoading('Đang tải dữ liệu hệ thống...');
        // Tải dữ liệu từ các API của backend trước
        await Promise.all([
            fetchData(API_ENDPOINTS.departments).then(data => allDepartments = data),
            fetchData(API_ENDPOINTS.programs).then(data => allPrograms = data),
            fetchData(API_ENDPOINTS.majors).then(data => allMajors = data),
            fetchData(API_ENDPOINTS.academicYears).then(data => allAcademicYears = data)
        ]);
        populateInitialDropdowns(); // Điền dữ liệu vào các dropdown sau khi tải xong

        // Tải dữ liệu địa lý và quốc gia
        await Promise.all([
            loadRestCountriesData(),
            loadEsgooProvincesAndDistricts()
        ]);
        hideLoading();
    }

    /**
     * Điền dữ liệu vào các dropdown ban đầu sau khi tải dữ liệu cache.
     */
    function populateInitialDropdowns() {
        // Các trường chung
        populateDropdown(nationalitySelect, allCountries, 'id', 'name', 'Chọn quốc tịch');
        populateDropdown(placeOfBirthSelect, allProvinces, 'id', 'name', 'Chọn tỉnh/thành (nơi sinh)');
        populateDropdown(citySelect, allProvinces, 'id', 'name', 'Chọn tỉnh/thành (cư trú)');

        // Reset và vô hiệu hóa districtSelect khi khởi tạo
        populateDropdown(districtSelect, [], 'id', 'name', 'Chọn tỉnh/thành trước');
        districtSelect.disabled = true;

        // Các trường cho Sinh viên
        populateDropdown(studentProgramSelect, allPrograms, 'id', 'name', 'Chọn chương trình học');
        populateDropdown(studentMajorSelect, [], 'id', 'name', 'Chọn khoa trước để chọn ngành'); // Ban đầu rỗng, đợi chọn khoa
        populateDropdown(studentAcademicYearSelect, allAcademicYears, 'id', 'name', 'Chọn năm học');
        populateDropdown(studentDepartmentSelect, allDepartments, 'id', 'name', 'Chọn khoa');
        populateDropdown(studentStatusSelect, [
            { value: 'DANG_HOC', name: 'Đang học' },
            { value: 'DA_TOT_NGHIEP', name: 'Đã tốt nghiệp' },
            { value: 'SAP_TOT_NGHIEP', name: 'Sắp tốt nghiệp' },
            { value: 'THOI_HOC', name: 'Đã thôi học' },
            { value: 'BUOC_THOI_HOC', name: 'Buộc thôi học' },
            { value: 'BAO_LUU', name: 'Bảo lưu' }
        ], 'value', 'name', 'Chọn trạng thái');
        populateDropdown(classCollegeSelect, [], 'id', 'class_name', 'Chọn ngành trước'); // Khởi tạo dropdown lớp học
        classCollegeSelect.disabled = true; // Vô hiệu hóa ban đầu

        // Các trường cho Học sinh 9+
        populateDropdown(hsGradeSelect, [
            { value: 'KHOI_10', name: 'Lớp 10' }, // Cập nhật giá trị để khớp với API
            { value: 'KHOI_11', name: 'Lớp 11' }, // Cập nhật giá trị để khớp với API
            { value: 'KHOI_12', name: 'Lớp 12' }  // Cập nhật giá trị để khớp với API
        ], 'value', 'name', 'Chọn khối lớp');
         populateDropdown(studentAcademicYearSelect1, allAcademicYears, 'id', 'name', 'Chọn năm học');
        // populateDropdown(hsAdmissionYearSelect, [
        //     { value: '2025', name: '2025' },
        //     { value: '2026', name: '2026' },
        //     { value: '2027', name: '2027' }
        // ], 'value', 'name', 'Chọn năm dự kiến');
        // populateDropdown(hsRegistrationMajorSelect, allMajors, 'id', 'name', 'Chọn ngành quan tâm'); // Tất cả các ngành cho HS
        populateDropdown(classTHPTSelect, [], 'class_id', 'class_id', 'Chọn khối lớp trước'); // Khởi tạo dropdown lớp THPT
        classTHPTSelect.disabled = true; // Vô hiệu hóa ban đầu

        // Các trường cho Nhân viên
        populateDropdown(staffTypeSelect, [
            { value: 'NHAN_VIEN', name: 'Nhân viên' },
            { value: 'NGHIEN_CUU_VIEN', name: 'Nghiên cứu viên' },
            { value: 'THINH_GIANG', name: 'Chuyên viên' },
            { value: 'KHAC', name: 'Khác' }
        ], 'value', 'name', 'Chọn loại nhân viên');

        // Các trường cho Giảng viên
        populateDropdown(facultyTypeSelect, [
            { value: 'NGHIEN_CUU_VIEN', name: 'Nghiên cứu viên' },
            { value: 'THINH_GIANG', name: 'Thỉnh giảng' },
            { value: '9+', name: 'Giảng viên hệ 9+' },
            { value: 'CĐ', name: 'Giảng viên hệ cao đẳng' }
        ], 'value', 'name', 'Chọn loại giảng viên');

        // Staff Department (sử dụng mapping đã định nghĩa)
        populateDropdown(staffDepartmentSelect, STAFF_DEPARTMENTS_MAPPING, 'value', 'name', 'Chọn phòng ban');
        populateDropdown(facultyDepartmentSelect, allDepartments, 'id', 'name', 'Chọn khoa');
        // ĐỔ DỮ LIỆU CHO OFFICE_LOCATION TỪ MẢNG OFFICE_LOCATIONS
        populateDropdown(officeLocationSelect, OFFICE_LOCATIONS, 'value', 'name', 'Chọn phòng ban');
    }

    /**
     * Lọc các ngành học dựa trên khoa đã chọn cho sinh viên.
     */
    async function filterMajorsByDepartment() {
        const selectedDepartmentId = studentDepartmentSelect.value;
        if (selectedDepartmentId) {
            showLoading('Đang tải ngành học...');
            try {
                const filteredMajors = await fetchData(`${API_ENDPOINTS.majorsByDepartment}?department_id=${selectedDepartmentId}`);
                populateDropdown(studentMajorSelect, filteredMajors, 'id', 'name', 'Chọn ngành học');
                // Khi ngành được lọc xong, nếu có ngành đầu tiên, tải lớp cho ngành đó
                if (filteredMajors.length > 0) {
                    // Để tránh tải tự động nếu không muốn, có thể thay đổi logic này
                    // Ví dụ: chỉ tải khi người dùng chọn một ngành cụ thể
                    // Tạm thời, để đảm bảo tính năng hoạt động, sẽ tải lớp cho ngành đầu tiên (nếu có)
                    loadClassCollegeByMajor(filteredMajors[0].id);
                } else {
                    populateDropdown(classCollegeSelect, [], 'id', 'class_name', 'Không có ngành để chọn lớp'); //
                    classCollegeSelect.disabled = true; //
                }
            } catch (error) {
                console.error('Lỗi khi tải ngành theo khoa:', error);
                populateDropdown(studentMajorSelect, [], 'id', 'name', 'Không thể tải ngành học');
                populateDropdown(classCollegeSelect, [], 'id', 'class_name', 'Không thể tải lớp'); //
                classCollegeSelect.disabled = true; //
            } finally {
                hideLoading();
            }
        } else {
            populateDropdown(studentMajorSelect, [], 'id', 'name', 'Chọn khoa trước để chọn ngành');
            populateDropdown(classCollegeSelect, [], 'id', 'class_name', 'Chọn ngành trước'); // Reset lớp khi không có khoa
            classCollegeSelect.disabled = true; //
        }
    }

    // --- Hàm tạo mã nhân viên ---

    /**
     * Tự động tạo mã nhân viên dựa trên phòng ban đã chọn.
     */
    function generateStaffCode() {
        const selectedDepartmentValue = staffDepartmentSelect.value;
        const department = STAFF_DEPARTMENTS_MAPPING.find(dept => dept.value === selectedDepartmentValue);

        let prefix = 'NV';
        if (department && department.code_prefix) {
            prefix = `NV-${department.code_prefix}`;
        } else {
            // Mặc định nếu không tìm thấy hoặc chưa chọn
            prefix = 'NV-KHAC';
        }

        const randomNumber = Math.floor(10000 + Math.random() * 90000); // 5 số ngẫu nhiên
        if (staffCodeInput) { // Đảm bảo phần tử tồn tại trước khi gán giá trị
            staffCodeInput.value = `${prefix}-${randomNumber}`;

        } else {
            console.warn('Không tìm thấy '); // LOG 2
        }
    }

    function generateFacultyCode() {
    // Lấy giá trị từ dropdown 'faculty_type' đã được khai báo ở đầu file
    const selectedFacultyType = facultyTypeSelect.value;

    let facultyTypePrefix = '';
    // Dựa vào giá trị của facultyTypeSelect để xác định prefix
    if (selectedFacultyType === 'NGHIEN_CUU_VIEN') {
        facultyTypePrefix = 'NCV'; // Ví dụ: NCV cho Nghiên cứu viên
    } else if (selectedFacultyType === 'THINH_GIANG') {
        facultyTypePrefix = 'TG'; // Thỉnh giảng
    } else if (selectedFacultyType === '9+') {
        facultyTypePrefix = '9P'; // Ví dụ: 9P cho Giảng viên hệ 9+
    } else if (selectedFacultyType === 'CĐ') {
        facultyTypePrefix = 'CD'; // Ví dụ: CD cho Giảng viên hệ cao đẳng
    } else {
        // Mặc định nếu không xác định được loại giảng viên hoặc là một giá trị khác
        facultyTypePrefix = 'KHAC';
    }

    // Tiền tố cố định "GV"
    const prefix = `GV-${facultyTypePrefix}`;

    const randomNumber = Math.floor(10000 + Math.random() * 90000); // 5 số ngẫu nhiên

    // Lấy tham chiếu đến input faculty_code đã được khai báo
    const facultyCodeInput = document.getElementById('faculty_code');

    if (facultyCodeInput) {
        facultyCodeInput.value = `${prefix}-${randomNumber}`;
    } else {
        console.warn('Không tìm thấy phần tử input cho mã giảng viên với ID "faculty_code".');
    }
}
    // --- Logic chuyển đổi loại form ---

    /**
     * Cập nhật hiển thị các trường form dựa trên vai trò được chọn.
     * Đồng thời quản lý thuộc tính 'required' và reset form.
     */
    function updateFormVisibility() {
        const selectedRole = document.querySelector('input[name="account_role"]:checked').value;

        // Ẩn tất cả các trường đặc thù theo vai trò và xóa 'required'
        for (const role in roleSpecificFieldsContainers) {
            const container = roleSpecificFieldsContainers[role];
            if (container) {
                container.style.display = 'none';
                toggleRequiredFields(container, false);
            }
        }

        // Hiển thị các trường của vai trò đã chọn và thêm 'required'
        const currentRoleContainer = roleSpecificFieldsContainers[selectedRole];
        if (currentRoleContainer) {
            currentRoleContainer.style.display = 'block';
            toggleRequiredFields(currentRoleContainer, true);
        }

        // Cập nhật tiêu đề form
        let headingText = "Tạo Tài Khoản Mới";
        switch (selectedRole) {
            case 'student':
                headingText = "Tạo Tài Khoản Sinh viên";
                break;
            case 'highschool_student':
                headingText = "Tạo Tài Khoản Học sinh 9+";
                // Khi chuyển sang Học sinh 9+, tải lớp THPT ban đầu
                const initialHsGrade = hsGradeSelect.value;
                if (initialHsGrade) {
                    loadHighschoolClasses(initialHsGrade);
                }
                break;
            case 'staff':
                headingText = "Tạo Tài Khoản Nhân viên";
                // Khi chuyển sang Staff, tạo mã nhân viên ban đầu
                break;
            case 'faculty':
                headingText = "Tạo Tài Khoản Giảng viên";
                break;
        }
        formHeading.textContent = headingText;

        // Reset form và xem trước ảnh khi thay đổi loại tài khoản
        createAccountForm.reset();
        resetPhotoPreview();

        populateInitialDropdowns(); // Điền lại tất cả các dropdown
        filterMajorsByDepartment(); // Lọc lại ngành học cho sinh viên nếu đang ở vai trò sinh viên

        // Xử lý logic hiển thị/ẩn dropdown khoa cho giảng viên
        if (selectedRole === 'faculty') {
            handleFacultyDepartmentVisibility();
        }
    }

    /**
     * Bật/tắt thuộc tính 'required' cho các trường input/select trong một container.
     * @param {HTMLElement} container - Phần tử container chứa các trường.
     * @param {boolean} isRequired - True để bật required, false để tắt.
     */
    function toggleRequiredFields(container, isRequired) {
        if (!container) return;
        const inputs = container.querySelectorAll('input, select');
        inputs.forEach(input => {
            // BỎ QUA các trường file, checkbox và staff_code (vì staff_code sẽ được quản lý riêng)
            if (input.type !== 'file' && input.type !== 'checkbox' && input.id !== 'staff_code' && input.id !== 'faculty_code') {
                input.required = isRequired;
            }
        });
        // Đảm bảo staff_code luôn là required khi vai trò là staff
        if (container.id === 'staffFields' && staffCodeInput) {
            staffCodeInput.required = true;
        }
        // Đảm bảo faculty_code luôn là required khi vai trò là faculty
        const facultyCodeInput = document.getElementById('faculty_code');
        if (container.id === 'facultyFields' && facultyCodeInput) {
            facultyCodeInput.required = true;
        }
    }

    /**
     * Đặt các trường chung là bắt buộc.
     */
    function setCommonFieldsRequired() {
        const commonRequiredFields = [
            'email', 'first_name', 'last_name',
            'national_id_card', 'nationality', 'gender', 'date_of_birth',
            'place_of_birth', 'phone', 'address', 'district', 'city'
        ];
        commonRequiredFields.forEach(id => {
            const el = document.getElementById(id);
            if (el) el.required = true;
        });
        // Username cũng là trường chung và cần bắt buộc
        const usernameInput = document.getElementById('username');
        if (usernameInput) usernameInput.required = true;
    }

    /**
     * Đặt lại trạng thái xem trước ảnh.
     */
    function resetPhotoPreview() {
        photoPreview.src = '#';
        photoPreview.style.display = 'none';
        photoPreviewContainer.style.display = 'none';
        fileNameDisplay.textContent = 'Chưa có tệp nào được chọn';
        userPhotoInput.value = ''; // Xóa file đã chọn khỏi input
    }

    /**
     * Xử lý hiển thị/ẩn và trạng thái 'required' của dropdown khoa cho giảng viên
     * dựa trên loại giảng viên được chọn.
     */
    function handleFacultyDepartmentVisibility() {
        const selectedFacultyType = facultyTypeSelect.value;


        if (selectedFacultyType === '9+') {
            facultyDepartmentSelect.value = ''; // Đặt lại giá trị nếu là 9+
            facultyDepartmentSelect.required = false;
            facultyDepartmentSelect.style.display = 'none';
            officeLocationSelect.style.display = 'none';
           
        } else {
            facultyDepartmentSelect.required = true;
            if (facultyDepartmentContainer) {
                facultyDepartmentContainer.style.display = 'block'; // Hiển thị nếu không phải 9+
            }
        }
    }


    // --- Đăng ký các sự kiện lắng nghe (Event Listeners) ---

    // Lắng nghe sự kiện thay đổi của các radio button chọn vai trò
    roleRadios.forEach(radio => {
        radio.addEventListener('change', updateFormVisibility);
    });

    // Lắng nghe sự kiện thay đổi của dropdown khoa (sinh viên) để lọc ngành
    studentDepartmentSelect.addEventListener('change', filterMajorsByDepartment);

    // Lắng nghe sự kiện thay đổi của dropdown ngành (sinh viên) để tải lớp học
    studentMajorSelect.addEventListener('change', function() {
        const selectedMajorId = this.value;
        loadClassCollegeByMajor(selectedMajorId);
    });

    // Lắng nghe sự kiện thay đổi cho dropdown Tỉnh/Thành (Nơi sinh)
    placeOfBirthSelect.addEventListener('change', function() {
        // Hiện tại không có dropdown quận/huyện riêng cho nơi sinh,
        // nên không cần gọi loadDistricts ở đây.
        // Nếu có, bạn sẽ thêm một dropdown mới và gọi:
        // loadDistricts(this.value, newDistrictOfBirthSelect, 'Chọn quận/huyện (nơi sinh)');
    });

    // Lắng nghe sự kiện thay đổi cho dropdown Tỉnh/Thành (Cư trú) để tải quận/huyện
    citySelect.addEventListener('change', function() {
        const selectedProvinceId = this.value;
        loadDistricts(selectedProvinceId, districtSelect);
    });

    // Lắng nghe sự kiện thay đổi của dropdown chọn phòng ban của nhân viên
    // Để tự động sinh staff_code khi phòng ban thay đổi
    staffDepartmentSelect.addEventListener('change', function() {
        generateStaffCode();

    });

    // Lắng nghe sự kiện thay đổi của dropdown khối lớp (học sinh 9+) để tải lớp THPT
    hsGradeSelect.addEventListener('change', function() {
        const selectedGradeLevel = this.value;
        loadHighschoolClasses(selectedGradeLevel);
    });


    facultyTypeSelect.addEventListener('change', function() {
        generateFacultyCode();
        handleFacultyDepartmentVisibility(); // Gọi hàm này khi loại giảng viên thay đổi
    });
    // Lắng nghe sự kiện thay đổi của input ảnh người dùng để xem trước
    userPhotoInput.addEventListener('change', function() {
        const file = this.files[0];
        if (file) {
            if (file.type.startsWith('image/')) {
                const reader = new FileReader();
                reader.onload = function(e) {
                    photoPreview.src = e.target.result;
                    photoPreview.style.display = 'block';
                    photoPreviewContainer.style.display = 'flex';
                    fileNameDisplay.textContent = file.name;
                };
                reader.readAsDataURL(file);
            } else {
                alert('Vui lòng chọn một file ảnh hợp lệ.', 'error');
                resetPhotoPreview();
            }
        } else {
            resetPhotoPreview();
        }
    });

    // Lắng nghe sự kiện gửi form
    createAccountForm.addEventListener('submit', async (event) => {
        event.preventDefault(); // Ngăn chặn hành vi gửi form mặc định


        // Xác thực cơ bản phía client
        if (!createAccountForm.checkValidity()) {
            alert('Vui lòng điền đầy đủ các trường bắt buộc.', 'error');
            // Kích hoạt thông báo xác thực của trình duyệt
            createAccountForm.reportValidity();
            return;
        }

        showLoading('Đang gửi dữ liệu...');

        // Kiểm tra token xác thực
        const authToken = getAuthToken();
        if (!authToken) {
            hideLoading();
            alert('Bạn chưa đăng nhập hoặc không có quyền. Vui lòng đăng nhập với tài khoản Admin.', 'error');
            return;
        }

        let user_photo_url = null;
        const user_photo_file = userPhotoInput.files[0];
        if (user_photo_file) {
            showLoading('Đang tải ảnh lên Cloudinary...');
            user_photo_url = await uploadImageToCloudinary(user_photo_file);
            if (!user_photo_url) {
                hideLoading();
                return; // Dừng nếu upload ảnh thất bại
            }
        }

        const selectedRole = document.querySelector('input[name="account_role"]:checked').value;

        // Đảm bảo staff_code được sinh ra ngay trước khi thu thập payload nếu vai trò là staff


        // Thu thập dữ liệu chung
        const commonData = {
            // username: document.getElementById('username').value, // Bị comment out, nếu cần thì bỏ comment
            email: document.getElementById('email').value,
            first_name: document.getElementById('first_name').value,
            last_name: document.getElementById('last_name').value,
            // Lấy textContent thay vì value cho các trường cần gửi tên
            nationality: nationalitySelect.options[nationalitySelect.selectedIndex]?.textContent || '',
            national_id_card: document.getElementById('national_id_card').value,
            date_of_birth: document.getElementById('date_of_birth').value,
            place_of_birth: placeOfBirthSelect.options[placeOfBirthSelect.selectedIndex]?.textContent || '',
            user_photo: user_photo_url,
            phone: document.getElementById('phone').value,
            gender: genderSelect.value, // Gender đã là chuỗi, không cần thay đổi
            address: document.getElementById('address').value,
            district: districtSelect.options[districtSelect.selectedIndex]?.textContent || '',
            city: citySelect.options[citySelect.selectedIndex]?.textContent || '',
            password: document.getElementById('national_id_card').value // Mật khẩu mặc định là CMND/CCCD
        };

        let payload = {};
        let apiUrl = '';

        // Thu thập dữ liệu đặc thù theo vai trò
        switch (selectedRole) {
            case 'student':
                payload = {
                    ...commonData,
                    student_code: document.getElementById('student_code').value,
                    parent_name: document.getElementById('parent_name').value,
                    parent_phone: document.getElementById('parent_phone').value,
                    program: studentProgramSelect.value ? parseInt(studentProgramSelect.value) : null,
                    major: studentMajorSelect.value ? parseInt(studentMajorSelect.value) : null,
                    academic_year: studentAcademicYearSelect.value ? parseInt(studentAcademicYearSelect.value) : null,
                    department: studentDepartmentSelect.value ? parseInt(studentDepartmentSelect.value) : null,
                    student_status: studentStatusSelect.value,
                    classCollege: classCollegeSelect.value ? parseInt(classCollegeSelect.value) : null, // Thêm trường lớp học vào payload
                };
                apiUrl = 'https://saigongiadinh.pythonanywhere.com/create_student_account/';
                break;
            case 'highschool_student':
                payload = {
                    ...commonData,
                    student_code: document.getElementById('hs_student_code').value,
                    parent_name: document.getElementById('hs_parent_name').value,
                    parent_phone: document.getElementById('hs_parent_phone').value,
                    academic_year: studentAcademicYearSelect1.value ? parseInt(studentAcademicYearSelect1.value) : null,
                    class_thpt: classTHPTSelect.value || null, // THÊM TRƯỜNG LỚP THPT VÀO PAYLOAD
                    program: null,
                    major: null,
                    department: null,
                };
                apiUrl = 'https://saigongiadinh.pythonanywhere.com/create_student_account/';
                break;
             case 'staff':
                payload = {
                    ...commonData,
                    // Kiểm tra staffCodeInput trước khi lấy giá trị
                    faculty_code: staffCodeInput ? staffCodeInput.value : '', // Gán chuỗi rỗng nếu staffCodeInput là null
                    type: staffTypeSelect.value,
                    // Trường 'department' trong payload cần là giá trị (string) từ dropdown
                    office_location: staffDepartmentSelect.value, // Vẫn giữ nguyên value vì đây là mã phòng ban backend mong muốn
                    department: null,
                    is_manager: document.getElementById('is_manager').checked,
                };
                apiUrl = 'https://saigongiadinh.pythonanywhere.com/create_faculty_account/';

                break;
            case 'faculty':
                // Lấy loại giảng viên hiện tại
                const currentFacultyType = facultyTypeSelect.value;
                let facultyDepartmentValue = null;

                // Nếu loại giảng viên KHÔNG phải là '9+', thì lấy giá trị khoa
                if (currentFacultyType !== '9+') {
                    facultyDepartmentValue = facultyDepartmentSelect.value ? parseInt(facultyDepartmentSelect.value) : null;
                }
                // Nếu là '9+', facultyDepartmentValue sẽ vẫn là null (đã khởi tạo ở trên)

                payload = {
                    ...commonData,
                    faculty_code: document.getElementById('faculty_code').value,
                    faculty_type: facultyTypeSelect.value,
                    department: facultyDepartmentValue, // Sử dụng giá trị đã kiểm tra
                    degree: document.getElementById('degree').value,
                    office_location: "KHONG",
                    type:"GIANG_VIEN",
                    is_department_head: document.getElementById('is_department_head').checked,
                };
                apiUrl = 'https://saigongiadinh.pythonanywhere.com/create_faculty_account/';
                break;
            default:
                alert('Loại tài khoản không hợp lệ.', 'error');
                hideLoading();
                return;
        }

       

        try {
            showLoading(`Đang tạo tài khoản ${selectedRole === 'student' ? 'sinh viên' : selectedRole === 'highschool_student' ? 'học sinh 9+' : selectedRole === 'staff' ? 'nhân viên' : 'giảng viên'}...`);
            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Token ${authToken}` // Đã chỉnh lại sang Bearer Token theo tiêu chuẩn
                },
                body: JSON.stringify(payload)
            });

            const result = await response.json();

            if (response.ok) {
                alert(`Tài khoản ${selectedRole} đã được tạo thành công!`, 'success');
                createAccountForm.reset(); // Xóa form sau khi thành công
                resetPhotoPreview();
                populateInitialDropdowns(); // Điền lại các dropdown
                updateFormVisibility(); // Cập nhật lại form để reset trạng thái hiển thị
            } else {
                // Xử lý lỗi từ API
                let errorMessage = 'Đã có lỗi xảy ra. Vui lòng thử lại.';
                if (result.message) {
                    errorMessage = result.message;
                } else if (result.detail) {
                    errorMessage = result.detail;
                } else if (result.email) {
                    errorMessage = `Email: ${result.email.join(', ')}`;
                } else if (result.username) {
                    errorMessage = `Tên người dùng: ${result.username.join(', ')}`;
                } else if (result.national_id_card) {
                    errorMessage = `CMND/CCCD: ${result.national_id_card.join(', ')}`;
                } else if (result.staff_code) {
                    errorMessage = `Mã nhân viên: ${result.staff_code.join(', ')}`;
                } else if (result.phone) {
                    errorMessage = `Số điện thoại: ${result.phone.join(', ')}`;
                } else if (Object.keys(result).length > 0) {
                    // Nếu có các lỗi khác không được xử lý tường minh
                    errorMessage = Object.entries(result).map(([key, value]) => `${key}: ${Array.isArray(value) ? value.join(', ') : value}`).join('; ');
                }
                alert(`Lỗi tạo tài khoản: ${errorMessage}`, 'error');
            }
        } catch (error) {
            console.error('Lỗi khi gửi yêu cầu:', error);
            alert(`Không thể kết nối đến máy chủ: ${error.message}`, 'error');
        } finally {
            hideLoading();
        }
    });

    // --- Khởi tạo ban đầu khi DOM đã tải xong ---
    setCommonFieldsRequired(); // Đặt các trường chung là bắt buộc
    loadAllDropdownData(); // Tải tất cả dữ liệu cho dropdowns
    // Chọn mặc định vai trò đầu tiên và cập nhật hiển thị form ban đầu
    if (roleRadios.length > 0) {
        roleRadios[0].checked = true;
        updateFormVisibility();
    }
});
// app.js
// Firebase modules exposed from index.html
const { initializeApp, getAuth, signInAnonymously, signInWithCustomToken, onAuthStateChanged, getFirestore, collection, doc, onSnapshot, setDoc, addDoc, updateDoc, deleteDoc } = window.firebase;

// Environment variables from index.html
const appId = window.__app_id;
const firebaseConfig = window.__firebase_config;
const initialAuthToken = window.__initial_auth_token;

// --- Global State ---
let db = null;
let auth = null;
let userId = null;
let currentPage = 'student'; // 'student', 'lecturer' or 'admin'
let timetable = [];
let editingEntry = null; // For admin edit form
let newEntry = {
  day: '',
  time: '',
  subject: '',
  lecturer: '',
  room: '',
  group: '',
};
let isAuthReady = false;
let selectedLecturer = '';
let lecturers = [];

// --- Utility Functions ---
function showMessage(message, type = 'info') {
  const toastContainer = document.getElementById('toast-container');
  if (!toastContainer) {
    console.error('Toast container not found');
    return;
  }
  const toast = document.createElement('div');
  toast.className = `p-3 mb-2 rounded-lg shadow-lg text-white font-semibold transition-opacity duration-300 ease-in-out ${
    type === 'success' ? 'bg-green-500' : type === 'error' ? 'bg-red-500' : type === 'warning' ? 'bg-yellow-500' : 'bg-blue-500'
  }`;
  toast.textContent = message;
  toastContainer.prepend(toast); // Add to top

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.addEventListener('transitionend', () => toast.remove());
  }, 3000);
}

// Function to update the UI
function renderApp() {
  const appRoot = document.getElementById('app-root');
  if (!appRoot) {
    console.error('App root element not found!');
    return;
  }

  let contentHtml = '';

  if (!isAuthReady) {
    contentHtml = `
      <div class="flex justify-center items-center h-screen text-lg text-gray-600">Đang tải ứng dụng và xác thực...</div>
    `;
  } else {
    let currentViewHtml = '';
    switch (currentPage) {
      case 'student':
        currentViewHtml = renderStudentView();
        break;
      case 'lecturer':
        currentViewHtml = renderLecturerView();
        break;
      case 'admin':
        currentViewHtml = renderAdminView();
        break;
      default:
        currentViewHtml = renderStudentView();
    }

    contentHtml = `
      <div class="bg-white shadow-lg p-4 sticky top-0 z-40">
        <div class="max-w-7xl mx-auto flex justify-center space-x-6">
          <button id="nav-student" class="flex items-center px-4 py-2 rounded-lg font-medium transition-colors duration-200 ${
            currentPage === 'student' ? 'bg-indigo-600 text-white shadow-md' : 'text-gray-700 hover:bg-gray-200'
          }">
            <i class="fas fa-home w-5 h-5 mr-2"></i>
            Xem thời khóa biểu (Sinh viên)
          </button>
          <button id="nav-lecturer" class="flex items-center px-4 py-2 rounded-lg font-medium transition-colors duration-200 ${
            currentPage === 'lecturer' ? 'bg-indigo-600 text-white shadow-md' : 'text-gray-700 hover:bg-gray-200'
          }">
            <i class="fas fa-user w-5 h-5 mr-2"></i>
            Xem thời khóa biểu (Giảng viên)
          </button>
          <button id="nav-admin" class="flex items-center px-4 py-2 rounded-lg font-medium transition-colors duration-200 ${
            currentPage === 'admin' ? 'bg-indigo-600 text-white shadow-md' : 'text-gray-700 hover:bg-gray-200'
          }">
            <i class="fas fa-cog w-5 h-5 mr-2"></i>
            Quản lý (Admin)
          </button>
        </div>
      </div>
      <div class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        ${currentViewHtml}
      </div>
    `;
  }

  appRoot.innerHTML = contentHtml;
  attachEventListeners(); // Re-attach event listeners after rendering
}

// --- Event Listener Attachment (Delegation) ---
function attachEventListeners() {
  const appRoot = document.getElementById('app-root');
  if (!appRoot) return;

  // Clear previous listeners to avoid duplicates if re-attaching
  appRoot.onclick = null;
  appRoot.onchange = null;
  appRoot.oninput = null;

  // Navigation
  appRoot.addEventListener('click', (e) => {
    if (e.target.closest('#nav-student')) {
      currentPage = 'student';
      renderApp();
    } else if (e.target.closest('#nav-lecturer')) {
      currentPage = 'lecturer';
      selectedLecturer = ''; // Reset selected lecturer when navigating
      renderApp();
    } else if (e.target.closest('#nav-admin')) {
      currentPage = 'admin';
      renderApp();
    }
  });

  // Admin View Specific Listeners
  if (currentPage === 'admin') {
    // Add New Entry Form
    appRoot.addEventListener('input', (e) => {
      const target = e.target;
      if (target.id.startsWith('new')) {
        const field = target.id.substring(3).toLowerCase(); // 'Day' -> 'day'
        newEntry = { ...newEntry, [field]: target.value };
      } else if (editingEntry && target.dataset.editField) {
        // Handle input for editing fields
        editingEntry = { ...editingEntry, [target.dataset.editField]: target.value };
      }
    });

    appRoot.addEventListener('change', (e) => {
      const target = e.target;
      if (target.id.startsWith('new') && target.tagName === 'SELECT') {
        const field = target.id.substring(3).toLowerCase();
        newEntry = { ...newEntry, [field]: target.value };
      } else if (editingEntry && target.dataset.editField && target.tagName === 'SELECT') {
        editingEntry = { ...editingEntry, [target.dataset.editField]: target.value };
      }
    });

    appRoot.addEventListener('click', (e) => {
      const target = e.target.closest('button'); // Get the closest button
      if (!target) return;

      if (target.id === 'add-entry-btn') {
        handleAddEntry();
      } else if (target.dataset.action === 'edit') {
        const entryId = target.dataset.id;
        editingEntry = timetable.find(entry => entry.id === entryId);
        renderApp();
      } else if (target.dataset.action === 'delete') {
        const entryId = target.dataset.id;
        handleDeleteEntry(entryId);
      } else if (target.dataset.action === 'save') {
        handleUpdateEntry();
      } else if (target.dataset.action === 'cancel-edit') {
        editingEntry = null;
        renderApp();
      }
    });
  }

  // Lecturer View Specific Listeners
  if (currentPage === 'lecturer') {
    appRoot.addEventListener('change', (e) => {
      if (e.target.id === 'selectLecturer') {
        selectedLecturer = e.target.value;
        renderApp();
      }
    });
  }
}

// --- Firebase Initialization and Data Fetching ---
async function initializeFirebase() {
  try {
    const app = initializeApp(firebaseConfig);
    db = getFirestore(app);
    auth = getAuth(app);

    onAuthStateChanged(auth, async (user) => {
      if (user) {
        userId = user.uid;
      } else {
        try {
          if (initialAuthToken) {
            await signInWithCustomToken(auth, initialAuthToken);
          } else {
            await signInAnonymously(auth);
          }
          userId = auth.currentUser?.uid || crypto.randomUUID();
        } catch (anonError) {
          console.error("Lỗi khi đăng nhập ẩn danh:", anonError);
          showMessage("Lỗi đăng nhập. Vui lòng thử lại.", "error");
          userId = crypto.randomUUID();
        }
      }
      isAuthReady = true;
      setupTimetableListener(); // Setup listener once auth is ready
      renderApp();
    });
  } catch (error) {
    console.error("Lỗi khởi tạo Firebase:", error);
    showMessage("Lỗi khởi tạo ứng dụng.", "error");
    isAuthReady = true; // Mark as ready even if error, to show error message
    renderApp();
  }
}

function setupTimetableListener() {
  if (!db || !isAuthReady || !userId) {
    return;
  }

  const timetableCollectionRef = collection(db, `artifacts/${appId}/public/data/timetables`);

  onSnapshot(timetableCollectionRef, (snapshot) => {
    const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    timetable = data.sort((a, b) => {
      const daysOrder = ['Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy', 'Chủ Nhật'];
      const dayA = daysOrder.indexOf(a.day);
      const dayB = daysOrder.indexOf(b.day);
      if (dayA !== dayB) return dayA - dayB;
      return a.time.localeCompare(b.time);
    });

    lecturers = [...new Set(data.map(entry => entry.lecturer).filter(Boolean))].sort();
    renderApp(); // Re-render when data changes
  }, (error) => {
    console.error("Lỗi khi lấy dữ liệu thời khóa biểu:", error);
    showMessage("Lỗi khi tải thời khóa biểu.", "error");
  });
}

// --- Admin Actions ---
async function handleAddEntry() {
  if (!db || !newEntry.day || !newEntry.time || !newEntry.subject) {
    showMessage("Vui lòng điền đầy đủ thông tin (Ngày, Giờ, Môn học).", "error");
    return;
  }
  try {
    const timetableCollectionRef = collection(db, `artifacts/${appId}/public/data/timetables`);
    await addDoc(timetableCollectionRef, newEntry);
    newEntry = { day: '', time: '', subject: '', lecturer: '', room: '', group: '' }; // Reset form
    showMessage("Thêm mục mới thành công!", "success");
    renderApp(); // Re-render to clear form and update list
  } catch (e) {
    console.error("Lỗi khi thêm tài liệu:", e);
    showMessage("Lỗi khi thêm mục.", "error");
  }
}

async function handleUpdateEntry() {
  if (!db || !editingEntry || !editingEntry.id) {
    showMessage("Không có mục nào đang được chỉnh sửa.", "error");
    return;
  }
  try {
    const docRef = doc(db, `artifacts/${appId}/public/data/timetables`, editingEntry.id);
    await updateDoc(docRef, editingEntry);
    editingEntry = null; // Exit edit mode
    showMessage("Cập nhật mục thành công!", "success");
    renderApp(); // Re-render to show updated list
  } catch (e) {
    console.error("Lỗi khi cập nhật tài liệu:", e);
    showMessage("Lỗi khi cập nhật mục.", "error");
  }
}

async function handleDeleteEntry(id) {
  if (!db) return;
  try {
    const docRef = doc(db, `artifacts/${appId}/public/data/timetables`, id);
    await deleteDoc(docRef);
    showMessage("Xóa mục thành công!", "success");
    renderApp(); // Re-render to show updated list
  } catch (e) {
    console.error("Lỗi khi xóa tài liệu:", e);
    showMessage("Lỗi khi xóa mục.", "error");
  }
}

// --- View Rendering Functions (mimicking Components) ---
const daysOfWeek = ['Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy', 'Chủ Nhật'];

function renderTimeSlot({ day, time, subject, lecturer, room, group }) {
  return `
    <div class="bg-white p-4 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200">
      <h3 class="font-bold text-lg text-indigo-700">${subject}</h3>
      <p class="text-sm text-gray-600">Thời gian: <span class="font-semibold">${time}</span></p>
      <p class="text-sm text-gray-600">Giảng viên: ${lecturer || 'N/A'}</p>
      <p class="text-sm text-gray-600">Phòng: ${room || 'N/A'}</p>
      <p class="text-sm text-gray-600">Nhóm: ${group || 'N/A'}</p>
    </div>
  `;
}

function renderStudentView() {
  let timetableContent = '';
  if (timetable.length === 0) {
    timetableContent = `<p class="text-center text-gray-600 text-lg">Chưa có thông tin thời khóa biểu nào. Vui lòng quay lại sau!</p>`;
  } else {
    timetableContent = `
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        ${daysOfWeek.map(day => {
          const dayEntries = timetable.filter(entry => entry.day === day);
          if (dayEntries.length === 0) return ''; // Don't show empty days

          return `
            <div class="bg-white p-5 rounded-xl shadow-lg border border-indigo-100 transform transition-transform duration-300 hover:scale-105">
              <h3 class="text-xl font-bold text-indigo-700 mb-4 pb-2 border-b-2 border-indigo-200">${day}</h3>
              <div class="space-y-4">
                ${dayEntries.map(entry => renderTimeSlot(entry)).join('')}
              </div>
            </div>
          `;
        }).join('')}
      </div>
    `;
  }

  return `
    <div class="p-6 bg-gray-50 min-h-screen">
      <h2 class="text-3xl font-extrabold text-gray-900 mb-8 text-center flex items-center justify-center gap-3">
        <i class="fas fa-calendar-alt w-8 h-8 text-indigo-600"></i> Thời khóa biểu của tôi
      </h2>
      ${timetableContent}
    </div>
  `;
}

function renderLecturerView() {
    const filteredTimetable = selectedLecturer
      ? timetable.filter(entry => entry.lecturer === selectedLecturer)
      : [];

    let lecturerOptions = '<option value="">-- Chọn giảng viên --</option>';
    lecturers.forEach(lecturer => {
        lecturerOptions += `<option value="${lecturer}" ${selectedLecturer === lecturer ? 'selected' : ''}>${lecturer}</option>`;
    });

    let timetableContent = '';
    if (selectedLecturer && filteredTimetable.length === 0) {
        timetableContent = `<p class="text-center text-gray-600 text-lg">Không tìm thấy thời khóa biểu cho giảng viên ${selectedLecturer}.</p>`;
    } else if (!selectedLecturer) {
        timetableContent = `<p class="text-center text-gray-600 text-lg">Vui lòng chọn một giảng viên để xem thời khóa biểu.</p>`;
    } else {
        timetableContent = `
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                ${daysOfWeek.map(day => {
                    const dayEntries = filteredTimetable.filter(entry => entry.day === day);
                    if (dayEntries.length === 0) return '';

                    return `
                        <div class="bg-white p-5 rounded-xl shadow-lg border border-indigo-100 transform transition-transform duration-300 hover:scale-105">
                            <h3 class="text-xl font-bold text-indigo-700 mb-4 pb-2 border-b-2 border-indigo-200">${day}</h3>
                            <div class="space-y-4">
                                ${dayEntries.map(entry => renderTimeSlot(entry)).join('')}
                            </div>
                        </div>
                    `;
                }).join('')}
            </div>
        `;
    }

    return `
        <div class="p-6 bg-gray-50 min-h-screen">
            <h2 class="text-3xl font-extrabold text-gray-900 mb-8 text-center flex items-center justify-center gap-3">
                <i class="fas fa-user w-8 h-8 text-indigo-600"></i> Thời khóa biểu giảng viên
            </h2>

            <div class="mb-6 p-4 bg-white rounded-xl shadow-lg border border-gray-200 flex flex-col md:flex-row items-center justify-center gap-4">
                <label for="selectLecturer" class="block text-lg font-medium text-gray-700 md:mb-0">Chọn giảng viên:</label>
                <select id="selectLecturer" class="mt-1 block w-full md:w-1/2 lg:w-1/3 p-3 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-base">
                    ${lecturerOptions}
                </select>
            </div>
            ${timetableContent}
        </div>
    `;
}

function renderAdminView() {
    let tableRows = '';
    timetable.forEach(entry => {
        if (editingEntry && editingEntry.id === entry.id) {
            tableRows += `
                <tr>
                    <td class="px-6 py-4 whitespace-nowrap">
                        <select class="p-1 border rounded-md" data-edit-field="day">
                            ${daysOfWeek.map(day => `<option value="${day}" ${editingEntry.day === day ? 'selected' : ''}>${day}</option>`).join('')}
                        </select>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                        <input type="text" class="p-1 border rounded-md w-24" value="${editingEntry.time}" data-edit-field="time" />
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                        <input type="text" class="p-1 border rounded-md w-32" value="${editingEntry.subject}" data-edit-field="subject" />
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                        <input type="text" class="p-1 border rounded-md w-24" value="${editingEntry.lecturer || ''}" data-edit-field="lecturer" />
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                        <input type="text" class="p-1 border rounded-md w-16" value="${editingEntry.room || ''}" data-edit-field="room" />
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                        <input type="text" class="p-1 border rounded-md w-16" value="${editingEntry.group || ''}" data-edit-field="group" />
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button data-action="save" class="inline-flex items-center text-indigo-600 hover:text-indigo-900 mr-3 transition duration-150 ease-in-out transform hover:scale-105">
                            <i class="fas fa-save w-5 h-5 mr-1"></i> Lưu
                        </button>
                        <button data-action="cancel-edit" class="inline-flex items-center text-gray-500 hover:text-gray-700 transition duration-150 ease-in-out transform hover:scale-105">
                            Hủy
                        </button>
                    </td>
                </tr>
            `;
        } else {
            tableRows += `
                <tr>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${entry.day}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${entry.time}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${entry.subject}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${entry.lecturer || 'N/A'}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${entry.room || 'N/A'}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${entry.group || 'N/A'}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button data-action="edit" data-id="${entry.id}" class="inline-flex items-center text-blue-600 hover:text-blue-900 mr-3 transition duration-150 ease-in-out transform hover:scale-105">
                            <i class="fas fa-edit w-5 h-5 mr-1"></i> Sửa
                        </button>
                        <button data-action="delete" data-id="${entry.id}" class="inline-flex items-center text-red-600 hover:text-red-900 transition duration-150 ease-in-out transform hover:scale-105">
                            <i class="fas fa-trash-alt w-5 h-5 mr-1"></i> Xóa
                        </button>
                    </td>
                </tr>
            `;
        }
    });

    return `
        <div class="p-6 bg-gray-50 min-h-screen">
            <h2 class="text-3xl font-extrabold text-gray-900 mb-8 text-center flex items-center justify-center gap-3">
                <i class="fas fa-cogs w-8 h-8 text-indigo-600"></i> Quản lý thời khóa biểu
            </h2>

            <div class="mb-6 p-4 bg-yellow-100 border border-yellow-300 rounded-lg text-yellow-800 text-sm">
                <p>ID người dùng hiện tại (cho mục đích quản lý dữ liệu):</p>
                <p class="font-mono text-xs break-all">${userId || 'Đang tải...'}</p>
            </div>

            <div class="bg-white p-6 rounded-xl shadow-lg mb-8 border border-gray-200">
                <h3 class="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2"><i class="fas fa-plus-circle w-6 h-6 text-green-600"></i> Thêm mục mới</h3>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                        <label for="newDay" class="block text-sm font-medium text-gray-700">Ngày</label>
                        <select id="newDay" class="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
                            <option value="">Chọn ngày</option>
                            ${daysOfWeek.map(day => `<option value="${day}" ${newEntry.day === day ? 'selected' : ''}>${day}</option>`).join('')}
                        </select>
                    </div>
                    <div>
                        <label for="newTime" class="block text-sm font-medium text-gray-700">Giờ (ví dụ: 08:00 - 09:30)</label>
                        <input type="text" id="newTime" class="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" value="${newEntry.time}" placeholder="08:00 - 09:30" />
                    </div>
                    <div>
                        <label for="newSubject" class="block text-sm font-medium text-gray-700">Môn học</label>
                        <input type="text" id="newSubject" class="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" value="${newEntry.subject}" placeholder="Lập trình web nâng cao" />
                    </div>
                    <div>
                        <label for="newLecturer" class="block text-sm font-medium text-gray-700">Giảng viên</label>
                        <input type="text" id="newLecturer" class="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" value="${newEntry.lecturer || ''}" placeholder="Nguyễn Văn A" />
                    </div>
                    <div>
                        <label for="newRoom" class="block text-sm font-medium text-gray-700">Phòng</label>
                        <input type="text" id="newRoom" class="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" value="${newEntry.room || ''}" placeholder="A101" />
                    </div>
                    <div>
                        <label for="newGroup" class="block text-sm font-medium text-gray-700">Nhóm</label>
                        <input type="text" id="newGroup" class="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" value="${newEntry.group || ''}" placeholder="N01" />
                    </div>
                </div>
                <button id="add-entry-btn" class="w-full inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition duration-150 ease-in-out transform hover:-translate-y-0.5">
                    <i class="fas fa-plus-circle w-5 h-5 mr-2"></i> Thêm vào thời khóa biểu
                </button>
            </div>

            <div class="bg-white p-6 rounded-xl shadow-lg border border-gray-200 overflow-x-auto">
                <h3 class="text-2xl font-bold text-gray-800 mb-4">Danh sách các mục</h3>
                <table class="min-w-full divide-y divide-gray-200">
                    <thead class="bg-gray-50">
                        <tr>
                            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ngày</th>
                            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Giờ</th>
                            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Môn học</th>
                            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Giảng viên</th>
                            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phòng</th>
                            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nhóm</th>
                            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hành động</th>
                        </tr>
                    </thead>
                    <tbody class="bg-white divide-y divide-gray-200">
                        ${tableRows}
                    </tbody>
                </table>
            </div>
        </div>
    `;
}

// --- Initialize App ---
document.addEventListener('DOMContentLoaded', () => {
    initializeFirebase();
});


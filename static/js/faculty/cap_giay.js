(function() {
  const API_URL = 'https://saigongiadinh.pythonanywhere.com/hoso/';

  let allProfiles = [];

  function $(id) { return document.getElementById(id); }

  function normalizeText(value) {
    return String(value || '').toLowerCase().trim();
  }

  function badgeHtml(profile) {
    const badges = [];
    if (profile.giay_chung_nhan_sv) {
      badges.push('<span class="badge badge-type badge-cnsv">Chứng nhận SV</span>');
    }
    if (profile.giay_hoan_nvqs) {
      badges.push('<span class="badge badge-type badge-cnnvqs">CN NVQS</span>');
    }
    if (profile.yeu_cau_vay_von) {
      badges.push('<span class="badge badge-type badge-vayvon">Vay vốn</span>');
    }
    if (badges.length === 0) {
      return '<span class="text-muted">Không có</span>';
    }
    return badges.join(' ');
  }

  function actionButtons(profile) {
    const btns = [];
    btns.push(`<button class="btn btn-sm btn-outline-primary action-btn" data-act="cnsv" data-id="${profile.id}">In Chứng nhận SV</button>`);
    btns.push(`<button class="btn btn-sm btn-outline-success action-btn" data-act="cnnvqs" data-id="${profile.id}">In CN NVQS</button>`);
    btns.push(`<button class="btn btn-sm btn-outline-danger action-btn" data-act="vayvon" data-id="${profile.id}">In Vay vốn</button>`);
    return `<div class="action-buttons">${btns.join('')}</div>`;
  }

  function editButton(profile) {
    return `<button class="btn btn-sm edit-btn" data-act="edit" data-id="${profile.id}">
      <i class="fas fa-edit"></i> Sửa
    </button>`;
  }

  function render(profiles) {
    const body = $('profilesBody');
    if (!body) return;
    body.innerHTML = profiles.map(p => `
      <tr>
        <td><input type="checkbox" class="form-check-input profile-checkbox" value="${p.id}"></td>
        <td>${p.ma_ho_so || ''}</td>
        <td>${p.full_name || ''}</td>
        <td>${p.major || ''}</td>
        <td>${p.lophoc || ''}</td>
        <td><span class="badge ${getStatusBadgeClass(p.trang_thai)}">${getStatusText(p.trang_thai)}</span></td>
        <td>${badgeHtml(p)}</td>
        <td>${actionButtons(p)}</td>
        <td>${editButton(p)}</td>
      </tr>
    `).join('');
  }

  function applyFilters() {
    const text = normalizeText($('searchInput').value);
    const type = $('filterType').value;
    const filtered = allProfiles.filter(p => {
      const matchText = !text || 
        normalizeText(p.ma_ho_so).includes(text) || 
        normalizeText(p.full_name).includes(text) ||
        normalizeText(p.cccd).includes(text);
      let matchType = true;
      if (type) {
        matchType = Boolean(p[type]);
      }
      return matchText && matchType;
    });
    render(filtered);
  }

  function prefillAndOpenForm(profile, act) {
    try {
      sessionStorage.setItem('currentProfile', JSON.stringify(profile));
    } catch (_) {}
    let path = '';
    if (act === 'cnsv') path = '/gv/form/cnsv/';
    if (act === 'cnnvqs') path = '/gv/form/cnnvqs/';
    if (act === 'vayvon') path = '/gv/form/vayvon/';
    if (!path) return;
    window.open(path, '_blank');
  }

  function onClick(e) {
    const btn = e.target.closest('button[data-act]');
    if (!btn) return;
    const act = btn.getAttribute('data-act');
    const id = Number(btn.getAttribute('data-id'));
    const profile = allProfiles.find(p => p.id === id);
    if (!profile) return;
    
    if (act === 'edit') {
      openEditModal(profile);
    } else {
      prefillAndOpenForm(profile, act);
    }
  }

  async function fetchProfiles() {
    const res = await fetch(API_URL, { credentials: 'omit' });
    if (!res.ok) throw new Error('Fetch failed');
    const data = await res.json();
    if (!Array.isArray(data)) return [];
    return data;
  }

  function openEditModal(profile) {
    console.log('Opening edit modal for profile:', profile); // Debug log
    
    try {
      // Fill form with profile data
      document.getElementById('edit_id').value = profile.id;
      document.getElementById('edit_full_name').value = profile.full_name || '';
      document.getElementById('edit_date_of_birth').value = profile.date_of_birth || '';
      document.getElementById('edit_gender').value = profile.gender || 'Nam';
      document.getElementById('edit_cccd').value = profile.cccd || '';
      document.getElementById('edit_place_of_birth').value = profile.place_of_birth || '';
      document.getElementById('edit_cccd_issue_date').value = profile.cccd_issue_date || '';
      document.getElementById('edit_permanent_residence').value = profile.permanent_residence || '';
      document.getElementById('edit_major').value = profile.major || '';
      document.getElementById('edit_lophoc').value = profile.lophoc || '';
      document.getElementById('edit_training_level').value = profile.training_level || 'Cao đẳng';
      document.getElementById('edit_training_system').value = profile.training_system || 'Chính quy';
      document.getElementById('edit_training_course').value = profile.training_course || '';
      
      // Set checkboxes
      document.getElementById('edit_giay_chung_nhan_sv').checked = profile.giay_chung_nhan_sv || false;
      document.getElementById('edit_giay_hoan_nvqs').checked = profile.giay_hoan_nvqs || false;
      document.getElementById('edit_yeu_cau_vay_von').checked = profile.yeu_cau_vay_von || false;
      
      // Show modal using jQuery if available, otherwise use vanilla JS
      const modalElement = document.getElementById('editModal');
      if (modalElement) {
        if (typeof bootstrap !== 'undefined' && bootstrap.Modal) {
          const modal = new bootstrap.Modal(modalElement);
          modal.show();
        } else if (typeof $ !== 'undefined' && $.fn.modal) {
          $(modalElement).modal('show');
        } else {
          // Fallback: show modal manually
          modalElement.style.display = 'block';
          modalElement.classList.add('show');
          document.body.classList.add('modal-open');
          const backdrop = document.createElement('div');
          backdrop.className = 'modal-backdrop fade show';
          backdrop.id = 'modal-backdrop';
          document.body.appendChild(backdrop);
        }
        console.log('Modal should be visible now');
      } else {
        console.error('Modal element not found');
      }
    } catch (error) {
      console.error('Error opening modal:', error);
      alert('Có lỗi khi mở form sửa. Vui lòng thử lại.');
    }
  }

  function closeModal() {
    const modalElement = document.getElementById('editModal');
    if (modalElement) {
      if (typeof bootstrap !== 'undefined' && bootstrap.Modal) {
        const modal = bootstrap.Modal.getInstance(modalElement);
        if (modal) {
          modal.hide();
        }
      } else if (typeof $ !== 'undefined' && $.fn.modal) {
        $(modalElement).modal('hide');
      } else {
        // Fallback: hide modal manually
        modalElement.style.display = 'none';
        modalElement.classList.remove('show');
        document.body.classList.remove('modal-open');
        const backdrop = document.getElementById('modal-backdrop');
        if (backdrop) {
          backdrop.remove();
        }
      }
    }
  }

  async function saveProfile() {
    const form = document.getElementById('editForm');
    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());
    
    // Convert checkboxes to boolean
    data.giay_chung_nhan_sv = formData.has('giay_chung_nhan_sv');
    data.giay_hoan_nvqs = formData.has('giay_hoan_nvqs');
    data.yeu_cau_vay_von = formData.has('yeu_cau_vay_von');
    
    try {
      const response = await fetch(`https://saigongiadinh.pythonanywhere.com/hoso/${data.id}/`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
      });
      
      if (response.ok) {
        // Update local data
        const index = allProfiles.findIndex(p => p.id == data.id);
        if (index !== -1) {
          allProfiles[index] = { ...allProfiles[index], ...data };
          render(allProfiles);
        }
        
        // Close modal
        closeModal();
        
        alert('Cập nhật thành công!');
      } else {
        const errorData = await response.json();
        console.error('Update error:', errorData);
        alert(`Có lỗi xảy ra khi cập nhật: ${errorData.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Có lỗi xảy ra khi cập nhật!');
    }
  }

  async function init() {
    try {
      allProfiles = await fetchProfiles();
      render(allProfiles);
    } catch (err) {
      const body = $('profilesBody');
      if (body) body.innerHTML = '<tr><td colspan="7" class="text-danger">Không tải được dữ liệu</td></tr>';
    }

    $('profilesBody').addEventListener('click', onClick);
    $('searchInput').addEventListener('input', applyFilters);
    $('filterType').addEventListener('change', applyFilters);
    $('reloadBtn').addEventListener('click', async () => {
      try {
        allProfiles = await fetchProfiles();
        applyFilters();
      } catch (_) {}
    });
    
    // Add save button event listener
    document.getElementById('saveEditBtn').addEventListener('click', saveProfile);
    
    // Add close button event listener
    const closeBtn = document.querySelector('#editModal .btn-close');
    if (closeBtn) {
      closeBtn.addEventListener('click', closeModal);
    }
    
    // Add cancel button event listener
    const cancelBtn = document.querySelector('#editModal .btn-secondary');
    if (cancelBtn) {
      cancelBtn.addEventListener('click', closeModal);
    }
    
    // Close modal when clicking outside
    const modalElement = document.getElementById('editModal');
    if (modalElement) {
      modalElement.addEventListener('click', function(e) {
        if (e.target === modalElement) {
          closeModal();
        }
      });
    }
  }

  // Test function for modal
  window.testModal = function() {
    const testProfile = {
      id: 999,
      full_name: 'Test User',
      date_of_birth: '2000-01-01',
      gender: 'Nam',
      cccd: '123456789',
      place_of_birth: 'Hà Nội',
      cccd_issue_date: '2020-01-01',
      permanent_residence: 'Hà Nội',
      major: 'Công nghệ thông tin',
      lophoc: 'K10-CNTT',
      training_level: 'Cao đẳng',
      training_system: 'Chính quy',
      training_course: '2020-2023',
      giay_chung_nhan_sv: true,
      giay_hoan_nvqs: false,
      yeu_cau_vay_von: true
    };
    openEditModal(testProfile);
  };

  // Status management functions
  function getStatusText(status) {
    switch(status) {
      case 'dang_xu_ly': return 'Đang xử lý';
      case 'da_xu_ly': return 'Đã xử lý';
      case 'da_huy': return 'Đã hủy';
      default: return status || 'Chưa xác định';
    }
  }

  function getStatusBadgeClass(status) {
    switch(status) {
      case 'dang_xu_ly': return 'bg-warning text-dark';
      case 'da_xu_ly': return 'bg-success';
      case 'da_huy': return 'bg-danger';
      default: return 'bg-secondary';
    }
  }

  function openStatusModal() {
    const selectedCheckboxes = document.querySelectorAll('.profile-checkbox:checked');
    if (selectedCheckboxes.length === 0) {
      alert('Vui lòng chọn ít nhất một hồ sơ để cập nhật trạng thái!');
      return;
    }
    if (selectedCheckboxes.length > 1) {
      alert('Vui lòng chỉ chọn một hồ sơ để cập nhật trạng thái đơn lẻ!');
      return;
    }
    
    const profileId = selectedCheckboxes[0].value;
    const profile = allProfiles.find(p => p.id == profileId);
    if (!profile) return;

    document.getElementById('status_id').value = profile.id;
    document.getElementById('status_ma_ho_so').value = profile.ma_ho_so || '';
    document.getElementById('status_full_name').value = profile.full_name || '';
    document.getElementById('status_current').value = getStatusText(profile.trang_thai);
    document.getElementById('status_new').value = profile.trang_thai || 'dang_xu_ly';

    const modal = new bootstrap.Modal(document.getElementById('statusModal'));
    modal.show();
  }

  function openBulkStatusModal() {
    const selectedCheckboxes = document.querySelectorAll('.profile-checkbox:checked');
    if (selectedCheckboxes.length === 0) {
      alert('Vui lòng chọn ít nhất một hồ sơ để cập nhật trạng thái hàng loạt!');
      return;
    }

    const selectedProfiles = Array.from(selectedCheckboxes).map(cb => {
      const profile = allProfiles.find(p => p.id == cb.value);
      return profile;
    }).filter(p => p);

    const selectedProfilesDiv = document.getElementById('selectedProfiles');
    selectedProfilesDiv.innerHTML = selectedProfiles.map(p => `
      <div class="d-flex justify-content-between align-items-center mb-2">
        <span><strong>${p.ma_ho_so}</strong> - ${p.full_name}</span>
        <span class="badge ${getStatusBadgeClass(p.trang_thai)}">${getStatusText(p.trang_thai)}</span>
      </div>
    `).join('');

    const modal = new bootstrap.Modal(document.getElementById('bulkStatusModal'));
    modal.show();
  }

  async function updateStatus(profileId, newStatus) {
    try {
      const response = await fetch(`https://saigongiadinh.pythonanywhere.com/hoso/${profileId}/`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ trang_thai: newStatus })
      });

      if (response.ok) {
        // Update local data
        const index = allProfiles.findIndex(p => p.id == profileId);
        if (index !== -1) {
          allProfiles[index].trang_thai = newStatus;
          render(allProfiles);
        }
        return true;
      } else {
        const errorData = await response.json();
        console.error('Status update error:', errorData);
        alert(`Có lỗi xảy ra khi cập nhật trạng thái: ${errorData.error || 'Unknown error'}`);
        return false;
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Có lỗi xảy ra khi cập nhật trạng thái!');
      return false;
    }
  }

  async function updateBulkStatus(profileIds, newStatus) {
    const results = [];
    for (const profileId of profileIds) {
      const success = await updateStatus(profileId, newStatus);
      results.push({ id: profileId, success });
    }
    
    const successCount = results.filter(r => r.success).length;
    alert(`Đã cập nhật thành công ${successCount}/${profileIds.length} hồ sơ!`);
  }

  // Add event listeners for new functionality
  function addStatusEventListeners() {
    // Select all checkbox
    const selectAllCheckbox = document.getElementById('selectAll');
    if (selectAllCheckbox) {
      selectAllCheckbox.addEventListener('change', function() {
        const checkboxes = document.querySelectorAll('.profile-checkbox');
        checkboxes.forEach(cb => cb.checked = this.checked);
      });
    }

    // Individual checkboxes
    document.addEventListener('change', function(e) {
      if (e.target.classList.contains('profile-checkbox')) {
        const checkboxes = document.querySelectorAll('.profile-checkbox');
        const checkedCount = document.querySelectorAll('.profile-checkbox:checked').length;
        const selectAllCheckbox = document.getElementById('selectAll');
        if (selectAllCheckbox) {
          selectAllCheckbox.checked = checkedCount === checkboxes.length;
          selectAllCheckbox.indeterminate = checkedCount > 0 && checkedCount < checkboxes.length;
        }
      }
    });

    // Status update button
    const saveStatusBtn = document.getElementById('saveStatusBtn');
    if (saveStatusBtn) {
      saveStatusBtn.addEventListener('click', async function() {
        const profileId = document.getElementById('status_id').value;
        const newStatus = document.getElementById('status_new').value;
        
        if (!profileId || !newStatus) {
          alert('Vui lòng điền đầy đủ thông tin!');
          return;
        }

        const success = await updateStatus(profileId, newStatus);
        if (success) {
          const modal = bootstrap.Modal.getInstance(document.getElementById('statusModal'));
          modal.hide();
          alert('Cập nhật trạng thái thành công!');
        }
      });
    }

    // Bulk status update button
    const saveBulkStatusBtn = document.getElementById('saveBulkStatusBtn');
    if (saveBulkStatusBtn) {
      saveBulkStatusBtn.addEventListener('click', async function() {
        const newStatus = document.getElementById('bulkStatus').value;
        if (!newStatus) {
          alert('Vui lòng chọn trạng thái mới!');
          return;
        }

        const selectedCheckboxes = document.querySelectorAll('.profile-checkbox:checked');
        const profileIds = Array.from(selectedCheckboxes).map(cb => cb.value);
        
        if (profileIds.length === 0) {
          alert('Vui lòng chọn ít nhất một hồ sơ!');
          return;
        }

        await updateBulkStatus(profileIds, newStatus);
        
        const modal = bootstrap.Modal.getInstance(document.getElementById('bulkStatusModal'));
        modal.hide();
      });
    }
  }

  // Make functions global
  window.openStatusModal = openStatusModal;
  window.openBulkStatusModal = openBulkStatusModal;

  document.addEventListener('DOMContentLoaded', function() {
    init();
    addStatusEventListeners();
  });
})();
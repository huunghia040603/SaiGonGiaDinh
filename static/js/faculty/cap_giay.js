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
    return btns.join('');
  }

  function render(profiles) {
    const body = $('profilesBody');
    if (!body) return;
    body.innerHTML = profiles.map(p => `
      <tr>
        <td>${p.ma_ho_so || ''}</td>
        <td>${p.full_name || ''}</td>
        <td>${p.major || ''}</td>
        <td>${p.lophoc || ''}</td>
        <td>${badgeHtml(p)}</td>
        <td>${actionButtons(p)}</td>
      </tr>
    `).join('');
  }

  function applyFilters() {
    const text = normalizeText($('searchInput').value);
    const type = $('filterType').value;
    const filtered = allProfiles.filter(p => {
      const matchText = !text || normalizeText(p.ma_ho_so).includes(text) || normalizeText(p.full_name).includes(text);
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
    prefillAndOpenForm(profile, act);
  }

  async function fetchProfiles() {
    const res = await fetch(API_URL, { credentials: 'omit' });
    if (!res.ok) throw new Error('Fetch failed');
    const data = await res.json();
    if (!Array.isArray(data)) return [];
    return data;
  }

  async function init() {
    try {
      allProfiles = await fetchProfiles();
      render(allProfiles);
    } catch (err) {
      const body = $('profilesBody');
      if (body) body.innerHTML = '<tr><td colspan="6" class="text-danger">Không tải được dữ liệu</td></tr>';
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
  }

  document.addEventListener('DOMContentLoaded', init);
})();
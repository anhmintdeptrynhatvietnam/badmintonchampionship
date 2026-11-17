/**
 * ========================================================
 * LOGIC ADMIN DASHBOARD - BAN TỔ CHỨC GIẢI CẦU LÔNG CLB 2026
 * Thiết kế: Mobile-First, Tinh giản, Đậm chất thể thao công nghệ
 * Tính năng nổi bật: Trợ lý Ghép Cặp Thông Minh Cân Bằng Điểm
 * ========================================================
 */

const Admin = {
    currentTab: 'tab-approvals',
    pairingEventView: 'doi_nam',
    athletes: [],
    pairs: {
        doi_nam: [],
        doi_nam_nu: []
    },
    selectedRejectAthleteId: null,
    selectedP1ForSmartPair: null,
    selectedSwapContext: null, // { pairId, playerId }

    // Bảng quy đổi điểm Rank chuẩn
    rankPoints: {
        'Lv1': 4,
        'Lv2': 3,
        'Lv3': 2,
        'Lv4': 1
    },

    // 1. Khởi tạo
    init: async function() {
        await this.checkAuthAndLoad();
    },

    // Kiểm tra đăng nhập và nạp dữ liệu (Luôn hỗ trợ chế độ Xem thử Demo)
    checkAuthAndLoad: async function() {
        const user = await Auth.getUser();
        const adminNameEl = document.getElementById('admin-user-name');
        const demoBanner = document.getElementById('demo-admin-banner');

        if (user && await Auth.isAdmin(user)) {
            // Đã đăng nhập tài khoản Admin thật
            if (adminNameEl) adminNameEl.textContent = user.user_metadata?.full_name || user.email;
            if (demoBanner) demoBanner.classList.add('hidden');
        } else {
            // Chế độ Xem thử Admin Demo
            if (adminNameEl) adminNameEl.textContent = 'Admin BTC (Xem Thử)';
            if (demoBanner) demoBanner.classList.remove('hidden');
        }

        await this.loadAllData();
    },

    // 2. Chuyển đổi giữa các Tab chức năng
    switchTab: function(tabId) {
        this.currentTab = tabId;

        document.querySelectorAll('.admin-tab-btn').forEach(btn => {
            btn.classList.remove('bg-green-700', 'text-white', 'shadow-sm');
            btn.classList.add('text-slate-600', 'hover:bg-slate-100');
        });

        const activeBtn = document.getElementById(`btn-${tabId}`);
        if (activeBtn) {
            activeBtn.classList.remove('text-slate-600', 'hover:bg-slate-100');
            activeBtn.classList.add('bg-green-700', 'text-white', 'shadow-sm');
        }

        document.querySelectorAll('.admin-tab-content').forEach(content => {
            content.classList.add('hidden');
        });

        const target = document.getElementById(tabId);
        if (target) target.classList.remove('hidden');

        if (tabId === 'tab-approvals') this.renderApprovalsTable();
        if (tabId === 'tab-rating') this.renderRatingTable();
        if (tabId === 'tab-pairing') this.renderPairingView();
    },

    // 3. Tải toàn bộ dữ liệu từ Supabase hoặc Local Demo
    loadAllData: async function() {
        const client = Auth.getClient();
        let list = [];

        try {
            if (client) {
                const { data, error } = await client
                    .from('athletes')
                    .select('*')
                    .order('created_at', { ascending: true });
                if (!error && data && data.length > 0) list = data;
            }
            
            if (list.length === 0) {
                const local = JSON.parse(localStorage.getItem('tech_athletes_demo') || '[]');
                list = local.length > 0 ? local : this.getSampleData();
                localStorage.setItem('tech_athletes_demo', JSON.stringify(list));
            }
        } catch (e) {
            console.warn("Lỗi load admin data, chuyển sang dữ liệu mẫu:", e);
            list = this.getSampleData();
        }

        this.athletes = list;
        this.updateKpiCounters();
        this.renderApprovalsTable();
        this.renderRatingTable();
        this.loadSavedPairs();
    },

    updateKpiCounters: function() {
        const total = this.athletes.length;
        const pending = this.athletes.filter(a => a.status === 'pending_registration').length;
        const approved = this.athletes.filter(a => a.status === 'approved').length;
        const ranked = this.athletes.filter(a => a.status === 'approved' && !!a.official_rank).length;
        const pendingWithdraw = this.athletes.filter(a => a.status === 'pending_withdraw').length;

        const setVal = (id, val) => {
            const el = document.getElementById(id);
            if (el) el.textContent = val;
        };

        setVal('kpi-total', total);
        setVal('kpi-pending', pending);
        setVal('kpi-approved', approved);
        setVal('kpi-ranked', ranked);

        const totalPendingAction = pending + pendingWithdraw;
        const badge = document.getElementById('badge-pending-count');
        if (badge) {
            if (totalPendingAction > 0) {
                badge.textContent = totalPendingAction;
                badge.classList.remove('hidden');
            } else {
                badge.classList.add('hidden');
            }
        }
    },

    // ================= TAB 1: DUYỆT ĐƠN & SOI BILL =================
    renderApprovalsTable: function() {
        const container = document.getElementById('approvals-cards-list');
        const emptyState = document.getElementById('approvals-empty');
        if (!container) return;

        const statusFilter = document.getElementById('filter-approval-status')?.value || '';
        const search = (document.getElementById('approval-search')?.value || '').toLowerCase().trim();

        const filtered = this.athletes.filter(a => {
            const matchStatus = !statusFilter || a.status === statusFilter;
            const matchSearch = !search || 
                a.full_name?.toLowerCase().includes(search) ||
                a.email?.toLowerCase().includes(search) ||
                a.phone?.includes(search);
            return matchStatus && matchSearch;
        });

        if (filtered.length === 0) {
            container.innerHTML = '';
            if (emptyState) emptyState.classList.remove('hidden');
            return;
        }

        if (emptyState) emptyState.classList.add('hidden');

        const currentYear = new Date().getFullYear();
        const eventLabels = {
            'doi_nam': 'Đôi Nam',
            'doi_nam_nu': 'Đôi Nam Nữ',
            'ca_hai': 'Cả 2 nội dung'
        };

        container.innerHTML = filtered.map((a, idx) => {
            const age = a.dob ? (currentYear - new Date(a.dob).getFullYear()) : '--';
            const exp = `${a.exp_years || 0} năm ${a.exp_months || 0} tháng`;

            let statusBadge = '';
            if (a.status === 'pending_registration') {
                statusBadge = '<span class="px-2 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800">Chờ duyệt mới</span>';
            } else if (a.status === 'approved') {
                statusBadge = '<span class="px-2 py-0.5 rounded-full text-[11px] font-bold bg-green-100 text-green-800">Đã duyệt</span>';
            } else if (a.status === 'pending_withdraw') {
                statusBadge = '<span class="px-2 py-0.5 rounded-full text-[11px] font-bold bg-orange-100 text-orange-800 animate-pulse">Xin rút đơn</span>';
            } else if (a.status === 'rejected') {
                statusBadge = '<span class="px-2 py-0.5 rounded-full text-[11px] font-bold bg-red-100 text-red-700">Đã từ chối</span>';
            } else if (a.status === 'withdrawn') {
                statusBadge = '<span class="px-2 py-0.5 rounded-full text-[11px] font-bold bg-slate-200 text-slate-700">Đã rút đơn</span>';
            }

            return `
                <div class="app-card p-4 space-y-3 hover:border-slate-300 transition">
                    <div class="flex items-start justify-between">
                        <div class="flex items-center space-x-2">
                            <span class="w-6 h-6 rounded-md bg-slate-100 text-slate-500 font-mono text-xs font-bold flex items-center justify-center flex-shrink-0">
                                #${idx + 1}
                            </span>
                            <div>
                                <div class="flex items-center space-x-1.5">
                                    <h3 class="font-extrabold text-slate-900 text-sm leading-tight">${a.full_name}</h3>
                                    <span class="text-xs font-bold ${a.gender === 'Nữ' ? 'text-pink-600' : 'text-blue-600'}">(${a.gender})</span>
                                </div>
                                <p class="text-[11px] text-slate-500 font-mono mt-0.5">SĐT: ${a.phone} • ${a.email}</p>
                            </div>
                        </div>
                        <div>${statusBadge}</div>
                    </div>

                    <div class="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                        <div>
                            <span class="text-slate-400 text-[10px] block">Thể hình & Tuổi:</span>
                            <strong class="text-slate-800">${age}t • ${a.height || '--'}cm • ${a.weight || '--'}kg</strong>
                        </div>
                        <div>
                            <span class="text-slate-400 text-[10px] block">Kinh nghiệm:</span>
                            <strong class="text-slate-800">${exp}</strong>
                        </div>
                        <div>
                            <span class="text-slate-400 text-[10px] block">Nội dung đăng ký:</span>
                            <strong class="text-green-700">${eventLabels[a.event_category] || a.event_category}</strong>
                        </div>
                        <div>
                            <span class="text-slate-400 text-[10px] block">Lệ phí đã nộp:</span>
                            <strong class="text-slate-900 font-mono font-bold">${(a.fee_amount || 200000).toLocaleString('vi-VN')} đ</strong>
                        </div>
                    </div>

                    ${a.reject_reason ? `
                        <div class="p-2 bg-red-50 text-red-700 rounded-lg text-xs">
                            <i class="fas fa-circle-exclamation mr-1"></i> Lý do từ chối: <strong>${a.reject_reason}</strong>
                        </div>
                    ` : ''}

                    <div class="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-slate-100">
                        <button type="button" onclick="Admin.openLightbox('${a.bill_image_url}')" class="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center space-x-1.5 transition">
                            <i class="fas fa-receipt text-green-700"></i>
                            <span>Soi Ảnh Bill CK</span>
                        </button>

                        <div class="flex items-center space-x-2">
                            ${a.status !== 'approved' && a.status !== 'withdrawn' ? `
                                <button type="button" onclick="Admin.approveAthlete('${a.id}')" class="px-3.5 py-1.5 rounded-lg bg-green-700 hover:bg-green-800 text-white font-bold text-xs transition shadow-sm flex items-center space-x-1">
                                    <i class="fas fa-check"></i>
                                    <span>Duyệt Đơn</span>
                                </button>
                            ` : ''}

                            ${a.status === 'pending_withdraw' ? `
                                <button type="button" onclick="Admin.confirmApproveWithdraw('${a.id}')" class="px-3.5 py-1.5 rounded-lg bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs transition shadow-sm flex items-center space-x-1">
                                    <i class="fas fa-hand-holding-dollar"></i>
                                    <span>Duyệt Cho Rút Đơn</span>
                                </button>
                            ` : ''}

                            ${a.status !== 'rejected' && a.status !== 'withdrawn' ? `
                                <button type="button" onclick="Admin.openRejectModal('${a.id}')" class="px-3 py-1.5 rounded-lg bg-white hover:bg-red-50 text-slate-600 hover:text-red-600 border border-slate-300 text-xs font-bold transition" title="Từ chối đơn">
                                    <i class="fas fa-ban mr-1"></i>
                                    <span>Từ Chối</span>
                                </button>
                            ` : ''}
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    },

    approveAthlete: async function(id) {
        await this.updateAthleteStatus(id, 'approved');
        this.showToast("Đã duyệt đơn đăng ký của VĐV thành công!");
    },

    confirmApproveWithdraw: async function(id) {
        if (!confirm("Xác nhận duyệt cho VĐV này rút đơn khỏi giải?\n(VĐV sẽ nhận được thông báo liên hệ BTC nhận lại lệ phí).")) {
            return;
        }
        await this.updateAthleteStatus(id, 'withdrawn');
        this.showToast("Đã duyệt rút đơn thành công!");
    },

    updateAthleteStatus: async function(id, newStatus, reason = null) {
        const client = Auth.getClient();
        try {
            if (client) {
                const updatePayload = { status: newStatus };
                if (reason) updatePayload.reject_reason = reason;
                await client.from('athletes').update(updatePayload).eq('id', id);
            }

            const local = JSON.parse(localStorage.getItem('tech_athletes_demo') || '[]');
            const itemLocal = local.find(a => a.id === id);
            if (itemLocal) {
                itemLocal.status = newStatus;
                if (reason) itemLocal.reject_reason = reason;
                localStorage.setItem('tech_athletes_demo', JSON.stringify(local));
            }

            const itemMem = this.athletes.find(a => a.id === id);
            if (itemMem) {
                itemMem.status = newStatus;
                if (reason) itemMem.reject_reason = reason;
            }

            this.updateKpiCounters();
            this.renderApprovalsTable();
            this.renderRatingTable();
            this.renderPairingView();
        } catch (e) {
            console.error("Lỗi cập nhật status:", e);
        }
    },

    openRejectModal: function(id) {
        this.selectedRejectAthleteId = id;
        const a = this.athletes.find(x => x.id === id);
        if (!a) return;
        document.getElementById('reject-athlete-name').textContent = a.full_name;
        document.getElementById('reject-reason-text').value = '';
        document.getElementById('modal-reject').classList.remove('hidden');
    },

    closeRejectModal: function() {
        document.getElementById('modal-reject').classList.add('hidden');
        this.selectedRejectAthleteId = null;
    },

    confirmReject: async function() {
        if (!this.selectedRejectAthleteId) return;
        const reason = document.getElementById('reject-reason-text').value.trim() || 'Hồ sơ chưa đạt yêu cầu BTC';
        await this.updateAthleteStatus(this.selectedRejectAthleteId, 'rejected', reason);
        this.closeRejectModal();
        this.showToast("Đã từ chối đơn đăng ký.");
    },

    // ================= TAB 2: CHẤM TRÌNH REAL =================
    renderRatingTable: function() {
        const container = document.getElementById('rating-cards-list');
        if (!container) return;

        const approvedAthletes = this.athletes.filter(a => a.status === 'approved');
        const currentYear = new Date().getFullYear();
        const ranks = CONFIG.TOURNAMENT.RANKS;

        if (approvedAthletes.length === 0) {
            container.innerHTML = `<div class="p-8 text-center text-slate-400 text-xs font-semibold app-card">Chưa có VĐV nào được phê duyệt để chấm trình. Hãy duyệt đơn ở Tab 1 trước.</div>`;
            return;
        }

        container.innerHTML = approvedAthletes.map((a, idx) => {
            const age = a.dob ? (currentYear - new Date(a.dob).getFullYear()) : '--';
            const exp = `${a.exp_years || 0}n ${a.exp_months || 0}th`;

            const rankOptions = ranks.map(r => `
                <option value="${r.id}" ${a.official_rank === r.id ? 'selected' : ''}>
                    ${r.id} - ${r.title}
                </option>
            `).join('');

            return `
                <div class="app-card p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div class="flex items-center space-x-2.5">
                        <span class="w-6 h-6 rounded-md bg-slate-100 text-slate-500 font-mono text-xs font-bold flex items-center justify-center flex-shrink-0">
                            #${idx + 1}
                        </span>
                        <div>
                            <div class="flex items-center space-x-1.5">
                                <strong class="text-slate-900 text-sm">${a.full_name}</strong>
                                <span class="text-xs font-bold ${a.gender === 'Nữ' ? 'text-pink-600' : 'text-blue-600'}">(${a.gender})</span>
                            </div>
                            <p class="text-[11px] text-slate-500 mt-0.5">
                                ${age} tuổi • ${a.height || '--'}cm • ${a.weight || '--'}kg • Chơi ${exp}
                            </p>
                        </div>
                    </div>

                    <div class="flex items-center justify-between sm:justify-end space-x-3 pt-2 sm:pt-0 border-t sm:border-0 border-slate-100">
                        <div class="text-left sm:text-right">
                            <span class="text-[10px] text-slate-400 block font-semibold">Tự chấm:</span>
                            <span class="rank-pill rank-pill-${(a.self_rank || 'lv3').toLowerCase()} font-bold">${a.self_rank || 'Lv3'}</span>
                        </div>

                        <div class="w-44">
                            <label class="text-[10px] text-slate-400 block font-semibold mb-0.5">Trình Real (BTC):</label>
                            <select onchange="Admin.assignOfficialRank('${a.id}', this.value)" class="py-1 px-2 text-xs font-bold border border-green-600 text-green-800 bg-green-50/50 rounded-lg">
                                <option value="">-- Chưa chấm --</option>
                                ${rankOptions}
                            </select>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    },

    assignOfficialRank: async function(id, rank) {
        const client = Auth.getClient();
        try {
            if (client) {
                await client.from('athletes').update({ official_rank: rank || null }).eq('id', id);
            }

            const local = JSON.parse(localStorage.getItem('tech_athletes_demo') || '[]');
            const itemLocal = local.find(a => a.id === id);
            if (itemLocal) {
                itemLocal.official_rank = rank || null;
                localStorage.setItem('tech_athletes_demo', JSON.stringify(local));
            }

            const itemMem = this.athletes.find(a => a.id === id);
            if (itemMem) itemMem.official_rank = rank || null;

            this.updateKpiCounters();
            this.renderPairingView();
            this.showToast(`Đã lưu Rank ${rank || '(trống)'} cho VĐV!`);
        } catch (e) {
            console.error("Lỗi gán rank:", e);
        }
    },

    // ================= TAB 3: TRỢ LÝ GHÉP CẶP THÔNG MINH CHO BTC =================
    switchPairingView: function(view) {
        this.pairingEventView = view;
        const btnMen = document.getElementById('btn-pair-men');
        const btnMixed = document.getElementById('btn-pair-mixed');

        if (view === 'doi_nam') {
            btnMen.className = 'px-3.5 py-1.5 rounded-lg bg-green-700 text-white font-bold text-xs flex items-center space-x-1.5';
            btnMixed.className = 'px-3.5 py-1.5 rounded-lg text-slate-600 hover:bg-slate-100 font-bold text-xs flex items-center space-x-1.5';
        } else {
            btnMixed.className = 'px-3.5 py-1.5 rounded-lg bg-green-700 text-white font-bold text-xs flex items-center space-x-1.5';
            btnMen.className = 'px-3.5 py-1.5 rounded-lg text-slate-600 hover:bg-slate-100 font-bold text-xs flex items-center space-x-1.5';
        }

        this.renderPairingView();
    },

    // Lấy VĐV đủ điều kiện cho từng nội dung
    getEligibleAthletesForEvent: function(eventType) {
        return this.athletes.filter(a => {
            if (a.status !== 'approved' || !a.official_rank) return false;
            if (eventType === 'doi_nam') {
                return a.gender === 'Nam' && (a.event_category === 'doi_nam' || a.event_category === 'ca_hai');
            } else {
                return a.event_category === 'doi_nam_nu' || a.event_category === 'ca_hai';
            }
        });
    },

    // Lấy danh sách ID VĐV đã được ghép cặp
    getPairedPlayerIds: function(eventType) {
        const pairsList = this.pairs[eventType] || [];
        const ids = new Set();
        pairsList.forEach(p => {
            if (p.player1) ids.add(p.player1.id);
            if (p.player2) ids.add(p.player2.id);
        });
        return ids;
    },

    // Lấy danh sách VĐV chưa ghép cặp (Unpaired Pool)
    getUnpairedAthletes: function(eventType) {
        const eligible = this.getEligibleAthletesForEvent(eventType);
        const pairedIds = this.getPairedPlayerIds(eventType);
        return eligible.filter(a => !pairedIds.has(a.id));
    },

    // Render toàn bộ View Ghép Cặp
    renderPairingView: function() {
        this.updatePairCounters();
        this.renderUnpairedPool();
        this.renderPairedMatchups();
    },

    updatePairCounters: function() {
        const cMen = document.getElementById('count-pair-men');
        const cMix = document.getElementById('count-pair-mixed');
        if (cMen) cMen.textContent = (this.pairs.doi_nam || []).length;
        if (cMix) cMix.textContent = (this.pairs.doi_nam_nu || []).length;

        const currentPairs = this.pairs[this.pairingEventView] || [];
        const unpaired = this.getUnpairedAthletes(this.pairingEventView);

        const unpairedBadge = document.getElementById('unpaired-count-badge');
        const pairedBadge = document.getElementById('paired-count-badge');

        if (unpairedBadge) unpairedBadge.textContent = `${unpaired.length} VĐV`;
        if (pairedBadge) pairedBadge.textContent = `${currentPairs.length} cặp`;
    },

    // Render Cột 1: KHO VĐV CHỜ GHÉP
    renderUnpairedPool: function() {
        const container = document.getElementById('unpaired-container');
        if (!container) return;

        const unpaired = this.getUnpairedAthletes(this.pairingEventView);
        const rankFilter = document.getElementById('filter-unpaired-rank')?.value || '';

        const filtered = unpaired.filter(a => !rankFilter || a.official_rank === rankFilter);

        if (unpaired.length === 0) {
            container.innerHTML = `
                <div class="p-6 text-center bg-white rounded-xl border border-dashed border-green-300 space-y-2">
                    <div class="w-10 h-10 rounded-full bg-green-50 text-green-700 flex items-center justify-center mx-auto text-base">
                        <i class="fas fa-check-double"></i>
                    </div>
                    <strong class="text-xs font-bold text-green-800 block">Đã ghép hết toàn bộ!</strong>
                    <p class="text-[11px] text-slate-500">Tất cả VĐV đủ điều kiện ở nội dung này đã có bạn đánh cặp.</p>
                </div>
            `;
            return;
        }

        if (filtered.length === 0) {
            container.innerHTML = `<div class="p-4 text-center text-slate-400 text-xs bg-white rounded-xl border border-slate-200">Không có VĐV nào khớp với Rank ${rankFilter}.</div>`;
            return;
        }

        const currentYear = new Date().getFullYear();

        container.innerHTML = filtered.map(a => {
            const age = a.dob ? (currentYear - new Date(a.dob).getFullYear()) : '--';
            const pts = this.rankPoints[a.official_rank] || 2;

            return `
                <div class="bg-white p-3 rounded-xl border border-slate-200 hover:border-slate-300 shadow-2xs space-y-2 transition">
                    <div class="flex items-center justify-between">
                        <div class="flex items-center space-x-2">
                            <div>
                                <div class="flex items-center space-x-1.5">
                                    <strong class="text-xs text-slate-900">${a.full_name}</strong>
                                    <span class="text-[10px] font-bold ${a.gender === 'Nữ' ? 'text-pink-600' : 'text-blue-600'}">(${a.gender})</span>
                                </div>
                                <span class="text-[11px] text-slate-500 block mt-0.5">${age} tuổi • ${a.height || '--'}cm • chơi ${a.exp_years || 0}n${a.exp_months || 0}th</span>
                            </div>
                        </div>

                        <div class="text-right">
                            <span class="rank-pill rank-pill-${(a.official_rank || 'lv3').toLowerCase()} font-bold text-xs">
                                ${a.official_rank} (${pts}đ)
                            </span>
                        </div>
                    </div>

                    <div class="pt-1.5 border-t border-slate-100 flex items-center justify-between">
                        <span class="text-[10px] text-slate-400 italic">Chưa ghép cặp</span>
                        <button type="button" onclick="Admin.openSmartPairModal('${a.id}')" class="px-2.5 py-1 bg-green-700 hover:bg-green-800 text-white font-bold text-[11px] rounded-lg shadow-2xs transition active:scale-95 flex items-center space-x-1">
                            <i class="fas fa-wand-magic-sparkles text-[10px]"></i>
                            <span>Chọn Ghép</span>
                        </button>
                    </div>
                </div>
            `;
        }).join('');
    },

    // Render Cột 2: CÁC CẶP ĐẤU ĐÃ GHÉP
    renderPairedMatchups: function() {
        const container = document.getElementById('pairs-container');
        if (!container) return;

        const currentPairs = this.pairs[this.pairingEventView] || [];

        if (currentPairs.length === 0) {
            container.innerHTML = `
                <div class="p-8 text-center bg-white rounded-xl border border-slate-200 space-y-2.5">
                    <div class="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto text-lg">
                        <i class="fas fa-user-group"></i>
                    </div>
                    <strong class="text-xs font-bold text-slate-700 block">Chưa có cặp đấu nào được ghép</strong>
                    <p class="text-[11px] text-slate-500 max-w-xs mx-auto">
                        Chọn một VĐV bên cột trái rồi bấm <strong>"Chọn Ghép"</strong> để hệ thống gợi ý, hoặc bấm <strong>"Gợi Ý Xếp Mẫu"</strong> ở trên để máy tự tạo khung nháp.
                    </p>
                </div>
            `;
            return;
        }

        container.innerHTML = currentPairs.map((p, idx) => {
            const pts1 = this.rankPoints[p.player1.official_rank] || 2;
            const pts2 = this.rankPoints[p.player2.official_rank] || 2;
            const totalScore = pts1 + pts2;

            // Đánh giá chỉ số cân bằng
            let balanceTag = '';
            let balanceDesc = '';

            if (totalScore === 5) {
                balanceTag = '<span class="px-2 py-0.5 rounded text-[10px] font-bold balance-tag-ideal">🟢 Chuẩn Vàng 5★ (Cực Cân Bằng)</span>';
                balanceDesc = 'Cặp đấu lý tưởng theo công thức Lv1+Lv4 hoặc Lv2+Lv3';
            } else if (totalScore === 4 || totalScore === 6) {
                balanceTag = `<span class="px-2 py-0.5 rounded text-[10px] font-bold balance-tag-ok">🟡 Lệch Nhẹ ${totalScore}★</span>`;
                balanceDesc = `Chênh lệch 1 điểm so với chuẩn 5★ (${totalScore > 5 ? 'hơi mạnh' : 'hơi đuối'})`;
            } else {
                balanceTag = `<span class="px-2 py-0.5 rounded text-[10px] font-bold balance-tag-alert">🔴 Lệch Nhiều ${totalScore}★</span>`;
                balanceDesc = `Chênh lệch lớn so với chuẩn 5★ (${totalScore > 5 ? 'quá mạnh' : 'quá yếu'})`;
            }

            return `
                <div class="app-card p-3.5 space-y-2.5 bg-white border border-slate-200 hover:border-slate-300 transition">
                    <!-- Header Thẻ Cặp -->
                    <div class="flex items-center justify-between pb-2 border-b border-slate-100">
                        <div class="flex items-center space-x-2">
                            <span class="w-6 h-6 rounded-md bg-green-100 text-green-800 font-mono text-xs font-bold flex items-center justify-center flex-shrink-0">
                                #${idx + 1}
                            </span>
                            <span class="text-xs font-bold text-slate-800">Cặp Đấu #${idx + 1}</span>
                        </div>
                        <div>${balanceTag}</div>
                    </div>

                    <!-- 2 VĐV đối kháng -->
                    <div class="grid grid-cols-11 gap-2 items-center text-xs">
                        <!-- VĐV 1 -->
                        <div class="col-span-5 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                            <div class="flex items-center justify-between">
                                <strong class="text-slate-900 block truncate">${p.player1.full_name}</strong>
                                <span class="rank-pill rank-pill-${(p.player1.official_rank || 'lv3').toLowerCase()} text-[10px] font-bold ml-1">${p.player1.official_rank}</span>
                            </div>
                            <span class="text-[10px] text-slate-500 block mt-0.5">${p.player1.gender} • ${pts1} điểm</span>
                        </div>

                        <!-- Icon bắt tay -->
                        <div class="col-span-1 text-center text-slate-400 font-bold text-sm">
                            🤝
                        </div>

                        <!-- VĐV 2 -->
                        <div class="col-span-5 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                            <div class="flex items-center justify-between">
                                <strong class="text-slate-900 block truncate">${p.player2.full_name}</strong>
                                <span class="rank-pill rank-pill-${(p.player2.official_rank || 'lv3').toLowerCase()} text-[10px] font-bold ml-1">${p.player2.official_rank}</span>
                            </div>
                            <span class="text-[10px] text-slate-500 block mt-0.5">${p.player2.gender} • ${pts2} điểm</span>
                        </div>
                    </div>

                    <!-- Footer Thẻ Cặp: Đánh giá & Các nút thao tác -->
                    <div class="flex items-center justify-between pt-1.5 border-t border-slate-100 text-[11px]">
                        <span class="text-slate-400 text-[10px]">${balanceDesc}</span>

                        <div class="flex items-center space-x-1.5">
                            <button type="button" onclick="Admin.openSwapModal('${p.id}', '${p.player2.id}')" class="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg transition" title="Hoán đổi người với cặp khác">
                                <i class="fas fa-shuffle text-green-700 mr-1"></i> Đổi người
                            </button>
                            <button type="button" onclick="Admin.unpair('${p.id}')" class="px-2 py-1 bg-white hover:bg-red-50 text-slate-500 hover:text-red-600 border border-slate-200 font-bold rounded-lg transition" title="Gỡ cặp này ra để đưa 2 VĐV về kho chưa ghép">
                                <i class="fas fa-trash-can mr-1"></i> Gỡ
                            </button>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    },

    // ================= MODAL 1: CHỌN ĐỐI TÁC THÔNG MINH =================
    openSmartPairModal: function(p1Id) {
        const p1 = this.athletes.find(a => a.id === p1Id);
        if (!p1) return;

        this.selectedP1ForSmartPair = p1;

        const currentYear = new Date().getFullYear();
        const age = p1.dob ? (currentYear - new Date(p1.dob).getFullYear()) : '--';
        const pts1 = this.rankPoints[p1.official_rank] || 2;

        document.getElementById('smart-p1-name').textContent = p1.full_name;
        document.getElementById('smart-p1-sub').textContent = `${p1.gender} • ${age} tuổi • ${p1.height || '--'}cm • chơi ${p1.exp_years || 0}n${p1.exp_months || 0}th`;
        
        const rankEl = document.getElementById('smart-p1-rank');
        rankEl.textContent = `${p1.official_rank} (${pts1}đ)`;
        rankEl.className = `rank-pill rank-pill-${(p1.official_rank || 'lv3').toLowerCase()} font-bold text-xs`;

        // Điểm cần tìm để đạt 5★
        const idealPts = 5 - pts1;
        const targetRank = Object.keys(this.rankPoints).find(k => this.rankPoints[k] === idealPts) || 'Lv4';
        
        document.getElementById('smart-pair-target-hint').innerHTML = `
            <i class="fas fa-bullseye text-green-700"></i>
            <span>Mục tiêu lý tưởng: Ghép với đối tác <strong class="text-green-800">${targetRank} (${idealPts}đ)</strong> để đạt chuẩn vàng <strong>5★</strong>.</span>
        `;

        // Lấy danh sách ứng viên trong kho Unpaired
        const unpaired = this.getUnpairedAthletes(this.pairingEventView).filter(a => a.id !== p1.id);
        let candidates = [];

        if (this.pairingEventView === 'doi_nam') {
            candidates = unpaired.filter(a => a.gender === 'Nam');
        } else {
            // Đôi Nam Nữ: nếu p1 là Nam thì đối tác phải là Nữ, và ngược lại
            candidates = unpaired.filter(a => a.gender !== p1.gender);
        }

        // Sắp xếp ứng viên theo độ gần với 5★ nhất
        candidates.sort((a, b) => {
            const sumA = pts1 + (this.rankPoints[a.official_rank] || 2);
            const sumB = pts1 + (this.rankPoints[b.official_rank] || 2);
            const diffA = Math.abs(sumA - 5);
            const diffB = Math.abs(sumB - 5);
            return diffA - diffB;
        });

        const listContainer = document.getElementById('smart-candidates-list');

        if (candidates.length === 0) {
            listContainer.innerHTML = `
                <div class="py-8 text-center text-slate-400 text-xs">
                    ${this.pairingEventView === 'doi_nam_nu' 
                        ? `Không còn VĐV ${p1.gender === 'Nam' ? 'Nữ' : 'Nam'} nào trong kho chưa ghép để ghép đôi nam nữ!` 
                        : 'Không còn VĐV nam nào khác trong kho chưa ghép!'}
                </div>
            `;
        } else {
            listContainer.innerHTML = candidates.map(c => {
                const ptsC = this.rankPoints[c.official_rank] || 2;
                const sum = pts1 + ptsC;
                const cAge = c.dob ? (currentYear - new Date(c.dob).getFullYear()) : '--';

                let tagClass = 'balance-tag-ok';
                let tagText = `🟡 Tổng ${sum}★ (Lệch nhẹ)`;
                if (sum === 5) {
                    tagClass = 'balance-tag-ideal';
                    tagText = `🟢 Tổng 5★ (Chuẩn Cân Bằng Nhất!)`;
                } else if (sum <= 3 || sum >= 7) {
                    tagClass = 'balance-tag-alert';
                    tagText = `🔴 Tổng ${sum}★ (${sum > 5 ? 'Hơi mạnh' : 'Hơi đuối'})`;
                }

                return `
                    <div class="p-3 bg-white rounded-xl border border-slate-200 hover:border-green-600 transition flex items-center justify-between gap-3 shadow-2xs">
                        <div class="min-w-0">
                            <div class="flex items-center space-x-1.5">
                                <strong class="text-xs text-slate-900 truncate">${c.full_name}</strong>
                                <span class="text-[10px] font-bold ${c.gender === 'Nữ' ? 'text-pink-600' : 'text-blue-600'}">(${c.gender})</span>
                                <span class="rank-pill rank-pill-${(c.official_rank || 'lv3').toLowerCase()} text-[10px]">${c.official_rank} (${ptsC}đ)</span>
                            </div>
                            <div class="mt-1 flex items-center space-x-2">
                                <span class="text-[10px] text-slate-400">${cAge}t • ${c.height || '--'}cm • chơi ${c.exp_years || 0}n${c.exp_months || 0}th</span>
                                <span class="px-1.5 py-0.2 rounded text-[10px] font-bold ${tagClass}">${tagText}</span>
                            </div>
                        </div>

                        <button type="button" onclick="Admin.confirmPairing('${p1.id}', '${c.id}')" class="px-3 py-1.5 bg-green-700 hover:bg-green-800 text-white font-bold text-xs rounded-lg transition active:scale-95 whitespace-nowrap shadow-2xs flex items-center space-x-1">
                            <i class="fas fa-check text-[10px]"></i>
                            <span>Ghép Ngay</span>
                        </button>
                    </div>
                `;
            }).join('');
        }

        document.getElementById('modal-smart-pair').classList.remove('hidden');
    },

    closeSmartPairModal: function() {
        document.getElementById('modal-smart-pair').classList.add('hidden');
        this.selectedP1ForSmartPair = null;
    },

    // Xác nhận ghép đôi 2 VĐV
    confirmPairing: function(p1Id, p2Id) {
        const p1 = this.athletes.find(a => a.id === p1Id);
        const p2 = this.athletes.find(a => a.id === p2Id);
        if (!p1 || !p2) return;

        const pts1 = this.rankPoints[p1.official_rank] || 2;
        const pts2 = this.rankPoints[p2.official_rank] || 2;

        const newPair = {
            id: 'pair-' + Date.now(),
            player1: p1,
            player2: p2,
            totalScore: pts1 + pts2
        };

        if (!this.pairs[this.pairingEventView]) {
            this.pairs[this.pairingEventView] = [];
        }

        this.pairs[this.pairingEventView].push(newPair);
        localStorage.setItem('tech_tournament_pairs', JSON.stringify(this.pairs));

        this.closeSmartPairModal();
        this.renderPairingView();
        this.showToast(`Đã ghép thành công: ${p1.full_name} 🤝 ${p2.full_name}!`);
    },

    // Gỡ cặp đấu
    unpair: function(pairId) {
        const list = this.pairs[this.pairingEventView] || [];
        const pair = list.find(p => p.id === pairId);
        if (!pair) return;

        this.pairs[this.pairingEventView] = list.filter(p => p.id !== pairId);
        localStorage.setItem('tech_tournament_pairs', JSON.stringify(this.pairs));

        this.renderPairingView();
        this.showToast(`Đã tách Cặp: ${pair.player1.full_name} 🤝 ${pair.player2.full_name} về lại kho chờ ghép!`);
    },

    // ================= MODAL 2: HOÁN ĐỔI VĐV (SWAP PLAYERS) =================
    openSwapModal: function(pairId, playerId) {
        const currentPairs = this.pairs[this.pairingEventView] || [];
        const sourcePair = currentPairs.find(p => p.id === pairId);
        if (!sourcePair) return;

        const sourcePlayer = (sourcePair.player1.id === playerId) ? sourcePair.player1 : sourcePair.player2;
        const partnerPlayer = (sourcePair.player1.id === playerId) ? sourcePair.player2 : sourcePair.player1;

        this.selectedSwapContext = { pairId, playerId, sourcePlayer, partnerPlayer };

        const currentYear = new Date().getFullYear();
        const ptsSrc = this.rankPoints[sourcePlayer.official_rank] || 2;

        document.getElementById('swap-source-name').textContent = `${sourcePlayer.full_name} (${sourcePlayer.official_rank} - ${ptsSrc}đ)`;
        document.getElementById('swap-source-info').textContent = `Đang ở Cặp #${currentPairs.indexOf(sourcePair) + 1} cùng với ${partnerPlayer.full_name}`;

        // Danh sách các VĐV ở các cặp khác có thể đổi
        const otherPairs = currentPairs.filter(p => p.id !== pairId);
        const candidates = [];

        otherPairs.forEach(op => {
            [op.player1, op.player2].forEach(p => {
                // Với Đôi Nam Nữ: Nam chỉ đổi Nam, Nữ chỉ đổi Nữ
                if (this.pairingEventView === 'doi_nam_nu' && p.gender !== sourcePlayer.gender) {
                    return;
                }
                candidates.push({ pair: op, player: p });
            });
        });

        const listContainer = document.getElementById('swap-targets-list');

        if (candidates.length === 0) {
            listContainer.innerHTML = `<div class="py-8 text-center text-slate-400 text-xs">Chưa có cặp đấu nào khác đủ điều kiện để hoán đổi người!</div>`;
        } else {
            listContainer.innerHTML = candidates.map(item => {
                const targetP = item.player;
                const targetOp = item.pair;
                const ptsTarget = this.rankPoints[targetP.official_rank] || 2;
                const ptsPartner = this.rankPoints[partnerPlayer.official_rank] || 2;
                
                // Nếu đổi, cặp hiện tại sẽ có tổng điểm mới
                const newScoreSource = ptsPartner + ptsTarget;

                return `
                    <div class="p-3 bg-white rounded-xl border border-slate-200 hover:border-green-600 transition flex items-center justify-between gap-3 shadow-2xs">
                        <div class="min-w-0">
                            <div class="flex items-center space-x-1.5">
                                <strong class="text-xs text-slate-900 truncate">${targetP.full_name}</strong>
                                <span class="rank-pill rank-pill-${(targetP.official_rank || 'lv3').toLowerCase()} text-[10px]">${targetP.official_rank}</span>
                            </div>
                            <span class="text-[10px] text-slate-500 block mt-0.5">
                                Thuộc Cặp #${currentPairs.indexOf(targetOp) + 1} • Nếu đổi cặp bạn sẽ thành <strong>${newScoreSource}★</strong>
                            </span>
                        </div>

                        <button type="button" onclick="Admin.confirmSwap('${targetOp.id}', '${targetP.id}')" class="px-3 py-1.5 bg-slate-900 hover:bg-black text-white font-bold text-xs rounded-lg transition active:scale-95 whitespace-nowrap shadow-2xs">
                            Đổi Với Người Này
                        </button>
                    </div>
                `;
            }).join('');
        }

        document.getElementById('modal-swap-players').classList.remove('hidden');
    },

    closeSwapModal: function() {
        document.getElementById('modal-swap-players').classList.add('hidden');
        this.selectedSwapContext = null;
    },

    confirmSwap: function(targetPairId, targetPlayerId) {
        if (!this.selectedSwapContext) return;

        const { pairId, playerId } = this.selectedSwapContext;
        const currentPairs = this.pairs[this.pairingEventView] || [];

        const pairA = currentPairs.find(p => p.id === pairId);
        const pairB = currentPairs.find(p => p.id === targetPairId);

        if (!pairA || !pairB) return;

        // Hoán đổi
        let playerA, playerB;

        if (pairA.player1.id === playerId) {
            playerA = pairA.player1;
            if (pairB.player1.id === targetPlayerId) {
                playerB = pairB.player1;
                pairA.player1 = playerB;
                pairB.player1 = playerA;
            } else {
                playerB = pairB.player2;
                pairA.player1 = playerB;
                pairB.player2 = playerA;
            }
        } else {
            playerA = pairA.player2;
            if (pairB.player1.id === targetPlayerId) {
                playerB = pairB.player1;
                pairA.player2 = playerB;
                pairB.player1 = playerA;
            } else {
                playerB = pairB.player2;
                pairA.player2 = playerB;
                pairB.player2 = playerA;
            }
        }

        // Tính lại tổng điểm 2 cặp
        pairA.totalScore = (this.rankPoints[pairA.player1.official_rank] || 2) + (this.rankPoints[pairA.player2.official_rank] || 2);
        pairB.totalScore = (this.rankPoints[pairB.player1.official_rank] || 2) + (this.rankPoints[pairB.player2.official_rank] || 2);

        localStorage.setItem('tech_tournament_pairs', JSON.stringify(this.pairs));

        this.closeSwapModal();
        this.renderPairingView();
        this.showToast(`Đã hoán đổi vị trí giữa ${playerA.full_name} và ${playerB.full_name}!`);
    },

    // ================= TỰ ĐỘNG GỢI Ý XẾP MẪU NHÁP (DRAFT) =================
    runAutoSuggestDraft: function() {
        const eligible = this.getEligibleAthletesForEvent(this.pairingEventView);
        if (eligible.length < 2) {
            alert("Cần tối thiểu 2 VĐV đã được phê duyệt và chấm Trình Real để tạo khung xếp mẫu!");
            return;
        }

        if (this.pairingEventView === 'doi_nam') {
            const men = [...eligible].sort((a, b) => 
                (this.rankPoints[b.official_rank] || 2) - (this.rankPoints[a.official_rank] || 2)
            );

            const draftPairs = [];
            let left = 0;
            let right = men.length - 1;

            while (left < right) {
                const p1 = men[left];
                const p2 = men[right];
                draftPairs.push({
                    id: 'pair-' + Date.now() + '-' + left,
                    player1: p1,
                    player2: p2,
                    totalScore: (this.rankPoints[p1.official_rank] || 2) + (this.rankPoints[p2.official_rank] || 2)
                });
                left++;
                right--;
            }

            this.pairs.doi_nam = draftPairs;
        } else {
            const mixedMen = eligible.filter(a => a.gender === 'Nam').sort((a, b) => 
                (this.rankPoints[b.official_rank] || 2) - (this.rankPoints[a.official_rank] || 2)
            );
            const mixedWomen = eligible.filter(a => a.gender === 'Nữ').sort((a, b) => 
                (this.rankPoints[a.official_rank] || 2) - (this.rankPoints[b.official_rank] || 2)
            );

            const draftPairs = [];
            const count = Math.min(mixedMen.length, mixedWomen.length);

            for (let i = 0; i < count; i++) {
                const m = mixedMen[i];
                const w = mixedWomen[i];
                draftPairs.push({
                    id: 'pair-mix-' + Date.now() + '-' + i,
                    player1: m,
                    player2: w,
                    totalScore: (this.rankPoints[m.official_rank] || 2) + (this.rankPoints[w.official_rank] || 2)
                });
            }

            this.pairs.doi_nam_nu = draftPairs;
        }

        localStorage.setItem('tech_tournament_pairs', JSON.stringify(this.pairs));
        this.renderPairingView();
        this.showToast("Đã tạo phương án xếp mẫu nháp! BTC có thể bấm 'Đổi người' hoặc 'Gỡ' để tinh chỉnh.");
    },

    // Tách hết ra kho chờ
    resetAllPairs: function() {
        const count = (this.pairs[this.pairingEventView] || []).length;
        if (count === 0) return;

        if (!confirm(`Bạn có chắc muốn tách toàn bộ ${count} cặp đấu này về lại kho VĐV chờ ghép để tự tay ghép lại từ đầu?`)) {
            return;
        }

        this.pairs[this.pairingEventView] = [];
        localStorage.setItem('tech_tournament_pairs', JSON.stringify(this.pairs));

        this.renderPairingView();
        this.showToast("Đã đưa toàn bộ VĐV về kho chờ ghép.");
    },

    loadSavedPairs: function() {
        const saved = localStorage.getItem('tech_tournament_pairs');
        if (saved) {
            try {
                this.pairs = JSON.parse(saved);
                this.updatePairCounters();
            } catch (e) {}
        }
    },

    // Công bố ra web để VĐV thấy bạn cặp
    publishPairs: async function() {
        const allPairs = [...(this.pairs.doi_nam || []), ...(this.pairs.doi_nam_nu || [])];
        if (allPairs.length === 0) {
            alert("Chưa có cặp đấu nào để công bố! Vui lòng ghép ít nhất 1 cặp trước.");
            return;
        }

        const client = Auth.getClient();

        // Xóa sạch partner_name cũ của những người không còn trong cặp
        this.athletes.forEach(a => a.partner_name = null);

        for (const p of allPairs) {
            const nameFor1 = `${p.player2.full_name} (${p.player2.official_rank})`;
            const nameFor2 = `${p.player1.full_name} (${p.player1.official_rank})`;

            if (client) {
                try {
                    await client.from('athletes').update({ partner_name: nameFor1 }).eq('id', p.player1.id);
                    await client.from('athletes').update({ partner_name: nameFor2 }).eq('id', p.player2.id);
                } catch (e) {}
            }

            const item1 = this.athletes.find(a => a.id === p.player1.id);
            if (item1) item1.partner_name = nameFor1;
            const item2 = this.athletes.find(a => a.id === p.player2.id);
            if (item2) item2.partner_name = nameFor2;
        }

        localStorage.setItem('tech_athletes_demo', JSON.stringify(this.athletes));
        alert("🎉 ĐÃ CÔNG BỐ THÀNH CÔNG!\nBây giờ khi VĐV mở trang chủ xem danh sách hoặc thẻ VĐV của mình sẽ thấy rõ tên bạn đánh cặp.");
    },

    // ================= TAB 4: XUẤT CSV =================
    exportAthletesCsv: function() {
        const headers = ["STT", "Họ Tên", "Giới Tính", "Ngày Sinh", "SĐT", "Email", "Chiều Cao (cm)", "Cân Nặng (kg)", "Kinh Nghiệm", "Trình Tự Chấm", "Trình Real (BTC)", "Nội Dung", "Bạn Đánh Cặp", "Trạng Thái"];
        const rows = this.athletes.map((a, idx) => [
            idx + 1,
            `"${a.full_name}"`,
            a.gender,
            a.dob || '',
            `"${a.phone}"`,
            `"${a.email}"`,
            a.height || '',
            a.weight || '',
            `"${a.exp_years || 0} năm ${a.exp_months || 0} tháng"`,
            a.self_rank || '',
            a.official_rank || '',
            `"${a.event_category}"`,
            `"${a.partner_name || 'Chưa ghép'}"`,
            `"${a.status}"`
        ]);

        const csvContent = "\uFEFF" + [headers.join(","), ...rows.map(r => r.join(","))].join("\r\n");
        this.downloadCsv(csvContent, `Danh_Sach_VDV_Cau_Long_CLB_${new Date().toISOString().slice(0, 10)}.csv`);
    },

    exportPairsCsv: function() {
        const headers = ["Nội Dung", "Cặp Thứ", "VĐV 1", "Rank 1", "VĐV 2", "Rank 2", "Tổng Điểm Cân Bằng"];
        const rows = [];

        (this.pairs.doi_nam || []).forEach((p, idx) => {
            rows.push(["Đôi Nam", idx + 1, `"${p.player1.full_name}"`, p.player1.official_rank, `"${p.player2.full_name}"`, p.player2.official_rank, p.totalScore]);
        });

        (this.pairs.doi_nam_nu || []).forEach((p, idx) => {
            rows.push(["Đôi Nam Nữ", idx + 1, `"${p.player1.full_name}"`, p.player1.official_rank, `"${p.player2.full_name}"`, p.player2.official_rank, p.totalScore]);
        });

        const csvContent = "\uFEFF" + [headers.join(","), ...rows.map(r => r.join(","))].join("\r\n");
        this.downloadCsv(csvContent, `Danh_Sach_Cap_Dau_Cau_Long_CLB_${new Date().toISOString().slice(0, 10)}.csv`);
    },

    downloadCsv: function(content, filename) {
        const blob = new Blob([content], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    },

    // Modal Phóng To Ảnh Bill
    openLightbox: function(url) {
        const modal = document.getElementById('admin-lightbox-modal');
        const img = document.getElementById('admin-lightbox-img');
        if (modal && img) {
            img.src = url || 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&w=600&q=80';
            modal.classList.remove('hidden');
        }
    },

    // Toast thông báo nhỏ nhẹ nhàng
    showToast: function(msg) {
        let toast = document.getElementById('admin-toast');
        if (!toast) {
            toast = document.createElement('div');
            toast.id = 'admin-toast';
            toast.className = 'fixed bottom-4 right-4 z-50 bg-slate-900 text-white px-4 py-2.5 rounded-xl text-xs font-semibold shadow-lg transition-all duration-300 transform translate-y-2 opacity-0';
            document.body.appendChild(toast);
        }
        toast.textContent = msg;
        toast.classList.remove('translate-y-2', 'opacity-0');
        setTimeout(() => {
            toast.classList.add('translate-y-2', 'opacity-0');
        }, 3000);
    },

    // Dữ liệu mẫu 16 VĐV phong phú và chân thực cho CLB Cầu Lông
    getSampleData: function() {
        const billUrl = 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&w=400&q=80';
        return [
            // Nam - Đôi Nam & Cả Hai
            { id: '1', full_name: 'Nguyễn Thành Nam', email: 'nam.tech@gmail.com', phone: '0901234567', gender: 'Nam', dob: '1995-04-12', height: 175, weight: 70, exp_years: 4, exp_months: 6, self_rank: 'Lv1', official_rank: 'Lv1', event_category: 'doi_nam', fee_amount: 200000, bill_image_url: billUrl, status: 'approved', created_at: '2026-10-01T08:00:00Z' },
            { id: '2', full_name: 'Lê Hoàng Long', email: 'long.tech@gmail.com', phone: '0922334455', gender: 'Nam', dob: '1997-01-15', height: 170, weight: 65, exp_years: 2, exp_months: 6, self_rank: 'Lv2', official_rank: 'Lv2', event_category: 'doi_nam', fee_amount: 200000, bill_image_url: billUrl, status: 'approved', created_at: '2026-10-01T08:30:00Z' },
            { id: '3', full_name: 'Phạm Quốc Bảo', email: 'bao.tech@gmail.com', phone: '0933441122', gender: 'Nam', dob: '1996-05-20', height: 173, weight: 68, exp_years: 1, exp_months: 8, self_rank: 'Lv3', official_rank: 'Lv3', event_category: 'doi_nam', fee_amount: 200000, bill_image_url: billUrl, status: 'approved', created_at: '2026-10-01T09:00:00Z' },
            { id: '4', full_name: 'Vũ Đức Minh', email: 'minh.tech@gmail.com', phone: '0933445566', gender: 'Nam', dob: '2000-07-08', height: 178, weight: 75, exp_years: 0, exp_months: 8, self_rank: 'Lv4', official_rank: 'Lv4', event_category: 'doi_nam', fee_amount: 200000, bill_image_url: billUrl, status: 'approved', created_at: '2026-10-01T09:15:00Z' },
            { id: '5', full_name: 'Đỗ Tuấn Anh', email: 'anh.tech@gmail.com', phone: '0966778899', gender: 'Nam', dob: '1994-03-25', height: 176, weight: 72, exp_years: 3, exp_months: 2, self_rank: 'Lv2', official_rank: 'Lv2', event_category: 'doi_nam', fee_amount: 200000, bill_image_url: billUrl, status: 'approved', created_at: '2026-10-01T10:00:00Z' },
            { id: '6', full_name: 'Hoàng Văn Thái', email: 'thai.tech@gmail.com', phone: '0977889900', gender: 'Nam', dob: '1998-12-10', height: 169, weight: 63, exp_years: 1, exp_months: 2, self_rank: 'Lv3', official_rank: 'Lv3', event_category: 'doi_nam', fee_amount: 200000, bill_image_url: billUrl, status: 'approved', created_at: '2026-10-01T10:30:00Z' },

            // Nam tham gia Đôi Nam Nữ hoặc Cả Hai
            { id: '7', full_name: 'Ngô Quang Huy', email: 'huy.tech@gmail.com', phone: '0988990011', gender: 'Nam', dob: '1993-08-14', height: 177, weight: 74, exp_years: 5, exp_months: 0, self_rank: 'Lv1', official_rank: 'Lv1', event_category: 'ca_hai', fee_amount: 300000, bill_image_url: billUrl, status: 'approved', created_at: '2026-10-01T11:00:00Z' },
            { id: '8', full_name: 'Bùi Đình Trọng', email: 'trong.tech@gmail.com', phone: '0911223344', gender: 'Nam', dob: '1997-10-05', height: 172, weight: 66, exp_years: 2, exp_months: 0, self_rank: 'Lv2', official_rank: 'Lv2', event_category: 'doi_nam_nu', fee_amount: 200000, bill_image_url: billUrl, status: 'approved', created_at: '2026-10-01T11:30:00Z' },
            { id: '9', full_name: 'Trần Văn Kiên', email: 'kien.tech@gmail.com', phone: '0955667788', gender: 'Nam', dob: '1999-04-18', height: 168, weight: 62, exp_years: 1, exp_months: 6, self_rank: 'Lv3', official_rank: 'Lv3', event_category: 'doi_nam_nu', fee_amount: 200000, bill_image_url: billUrl, status: 'approved', created_at: '2026-10-01T12:00:00Z' },
            { id: '10', full_name: 'Dương Thành Đạt', email: 'dat.tech@gmail.com', phone: '0944332211', gender: 'Nam', dob: '2001-02-28', height: 174, weight: 69, exp_years: 0, exp_months: 6, self_rank: 'Lv4', official_rank: 'Lv4', event_category: 'doi_nam_nu', fee_amount: 200000, bill_image_url: billUrl, status: 'approved', created_at: '2026-10-01T12:30:00Z' },

            // Nữ tham gia Đôi Nam Nữ
            { id: '11', full_name: 'Trần Thị Thu Hà', email: 'ha.tech@gmail.com', phone: '0912345678', gender: 'Nữ', dob: '1998-09-20', height: 162, weight: 52, exp_years: 2, exp_months: 4, self_rank: 'Lv2', official_rank: 'Lv2', event_category: 'doi_nam_nu', fee_amount: 200000, bill_image_url: billUrl, status: 'approved', created_at: '2026-10-01T13:00:00Z' },
            { id: '12', full_name: 'Đặng Mai Phương', email: 'phuong.tech@gmail.com', phone: '0944556677', gender: 'Nữ', dob: '1999-11-05', height: 165, weight: 55, exp_years: 1, exp_months: 8, self_rank: 'Lv3', official_rank: 'Lv3', event_category: 'doi_nam_nu', fee_amount: 200000, bill_image_url: billUrl, status: 'approved', created_at: '2026-10-01T13:30:00Z' },
            { id: '13', full_name: 'Nguyễn Bích Ngọc', email: 'ngoc.tech@gmail.com', phone: '0922114433', gender: 'Nữ', dob: '1996-06-12', height: 160, weight: 50, exp_years: 3, exp_months: 0, self_rank: 'Lv2', official_rank: 'Lv2', event_category: 'doi_nam_nu', fee_amount: 200000, bill_image_url: billUrl, status: 'approved', created_at: '2026-10-01T14:00:00Z' },
            { id: '14', full_name: 'Lê Thùy Dương', email: 'duong.tech@gmail.com', phone: '0933221100', gender: 'Nữ', dob: '2001-08-22', height: 164, weight: 53, exp_years: 0, exp_months: 9, self_rank: 'Lv4', official_rank: 'Lv4', event_category: 'doi_nam_nu', fee_amount: 200000, bill_image_url: billUrl, status: 'approved', created_at: '2026-10-01T14:30:00Z' },

            // VĐV mới nộp (Chờ duyệt mới) & Xin rút đơn để test nút thao tác
            { id: '15', full_name: 'Phan Văn Hậu', email: 'hau.tech@gmail.com', phone: '0987654321', gender: 'Nam', dob: '1998-05-15', height: 172, weight: 67, exp_years: 1, exp_months: 5, self_rank: 'Lv3', official_rank: null, event_category: 'doi_nam', fee_amount: 200000, bill_image_url: billUrl, status: 'pending_registration', created_at: '2026-10-02T09:00:00Z' },
            { id: '16', full_name: 'Hoàng Yến Nhi', email: 'nhi.tech@gmail.com', phone: '0976543210', gender: 'Nữ', dob: '2000-12-01', height: 158, weight: 48, exp_years: 1, exp_months: 0, self_rank: 'Lv3', official_rank: null, event_category: 'doi_nam_nu', fee_amount: 200000, bill_image_url: billUrl, status: 'pending_withdraw', created_at: '2026-10-02T10:30:00Z' }
        ];
    }
};

window.addEventListener('DOMContentLoaded', () => {
    Admin.init();
});

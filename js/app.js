/**
 * ========================================================
 * CLIENT-SIDE LOGIC CHO GIAO DIỆN VẬN ĐỘNG VIÊN (app.js)
 * Tối ưu hóa 100% Mobile-First
 * ========================================================
 */

const App = {
    selectedBillFile: null,
    athletesList: [],

    init: async function() {
        this.renderFormSelectors();
        this.bindFormEvents();
        this.bindSearchEvent();
        
        const user = await Auth.getUser();
        await this.handleAuthState(user);
        await this.loadAthletesList();
    },

    // 1. Render Form Selectors (Trình tự chấm & Nội dung)
    renderFormSelectors: function() {
        const rankSelector = document.getElementById('self-rank-selector');
        if (rankSelector) {
            rankSelector.innerHTML = CONFIG.TOURNAMENT.RANKS.map((r, idx) => `
                <label class="flex items-center p-2.5 bg-white border border-slate-200 rounded-xl cursor-pointer hover:border-slate-300 shadow-sm transition">
                    <input type="radio" name="self_rank" value="${r.id}" ${idx === 2 ? 'checked' : ''} class="mr-2 text-green-700">
                    <div>
                        <span class="font-bold text-slate-800 text-xs block">${r.id} - ${r.title}</span>
                        <span class="text-[10px] text-slate-500 leading-tight block">${r.desc}</span>
                    </div>
                </label>
            `).join('');
        }

        this.updateEventCategorySelector('Nam');
    },

    updateEventCategorySelector: function(gender) {
        const catSelector = document.getElementById('event-category-selector');
        if (!catSelector) return;

        const pricing = CONFIG.TOURNAMENT.PRICING;

        if (gender === 'Nữ') {
            catSelector.innerHTML = `
                <label class="flex items-center justify-between p-3 bg-white border border-slate-200 rounded-xl cursor-pointer shadow-sm">
                    <div class="flex items-center">
                        <input type="radio" name="event_category" value="doi_nam_nu" checked class="mr-2 text-green-700">
                        <div>
                            <span class="font-bold text-slate-800 text-xs block">Đôi Nam Nữ</span>
                            <span class="text-[10px] text-slate-500 block">VĐV Nữ thi đấu phối hợp</span>
                        </div>
                    </div>
                    <span class="font-bold text-green-700 text-xs font-mono">${pricing.SINGLE_EVENT_FEE.toLocaleString('vi-VN')} đ</span>
                </label>
            `;
        } else {
            catSelector.innerHTML = `
                <label class="flex items-center justify-between p-2.5 bg-white border border-slate-200 rounded-xl cursor-pointer shadow-sm">
                    <div class="flex items-center">
                        <input type="radio" name="event_category" value="doi_nam" checked class="mr-2 text-green-700">
                        <span class="font-bold text-slate-800 text-xs">Chỉ Đôi Nam</span>
                    </div>
                    <span class="font-bold text-green-700 text-xs font-mono">${pricing.SINGLE_EVENT_FEE.toLocaleString('vi-VN')} đ</span>
                </label>

                <label class="flex items-center justify-between p-2.5 bg-white border border-slate-200 rounded-xl cursor-pointer shadow-sm">
                    <div class="flex items-center">
                        <input type="radio" name="event_category" value="doi_nam_nu" class="mr-2 text-green-700">
                        <span class="font-bold text-slate-800 text-xs">Chỉ Đôi Nam Nữ</span>
                    </div>
                    <span class="font-bold text-green-700 text-xs font-mono">${pricing.SINGLE_EVENT_FEE.toLocaleString('vi-VN')} đ</span>
                </label>

                <label class="flex items-center justify-between p-2.5 bg-green-50/50 border border-green-200 rounded-xl cursor-pointer shadow-sm">
                    <div class="flex items-center">
                        <input type="radio" name="event_category" value="ca_hai" class="mr-2 text-green-700">
                        <div>
                            <span class="font-bold text-green-800 text-xs block">CẢ HAI NỘI DUNG</span>
                            <span class="text-[10px] text-green-600 block font-semibold">Ưu đãi giảm 50% nội dung thứ hai</span>
                        </div>
                    </div>
                    <span class="font-bold text-green-800 text-xs font-mono">${pricing.BOTH_EVENTS_FEE.toLocaleString('vi-VN')} đ</span>
                </label>
            `;
        }

        document.querySelectorAll('input[name="event_category"]').forEach(input => {
            input.addEventListener('change', () => this.updatePaymentBox());
        });

        this.updatePaymentBox();
    },

    // 2. Tính toán lệ phí & VietQR
    updatePaymentBox: function() {
        const paymentBox = document.getElementById('payment-box');
        if (!paymentBox) return;

        const selectedEvent = document.querySelector('input[name="event_category"]:checked')?.value || 'doi_nam';
        const pricing = CONFIG.TOURNAMENT.PRICING;
        const fee = selectedEvent === 'ca_hai' ? pricing.BOTH_EVENTS_FEE : pricing.SINGLE_EVENT_FEE;

        const fullName = (document.getElementById('reg-fullname')?.value.trim() || 'VDV').replace(/\s+/g, '');
        const phone = document.getElementById('reg-phone')?.value.trim() || '';
        const payConfig = CONFIG.TOURNAMENT.PAYMENT;

        const transferSyntax = `${payConfig.SYNTAX_PREFIX} ${fullName} ${phone}`.trim();
        const qrUrl = `https://img.vietqr.io/image/${payConfig.BANK_CODE}-${payConfig.ACCOUNT_NUMBER}-compact.png?amount=${fee}&addInfo=${encodeURIComponent(transferSyntax)}&accountName=${encodeURIComponent(payConfig.ACCOUNT_NAME)}`;

        paymentBox.innerHTML = `
            <div class="flex items-start space-x-3">
                <img src="${qrUrl}" alt="VietQR" onclick="App.openLightbox('${qrUrl}')" class="w-24 h-24 rounded-lg bg-white p-1 border border-slate-300 shadow-sm cursor-pointer flex-shrink-0" title="Bấm để phóng to mã QR">
                <div class="flex-1 text-[11px] space-y-1">
                    <div class="flex items-center justify-between pb-1 border-b border-slate-200">
                        <span class="text-slate-500 font-semibold">Lệ phí nộp:</span>
                        <strong class="text-sm font-bold text-green-700 font-mono">${fee.toLocaleString('vi-VN')} đ</strong>
                    </div>
                    <p><span class="text-slate-400">Ngân hàng:</span> <strong>${payConfig.BANK_NAME}</strong></p>
                    <p class="flex items-center space-x-1">
                        <span class="text-slate-400">STK:</span> 
                        <strong class="font-mono text-slate-800">${payConfig.ACCOUNT_NUMBER}</strong>
                        <button type="button" onclick="navigator.clipboard.writeText('${payConfig.ACCOUNT_NUMBER}'); alert('Đã sao chép số tài khoản!');" class="text-green-700 p-0.5" title="Sao chép STK">
                            <i class="fas fa-copy"></i>
                        </button>
                    </p>
                    <p><span class="text-slate-400">Chủ TK:</span> <strong>${payConfig.ACCOUNT_NAME}</strong></p>
                    <p><span class="text-slate-400">Nội dung CK:</span> <code class="bg-slate-200 px-1 py-0.5 rounded text-amber-900 font-mono font-bold text-[10px]">${transferSyntax}</code></p>
                </div>
            </div>
        `;
    },

    // 3. Sự kiện Form
    bindFormEvents: function() {
        document.querySelectorAll('input[name="gender"]').forEach(radio => {
            radio.addEventListener('change', (e) => {
                this.updateEventCategorySelector(e.target.value);
            });
        });

        const dobInput = document.getElementById('reg-dob');
        if (dobInput) {
            dobInput.addEventListener('change', (e) => {
                if (e.target.value) {
                    const birthYear = new Date(e.target.value).getFullYear();
                    const age = new Date().getFullYear() - birthYear;
                    document.getElementById('calculated-age').textContent = `(${age} tuổi)`;
                }
            });
        }

        const billInput = document.getElementById('reg-bill-file');
        if (billInput) {
            billInput.addEventListener('change', (e) => {
                const file = e.target.files[0];
                if (file) {
                    this.selectedBillFile = file;
                    const reader = new FileReader();
                    reader.onload = (re) => {
                        document.getElementById('upload-preview-img').src = re.target.result;
                        document.getElementById('upload-filename').textContent = file.name;
                        document.getElementById('upload-placeholder').classList.add('hidden');
                        document.getElementById('upload-preview-container').classList.remove('hidden');
                    };
                    reader.readAsDataURL(file);
                }
            });
        }

        const btnRemovePreview = document.getElementById('btn-remove-preview');
        if (btnRemovePreview) {
            btnRemovePreview.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.selectedBillFile = null;
                document.getElementById('reg-bill-file').value = '';
                document.getElementById('upload-placeholder').classList.remove('hidden');
                document.getElementById('upload-preview-container').classList.add('hidden');
            });
        }

        const form = document.getElementById('athlete-registration-form');
        if (form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                this.submitAthleteRegistration();
            });
        }
    },

    bindSearchEvent: function() {
        const searchInput = document.getElementById('table-search');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.filterAthletesList(e.target.value.toLowerCase().trim());
            });
        }
    },

    // 4. Quản lý trạng thái xác thực và Action Hub
    handleAuthState: async function(user) {
        const notLogged = document.getElementById('hub-not-logged');
        const formContainer = document.getElementById('hub-form-container');
        const recordContainer = document.getElementById('hub-record-container');
        const hubTitle = document.getElementById('hub-title');
        const hubDesc = document.getElementById('hub-desc');

        await Auth.updateAuthUI();

        if (!user) {
            notLogged.classList.remove('hidden');
            formContainer.classList.add('hidden');
            recordContainer.classList.add('hidden');
            hubTitle.innerHTML = '<i class="fas fa-file-pen text-green-700 mr-2"></i><span>Đăng Ký Tham Gia</span>';
            hubDesc.textContent = 'Đăng nhập Google để nộp đơn hoặc kiểm tra tình trạng vé thi đấu của bạn.';
            return;
        }

        // Đã đăng nhập: Kiểm tra xem user này đã nộp đơn đăng ký chưa
        const myRecord = await this.getMyRecord(user.email);

        if (myRecord) {
            // Đã nộp đơn -> Hiển thị Thẻ Vận Động Viên
            notLogged.classList.add('hidden');
            formContainer.classList.add('hidden');
            recordContainer.classList.remove('hidden');

            hubTitle.innerHTML = '<i class="fas fa-id-card text-green-700 mr-2"></i><span>Thẻ Vận Động Viên Của Bạn</span>';
            hubDesc.textContent = 'Theo dõi kết quả duyệt đơn, trình real và bạn đánh cặp từ Ban Tổ Chức.';

            this.renderMyRecord(myRecord);
        } else {
            // Chưa nộp đơn -> Hiển thị Form Đăng Ký
            notLogged.classList.add('hidden');
            formContainer.classList.remove('hidden');
            recordContainer.classList.add('hidden');

            hubTitle.innerHTML = '<i class="fas fa-file-pen text-green-700 mr-2"></i><span>Đăng Ký Tham Gia</span>';
            hubDesc.textContent = 'Điền thông tin và đính kèm ảnh bill chuyển khoản để hoàn tất.';

            document.getElementById('form-user-email').textContent = user.email;
            const nameInput = document.getElementById('reg-fullname');
            if (nameInput && !nameInput.value) {
                nameInput.value = user.user_metadata?.full_name || '';
            }
        }
    },

    getMyRecord: async function(email) {
        const client = Auth.getClient();
        try {
            if (client) {
                const { data } = await client.from('athletes').select('*').eq('email', email).maybeSingle();
                if (data) return data;
            }
            const local = JSON.parse(localStorage.getItem('tech_athletes_demo') || '[]');
            return local.find(a => a.email === email) || null;
        } catch (e) {
            return null;
        }
    },

    // 5. Nộp Đơn
    submitAthleteRegistration: async function() {
        const user = await Auth.getUser();
        if (!user) {
            alert("Vui lòng đăng nhập Google trước khi nộp đơn!");
            return;
        }

        if (!this.selectedBillFile) {
            alert("Vui lòng đính kèm ảnh bill chuyển khoản lệ phí!");
            return;
        }

        const submitBtn = document.getElementById('btn-submit-form');
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-1"></i> Đang gửi đơn...';

        try {
            const fullName = document.getElementById('reg-fullname').value.trim();
            const phone = document.getElementById('reg-phone').value.trim();
            const gender = document.querySelector('input[name="gender"]:checked').value;
            const dob = document.getElementById('reg-dob').value;
            const height = parseInt(document.getElementById('reg-height').value);
            const weight = parseInt(document.getElementById('reg-weight').value);
            const expYears = parseInt(document.getElementById('reg-exp-years').value) || 0;
            const expMonths = parseInt(document.getElementById('reg-exp-months').value) || 0;
            const selfRank = document.querySelector('input[name="self_rank"]:checked').value;
            const eventCategory = document.querySelector('input[name="event_category"]:checked').value;
            const notes = document.getElementById('reg-notes').value.trim();

            const pricing = CONFIG.TOURNAMENT.PRICING;
            const feeAmount = eventCategory === 'ca_hai' ? pricing.BOTH_EVENTS_FEE : pricing.SINGLE_EVENT_FEE;

            let billUrl = '';
            const client = Auth.getClient();

            if (client && !user.id.startsWith('demo-')) {
                const fileExt = this.selectedBillFile.name.split('.').pop();
                const fileName = `bill_${user.id}_${Date.now()}.${fileExt}`;
                const { data: uploadData, error: uploadErr } = await client.storage
                    .from('payment-bills')
                    .upload(fileName, this.selectedBillFile, { upsert: true });

                if (!uploadErr && uploadData) {
                    const { data: { publicUrl } } = client.storage.from('payment-bills').getPublicUrl(fileName);
                    billUrl = publicUrl;
                } else {
                    billUrl = await this.fileToDataUrl(this.selectedBillFile);
                }
            } else {
                billUrl = await this.fileToDataUrl(this.selectedBillFile);
            }

            const athleteRecord = {
                user_id: user.id.startsWith('demo-') ? null : user.id,
                email: user.email,
                full_name: fullName,
                phone: phone,
                gender: gender,
                dob: dob,
                height: height,
                weight: weight,
                exp_years: expYears,
                exp_months: expMonths,
                self_rank: selfRank,
                official_rank: null,
                event_category: eventCategory,
                fee_amount: feeAmount,
                bill_image_url: billUrl,
                status: 'pending_registration',
                notes: notes,
                created_at: new Date().toISOString()
            };

            if (client && !user.id.startsWith('demo-')) {
                const { error: insertErr } = await client.from('athletes').insert([athleteRecord]);
                if (insertErr) throw insertErr;
            } else {
                const local = JSON.parse(localStorage.getItem('tech_athletes_demo') || '[]');
                athleteRecord.id = 'demo-reg-' + Date.now();
                local.unshift(athleteRecord);
                localStorage.setItem('tech_athletes_demo', JSON.stringify(local));
            }

            alert("🎉 Nộp đơn đăng ký thành công! Đơn của bạn đã được chuyển đến Ban Tổ Chức để duyệt bill.");
            await this.handleAuthState(user);
            await this.loadAthletesList();
        } catch (err) {
            console.error("Lỗi nộp đơn:", err);
            alert("Lỗi khi nộp đơn: " + (err.message || err));
        } finally {
            submitBtn.disabled = false;
            submitBtn.innerHTML = '<i class="fas fa-paper-plane text-xs"></i><span>Nộp Đơn Đăng Ký</span>';
        }
    },

    fileToDataUrl: function(file) {
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = (e) => resolve(e.target.result);
            reader.readAsDataURL(file);
        });
    },

    // 6. Hiển thị Thẻ Vận Động Viên (My Ticket)
    renderMyRecord: function(record) {
        const container = document.getElementById('hub-record-container');
        if (!container) return;

        let statusBadge = '';
        let statusNotice = '';

        if (record.status === 'pending_registration') {
            statusBadge = '<span class="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800">Chờ duyệt bill</span>';
            statusNotice = '<div class="p-3 bg-amber-50/80 rounded-xl text-xs text-amber-900 border border-amber-200">BTC đang kiểm tra ảnh bill chuyển khoản của bạn. Sau khi duyệt, bạn sẽ được xếp lịch test trình ngoài sân.</div>';
        } else if (record.status === 'approved') {
            statusBadge = '<span class="px-2.5 py-0.5 rounded-full text-xs font-bold bg-green-100 text-green-800">Đã phê duyệt</span>';
            statusNotice = '<div class="p-3 bg-green-50/80 rounded-xl text-xs text-green-900 border border-green-200">Đơn đã được duyệt thành công! Bạn hãy đến sân vào ngày thi đấu đúng giờ nhé.</div>';
        } else if (record.status === 'pending_withdraw') {
            statusBadge = '<span class="px-2.5 py-0.5 rounded-full text-xs font-bold bg-orange-100 text-orange-800">Đang xin rút đơn</span>';
            statusNotice = '<div class="p-3 bg-orange-50/80 rounded-xl text-xs text-orange-900 border border-orange-200">Yêu cầu xin rút khỏi giải của bạn đang chờ Ban Tổ Chức phê duyệt.</div>';
        } else if (record.status === 'rejected') {
            statusBadge = '<span class="px-2.5 py-0.5 rounded-full text-xs font-bold bg-red-100 text-red-700">Đã từ chối</span>';
            statusNotice = `<div class="p-3 bg-red-50 rounded-xl text-xs text-red-800 border border-red-200">Lý do từ chối: ${record.reject_reason || 'Ảnh bill không rõ'}. Vui lòng liên hệ BTC.</div>`;
        } else if (record.status === 'withdrawn') {
            statusBadge = '<span class="px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-200 text-slate-700">Đã rút đơn</span>';
            statusNotice = '<div class="p-3 bg-slate-100 rounded-xl text-xs text-slate-800 font-bold border border-slate-300">Đã rút đơn thành công. Vui lòng liên hệ Ban Tổ Chức để nhận lại phí đăng ký!</div>';
        }

        const eventNames = {
            'doi_nam': 'Đôi Nam',
            'doi_nam_nu': 'Đôi Nam Nữ',
            'ca_hai': 'Cả 2 nội dung'
        };

        container.innerHTML = `
            <div class="border border-slate-200 rounded-2xl p-4 sm:p-5 space-y-4 bg-white shadow-sm">
                <!-- Header -->
                <div class="flex items-center justify-between pb-3 border-b border-slate-200">
                    <div>
                        <div class="flex items-center space-x-1.5">
                            <h3 class="font-extrabold text-slate-900 text-base">${record.full_name}</h3>
                            <span class="text-xs font-bold ${record.gender === 'Nữ' ? 'text-pink-600' : 'text-blue-600'}">(${record.gender})</span>
                        </div>
                        <p class="text-[11px] text-slate-500 font-mono">${record.phone}</p>
                    </div>
                    <div>${statusBadge}</div>
                </div>

                ${statusNotice}

                <!-- Body Info -->
                <div class="grid grid-cols-2 gap-2 text-xs">
                    <div class="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                        <span class="text-slate-400 text-[10px] block font-semibold">Trình tự chấm:</span>
                        <strong class="text-slate-800 font-bold">${record.self_rank}</strong>
                    </div>

                    <div class="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                        <span class="text-slate-400 text-[10px] block font-semibold">Trình real (BTC):</span>
                        <strong class="${record.official_rank ? 'text-green-700 font-bold' : 'text-slate-400 italic'}">${record.official_rank || 'Chờ test ngoài sân'}</strong>
                    </div>

                    <div class="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                        <span class="text-slate-400 text-[10px] block font-semibold">Nội dung:</span>
                        <strong class="text-slate-800 font-semibold">${eventNames[record.event_category] || record.event_category}</strong>
                    </div>

                    <div class="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                        <span class="text-slate-400 text-[10px] block font-semibold">Bạn đánh cặp:</span>
                        <strong class="${record.partner_name ? 'text-green-700 font-bold' : 'text-slate-400 italic'}">${record.partner_name || 'Đang chờ ghép'}</strong>
                    </div>
                </div>

                <!-- Footer Actions -->
                <div class="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                    <button type="button" onclick="App.openLightbox('${record.bill_image_url}')" class="text-green-700 hover:text-green-800 font-semibold flex items-center space-x-1">
                        <i class="fas fa-image"></i>
                        <span>Xem lại ảnh bill</span>
                    </button>

                    ${record.status !== 'withdrawn' ? `
                        <button type="button" onclick="App.requestWithdraw('${record.id}')" class="text-slate-400 hover:text-red-600 text-[11px]">
                            Xin rút khỏi giải
                        </button>
                    ` : ''}
                </div>
            </div>
        `;
    },

    // 7. Tải Danh Sách VĐV dạng Card List thân thiện Mobile
    loadAthletesList: async function() {
        const container = document.getElementById('athletes-mobile-list');
        const countEl = document.getElementById('athletes-count');
        if (!container) return;

        let list = [];
        const client = Auth.getClient();

        try {
            if (client) {
                const { data } = await client.from('athletes').select('*').order('created_at', { ascending: true });
                if (data && data.length > 0) list = data;
            }
            if (list.length === 0) {
                const local = JSON.parse(localStorage.getItem('tech_athletes_demo') || '[]');
                list = local.length > 0 ? local : this.getMockData();
                localStorage.setItem('tech_athletes_demo', JSON.stringify(list));
            }
        } catch (e) {
            list = this.getMockData();
        }

        this.athletesList = list;
        if (countEl) countEl.textContent = list.length;
        this.renderAthletesList(list);
    },

    renderAthletesList: function(list) {
        const container = document.getElementById('athletes-mobile-list');
        const emptyState = document.getElementById('athletes-empty-state');
        if (!container) return;

        if (list.length === 0) {
            container.innerHTML = '';
            if (emptyState) emptyState.classList.remove('hidden');
            return;
        }

        if (emptyState) emptyState.classList.add('hidden');

        const currentYear = new Date().getFullYear();
        const eventNames = {
            'doi_nam': 'Đôi Nam',
            'doi_nam_nu': 'Đôi Nam Nữ',
            'ca_hai': 'Cả 2 nội dung'
        };

        container.innerHTML = list.map((a, idx) => {
            const age = a.dob ? (currentYear - new Date(a.dob).getFullYear()) : '--';
            const exp = `${a.exp_years || 0}n ${a.exp_months || 0}th`;

            return `
                <div class="p-3 bg-white rounded-xl border border-slate-200 flex items-center justify-between shadow-xs hover:border-slate-300 transition">
                    <!-- Left: STT + Info -->
                    <div class="flex items-start space-x-2.5 min-w-0">
                        <span class="w-6 h-6 rounded-md bg-slate-100 text-slate-500 font-mono text-[11px] font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                            #${idx + 1}
                        </span>
                        <div class="min-w-0">
                            <div class="flex items-center space-x-1.5">
                                <span class="font-bold text-slate-900 text-xs truncate">${a.full_name}</span>
                                <span class="text-[10px] font-bold ${a.gender === 'Nữ' ? 'text-pink-600' : 'text-blue-600'}">${a.gender === 'Nữ' ? '♀' : '♂'}</span>
                            </div>
                            
                            <p class="text-[11px] text-slate-500 mt-0.5">
                                ${age} tuổi • ${a.height || '--'}cm • chơi ${exp}
                            </p>

                            <div class="flex flex-wrap items-center gap-1.5 mt-1 text-[10px]">
                                <span class="px-1.5 py-0.2 bg-slate-100 text-slate-600 rounded font-semibold">${eventNames[a.event_category] || a.event_category}</span>
                                ${a.partner_name ? `<span class="text-green-700 font-bold truncate">🤝 Cặp: ${a.partner_name}</span>` : ''}
                            </div>
                        </div>
                    </div>

                    <!-- Right: Rank Badges -->
                    <div class="text-right flex-shrink-0 ml-2">
                        <div>
                            ${a.official_rank 
                                ? `<span class="rank-pill rank-pill-${a.official_rank.toLowerCase()} font-bold">${a.official_rank}</span>`
                                : `<span class="text-[10px] text-slate-400 italic">Chờ test</span>`
                            }
                        </div>
                        <span class="text-[9px] text-slate-400 block mt-0.5">Tự chấm: ${a.self_rank || 'Lv3'}</span>
                    </div>
                </div>
            `;
        }).join('');
    },

    filterAthletesList: function(query) {
        if (!query) {
            this.renderAthletesList(this.athletesList);
            return;
        }
        const filtered = this.athletesList.filter(a => 
            a.full_name?.toLowerCase().includes(query) ||
            a.self_rank?.toLowerCase().includes(query) ||
            a.official_rank?.toLowerCase().includes(query) ||
            a.partner_name?.toLowerCase().includes(query)
        );
        this.renderAthletesList(filtered);
    },

    requestWithdraw: async function(athleteId) {
        const reason = prompt("Nhập lý do xin rút khỏi giải đấu:");
        if (!reason) return;

        const client = Auth.getClient();
        try {
            if (client) {
                await client.from('athletes').update({ status: 'pending_withdraw', withdraw_reason: reason }).eq('id', athleteId);
            }

            const local = JSON.parse(localStorage.getItem('tech_athletes_demo') || '[]');
            const item = local.find(a => a.id === athleteId);
            if (item) {
                item.status = 'pending_withdraw';
                item.withdraw_reason = reason;
                localStorage.setItem('tech_athletes_demo', JSON.stringify(local));
            }

            alert("Đã gửi yêu cầu xin rút đến Ban Tổ Chức.");
            const user = await Auth.getUser();
            if (user) await this.handleAuthState(user);
            await this.loadAthletesList();
        } catch (e) {
            console.error("Lỗi:", e);
        }
    },

    openLightbox: function(url) {
        const modal = document.getElementById('lightbox-modal');
        const img = document.getElementById('lightbox-img');
        if (modal && img && url) {
            img.src = url;
            modal.classList.remove('hidden');
        }
    },

    // 16 VĐV mẫu chân thực đồng bộ với Admin
    getMockData: function() {
        const billUrl = 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&w=400&q=80';
        return [
            { id: '1', full_name: 'Nguyễn Thành Nam', email: 'nam.tech@gmail.com', phone: '0901234567', gender: 'Nam', dob: '1995-04-12', height: 175, weight: 70, exp_years: 4, exp_months: 6, self_rank: 'Lv1', official_rank: 'Lv1', event_category: 'doi_nam', partner_name: 'Vũ Đức Minh (Lv4)', status: 'approved', created_at: '2026-10-01T08:00:00Z', bill_image_url: billUrl },
            { id: '2', full_name: 'Lê Hoàng Long', email: 'long.tech@gmail.com', phone: '0922334455', gender: 'Nam', dob: '1997-01-15', height: 170, weight: 65, exp_years: 2, exp_months: 6, self_rank: 'Lv2', official_rank: 'Lv2', event_category: 'doi_nam', partner_name: 'Phạm Quốc Bảo (Lv3)', status: 'approved', created_at: '2026-10-01T08:30:00Z', bill_image_url: billUrl },
            { id: '3', full_name: 'Phạm Quốc Bảo', email: 'bao.tech@gmail.com', phone: '0933441122', gender: 'Nam', dob: '1996-05-20', height: 173, weight: 68, exp_years: 1, exp_months: 8, self_rank: 'Lv3', official_rank: 'Lv3', event_category: 'doi_nam', partner_name: 'Lê Hoàng Long (Lv2)', status: 'approved', created_at: '2026-10-01T09:00:00Z', bill_image_url: billUrl },
            { id: '4', full_name: 'Vũ Đức Minh', email: 'minh.tech@gmail.com', phone: '0933445566', gender: 'Nam', dob: '2000-07-08', height: 178, weight: 75, exp_years: 0, exp_months: 8, self_rank: 'Lv4', official_rank: 'Lv4', event_category: 'doi_nam', partner_name: 'Nguyễn Thành Nam (Lv1)', status: 'approved', created_at: '2026-10-01T09:15:00Z', bill_image_url: billUrl },
            { id: '5', full_name: 'Đỗ Tuấn Anh', email: 'anh.tech@gmail.com', phone: '0966778899', gender: 'Nam', dob: '1994-03-25', height: 176, weight: 72, exp_years: 3, exp_months: 2, self_rank: 'Lv2', official_rank: 'Lv2', event_category: 'doi_nam', partner_name: 'Hoàng Văn Thái (Lv3)', status: 'approved', created_at: '2026-10-01T10:00:00Z', bill_image_url: billUrl },
            { id: '6', full_name: 'Hoàng Văn Thái', email: 'thai.tech@gmail.com', phone: '0977889900', gender: 'Nam', dob: '1998-12-10', height: 169, weight: 63, exp_years: 1, exp_months: 2, self_rank: 'Lv3', official_rank: 'Lv3', event_category: 'doi_nam', partner_name: 'Đỗ Tuấn Anh (Lv2)', status: 'approved', created_at: '2026-10-01T10:30:00Z', bill_image_url: billUrl },
            { id: '7', full_name: 'Ngô Quang Huy', email: 'huy.tech@gmail.com', phone: '0988990011', gender: 'Nam', dob: '1993-08-14', height: 177, weight: 74, exp_years: 5, exp_months: 0, self_rank: 'Lv1', official_rank: 'Lv1', event_category: 'ca_hai', partner_name: 'Lê Thùy Dương (Lv4)', status: 'approved', created_at: '2026-10-01T11:00:00Z', bill_image_url: billUrl },
            { id: '8', full_name: 'Bùi Đình Trọng', email: 'trong.tech@gmail.com', phone: '0911223344', gender: 'Nam', dob: '1997-10-05', height: 172, weight: 66, exp_years: 2, exp_months: 0, self_rank: 'Lv2', official_rank: 'Lv2', event_category: 'doi_nam_nu', partner_name: 'Đặng Mai Phương (Lv3)', status: 'approved', created_at: '2026-10-01T11:30:00Z', bill_image_url: billUrl },
            { id: '9', full_name: 'Trần Văn Kiên', email: 'kien.tech@gmail.com', phone: '0955667788', gender: 'Nam', dob: '1999-04-18', height: 168, weight: 62, exp_years: 1, exp_months: 6, self_rank: 'Lv3', official_rank: 'Lv3', event_category: 'doi_nam_nu', partner_name: 'Trần Thị Thu Hà (Lv2)', status: 'approved', created_at: '2026-10-01T12:00:00Z', bill_image_url: billUrl },
            { id: '10', full_name: 'Dương Thành Đạt', email: 'dat.tech@gmail.com', phone: '0944332211', gender: 'Nam', dob: '2001-02-28', height: 174, weight: 69, exp_years: 0, exp_months: 6, self_rank: 'Lv4', official_rank: 'Lv4', event_category: 'doi_nam_nu', partner_name: 'Nguyễn Bích Ngọc (Lv2)', status: 'approved', created_at: '2026-10-01T12:30:00Z', bill_image_url: billUrl },
            { id: '11', full_name: 'Trần Thị Thu Hà', email: 'ha.tech@gmail.com', phone: '0912345678', gender: 'Nữ', dob: '1998-09-20', height: 162, weight: 52, exp_years: 2, exp_months: 4, self_rank: 'Lv2', official_rank: 'Lv2', event_category: 'doi_nam_nu', partner_name: 'Trần Văn Kiên (Lv3)', status: 'approved', created_at: '2026-10-01T13:00:00Z', bill_image_url: billUrl },
            { id: '12', full_name: 'Đặng Mai Phương', email: 'phuong.tech@gmail.com', phone: '0944556677', gender: 'Nữ', dob: '1999-11-05', height: 165, weight: 55, exp_years: 1, exp_months: 8, self_rank: 'Lv3', official_rank: 'Lv3', event_category: 'doi_nam_nu', partner_name: 'Bùi Đình Trọng (Lv2)', status: 'approved', created_at: '2026-10-01T13:30:00Z', bill_image_url: billUrl },
            { id: '13', full_name: 'Nguyễn Bích Ngọc', email: 'ngoc.tech@gmail.com', phone: '0922114433', gender: 'Nữ', dob: '1996-06-12', height: 160, weight: 50, exp_years: 3, exp_months: 0, self_rank: 'Lv2', official_rank: 'Lv2', event_category: 'doi_nam_nu', partner_name: 'Dương Thành Đạt (Lv4)', status: 'approved', created_at: '2026-10-01T14:00:00Z', bill_image_url: billUrl },
            { id: '14', full_name: 'Lê Thùy Dương', email: 'duong.tech@gmail.com', phone: '0933221100', gender: 'Nữ', dob: '2001-08-22', height: 164, weight: 53, exp_years: 0, exp_months: 9, self_rank: 'Lv4', official_rank: 'Lv4', event_category: 'doi_nam_nu', partner_name: 'Ngô Quang Huy (Lv1)', status: 'approved', created_at: '2026-10-01T14:30:00Z', bill_image_url: billUrl },
            { id: '15', full_name: 'Phan Văn Hậu', email: 'hau.tech@gmail.com', phone: '0987654321', gender: 'Nam', dob: '1998-05-15', height: 172, weight: 67, exp_years: 1, exp_months: 5, self_rank: 'Lv3', official_rank: null, event_category: 'doi_nam', partner_name: null, status: 'pending_registration', created_at: '2026-10-02T09:00:00Z', bill_image_url: billUrl },
            { id: '16', full_name: 'Hoàng Yến Nhi', email: 'nhi.tech@gmail.com', phone: '0976543210', gender: 'Nữ', dob: '2000-12-01', height: 158, weight: 48, exp_years: 1, exp_months: 0, self_rank: 'Lv3', official_rank: null, event_category: 'doi_nam_nu', partner_name: null, status: 'pending_withdraw', created_at: '2026-10-02T10:30:00Z', bill_image_url: billUrl }
        ];
    }
};

window.addEventListener('DOMContentLoaded', () => {
    App.init();
});

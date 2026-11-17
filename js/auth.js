/**
 * ========================================================
 * MODULE QUẢN LÝ XÁC THỰC GOOGLE VỚI SUPABASE AUTH
 * ========================================================
 */

const Auth = {
    isConfigured: function() {
        return CONFIG.SUPABASE_URL && 
               CONFIG.SUPABASE_URL !== "https://YOUR_PROJECT_ID.supabase.co" && 
               typeof supabase !== 'undefined';
    },

    getClient: function() {
        if (!supabaseClient && this.isConfigured()) {
            supabaseClient = supabase.createClient(CONFIG.SUPABASE_URL, CONFIG.SUPABASE_ANON_KEY);
        }
        return supabaseClient;
    },

    // Lấy User hiện tại (Ưu tiên demo_user nếu người dùng đang ở chế độ xem thử)
    getUser: async function() {
        // 1. Kiểm tra demo session trong localStorage trước để luôn mở được demo
        const demoUser = localStorage.getItem('demo_user');
        if (demoUser) {
            try {
                return JSON.parse(demoUser);
            } catch (e) {}
        }

        // 2. Nếu không có demo, kiểm tra Supabase Auth thật
        const client = this.getClient();
        if (!client) return null;

        try {
            const { data: { session }, error } = await client.auth.getSession();
            if (error || !session) return null;
            return session.user;
        } catch (err) {
            return null;
        }
    },

    // Đăng nhập bằng Google OAuth
    signInWithGoogle: async function() {
        const client = this.getClient();
        if (!client) {
            this.signInAsDemoUser();
            return;
        }

        try {
            const redirectTo = window.location.origin + window.location.pathname;
            const { data, error } = await client.auth.signInWithOAuth({
                provider: 'google',
                options: {
                    redirectTo: redirectTo,
                    queryParams: {
                        access_type: 'offline',
                        prompt: 'consent',
                    }
                }
            });

            if (error) throw error;
        } catch (err) {
            console.warn("Chưa cấu hình Google OAuth đầy đủ trên Supabase, chuyển sang chế độ Demo:", err);
            this.signInAsDemoUser();
        }
    },

    // Đăng nhập tài khoản VĐV Demo (Xem thử trang VĐV)
    signInAsDemoUser: function() {
        const demoUser = {
            id: 'demo-user-1',
            email: 'nam.tech@gmail.com',
            user_metadata: {
                full_name: 'Nguyễn Thành Nam',
                avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'
            }
        };
        localStorage.setItem('demo_user', JSON.stringify(demoUser));
        window.location.reload();
    },

    // Đăng nhập tài khoản Admin Demo (Vào thẳng trang Admin)
    signInAsDemoAdmin: function() {
        const demoAdmin = {
            id: 'demo-admin-id',
            email: CONFIG.ADMIN_EMAILS[0] || 'admin@gmail.com',
            user_metadata: {
                full_name: 'Trưởng Ban Tổ Chức (Demo Admin)',
                avatar_url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=150&q=80'
            }
        };
        localStorage.setItem('demo_user', JSON.stringify(demoAdmin));
        window.location.reload();
    },

    // Đăng xuất
    signOut: async function() {
        const client = this.getClient();
        if (client) {
            try { await client.auth.signOut(); } catch (e) {}
        }
        localStorage.removeItem('demo_user');
        window.location.reload();
    },

    // Kiểm tra quyền Admin
    isAdmin: async function(user) {
        if (!user || !user.email) return false;
        
        const emailLower = user.email.toLowerCase();
        // Kiểm tra trong file config
        const isInConfig = CONFIG.ADMIN_EMAILS.some(e => e.toLowerCase() === emailLower);
        if (isInConfig) return true;

        // Kiểm tra trong database Supabase
        const client = this.getClient();
        if (client) {
            try {
                const { data, error } = await client
                    .from('admin_users')
                    .select('email')
                    .eq('email', emailLower)
                    .maybeSingle();
                
                if (data && !error) return true;
            } catch (err) {}
        }

        return false;
    },

    updateAuthUI: async function() {
        const user = await this.getUser();
        const authContainer = document.getElementById('auth-section');
        if (!authContainer) return;

        if (user) {
            const isAdminUser = await this.isAdmin(user);
            const avatar = user.user_metadata?.avatar_url || 
                `https://ui-avatars.com/api/?name=${encodeURIComponent(user.user_metadata?.full_name || user.email)}&background=15803d&color=fff`;
            const name = user.user_metadata?.full_name || user.email.split('@')[0];

            authContainer.innerHTML = `
                <div class="flex items-center space-x-2">
                    ${isAdminUser ? `
                        <a href="admin.html" class="inline-flex items-center text-[11px] font-bold px-2.5 py-1 bg-amber-100 text-amber-900 border border-amber-300 rounded-lg hover:bg-amber-200 transition">
                            <i class="fas fa-shield-halved mr-1 text-amber-700"></i> Admin
                        </a>
                    ` : ''}
                    <div class="flex items-center space-x-1.5 bg-slate-100 px-2 py-1 rounded-lg border border-slate-200">
                        <img src="${avatar}" alt="${name}" class="w-6 h-6 rounded-full object-cover">
                        <span class="text-xs font-bold text-slate-800 max-w-[100px] truncate hidden sm:inline">${name}</span>
                    </div>
                    <button onclick="Auth.signOut()" title="Đăng xuất" class="p-1.5 text-slate-400 hover:text-red-600 transition text-xs">
                        <i class="fas fa-sign-out-alt"></i>
                    </button>
                </div>
            `;
        } else {
            authContainer.innerHTML = `
                <button onclick="Auth.signInWithGoogle()" class="inline-flex items-center space-x-1.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 font-semibold px-3 py-1.5 rounded-lg text-xs shadow-sm transition active:scale-95">
                    <i class="fab fa-google text-red-500"></i>
                    <span>Đăng nhập</span>
                </button>
            `;
        }
    }
};

window.addEventListener('DOMContentLoaded', () => {
    Auth.updateAuthUI();

    const client = Auth.getClient();
    if (client) {
        client.auth.onAuthStateChange((event, session) => {
            Auth.updateAuthUI();
        });
    }
});

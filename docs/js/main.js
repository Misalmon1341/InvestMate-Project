/**
 * INVESMATE - Aplicación de Simulación de Inversiones
 * Lógica principal de la aplicación
 */

import { authService } from './auth-service.js';
import { portfolioService } from './portfolio-service.js';
import { missionsService } from './missions-service.js';

const app = {
    // ========================================
    // ESTADO DE LA APLICACIÓN
    // ========================================
    state: {
        currentUser: null,
        currentUserId: null,
        balance: 10000,
        portfolio: [],
        missions: [],
        achievements: [],
        currentProduct: null,
        currentMission: null,
        articlesRead: 0
    },

    // ========================================
    // DATOS SIMULADOS - PRODUCTOS FINANCIEROS
    // ========================================
    products: [
        // ACCIONES
        { id: 'aapl', name: 'Apple Inc.', symbol: 'AAPL', category: 'stocks', price: 178.72, change: 1.24 },
        { id: 'tsla', name: 'Tesla Inc.', symbol: 'TSLA', category: 'stocks', price: 248.50, change: -2.15 },
        { id: 'msft', name: 'Microsoft Corp.', symbol: 'MSFT', category: 'stocks', price: 428.90, change: 0.87 },
        { id: 'googl', name: 'Alphabet Inc.', symbol: 'GOOGL', category: 'stocks', price: 171.63, change: 1.56 },
        { id: 'amzn', name: 'Amazon.com Inc.', symbol: 'AMZN', category: 'stocks', price: 178.25, change: -0.43 },
        { id: 'nvda', name: 'NVIDIA Corp.', symbol: 'NVDA', category: 'stocks', price: 875.28, change: 3.21 },
        { id: 'meta', name: 'Meta Platforms', symbol: 'META', category: 'stocks', price: 505.95, change: 2.14 },
        { id: 'nflx', name: 'Netflix Inc.', symbol: 'NFLX', category: 'stocks', price: 628.45, change: -1.08 },

        // ETFs
        { id: 'spy', name: 'SPDR S&P 500 ETF', symbol: 'SPY', category: 'etfs', price: 518.32, change: 0.65 },
        { id: 'qqq', name: 'Invesco QQQ Trust', symbol: 'QQQ', category: 'etfs', price: 445.67, change: 1.12 },
        { id: 'vti', name: 'Vanguard Total Stock', symbol: 'VTI', category: 'etfs', price: 267.89, change: 0.54 },
        { id: 'arkk', name: 'ARK Innovation ETF', symbol: 'ARKK', category: 'etfs', price: 48.25, change: -3.45 },

        // CRIPTOMONEDAS
        { id: 'btc', name: 'Bitcoin', symbol: 'BTC', category: 'crypto', price: 67842.50, change: 2.87 },
        { id: 'eth', name: 'Ethereum', symbol: 'ETH', category: 'crypto', price: 3458.90, change: 1.95 },
        { id: 'sol', name: 'Solana', symbol: 'SOL', category: 'crypto', price: 172.45, change: 5.32 },
        { id: 'bnb', name: 'Binance Coin', symbol: 'BNB', category: 'crypto', price: 598.72, change: -0.78 }
    ],

    // ========================================
    // MISIONES DISPONIBLES
    // ========================================
    missionsData: [
        { id: 1, title: 'Primera Inversión', description: 'Realiza tu primera compra de acciones', reward: 500, icon: './img/boxicons-SVG2/svgs/basic/regular/400/bx-star.svg', completed: false, type: 'first_purchase' },
        { id: 2, title: 'Diversificador', description: 'Compra 3 activos diferentes', reward: 1000, icon: './img/boxicons-SVG2/svgs/basic/regular/400/bx-share.svg', completed: false, type: 'diversify' },
        { id: 3, title: 'Inversor ETF', description: 'Compra tu primer ETF', reward: 750, icon: './img/boxicons-SVG1/svgs/basic/regular/400/bx-barcode.svg', completed: false, type: 'first_etf' },
        { id: 4, title: 'Cripto Entusiasta', description: 'Invierte en criptomonedas', reward: 1000, icon: './img/boxicons-SVG2/svgs/basic/regular/400/bx-bitcoin.svg', completed: false, type: 'first_crypto' },
        { id: 5, title: 'Portafolio de $1K', description: 'Ten $1,000 en tu portafolio', reward: 1500, icon: './img/boxicons-SVG2/svgs/basic/regular/400/bx-dollar-circle.svg', completed: false, type: 'portfolio_1k' },
        { id: 6, title: 'Estudiante Dedicado', description: 'Lee 3 artículos de aprendizaje', reward: 500, icon: './img/boxicons-SVG2/svgs/basic/regular/400/bx-address-book.svg', completed: false, type: 'read_articles' },
        { id: 7, title: 'Inversor Activo', description: 'Realiza 5 compras diferentes', reward: 2000, icon: './img/boxicons-SVG1/svgs/basic/regular/400/bx-cart-check.svg', completed: false, type: 'active_trader' },
        { id: 8, title: 'Maestro de Invesmate', description: 'Completa todas las misiones', reward: 5000, icon: './img/boxicons-SVG1/svgs/basic/regular/400/bx-treasure-chest.svg', completed: false, type: 'all_missions' }
    ],

    // ========================================
    // LOGROS / INSIGNIAS
    // ========================================
    achievementsData: [
        { id: 1, name: 'Primeros Pasos', description: 'Completa tu registro', icon: './img/boxicons-SVG2/svgs/basic/regular/400/bx-star.svg', unlocked: false },
        { id: 2, name: 'Inversor Novato', description: 'Primera compra realizada', icon: './img/boxicons-SVG2/svgs/basic/regular/400/bx-dollar-circle.svg', unlocked: false },
        { id: 3, name: 'Diversificador', description: '5 activos diferentes', icon: './img/boxicons-SVG2/svgs/basic/regular/400/bx-share.svg', unlocked: false },
        { id: 4, name: 'Hodler', description: 'Mantén inversiones por 7 días', icon: './img/boxicons-SVG1/svgs/basic/regular/400/bx-hourglass.svg', unlocked: false },
        { id: 5, name: 'Trader Activo', description: '20 operaciones realizadas', icon: './img/boxicons-SVG1/svgs/basic/regular/400/bx-cart-check.svg', unlocked: false },
        { id: 6, name: 'Estudiante', description: 'Completa el aprendizaje', icon: './img/boxicons-SVG2/svgs/basic/regular/400/bx-intellect.svg', unlocked: false },
        { id: 7, name: 'Millonario Virtual', description: 'Portafolio de $100K', icon: './img/boxicons-SVG2/svgs/basic/regular/400/bx-dollar-circle-stars.svg', unlocked: false },
        { id: 8, name: 'Maestro', description: 'Todas las misiones completadas', icon: './img/boxicons-SVG1/svgs/basic/regular/400/bx-gem-alt.svg', unlocked: false }
    ],

// ========================================
    // CONTENIDO DE APRENDIZAJE
    // ========================================
    learningContent: {
        concepts: [
            { title: '¿Qué es una Acción?', content: 'Una acción representa una parte del capital de una empresa. Al comprar acciones, te conviertes en accionista y tienes derecho a participar en las ganancias de la compañía.', icon: './img/boxicons-SVG2/svgs/basic/regular/400/bx-analyze.svg' },
            { title: '¿Qué es un ETF?', content: 'Un ETF (Exchange Traded Fund) es un fondo de inversión que cotiza en bolsa. Permite diversificar invirtiendo en múltiples activos simultáneamente.', icon: './img/boxicons-SVG2/svgs/basic/regular/400/bx-briefcase-alt.svg' },
            { title: 'Diversificación', content: 'Estrategia que consiste en distribuir las inversiones entre diferentes activos para reducir el riesgo. "No pongas todos los huevos en la misma canasta".', icon: './img/boxicons-SVG2/svgs/basic/regular/400/bx-share.svg' },
            { title: 'Riesgo y Rendimiento', content: 'Generalmente, a mayor potencial de rendimiento, mayor es el riesgo. Las inversiones seguras suelen ofrecer menores retornos.', icon: './img/boxicons-SVG2/svgs/basic/regular/400/bx-psychology.svg' },
            { title: 'Interés Compuesto', content: 'El interés compuesto es cuando las ganancias generadas por una inversión se reinvierten y generan más ganancias. Es la fuerza más poderosa en las finanzas.', icon: './img/boxicons-SVG2/svgs/basic/regular/400/bx-dollar-circle.svg' },
            { title: 'Inflación', content: 'La inflación es el aumento generalizado de precios. Tu dinero pierde valor con el tiempo, por eso es importante invertir para superar la inflación.', icon: './img/boxicons-SVG2/svgs/basic/regular/400/bx-steps-down.svg' }
        ],
        tips: [
            { title: 'Empieza con poco', content: 'No necesitas grandes cantidades para comenzar. La clave es la constancia y el aprendizaje continuo.', icon: './img/boxicons-SVG2/svgs/basic/regular/400/bx-home-alt.svg' },
            { title: 'Investiga antes de invertir', content: 'Nunca inviertas en algo que no entiendes. Estudia la empresa, el sector y las tendencias del mercado.', icon: './img/boxicons-SVG2/svgs/basic/regular/400/bx-search-alt.svg' },
            { title: 'Define tu estrategia', content: 'Decide si eres inversor a largo plazo o trader de corto plazo. Cada estrategia requiere diferentes habilidades y tiempo.', icon: './img/boxicons-SVG2/svgs/basic/regular/400/bx-cog.svg' },
            { title: 'Mantén la calma', content: 'Los mercados fluctúan. No tomes decisiones impulsivas basadas en el miedo o la codicia.', icon: './img/boxicons-SVG1/svgs/basic/regular/400/bx-hourglass.svg' },
            { title: 'Rebalancea tu portafolio', content: 'Periódicamente ajusta tu portafolio para mantener la distribución de activos que deseas.', icon: './img/boxicons-SVG2/svgs/basic/regular/400/bx-archive-arrow-up.svg' }
        ],
        mistakes: [
            { title: 'Invertir sin conocimiento', content: 'El error más común es invertir sin entender el activo. Siempre educa antes de invertir.', icon: './img/boxicons-SVG2/svgs/basic/regular/400/bx-light-bulb-alt.svg' },
            { title: 'No diversificar', content: 'Concentrar todo en una sola inversión es muy arriesgado. Diversifica para proteger tu capital.', icon: './img/boxicons-SVG2/svgs/basic/regular/400/bx-archive.svg' },
            { title: 'Seguir a la multitud', content: 'Comprar cuando todos compran y vender cuando todos venden suele ser una mala estrategia.', icon: './img/boxicons-SVG2/svgs/basic/regular/400/bx-message-circle.svg' },
            { title: 'No tener paciencia', content: 'Las mejores inversiones requieren tiempo. El trading excesivo genera costos y errores.', icon: './img/boxicons-SVG1/svgs/basic/regular/400/bx-hourglass.svg' },
            { title: 'Ignorar las comisiones', content: 'Las comisiones pueden comer tus ganancias. Compara plataformas y elige la que mejor se adapte.', icon: './img/boxicons-SVG2/svgs/basic/regular/400/bx-file-detail.svg' }
        ]
    },

    // ========================================
    // INICIALIZACIÓN
    // ========================================
    async init() {
        this.setupTheme();
        this.setupEventListeners();
        this.updateSimulatedPrices();

        // Actualizar precios cada 30 segundos
        setInterval(() => this.updateSimulatedPrices(), 30000);

        // Verificar sesión de Supabase
        await this.checkAuthSession();

        if (this.state.currentUser) {
            this.navigate('main-menu-screen');
            this.updateUI();
        } else {
            this.navigate('intro-screen');
        }
    },

    // ========================================
    // TEMA (LIGHT / DARK MODE)
    // ========================================
    setupTheme() {
        const savedTheme = localStorage.getItem('invesmate_theme') || 'dark';
        if (savedTheme === 'light') {
            document.body.classList.add('light-mode');
        }
    },

    toggleTheme() {
        const isLight = document.body.classList.toggle('light-mode');
        localStorage.setItem('invesmate_theme', isLight ? 'light' : 'dark');
        
        // Efecto visual y feedback
        this.showToast(`Modo ${isLight ? 'Claro' : 'Oscuro'} activado`, 'info');
    },

    // ========================================
    // AUTENTICACIÓN CON SUPABASE
    // ========================================
    async checkAuthSession() {
        const session = await authService.getSession();
        if (session?.user) {
            // Obtener perfil desde Supabase
            const profile = await authService.getUserProfile(session.user.id);
            if (profile) {
                this.state.currentUser = {
                    id: profile.id,
                    username: profile.username,
                    balance: profile.balance || 10000
                };
                this.state.currentUserId = profile.id;
                this.state.balance = profile.balance || 10000;

                // Cargar portfolio y misiones desde Supabase
                await this.loadUserData();
            }
        }
    },

    async loadUserData() {
        if (!this.state.currentUserId) return;

        // Cargar portfolio
        this.state.portfolio = await portfolioService.getPortfolio(this.state.currentUserId);

        // Cargar misiones desde Supabase
        this.state.missions = await missionsService.getUserMissions(this.state.currentUserId);

        // Cargar logros desde Supabase
        this.state.achievements = await missionsService.getUserAchievements(this.state.currentUserId);

        // Cargar artículos leídos
        const articlesRead = localStorage.getItem('invesmate_articles_read');
        this.state.articlesRead = articlesRead ? parseInt(articlesRead) : 0;
    },

    // ========================================
    // NAVEGACIÓN
    // ========================================
    navigate(screenId) {
        document.querySelectorAll('.screen').forEach(screen => {
            screen.classList.remove('active');
        });
        document.getElementById(screenId).classList.add('active');

        // Actualizar UI específica de pantalla
        this.updateScreenUI(screenId);
    },

    updateScreenUI(screenId) {
        switch(screenId) {
            case 'main-menu-screen':
                this.updateMainMenu();
                break;
            case 'profile-screen':
                this.updateProfile();
                break;
            case 'portfolio-screen':
                this.renderPortfolio();
                break;
            case 'products-screen':
                this.renderProducts('all');
                break;
            case 'missions-screen':
                this.renderMissions();
                break;
            case 'learning-screen':
                this.renderLearning('concepts');
                break;
            case 'achievements-screen':
                this.renderAchievements();
                break;
        }
    },

    // ========================================
    // AUTENTICACIÓN
    // ========================================
    setupEventListeners() {
        document.getElementById('login-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.login();
        });

        document.getElementById('signup-form').addEventListener('submit', async (e) => {
            e.preventDefault();
            await this.signup();
        });
    },

    async login() {
        const username = document.getElementById('login-username').value.trim();
        const password = document.getElementById('login-password').value;

        const result = await authService.login(username, password);

        if (result.success) {
            this.state.currentUser = result.user;
            this.state.currentUserId = result.user.id;
            this.state.balance = result.user.balance || 10000;

            // Cargar datos del usuario
            await this.loadUserData();

            this.showToast(`¡Bienvenido ${result.user.username}!`, 'success');
            this.navigate('main-menu-screen');
        } else {
            this.showToast(result.error || 'Credenciales incorrectas', 'error');
        }
    },

    async signup() {
        const username = document.getElementById('signup-username').value.trim();
        const password = document.getElementById('signup-password').value;
        const confirm = document.getElementById('signup-confirm').value;

        if (password !== confirm) {
            this.showToast('Las contraseñas no coinciden', 'error');
            return;
        }

        const result = await authService.signup(username, password);

        if (result.success) {
            this.state.currentUser = result.user;
            this.state.currentUserId = result.user.id;
            this.state.balance = 10000;
            this.state.portfolio = [];

            // Inicializar misiones y logros en Supabase
            await missionsService.initializeMissions(this.state.currentUserId);
            await missionsService.initializeAchievements(this.state.currentUserId);

            // Recargar datos
            await this.loadUserData();

            // Desbloquear primer logro automáticamente
            await missionsService.unlockAchievement(this.state.currentUserId, 1);
            this.state.achievements = await missionsService.getUserAchievements(this.state.currentUserId);

            this.showToast('¡Cuenta creada con éxito!', 'success');
            this.navigate('main-menu-screen');
        } else {
            this.showToast(result.error || 'Error al crear cuenta', 'error');
        }
    },

    async logout() {
        await authService.logout();
        this.state.currentUser = null;
        this.state.currentUserId = null;
        this.state.balance = 10000;
        this.state.portfolio = [];
        this.navigate('intro-screen');
        this.showToast('Sesión cerrada', 'info');
    },

    // ========================================
    // ACTUALIZACIÓN DE UI
    // ========================================
    updateUI() {
        this.updateMainMenu();
        this.updateProfile();
    },

    updateMainMenu() {
        if (!this.state.currentUser) return;

        document.getElementById('welcome-user').textContent = `¡Hola, ${this.state.currentUser.username}!`;
        document.getElementById('menu-balance').textContent = this.formatNumber(this.state.balance);
    },

    updateProfile() {
        if (!this.state.currentUser) return;

        // Calcular valor del portfolio con precios actuales
        const portfolioValue = this.state.portfolio.reduce((sum, item) => {
            const product = this.products.find(p => p.id === (item.product_id || item.id));
            const currentPrice = product ? product.price : (item.avg_price || item.avgPrice || 0);
            return sum + (item.shares * currentPrice);
        }, 0);

        const missionsCompleted = this.state.missions.filter(m => m.completed).length;
        const achievementsUnlocked = this.state.achievements.filter(a => a.unlocked).length;

        document.getElementById('profile-username').textContent = this.state.currentUser.username;
        document.getElementById('profile-join-date').textContent = '-';
        document.getElementById('stat-balance').textContent = `$${this.formatNumber(this.state.balance)}`;
        document.getElementById('stat-portfolio').textContent = `$${this.formatNumber(portfolioValue)}`;
        document.getElementById('stat-missions').textContent = missionsCompleted;
        document.getElementById('stat-achievements').textContent = achievementsUnlocked;
    },

    // ========================================
    // PRODUCTOS Y CARTERA
    // ========================================
    filterProducts(category) {
        document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
        document.querySelector(`[data-category="${category}"]`).classList.add('active');
        this.renderProducts(category);
    },

    renderProducts(category) {
        const container = document.getElementById('products-list');
        let products = this.products;

        if (category !== 'all') {
            products = products.filter(p => p.category === category);
        }

        container.innerHTML = products.map(product => `
            <div class="product-item" onclick="app.showProductDetail('${product.id}')">
                <div class="product-info">
                    <span class="product-name">${product.name}</span>
                    <span class="product-symbol">${product.symbol}</span>
                    <span class="product-category">${this.getCategoryName(product.category)}</span>
                </div>
                <div class="product-price">
                    <span class="product-price-value">$${product.price.toLocaleString('en-US', {minimumFractionDigits: 2})}</span>
                    <span class="product-change ${product.change >= 0 ? 'positive' : 'negative'}">
                        ${product.change >= 0 ? '+' : ''}${product.change.toFixed(2)}%
                    </span>
                </div>
            </div>
        `).join('');
    },

    getCategoryName(category) {
        const names = { stocks: 'Acción', etfs: 'ETF', crypto: 'Crypto' };
        return names[category] || category;
    },

    showProductDetail(productId) {
        const product = this.products.find(p => p.id === productId);
        if (!product) return;

        this.state.currentProduct = product;
        document.getElementById('detail-title').textContent = this.getCategoryName(product.category);
        document.getElementById('detail-name').textContent = product.name;
        document.getElementById('detail-symbol').textContent = product.symbol;
        document.getElementById('detail-price').textContent = `$${product.price.toLocaleString('en-US', {minimumFractionDigits: 2})}`;

        const changeEl = document.getElementById('detail-change');
        changeEl.textContent = `${product.change >= 0 ? '+' : ''}${product.change.toFixed(2)}%`;
        changeEl.className = `detail-stat-value ${product.change >= 0 ? 'text-positive' : 'text-negative'}`;

        document.getElementById('available-balance').textContent = this.formatNumber(this.state.balance);
        document.getElementById('purchase-amount').value = '';

        // --- INICIALIZAR GRÁFICA ---
        const ctx = document.getElementById('price-chart').getContext('2d');
        if (this.chartInstance) {
            this.chartInstance.destroy();
        }

        // Generar datos históricos simulados
        const historyData = [];
        let simPrice = product.price * (1 - (product.change / 100)); // Precio inicial estimado
        for (let i = 0; i < 20; i++) {
            historyData.push(simPrice);
            simPrice = simPrice * (1 + (Math.random() - 0.48) * 0.05); // Fluctuación aleatoria
        }
        historyData[19] = product.price; // El último punto es el precio actual

        const isPositive = product.change >= 0;
        const color = isPositive ? '#00D09C' : '#FF6B6B';
        const colorBg = isPositive ? 'rgba(0, 208, 156, 0.2)' : 'rgba(255, 107, 107, 0.2)';

        const gradient = ctx.createLinearGradient(0, 0, 0, 200);
        gradient.addColorStop(0, colorBg);
        gradient.addColorStop(1, 'rgba(0,0,0,0)');

        this.chartInstance = new Chart(ctx, {
            type: 'line',
            data: {
                labels: Array.from({length: 20}, (_, i) => i),
                datasets: [{
                    label: 'Precio',
                    data: historyData,
                    borderColor: color,
                    borderWidth: 3,
                    backgroundColor: gradient,
                    fill: true,
                    tension: 0.4,
                    pointRadius: 0,
                    pointHoverRadius: 6
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        mode: 'index',
                        intersect: false,
                        callbacks: {
                            label: function(context) {
                                return '$' + context.parsed.y.toLocaleString('en-US', {minimumFractionDigits: 2});
                            }
                        }
                    }
                },
                scales: {
                    x: { display: false },
                    y: { display: false } // Ocultar ejes para un diseño más limpio
                },
                interaction: {
                    mode: 'nearest',
                    axis: 'x',
                    intersect: false
                }
            }
        });

        this.navigate('product-detail-screen');
    },

    confirmPurchase() {
        const amount = parseFloat(document.getElementById('purchase-amount').value);

        if (!amount || amount <= 0) {
            this.showToast('Ingresa una cantidad válida', 'error');
            return;
        }

        if (amount > this.state.balance) {
            this.showToast('Saldo insuficiente', 'error');
            return;
        }

        document.getElementById('confirm-product').textContent = this.state.currentProduct.name;
        document.getElementById('confirm-amount').textContent = `$${amount.toLocaleString('en-US', {minimumFractionDigits: 2})}`;
        document.getElementById('confirm-balance').textContent = `$${(this.state.balance - amount).toLocaleString('en-US', {minimumFractionDigits: 2})}`;

        document.getElementById('purchase-modal').classList.add('active');
    },

    async executePurchase() {
        const amount = parseFloat(document.getElementById('purchase-amount').value);
        const product = this.state.currentProduct;

        if (!this.state.currentUserId) {
            this.showToast('Error: No hay usuario autenticado', 'error');
            return;
        }

        // Verificar saldo suficiente
        if (amount > this.state.balance) {
            this.showToast('Saldo insuficiente', 'error');
            return;
        }

        // Ejecutar compra en Supabase
        const result = await portfolioService.buyAsset(this.state.currentUserId, product, amount);

        if (result.success) {
            // Actualizar estado local
            this.state.balance -= amount;

            // Actualizar saldo en Supabase
            await authService.updateBalance(this.state.currentUserId, this.state.balance);

            // Recargar portfolio
            await this.loadUserData();

            this.closeModal();
            this.showToast(`¡Compra de ${product.symbol} realizada!`, 'success');

            // Verificar misiones
            this.checkMissions('purchase', product);

            // Desbloquear logro de primera compra
            if (this.state.portfolio.length === 1) {
                this.unlockAchievement(2);
            }
        } else {
            this.showToast(result.error || 'Error en la compra', 'error');
        }
    },

    renderPortfolio() {
        const emptyEl = document.getElementById('portfolio-empty');
        const listEl = document.getElementById('portfolio-list');

        if (this.state.portfolio.length === 0) {
            emptyEl.style.display = 'flex';
            listEl.style.display = 'none';
            return;
        }

        emptyEl.style.display = 'none';
        listEl.style.display = 'flex';

        // Calcular valor total usando precios actuales
        const totalValue = this.state.portfolio.reduce((sum, item) => {
            const product = this.products.find(p => p.id === item.product_id || p.id === item.id);
            const currentPrice = product ? product.price : item.avg_price || item.avgPrice;
            return sum + (item.shares * currentPrice);
        }, 0);

        document.getElementById('portfolio-total').textContent = totalValue.toLocaleString('en-US', {minimumFractionDigits: 2});

        listEl.innerHTML = this.state.portfolio.map(asset => {
            const product = this.products.find(p => p.id === (asset.product_id || asset.id));
            const currentPrice = product ? product.price : (asset.avg_price || asset.avgPrice);
            const currentValue = asset.shares * currentPrice;
            const investedValue = asset.invested_value || asset.value || (asset.shares * (asset.avg_price || asset.avgPrice));
            const gainLoss = investedValue > 0 ? ((currentValue - investedValue) / investedValue) * 100 : 0;

            return `
                <div class="asset-item">
                    <div class="asset-info">
                        <span class="asset-name">${asset.product_name || asset.name}</span>
                        <span class="asset-symbol">${asset.product_symbol || asset.symbol} • ${asset.shares.toFixed(4)} acciones</span>
                    </div>
                    <div class="asset-value">
                        <span class="asset-price">$${currentValue.toLocaleString('en-US', {minimumFractionDigits: 2})}</span>
                        <span class="asset-change ${gainLoss >= 0 ? 'positive' : 'negative'}">
                            ${gainLoss >= 0 ? '+' : ''}${gainLoss.toFixed(2)}%
                        </span>
                    </div>
                </div>
            `;
        }).join('');
    },

    // ========================================
    // MISIONES
    // ========================================
    renderMissions() {
        const container = document.getElementById('missions-list');
        const completed = this.state.missions.filter(m => m.completed).length;
        const total = this.state.missions.length;

        document.getElementById('missions-completed').textContent = completed;
        document.getElementById('missions-total').textContent = total;
        document.getElementById('missions-progress-fill').style.width = `${(completed / total) * 100}%`;

        container.innerHTML = this.state.missions.map(mission => `
            <div class="mission-item ${mission.completed ? 'completed' : 'pending'}"
                 onclick="app.showMissionDetail(${mission.id})">
                <img class="mission-icon" src="${mission.icon}" alt="Icono">
                <div class="mission-info">
                    <span class="mission-title">${mission.title}</span>
                    <span class="mission-desc">${mission.description}</span>
                </div>
                <span class="mission-reward-badge">+$${mission.reward}</span>
            </div>
        `).join('');
    },

    showMissionDetail(missionId) {
        const mission = this.state.missions.find(m => m.id === missionId);
        if (!mission) return;

        this.state.currentMission = mission;
        document.getElementById('mission-detail-title').textContent = mission.title;
        document.getElementById('mission-detail-description').textContent = mission.description;
        document.getElementById('mission-reward-amount').textContent = mission.reward;

        const btn = document.getElementById('mission-action-btn');
        if (mission.completed) {
            btn.textContent = 'Completada ✓';
            btn.disabled = true;
        } else {
            btn.textContent = 'Comenzar';
            btn.disabled = false;
        }

        document.getElementById('mission-detail-screen').classList.add('active');
    },

    async completeMission() {
        if (!this.state.currentMission || this.state.currentMission.completed) return;

        // Completar misión en Supabase
        const result = await missionsService.completeMission(this.state.currentUserId, this.state.currentMission.id);

        if (result.success) {
            this.state.currentMission.completed = true;
            this.state.balance += result.reward;

            // Actualizar balance en Supabase
            await authService.updateBalance(this.state.currentUserId, this.state.balance);

            // Recargar misiones desde Supabase
            this.state.missions = await missionsService.getUserMissions(this.state.currentUserId);

            this.closeModal();
            this.showToast(`¡Misión completada! +$${result.reward}`, 'success');
            this.renderMissions();

            // Verificar misión de "Maestro de Invesmate"
            await this.checkAllMissionsComplete();
        } else {
            this.showToast('Error al completar misión', 'error');
            this.closeModal();
        }
    },

    async checkAllMissionsComplete() {
        const completed = this.state.missions.filter(m => m.completed).length;
        if (completed >= this.state.missions.length) {
            await this.completeMissionById(8);
        }
    },

    async checkMissions(actionType, product) {
        if (!this.state.currentUserId) return;

        // Misión 1: Primera Inversión (primera compra)
        if (actionType === 'purchase' && this.state.portfolio.length >= 1) {
            await this.completeMissionById(1);
        }

        // Misión 2: Diversificador (3 activos diferentes)
        if (this.state.portfolio.length >= 3) {
            await this.completeMissionById(2);
        }

        // Misión 3: Inversor ETF (primero ETF)
        if (product && product.category === 'etfs') {
            const hasETF = this.state.portfolio.some(p => (p.product_category || p.category) === 'etfs');
            if (hasETF) await this.completeMissionById(3);
        }

        // Misión 4: Cripto Entusiasta (primera crypto)
        if (product && product.category === 'crypto') {
            const hasCrypto = this.state.portfolio.some(p => (p.product_category || p.category) === 'crypto');
            if (hasCrypto) await this.completeMissionById(4);
        }

        // Misión 5: Portafolio de $1K
        const portfolioValue = this.state.portfolio.reduce((sum, item) => {
            const prod = this.products.find(p => p.id === (item.product_id || item.id));
            return sum + (item.shares * (prod ? prod.price : (item.avg_price || item.avgPrice || 0)));
        }, 0);
        if (portfolioValue >= 1000) {
            await this.completeMissionById(5);
        }

        // Misión 6: Estudiante Dedicado (3 artículos leídos)
        if (this.state.articlesRead >= 3) {
            await this.completeMissionById(6);
        }

        // Misión 7: Inversor Activo (5 compras diferentes)
        const totalPurchases = this.state.portfolio.length;
        if (totalPurchases >= 5) {
            await this.completeMissionById(7);
        }

        // Verificar logros después de cada acción
        await this.checkAchievements();
    },

    async completeMissionById(id) {
        const mission = this.state.missions.find(m => m.id === id);
        if (mission && !mission.completed) {
            // Completar en Supabase
            const result = await missionsService.completeMission(this.state.currentUserId, id);

            if (result.success) {
                mission.completed = true;
                this.state.balance += result.reward;

                // Actualizar balance en Supabase
                await authService.updateBalance(this.state.currentUserId, this.state.balance);

                // Recargar misiones
                this.state.missions = await missionsService.getUserMissions(this.state.currentUserId);

                this.showToast(`¡Misión desbloqueada: ${mission.title}! +$${result.reward}`, 'success');

                // Verificar si todas las misiones están completas
                await this.checkAllMissionsComplete();
            }
        }
    },

    // ========================================
    // LOGROS
    // ========================================
    async unlockAchievement(id) {
        const result = await missionsService.unlockAchievement(this.state.currentUserId, id);

        if (result.success) {
            const achievement = this.state.achievements.find(a => a.id === id);
            if (achievement) {
                achievement.unlocked = true;
            }
            // Recargar logros
            this.state.achievements = await missionsService.getUserAchievements(this.state.currentUserId);
            this.showToast(`¡Logro desbloqueado: ${result.name}!`, 'success');
        }
    },

    async checkAchievements() {
        const portfolioValue = this.state.portfolio.reduce((sum, item) => {
            const prod = this.products.find(p => p.id === (item.product_id || item.id));
            return sum + (item.shares * (prod ? prod.price : (item.avg_price || item.avgPrice || 0)));
        }, 0);
        const uniqueAssets = this.state.portfolio.length;
        const missionsCompleted = this.state.missions.filter(m => m.completed).length;

        // Logro 3: Diversificador (5 activos diferentes)
        if (uniqueAssets >= 5) {
            await this.unlockAchievement(3);
        }

        // Logro 7: Millonario Virtual (portafolio $100K)
        if (portfolioValue >= 100000) {
            await this.unlockAchievement(7);
        }

        // Logro 8: Maestro (todas las misiones completadas)
        if (missionsCompleted >= this.state.missions.length) {
            await this.unlockAchievement(8);
        }
    },

    renderAchievements() {
        const container = document.getElementById('achievements-list');
        const unlocked = this.state.achievements.filter(a => a.unlocked).length;
        document.getElementById('achievements-count').textContent = unlocked;

        container.innerHTML = this.state.achievements.map(achievement => `
            <div class="achievement-item ${achievement.unlocked ? '' : 'locked'}">
                <img class="achievement-icon" src="${achievement.icon}" alt="Icono">
                <span class="achievement-name">${achievement.name}</span>
                <span class="achievement-desc">${achievement.description}</span>
            </div>
        `).join('');
    },

    // ========================================
    // APRENDIZAJE
    // ========================================
    showLearningSection(section) {
        document.querySelectorAll('.learning-tabs .tab-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.section === section);
        });
        this.renderLearning(section);
    },

    renderLearning(section) {
        const container = document.getElementById('learning-content');
        let content = [];

        switch(section) {
            case 'concepts': content = this.learningContent.concepts; break;
            case 'tips': content = this.learningContent.tips; break;
            case 'mistakes': content = this.learningContent.mistakes; break;
        }

        container.innerHTML = content.map((item, index) => `
            <div class="learning-item" onclick="app.onArticleRead(this)">
                <div class="learning-item-header">
                    <span class="learning-item-title">${item.title}</span>
                    ${item.icon.endsWith('.svg') 
                        ? `<img class="learning-item-icon" src="${item.icon}" alt="Icono">` 
                        : `<span class="learning-item-icon">${item.icon}</span>`}
                </div>
                <div class="learning-item-content">
                    <p>${item.content}</p>
                </div>
            </div>
        `).join('');
    },

    onArticleRead(element) {
        element.classList.toggle('expanded');

        if (element.classList.contains('expanded')) {
            const readArticles = parseInt(localStorage.getItem('invesmate_articles_read') || '0');
            const newCount = readArticles + 1;
            localStorage.setItem('invesmate_articles_read', newCount.toString());
            this.state.articlesRead = newCount;

            // Verificar misión de Estudiante Dedicado
            if (newCount === 3) {
                this.checkMissions('article_read');
            }
        }
    },

    // ========================================
    // UTILIDADES
    // ========================================
    closeModal() {
        document.querySelectorAll('.screen.modal').forEach(modal => {
            modal.classList.remove('active');
        });
    },

    showToast(message, type = 'info') {
        const toast = document.getElementById('toast');
        toast.textContent = message;
        toast.className = `toast ${type} show`;

        setTimeout(() => {
            toast.classList.remove('show');
        }, 3000);
    },

    formatNumber(num) {
        return num.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2});
    },

    updateSimulatedPrices() {
        // Simular fluctuación de precios
        this.products.forEach(product => {
            const changePercent = (Math.random() - 0.5) * 2; // -1% a +1%
            product.price *= (1 + changePercent / 100);
            product.change += (Math.random() - 0.5) * 0.5;

            // Mantener precios realistas
            if (product.price < 1) product.price = 1;
            if (product.change > 50) product.change = 50;
            if (product.change < -50) product.change = -50;
        });

        // Actualizar UI si estamos en pantalla de productos
        const activeScreen = document.querySelector('.screen.active');
        if (activeScreen && activeScreen.id === 'products-screen') {
            const activeTab = document.querySelector('.tab-btn.active');
            if (activeTab) {
                this.renderProducts(activeTab.dataset.category);
            }
        }

        // Actualizar detalle de producto si está abierto
        if (this.state.currentProduct) {
            const updatedProduct = this.products.find(p => p.id === this.state.currentProduct.id);
            if (updatedProduct) {
                this.state.currentProduct = updatedProduct;
                document.getElementById('detail-price').textContent = `$${updatedProduct.price.toLocaleString('en-US', {minimumFractionDigits: 2})}`;
                const changeEl = document.getElementById('detail-change');
                changeEl.textContent = `${updatedProduct.change >= 0 ? '+' : ''}${updatedProduct.change.toFixed(2)}%`;
                changeEl.className = `detail-stat-value ${updatedProduct.change >= 0 ? 'text-positive' : 'text-negative'}`;
                
                // Actualizar gráfica en tiempo real
                if (this.chartInstance) {
                    const data = this.chartInstance.data.datasets[0].data;
                    data.shift(); // Remover el dato más viejo
                    data.push(updatedProduct.price); // Añadir el nuevo
                    
                    const isPositive = updatedProduct.change >= 0;
                    const color = isPositive ? '#00D09C' : '#FF6B6B';
                    this.chartInstance.data.datasets[0].borderColor = color;
                    
                    this.chartInstance.update();
                }
            }
        }
    },

    openRevolut() {
        window.open('https://www.revolut.com', '_blank');
    }
};

// Exponer app globalmente para handlers onclick en HTML
window.app = app;

// Iniciar aplicación cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    app.init();
});

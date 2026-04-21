/**
 * INVESMATE - Aplicación de Simulación de Inversiones
 * Lógica principal de la aplicación
 */

const app = {
    // ========================================
    // ESTADO DE LA APLICACIÓN
    // ========================================
    state: {
        currentUser: null,
        users: [],
        balance: 10000,
        portfolio: [],
        missions: [],
        achievements: [],
        currentProduct: null,
        currentMission: null
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
        { id: 1, title: 'Primera Inversión', description: 'Realiza tu primera compra de acciones', reward: 500, icon: '🎯', completed: false, type: 'first_purchase' },
        { id: 2, title: 'Diversificador', description: 'Compra 3 activos diferentes', reward: 1000, icon: '📊', completed: false, type: 'diversify' },
        { id: 3, title: 'Inversor ETF', description: 'Compra tu primer ETF', reward: 750, icon: '💎', completed: false, type: 'first_etf' },
        { id: 4, title: 'Cripto Entusiasta', description: 'Invierte en criptomonedas', reward: 1000, icon: '₿', completed: false, type: 'first_crypto' },
        { id: 5, title: 'Portafolio de $1K', description: 'Ten $1,000 en tu portafolio', reward: 1500, icon: '💰', completed: false, type: 'portfolio_1k' },
        { id: 6, title: 'Estudiante Dedicado', description: 'Lee 3 artículos de aprendizaje', reward: 500, icon: '📚', completed: false, type: 'read_articles' },
        { id: 7, title: 'Inversor Activo', description: 'Realiza 5 compras diferentes', reward: 2000, icon: '🏅', completed: false, type: 'active_trader' },
        { id: 8, title: 'Maestro de Invesmate', description: 'Completa todas las misiones', reward: 5000, icon: '👑', completed: false, type: 'all_missions' }
    ],

    // ========================================
    // LOGROS / INSIGNIAS
    // ========================================
    achievementsData: [
        { id: 1, name: 'Primeros Pasos', description: 'Completa tu registro', icon: '🌟', unlocked: false },
        { id: 2, name: 'Inversor Novato', description: 'Primera compra realizada', icon: '📈', unlocked: false },
        { id: 3, name: 'Diversificador', description: '5 activos diferentes', icon: '🎨', unlocked: false },
        { id: 4, name: 'Hodler', description: 'Mantén inversiones por 7 días', icon: '💎🙌', unlocked: false },
        { id: 5, name: 'Trader Activo', description: '20 operaciones realizadas', icon: '⚡', unlocked: false },
        { id: 6, name: 'Estudiante', description: 'Completa el aprendizaje', icon: '🎓', unlocked: false },
        { id: 7, name: 'Millonario Virtual', description: 'Portafolio de $100K', icon: '💰', unlocked: false },
        { id: 8, name: 'Maestro', description: 'Todas las misiones completadas', icon: '🏆', unlocked: false }
    ],

    // ========================================
    // CONTENIDO DE APRENDIZAJE
    // ========================================
    learningContent: {
        concepts: [
            { title: '¿Qué es una Acción?', content: 'Una acción representa una parte del capital de una empresa. Al comprar acciones, te conviertes en accionista y tienes derecho a participar en las ganancias de la compañía.', icon: '📊' },
            { title: '¿Qué es un ETF?', content: 'Un ETF (Exchange Traded Fund) es un fondo de inversión que cotiza en bolsa. Permite diversificar invirtiendo en múltiples activos simultáneamente.', icon: '💼' },
            { title: 'Diversificación', content: 'Estrategia que consiste en distribuir las inversiones entre diferentes activos para reducir el riesgo. "No pongas todos los huevos en la misma canasta".', icon: '🎨' },
            { title: 'Riesgo y Rendimiento', content: 'Generalmente, a mayor potencial de rendimiento, mayor es el riesgo. Las inversiones seguras suelen ofrecer menores retornos.', icon: '⚖️' },
            { title: 'Interés Compuesto', content: 'El interés compuesto es cuando las ganancias generadas por una inversión se reinvierten y generan más ganancias. Es la fuerza más poderosa en las finanzas.', icon: '📈' },
            { title: 'Inflación', content: 'La inflación es el aumento generalizado de precios. Tu dinero pierde valor con el tiempo, por eso es importante invertir para superar la inflación.', icon: '💸' }
        ],
        tips: [
            { title: 'Empieza con poco', content: 'No necesitas grandes cantidades para comenzar. La clave es la constancia y el aprendizaje continuo.', icon: '🌱' },
            { title: 'Investiga antes de invertir', content: 'Nunca inviertas en algo que no entiendes. Estudia la empresa, el sector y las tendencias del mercado.', icon: '🔍' },
            { title: 'Define tu estrategia', content: 'Decide si eres inversor a largo plazo o trader de corto plazo. Cada estrategia requiere diferentes habilidades y tiempo.', icon: '🎯' },
            { title: 'Mantén la calma', content: 'Los mercados fluctúan. No tomes decisiones impulsivas basadas en el miedo o la codicia.', icon: '🧘' },
            { title: 'Rebalancea tu portafolio', content: 'Periódicamente ajusta tu portafolio para mantener la distribución de activos que deseas.', icon: '🔄' }
        ],
        mistakes: [
            { title: 'Invertir sin conocimiento', content: 'El error más común es invertir sin entender el activo. Siempre educa antes de invertir.', icon: '⚠️' },
            { title: 'No diversificar', content: 'Concentrar todo en una sola inversión es muy arriesgado. Diversifica para proteger tu capital.', icon: '🚫' },
            { title: 'Seguir a la multitud', content: 'Comprar cuando todos compran y vender cuando todos venden suele ser una mala estrategia.', icon: '🐑' },
            { title: 'No tener paciencia', content: 'Las mejores inversiones requieren tiempo. El trading excesivo genera costos y errores.', icon: '⏰' },
            { title: 'Ignorar las comisiones', content: 'Las comisiones pueden comer tus ganancias. Compara plataformas y elige la que mejor se adapte.', icon: '💰' }
        ]
    },

    // ========================================
    // INICIALIZACIÓN
    // ========================================
    init() {
        this.loadFromStorage();
        this.setupEventListeners();
        this.updateSimulatedPrices();

        // Actualizar precios cada 30 segundos
        setInterval(() => this.updateSimulatedPrices(), 30000);

        if (this.state.currentUser) {
            this.navigate('main-menu-screen');
            this.updateUI();
        } else {
            this.navigate('intro-screen');
        }
    },

    // ========================================
    // ALMACENAMIENTO LOCAL
    // ========================================
    saveToStorage() {
        localStorage.setItem('invesmate_users', JSON.stringify(this.state.users));
        localStorage.setItem('invesmate_current', JSON.stringify(this.state.currentUser));
        localStorage.setItem('invesmate_balance', JSON.stringify(this.state.balance));
        localStorage.setItem('invesmate_portfolio', JSON.stringify(this.state.portfolio));
        localStorage.setItem('invesmate_missions', JSON.stringify(this.state.missions));
        localStorage.setItem('invesmate_achievements', JSON.stringify(this.state.achievements));
    },

    loadFromStorage() {
        const users = localStorage.getItem('invesmate_users');
        const current = localStorage.getItem('invesmate_current');
        const balance = localStorage.getItem('invesmate_balance');
        const portfolio = localStorage.getItem('invesmate_portfolio');
        const missions = localStorage.getItem('invesmate_missions');
        const achievements = localStorage.getItem('invesmate_achievements');

        if (users) this.state.users = JSON.parse(users);
        if (current) this.state.currentUser = JSON.parse(current);
        if (balance) this.state.balance = JSON.parse(balance);
        if (portfolio) this.state.portfolio = JSON.parse(portfolio);
        if (missions) this.state.missions = JSON.parse(missions);
        else this.state.missions = JSON.parse(JSON.stringify(this.missionsData));
        if (achievements) this.state.achievements = JSON.parse(achievements);
        else this.state.achievements = JSON.parse(JSON.stringify(this.achievementsData));
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

        document.getElementById('signup-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.signup();
        });
    },

    login() {
        const username = document.getElementById('login-username').value.trim();
        const password = document.getElementById('login-password').value;

        const user = this.state.users.find(u => u.username === username && u.password === password);

        if (user) {
            this.state.currentUser = user;
            this.saveToStorage();
            this.showToast('¡Bienvenido de nuevo!', 'success');
            this.navigate('main-menu-screen');
        } else {
            this.showToast('Credenciales incorrectas', 'error');
        }
    },

    signup() {
        const username = document.getElementById('signup-username').value.trim();
        const password = document.getElementById('signup-password').value;
        const confirm = document.getElementById('signup-confirm').value;

        if (password !== confirm) {
            this.showToast('Las contraseñas no coinciden', 'error');
            return;
        }

        if (this.state.users.find(u => u.username === username)) {
            this.showToast('El usuario ya existe', 'error');
            return;
        }

        const newUser = {
            username,
            password,
            joinDate: new Date().toISOString(),
            balance: 10000,
            portfolio: [],
            missionsCompleted: 0,
            achievementsUnlocked: 0
        };

        this.state.users.push(newUser);
        this.state.currentUser = newUser;
        this.state.balance = 10000;
        this.state.portfolio = [];

        // Desbloquear primer logro
        this.unlockAchievement(1);

        this.saveToStorage();
        this.showToast('¡Cuenta creada con éxito!', 'success');
        this.navigate('main-menu-screen');
    },

    logout() {
        this.state.currentUser = null;
        this.saveToStorage();
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

        const portfolioValue = this.state.portfolio.reduce((sum, item) => sum + item.value, 0);
        const missionsCompleted = this.state.missions.filter(m => m.completed).length;
        const achievementsUnlocked = this.state.achievements.filter(a => a.unlocked).length;

        document.getElementById('profile-username').textContent = this.state.currentUser.username;
        document.getElementById('profile-join-date').textContent = new Date(this.state.currentUser.joinDate).toLocaleDateString();
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

        this.navigate('purchase-modal');
    },

    executePurchase() {
        const amount = parseFloat(document.getElementById('purchase-amount').value);
        const product = this.state.currentProduct;

        // Actualizar saldo
        this.state.balance -= amount;

        // Agregar o actualizar en portafolio
        const existing = this.state.portfolio.find(p => p.id === product.id);
        if (existing) {
            existing.value += amount;
            existing.shares += amount / product.price;
        } else {
            this.state.portfolio.push({
                id: product.id,
                name: product.name,
                symbol: product.symbol,
                category: product.category,
                value: amount,
                shares: amount / product.price,
                avgPrice: product.price
            });
        }

        this.state.currentUser.balance = this.state.balance;
        this.state.currentUser.portfolio = this.state.portfolio;

        this.saveToStorage();
        this.closeModal();
        this.showToast(`¡Compra de ${product.symbol} realizada!`, 'success');

        // Verificar misiones
        this.checkMissions('purchase', product);

        // Desbloquear logro de primera compra
        if (this.state.portfolio.length === 1) {
            this.unlockAchievement(2);
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

        const totalValue = this.state.portfolio.reduce((sum, item) => sum + item.value, 0);
        document.getElementById('portfolio-total').textContent = totalValue.toLocaleString('en-US', {minimumFractionDigits: 2});

        listEl.innerHTML = this.state.portfolio.map(asset => {
            const product = this.products.find(p => p.id === asset.id);
            const currentPrice = product ? product.price : asset.avgPrice;
            const currentValue = asset.shares * currentPrice;
            const gainLoss = ((currentValue - asset.value) / asset.value) * 100;

            return `
                <div class="asset-item">
                    <div class="asset-info">
                        <span class="asset-name">${asset.name}</span>
                        <span class="asset-symbol">${asset.symbol} • ${asset.shares.toFixed(4)} acciones</span>
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
                <span class="mission-icon">${mission.icon}</span>
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

        this.navigate('mission-detail-screen');
    },

    completeMission() {
        if (!this.state.currentMission || this.state.currentMission.completed) return;

        this.state.currentMission.completed = true;
        this.state.balance += this.state.currentMission.reward;
        this.state.currentUser.balance = this.state.balance;

        this.saveToStorage();
        this.closeModal();
        this.showToast(`¡Misión completada! +$${this.state.currentMission.reward}`, 'success');
        this.renderMissions();
    },

    checkMissions(actionType, product) {
        // Misión: Primera inversión
        if (actionType === 'purchase' && this.state.portfolio.length === 1) {
            this.completeMissionById(1);
        }

        // Misión: Diversificador (3 activos diferentes)
        if (this.state.portfolio.length >= 3) {
            this.completeMissionById(2);
        }

        // Misión: Inversor ETF
        if (product && product.category === 'etfs') {
            const hasETF = this.state.portfolio.some(p => p.category === 'etfs');
            if (hasETF) this.completeMissionById(3);
        }

        // Misión: Cripto Entusiasta
        if (product && product.category === 'crypto') {
            const hasCrypto = this.state.portfolio.some(p => p.category === 'crypto');
            if (hasCrypto) this.completeMissionById(4);
        }

        // Misión: Portafolio de $1K
        const portfolioValue = this.state.portfolio.reduce((sum, item) => sum + item.value, 0);
        if (portfolioValue >= 1000) {
            this.completeMissionById(5);
        }
    },

    completeMissionById(id) {
        const mission = this.state.missions.find(m => m.id === id);
        if (mission && !mission.completed) {
            mission.completed = true;
            this.state.balance += mission.reward;
            this.state.currentUser.balance = this.state.balance;
            this.saveToStorage();
            this.showToast(`¡Misión desbloqueada: ${mission.title}! +$${mission.reward}`, 'success');
        }
    },

    // ========================================
    // LOGROS
    // ========================================
    unlockAchievement(id) {
        const achievement = this.state.achievements.find(a => a.id === id);
        if (achievement && !achievement.unlocked) {
            achievement.unlocked = true;
            this.state.currentUser.achievementsUnlocked++;
            this.saveToStorage();
            this.showToast(`¡Logro desbloqueado: ${achievement.name}!`, 'success');
        }
    },

    renderAchievements() {
        const container = document.getElementById('achievements-list');
        const unlocked = this.state.achievements.filter(a => a.unlocked).length;
        document.getElementById('achievements-count').textContent = unlocked;

        container.innerHTML = this.state.achievements.map(achievement => `
            <div class="achievement-item ${achievement.unlocked ? '' : 'locked'}">
                <span class="achievement-icon">${achievement.icon}</span>
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
            <div class="learning-item" onclick="this.classList.toggle('expanded')">
                <div class="learning-item-header">
                    <span class="learning-item-title">${item.title}</span>
                    <span class="learning-item-icon">${item.icon}</span>
                </div>
                <div class="learning-item-content">
                    <p>${item.content}</p>
                </div>
            </div>
        `).join('');
    },

    // ========================================
    // UTILIDADES
    // ========================================
    closeModal() {
        const modals = document.querySelectorAll('.screen.modal');
        modals.forEach(modal => modal.classList.remove('active'));

        // Volver a la pantalla anterior
        if (document.getElementById('purchase-modal').classList.contains('active')) {
            // Ya está cerrado, no hacer nada
        }
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
            }
        }
    },

    openRevolut() {
        window.open('https://www.revolut.com', '_blank');
    }
};

// Iniciar aplicación cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    app.init();
});

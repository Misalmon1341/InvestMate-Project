/**
 * INVESMATE - Aplicación de Simulación de Inversiones
 * Lógica principal de la aplicación
 */

import { authService } from './auth-service.js';
import { portfolioService } from './portfolio-service.js';
import { missionsService } from './missions-service.js';
import { onAuthChange } from './supabase-client.js';

let isRecoveryMode = false;
onAuthChange((event, session) => {
    if (event === 'PASSWORD_RECOVERY') {
        isRecoveryMode = true;
    }
});

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
        { id: 1, title: 'Analista Principiante', description: 'Lee al menos 1 artículo y realiza tu primera inversión.', reward: 1000, icon: './img/boxicons-SVG2/svgs/basic/regular/400/bx-star.svg', completed: false, type: 'first_purchase_after_learning' },
        { id: 2, title: 'Diversificación Estratégica', description: 'Ten al menos 5 activos diferentes en tu portafolio.', reward: 2500, icon: './img/boxicons-SVG2/svgs/basic/regular/400/bx-share.svg', completed: false, type: 'diversify_5' },
        { id: 3, title: 'Fondo de Seguridad', description: 'Invierte al menos $5,000 en un ETF seguro.', reward: 3000, icon: './img/boxicons-SVG1/svgs/basic/regular/400/bx-barcode.svg', completed: false, type: 'etf_5k' },
        { id: 4, title: 'Portafolio Crypto', description: 'Invierte en 3 criptomonedas diferentes.', reward: 2000, icon: './img/boxicons-SVG2/svgs/basic/regular/400/bx-bitcoin.svg', completed: false, type: 'crypto_3' },
        { id: 5, title: 'Magnate en Ascenso', description: 'Alcanza un valor total de portafolio de $50,000.', reward: 5000, icon: './img/boxicons-SVG2/svgs/basic/regular/400/bx-dollar-circle.svg', completed: false, type: 'portfolio_50k' },
        { id: 6, title: 'Académico Financiero', description: 'Lee al menos 10 artículos de aprendizaje.', reward: 1500, icon: './img/boxicons-SVG2/svgs/basic/regular/400/bx-address-book.svg', completed: false, type: 'read_10_articles' },
        { id: 7, title: 'Trader Experimentado', description: 'Realiza al menos 15 operaciones de compra.', reward: 4000, icon: './img/boxicons-SVG1/svgs/basic/regular/400/bx-cart-check.svg', completed: false, type: 'active_trader_15' },
        { id: 8, title: 'Maestro Invesmate', description: 'Completa todas las demás misiones.', reward: 10000, icon: './img/boxicons-SVG1/svgs/basic/regular/400/bx-treasure-chest.svg', completed: false, type: 'all_missions' }
    ],

    // ========================================
    // LOGROS / INSIGNIAS
    // ========================================
    achievementsData: [
        { id: 1, name: 'Primeros Pasos', description: 'Completa tu registro', icon: './img/boxicons-SVG2/svgs/basic/regular/400/bx-star.svg', unlocked: false },
        { id: 2, name: 'Inversor Informado', description: 'Primera compra tras estudiar', icon: './img/boxicons-SVG2/svgs/basic/regular/400/bx-dollar-circle.svg', unlocked: false },
        { id: 3, name: 'Gran Diversificador', description: '10 activos diferentes', icon: './img/boxicons-SVG2/svgs/basic/regular/400/bx-share.svg', unlocked: false },
        { id: 4, name: 'Rey del ETF', description: '$10,000 en ETFs', icon: './img/boxicons-SVG1/svgs/basic/regular/400/bx-hourglass.svg', unlocked: false },
        { id: 5, name: 'Trader Frenético', description: '30 operaciones realizadas', icon: './img/boxicons-SVG1/svgs/basic/regular/400/bx-cart-check.svg', unlocked: false },
        { id: 6, name: 'Erudito', description: 'Lee los 24 artículos de aprendizaje', icon: './img/boxicons-SVG2/svgs/basic/regular/400/bx-intellect.svg', unlocked: false },
        { id: 7, name: 'Lobo de Wall Street', description: 'Portafolio de $250K', icon: './img/boxicons-SVG2/svgs/basic/regular/400/bx-dollar-circle-stars.svg', unlocked: false },
        { id: 8, name: 'Leyenda', description: 'Todas las misiones completadas', icon: './img/boxicons-SVG1/svgs/basic/regular/400/bx-gem-alt.svg', unlocked: false }
    ],

// ========================================
    // CONTENIDO DE APRENDIZAJE
    // ========================================
    learningContent: {
        concepts: [
            { title: '¿Qué es una Acción?', content: 'Una acción representa una fracción de la propiedad de una empresa pública. Al adquirirla, te conviertes en accionista, lo que te otorga derechos sobre los activos de la empresa y una porción de sus beneficios (dividendos). Su precio fluctúa según la oferta y la demanda, reflejando el valor percibido y el rendimiento futuro de la compañía.', icon: './img/boxicons-SVG2/svgs/basic/regular/400/bx-analyze.svg' },
            { title: 'Fondos Cotizados (ETFs)', content: 'Un ETF (Exchange Traded Fund) es un conjunto diversificado de activos (como acciones o bonos) que cotiza en bolsa como si fuera una sola acción. Al comprar un ETF, como el S&P 500, estás invirtiendo simultáneamente en las 500 empresas más grandes de EE.UU., reduciendo significativamente el riesgo en comparación con comprar acciones individuales.', icon: './img/boxicons-SVG2/svgs/basic/regular/400/bx-briefcase-alt.svg' },
            { title: 'Criptomonedas y Blockchain', content: 'Las criptomonedas son activos digitales descentralizados que utilizan la criptografía para asegurar transacciones. Operan sobre la tecnología Blockchain, un libro contable público e inmutable. Son conocidas por su alta volatilidad y potencial de crecimiento, pero conllevan un riesgo sustancial.', icon: './img/boxicons-SVG2/svgs/basic/regular/400/bx-bitcoin.svg' },
            { title: 'Diversificación del Portafolio', content: 'Es la estrategia de gestión de riesgos que mezcla una amplia variedad de inversiones dentro de una cartera. La idea es que los rendimientos positivos de algunas inversiones neutralicen los rendimientos negativos de otras. Se resume en el principio: "Nunca pongas todos tus huevos en la misma canasta".', icon: './img/boxicons-SVG2/svgs/basic/regular/400/bx-share.svg' },
            { title: 'El Interés Compuesto', content: 'Albert Einstein lo llamó "la octava maravilla del mundo". Es el proceso mediante el cual los intereses de un capital inicial generan nuevos intereses. Al reinvertir tus ganancias, tu dinero crece de forma exponencial a lo largo del tiempo, haciendo que la paciencia sea tu mejor aliada.', icon: './img/boxicons-SVG2/svgs/basic/regular/400/bx-dollar-circle.svg' },
            { title: 'Relación Riesgo/Rendimiento', content: 'Principio fundamental: a mayor potencial de rendimiento, mayor será el riesgo asumido. Las inversiones muy seguras (como bonos del tesoro) ofrecen retornos bajos. Para buscar rentabilidades altas (como en criptomonedas o acciones de crecimiento), debes estar dispuesto a tolerar caídas drásticas en el precio.', icon: './img/boxicons-SVG2/svgs/basic/regular/400/bx-psychology.svg' },
            { title: 'Inflación y Poder Adquisitivo', content: 'La inflación es el aumento sostenido y generalizado de los precios de los bienes y servicios. Si guardas tu dinero debajo del colchón o en una cuenta de ahorros sin intereses, la inflación destruye su poder adquisitivo año tras año. Invertir es la herramienta principal para que tu dinero mantenga (y aumente) su valor real.', icon: './img/boxicons-SVG2/svgs/basic/regular/400/bx-line-chart-down.svg' },
            { title: 'Análisis Fundamental vs Técnico', content: 'El Análisis Fundamental evalúa el valor intrínseco de una empresa revisando sus estados financieros, liderazgo y ventajas competitivas. El Análisis Técnico estudia los gráficos de precios históricos y el volumen de trading para predecir tendencias futuras a corto plazo.', icon: './img/boxicons-SVG2/svgs/basic/regular/400/bx-bar-chart-alt-2.svg' }
        ],
        tips: [
            { title: 'Paga tus Deudas Primero', content: 'Antes de invertir, elimina cualquier deuda con intereses altos (como tarjetas de crédito). Matemáticamente, es imposible que una inversión te garantice un 20% de rendimiento para compensar el 20% que el banco te cobra por tu deuda.', icon: './img/boxicons-SVG2/svgs/basic/regular/400/bx-credit-card.svg' },
            { title: 'Investiga por ti Mismo (DYOR)', content: 'DYOR (Do Your Own Research). Nunca inviertas en un activo solo porque un amigo o influencer te lo recomendó. Asegúrate de entender el modelo de negocio, cómo generan dinero y cuáles son sus principales competidores antes de arriesgar tu capital.', icon: './img/boxicons-SVG2/svgs/basic/regular/400/bx-search-alt.svg' },
            { title: 'Estrategia DCA (Promedio de Costo)', content: 'El "Dollar Cost Averaging" consiste en invertir una cantidad fija de dinero a intervalos regulares (ej. $100 cada mes), sin importar el precio del activo. Esto reduce el impacto de la volatilidad y evita el estrés de intentar adivinar el momento perfecto para comprar.', icon: './img/boxicons-SVG2/svgs/basic/regular/400/bx-calendar-plus.svg' },
            { title: 'Horizonte a Largo Plazo', content: 'El mercado puede ser irracional a corto plazo, pero tiende a reflejar el valor real a largo plazo. Diseña tu estrategia pensando en décadas (10-20 años), no en días. El interés compuesto necesita tiempo para hacer su magia.', icon: './img/boxicons-SVG2/svgs/basic/regular/400/bx-trending-up.svg' },
            { title: 'Fondo de Emergencia', content: 'Antes de enviar todo tu dinero a la bolsa, construye un fondo de emergencia en efectivo que cubra de 3 a 6 meses de tus gastos fijos. Esto te evitará tener que vender tus inversiones con pérdidas si ocurre un imprevisto en tu vida.', icon: './img/boxicons-SVG2/svgs/basic/regular/400/bx-shield-quarter.svg' },
            { title: 'Controla tus Emociones', content: 'El mercado pondrá a prueba tu psicología. Ver tu portafolio caer un 30% causa pánico. Tener una estrategia escrita de antemano y ceñirte a ella te evitará vender en el peor momento por miedo.', icon: './img/boxicons-SVG2/svgs/basic/regular/400/bx-brain.svg' },
            { title: 'Rebalanceo Periódico', content: 'Si una de tus inversiones crece desproporcionadamente, tu portafolio se desbalancea y asumes más riesgo del deseado. Una o dos veces al año, revisa y ajusta los porcentajes vendiendo lo que ha subido mucho y comprando lo que ha bajado.', icon: './img/boxicons-SVG2/svgs/basic/regular/400/bx-slider.svg' },
            { title: 'Reinvierte tus Dividendos', content: 'Cuando las empresas te paguen dividendos, usa ese dinero para comprar más acciones de la misma empresa. Este pequeño hábito acelera drásticamente la bola de nieve del interés compuesto.', icon: './img/boxicons-SVG2/svgs/basic/regular/400/bx-refresh.svg' }
        ],
        mistakes: [
            { title: 'Invertir por FOMO', content: 'El FOMO (Fear Of Missing Out) o miedo a quedarse fuera, ocurre cuando compras un activo porque ves que todos están ganando dinero con él. Usualmente, cuando la noticia llega a las masas, el precio ya está inflado y estás comprando en el pico más alto.', icon: './img/boxicons-SVG2/svgs/basic/regular/400/bx-error-circle.svg' },
            { title: 'Querer "Hacerse Rico Rápido"', content: 'La inversión no es un esquema para volverse millonario en una semana. Quienes buscan retornos rápidos suelen caer en estafas o asumen riesgos excesivos (apalancamiento) que terminan liquidando todo su capital.', icon: './img/boxicons-SVG2/svgs/basic/regular/400/bx-x-circle.svg' },
            { title: 'Adivinar el Mercado (Market Timing)', content: 'Intentar comprar en el punto más bajo y vender en el más alto es estadísticamente imposible de mantener a largo plazo. "El tiempo en el mercado supera a sincronizar el mercado" (Time in the market beats timing the market).', icon: './img/boxicons-SVG2/svgs/basic/regular/400/bx-time-five.svg' },
            { title: 'Ignorar Costos y Comisiones', content: 'Las altas comisiones de los fondos mutuos o las tarifas de transacción frecuentes en el trading activo pueden devorar silenciosamente hasta el 50% de tus ganancias a largo plazo. Busca siempre instrumentos de bajo costo (como ETFs indexados).', icon: './img/boxicons-SVG2/svgs/basic/regular/400/bx-money.svg' },
            { title: 'Sobre-operar (Overtrading)', content: 'Comprar y vender constantemente genera comisiones y estrés, y estadísticamente produce peores rendimientos que simplemente comprar y mantener (Hold). Invertir debe ser aburrido, como ver crecer la hierba.', icon: './img/boxicons-SVG2/svgs/basic/regular/400/bx-transfer.svg' },
            { title: 'Seguir a Gurús Ciegamente', content: 'Nadie tiene una bola de cristal. Si un "experto" en redes sociales te garantiza retornos exorbitantes y seguros, probablemente esté intentando venderte un curso o usar su audiencia para inflar un activo y vender el suyo.', icon: './img/boxicons-SVG2/svgs/basic/regular/400/bx-user-x.svg' },
            { title: 'Invertir Dinero que Necesitas', content: 'Si vas a necesitar dinero para pagar la renta o la universidad el próximo mes, no lo inviertas en renta variable (acciones). El mercado puede caer sorpresivamente y te forzará a vender con fuertes pérdidas.', icon: './img/boxicons-SVG2/svgs/basic/regular/400/bx-wallet-alt.svg' },
            { title: 'Sesgo de Confirmación', content: 'Ocurre cuando te enamoras de un activo y solo buscas noticias positivas sobre él, ignorando activamente las advertencias de peligro. Un buen inversor siempre busca argumentos en contra de sus propias inversiones para poner a prueba su solidez.', icon: './img/boxicons-SVG2/svgs/basic/regular/400/bx-hide.svg' }
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

        // Enrutar dependiendo del estado
        if (isRecoveryMode || window.location.hash.includes('type=recovery')) {
            // Limpiar el hash para que no vuelva a activarse si el usuario recarga la página
            if (window.history.replaceState) {
                window.history.replaceState(null, null, window.location.pathname);
            }
            this.navigate('reset-password-screen');
        } else if (this.state.currentUser) {
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
        try {
            const session = await authService.getSession();
            if (session?.user) {
                const user = session.user;
                // Obtener perfil desde Supabase (opcional)
                const profile = await authService.getUserProfile(user.id);

                // Fallback chain robusta para username: perfil BD → metadata auth → email -> fallback
                const resolvedUsername = profile?.username
                    || user.user_metadata?.username
                    || user.raw_user_meta_data?.username
                    || (user.email ? user.email.split('@')[0] : null)
                    || 'Usuario';

                this.state.currentUser = {
                    id: user.id,
                    username: resolvedUsername,
                    email: user.email,
                    balance: profile?.balance || 10000
                };
                this.state.currentUserId = user.id;
                this.state.balance = profile?.balance || 10000;

                // Cargar portfolio y misiones desde Supabase (silenciosamente)
                try {
                    await this.loadUserData();
                } catch (e) {
                    console.warn('No se pudieron cargar todos los datos del usuario al inicio:', e);
                }
            }
        } catch (error) {
            console.error('Error verificando sesión inicial:', error);
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

        const forgotForm = document.getElementById('forgot-password-form');
        if (forgotForm) {
            forgotForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                await this.forgotPassword();
            });
        }

        const resetForm = document.getElementById('reset-password-form');
        if (resetForm) {
            resetForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                await this.resetPassword();
            });
        }
    },

    async login() {
        const emailInput = document.getElementById('login-email');
        const passwordInput = document.getElementById('login-password');
        
        if (!emailInput || !passwordInput) return;

        const email = emailInput.value.trim();
        const password = passwordInput.value;
        const submitBtn = document.querySelector('#login-form button[type="submit"]');
        const originalBtnText = submitBtn ? submitBtn.textContent : 'Entrar';

        try {
            // Estado de carga
            if (submitBtn) {
                submitBtn.disabled = true;
                submitBtn.textContent = 'Iniciando sesión...';
            }

            const result = await authService.login(email, password);

            if (result.success && result.user) {
                // Actualizar estado básico inmediatamente
                this.state.currentUser = result.user;
                this.state.currentUserId = result.user.id;
                this.state.balance = result.user.balance || 10000;

                // NAVEGACIÓN INMEDIATA
                this.navigate('main-menu-screen');
                this.showToast(`¡Bienvenido ${result.user.username || 'Usuario'}!`, 'success');

                // Cargar datos pesados en segundo plano para no bloquear la UI
                this.loadUserData().then(() => {
                    this.updateUI(); // Refrescar UI cuando los datos lleguen
                }).catch(err => {
                    console.warn('Error cargando datos en segundo plano:', err);
                });
                
            } else {
                this.showToast(result.error || 'Credenciales incorrectas', 'error');
            }
        } catch (error) {
            console.error('Error crítico en login:', error);
            this.showToast('Error de conexión o del servidor', 'error');
        } finally {
            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.textContent = originalBtnText;
            }
        }
    },

    async signup() {
        const email = document.getElementById('signup-email').value.trim();
        const username = document.getElementById('signup-username').value.trim();
        const password = document.getElementById('signup-password').value;
        const confirm = document.getElementById('signup-confirm').value;

        if (password !== confirm) {
            this.showToast('Las contraseñas no coinciden', 'error');
            return;
        }

        const result = await authService.signup(email, password, username);

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

    async forgotPassword() {
        const email = document.getElementById('forgot-email').value.trim();
        const result = await authService.requestPasswordReset(email);

        if (result.success) {
            const container = document.querySelector('#forgot-password-screen .auth-container');
            container.innerHTML = `
                <div class="logo-small">INVESMATE</div>
                <h2 class="auth-title" style="color: #00D09C;">¡Revisa tu correo!</h2>
                <p style="text-align: center; color: var(--text-secondary); margin-bottom: 20px; font-size: 1.1rem; line-height: 1.5;">
                    Hemos enviado un enlace seguro a:<br><strong style="color: white;">${email}</strong><br><br>
                    Por favor, <strong>abre tu correo electrónico y haz clic en ese enlace</strong> para poder escribir tu nueva contraseña.
                </p>
                <button class="btn-primary btn-large" onclick="app.navigate('login-screen')">Volver al Inicio de Sesión</button>
            `;
        } else {
            this.showToast(result.error || 'Error al enviar enlace', 'error');
        }
    },

    async resetPassword() {
        const password = document.getElementById('reset-password').value;
        const confirm = document.getElementById('reset-confirm').value;

        if (password !== confirm) {
            this.showToast('Las contraseñas no coinciden', 'error');
            return;
        }

        const result = await authService.updatePassword(password);

        if (result.success) {
            this.showToast('¡Contraseña actualizada con éxito!', 'success');
            await this.checkAuthSession();
            if (this.state.currentUser) {
                this.navigate('main-menu-screen');
            } else {
                this.navigate('login-screen');
            }
        } else {
            this.showToast(result.error || 'Error al actualizar contraseña', 'error');
        }
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

            // Incrementar contador de operaciones
            const ops = parseInt(localStorage.getItem('invesmate_operations') || '0') + 1;
            localStorage.setItem('invesmate_operations', ops.toString());

            // Verificar misiones
            this.checkMissions('purchase', product);

            // Desbloquear logro de inversor informado (primera compra y leyó artículo)
            if (ops === 1 && this.state.articlesRead >= 1) {
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

        // Misión 1: Analista Principiante (1 artículo leído y 1 compra)
        if (actionType === 'purchase' && this.state.portfolio.length >= 1 && this.state.articlesRead >= 1) {
            await this.completeMissionById(1);
        }

        // Misión 2: Diversificación Estratégica (5 activos diferentes)
        if (this.state.portfolio.length >= 5) {
            await this.completeMissionById(2);
        }

        // Misión 3: Fondo de Seguridad (ETF > $5,000)
        const hasBigETF = this.state.portfolio.some(p => {
            const prod = this.products.find(pr => pr.id === (p.product_id || p.id));
            if (!prod || prod.category !== 'etfs') return false;
            return (p.shares * prod.price) >= 5000;
        });
        if (hasBigETF) {
            await this.completeMissionById(3);
        }

        // Misión 4: Portafolio Crypto (3 cryptos)
        const cryptoCount = this.state.portfolio.filter(p => {
            const prod = this.products.find(pr => pr.id === (p.product_id || p.id));
            return prod && prod.category === 'crypto';
        }).length;
        if (cryptoCount >= 3) {
            await this.completeMissionById(4);
        }

        // Misión 5: Magnate en Ascenso ($50,000 portafolio)
        const portfolioValue = this.state.portfolio.reduce((sum, item) => {
            const prod = this.products.find(p => p.id === (item.product_id || p.id));
            return sum + (item.shares * (prod ? prod.price : (item.avg_price || item.avgPrice || 0)));
        }, 0);
        if (portfolioValue >= 50000) {
            await this.completeMissionById(5);
        }

        // Misión 6: Académico Financiero (10 artículos leídos)
        if (this.state.articlesRead >= 10) {
            await this.completeMissionById(6);
        }

        // Misión 7: Trader Experimentado (15 operaciones)
        const totalOps = parseInt(localStorage.getItem('invesmate_operations') || '0');
        if (totalOps >= 15) {
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
        const totalOps = parseInt(localStorage.getItem('invesmate_operations') || '0');

        // Logro 3: Gran Diversificador (10 activos diferentes)
        if (uniqueAssets >= 10) {
            await this.unlockAchievement(3);
        }

        // Logro 4: Rey del ETF ($10K en ETFs)
        const etfValue = this.state.portfolio.reduce((sum, item) => {
            const prod = this.products.find(p => p.id === (item.product_id || p.id));
            if (prod && prod.category === 'etfs') {
                return sum + (item.shares * prod.price);
            }
            return sum;
        }, 0);
        if (etfValue >= 10000) {
            await this.unlockAchievement(4);
        }

        // Logro 5: Trader Frenético (30 operaciones)
        if (totalOps >= 30) {
            await this.unlockAchievement(5);
        }

        // Logro 6: Erudito (Lee los 24 artículos)
        if (this.state.articlesRead >= 24) {
            await this.unlockAchievement(6);
        }

        // Logro 7: Lobo de Wall Street (portafolio $250K)
        if (portfolioValue >= 250000) {
            await this.unlockAchievement(7);
        }

        // Logro 8: Leyenda (todas las misiones completadas)
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

            // Verificar misiones y logros relacionados con aprendizaje
            if (newCount === 1) {
                // Verificar si ya hizo una compra para desbloquear Misión 1
                this.checkMissions('article_read');
            }
            if (newCount >= 10) {
                this.checkMissions('article_read');
            }
            if (newCount >= 24) {
                this.checkAchievements();
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

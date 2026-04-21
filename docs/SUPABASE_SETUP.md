# Configuración de Supabase para Invesmate

## Paso 1: Crear Proyecto en Supabase

1. Ve a [https://supabase.com](https://supabase.com)
2. Click en **"Start your project"** o **"Sign In"**
3. Crea una cuenta (puedes usar GitHub, Google, o email)
4. Click en **"New Project"**
5. Llena los datos:
   - **Name**: `invesmate`
   - **Database Password**: (guárdala en un lugar seguro)
   - **Region**: Elige la más cercana (ej. `East US (North Virginia)`)
6. Click en **"Create new project"** (tarda ~2 minutos)

## Paso 2: Obtener Credenciales

Una vez creado el proyecto:

1. Ve a **Settings** (engranaje en la barra lateral)
2. Click en **API**
3. Copia estos valores:
   - **Project URL**: `https://xxxxx.supabase.co`
   - **anon/public key**: `eyJhbG...` (clave larga)

> ⚠️ **Nunca commits las credenciales reales**. Usaremos un archivo `.env` que irá en `.gitignore`

## Paso 3: Crear Tablas en la Base de Datos

Ve al **SQL Editor** en Supabase y ejecuta este script:

```sql
-- Tabla de perfiles de usuario (vinculada a Supabase Auth)
CREATE TABLE profiles (
    id UUID REFERENCES auth.users(id) PRIMARY KEY,
    username TEXT UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    balance DECIMAL(12, 2) DEFAULT 10000.00,
    missions_completed INTEGER DEFAULT 0,
    achievements_unlocked INTEGER DEFAULT 0
);

-- Tabla de portfolio
CREATE TABLE portfolio (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    product_id TEXT NOT NULL,
    product_name TEXT NOT NULL,
    product_symbol TEXT NOT NULL,
    product_category TEXT NOT NULL,
    shares DECIMAL(18, 8) NOT NULL,
    avg_price DECIMAL(12, 2) NOT NULL,
    invested_value DECIMAL(12, 2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Tabla de transacciones
CREATE TABLE transactions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    product_id TEXT NOT NULL,
    product_name TEXT NOT NULL,
    product_symbol TEXT NOT NULL,
    transaction_type TEXT CHECK (transaction_type IN ('buy', 'sell')) NOT NULL,
    shares DECIMAL(18, 8) NOT NULL,
    price_per_share DECIMAL(12, 2) NOT NULL,
    total_value DECIMAL(12, 2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Tabla de misiones
CREATE TABLE user_missions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    mission_id INTEGER NOT NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    reward DECIMAL(10, 2) NOT NULL,
    completed BOOLEAN DEFAULT FALSE,
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    UNIQUE(user_id, mission_id)
);

-- Tabla de logros
CREATE TABLE user_achievements (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    achievement_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    unlocked BOOLEAN DEFAULT FALSE,
    unlocked_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    UNIQUE(user_id, achievement_id)
);

-- Índices para mejorar rendimiento
CREATE INDEX idx_portfolio_user ON portfolio(user_id);
CREATE INDEX idx_transactions_user ON transactions(user_id);
CREATE INDEX idx_user_missions_user ON user_missions(user_id);
CREATE INDEX idx_user_achievements_user ON user_achievements(user_id);

-- Trigger para actualizar updated_at en portfolio
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_portfolio_updated_at
    BEFORE UPDATE ON portfolio
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
```

## Paso 4: Configurar Row Level Security (RLS)

Esto protege tus datos - cada usuario solo puede ver/editar SUS datos:

```sql
-- Habilitar RLS en todas las tablas
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE portfolio ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_missions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;

-- Políticas para profiles
CREATE POLICY "Usuarios ven su propio perfil"
    ON profiles FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "Usuarios actualizan su propio perfil"
    ON profiles FOR UPDATE
    USING (auth.uid() = id);

CREATE POLICY "Usuarios insertan su propio perfil"
    ON profiles FOR INSERT
    WITH CHECK (auth.uid() = id);

-- Políticas para portfolio
CREATE POLICY "Usuarios ven su propio portfolio"
    ON portfolio FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Usuarios gestionan su portfolio"
    ON portfolio FOR ALL
    USING (auth.uid() = user_id);

-- Políticas para transactions
CREATE POLICY "Usuarios ven sus transacciones"
    ON transactions FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Usuarios insertan sus transacciones"
    ON transactions FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Políticas para misiones
CREATE POLICY "Usuarios ven sus misiones"
    ON user_missions FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Usuarios actualizan sus misiones"
    ON user_missions FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Usuarios insertan sus misiones"
    ON user_missions FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Políticas para logros
CREATE POLICY "Usuarios ven sus logros"
    ON user_achievements FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Usuarios actualizan sus logros"
    ON user_achievements FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Usuarios insertan sus logros"
    ON user_achievements FOR INSERT
    WITH CHECK (auth.uid() = user_id);
```

## Paso 5: Configurar Trigger para crear perfil automáticamente

```sql
-- Función para crear perfil cuando un usuario se registra
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, username, balance)
    VALUES (
        NEW.id,
        NEW.raw_user_meta_data->>'username',
        10000.00
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger que se ejecuta al crear un usuario en Auth
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

-- Función para incrementar balance (usada al completar misiones)
CREATE OR REPLACE FUNCTION public.increment_balance(user_id UUID, amount DECIMAL)
RETURNS void AS $$
BEGIN
    UPDATE public.profiles
    SET balance = balance + amount
    WHERE id = user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

## Paso 6: Crear archivo .env

En la raíz del proyecto (`InvestMate-Project/`), crea un archivo `.env`:

```env
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=tu-anon-key-aqui
```

## Paso 7: Agregar .env al .gitignore

Crea o actualiza el archivo `.gitignore` en la raíz:

```
.env
node_modules/
.DS_Store
*.log
```

## Paso 8: Instalar dependencias

```bash
cd docs
npm init -y
npm install @supabase/supabase-js
```

## Resumen de la Estructura de Tablas

```
profiles
├── id (UUID, PK) ──────┐
├── username (TEXT)     │
├── balance (DECIMAL)   │
└── created_at          │
                        │
portfolio               │
├── id (UUID, PK)       │
├── user_id (UUID, FK) ─┤
├── product_id (TEXT)   │
├── shares (DECIMAL)    │
└── invested_value      │
                        │
transactions            │
├── id (UUID, PK)       │
├── user_id (UUID, FK) ─┘
├── type (buy/sell)
└── total_value

user_missions           user_achievements
├── user_id (FK)        └── user_id (FK)
└── completed (BOOL)        └── unlocked (BOOL)
```

## Siguientes Pasos

Una vez configurado Supabase, actualizaremos el código JavaScript para:
1. Reemplazar `localStorage` con llamadas a Supabase
2. Usar Supabase Auth para login/signup
3. Hacer queries en tiempo real para el portfolio
4. Sincronizar misiones y logros

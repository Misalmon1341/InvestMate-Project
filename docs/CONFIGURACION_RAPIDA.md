# 🚀 Configuración Rápida - Invesmate con Supabase

## Opción A: Usar con localStorage (Sin configuración)

La aplicación funciona **inmediatamente** sin necesidad de Supabase. Ideal para:
- Desarrollo inicial
- Pruebas rápidas
- Demostraciones

**Solo abre `docs/index.html` en tu navegador.**

---

## Opción B: Conectar a Supabase (Recomendado para producción)

### Paso 1: Crear proyecto en Supabase

1. Ve a https://supabase.com
2. Inicia sesión (GitHub, Google o email)
3. Click en **"New Project"**
4. Configura:
   - **Name**: `invesmate`
   - **Password**: Guárdala en un gestor de contraseñas
   - **Region**: Elige la más cercana

### Paso 2: Ejecutar SQL en Supabase

1. En tu proyecto, ve a **SQL Editor** (barra lateral)
2. Click en **"New Query"**
3. Copia y pega TODO el contenido de `SUPABASE_SETUP.md`
4. Click en **"Run"**

### Paso 3: Configurar credenciales en el navegador

Abre la consola del navegador (F12) y ejecuta:

```javascript
// Reemplaza con tus datos de Supabase
localStorage.setItem('supabase_url', 'https://TU-PROYECTO.supabase.co');
localStorage.setItem('supabase_anon_key', 'eyJhbG...TU-CLAVE-LARGA...');
```

**¿Dónde encontrar las credenciales?**
- En Supabase: **Settings** → **API**
- Copia **Project URL** y **anon/public key**

### Paso 4: Instalar dependencias (opcional, para Vite)

```bash
cd docs
npm install
```

### Paso 5: Ejecutar la aplicación

```bash
# Con Vite (recomendado para desarrollo)
npm run dev

# O con http-server simple
npm run serve
```

O simplemente abre `docs/index.html` en tu navegador.

---

## Verificación

Para verificar que Supabase está conectado:

1. Abre la app en el navegador
2. Abre la consola (F12)
3. Deberías ver: `✅ Supabase conectado` en lugar de `⚠️ Supabase no configurado`

---

## Estructura de Archivos

```
InvestMate-Project/
├── docs/
│   ├── index.html              # Punto de entrada
│   ├── css/
│   │   └── styles.css          # Estilos mobile-first
│   ├── js/
│   │   ├── main.js             # Lógica principal (con fallback local)
│   │   ├── supabase-client.js  # Cliente de Supabase
│   │   ├── auth-service.js     # Autenticación
│   │   ├── portfolio-service.js # Gestión de portfolio
│   │   └── missions-service.js # Misiones y logros
│   ├── manifest.json           # PWA manifest
│   ├── package.json            # Dependencias
│   ├── vite.config.js          # Configuración Vite
│   ├── SUPABASE_SETUP.md       # SQL completo para DB
│   └── CONFIGURACION_RAPIDA.md # Esta guía
├── Invesmate.md                # Documentación original
├── CLAUDE.md                   # Guía para Claude Code
└── .env                        # Variables de entorno (NO COMMIT)
```

---

## Solución de Problemas

### Error: "Credenciales incorrectas"
- Verifica que el SQL se ejecutó correctamente
- Revisa que las credenciales en localStorage sean correctas
- Los usuarios se crean con email `username@invesmate.local`

### Error: "Row Level Security policy violation"
- Las políticas RLS están funcionando (cada usuario solo ve sus datos)
- Asegúrate de estar autenticado con Supabase Auth

### Error: "Table does not exist"
- Ejecuta el script SQL en `SUPABASE_SETUP.md`
- Verifica que el proyecto se creó correctamente

---

## Siguientes Pasos

1. **Personaliza la paleta de colores** en `css/styles.css`
2. **Agrega más productos** en `js/main.js` (array `products`)
3. **Crea más misiones** en `js/missions-service.js`
4. **Implementa service worker** para soporte offline completo

## Recursos

- [Documentación de Supabase](https://supabase.com/docs)
- [Supabase Auth](https://supabase.com/docs/guides/auth)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)

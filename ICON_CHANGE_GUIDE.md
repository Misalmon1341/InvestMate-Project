# Guía para Cambiar Iconos en Invesmate

Este documento proporciona instrucciones para reemplazar los iconos emoji actuales por iconos SVG de la carpeta `/docs/img/`.

## Estado Actual de los Iconos

Actualmente, la aplicación usa emojis Unicode como iconos en todo el HTML. Por ejemplo:
- 📈 para acciones
- 💰 para ETFs/cripto
- 🏆 para misiones
- 📚 para aprendizaje
- 👤 para perfil
- etc.

Estos se encuentran en elementos como:
```html
<span class="feature-icon">📈</span>
<span class="icon">👤</span>
<span class="menu-icon">📊</span>
```

## Estructura de Iconos Disponibles

La carpeta `/docs/img/` contiene:
```
docs/
└── img/
    ├── boxicons-SVG1/
    │   └── svgs/
    │       ├── basic/
    │       │   ├── regular/
    │       │   └── bold/
    │       ├── bxs/
    │       │   ├── regular/
    │       │   └── bold/
    │       └── bx/
    │           ├── regular/
    │           └── bold/
    └── boxicons-SVG2/
        └── svgs/
            ├── basic/
            │   ├── regular/
            │   └── bold/
            ├── bxs/
            │   ├── regular/
            │   └── bold/
            └── bx/
                ├── regular/
                └── bold/
```

## Métodos para Cambiar los Iconos

### Método 1: Usando etiquetas <img> (Recomendado)

Reemplazar los spans de emoji con etiquetas `<img>` que apunten a los archivos SVG:

```html
<!-- Antes -->
<span class="feature-icon">📈</span>

<!-- Después -->
<img src="../img/boxicons-SVG1/svgs/basic/regular/trending-up.svg" alt="Icono de tendencia" class="feature-icon">
```

### Método 2: Usando SVG como fondo en CSS

Definir los iconos como imágenes de fondo en CSS:

```css
.feature-icon-trending {
  width: 24px;
  height: 24px;
  background-image: url('../img/boxicons-SVG1/svgs/basic/regular/trending-up.svg');
  background-size: contain;
  background-repeat: no-repeat;
  display: inline-block;
}
```

```html
<span class="feature-icon feature-icon-trending"></span>
```

### Método 3: Inline SVG (para mejor rendimiento)

Copiar el contenido SVG directamente en el HTML:

```html
<!-- Antes -->
<span class="feature-icon">📈</span>

<!-- Después -->
<svg class="feature-icon" width="24" height="24" viewBox="0 0 24 24">
  <!-- Contenido del SVG aquí -->
</svg>
```

## Pasos para Implementar el Cambio

1. **Selecciona los iconos apropiados** de la carpeta `/docs/img/boxicons-SVG1/svgs/`

2. **Decide el método de implementación** (recomendado: método 1 con <img>)

3. **Actualiza el HTML** reemplazando cada emoji por su equivalente SVG

4. **Ajusta los estilos CSS** si es necesario para tamaño y espaciado

5. **Prueba la aplicación** para asegurar que todos los iconos se muestran correctamente

## Mapeo Sugerido de Iconos

| Emoji Actual | Significado | Icono SVG Sugerido | Ruta |
|--------------|-------------|-------------------|------|
| 📈 | Acciones/Tendencia | trending-up | boxicons-SVG1/svgs/basic/regular/trending-up.svg |
| 💰 | Dinero/Inversión | money | boxicons-SVG1/svgs/basic/regular/money.svg |
| 🏆 | Logros/Misiones | trophy | boxicons-SVG1/svgs/basic/regular/trophy.svg |
| 📚 | Aprendizaje/Educación | book | boxicons-SVG1/svgs/basic/regular/book.svg |
| 👤 | Perfil/Usuario | user | boxicons-SVG1/svgs/basic/regular/user.svg |
| 📊 | Invertir/Gráficos | bar-chart | boxicons-SVG1/svgs/basic/regular/bar-chart-2.svg |
| 🎯 | Misiones/Objetivo | target | boxicons-SVG1/svgs/basic/regular/target.svg |
| 💼 | Carter/Portafolio | briefcase | boxicons-SVG1/svgs/basic/regular/briefcase.svg |
| 🛒 | Productos/Compra | cart | boxicons-SVG1/svgs/basic/regular/cart.svg |

## Ejemplos de Implementación

### En index.html - Pantalla de Introducción
```html
<!-- Antes -->
<div class="feature-item">
  <span class="feature-icon">📈</span>
  <span>Compra y vende acciones</span>
</div>

<!-- Después -->
<div class="feature-item">
  <img src="../img/boxicons-SVG1/svgs/basic/regular/trending-up.svg" alt="Icono de acciones" class="feature-icon">
  <span>Compra y vende acciones</span>
</div>
```

### En index.html - Menú Principal
```html
<!-- Antes -->
<button class="menu-item menu-invest" onclick="app.navigate('invest-menu-screen')">
  <span class="menu-icon">📊</span>
  <span class="menu-label">Invertir</span>
</button>

<!-- Después -->
<button class="menu-item menu-invest" onclick="app.navigate('invest-menu-screen')">
  <img src="../img/boxicons-SVG1/svgs/basic/regular/bar-chart-2.svg" alt="Icono de invertir" class="menu-icon">
  <span class="menu-label">Invertir</span>
</button>
```

### Ajustes CSS Sugeridos
```css
.feature-icon,
.menu-icon,
.invest-icon,
.avatar-icon,
.empty-icon,
.reward-icon {
  width: 24px;
  height: 24px;
  display: inline-block;
}

/* Ajustar márgenes si es necesario */
.feature-icon {
  margin-right: 8px;
}
```

## Verificación

Después de hacer los cambios:
1. Abrir `docs/index.html` en un navegador
2. Verificar que todos los iconos se muestren correctamente
3. Asegurarse de que no haya enlaces rotos (revisar consola del desarrollador)
4. Probar en diferentes tamaños de pantalla para asegurar responsividad

## Notas Importantes

1. Todas las rutas en el HTML deben ser relativas desde la ubicación del archivo
2. El atributo `alt` es importante para accesibilidad
3. Mantener las clases CSS existentes para preservar estilos y funcionalidad
4. Considerar crear un sprite de SVG o usar un sistema de iconos para mejor rendimiento en producción
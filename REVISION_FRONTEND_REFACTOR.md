# Revisión Frontend - Mejoras y Refactor (User/Super_User Dashboard)

> Análisis de lógica, modales, tooltips, responsive y calidad de código.

---

## 1. Crítico: Lógica y bugs

### 1.1 EnhancedTable - Paginación incorrecta
**Problema:** La paginación usa `pagination.total` (del servidor/datos crudos) pero los datos mostrados vienen de `filteredData` (filtrados en cliente). Si filtras 50 de 100 registros, la UI sigue mostrando 10 páginas en vez de 5.

**Archivo:** `components/ui/EnhancedTable.tsx`

**Fix:** Usar `filteredData.length` para el total de páginas en lugar de `pagination.total`:
- Línea 325-341: Los botones de paginación deben usar `Math.ceil(filteredData.length / pagination.pageSize)`
- El texto "Mostrando X a Y de Z" ya usa `filteredData.length` ✓

### 1.2 EnhancedTable - Key en filas
**Problema:** `key={record.id || rowIndex}` — el modelo Ganado usa `_id`, no `id`. Todas las filas caen en `rowIndex`, lo que puede causar re-renders innecesarios o keys duplicados si hay paginación.

**Fix:** Usar `record._id || record.id || rowIndex` para soportar ambos formatos.

### 1.3 Ganado page - pagination.onChange
**Problema:** `onChange: setCurrentPage` — la firma esperada es `(page: number, pageSize: number) => void`. Pasa, pero si en el futuro se usa `setPageSize`, habría que pasar: `(page, size) => { setCurrentPage(page); setPageSize(size) }`.

**Recomendación:** Usar callback explícito para claridad.

### 1.4 SubuserModal - Inferencia de rol
**Problema:** `subuser.permisos.includes('administrativo')` — en el backend `permisos` es `Record<string, string[]>` (ej: `{ ganado: ['read','write'] }`), no un array. El tipo `Subuser.permisos: string[]` en frontend no coincide con el API.

**Recomendación:** El backend debería exponer `rol` o `profile` en la respuesta de subusuarios. Si no, ajustar el mapeo según la estructura real del API.

---

## 2. Modales

### 2.1 Modal base
- ✅ Escape para cerrar
- ✅ Backdrop click cierra
- ✅ `overflow: hidden` en body
- ⚠️ En móvil: `max-h-[90vh]` está bien; revisar que el contenido con mucho scroll sea usable

### 2.2 ConfirmModal durante loading
**Problema:** Con `loading=true` el usuario puede cerrar con backdrop o Escape. Si la acción es destructiva (eliminar), conviene bloquear el cierre mientras carga.

**Recomendación:** En `ConfirmModal`, cuando `loading` sea true:
- No llamar `onClose` en backdrop click
- Opcional: no cerrar con Escape

### 2.3 Modales de formulario (Ganado, Cultivo, etc.)
- ✅ Reset de formulario en `useEffect` al abrir/cerrar
- ⚠️ GanadoModal: el `textarea` de observaciones no usa el componente `TextArea` (inconsistencia)
- ⚠️ Falta feedback al usuario cuando hay error en `onSave` y el modal no se cierra — ya se hace `throw error` para no cerrar ✓

---

## 3. Tooltips

### 3.1 Estado actual
- Solo `title` nativo en botones de acciones (Ver, Editar, Eliminar) en EnhancedTable
- No existe un componente `Tooltip` reutilizable

### 3.2 Recomendaciones
1. Crear componente `Tooltip` (CSS puro o lib como Radix/Headless) para iconos y botones
2. Añadir tooltips a:
   - Botones de refresh, export
   - StatsCard (qué significa cada métrica)
   - Iconos de estado en tablas
   - Botón "Agregar" en cada página

---

## 4. Responsive

### 4.1 Layout
- ✅ Sidebar fija en desktop (`lg:fixed`), drawer en móvil
- ✅ `p-4` en modal para que no llegue a los bordes en móvil
- ✅ Grid con `grid-cols-1 md:grid-cols-2/4` en varias páginas

### 4.2 Tablas
- ✅ `overflow-x-auto` en la tabla
- ⚠️ En móvil, tablas con muchas columnas serán incómodas. Opciones:
  - Cards en lugar de tabla en vista móvil
  - Columnas prioritarias y resto en "Ver más"

### 4.3 Formularios en modales
- ✅ `grid-cols-1 md:grid-cols-2` en GanadoModal
- ⚠️ GanadoModal con mucha información: en móvil el scroll dentro del modal debe ser fluido (ya tiene `max-h-[calc(90vh-120px)] overflow-y-auto`)

### 4.4 Touch
- ⚠️ Botones de acción en tabla (Eye, Pencil, Trash): `p-1` puede ser pequeño para touch. Recomendación: `min-h-[44px] min-w-[44px]` o `p-2` para cumplir ~44px de área táctil
- ⚠️ CustomSelect: el dropdown en móvil puede quedar cortado si está cerca del borde inferior. Considerar `position: fixed` o scroll del contenedor

### 4.5 Toast
- `fixed top-4 right-4` — en móvil puede tapar contenido. Considerar `top-auto bottom-4` en viewport pequeño o stack desde abajo

---

## 5. Accesibilidad

- ⚠️ Botones de acción sin `aria-label` (solo `title`)
- ⚠️ Modal: asegurar `aria-modal="true"` y `role="dialog"`
- ⚠️ Focus trap en modales: al abrir, el foco debería ir al primer campo; al cerrar, volver al trigger
- ✅ Labels en inputs

---

## 6. Otros ajustes

### 6.1 Código comentado / offline
- Hooks de ganado y otros tienen bastante código comentado de offline. Opciones:
  - Mover a archivo `*.offline.ts` o feature flag
  - O eliminarlo si no se usará pronto

### 6.2 Console.log
- Dashboard: `console.log` de debug en useEffect. Eliminar en producción.

### 6.3 Tipos
- `handleInputChange` en GanadoModal usa `value: any`. Usar tipo más específico.
- Verificar que los tipos de respuesta del API coincidan con los tipos del frontend (ej. `GanadoResponse`, `Subuser.permisos`).

### 6.4 Ruta `/auth/forgot-password`
- El link existe en login pero hay que confirmar si la página está implementada.

---

## 7. Checklist de mejoras (prioridad)

| # | Mejora | Prioridad | Esfuerzo |
|---|--------|-----------|----------|
| 1 | Corregir paginación EnhancedTable (usar filteredData.length) | Alta | Bajo |
| 2 | Key en EnhancedTable: record._id \|\| record.id | Alta | Bajo |
| 3 | ConfirmModal: evitar cerrar con backdrop durante loading | Media | Bajo |
| 4 | Área táctil mínima 44px en botones de acción | Media | Bajo |
| 5 | Componente Tooltip reutilizable | Media | Medio |
| 6 | Eliminar console.log de producción | Baja | Bajo |
| 7 | Limpiar/extraer código offline comentado | Baja | Medio |
| 8 | Ajuste Subuser.permisos según API real | Alta (si hay bugs) | Medio |
| 9 | Tabla responsive: cards en móvil o columnas prioritarias | Media | Alto |
| 10 | Focus trap y aria en modales | Media | Medio |

---

## 8. Resumen

**Fortalezas:**
- Componentes UI bien estructurados (Modal, Button, Input, CustomSelect)
- Uso consistente de Tailwind y animaciones
- ProtectedRoute y AuthLayout correctos
- Toast funcional

**Puntos a mejorar:**
- Lógica de paginación en EnhancedTable
- Keys estables en listas
- Responsive y touch en botones pequeños
- Tooltips y accesibilidad en modales
- Consistencia tipos frontend/backend

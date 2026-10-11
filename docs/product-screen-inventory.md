# Inventario de capturas del producto — CLARVO admin

Capturas reales tomadas el 2026-10-09 contra `http://localhost:8088/admin`
(instancia de pruebas, usuario `admin`/`admin`), guardadas en `capClar/`.
Ver master prompt sección 2 — este archivo registra qué se reconstruyó,
qué se dejó pendiente y de dónde sale cada dato.

| Archivo | Módulo | Elementos visibles | Estado |
|---|---|---|---|
| `01-inicio.jpg` | Dashboard / Inicio | Ventas hoy, Gastos hoy, Movs. inventario, listas de ventas/gastos/movimientos recientes | No reconstruido — Inicio no es el foco del hero/demo |
| `02-ventas.jpg` | Ventas | Tabla de ventas con filtros, estado de pago | No reconstruido |
| `03-cuentas-por-cobrar.jpg` | Cuentas por cobrar | KPIs (por cobrar, vencidas, por vencer, cobrado), antigüedad de saldos (4 segmentos con % exacto), donut cobranza del mes | **Reconstruido** — `AnimatedDonutChart` usa "Antigüedad de saldos" (4/4 segmentos confirmados, sin discrepancias) |
| `04-gastos.jpg` | Gastos | KPIs de gasto del mes, con/sin factura, tabla | Parcial — KPIs reutilizados en Resumen financiero |
| `05-inventarios.jpg` | Inventarios | Valor de inventario, productos activos, riesgo/control | No reconstruido |
| `06-resumen-financiero.jpg` | Resumen financiero | KPIs (Total facturado, Ventas sin facturar, Balance, Total gastos), gráfica de línea "Utilidad neta mensual", gráfica "Proyección de ventas" | **Reconstruido** — `MetricCard` ×4 + `AnimatedLineChart` ×1 |
| `07–10-resumen-financiero-scroll*.jpg` | Resumen financiero (scroll) | Ventas facturadas vs sin facturar (donut), Cobranza del mes, Top proveedores de gasto, Ventas vs Facturado vs Gastos (barras), Utilidad neta del mes (línea de equilibrio), Distribución de gastos por categoría (donut) | No reconstruido todavía — candidato para una siguiente pasada |
| `11-reportes-cortes.jpg` | Reportes → Cortes | Historial de cortes de venta por rango | No reconstruido |
| `12-usuarios.jpg` | Usuarios | Tabla de usuarios, perfiles, contacto | No reconstruido (contiene correos/teléfonos — aunque son datos de prueba `@example.com`, se excluye por default) |
| `13-promociones.jpg` | Promociones | Formulario de broadcast, historial de promociones activas | No reconstruido |

## Componentes reconstruidos (Segmento 3)

- `src/components/dashboard/MetricCard.tsx` — tarjeta de KPI (label, valor, delta), HTML/CSS real.
- `src/components/dashboard/AnimatedLineChart.tsx` — SVG, trazado progresivo animado (GSAP), eje de meses.
- `src/components/dashboard/AnimatedDonutChart.tsx` — SVG, arcos animados por categoría.
- `src/components/dashboard/DashboardScreen.tsx` — compone los anteriores en el layout de "Resumen financiero", en variante `full` (sección demo) y `compact` (pantallas 3D del hero).
- `src/data/dashboardDemo.ts` — todos los números con su fuente (archivo + sección de este inventario), separados de la presentación.

## Datos o detalles pendientes de confirmar

- Las cifras de `01-inicio.jpg`, `02`, `04`, `05`, `11`, `12`, `13` no se usaron — quedan fuera del alcance de esta reconstrucción (solo Resumen financiero + Cuentas por cobrar).
- "Utilidad neta mensual" (`06-resumen-financiero.jpg`): la gráfica de línea original tiene 6 meses (May–Oct) pero solo 3 puntos traen cifra legible en la captura (May $347.5k, Sep $462.1k "récord", Oct $33.1k). Jun/Jul/Ago no se inventaron — el gráfico reconstruido solo traza los 3 puntos confirmados, documentado en `dashboardDemo.ts`.
- "Proyección de ventas" (misma captura) no se reconstruyó — mismos huecos de datos (solo 3 de 6 meses legibles) y se priorizó profundidad en menos gráficas antes que cobertura superficial de todas.
- Las barras "Ventas vs Facturado vs Gastos" (6 meses) y la "línea de equilibrio" de `08-09` no se reconstruyeron todavía — candidatas para una siguiente pasada si se necesita más profundidad en la sección demo.

## Arquitectura para capturas futuras

Añadir una captura nueva no requiere tocar el layout de `DashboardDemoSection`
ni de la escena 3D: se agrega una fila a `src/data/dashboardDemo.ts` con su
fuente citada, y si amerita un tipo de gráfica nuevo, un componente más en
`src/components/dashboard/`. `DashboardScreen` solo orquesta lo que exista.

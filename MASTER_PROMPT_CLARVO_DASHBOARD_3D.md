# MASTER PROMPT PARA CLAUDE CODE
## CLARVO — Dashboard flotante 3D premium

Actúa como un equipo senior de producto digital compuesto por:
- Creative Developer especializado en experiencias web 3D de alta calidad.
- Frontend Engineer experto en React, TypeScript, Three.js / React Three Fiber y GSAP.
- Diseñador UI/UX especializado en SaaS, landing pages de conversión y sistemas de diseño.
- Especialista en visualización de datos, gráficos SVG/Canvas y animaciones de interfaz.
- Ingeniero de rendimiento web, accesibilidad, SEO técnico y pruebas.

Tu misión es **construir desde cero el sitio web de CLARVO tomando `Site.png` como referencia visual principal**, con una experiencia de producto premium basada en un **dashboard flotante 3D**. Más adelante recibirás capturas reales de las pantallas de CLARVO: debes diseñar desde el inicio una arquitectura que permita incorporarlas y reconstruir fielmente sus interfaces y gráficas como componentes reales, interactivos y animables.

No te limites a entregar un plan, una maqueta estática o recomendaciones. Inspecciona los archivos disponibles, implementa el sitio, ejecuta las pruebas posibles y documenta cómo correrlo.

---

# 1. OBJETIVO DE PRODUCTO

Construir una landing page SaaS que transmita:
- Control y organización del negocio.
- Claridad financiera y operativa.
- Facilidad de uso para emprendedores.
- Confianza, profesionalismo y tecnología accesible.

La marca es:

**CLARVO — tu negocio bajo control**

La referencia `Site.png` muestra una landing page larga con:
1. Encabezado y hero principal.
2. Laptop y smartphone mostrando el producto.
3. Sección de problemas cotidianos del emprendedor.
4. Sección de propuesta de valor.
5. Grid de funcionalidades.
6. Planes y precios.
7. Testimonios.
8. Llamada a la acción y footer.

La implementación solicitada se centra especialmente en:
- **Zona A: hero principal**, con el dashboard flotante 3D en la laptop y el smartphone.
- **Zona B: una sección adicional de demostración del producto**, que profundice la experiencia del dashboard y explique visualmente su valor.

Conserva la estructura, contenido, jerarquía, colores y estilo general de `Site.png`. No rediseñes arbitrariamente las demás secciones. Si una sección no tiene contenido suficiente para una implementación fiel, crea una versión coherente con la referencia sin inventar funcionalidades ni afirmaciones comerciales.

---

# 2. ARCHIVOS DE REFERENCIA Y FLUJO DE CAPTURAS

## Archivo disponible inicialmente

- `Site.png`: referencia visual del sitio completo. Analízala antes de escribir código.
- Capturas reales de pantallas del producto: se proporcionarán posteriormente.

Primero inspecciona el directorio del proyecto y localiza `Site.png`. No supongas una ruta específica sin comprobarla. Si el archivo no está disponible en el directorio de trabajo, informa claramente qué archivo necesitas y continúa con el trabajo no bloqueado.

## Cuando se proporcionen las capturas de CLARVO

Para cada captura:

1. Identifica qué pantalla o módulo representa.
2. Registra la estructura, distribución, tipografía, colores, etiquetas, cifras y elementos visibles.
3. Separa los elementos que deben ser fieles a la captura de aquellos que pueden animarse.
4. Reconstruye la interfaz mediante componentes HTML/CSS reales.
5. Reconstruye gráficas con SVG, Canvas o una biblioteca de gráficos apropiada.
6. Conserva todos los valores, etiquetas y relaciones de datos visibles; no los alteres para mejorar la estética.
7. Documenta cualquier texto ilegible o dato ambiguo. No lo adivines.
8. No uses la captura completa como una imagen plana para simular que el dashboard es funcional.
9. No extraigas ni reutilices datos personales que pudieran aparecer en capturas: utiliza datos ficticios solo si se autoriza explícitamente y márcalos como demostrativos. En ausencia de autorización, reproduce únicamente los datos no sensibles y necesarios o utiliza placeholders claramente identificados.

Crea un registro de referencias, por ejemplo `docs/product-screen-inventory.md`, con:
- Nombre de archivo.
- Módulo identificado.
- Elementos visibles.
- Componentes que se deben reconstruir.
- Gráficas que se deben implementar.
- Datos o detalles pendientes de confirmar.

Diseña la arquitectura para que añadir capturas nuevas no requiera reescribir la landing page.

---

# 3. DIRECCIÓN VISUAL Y RESPETO DE MARCA

Usa `Site.png` como fuente de verdad visual.

## Paleta visual de referencia

- Azul marino profundo como color principal de fondos oscuros.
- Azul eléctrico y cian para acentos, CTA, iconografía y elementos destacados.
- Blanco y tonos azul-gris claros para secciones de contenido.
- Texto de alto contraste y jerarquía tipográfica clara.

La imagen contiene el logotipo CLARVO, la frase “Tu negocio bajo control”, una interfaz en laptop y otra en smartphone. Reproduce el logotipo usando el recurso de marca disponible, si existe. No recrees un logotipo diferente ni sustituyas sus proporciones por conveniencia.

Extrae los colores aproximados de `Site.png` y conviértelos en tokens de diseño documentados. No afirmes que los valores aproximados son códigos oficiales de marca.

## Principios de diseño

- SaaS premium, limpio, confiable y moderno.
- Impacto visual sin sacrificar legibilidad.
- Contraste entre fondos azul marino y áreas luminosas.
- Espaciado generoso y composición equilibrada.
- Animación con propósito: debe destacar el producto, no competir con el mensaje.
- No abusar de glow, neón, partículas, blur o efectos de cristal.
- No usar una plantilla genérica que no guarde relación con la referencia.
- No estirar ni deformar imágenes, logos, capturas o modelos.
- No convertir todo el sitio en una escena 3D: el 3D debe enfatizar el producto.

---

# 4. EXPERIENCIA 3D DEL HERO

Construye una composición visual con una laptop como elemento principal y un smartphone secundario, inspirada en la referencia de `Site.png`.

## Laptop

- Mostrar la interfaz real reconstruida de CLARVO dentro de la pantalla.
- Mantener proporciones creíbles de dispositivo.
- Crear un marco, bisel, pantalla y cuerpo con perspectiva realista.
- Aplicar profundidad, iluminación y sombras sutiles.
- Evitar reflejos que dificulten la lectura de la interfaz.
- No deformar ni recortar los datos importantes del dashboard.
- El contenido de la pantalla debe permanecer nítido en los tamaños de visualización habituales.

## Smartphone

- Mostrar una versión móvil coherente con las capturas reales.
- No limitarse a encoger el dashboard de escritorio.
- Si no se ha proporcionado una captura móvil, adaptar la estructura conocida de forma razonable y documentar las decisiones; no inventar módulos o funciones.
- Respetar la relación de aspecto y los límites físicos del dispositivo.

## Profundidad y composición

La escena debe incluir:
- Perspectiva 3D controlada.
- Separación visual entre laptop, smartphone y fondo.
- Sombras suaves y contacto visual creíble.
- Iluminación coherente con la paleta CLARVO.
- Profundidad sutil entre elementos secundarios y principales.
- Composición que deje libre el espacio para el título, texto y CTA de la portada.

La animación nunca debe tapar el mensaje principal ni los botones. En pantallas pequeñas, reorganiza la composición para mantener el contenido legible.

---

# 5. SISTEMA DE ANIMACIÓN

Implementa una combinación refinada de tres comportamientos:

## A. Flotación continua

- Movimiento vertical sutil, lento y orgánico de la composición.
- Rotación muy ligera, sin sensación de mareo.
- Movimiento con easing suave.
- Laptop y smartphone con variaciones mínimas para sugerir profundidad.
- Evitar movimientos aleatorios agresivos o continuos que distraigan.

## B. Respuesta al cursor

- Parallax limitado y suavizado según la posición del cursor.
- Cambios discretos de perspectiva y rotación.
- La escena debe regresar gradualmente a su posición de reposo al retirar el cursor.
- No usar el cursor como único método de interacción.
- No permitir que la interacción desplace o tape texto, enlaces o CTA.

## C. Animación coordinada con scroll

Al desplazarse por la página:
- La composición puede modificar suavemente su posición, escala y perspectiva.
- Los elementos pueden cambiar de énfasis para conducir la atención desde el hero hasta la segunda sección de producto.
- El dashboard debe conservar legibilidad durante toda la transición.
- La segunda sección puede presentar una vista ampliada o una composición de tarjetas del producto, siempre basada en las pantallas disponibles.
- Evita que el scroll quede bloqueado o secuestrado.
- No añadas transiciones obligatorias que retrasen el acceso al contenido.

## Criterio de calidad

La experiencia debe sentirse deliberada y premium, no como un objeto girando sin propósito. Usa la menor cantidad de movimiento necesaria para conseguir profundidad y sofisticación.

---

# 6. SEGUNDA SECCIÓN: DEMOSTRACIÓN DEL PRODUCTO

Crea una sección inmediatamente después del hero o en el lugar que mejor corresponda al diseño de referencia, dedicada a demostrar visualmente el producto.

Objetivos:
- Dar mayor espacio y legibilidad al dashboard.
- Explicar de manera visual cómo la interfaz ayuda a centralizar la información.
- Mostrar componentes reales reconstruidos desde las capturas que se proporcionen.
- Dar continuidad visual a la composición 3D del hero.

La sección puede presentar una composición de tarjetas o una vista ampliada de la interfaz, con animaciones escalonadas y transiciones sutiles.

No inventes una secuencia de trabajo ni asegures que CLARVO automatiza un proceso que no esté documentado en las referencias. Si no se han proporcionado suficientes pantallas, construye el esqueleto visual y deja los módulos faltantes identificados en la documentación.

La segunda sección debe ser útil también para quien navega sin animaciones o en un dispositivo de bajo rendimiento.

---

# 7. RECONSTRUCCIÓN DE GRÁFICAS ANIMABLES

Las capturas reales se entregarán después. Prepara una arquitectura que permita reconstruir las gráficas sin cambiar el layout del sitio.

## Regla obligatoria

**Las gráficas no deben ser imágenes estáticas.** Deben ser componentes reales que representen los datos y permitan animar sus elementos.

Selecciona la técnica adecuada para cada gráfica:

### SVG
Preferible para:
- Gráficas de líneas y áreas.
- Barras.
- Indicadores circulares.
- Líneas, puntos, ejes y etiquetas.
- Animaciones precisas de trazos, rellenos y marcadores.

### Canvas
Utilízalo solo cuando el volumen de elementos o la naturaleza de la visualización lo justifique. Asegura que los datos esenciales también estén disponibles de manera accesible.

### Biblioteca de gráficas
Puedes usar una biblioteca compatible con la arquitectura elegida si facilita una implementación fiel, responsive y mantenible. No añadas una dependencia pesada solo por conveniencia.

## Animaciones permitidas, cuando correspondan a la gráfica real

- Trazado progresivo de una línea.
- Entrada secuencial de barras.
- Aparición gradual de puntos y marcadores.
- Transición suave de valores hacia el dato final real.
- Revelado de áreas bajo una curva.
- Resaltado discreto de un punto relevante.
- Entrada coordinada de tarjetas e indicadores.

No alteres los datos para que la gráfica parezca más espectacular. No inventes tendencias, porcentajes, ventas, ingresos, gastos ni resultados.

## Separación entre datos y presentación

Cada gráfica debe recibir sus datos mediante props o un módulo de datos separado. Evita cifras duplicadas en múltiples componentes.

Documenta:
- Fuente de cada dato.
- Formato y unidad.
- Etiquetas y periodos.
- Estado de carga o ausencia de datos.
- Qué animaciones se ejecutan y cuándo.

Si la captura no permite determinar un valor, conserva un placeholder explícito en lugar de inventarlo.

---

# 8. ARQUITECTURA TÉCNICA

Antes de elegir las tecnologías, evalúa la complejidad de la experiencia y las necesidades del proyecto.

Si no existe una base de código, selecciona una arquitectura moderna, mantenible y apropiada para una landing page SaaS. Una opción inicial razonable es:
- React.
- TypeScript.
- Vite o un framework con renderizado adecuado para SEO, según las necesidades reales.
- CSS modular, CSS Modules o una estrategia equivalente.
- Three.js con React Three Fiber si el proyecto React lo justifica.
- GSAP con ScrollTrigger para las animaciones coordinadas con scroll.
- SVG para gráficas vectoriales cuando sea suficiente.

No es obligatorio utilizar todas estas tecnologías. Justifica las decisiones y evita dependencias innecesarias.

## Separación recomendada de componentes

Adapta los nombres a la arquitectura elegida, pero mantén responsabilidades claras:

- `SiteHeader`
- `HeroSection`
- `FloatingDashboardScene`
- `LaptopFrame`
- `SmartphoneFrame`
- `DashboardScreen`
- `DashboardDemoSection`
- `MetricCard`
- `AnimatedLineChart`
- `AnimatedBarChart`
- `FeatureSection`
- `PricingSection`
- `TestimonialsSection`
- `FinalCTA`
- `SiteFooter`
- `MotionPreferences`

Mantén las pantallas del producto desacopladas de la escena 3D. El mismo componente de interfaz debe poder renderizarse en modo plano o integrarse dentro de la composición de la laptop.

## Capas de renderizado

Decide si la escena 3D debe utilizar:
1. Modelos 3D de dispositivos con la interfaz colocada sobre la pantalla.
2. Dispositivos construidos con geometría 3D sencilla.
3. Una composición 2.5D con elementos HTML/CSS y perspectiva.

Elige la opción que alcance la calidad deseada con un coste de rendimiento razonable. No uses un modelo 3D complejo si una solución más ligera ofrece el mismo resultado.

Si utilizas modelos GLB/GLTF, documenta sus fuentes, licencias, peso y proceso de optimización. No descargues ni uses recursos con licencia desconocida.

---

# 9. RESPONSIVE Y RENDIMIENTO

El sitio debe funcionar en:
- Escritorio amplio.
- Laptop.
- Tablet.
- Smartphone.

## Escritorio
- Escena 3D completa.
- Interacciones de cursor.
- Flotación y scroll coordinados.
- Dashboard nítido y legible.

## Tablet
- Reducir profundidad y amplitud del movimiento.
- Evitar superposiciones entre dispositivos y textos.
- Mantener controles accesibles.

## Móvil
- Priorizar el contenido, el CTA y la legibilidad.
- Adaptar la composición a una columna cuando sea necesario.
- Reducir polígonos, resolución de renderizado y efectos costosos.
- Desactivar la respuesta al cursor, ya que no aplica.
- Reducir o simplificar la animación al detectar preferencias o limitaciones de rendimiento.
- No forzar al usuario a descargar una escena pesada para entender la propuesta de valor.

## Presupuesto de rendimiento

Establece un objetivo de rendimiento razonable y mídelo en vez de declararlo sin comprobar. Prioriza:
- Carga inicial rápida.
- Lazy loading para recursos no esenciales.
- Optimización de modelos y texturas.
- Evitar renderizado continuo cuando la escena no es visible o la pestaña no está activa, cuando sea viable.
- Limpieza de listeners, contextos y recursos gráficos.
- Evitar layout shifts.
- Cargar fuentes y recursos de forma eficiente.

No sacrifiques la estabilidad del sitio para mantener efectos decorativos.

---

# 10. ACCESIBILIDAD Y MOVIMIENTO REDUCIDO

Implementa:
- Respeto de `prefers-reduced-motion`.
- Alternativa sin movimiento intenso para la escena.
- Contraste de texto suficiente.
- Navegación por teclado.
- Estados de foco visibles.
- Botones y enlaces semánticos.
- Texto alternativo apropiado para imágenes significativas.
- Contenido esencial accesible aunque WebGL falle.
- No comunicar datos únicamente mediante color.
- No hacer que una animación sea requisito para leer la información.

Si WebGL no está disponible o falla, la página debe mostrar una composición estática o 2.5D elegante y seguir siendo completamente utilizable.

---

# 11. CONTENIDO, CTA Y REGLAS COMERCIALES

Respeta el mensaje de marca mostrado en `Site.png`:

**CLARVO — tu negocio bajo control**

Conserva los textos y los CTA visibles en la referencia siempre que sean legibles y coherentes con los recursos disponibles.

No inventes:
- Funcionalidades del producto.
- Integraciones.
- Certificaciones.
- Testimonios.
- Clientes.
- Métricas de éxito.
- Garantías.
- Datos financieros.
- Precios o condiciones comerciales distintos de los aprobados.

Si la referencia incluye precios o testimonios, puedes reproducir el contenido claramente visible en ella, pero no inventes datos ilegibles ni añadas nuevas afirmaciones.

Los CTA deben tener un destino real si existe una URL o flujo proporcionado. Si no existe, déjalos preparados de forma explícita y documenta qué información falta. No simules una contratación exitosa ni un pago real.

---

# 12. PROCESO DE TRABAJO OBLIGATORIO

Sigue este orden.

## Fase 1 — Análisis
1. Inspecciona los archivos del proyecto.
2. Localiza y analiza `Site.png`.
3. Identifica colores, secciones, tipografía, composición y elementos de marca.
4. Si existen capturas de pantallas de CLARVO, inventaría y analiza cada una.
5. Si aún no existen, prepara la arquitectura de componentes y documenta qué capturas serán necesarias.
6. Resume brevemente tus decisiones antes de implementar.

## Fase 2 — Base del sitio
1. Configura el proyecto.
2. Implementa el sistema de diseño.
3. Construye la landing page respetando la referencia.
4. Prioriza estructura semántica, responsive y contenido legible.
5. Comprueba que la página funcione antes de añadir complejidad 3D.

## Fase 3 — Interfaz real del producto
1. Reconstruye la pantalla del dashboard con componentes HTML/CSS.
2. Sustituye las gráficas estáticas por componentes SVG/Canvas apropiados.
3. Mantén los datos separados de la presentación.
4. Contrasta visualmente cada componente con las capturas de referencia.
5. Documenta los elementos que requieran aclaración.

## Fase 4 — Experiencia 3D
1. Construye la laptop y el smartphone.
2. Coloca las interfaces reconstruidas en sus pantallas.
3. Añade perspectiva, iluminación y sombras.
4. Implementa flotación continua.
5. Añade respuesta al cursor.
6. Coordina el movimiento con el scroll.
7. Construye la segunda sección demostrativa.
8. Implementa fallback sin WebGL y movimiento reducido.

## Fase 5 — Refinamiento
1. Verifica proporciones y nitidez de las interfaces.
2. Comprueba que las animaciones no oculten contenido.
3. Ajusta la experiencia en distintos tamaños de pantalla.
4. Revisa rendimiento, accesibilidad y errores de consola.
5. Elimina código muerto y dependencias innecesarias.

## Fase 6 — Pruebas y entrega
1. Ejecuta las pruebas disponibles.
2. Ejecuta lint, type-check y build si están configurados.
3. Corrige los errores detectados.
4. Comprueba rutas, navegación y CTA.
5. Verifica el fallback de la escena.
6. Entrega un resumen de archivos creados y modificados.
7. Documenta los comandos para ejecutar y compilar el sitio.
8. Indica claramente las pruebas que no se pudieron realizar.

No afirmes que una prueba se ejecutó si no la has ejecutado realmente.

---

# 13. CRITERIOS DE ACEPTACIÓN

El trabajo solo se considera terminado cuando:

- [ ] El sitio se construye desde cero y toma `Site.png` como referencia.
- [ ] La identidad visual de CLARVO se mantiene coherente.
- [ ] El hero contiene una laptop y un smartphone con proporciones creíbles.
- [ ] Las pantallas de los dispositivos se renderizan con componentes reales.
- [ ] Las capturas suministradas se reconstruyen con fidelidad visual.
- [ ] Las gráficas son componentes animables y no imágenes planas.
- [ ] Los datos coinciden con las fuentes disponibles y no se inventan.
- [ ] Hay flotación continua suave.
- [ ] El cursor produce un parallax discreto en dispositivos compatibles.
- [ ] El scroll coordina las transiciones sin bloquear la navegación.
- [ ] Existe una segunda sección demostrativa coherente con el producto.
- [ ] La experiencia se adapta a escritorio, tablet y móvil.
- [ ] Existe fallback si WebGL no está disponible.
- [ ] Se respeta `prefers-reduced-motion`.
- [ ] Los CTA y enlaces no son falsos ni simulan acciones inexistentes.
- [ ] No hay errores críticos de consola ni de compilación en las comprobaciones realizadas.
- [ ] Se documentan instalación, ejecución, compilación y limitaciones pendientes.

---

# 14. INSTRUCCIÓN FINAL

Comienza inspeccionando el proyecto y localizando `Site.png`. Después implementa el sitio siguiendo este prompt, sin detenerte en una propuesta teórica.

Cuando falten las capturas reales de las pantallas, construye el sistema y los componentes preparados para recibirlas, pero marca con claridad los módulos provisionales. Cuando te entregue las capturas, intégralas y reconstruye sus gráficas sin cambiar los datos visibles.

Toma decisiones técnicas autónomas cuando haya suficiente información. Si un detalle crítico no puede resolverse sin inventar datos, utiliza un placeholder explícito y documéntalo.

**Prioridad absoluta:** una experiencia CLARVO visualmente premium, fiel a la marca, con un dashboard 3D convincente y gráficas reales animables, sin comprometer rendimiento, accesibilidad, responsive ni veracidad del producto.

No entregues solo el código de ejemplo. Implementa el proyecto real, valida lo que puedas ejecutar y presenta un resumen honesto de los resultados.


# 16. CONFIGURACIÓN PREPARADA PARA INTEGRACIÓN FUTURA (.env)

## Alcance actual: construir únicamente el sitio comercial

En esta etapa debes construir y validar la landing page de CLARVO, su experiencia de dashboard flotante 3D y la sección demostrativa adicional. No implementes todavía el onboarding, la autenticación, el registro real, la gestión de suscripciones ni pagos.

La conexión real con la API de Hostinger y la aplicación oficial se implementará en una etapa posterior, cuando se proporcionen las direcciones y contratos definitivos.

Sin embargo, deja una estructura de configuración clara para que esos datos puedan agregarse posteriormente sin reescribir componentes ni buscar URLs dispersas por el código.

## Archivos de configuración

1. Crea `.env.example` con nombres de variables y valores de ejemplo no sensibles.
2. Crea `.env` solo si el flujo de trabajo del proyecto lo requiere y puede hacerse sin introducir secretos reales. No inventes dominios de producción.
3. Asegúrate de que `.env` esté incluido en `.gitignore` cuando corresponda.
4. Nunca elimines ni sobrescribas archivos de configuración existentes sin inspeccionarlos primero.
5. Documenta en `README.md` cómo configurar las variables para desarrollo local y producción.

Si utilizas Vite, recuerda que solo las variables con el prefijo `VITE_` quedan disponibles para el código del navegador. Son públicas y no deben contener secretos.

Variables públicas sugeridas para preparar la futura integración:

- `VITE_CLARVO_API_BASE_URL=` — URL pública base de la API, pendiente de configurar.
- `VITE_CLARVO_ONBOARDING_URL=` — URL pública del onboarding, pendiente de configurar.
- `VITE_CLARVO_APP_URL=` — URL pública de la aplicación oficial, pendiente de configurar.

Puedes cambiar estos nombres si la arquitectura elegida lo justifica, pero documenta el esquema final y úsalo de manera consistente.

No asignes endpoints, dominios ni valores ficticios que parezcan de producción. Las variables pendientes deben tener valores vacíos o placeholders inequívocos y seguros.

## Centralización de configuración

Crea un módulo de configuración centralizado, por ejemplo `src/config/publicEnv.ts`, que:
- Lea las variables de entorno disponibles.
- Valide su formato cuando tengan valor.
- Exponga valores opcionales para la futura integración.
- No haga llamadas a la API durante la carga inicial del sitio.
- No falle la landing si las variables de integración están vacías.
- Proporcione un punto único para consumir esas variables cuando la integración se implemente posteriormente.

No conectes los CTA a endpoints inventados. Mientras falten las URLs oficiales, los CTA deben tener un comportamiento de demostración honesto, como un enlace deshabilitado con una explicación, o quedar preparados con un TODO documentado. No simules registros, pagos ni accesos exitosos.

## Seguridad y GitHub Pages

La landing se publicará como sitio estático. Cualquier variable incluida en la compilación puede ser inspeccionada por visitantes desde el navegador o los archivos generados.

Por lo tanto:
- No incluyas contraseñas, claves privadas, tokens de servicio ni secretos en `.env` destinado al frontend.
- No uses variables públicas como mecanismo de autenticación.
- Los secretos de backend deberán configurarse únicamente en el entorno del servidor de Hostinger cuando se implemente la API.
- No envíes datos sensibles desde la landing en esta etapa.

## GitHub Actions y compilación

Mantén la landing compatible con GitHub Pages y configura el workflow de publicación definido en la sección de despliegue.

Ten en cuenta que GitHub Actions compila el sitio y publica los archivos estáticos. Si una variable pública debe tener un valor específico en producción, deberá estar disponible durante la compilación del workflow o mediante una configuración pública apropiada. No presupongas que el archivo `.env` local existirá en GitHub Actions.

Si la integración sigue pendiente, el build y la publicación deben funcionar aunque las tres variables anteriores estén vacías.

## Criterio de aceptación de esta etapa

- La landing completa puede ejecutarse sin configurar la API.
- La escena 3D, las gráficas y la sección demostrativa funcionan sin backend.
- Existe `.env.example` con variables públicas documentadas.
- `.env` está excluido de Git cuando corresponda.
- No hay dominios ni endpoints de producción inventados.
- La configuración futura está centralizada.
- Los CTA no simulan procesos reales aún no implementados.
- El build de producción y GitHub Actions no dependen de variables de integración todavía desconocidas.
- El README explica qué variables se completarán en la fase posterior.



# 17. SEO TÉCNICO + GEO PARA BUSCADORES Y ASISTENTES DE IA

## Objetivo

Construye la landing para que los motores de búsqueda y los sistemas de respuesta con IA puedan rastrear, comprender e interpretar correctamente la información pública y verificable de CLARVO. Aplica buenas prácticas sin prometer posiciones, indexación o recomendaciones garantizadas.

**Alcance:** esta etapa optimiza el sitio comercial estático. No construyas aquí la aplicación de suscripciones, checkout, autenticación, gestión de empresas ni lógica de pagos. El onboarding y la aplicación oficial pertenecen a los servicios externos que se conectarán en una fase posterior.

## SEO técnico

Implementa y valida, según las capacidades del framework y el alojamiento:

- Títulos SEO y meta descriptions únicos, naturales y descriptivos.
- URL canónica coherente con el dominio definitivo que se proporcione.
- `robots.txt` válido, sin bloquear accidentalmente páginas públicas.
- Sitemap XML con URLs públicas reales y canónicas.
- Open Graph y tarjetas para compartir en redes sociales.
- HTML semántico, una jerarquía de encabezados lógica y enlaces rastreables.
- Textos alternativos útiles para imágenes informativas.
- Imágenes optimizadas, tamaños explícitos y formatos modernos cuando sean apropiados.
- Buen rendimiento móvil y revisión de Core Web Vitals.
- Páginas de error y rutas compatibles con el alojamiento estático de GitHub Pages.
- Exclusión de páginas privadas, datos sensibles y rutas de onboarding que no pertenezcan a la landing.
- Evitar contenido duplicado, páginas vacías, enlaces rotos y parámetros que generen duplicados.
- Contenido principal accesible sin depender de que un rastreador ejecute una animación 3D.

No inventes un dominio canónico. Si el dominio definitivo no está confirmado, centraliza el valor como configuración pendiente y documenta qué falta para generar sitemap y canonical de producción.

## Datos estructurados

Evalúa JSON-LD válido y alineado con la información visible. Utiliza solo tipos que correspondan y propiedades verificables, por ejemplo:

- `Organization` para la organización propietaria cuando existan datos oficiales.
- `WebSite` para el sitio.
- `SoftwareApplication` para describir CLARVO si los atributos publicados pueden verificarse.
- `BreadcrumbList` si hay navegación jerárquica real.
- `Product` u `Offer` solo si la página y las reglas vigentes del buscador lo justifican y precios/condiciones están confirmados.
- `FAQPage` únicamente cuando corresponda a las directrices vigentes; no prometas resultados enriquecidos.
- `Article` para artículos editoriales con autoría y fechas reales.

Valida los datos estructurados con herramientas apropiadas. No inventes reseñas, calificaciones, disponibilidad, autores, direcciones, certificaciones, precios ni garantías. El marcado estructurado ayuda a interpretar el contenido, pero no garantiza resultados enriquecidos ni posiciones.

## GEO — Generative Engine Optimization

Prepara el contenido para que buscadores y asistentes de IA puedan entender y citar información pública de CLARVO con contexto suficiente:

- Explica de forma directa qué es CLARVO, para quién es y qué problemas ayuda a organizar.
- Utiliza nombres consistentes para marca, producto, planes y funcionalidades.
- Redacta respuestas claras a preguntas reales de compradores, sin relleno ni repetición artificial de palabras clave.
- Incluye información útil y verificable sobre funcionalidades, límites, precios y cómo empezar, cuando esos datos se hayan confirmado.
- Añade preguntas frecuentes solo si responden dudas reales y las respuestas están respaldadas por el producto.
- Mantén consistencia entre el contenido de la landing, los metadatos, datos estructurados y los archivos auxiliares.
- Evalúa `/llms.txt` como índice opcional de páginas públicas si aporta claridad; no lo presentes como requisito universal ni garantía de visibilidad.
- Documenta por separado los rastreadores relevantes, como `OAI-SearchBot`, `GPTBot`, `Googlebot` y `Bingbot`, y su propósito según la documentación oficial vigente. No confundas rastreo para búsqueda con rastreo para entrenamiento.
- Revisa también las restricciones del hosting, firewall, CDN y robots; `robots.txt` no puede superar un bloqueo del servidor.
- No publiques documentación privada, secretos, endpoints internos ni información de clientes.
- No automatices spam, enlaces comprados ni contenido masivo duplicado.

No garantices que ChatGPT, Gemini, Perplexity, Copilot ni otro sistema cite o recomiende CLARVO. La decisión final corresponde a cada plataforma.

## Contenido SEO

Utiliza español claro de México y lenguaje accesible para emprendedores. Organiza el contenido para contestar, cuando los datos estén disponibles:

1. ¿Qué es CLARVO?
2. ¿Para quién está diseñado?
3. ¿Qué problemas ayuda a organizar?
4. ¿Cómo funciona?
5. ¿Qué incluye y qué no incluye?
6. ¿Qué planes y precios existen?
7. ¿Qué limitaciones o requisitos tiene?
8. ¿Cómo puede comenzar el usuario?
9. ¿Dónde puede obtener soporte?

No presentes CLARVO como un ERP complejo ni lo describas únicamente como un portal de facturación. Respeta el posicionamiento **“CLARVO — tu negocio bajo control”**. No afirmes que CLARVO timbra CFDI ante el SAT si esa capacidad no está implementada y confirmada.

La información detallada de funcionalidades para marketing se proporcionará en un archivo adicional. Cuando se entregue, léelo completo y úsalo como fuente de verdad comercial, contrastándolo con las capturas y los datos aprobados. No inventes ni amplíes las capacidades descritas.

---

# 18. NEUROVENTAS Y PSICOLOGÍA DE DECISIÓN

Aplica principios éticos de neuroventas y psicología de decisión para mejorar la claridad, la confianza y la motivación del visitante. El objetivo es ayudar a la persona a reconocer si CLARVO le conviene, no manipularla ni explotar sus temores.

## Principios de comunicación

- **Claridad cognitiva:** explicar el valor en lenguaje sencillo, evitando tecnicismos administrativos y de software.
- **Reconocimiento del problema:** representar situaciones habituales de desorganización de un negocio solo si son relevantes y no exageradas.
- **Reducción de fricción:** hacer evidente qué ofrece el producto, cómo se empieza y cuál es el siguiente paso.
- **Beneficios antes que especificaciones:** explicar primero el resultado práctico que una función permite, sin prometer resultados económicos no demostrados.
- **Prueba visual:** usar las pantallas reales reconstruidas para mostrar el producto y reducir incertidumbre.
- **Confianza:** mostrar precios, límites, condiciones y llamadas a la acción con transparencia.
- **Carga cognitiva baja:** una idea principal por sección, jerarquía visual consistente y CTA claro.
- **Autonomía del comprador:** permitir comparar opciones sin presión artificial.
- **Consistencia:** mantener los mismos nombres de funciones, planes y beneficios en toda la página.
- **Lenguaje positivo y concreto:** transmitir control, orden y tranquilidad sin crear miedo, vergüenza o urgencia falsa.

No utilices escasez ficticia, contadores regresivos falsos, testimonios inventados, precios tachados no verificables, patrones oscuros, casillas preseleccionadas engañosas ni promesas de ahorro o crecimiento sin evidencia.

## Estructura persuasiva de la landing

Usa la referencia `Site.png` como guía visual y adapta esta secuencia al contenido real disponible:

1. **Captar atención:** promesa principal breve, específica y fácil de entender.
2. **Crear identificación:** mostrar problemas cotidianos reales que CLARVO ayuda a organizar.
3. **Presentar la solución:** explicar cómo CLARVO facilita el control del negocio.
4. **Demostrar el producto:** dashboard flotante 3D con pantallas fielmente reconstruidas.
5. **Traducir funciones a beneficios:** explicar para qué sirve cada módulo con información confirmada.
6. **Reducir incertidumbre:** resolver preguntas sobre uso, límites, planes y condiciones.
7. **Facilitar la decisión:** comparar planes con transparencia.
8. **Llamada a la acción:** indicar el siguiente paso real, sin simular procesos que todavía no estén conectados.

No fuerces este orden si la referencia aprobada exige otra composición. Integra la lógica persuasiva sin destruir la identidad visual.

---

# 19. CRO — OPTIMIZACIÓN DE LA TASA DE CONVERSIÓN

Interpreta CRO como *Conversion Rate Optimization* (optimización de la tasa de conversión). Construye un flujo comercial claro y medible para ayudar a los visitantes a avanzar desde el descubrimiento hasta el inicio del onboarding.

## Flujo comercial de la landing

Diseña y revisa el siguiente recorrido:

**Visita → comprensión de la propuesta de valor → exploración de la demostración → evaluación de planes/beneficios → clic en CTA → redirección al onboarding oficial.**

En esta etapa, la landing solo es responsable de la experiencia comercial y de enviar al usuario al destino configurado. No implementes dentro de GitHub Pages el formulario de onboarding, el registro definitivo, la autenticación, el checkout, la activación de empresa ni la lógica de suscripciones. Esas responsabilidades corresponden al backend de Hostinger y a la aplicación oficial.

## CTA y comportamiento

- Cada CTA debe tener una intención comprensible.
- Evita competir con múltiples botones primarios en una misma sección.
- Mantén textos coherentes entre hero, planes y cierre.
- Prepara los enlaces de inicio de onboarding, selección de plan e inicio de sesión mediante la configuración centralizada ya definida.
- Si las URLs siguen vacías, deja los destinos preparados y documentados. No inventes dominios ni simules que el flujo está operativo.
- No envíes datos sensibles en URLs.
- No recolectes información personal en esta etapa salvo que exista una necesidad aprobada y un flujo seguro.

## Medición de conversión

Prepara eventos de analítica desacoplados del proveedor específico, por ejemplo:

- `view_pricing`
- `select_billing_period`
- `click_primary_cta`
- `click_plan_cta`
- `view_product_demo`
- `outbound_onboarding_click`

Usa nombres consistentes y evita registrar datos personales, fiscales, contraseñas, tokens o información sensible. No afirmes que un onboarding se completó ni que hubo un pago: la landing no tiene autoridad para verificar esos eventos. La confirmación de registro y pago deberá instrumentarse en los sistemas oficiales en una fase posterior.

Si no se ha definido una herramienta de analítica o un consentimiento válido, documenta la integración como pendiente y no añadas trackers innecesarios.

## Optimización basada en evidencia

- Prioriza hipótesis de mejora que puedan medirse.
- No declares que un diseño convierte mejor sin datos.
- Propón pruebas A/B solo si existe una herramienta y tráfico suficiente para realizarlas correctamente.
- Mide rendimiento y conversión sin degradar accesibilidad.
- No uses ventanas emergentes invasivas ni interrumpas la lectura con animaciones.
- Asegura que el CTA siga visible y usable en móvil.

---

# 20. GENERACIÓN DE IMÁGENES DE CALIDAD PROFESIONAL CON CHATGPT

Antes de recurrir a imágenes genéricas, inspecciona todos los recursos disponibles y determina qué activos visuales faltan realmente. No generes imágenes decorativas innecesarias.

Si una imagen nueva es necesaria, **no sustituyas silenciosamente la generación profesional por una imagen de stock**. Crea primero un inventario de activos pendientes y redacta un prompt específico, listo para copiar en ChatGPT con generación de imágenes, para cada activo.

## Flujo obligatorio de activos

1. Identifica dónde se utilizará cada imagen: hero, fondo, sección de beneficios, textura, ilustración de apoyo, Open Graph u otro uso.
2. Define el objetivo de comunicación, la composición, el sujeto, el estilo, la paleta, la iluminación, el encuadre, la proporción y las restricciones.
3. Distingue entre:
   - **Activos decorativos:** fondos, ambientes, texturas y elementos abstractos.
   - **Activos de producto:** dispositivos, mockups o escenas donde se representa CLARVO.
   - **Interfaz y gráficas:** deben reconstruirse con componentes reales basados en las capturas, no generarse como imágenes con texto ficticio.
4. Para cada activo requerido, entrega un bloque titulado `PROMPT PARA CHATGPT IMAGE GENERATION`, listo para copiar y pegar.
5. Indica el nombre de archivo sugerido, formato, relación de aspecto, tamaño objetivo, fondo (transparente u opaco) y ubicación dentro del proyecto.
6. Incluye instrucciones negativas para evitar texto ilegible, logotipos inventados, marcas de agua, deformaciones, interfaces falsas o elementos que no pertenezcan a CLARVO.
7. Solicita la máxima calidad visual disponible, acabado profesional, iluminación y materiales coherentes con la identidad de CLARVO, composición cuidada y resolución apropiada para el uso final.
8. Si se necesita transparencia, indícalo explícitamente; no asumas que una imagen generada tendrá canal alfa si la herramienta no lo ofrece.
9. Genera las imágenes solo cuando el usuario las haya creado/proporcionado o exista una herramienta de generación disponible y se haya autorizado el uso de ella. No afirmes que una imagen fue generada si solo entregaste el prompt.
10. Después de recibir cada imagen, inspecciona el archivo, comprueba dimensiones y proporciones y úsalo sin estirarlo. Define `object-fit` y `object-position` según la composición.

## Reglas específicas para las imágenes de CLARVO

- Usa `Site.png` como referencia de composición y marca.
- No generes un logotipo alternativo ni cambies los colores oficiales.
- No generes capturas falsas del dashboard con texto inventado.
- No uses imágenes generadas para sustituir gráficas que deban mostrar datos reales.
- Para el dashboard 3D, prioriza interfaces reconstruidas como HTML/CSS/SVG dentro de los dispositivos. Los modelos 3D pueden generarse o conseguirse por separado cuando sea necesario, con licencia apropiada.
- Mantén consistencia visual entre todas las imágenes: paleta, iluminación, perspectiva, materiales y estilo.
- Evita recursos genéricos que no expliquen el producto.
- Incluye versiones optimizadas para web y, cuando proceda, variantes para móvil.
- Si un activo visual puede construirse de manera más nítida y ligera con CSS/SVG, no generes una imagen raster innecesaria.

## Entrega de los prompts de imagen

Crea un archivo de documentación, por ejemplo `docs/image-generation-prompts.md`, que contenga:
- Inventario de imágenes necesarias.
- Prioridad de cada activo.
- Prompt completo para ChatGPT.
- Proporción y resolución objetivo.
- Nombre de archivo.
- Destino dentro del sitio.
- Estado: pendiente, generado, revisado o integrado.

No detengas todo el desarrollo esperando imágenes que todavía no se han generado. Usa placeholders claramente identificados durante la implementación y documenta cómo reemplazarlos.

---

# 21. ARCHIVO DE MARKETING DE FUNCIONALIDADES — FUENTE DE VERDAD PENDIENTE

El usuario proporcionará un archivo adicional con el detalle de las funcionalidades de CLARVO desde la perspectiva de marketing.

Cuando esté disponible:

1. Lee el archivo completo antes de redactar los textos finales.
2. Trátalo como fuente de verdad comercial para nombres, beneficios y explicación de las funcionalidades.
3. Contrasta las afirmaciones con las capturas reales del producto y con cualquier restricción explícita.
4. Conserva su terminología y nivel de detalle cuando sean coherentes con la marca.
5. No completes huecos con funcionalidades supuestas.
6. Si contradice datos técnicos, precios o capacidades del producto, registra la discrepancia y solicita confirmación en lugar de elegir silenciosamente.
7. Traduce las funciones a beneficios claros usando neuroventas éticas, sin alterar lo que realmente hace el producto.
8. Reutiliza esa fuente de manera consistente en hero, secciones, planes, FAQ, metadatos SEO, datos estructurados y prompts de imágenes.
9. No incrustes el archivo completo como texto en la landing; extrae y organiza solo el contenido público que resulte útil para el usuario.
10. Mantén las afirmaciones comerciales en una fuente de contenido centralizada cuando la arquitectura lo permita.

Hasta recibir ese archivo, utiliza únicamente información ya confirmada y deja el contenido dependiente marcado como pendiente.

---

# 22. ALCANCE DEFINITIVO DE ESTA ENTREGA

Este proyecto es **la landing comercial de CLARVO**, no la aplicación oficial ni el backend de suscripciones.

Incluye en esta etapa:
- Sitio comercial basado en `Site.png`.
- Dashboard flotante 3D.
- Interfaces reconstruidas a partir de capturas reales cuando se proporcionen.
- Gráficas animables.
- Segunda sección de demostración del producto.
- Diseño responsive, accesibilidad y rendimiento.
- Neuroventas éticas y CRO en la estructura y el flujo comercial.
- SEO técnico y GEO para contenido público.
- Inventario de imágenes y prompts profesionales para generarlas con ChatGPT.
- Preparación de variables públicas para URLs futuras.
- Compatibilidad con GitHub Pages y GitHub Actions.

No incluye en esta etapa:
- Implementación de la API de onboarding.
- Registro real ni creación de empresas.
- Login o transferencia de sesión.
- Checkout ni procesamiento de pagos.
- Webhooks de pago.
- Activación, suspensión o cancelación de suscripciones.
- Administración interna de cuentas o planes.

Las variables de configuración de la integración futura deben estar centralizadas y poder permanecer vacías sin impedir el build de la landing. No incluyas secretos en el frontend ni en variables compiladas de GitHub Pages.

---

# 23. INSTRUCCIÓN FINAL ACTUALIZADA

Comienza auditando el proyecto y los archivos de referencia disponibles. Lee `Site.png`, el archivo de SEO/GEO integrado en este master prompt y cualquier documento adicional de marca o marketing que el usuario entregue.

Construye el sitio real respetando la identidad visual y el alcance descrito. Implementa el dashboard flotante 3D, la segunda sección demostrativa, SEO/GEO, neuroventas y CRO. Prepara GitHub Actions para GitHub Pages. Deja la integración con onboarding/API como configuración futura y no simules flujos no implementados.

Cuando necesites imágenes, entrega prompts profesionales listos para ChatGPT Image Generation y registra los activos pendientes. Cuando recibas el archivo de marketing y las capturas del producto, intégralos fielmente sin inventar funcionalidades ni datos.

Valida el build y las pruebas que realmente puedas ejecutar. En la entrega final, informa qué está implementado, qué quedó preparado, qué activos faltan y qué verificaciones no fueron posibles.

**Prioridad absoluta:** una landing de CLARVO visualmente premium, fiel al producto, persuasiva de forma ética, preparada para SEO/GEO, enfocada en conversión, rápida, accesible y publicable automáticamente en GitHub Pages.

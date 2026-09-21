# Ponente / equipo — landing /masterclass

| Archivo | Uso |
|---|---|
| `ponente.png` | Foto circular junto a "Sesión en vivo con el equipo CLARVO" en el hero de `/masterclass`. |

Si el archivo no existe, `Hero.astro` (componente de la landing de masterclass)
cae automáticamente a un badge con iniciales ("CV") — no rompe el build ni
muestra un placeholder roto. En cuanto se agregue `ponente.png` aquí, aparece
sin tocar código.

Recomendado: cuadrada (mínimo 200×200px), buena iluminación, fondo simple —
se recorta a círculo vía CSS (`object-cover`).

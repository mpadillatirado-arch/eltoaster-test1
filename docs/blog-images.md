# Fotos del blog y del newsletter (Pexels)

Las fotos de cada edición salen de Pexels, con una regla: **una foto no se repite**
en el blog. Cada noticia, el dato curioso, la nota de punto de venta y las "3 cosas"
llevan su propia foto.

## Cómo se garantiza

- **Base de datos:** un índice único (`blog_posts_pexels_photo_once`) impide guardar la
  misma foto de Pexels en dos publicaciones del mismo idioma. Se compara por el id de
  la foto, así que cambiar el tamaño en la dirección no sirve para saltárselo. Las
  fotos de archivo anteriores (Wikimedia) no entran en la regla.
- **Al elegir:** `tools/blog-images/pexels-pick.mjs` busca en Pexels y deja fuera los
  ids que ya se usaron (`--exclude`).
- **Antes de enviar:** la función `image-review` manda a Mario un correo con todas las
  fotos de la edición, marca las repetidas y las publicaciones sin foto.

## La llave de Pexels

Es gratis: https://www.pexels.com/api/ . Guárdala en una sola línea en

```
C:\Users\<tu usuario>\.claude\secrets\pexels.key
```

(o en la variable de entorno `PEXELS_API_KEY`). No va en el repositorio ni en el chat.
Pexels permite 200 búsquedas por hora, de sobra para una edición semanal.

## Crédito

Pexels pide acreditar al fotógrafo y enlazar a Pexels. Cada publicación guarda:

| Campo | Valor |
|---|---|
| `image_url` | la foto (`src.large` de Pexels) |
| `image_credit` | `Foto: <fotógrafo> / Pexels` (en inglés: `Photo: <fotógrafo> / Pexels`) |
| `image_credit_url` | la página de la foto en Pexels |

## Dónde va la foto de cada sección

| Publicación | Dónde se guarda |
|---|---|
| Noticia | `blog_posts.image_url` (+ `image_credit`, `image_credit_url`) al publicarla |
| Dato curioso | `newsletter_sends.content.<es/en>.fun_fact.image_url` y sus créditos |
| Punto de venta | `content.<es/en>.pos.image_url` y sus créditos |
| 3 cosas | `content.<es/en>.business_image.image_url` y sus créditos |

Sin foto propia, el blog usa una imagen de archivo como antes.

## Calendario semanal

| Cuándo (hora de Arizona) | Qué pasa |
|---|---|
| Jueves 9:00 | Se prepara la edición, se eligen las fotos y llegan a Mario dos correos: la prueba del newsletter y la revisión de fotos |
| Viernes 8:00 | El newsletter sale a la lista (si Mario lo aprobó desde la prueba) |
| Viernes 9:00 | El blog muestra las notas de la edición |

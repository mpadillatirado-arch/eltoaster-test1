# Fotos del blog y del newsletter (Unsplash)

Las fotos de cada edición salen de Unsplash, con una regla: **una foto no se repite**
en el blog. Cada noticia, el dato curioso, la nota de punto de venta y las "3 cosas"
llevan su propia foto.

(Se intentó Pexels primero, pero tiene cerradas las llaves nuevas de su API. Si
reabre, el buscador y los índices de la base ya aceptan sus fotos también.)

## Cómo se garantiza

- **Base de datos:** índices únicos (`blog_posts_unsplash_photo_once`, y el equivalente
  para Pexels) impiden guardar la misma foto en dos publicaciones del mismo idioma. Se
  compara por el id de la foto (`photo-…` en la dirección), así que cambiar el tamaño
  no sirve para saltárselo. Las fotos de archivo anteriores (Wikimedia) no entran en la regla.
- **Al elegir:** `tools/blog-images/unsplash-pick.mjs` busca en Unsplash y deja fuera las
  fotos ya usadas (`--exclude`).
- **Antes de enviar:** la función `image-review` manda a Mario un correo con todas las
  fotos de la edición, marca las repetidas y las publicaciones sin foto.

## La llave de Unsplash

Es gratis. Crea una cuenta en https://unsplash.com/developers, registra una aplicación
("New Application", uso: blog de un negocio) y copia el **Access Key**. Guárdalo en una
sola línea en

```
C:\Users\<tu usuario>\.claude\secrets\unsplash.key
```

(o en la variable de entorno `UNSPLASH_ACCESS_KEY`). No va en el repositorio ni en el chat.
Una aplicación nueva está en modo "demo": 50 búsquedas por hora, de sobra para una
edición semanal. Las imágenes mismas no cuentan en ese límite.

## Reglas de Unsplash que seguimos

- **Se enlazan directo** desde `images.unsplash.com` (no se copian a nuestro servidor).
- **Crédito:** cada publicación muestra "Foto: <fotógrafo> / Unsplash" enlazado al perfil
  del fotógrafo en Unsplash, con las marcas `utm_source=eltoaster&utm_medium=referral`.
- **Aviso de uso:** al elegir una foto se avisa a Unsplash
  (`unsplash-pick.mjs --use <download_location>`), una vez por foto elegida.

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

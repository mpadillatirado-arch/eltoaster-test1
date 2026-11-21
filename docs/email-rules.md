# Reglas de comunicación por tipo de registro

Qué correos recibe cada persona según el formulario con el que se registró. Es el criterio para lo que ya existe y para lo que se construya después.

Estado de cada regla: **Activa** (ya funciona), **Arreglar** (está definida pero falla) o **Por construir** (propuesta aprobada, falta implementarla).

## 1. Dos tipos de correo

| Tipo | Qué es | Necesita permiso de marketing |
|---|---|---|
| **De servicio** | Lo que la persona pidió: el reporte del diagnóstico, la confirmación de que recibimos su solicitud | No. Se manda aunque no esté suscrita |
| **De marketing** | Newsletter, ofertas, invitaciones a llamadas, avisos de rankings nuevos | Sí. Solo con casilla marcada o suscripción propia |

Todo correo de marketing lleva enlace de baja de un clic, la dirección postal y el remitente real. Esto cumple CAN-SPAM y la ley de California (CCPA/CPRA).

## 2. Qué recibe cada registro

### Diagnóstico gratis (dueño de restaurante)

| | Regla | Estado |
|---|---|---|
| Al instante | Mensaje en pantalla. Te llega un aviso a ti | Activa |
| Al instante | Correo de confirmación al dueño: "Recibimos tu solicitud, tu diagnóstico llega en 48 horas" | Por construir |
| Servicio | El reporte de reseñas, solo después de que tú lo apruebas. Un envío por restaurante | Activa |
| Marketing | Solo si marcó la casilla: entra a la lista de newsletter y recibe la bienvenida | Bienvenida: Arreglar |
| Seguimiento | Máximo 2 correos después del reporte: a los 3 días (ofrece la llamada de 15 minutos) y a los 10 días. Se detienen si responde, agenda o se da de baja | Por construir |
| Llamada | Contacto personal tuyo (llamada o WhatsApp uno a uno) dentro de 1 día hábil. Nada automatizado | Manual |
| Límite | Un diagnóstico cada 30 días por correo | Activa |

### Calculadora

| | Regla | Estado |
|---|---|---|
| Al instante | El resultado se muestra en pantalla. No se manda correo | Activa |
| Marketing | Ninguno sin permiso. Se les agrega una casilla opcional "Quiero el newsletter" | Por construir |
| Con casilla | Entran a la lista de newsletter con origen "calculadora" y reciben la bienvenida | Por construir |
| Sin casilla | Quedan solo en su lista aparte de Resend. Nadie les escribe en masa | Activa |
| Llamada | Un intento personal tuyo, solo si el formulario dice que puedes llamarles | Por construir (texto del formulario) |
| Teléfono | Nunca mensajes de texto automáticos ni masivos | Regla |

### Rankings

| | Regla | Estado |
|---|---|---|
| Al instante | El PDF se baja en el momento. No hay correo | Activa |
| Marketing | La casilla ya es obligatoria para bajar el PDF: entran a la lista de newsletter | Activa |
| Bienvenida | Una sola vez, mencionando el ranking que pidieron | Arreglar |
| Origen | Se guardan con origen "ranking", no como "footer" | Arreglar |
| Segmento | Se guarda cuál ranking pidieron, para avisarles solo de rankings parecidos | Parcial: ya se guarda desde el 21 de noviembre |
| Extra | Máximo 1 correo al mes sobre rankings nuevos, solo a quien pidió esa categoría o ciudad | Por construir |
| Ventas | Ningún correo de ventas. Si piden un diagnóstico, pasan a la regla de diagnóstico | Regla |

### Newsletter (pie de página y botón de inicio)

| | Regla | Estado |
|---|---|---|
| Al instante | Correo de bienvenida, una sola vez por persona | Arreglar |
| Marketing | Un envío semanal los viernes, en el idioma que eligieron, con las 5 secciones de siempre | Activa |
| Baja | Un clic desde cualquier correo. Se aplica al instante | Activa |
| Rebote o queja | Se saca de la lista para siempre. Volver a suscribirse no lo revierte | Activa |

## 3. Reglas para toda la lista

1. **Una persona, un correo, una lista.** Se identifica por el correo en minúsculas. Si se registra por varios formularios, no se duplica y no recibe varias bienvenidas.
2. **Gana el interés más alto.** Si alguien está en varios registros, manda el de más intención: diagnóstico, luego calculadora, luego rankings, luego newsletter. Quien pide un diagnóstico se vuelve "dueño" aunque haya empezado por rankings.
3. **Un correo de marketing por día como máximo.** Correos de servicio aparte. Esto incluye bienvenida, newsletter y avisos de rankings.
4. **Darse de baja de marketing no bloquea el servicio.** Sigue recibiendo el reporte que pidió. Quien pide "no contactar" o borrar sus datos por privacidad no recibe nada más que la respuesta a esa solicitud.
5. **Idioma.** Cada correo sale en el idioma que la persona eligió al registrarse.
6. **Remitente.** Siempre Mario, desde `mario@eltoaster.com`, con respuesta directa a ese mismo correo.
7. **Direcciones de prueba** (los @example.com y los marcados `is_test`) solo reciben pruebas. Nunca bienvenida ni newsletter.
8. **Nada de mensajes de texto de marketing** ni llamadas automatizadas.

## 4. Cómo se ve en los datos

| Registro | Tabla | Origen en `newsletter_subscribers.source` | Lista en Resend |
|---|---|---|---|
| Diagnóstico con casilla | `leads` | `diagnostic` | Principal |
| Diagnóstico sin casilla | `leads` | no entra | Ninguna |
| Calculadora con casilla (nuevo) | `calculator_leads` | `calculator` (nuevo) | Principal |
| Calculadora sin casilla | `calculator_leads` | no entra | "Calculadora El Toaster" |
| Rankings | `ranking_leads` | `ranking` (nuevo) | Principal |
| Newsletter | `newsletter_subscribers` | `footer` | Principal |

## 5. Pendientes para cumplir estas reglas

1. Reinstalar el disparador de bienvenida, que hoy no existe en la base de datos (7 suscriptores activos no la recibieron).
2. Marcar rankings con origen `ranking` y mostrarlo en el panel `/admin`.
3. Casilla opcional de newsletter en la calculadora, con origen `calculator`.
4. Correo de confirmación al dueño al pedir el diagnóstico.
5. Seguimiento a los 3 y 10 días después del reporte, con freno si responde, agenda o se da de baja.
6. Límite de 1 correo de marketing por día entre todas las listas.
7. Borrar la lista duplicada "Calculadora El Toaster" en Resend.

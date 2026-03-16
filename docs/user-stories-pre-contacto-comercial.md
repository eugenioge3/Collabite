# User Stories para Activacion Comercial y Evolucion del Producto
Fecha: 2026-03-13
Owner: Fundador
Estado: Actualizado para piloto comercial por fases

## 1) Objetivo
Ordenar el backlog para que puedas:
- Contactar a la candidata pronto, sin esperar producto completo.
- Pedirle que mande clientes solo cuando el producto este online y estable.
- Dejar que ella opere captacion y pipeline mientras tu sigues agregando features sin romper el flujo principal.

## 2) Regla operativa
Separar estas 3 decisiones evita confusion:

1. Contactarla: si puede pasar ya.
2. Activarla en piloto: cuando haya demo, acuerdo y tablero operativo.
3. Pedirle que mande trafico real al producto: solo cuando el flujo core este estable y publicado.

Regla practica de trabajo:
- Lo core si debe estar productizado antes de recibir trafico.
- Lo no core puede operar manualmente durante 4-6 semanas con Notion, Sheets, WhatsApp y seguimiento humano.
- Cada feature nueva debe competir contra una pregunta simple: mejora conversion real o solo agrega complejidad.

## 3) Capacidades ya avanzadas en el producto actual
Estas capacidades ya tienen avance funcional validado en local y sirven como base del piloto:
- Crear campana como draft y publicarla.
- Editar campanas en draft.
- Mostrar estados y acciones contextuales de campanas.
- Ocultar identidad de candidatas antes del pago.
- Desbloquear contacto despues de pago.
- Mostrar senales para influencer como `already_applied` y `business_hint`.
- Mostrar vistas de campanas de negocio con tabs de seguimiento/historial.

Implicacion practica:
- No estas arrancando desde cero.
- El foco ahora no es inventar mas flujo base, sino endurecerlo para uso online y montar la operacion comercial encima.

## 4) Herramientas gratis recomendadas

## Stack recomendado
1. GitHub Issues: historias y tareas tecnicas.
2. GitHub Projects: tablero unico de ejecucion.
3. Notion (free): playbook comercial, scripts y FAQ interna.
4. Google Sheets (free): corte semanal de KPIs y variable.
5. WhatsApp Business: soporte rapido y seguimiento manual en piloto.

## Recomendacion practica
Usar GitHub como fuente unica para backlog y estado. Usar Notion/Sheets/WhatsApp para operar lo que todavia no vale la pena automatizar.

## 5) Estructura del tablero (GitHub Projects)
Columnas sugeridas:
1. Backlog
2. Ready
3. In Progress
4. Blocked
5. Review/QA
6. Done

Campos sugeridos por issue:
- Story ID (US-###)
- Fase (F0/F1/F2)
- Epic
- Priority (P0/P1/P2)
- Effort (S/M/L)
- Owner (Fundador/Comercial/Shared)
- Modo inicial (Producto/Manual/Documento/Proceso)
- KPI impactado
- Fecha objetivo

## 6) Gates de avance

## Gate A: Contact-ready
Ya puedes contactarla si cumples esto:
- Oferta del piloto cerrada.
- One-pager o deck corto listo.
- Demo estable con datos ejemplo.
- CRM/tablero semanal definido.

## Gate B: Traffic-ready
Ella ya puede mandar negocios al producto si cumples esto:
- Registro/login sin friccion seria.
- Perfil de negocio funcional.
- Crear/publicar campana funciona online.
- Paywall y desbloqueo funcionan online.
- Soporte visible.
- Logs/analitica minima y health check.

## Gate C: Pilot-ready en paralelo
Puedes correr captacion + desarrollo en paralelo si cumples esto:
- Pipeline con atribucion y seguimiento semanal.
- Proceso manual claro para dudas y seguimiento.
- Backlog de feedback comercial alimentando roadmap.
- Cadencia chica de releases sin romper conversion.

## 7) Definition of Ready / Done

## Definition of Ready (DoR)
Una historia entra a Ready solo si tiene:
- Historia en formato "Como [rol], quiero [accion], para [beneficio]".
- Criterios de aceptacion medibles.
- Owner y prioridad definidos.
- Dependencias identificadas.
- Decision explicita sobre si inicia como producto o manual.

## Definition of Done (DoD)
Una historia pasa a Done solo si:
- Cumple criterios de aceptacion.
- Se probo en el entorno correspondiente.
- Tiene evidencia minima de uso o validacion.
- Quedo documentada en docs o en el issue.
- Si afecta conversion, deja metricas o logs para seguimiento.

## 8) Backlog por fases

## Fase 0 (F0): Tener todo listo para contactarla
Objetivo: poder hablar con ella ya, con propuesta clara, materiales y forma de operar.

### US-017 (P0, S, Owner: Fundador, Modo inicial: Documento)
Como fundador, quiero un one-pager y deck corto de Collabite, para explicarle la propuesta de valor y el piloto sin improvisar.
Criterios de aceptacion:
- One-pager con problema, propuesta de valor, ciudad foco y modelo de negocio.
- Deck corto de 5-7 slides maximo.
- Incluye el esquema 3,500 MXN + 20% neto atribuible.

### US-018 (P0, S, Owner: Fundador, Modo inicial: Documento)
Como fundador, quiero terminos del piloto definidos por escrito, para presentarle un acuerdo claro desde la primera reunion.
Criterios de aceptacion:
- Duracion del piloto, meta de 6 semanas y regla de atribucion definidas.
- Regla de pago y fecha de corte documentadas.
- Criterio Go/Hold/No-Go resumido en una pagina.

### US-019 (P0, S, Owner: Fundador, Modo inicial: Manual)
Como fundador, quiero un CRM simple con embudo y KPIs, para empezar seguimiento semanal desde el dia 1.
Criterios de aceptacion:
- Etapas: lead -> reunion -> campana publicada -> campana fondeada.
- Campos minimos: negocio, canal, owner, siguiente accion, fecha compromiso.
- Vista semanal lista en Sheets o Notion.

### US-020 (P0, M, Owner: Fundador, Modo inicial: Producto)
Como fundador, quiero una demo estable con datos de ejemplo, para ensenarle el flujo real del producto y del cobro.
Criterios de aceptacion:
- Flujo de demo cubre perfil de negocio, crear campana y ver postulaciones.
- Datos demo no dependen de improvisacion manual durante la llamada.
- Existe guion de demo de 10-15 minutos.

Resultado esperado de F0:
- Ya la puedes contactar y alinear.
- Todavia no le pides que mande trafico real.

## Fase 1 (F1): Minimo obligatorio antes de que mande clientes
Objetivo: tener una version online suficientemente estable para no quemar confianza ni leads.

### US-021 (P0, M, Owner: Fundador, Modo inicial: Producto)
Como negocio, quiero registrarme e iniciar sesion sin errores raros, para poder entrar a la plataforma sin ayuda tecnica.
Criterios de aceptacion:
- Registro/login funciona en entorno online.
- Mensajes de error son claros.
- Recuperacion o soporte para acceso esta definido.

### US-001 (P0, M, Owner: Fundador, Modo inicial: Producto)
Como negocio, quiero completar mi perfil en menos de 3 minutos, para poder publicar campanas rapido.
Criterios de aceptacion:
- Formulario pide solo campos esenciales.
- Guardado exitoso en un solo flujo.
- Si faltan datos obligatorios, mensaje claro de error.

### US-002 (P0, M, Owner: Fundador, Modo inicial: Producto)
Como negocio, quiero crear y publicar una campana con pasos claros, para empezar a recibir postulaciones.
Criterios de aceptacion:
- Flujo crear draft -> publicar funciona online sin friccion seria.
- Validaciones minimas: titulo, presupuesto, ciudad, nicho.
- Mensaje de confirmacion al publicar.

### US-003 (P0, S, Owner: Fundador, Modo inicial: Producto)
Como negocio, quiero ver si una campana esta draft, activa o fondeada, para saber que accion sigue.
Criterios de aceptacion:
- Estado visible en lista y detalle de campana.
- CTA contextual por estado.

### US-004 (P0, S, Owner: Fundador, Modo inicial: Producto)
Como negocio, quiero ver un resumen de costo total antes de pagar, para entender cuanto pagare.
Criterios de aceptacion:
- Mostrar presupuesto + comision + total.
- Mostrar mensaje transparente sobre fee de pago.

### US-005 (P0, M, Owner: Fundador, Modo inicial: Producto)
Como negocio, quiero ver cuantas influencers aplicaron aunque no haya pagado, para motivarme a desbloquear.
Criterios de aceptacion:
- Mostrar conteo de candidatas.
- Ocultar identidad antes de pago.
- CTA visible de pago/desbloqueo.

### US-006 (P0, M, Owner: Fundador, Modo inicial: Producto)
Como negocio, quiero desbloquear perfiles pagando, para revisar candidatas reales y decidir.
Criterios de aceptacion:
- Despues de pago, nombre y datos visibles.
- Si no hay pago, endpoint bloquea info sensible.
- Estado de desbloqueo queda persistido.

### US-012 (P0, S, Owner: Fundador, Modo inicial: Producto)
Como negocio de Cancun, quiero ver ejemplos claros y una propuesta de valor local en la web, para confiar en la plataforma.
Criterios de aceptacion:
- Landing o home explica en 10 segundos que hace Collabite.
- Existe seccion de ejemplos, casos o uso esperado local.
- CTA claro para publicar primera campana.

### US-013 (P0, S, Owner: Fundador, Modo inicial: Producto)
Como negocio nuevo, quiero una FAQ corta con dudas de pago y seguridad, para reducir friccion antes de publicar.
Criterios de aceptacion:
- FAQ publica con 8-12 preguntas.
- Incluye proceso de pago, desbloqueo y seguridad.

### US-022 (P0, S, Owner: Shared, Modo inicial: Manual)
Como negocio, quiero ver un canal de soporte visible en puntos criticos, para no abandonar el flujo cuando tenga dudas.
Criterios de aceptacion:
- Boton o enlace de WhatsApp/correo visible en registro, publicacion y pago.
- Tiempo objetivo de respuesta definido.
- Responsable de soporte asignado durante piloto.

### US-015 (P0, S, Owner: Fundador, Modo inicial: Producto)
Como equipo, queremos logs minimos de eventos clave, para diagnosticar fallas de conversion.
Criterios de aceptacion:
- Eventos: registro, crear campana, publicar, pagar/desbloquear, aplicar.
- Logs con timestamp e identificador principal.

### US-016 (P0, S, Owner: Fundador, Modo inicial: Producto)
Como equipo, queremos health check y alertas basicas, para detectar caidas temprano.
Criterios de aceptacion:
- Endpoint de health operativo.
- Alerta basica cuando API no responde.

Resultado esperado de F1:
- Ella ya puede mandar negocios reales al producto.
- El flujo core no depende de soporte artesanal para funcionar.

## Fase 2 (F2): Mientras ella capta, tu sigues agregando features
Objetivo: operar ventas reales sin frenar desarrollo y usar feedback comercial para priorizar bien.

### Epic A: Operacion comercial y seguimiento

### US-009 (P0, M, Owner: Fundador, Modo inicial: Manual)
Como fundador, quiero un dashboard semanal con metricas clave, para evaluar rendimiento comercial real.
Criterios de aceptacion:
- Mostrar al menos: leads, reuniones, campanas publicadas, campanas fondeadas.
- Filtro por semana.
- Datos exportables a CSV o copiables a Sheets.

### US-010 (P0, S, Owner: Fundador, Modo inicial: Manual)
Como fundador, quiero una vista de embudo comercial, para identificar en que etapa se caen los negocios.
Criterios de aceptacion:
- Etapas: lead -> reunion -> campana publicada -> campana fondeada.
- Conteo por etapa visible.

### US-011 (P0, S, Owner: Comercial, Modo inicial: Manual)
Como equipo, queremos registrar motivo de perdida por negocio, para mejorar discurso comercial y priorizacion de producto.
Criterios de aceptacion:
- Campo "motivo de no cierre" visible en CRM.
- Reporte semanal de top 3 motivos.

### US-014 (P1, S, Owner: Shared, Modo inicial: Manual)
Como equipo, queremos un proceso de seguimiento rapido por WhatsApp o correo, para que ninguna oportunidad se enfrie por falta de respuesta.
Criterios de aceptacion:
- SLA objetivo de seguimiento definido.
- Plantillas de respuesta rapida disponibles.
- Se registra siguiente accion y fecha compromiso.

### US-023 (P1, S, Owner: Comercial, Modo inicial: Manual)
Como comercial, quiero registrar la fuente y atribucion de cada lead y campana, para calcular variable y saber que canal funciona.
Criterios de aceptacion:
- Cada lead tiene source, owner y estatus.
- Cada campana cerrada tiene atribucion documentada.
- El corte mensual de variable se puede auditar.

### Epic B: Features para mejorar conversion durante el piloto

### US-007 (P1, M, Owner: Fundador, Modo inicial: Producto)
Como negocio, quiero aceptar o rechazar postulaciones desde un solo panel, para cerrar campanas mas rapido.
Criterios de aceptacion:
- Botones aceptar/rechazar disponibles cuando aplica.
- Cambio de estado visible al instante.
- Registro de fecha y usuario que hizo la accion.

### US-008 (P1, S, Owner: Fundador, Modo inicial: Producto)
Como influencer, quiero saber el estado de mi postulacion, para decidir siguientes acciones.
Criterios de aceptacion:
- Estado visible en dashboard influencer.
- Mensaje claro: pendiente/aceptada/rechazada.

### US-024 (P1, S, Owner: Shared, Modo inicial: Manual)
Como equipo, queremos un inbox de feedback comercial a producto, para convertir objeciones reales en backlog priorizado.
Criterios de aceptacion:
- Cada objecion o solicitud entra con frecuencia e impacto.
- Revision semanal fundador + comercial.
- Maximo 3 apuestas de producto por sprint.

### US-025 (P1, S, Owner: Fundador, Modo inicial: Proceso)
Como fundador, quiero una cadencia pequena de releases y validacion, para seguir agregando features sin romper el flujo de ventas.
Criterios de aceptacion:
- Ventana semanal o quincenal de release definida.
- Checklist minima antes de publicar cambios.
- Si algo rompe conversion, existe rollback o plan manual temporal.

## 9) Priorizacion actual por bloques

## Bloque A: Esta semana, para poder contactarla
1. US-017
2. US-018
3. US-019
4. US-020

## Bloque B: Antes de pedirle que mande clientes
1. US-021
2. US-001
3. US-002
4. US-003
5. US-004
6. US-005
7. US-006
8. US-012
9. US-013
10. US-022
11. US-015
12. US-016

## Bloque C: Durante el piloto, mientras tu construyes mas producto
1. US-009
2. US-010
3. US-011
4. US-014
5. US-023
6. US-007
7. US-008
8. US-024
9. US-025

## 10) Lectura ejecutiva de prioridades
Si hoy preguntas "que necesito para eventualmente contactarla?", la respuesta es F0.

Si preguntas "que necesito para que mande clientes sin quemar confianza?", la respuesta es F1.

Si preguntas "como hacemos para que ella venda mientras yo agrego features?", la respuesta es F2:
- comercial operando pipeline y feedback,
- tu protegiendo flujo core,
- y automatizando solo lo que demuestre impacto real.

## 11) KPIs semanales minimos
1. Leads nuevos de negocio.
2. Reuniones realizadas.
3. Campanas publicadas.
4. Campanas fondeadas.
5. Tasa de cierre (reunion -> fondeo).
6. Tiempo promedio de cierre.
7. Tiempo de respuesta a leads.
8. Objeciones mas repetidas.

## 12) Plantilla corta para crear cada issue
Titulo:
[US-###] Como [rol], quiero [accion], para [beneficio]

Descripcion:
- Story:
- Fase:
- Owner:
- Contexto:
- Criterios de aceptacion:
- Dependencias:
- Priority:
- Effort:
- Modo inicial:
- KPI impactado:

## 13) Recomendacion final de ejecucion
- Contactala cuando cierres F0.
- Activa captacion solo cuando cierres F1.
- Durante F2, evita pausar ventas por features no criticas.
- Usa el aprendizaje comercial para decidir el siguiente sprint de producto.

---

## 14) Backlog de producto — vista filtrada
Solo las historias con Modo inicial: Producto, ordenadas por prioridad de ejecucion.
Estas son las unicas en las que el fundador trabaja activamente en este momento.

Las historias Manual/Documento/Proceso no estan aqui; siguen en sus fases correspondientes y se ejecutan en paralelo por el equipo comercial o de operacion.

### Prioridad 1 — Obligatorias antes de recibir trafico (Gate B)

| ID     | Historia resumida                               | Esfuerzo | Estado |
|--------|-------------------------------------------------|----------|--------|
| US-021 | Auth: registro/login sin errores en produccion  | M        | ✅ Completa  |
| US-001 | Perfil de negocio completo en menos de 3 min    | M        | ✅ Completa  |
| US-002 | Crear y publicar campana online sin friccion     | M        | ⬜ Pendiente |
| US-003 | Estado de campana visible (draft/activa/fondead) | S        | ⬜ Pendiente |
| US-004 | Resumen de costo total antes de pagar           | S        | ⬜ Pendiente |
| US-005 | Ver conteo de candidatas ocultas antes de pagar | M        | ⬜ Pendiente |
| US-006 | Desbloquear perfiles pagando                    | M        | ⬜ Pendiente |
| US-012 | Landing con propuesta de valor local y CTA      | S        | ⬜ Pendiente |
| US-013 | FAQ con dudas de pago y seguridad               | S        | ⬜ Pendiente |
| US-015 | Logs minimos de eventos clave de conversion     | S        | ⬜ Pendiente |
| US-016 | Health check y alerta basica de caida           | S        | ⬜ Pendiente |

### Prioridad 2 — Para demo estable antes de contactarla (Gate A)

| ID     | Historia resumida                               | Esfuerzo | Estado |
|--------|-------------------------------------------------|----------|--------|
| US-020 | Demo con datos de ejemplo y guion de 10-15 min  | M        | ⬜ Pendiente |

### Prioridad 3 — Durante el piloto (F2, mejoran conversion)

| ID     | Historia resumida                               | Esfuerzo | Estado |
|--------|-------------------------------------------------|----------|--------|
| US-007 | Aceptar o rechazar postulaciones desde un panel | M        | ⬜ Pendiente |
| US-008 | Influencer ve estado de su postulacion          | S        | ⬜ Pendiente |

---

## 15) Ideas futuras — Registro para versiones siguientes
Estas ideas no forman parte del backlog activo. Se registran para no perderlas y evaluar cuando haya evidencia de demanda real.

### IDEA-001: Seccion de campanas altruistas (sin cobro)
Un negocio como una organizacion de adopcion de animales puede publicar una campana sin presupuesto monetario. El influencer participa por voluntad propia, sin pago. La plataforma no cobra comision.
- Valor: diferenciacion de marca, engagement de influencers con causa, PR potencial.
- Consideraciones tecnicas: requiere nuevo tipo de campana (`tipo: altruista`), flujo sin paywall, posiblemente badge o seccion separada en la app.
- Cuando evaluar: cuando haya traccion organica y se quiera diversificar propuesta de valor.

### IDEA-002: Chatbot en la pagina
Un chatbot que responde preguntas frecuentes de negocios e influencers y ademas registra preguntas especificas que no pudo responder, alimentando el backlog de FAQ y de producto.
- Valor: soporte 24/7, reduccion de carga manual, inteligencia de mercado en tiempo real.
- Consideraciones tecnicas: puede empezar con un widget de terceros (Intercom, Crisp, Tidio) antes de construir uno propio. El registro de preguntas no respondidas puede ser tan simple como un sheet.
- Cuando evaluar: cuando el volumen de preguntas repetidas justifique la automatizacion.

### IDEA-003: Timer en postulaciones y detalles de presencia fisica
Al postularse, el influencer ve un contador de tiempo disponible para cerrar o confirmar. Ademas, la campana puede indicar si requiere presencia fisica (ej. visita a restaurante, tienda, evento) con detalles de lugar y logistica.
- Valor: reduce postulaciones fantasma, mejora calidad de match, da contexto real al influencer.
- Consideraciones tecnicas: timer requiere campo `expires_at` en postulacion y logica de expiracion. Presencia fisica requiere campos opcionales en campana: `requiere_visita: bool`, `direccion`, `instrucciones_visita`.
- Cuando evaluar: cuando haya suficientes postulaciones reales para detectar el problema de no-respuesta o mal match.

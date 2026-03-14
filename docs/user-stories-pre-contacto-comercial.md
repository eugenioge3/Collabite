# User Stories Pre Contacto Comercial
Fecha: 2026-03-13
Owner: Fundador
Estado: Propuesto para ejecucion inmediata

## 1) Objetivo
Definir y ejecutar un backlog minimo antes de incorporar formalmente a la persona comercial, para que entre con:
- Producto utilizable para cerrar campanas
- Operacion clara para seguimiento semanal
- Metricas para medir si realmente hay traccion

## 2) Herramientas gratis recomendadas (para registrar y organizar)

## Opcion recomendada (simple y sin costo)
1. GitHub Issues: registro de user stories y tareas tecnicas.
2. GitHub Projects: tablero kanban y roadmap.
3. Notion (free): documentacion operativa (scripts de venta, playbooks, FAQ).
4. Google Sheets (free): control semanal de KPIs comerciales.

## Alternativas gratis
- Trello: bueno para operacion comercial visual.
- Jira Free: bueno si quieren workflow mas estricto (hasta 10 usuarios).
- ClickUp Free: bueno para mezclar tareas + docs.

## Recomendacion practica
Usar GitHub como fuente unica de verdad para desarrollo (issues + board) y Notion para material comercial.

## 3) Estructura del tablero (GitHub Projects)
Columnas sugeridas:
1. Backlog
2. Ready
3. In Progress
4. Blocked
5. Review/QA
6. Done

Campos sugeridos por issue:
- Story ID (US-###)
- Epic
- Priority (P0/P1/P2)
- Effort (S/M/L)
- Owner
- KPI impactado
- Fecha objetivo

## 4) Definition of Ready / Done

## Definition of Ready (DoR)
Una historia entra a Ready solo si tiene:
- Historia en formato "Como [rol], quiero [accion], para [beneficio]"
- Criterios de aceptacion medibles
- Prioridad y esfuerzo definidos
- Dependencias identificadas

## Definition of Done (DoD)
Una historia pasa a Done solo si:
- Cumple criterios de aceptacion
- Se probo en entorno local
- Tiene metricas o logs minimos para seguimiento
- Quedo documentada en docs o en el issue

## 5) Epics y user stories

## Epic A: Activacion de negocios (venta inicial)

### US-001 (P0, M)
Como negocio, quiero completar mi perfil en menos de 3 minutos, para poder publicar campanas rapido.
Criterios de aceptacion:
- Formulario de perfil pide solo campos esenciales.
- Guardado exitoso en un solo flujo.
- Si faltan datos obligatorios, mensaje claro de error.

### US-002 (P0, M)
Como negocio, quiero crear y publicar una campana con pasos claros, para empezar a recibir postulaciones.
Criterios de aceptacion:
- Flujo crear draft -> publicar funciona sin friccion.
- Validaciones minimas: titulo, presupuesto, ciudad, nicho.
- Mensaje de confirmacion al publicar.

### US-003 (P0, M)
Como negocio, quiero ver si una campana esta draft, activa o fondeada, para saber que accion sigue.
Criterios de aceptacion:
- Estado visible en lista y detalle de campana.
- CTA contextual por estado (Editar, Publicar, Fondear, Revisar).

### US-004 (P0, S)
Como negocio, quiero ver un resumen de costo total antes de pagar, para entender cuanto pagare.
Criterios de aceptacion:
- Mostrar presupuesto + comision + total.
- Mostrar mensaje sobre fee de pago de forma transparente.

## Epic B: Matching y conversion

### US-005 (P0, M)
Como negocio, quiero ver cuantas influencers aplicaron aunque no haya pagado, para motivarme a desbloquear.
Criterios de aceptacion:
- Mostrar conteo de candidatas.
- Ocultar identidad antes de pago.
- CTA visible de "Pagar y desbloquear".

### US-006 (P0, M)
Como negocio, quiero desbloquear perfiles pagando, para revisar candidatas reales y decidir.
Criterios de aceptacion:
- Despues de pago, nombre y mensaje quedan visibles.
- Si no hay pago, endpoint bloquea info sensible.
- Estado de desbloqueo queda persistido.

### US-007 (P1, M)
Como negocio, quiero aceptar o rechazar postulaciones desde un solo panel, para cerrar campanas mas rapido.
Criterios de aceptacion:
- Botones aceptar/rechazar disponibles cuando aplica.
- Cambio de estado visible al instante.
- Registro de fecha y usuario que hizo la accion.

### US-008 (P1, S)
Como influencer, quiero saber el estado de mi postulacion, para decidir siguientes acciones.
Criterios de aceptacion:
- Estado visible en dashboard influencer.
- Mensaje claro: pendiente/aceptada/rechazada.

## Epic C: Operacion comercial y seguimiento

### US-009 (P0, M)
Como fundador, quiero un dashboard semanal con metricas clave, para evaluar rendimiento comercial real.
Criterios de aceptacion:
- Mostrar al menos: leads, reuniones, campanas publicadas, campanas fondeadas.
- Filtro por semana.
- Datos exportables a CSV o copiable a Sheets.

### US-010 (P0, S)
Como fundador, quiero una vista de embudo comercial, para identificar en que etapa se caen los negocios.
Criterios de aceptacion:
- Etapas: lead -> reunion -> campana publicada -> campana fondeada.
- Conteo por etapa visible.

### US-011 (P1, S)
Como fundador, quiero registrar motivo de perdida por negocio, para mejorar discurso comercial.
Criterios de aceptacion:
- Campo "motivo de no cierre" en CRM o tablero.
- Reporte semanal de top 3 motivos.

## Epic D: Credibilidad y conversion en Cancun

### US-012 (P0, M)
Como negocio de Cancun, quiero ver casos de uso locales en la web, para confiar en la plataforma.
Criterios de aceptacion:
- Seccion "casos / ejemplos" visible.
- CTA claro para publicar primera campana.

### US-013 (P1, S)
Como negocio nuevo, quiero una FAQ corta con dudas de pago y seguridad, para reducir friccion.
Criterios de aceptacion:
- FAQ publica con 8-12 preguntas.
- Incluye proceso de pago y seguridad.

### US-014 (P1, S)
Como negocio, quiero soporte rapido por WhatsApp o correo, para no abandonar el flujo.
Criterios de aceptacion:
- Boton de contacto visible en puntos criticos.
- Tiempo objetivo de respuesta definido.

## Epic E: Calidad operativa minima

### US-015 (P0, S)
Como equipo, queremos logs minimos de eventos clave, para diagnosticar fallas de conversion.
Criterios de aceptacion:
- Eventos: crear campana, publicar, pagar, aplicar, aceptar.
- Logs con timestamp y campaign_id.

### US-016 (P1, S)
Como equipo, queremos health check y alertas basicas, para detectar caidas temprano.
Criterios de aceptacion:
- Endpoint de health operativo.
- Alerta basica cuando API no responde.

## 6) Priorizacion para arrancar ya (antes de contactar a la persona)
Historias objetivo de las proximas 2-3 semanas:
1. US-001
2. US-002
3. US-003
4. US-005
5. US-006
6. US-009
7. US-010
8. US-012

Resultado esperado al completar este bloque:
- La persona comercial entra con un producto que puede vender sin friccion fuerte.
- Ya existe una forma objetiva de medir su impacto semanal.

## 7) Plantilla corta para crear cada issue
Titulo:
[US-###] Como [rol], quiero [accion], para [beneficio]

Descripcion:
- Story:
- Contexto:
- Criterios de aceptacion:
- Dependencias:
- Priority:
- Effort:
- KPI impactado:

## 8) KPIs semanales minimos que debes revisar
1. Leads nuevos de negocio
2. Reuniones realizadas
3. Campanas publicadas
4. Campanas fondeadas
5. Tasa de cierre (reunion -> fondeo)
6. Tiempo promedio de cierre (dias)

## 9) Recomendacion final de organizacion
- Desarrollo: GitHub Issues + GitHub Projects
- Material comercial: Notion
- Control semanal de numeros: Google Sheets

Con esta combinacion tienes costo cero, orden claro y trazabilidad para decidir rapido si el canal comercial esta funcionando.

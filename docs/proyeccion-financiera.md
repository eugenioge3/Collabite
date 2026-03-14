# Proyeccion Financiera - Collabite
Fecha: 2026-03-13
Version: 2
Owner: Fundador

---

## 1) Modelo de ingreso actual

Collabite opera con una sola fuente de ingreso: comision por campana completada.

| Concepto | Valor |
|---|---|
| Comision de la plataforma | 12% del presupuesto de campana |
| Presupuesto promedio estimado | $3,500 MXN |
| Comision bruta por campana | $420 MXN |
| Fee de Stripe (ver seccion 3) | ~$144 MXN |
| Ingreso neto por campana | ~$276 MXN |
| Margen efectivo neto | ~7.9% |

### Flujo de dinero por campana

```text
Negocio paga:       $3,920 MXN   (= $3,500 al influencer + $420 comision)
Stripe descuenta:     $144 MXN   (3.6% + $3 MXN)
Plataforma retiene: $3,776 MXN
Paga al influencer: $3,500 MXN
---------------------------------
Ingreso neto:         $276 MXN
```

Nota: si Stripe se configura en pass-through, el ingreso neto sube a $420 MXN.

---

## 2) Costos de infraestructura AWS

Los costos de AWS escalan con el uso. El stack es Lambda + API Gateway + RDS PostgreSQL + S3 + CloudFront + Cognito.

### Etapa 1 - 0 a 100 campanas por mes
| Servicio | USD/mes | MXN/mes (~20:1) |
|---|---|---|
| RDS PostgreSQL db.t3.micro | $15 | $300 |
| Lambda compute | $0-2 | $0-40 |
| API Gateway HTTP API | $0-1 | $0-20 |
| S3 (media, frontend build) | $1 | $20 |
| CloudFront (CDN) | $0 | $0 |
| Cognito (< 50k MAU) | $0 | $0 |
| Route 53 + dominio | $2 | $40 |
| Secrets Manager | $1 | $20 |
| SES (emails transaccionales) | $0 | $0 |
| Total Etapa 1 | $19-22 | $380-440 |

### Etapa 2 - 100 a 500 campanas por mes
| Servicio | USD/mes | MXN/mes |
|---|---|---|
| RDS db.t3.small | $28 | $560 |
| Lambda + API Gateway | $8-15 | $160-300 |
| S3 + CloudFront | $5-8 | $100-160 |
| SES (notificaciones activas) | $2-5 | $40-100 |
| Route 53 + Secrets Manager | $3 | $60 |
| Total Etapa 2 | $46-59 | $920-1,180 |

### Etapa 3 - 500+ campanas por mes
| Servicio | USD/mes | MXN/mes |
|---|---|---|
| RDS db.t3.medium | $60 | $1,200 |
| Lambda + API Gateway | $25-40 | $500-800 |
| S3 + CloudFront | $15-25 | $300-500 |
| SES + extras | $15-25 | $300-500 |
| Total Etapa 3 | $115-150 | $2,300-3,000 |

---

## 3) Costos de servicios externos (no AWS)

| Servicio | Plan inicial | Costo MXN/mes | Notas |
|---|---|---|---|
| Stripe Connect | Sin cuota fija | $0 | Solo cobra por transaccion |
| Stripe fee por cargo | 3.6% + $3 MXN | Variable | ~$144 MXN en campana de $3,920 |
| GitHub | Free | $0 | Free tier cubre Actions y repo |
| Sentry | Free tier | $0 | Hasta 5,000 errores/mes |
| SES / SendGrid | Free tier | $0 | SES = $0.10 por 1,000 emails |
| Notion / Google Sheets | Free | $0 | CRM temporal |
| Total servicios |  | $0-80 | Esencialmente $0 al inicio |

Resumen tecnologia total:
- Etapa 1 (0-100 camps/mes): ~$400-520 MXN/mes
- Etapa 2 (100-500): ~$1,000-1,300 MXN/mes
- Etapa 3 (500+): ~$2,300-3,100 MXN/mes

---

## 4) Compensacion del socio comercial (acuerdo cerrado)

### Supuesto oficial para esta proyeccion
- Ciudad foco: Cancun.
- Base mensual: $3,000-$4,000 MXN (modelo usa $3,500 para calculos).
- Variable: 20% del ingreso neto atribuible a sus cierres.
- Sin equity durante piloto.

### Formula de costo personal mensual

```text
Personal = Base + (0.20 x Ingreso_neto_atribuible)
```

Esta formula protege caja porque:
- Si no hay ventas, solo pagas base.
- Si hay ventas, la compensacion crece sin romper margen.

---

## 5) Proyeccion mensual de P&L - Ano 1

Supuestos base de esta seccion:
- Presupuesto promedio por campana: $3,500 MXN
- Ingreso neto por campana (post-Stripe): $276 MXN
- Base fija mensual: $3,500 MXN
- Variable: 20% del ingreso neto del mes
- AWS/servicios: inicia en ~$450 MXN y escala por volumen

---

### Escenario A - Conservador (crecimiento lento)

| Mes | Camps/mes | Ing. bruto | Ing. neto | AWS+Serv | Personal (Base+20%) | P&L mes |
|---|---|---|---|---|---|---|
| 1 | 0 | $0 | $0 | $450 | $3,500 | -$3,950 |
| 2 | 3 | $1,260 | $828 | $450 | $3,666 | -$3,288 |
| 3 | 8 | $3,360 | $2,208 | $450 | $3,942 | -$2,184 |
| 4 | 14 | $5,880 | $3,864 | $500 | $4,273 | -$909 |
| 5 | 20 | $8,400 | $5,520 | $500 | $4,604 | +$416 |
| 6 | 26 | $10,920 | $7,176 | $600 | $4,935 | +$1,641 |
| 7 | 32 | $13,440 | $8,832 | $700 | $5,266 | +$2,866 |
| 8 | 38 | $15,960 | $10,488 | $800 | $5,598 | +$4,090 |
| 9 | 45 | $18,900 | $12,420 | $900 | $5,984 | +$5,536 |
| 10 | 52 | $21,840 | $14,352 | $1,000 | $6,370 | +$6,982 |
| 11 | 60 | $25,200 | $16,560 | $1,100 | $6,812 | +$8,648 |
| 12 | 68 | $28,560 | $18,768 | $1,200 | $7,254 | +$10,314 |

Punto de equilibrio: Mes 5 (aprox. 20 campanas/mes).
Deficit acumulado previo (Mes 1-4): ~$10,331 MXN.

---

### Escenario B - Base (crecimiento esperado)

| Mes | Camps/mes | Ing. bruto | Ing. neto | AWS+Serv | Personal (Base+20%) | P&L mes |
|---|---|---|---|---|---|---|
| 1 | 3 | $1,260 | $828 | $450 | $3,666 | -$3,288 |
| 2 | 12 | $5,040 | $3,312 | $500 | $4,162 | -$1,350 |
| 3 | 22 | $9,240 | $6,072 | $550 | $4,714 | +$808 |
| 4 | 35 | $14,700 | $9,660 | $650 | $5,432 | +$3,578 |
| 5 | 48 | $20,160 | $13,248 | $800 | $6,150 | +$6,298 |
| 6 | 62 | $26,040 | $17,112 | $1,000 | $6,922 | +$9,190 |
| 7 | 78 | $32,760 | $21,528 | $1,200 | $7,806 | +$12,522 |
| 8 | 95 | $39,900 | $26,220 | $1,300 | $8,744 | +$16,176 |
| 9 | 115 | $48,300 | $31,740 | $1,500 | $9,848 | +$20,392 |
| 10 | 135 | $56,700 | $37,260 | $1,700 | $10,952 | +$24,608 |
| 11 | 160 | $67,200 | $44,160 | $2,000 | $12,332 | +$29,828 |
| 12 | 185 | $77,700 | $51,060 | $2,300 | $13,712 | +$35,048 |

Punto de equilibrio: Mes 3 (aprox. 22 campanas/mes).
Deficit acumulado previo (Mes 1-2): ~$4,638 MXN.

---

### Escenario C - Optimista (traccion rapida)

| Mes | Camps/mes | Ing. bruto | Ing. neto | AWS+Serv | Personal (Base+20%) | P&L mes |
|---|---|---|---|---|---|---|
| 1 | 8 | $3,360 | $2,208 | $500 | $3,942 | -$2,234 |
| 2 | 25 | $10,500 | $6,900 | $600 | $4,880 | +$1,420 |
| 3 | 45 | $18,900 | $12,420 | $800 | $5,984 | +$5,636 |
| 4 | 70 | $29,400 | $19,320 | $1,000 | $7,364 | +$10,956 |
| 5 | 100 | $42,000 | $27,600 | $1,200 | $9,020 | +$17,380 |
| 6 | 140 | $58,800 | $38,640 | $1,500 | $11,228 | +$25,912 |
| 12 | 350 | $147,000 | $96,600 | $3,500 | $22,820 | +$70,280 |

Punto de equilibrio: Mes 2 (aprox. 25 campanas/mes).
Burn acumulado antes de positivo: ~$2,234 MXN.

---

## 6) Punto de equilibrio - Resumen ejecutivo

| Escenario | Mes equilibrio | Camps requeridas/mes | Burn total previo |
|---|---|---|---|
| Conservador | Mes 5 | 20 | ~$10,331 MXN |
| Base | Mes 3 | 22 | ~$4,638 MXN |
| Optimista | Mes 2 | 25 | ~$2,234 MXN |

### Formula de equilibrio mensual con variable al 20%

```text
Contribucion por campana despues del variable = 276 x (1 - 0.20) = 220.8 MXN

Campanas_para_equilibrio = (Base + AWS_servicios) / 220.8
```

Con base de $3,500 y AWS de $500:

```text
Campanas_para_equilibrio = (3,500 + 500) / 220.8 = 18.1
```

Resultado operativo: necesitas 19 campanas/mes para no perder dinero.

Rango real segun base acordada:
- Base $3,000 -> ~16 campanas/mes.
- Base $4,000 -> ~21 campanas/mes.

---

## 7) Semaforo de salud financiera mensual

| Campanas del mes | Estado | Accion |
|---|---|---|
| 0-10 | Critico | Ajustar oferta, discurso y canal de captacion en Cancun |
| 11-18 | Deficit controlado | Validar ejecucion semanal y conversion por etapa |
| 19-35 | Equilibrio | Mantener disciplina comercial y documentar playbook |
| 36-80 | Crecimiento | Reinvertir en operacion y sistema comercial |
| 80+ | Escalar | Evaluar segundo perfil comercial y expansion de ciudad |

---

## 8) Sensibilidades criticas

| Variable | Valor base | Impacto si cambia |
|---|---|---|
| Presupuesto promedio campana | $3,500 MXN | Si baja a $2,000, equilibrio sube a ~33 camps/mes |
| Comision plataforma | 12% | Si sube a 15% (absorbiendo Stripe), equilibrio baja a ~14 camps/mes |
| Stripe pass-through | No | Si activas pass-through, equilibrio baja a ~12 camps/mes |
| Tipo de cambio USD/MXN | 20:1 | Si sube a 22:1, costos AWS suben ~10% |
| Frecuencia por negocio | 1 campana/mes | Si sube a 2 campanas/mes, LTV se duplica |

---

## 9) LTV vs CAC - Control de adquisicion

Para decisiones comerciales, usa contribucion neta despues del variable:

```text
Contribucion neta por campana despues de variable = 276 x 0.80 = 220.8 MXN

LTV (6 meses, 1 campana/mes)  = 6 x 220.8 = 1,324.8 MXN
LTV (12 meses, 1 campana/mes) = 12 x 220.8 = 2,649.6 MXN

CAC maximo sostenible (payback < 3 meses) = 3 x 220.8 = 662.4 MXN
```

Con base de $3,500 y 12 negocios nuevos en un mes:

```text
CAC fijo prorrateado = 3,500 / 12 = 291.7 MXN por negocio
```

Ese nivel de CAC fijo es saludable frente al limite de ~$662.

---

## 10) Runway del fundador

Sin ventas, el burn mensual estimado es:

```text
Burn = Base + AWS minimo = 3,500 + 500 = 4,000 MXN/mes
```

| Runway disponible | Meses de aguante (burn $4,000/mes) |
|---|---|
| $50,000 MXN | 12.5 meses |
| $70,000 MXN | 17.5 meses |
| $100,000 MXN | 25.0 meses |
| $150,000 MXN | 37.5 meses |

Con este modelo, el riesgo de caja baja de forma importante frente a un sueldo fijo alto.

---

## 11) Palancas para mejorar margen (orden sugerido)

| # | Palanca | Impacto estimado | Plazo |
|---|---|---|---|
| 1 | Activar pass-through de Stripe | Equilibrio baja de 19 a ~12 camps/mes | Inmediato |
| 2 | Subir comision a 15% con traccion | Equilibrio baja a ~14 camps/mes (si absorbes Stripe) | Mes 4-6 |
| 3 | Comision 15% + pass-through | Equilibrio baja a ~10 camps/mes | Mes 4-6 |
| 4 | Subir frecuencia por negocio (2 campanas/mes) | Duplica LTV sin duplicar CAC | Continuo |
| 5 | Plan mensual para negocios (MRR) | Ingreso fijo recurrente | Mes 6-9 |

---

## 12) Acciones inmediatas (esta semana)

1. Fijar base de arranque en $3,500 MXN para el piloto.
2. Firmar acuerdo simple: 20% sobre neto + regla de atribucion + fecha de corte mensual.
3. Arrancar piloto en Cancun con la candidata definida y metas de 6 semanas.
4. Medir semanalmente: leads, reuniones, campanas publicadas, campanas fondeadas y tasa de cierre.
5. Hacer corte al dia 45 con decision Go/Hold/No-Go.

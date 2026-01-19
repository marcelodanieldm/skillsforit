# Playwright E2E Tests (Daily)

Este workflow de GitHub Actions ejecuta automáticamente todos los tests E2E de Playwright una vez por día (a las 03:00 UTC) y también permite ejecución manual.

## ¿Qué hace este workflow?
- Instala dependencias y navegadores Playwright.
- Ejecuta todos los tests Playwright definidos en el proyecto.
- Sube el reporte de resultados como artefacto.

## Ubicación del archivo
- `.github/workflows/playwright-e2e-daily.yml`

## ¿Cómo funciona?
- Se ejecuta automáticamente cada día por cron.
- Puede ejecutarse manualmente desde la pestaña "Actions" de GitHub.

## Personalización
- Puedes modificar la hora de ejecución cambiando el valor de `cron`.
- Agrega variables de entorno o pasos adicionales según tus necesidades.

---

**Ejemplo de ejecución manual:**
1. Ve a la pestaña "Actions" en tu repositorio de GitHub.
2. Selecciona el workflow "Playwright E2E Tests (Daily)".
3. Haz clic en "Run workflow".

---

Para más información sobre Playwright y GitHub Actions, consulta:
- https://playwright.dev/docs/ci
- https://docs.github.com/en/actions

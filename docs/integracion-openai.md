# Diagrama de Integración Externa: OpenAI

```mermaid
sequenceDiagram
    participant Usuario
    participant Frontend
    participant API
    participant OpenAI
    participant PDF
    Usuario->>Frontend: Sube CV
    Frontend->>API: Envía archivo y datos
    API->>OpenAI: Solicita análisis
    OpenAI->>API: Devuelve resultados
    API->>PDF: Genera reporte
    PDF->>API: Reporte listo
    API->>Usuario: Email con PDF
```

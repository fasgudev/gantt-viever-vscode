# Gantt Viewer

Extensión de VSCode para visualizar diagramas de Gantt desde archivos CSV.

## Características

- Visualiza diagramas de Gantt desde archivos CSV
- Filtros por responsable, categoría y estado (sin iniciar, en progreso, completado)
- Actualización automática al guardar el CSV
- Validación de datos con mensajes de error descriptivos

## Uso

1. Abre un archivo `.csv` con el formato requerido
2. Haz clic en el botón "Gantt: Preview from CSV" en la barra de título del editor
3. El diagrama de Gantt se mostrará en un panel lateral

## Formato del CSV

El archivo CSV debe tener las siguientes columnas:

| Columna | Requerida | Descripción |
|---------|-----------|-------------|
| id | Sí | Identificador único de la tarea |
| name | Sí | Nombre de la tarea |
| start | Sí | Fecha de inicio (formato configurable) |
| end | Sí | Fecha de fin (formato configurable) |
| progress | No | Porcentaje de progreso (0-100) |
| assigned | No | Responsable de la tarea |
| category | No | Categoría de la tarea |
| depends | No | Dependencias (IDs separados por `\|`) |

### Ejemplo de CSV

```csv
id,name,start,end,progress,assigned,category,depends
1,Diseño,2024-01-01,2024-01-15,100,Juan,Diseño,
2,Desarrollo,2024-01-10,2024-02-15,50,María,Desarrollo,1
3,Testing,2024-02-01,2024-02-28,0,Pedro,QA,2
```

## Configuración

Esta extensión contribuye las siguientes configuraciones:

### `ganttviewer.dateFormat`

Formato de fecha para el CSV.

| Valor | Ejemplo | Descripción |
|-------|---------|-------------|
| `YYYY-MM-DD` | 2024-01-31 | Año-Mes-Día (por defecto) |
| `DD-MM-YYYY` | 31-01-2024 | Día-Mes-Año |
| `MM-DD-YYYY` | 01-31-2024 | Mes-Día-Año |
| `DD/MM/YYYY` | 31/01/2024 | Día/Mes/Año |
| `MM/DD/YYYY` | 01/31/2024 | Mes/Día/Año |

### `ganttviewer.delimiter`

Delimitador de columnas del CSV.

| Valor | Descripción |
|-------|-------------|
| `,` | Coma (por defecto) |
| `;` | Punto y coma |

### Ejemplo de configuración

En tu `settings.json`:

```json
{
  "ganttviewer.dateFormat": "DD/MM/YYYY",
  "ganttviewer.delimiter": ";"
}
```

## Validaciones

La extensión valida automáticamente:

- Columnas requeridas presentes (id, name, start, end)
- Formato de fecha correcto según configuración
- Fecha de inicio no mayor a fecha de fin
- Campos requeridos no vacíos
- Delimitador correcto (sugiere cambio si detecta otro)

## Requisitos

- VSCode 1.108.0 o superior

## Problemas conocidos

Ninguno por el momento.

## Notas de versión

### 0.0.1

- Versión inicial
- Visualización de Gantt desde CSV
- Filtros por responsable, categoría y estado
- Configuración de formato de fecha y delimitador
- Validación de datos con mensajes de error

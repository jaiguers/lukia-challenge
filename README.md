# 🤖 Intelligent Task Management Agent

Un agente inteligente autónomo construido con NestJS + TypeScript que utiliza OpenAI Tools (function calling) para interactuar con la Tasks API. El agente es capaz de interpretar instrucciones del usuario, crear tareas, generar subtareas automáticamente y gestionar operaciones completas de tareas.

## 🎯 Características

- **Agente Inteligente**: Utiliza OpenAI GPT-4 con function calling para razonar y ejecutar acciones
- **Gestión de Tareas**: Crea, actualiza, completa y elimina tareas con soporte para estados `pending`, `in_progress` y `completed`
- **Generación Automática de Subtareas**: Usa IA para descomponer tareas complejas en subtareas accionables
- **Visualización de Árboles**: Muestra la estructura jerárquica completa de tareas y subtareas
- **CLI Interactivo**: Interfaz de línea de comandos para conversar con el agente
- **Arquitectura Modular**: Código limpio siguiendo principios SOLID

## 📋 Requisitos Previos

- Node.js >= 18.x
- npm o yarn
- Una cuenta de OpenAI con API key
- Acceso a la Tasks API (ver sección de configuración)

## 🚀 Instalación

> **📖 Para una guía detallada de configuración completa (incluyendo la API de referencia), consulta [SETUP.md](./SETUP.md)**

### Instalación Rápida

1. **Clonar el repositorio** (o navegar al directorio del proyecto):
   ```bash
   cd lukia-challenge
   ```

2. **Instalar dependencias**:
   ```bash
   npm install
   ```

3. **Configurar variables de entorno**:
   Copia el archivo `env.example.txt` y créalo como `.env`:
   ```bash
   # En Windows PowerShell
   Copy-Item env.example.txt .env
   
   # En Linux/Mac
   cp env.example.txt .env
   ```
   
   Edita el archivo `.env` con tus credenciales:
   ```env
   OPENAI_API_KEY=tu_openai_api_key_aqui
   TASKS_API_BASE_URL=http://localhost:3000/api
   ```

4. **Asegúrate de tener la Tasks API ejecutándose**:
   - La API de referencia está en: https://github.com/nietoga/tasks-api
   - Clona y ejecuta la API según sus instrucciones
   - Verifica que esté disponible en `http://localhost:3000`

## 🔧 Configuración de la Tasks API

Este proyecto utiliza la **Tasks API de referencia** disponible en: https://github.com/nietoga/tasks-api

### Pasos para configurar la API de referencia:

1. **Clonar el repositorio de la API** (en un directorio separado):
   ```bash
   git clone https://github.com/nietoga/tasks-api.git
   cd tasks-api
   ```

2. **Seguir las instrucciones de despliegue del repositorio** (generalmente):
   ```bash
   npm install
   # Configurar variables de entorno según las instrucciones del repo
   npm run start:dev  # o el comando que indique el repo
   ```

3. **Verificar que la API esté corriendo**:
   - La API debería estar disponible en `http://localhost:3000` (o el puerto configurado)
   - Puedes acceder a la documentación Swagger en: `http://localhost:3000/documentation`

4. **Configurar la URL en el archivo `.env`** de este proyecto:
   ```env
   TASKS_API_BASE_URL=http://localhost:3000/api
   ```

### Esquema de datos de la API:

La API maneja tareas con jerarquía mediante el siguiente esquema:

```typescript
interface Task {
  id: string;  // ObjectId de MongoDB
  title: string;
  description: string | null;
  status: 'pending' | 'in_progress' | 'completed';
  parentId: string | null;  // ObjectId de MongoDB o null
  createdAt?: string;
  updatedAt?: string;
}

interface TaskTree extends Task {
  subtasks?: TaskTree[];
}
```

### Endpoints disponibles:

- `POST /api/tasks` - Crear una tarea
- `GET /api/tasks` - Listar tareas
- `GET /api/tasks/{id}` - Obtener tarea y subtareas inmediatas
- `PATCH /api/tasks/{id}` - Actualizar una tarea
- `DELETE /api/tasks/{id}` - Eliminar recursivamente
- `GET /api/tasks/{id}/tree` - Obtener toda la jerarquía

> **Nota**: La API valida automáticamente la consistencia entre tareas y subtareas, especialmente en los cambios de estado.

## 📖 Uso

### Ejecutar el CLI

```bash
npm run cli
```

O en modo desarrollo:

```bash
npm run dev
```

### Compilar el proyecto

```bash
npm run build
```

### Ejecutar la versión compilada

```bash
npm start
```

## 💬 Ejemplo de Conversación

Una vez que el CLI está ejecutándose, puedes interactuar con el agente:

```
🤖 Intelligent Task Management Agent

Welcome! I can help you organize and manage your tasks.

Type "exit" or "quit" to leave, or "clear" to reset the conversation.

You: Organiza un viaje a Japón

🤔 Processing...

📝 Reasoning Steps:
   1. Received user input: "Organiza un viaje a Japón"
   2. Agent reasoning: I'll help you organize a trip to Japan. Let me create a root task for this.
   3. Executing tool: create_task with arguments: {"title":"Organizar viaje a Japón"}
   4. Tool result: Task "Organizar viaje a Japón" created successfully
   5. Executing tool: break_down_task with arguments: {"taskId":"123","taskTitle":"Organizar viaje a Japón"}
   6. Tool result: Task broken down into 5 subtasks
   7. Executing tool: show_tree with arguments: {"taskId":"123"}
   8. Tool result: Task tree retrieved successfully

🔧 Tool Executions:
   ✓ create_task - Task "Organizar viaje a Japón" created successfully
   ✓ break_down_task - Task broken down into 5 subtasks
   ✓ show_tree - Task tree retrieved successfully

📋 Task Tree:
└── ○ Organizar viaje a Japón [123]
    ├── ○ Reservar vuelos [124]
    ├── ○ Reservar alojamiento [125]
    ├── ○ Obtener visa japonesa [126]
    ├── ○ Crear itinerario de viaje [127]
    └── ○ Preparar documentos de viaje [128]

🤖 Agent: I've successfully organized your trip to Japan! I created a root task and broke it down into 5 actionable subtasks: booking flights, reserving accommodation, obtaining a Japanese visa, creating a travel itinerary, and preparing travel documents.
```

### Comandos Especiales

- `exit` o `quit` - Salir del CLI
- `clear` - Limpiar el historial de conversación

### Operaciones Disponibles

El agente puede realizar las siguientes operaciones a través de comandos naturales:

- **Crear tareas**: "Crea una tarea para comprar leche"
- **Descomponer tareas**: "Organiza un viaje a Japón" (crea y descompone automáticamente)
- **Iniciar tareas**: "Inicia la tarea X" (marca como in_progress)
- **Completar tareas**: "Marca como completada la tarea X"
- **Actualizar tareas**: "Actualiza la tarea X con el título Y"
- **Eliminar tareas**: "Elimina la tarea X"
- **Ver árbol**: "Muestra el árbol de la tarea X"

## 🏗️ Arquitectura del Proyecto

```
/src
  /agent
    agent.ts          # Clase principal del agente inteligente
    messages.ts       # Gestión de historial de mensajes
  
  /tools
    createTask.ts     # Tool para crear tareas
    breakDownTask.ts  # Tool para descomponer tareas usando IA
    updateTask.ts     # Tool para actualizar tareas
    startTask.ts      # Tool para marcar tareas como in_progress
    completeTask.ts   # Tool para completar tareas
    deleteTask.ts     # Tool para eliminar tareas
    showTree.ts       # Tool para mostrar árbol de tareas
    index.ts          # Exportaciones centralizadas de tools
  
  /api
    tasksApi.ts       # Cliente para la Tasks API
  
  /cli
    index.ts          # Interfaz de línea de comandos interactiva
  
  index.ts            # Punto de entrada principal
```

## 🔨 Principios SOLID Aplicados

- **Single Responsibility**: Cada tool y clase tiene una responsabilidad única
- **Open/Closed**: Las tools son extensibles sin modificar el código existente
- **Liskov Substitution**: Las tools pueden ser intercambiadas sin afectar el agente
- **Interface Segregation**: Interfaces específicas para cada operación
- **Dependency Inversion**: El agente depende de abstracciones (tools), no implementaciones concretas

## 🛠️ Tecnologías Utilizadas

- **TypeScript**: Lenguaje de programación
- **OpenAI API**: Modelo GPT-4 con function calling
- **Axios**: Cliente HTTP para la Tasks API
- **Inquirer**: CLI interactivo
- **dotenv**: Gestión de variables de entorno
- **Zod**: Validación de esquemas (opcional, disponible para uso futuro)

## 📝 Variables de Entorno

| Variable | Descripción | Requerida |
|----------|-------------|-----------|
| `OPENAI_API_KEY` | API key de OpenAI | Sí |
| `TASKS_API_BASE_URL` | URL base de la Tasks API | Sí |
| `OPENAI_MODEL` | Modelo de OpenAI a usar (default: gpt-4-turbo-preview) | No |
| `OPENAI_TEMPERATURE` | Temperatura para el modelo (default: 0.7) | No |

## 🤝 Contribuir

Este es un proyecto de demostración. Siéntete libre de sugerir mejoras o hacer fork del proyecto.

## 📄 Licencia

MIT

## 🎥 Demostración

Este proyecto está listo para grabar un video demostrativo. Para usar:

1. Asegúrate de tener la Tasks API ejecutándose
2. Configura las variables de entorno
3. Ejecuta `npm run cli`
4. Interactúa con el agente usando comandos naturales en español o inglés

El agente mostrará todo el proceso de razonamiento y las acciones ejecutadas, perfecto para una demostración visual.

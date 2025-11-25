# 🚀 Guía de Configuración Completa

Esta guía explica cómo configurar tanto la API de referencia como el CLI del agente.

## 📦 Estructura del Proyecto

Este proyecto está compuesto por **dos repositorios separados**:

1. **Tasks API** (repositorio de referencia): https://github.com/nietoga/tasks-api
   - Proporciona los endpoints REST para gestionar tareas
   - Debe ejecutarse como un servicio separado

2. **Intelligent Agent CLI** (este repositorio)
   - Proporciona el agente inteligente con OpenAI Tools
   - Se conecta a la Tasks API para realizar operaciones

## 🔧 Configuración Paso a Paso

### Paso 1: Configurar la Tasks API (Repositorio de Referencia)

1. **Clonar el repositorio de la API** (en un directorio separado):
   ```bash
   # En un directorio diferente (por ejemplo: ~/projects/)
   git clone https://github.com/nietoga/tasks-api.git
   cd tasks-api
   ```

2. **Instalar dependencias**:
   ```bash
   npm install
   ```

3. **Configurar variables de entorno** según las instrucciones del repositorio:
   ```bash
   # Revisa el README del repositorio tasks-api
   # para las variables de entorno necesarias
   ```

4. **Iniciar la API**:
   ```bash
   npm run start:dev
   # o el comando que indique el repositorio
   ```

5. **Verificar que la API esté funcionando**:
   - Accede a: `http://localhost:3000/documentation` (Swagger)
   - Verifica que los endpoints estén disponibles

### Paso 2: Configurar el Intelligent Agent CLI (Este Repositorio)

1. **Asegúrate de estar en el directorio del CLI**:
   ```bash
   cd lukia-challenge
   ```

2. **Instalar dependencias**:
   ```bash
   npm install
   ```

3. **Crear archivo `.env`**:
   ```bash
   # Copiar el ejemplo
   cp env.example.txt .env
   ```

4. **Configurar variables de entorno en `.env`**:
   ```env
   OPENAI_API_KEY=tu_openai_api_key_aqui
   TASKS_API_BASE_URL=http://localhost:3000/api
   
   # Opcionales
   OPENAI_MODEL=gpt-4-turbo-preview
   OPENAI_TEMPERATURE=0.7
   ```

5. **Verificar que la URL de la API coincida**:
   - Asegúrate de que `TASKS_API_BASE_URL` apunte al puerto correcto
   - Por defecto: `http://localhost:3000/api`
   - Si la API corre en otro puerto, ajusta la URL

### Paso 3: Ejecutar el Sistema Completo

1. **Terminal 1 - Tasks API**:
   ```bash
   cd tasks-api
   npm run start:dev
   ```
   Deberías ver algo como:
   ```
   [Nest] Application is running on: http://localhost:3000
   ```

2. **Terminal 2 - Intelligent Agent CLI**:
   ```bash
   cd lukia-challenge
   npm run cli
   ```
   Deberías ver:
   ```
   🤖 Intelligent Task Management Agent
   
   Welcome! I can help you organize and manage your tasks.
   ```

3. **Probar el sistema**:
   ```
   You: Organiza un viaje a Japón
   ```

## 🗂️ Estructura de Directorios Recomendada

Para mantener todo organizado, puedes estructurar tus proyectos así:

```
~/projects/
  ├── tasks-api/           # Repositorio de referencia (clonado)
  │   ├── src/
  │   ├── package.json
  │   └── ...
  │
  └── lukia-challenge/     # Este repositorio (CLI)
      ├── src/
      ├── package.json
      ├── .env
      └── ...
```

## 🔍 Verificación de Conexión

Para verificar que el CLI puede conectarse a la API:

1. **Verifica que la API esté corriendo**:
   ```bash
   curl http://localhost:3000/api/tasks
   ```

2. **Revisa la documentación Swagger**:
   Abre en tu navegador: `http://localhost:3000/documentation`

3. **Prueba el CLI**:
   ```bash
   npm run cli
   ```
   Luego intenta crear una tarea simple:
   ```
   You: Crea una tarea de prueba
   ```

## ⚠️ Solución de Problemas

### Error: "Cannot connect to Tasks API"

- Verifica que la Tasks API esté ejecutándose
- Revisa que `TASKS_API_BASE_URL` en `.env` sea correcta
- Prueba acceder manualmente a la URL en el navegador

### Error: "OpenAI API key is not set"

- Verifica que hayas creado el archivo `.env`
- Asegúrate de que `OPENAI_API_KEY` tenga un valor válido

### Error: "Tasks API returned error"

- Revisa los logs de la Tasks API
- Verifica que la API esté configurada correctamente
- Consulta la documentación Swagger en `/documentation`

## 📝 Notas Importantes

1. **No necesitas modificar el repositorio de la Tasks API** - Solo necesitas ejecutarlo
2. **Los dos proyectos son independientes** - Solo se comunican vía HTTP
3. **El CLI puede conectarse a cualquier instancia de la API** - Solo cambia `TASKS_API_BASE_URL`
4. **Puedes desarrollar ambos proyectos en paralelo** - Usa dos terminales o ventanas

## 🎯 Flujo de Trabajo Recomendado

1. Inicia la Tasks API primero
2. Verifica que esté funcionando en el navegador
3. Inicia el CLI del agente
4. Usa el CLI para interactuar con la API a través del agente

## 🔗 Enlaces Útiles

- Tasks API Repository: https://github.com/nietoga/tasks-api
- Tasks API Documentation: `http://localhost:3000/documentation` (cuando esté corriendo)
- OpenAI API: https://platform.openai.com/


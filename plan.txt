# Plan de Implementación: Correcciones y Mejoras SarriaTech

Este plan aborda las optimizaciones, la resolución de errores en React, la corrección del flujo de creación de cursos y la configuración de Google Auth.

## User Review Required

> [!IMPORTANT]
> **Pasos del Formulario:** La transición del creador de cursos pasará de 3 pasos a 7 pasos independientes en el frontend. La base de datos persistirá la información por pasos mediante API REST estándar.

---

## Proposed Changes

### 1. Panel de Administración (`AdminDashboard.tsx` & `admin.routes.ts`)

#### [MODIFY] [admin.routes.ts](file:///c:/Informacion%20David/Desarrollo/plaform_videos/backend/src/routes/admin.routes.ts)
* Modificar el endpoint `GET /overview` para:
  * Consultar certificados y asociarlos a los estudiantes en cada curso.
  * Devolver el estado de la matrícula (`status`) de cada estudiante inscrita.

#### [MODIFY] [AdminDashboard.tsx](file:///c:/Informacion%20David/Desarrollo/plaform_videos/frontend/src/pages/admin/AdminDashboard.tsx)
* Modificar la vista de listado de cursos:
  * Cada curso se renderizará inicialmente en una tarjeta colapsable con información de resumen (Imagen, Título, Instructor, Categoría, Estado, Inscritos, Calificación promedio) y un botón de alternancia (flecha).
  * Al hacer clic en expandir, se muestra:
    * **Información del Curso:** Descripción, cantidad de módulos y lecciones, precio, fecha de creación y estado del curso.
    * **Información de Estudiantes:** Tabla de estudiantes mostrando nombre, correo, fecha de inscripción, porcentaje de avance, si obtuvo certificado y el estado actual del curso.

---

### 2. Corrección y Refactorización del Asistente de Creación de Cursos (`CourseCreator.tsx`)

#### [MODIFY] [CourseCreator.tsx](file:///c:/Informacion%20David/Desarrollo/plaform_videos/frontend/src/pages/instructor/CourseCreator.tsx)
* Refactorizar el visor a un flujo de **7 pasos**:
  1. **Información General:** Título y Descripción.
  2. **Configuración del Curso:** Categoría, Nivel, Precio y URL de Imagen.
  3. **Módulos:** Crear, nombrar y ordenar módulos.
  4. **Lecciones:** Crear, editar títulos/descripciones y marcar lecciones de vista previa (`isFree`) dentro de los módulos.
  5. **Videos:** Subir videos correspondientes a cada lección.
  6. **Recursos Descargables:** Subir archivos de apoyo (ZIP, PDF, etc.) para cada lección.
  7. **Vista Previa y Publicación:** Resumen global y botón de Publicar o Guardar Borrador.
* Corregir validaciones de pasos y permitir avanzar y retroceder manteniendo persistencia en el store de Zustand (`useInstructorStore`).
* Solucionar el problema en el modo de edición de cursos cargando todos los datos necesarios.

#### [MODIFY] [useInstructorStore.ts](file:///c:/Informacion%20David/Desarrollo/plaform_videos/frontend/src/store/useInstructorStore.ts) & [instructor.ts](file:///c:/Informacion%20David/Desarrollo/plaform_videos/frontend/src/types/instructor.ts)
* Adaptar el store para soportar la carga y persistencia local de los nuevos pasos (incluyendo recursos descargables).

---

### 3. Corrección del Error de React `insertBefore`

#### [MODIFY] [CourseCreator.tsx](file:///c:/Informacion%20David/Desarrollo/plaform_videos/frontend/src/pages/instructor/CourseCreator.tsx)
* Reemplazar las condiciones de renderizado adyacentes a textos dinámicos por estructuras estables envueltas en contenedores HTML fijos (como etiquetas `span` o `div`), evitando que React pierda la referencia al reemplazar elementos del DOM (ej. en líneas de renderizado de cargando/guardando).

---

### 4. Implementar Error Boundaries en React

#### [NEW] [ErrorBoundary.tsx](file:///c:/Informacion%20David/Desarrollo/plaform_videos/frontend/src/components/common/ErrorBoundary.tsx)
* Crear un componente de clase `ErrorBoundary` estándar para capturar excepciones no controladas de React en componentes secundarios y mostrar un mensaje de fallback amigable al usuario.
* Registrar el error en la consola del desarrollador.
* Envolver la aplicación global (`main.tsx`) y envolver secciones clave como el visor de cursos (`CourseViewer.tsx`) y el panel de administración (`AdminDashboard.tsx`).

---

### 5. Corrección de Google Authentication

#### [MODIFY] [GoogleAuthButton.tsx](file:///c:/Informacion%20David/Desarrollo/plaform_videos/frontend/src/components/auth/GoogleAuthButton.tsx)
* Corregir el aviso `GSI_LOGGER: Provided button width is invalid: 100%` especificando un ancho numérico válido admitido por la API de Google Identity Services o desactivando la asignación del ancho del 100% de forma directa que produce advertencias.

---

## Verification Plan

### Automated Tests
- Ejecutar `npx tsc --noEmit` en frontend y backend para comprobar que no existan errores de tipos.

### Manual Verification
- Iniciar sesión como Administrador y verificar que el dashboard cargue en acordeones colapsados por defecto, expandiendo uno a uno y validando datos.
- Probar el asistente de 7 pasos creando un nuevo curso y validando cada sección.
- Forzar un error controlado para probar la pantalla de contingencia del `ErrorBoundary`.

# Un editor visual más sencillo

## Contexto y evidencia

El usuario solicita simplificar el estudio siguiendo una referencia de selectores grandes de forma, expresión y color. El editor anterior repite la lista de agentes, usa una barra lateral completa y muestra una secuencia incluso durante la edición de apariencia.

- Referencia: `/var/folders/nx/rc_qqyp90sn37wzm__4fhv5r0000gn/T/codex-clipboard-2bfdf006-73fc-4546-8aa8-d3e7301b19ec.png`.
- Antes: [ui-before.png](ui-before.png).
- Ruta: `http://127.0.0.1:5191/?coleccion=ingredientes` y colección Original.
- Linear: no se pudo crear la tarea porque el conector requiere reautenticación. Este documento conserva la especificación para traspasarla.

## Alcance

Una única lista horizontal de agentes, vista previa amplia y selectores visuales de forma, las 16 expresiones existentes en el motor y color. Accesorios, identidad y ajustes detallados siguen disponibles. La secuencia se muestra en Animar; Integrar conserva el código y las exportaciones. Sin cambios en almacenamiento, vídeos, recursos originales, motor o modelo de colecciones.

## Superficies y componentes

`AgentStudio.vue`, `CollectionSwitcher.vue`, `studio.css`, controles de apariencia y catálogo de expresiones. Los diálogos de exportación y presentación comparten estilos básicos y requieren revisión de regresión.

## Experiencia objetivo

- Cabecera pequeña con colección, guardar, presentar y exportar; menú de proyecto para importar y duplicar.
- Una sola fila de personajes. El seleccionado se identifica con contorno oscuro y `aria-pressed`.
- Vista previa limpia, sin cuadrícula ni adornos iniciales; pausa y vista de equipo accesibles.
- Forma y expresión en cuadrículas de cuatro columnas con miniaturas SVG reales y texto. Color en círculos grandes con anillo de selección.
- Al elegir expresión se vuelve al estado en reposo, para que un movimiento o secuencia anterior no oculte la cara elegida.
- Ajustes secundarios plegados por defecto, sin perder sus valores.
- En móvil, vista previa antes de los controles; sin desbordamiento horizontal. Controles de al menos 44 px y foco visible.
- Se mantienen las dos colecciones, su persistencia independiente, importación, exportación y vídeos.

## Criterios de aceptación y QA

1. Elegir forma, expresión y color actualiza el mismo agente en la vista previa y exportación.
2. Las 16 expresiones se pueden guardar e importar; los proyectos anteriores siguen siendo válidos.
3. Cambiar colección conserva ajustes anteriores y permite volver a ellos.
4. Animar conserva edición, orden y duración de escenas; Diseñar oculta la secuencia.
5. Presentar y descargar entregan el vídeo de la colección correcta; el diálogo de exportación sigue operativo.
6. Navegación por teclado y revisión visual en escritorio y móvil.
7. Compilación, pruebas pertinentes y comprobación de los recursos anteriores. Capturas después en este directorio.

## Implementación y entrega

Continuación en `codex/qamarero-agent-studio` y el PR borrador existente #1. No se modifican datos guardados del usuario al cambiar la disposición.

Implementado y comprobado: 237 pruebas en 20 archivos; tipos y compilación correctos. Revisión visual de escritorio y móvil de 390 px, controles de ambas colecciones, Animar, exportación y presentación de Ingredientes. Los 14 recursos originales mantienen sus hashes. Capturas: [escritorio](ui-simple.png) y [móvil](ui-mobile.png).

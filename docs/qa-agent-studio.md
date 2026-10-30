# Verificación de Qamarero Agent Studio

Comprobado el 30 de octubre de 2026 con Node 22.13, pnpm 11.17 y Chromium.

- Instalación con lockfile: correcta, sin dependencias nuevas.
- `pnpm test`: 20 archivos y 237 pruebas correctas, incluidas las originales.
- `pnpm build`: comprobación de tipos y compilación de producción correctas.
- Generación de recursos: cinco SVG fijos, cinco animados, proyecto JSON y lámina del equipo.

La primera carpeta de trabajo en Documents devolvió errores de lectura y timeouts de workers. Se verificó una copia del mismo código fuente y lockfile fuera de esa carpeta: las pruebas pasaron en 5,59 segundos y Vite compiló en 833 ms después de comprobar tipos. El checkout de desarrollo se conserva fuera de Documents.

## Navegador

- Escritorio de 1440 px: selección de cinco agentes, vista individual y de equipo, nombre y combinaciones de accesorios.
- Guardado: renombrar QPhone, añadir un gorro de chef, guardar y recargar; se conservan ambos cambios.
- Secuencia: añadir un estado, cambiar duración, reordenar y borrar escenas.
- Integración: el ejemplo importa y valida el JSON del proyecto, conservando las ediciones.
- Móvil de 390 px: documento de 390 px, propiedades apiladas, tiras con desplazamiento interno y diálogo dentro del viewport.
- Movimiento reducido: la reproducción se pausa al activar la preferencia del sistema.
- SVG animado: matrices distintas al avanzar CSS y bucle con fotograma final igual al inicial.
- SVG, PNG, GIF y MP4 de dos estados a 256 px: blobs no vacíos y tipos correctos. GIF de 91 KB y MP4 de 69 KB en este navegador; los tamaños dependen del codificador.
- Versión compilada: arranque del estudio y del editor original tras recargar `/#original`. La exportación de vídeo produce la solicitud de descarga; el navegador de automatización canceló la transferencia al intentar guardarla, por lo que esa transferencia no se da por verificada.
- Consola: sin errores de aplicación durante los recorridos funcionales.

Capturas: [escritorio](studio-desktop.png), [móvil](studio-mobile.png), [equipo](studio-team.png) y [lámina](qamarero-team.png).

La comprobación del codificador corresponde a Chromium con AVC/WebCodecs disponible. Los personajes no incluyen servicios de IA ni sincronización remota.

## Corrección de las gafas

Las dos lentes comparten una montura circular y un puente, con separación mínima entre los aros. La apertura de los párpados no modifica la montura. Se comprobó la separación en los seis estados, tanto con ojos abiertos como durante el parpadeo; los tres nuevos tests cubren tamaños de accesorio, rigidez y alineación del puente. Compilación correcta; la suite actual se indica al principio de este documento. [Vista de Carta corregida](carta-glasses.png).

## Colección Ingredientes

Se conserva la colección anterior y se añade una variante independiente. Se han verificado los proyectos antiguos, los cambios pendientes al alternar, el fallo de cuota de almacenamiento y una copia más reciente guardada desde otra pestaña. El vídeo y los SVG originales mantienen sus hashes. Véase [la comprobación de Ingredientes](ingredients.md).

## Editor simplificado

Revisado en el navegador integrado: escritorio y móvil de 390 px, selección de colecciones, vista previa, Animar y su secuencia, diálogo de exportación y presentación de Ingredientes con el MP4 correcto. Las nuevas pruebas montan el editor real: comprueban selección y guardado de forma, expresión y color, vuelta al reposo cuando otro movimiento ocultaría la expresión y conservación de cada colección al alternar. Los 14 recursos anteriores conservan sus hashes.

Capturas: [antes](ui-before.png), [editor simplificado](ui-simple.png), [móvil](ui-mobile.png). [Especificación y alcance](simple-ui.md).

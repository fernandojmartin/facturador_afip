# Facturador AFIP
Éste es un sistema simple basado en NodeJS y Puppeteer para automatizar la generación de comprobantes electrónicos de AFIP.  

Quienes emiten varios comprobantes saben lo tedioso y lento de generar cada uno de ellos.  
Con este bot se pueden cargar todos los datos necesarios en un archivo JSON y se generarán todos éstos en la web.   
Como no utiliza servicios ni API de AFIP no requiere autenticación ni emisión de certificados ni lidiar con XML.
Simplemente "imita" el comportamiento de un usuario final, de manera automatizada.
Se le entregan las credenciales del contribuyente, los comprobantes a generar y corre solo.

# Inicializar proyecto
```bash
git clone https://github.com/fernandojmartin/facturador_afip
cd facturador_afip
npm install
```
# Ejecutarlo
El proyecto está pensado para ejecutarse desde la línea de comandos.
```bash
 node run.js
```
El bot espera que se le indique un archivo json el cual contiene dos propiedades de raiz: `contribuyente` y `comprobantes`.  

El script tiene una consola interactiva que solicitará el nombre del archivo con los datos, tanto del contribuyente como los comprobantes a emitir.  

Cada comprobante tiene su propia estructura.  
Se pueden ver los modelos y las validaciones dentro de [Models](./Domain/Models) y los archivos tienen por nombre `<tipo_comprobante>.js`.  

Luego de corroborar que el archivo exista, se validan **la estructura** de datos del contribuyente, y luego se repasa cada comprobante encontrado.  
Cada uno de ellos es validado en su estructura y se computa la cantidad de ellos.  
Finalmente, el sistema solicita al usuario que confirme el nombre del contribuyente encontrado y la cantidad y tipo de comprobantes.

---

### TODO:
* Agregar ejemplos gráficos a la documentación
* Validar errores explícitos y timeouts
* Calcular tiempo insumido
* Agregar detalles del comprobante al output (contribuyente, etc)
* Eliminar comprobantes generados satisfactoriamente del array inicial
* Opción de descarga de comprobantes generados
* Manejar otros tipos de medio de pago
* Permitir agregar múltiples items por comprobante
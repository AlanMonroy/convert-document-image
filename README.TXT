# Convertir Documento API

API en Node.js para convertir PDFs en imágenes Base64.

## Uso

**POST** `/convertir`

**Body JSON**:

```json
{
  "valorBuscado": "CERTIFICACION DIGITAL DE TESORERIA",
  "fileUrl": "https://tu_servidor.com/archivo.pdf"
}

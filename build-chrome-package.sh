#!/bin/bash

# Nombre del paquete
ZIP_NAME="serie9-chrome-app.zip"

# Archivos esperados
REQUIRED_FILES=("index.html" "style.css" "script.js" "manifest.json" "service-worker.js" "icon-192.png" "icon-512.png")

echo "🔍 Verificando archivos necesarios..."

for FILE in "${REQUIRED_FILES[@]}"; do
  if [ ! -f "$FILE" ]; then
    echo "❌ Falta: $FILE"
    MISSING=true
  fi
done

if [ "$MISSING" = true ]; then
  echo "⛔ No se puede generar el zip. Asegúrate de tener todos los archivos requeridos."
  exit 1
fi

# Elimina el zip anterior si existe
rm -f "$ZIP_NAME"

# Crea el nuevo zip
echo "📦 Generando archivo $ZIP_NAME..."
zip -r "$ZIP_NAME" index.html style.css script.js manifest.json service-worker.js icon-192.png icon-512.png

echo "✅ Paquete generado exitosamente: $ZIP_NAME"
echo "📤 Ahora puedes subirlo a https://chromewebstore.google.com/ usando tu cuenta de desarrollador."

#!/bin/bash

# build-chrome-package.sh - Script dinámico para crear el paquete de extensión Chrome

# Nombre del archivo de salida
OUTPUT_FILE="serie9-chrome-extension.zip"

# Archivos y carpetas a excluir (agrega más según necesites)
EXCLUDES=(
    "build-chrome-package.sh"
    ".git"
    ".gitignore"
    "node_modules"
    "*.zip"
    ".DS_Store"
    "Thumbs.db"
    "*.log"
    "*.md"
    ".vscode"
    ".idea"
)

# Función para crear la cadena de exclusiones
create_exclude_string() {
    local exclude_string=""
    for item in "${EXCLUDES[@]}"; do
        exclude_string="$exclude_string -x '$item'"
    done
    echo "$exclude_string"
}

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}🚀 Iniciando empaquetado de Serie9 para Chrome Web Store...${NC}"

# Verificar si existe un zip anterior y eliminarlo
if [ -f "$OUTPUT_FILE" ]; then
    echo -e "${YELLOW}⚠️  Eliminando versión anterior del paquete...${NC}"
    rm "$OUTPUT_FILE"
fi

# Crear lista de archivos y carpetas a incluir
echo -e "${GREEN}📁 Escaneando estructura del proyecto...${NC}"

# Crear el comando zip dinámicamente
ZIP_COMMAND="zip -r '$OUTPUT_FILE' ."

# Agregar exclusiones
EXCLUDE_STRING=$(create_exclude_string)
ZIP_COMMAND="$ZIP_COMMAND $EXCLUDE_STRING"

# Mostrar archivos que se incluirán
echo -e "${GREEN}📋 Archivos y carpetas que se incluirán:${NC}"
find . -type f -not -path '*/\.*' \
    -not -name "*.zip" \
    -not -name "*.log" \
    -not -name "*.md" \
    -not -name "build-chrome-package.sh" \
    -not -path "*/node_modules/*" | sort

# Contar archivos
FILE_COUNT=$(find . -type f -not -path '*/\.*' \
    -not -name "*.zip" \
    -not -name "*.log" \
    -not -name "*.md" \
    -not -name "build-chrome-package.sh" \
    -not -path "*/node_modules/*" | wc -l)

echo -e "${YELLOW}📊 Total de archivos a incluir: $FILE_COUNT${NC}"

# Confirmar antes de proceder
read -p "¿Deseas continuar con el empaquetado? (s/n): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Ss]$ ]]; then
    echo -e "${RED}❌ Operación cancelada${NC}"
    exit 1
fi

# Ejecutar el comando zip
echo -e "${GREEN}📦 Creando paquete...${NC}"
eval $ZIP_COMMAND

# Verificar si el zip se creó correctamente
if [ -f "$OUTPUT_FILE" ]; then
    # Obtener el tamaño del archivo
    FILE_SIZE=$(du -h "$OUTPUT_FILE" | cut -f1)

    echo -e "${GREEN}✅ Paquete creado exitosamente!${NC}"
    echo -e "${GREEN}📦 Archivo: $OUTPUT_FILE${NC}"
    echo -e "${GREEN}📏 Tamaño: $FILE_SIZE${NC}"

    # Mostrar contenido del zip
    echo -e "${YELLOW}📋 Contenido del paquete:${NC}"
    unzip -l "$OUTPUT_FILE" | grep -E "Name|------|files" | head -20
    echo "..."

    # Verificar archivos importantes
    echo -e "${YELLOW}🔍 Verificando archivos esenciales...${NC}"
    ESSENTIAL_FILES=("manifest.json" "index.html" "style.css" "script.js")

    for file in "${ESSENTIAL_FILES[@]}"; do
        if unzip -l "$OUTPUT_FILE" | grep -q "$file"; then
            echo -e "${GREEN}✓ $file encontrado${NC}"
        else
            echo -e "${RED}✗ $file NO encontrado${NC}"
        fi
    done

    # Mostrar estructura de carpetas
    echo -e "${YELLOW}📂 Estructura de carpetas incluidas:${NC}"
    unzip -l "$OUTPUT_FILE" | grep -E "/$" | awk '{print $4}' | sort | uniq

else
    echo -e "${RED}❌ Error al crear el paquete${NC}"
    exit 1
fi

echo -e "${GREEN}🎉 ¡Proceso completado!${NC}"
echo -e "${YELLOW}📤 El archivo está listo para subir a Chrome Web Store${NC}"
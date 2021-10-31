#!/bin/bash

if ! command -v xsv 2> /dev/null > /dev/null; then
    echo 'Install xsv: https://github.com/BurntSushi/xsv#installation' 2>&1
    exit 1
fi

mkdir -p data

CSV_PATH=data/releases_documents_items.csv
# we could curl and pipe, but the file is 238M, so let's cache
wget -c https://cdn.buenosaires.gob.ar/datosabiertos/datasets/ministerio-de-economia-y-finanzas/buenos-aires-compras/releases_documents_items.csv -O "$CSV_PATH"
for url in $(cat "$CSV_PATH"| xsv select 'tender/documents/0/url'  |sort |uniq|grep -v 'tender/documents/0/url'); do
    path="${url//\//_}"
    if [ ! -f "data/$path" ]; then
        wget "$url" -O "data/$path"
    else
        echo "$url already downloaded" >&2
    fi
done

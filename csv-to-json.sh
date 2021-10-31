#!/bin/bash

COLS="tender/title,tender/description,tender/status,tender/value/currency,tender/value/amount,tender/procuringEntity/name,tender/procurementMethodDetails,tender/mainProcurementCategory,tender/tenderPeriod/startDate,tender/tenderPeriod/endDate,tender/tenderPeriod/durationInDays,tender/enquiryPeriod/startDate,tender/enquiryPeriod/endDate,tender/enquiryPeriod/durationInDays,tender/documents/0/url"
CSV_PATH=data/releases_documents_items.csv

if [ ! -f $CSV_PATH ]; then
    echo 'run download-all.sh before converting csv to json' 2>&1
    exit 1
fi

if ! command -v xsv 2> /dev/null > /dev/null; then
    echo 'Install xsv: https://github.com/BurntSushi/xsv#installation' 2>&1
    exit 1
fi

xsv select "$COLS" "$CSV_PATH" | python -c 'import csv, json, sys; print(json.dumps([dict(r) for r in csv.DictReader(sys.stdin)]))' > data/metadata.json

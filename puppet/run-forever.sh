#!/bin/sh
set -xe

TIME="12h"
CMD="./run.sh"

test -z "$1" || TIME=$1
test -z "$2" || CMD=$2

while true; do
        $CMD
        sleep $TIME # who needs cron ?
done

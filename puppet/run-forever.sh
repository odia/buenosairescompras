#!/bin/sh
set -xe

TIME=`shift $@ || echo "12h"`
CMD=` shift $@ || echo "./run.sh"`

while true; do
        $CMD
        sleep $TIME # who needs cron ?
done

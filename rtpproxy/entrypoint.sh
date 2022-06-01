#!/bin/sh
set -e

MY_IP=`ip addr | grep 'state UP' -A2 | tail -n1 | awk '{print $2}' | cut -f1  -d'/'`

rtpproxy -f -u rtpproxy -s udp:$MY_IP:8844 -L 4096 -l $MY_IP -A $PUBLIC_IP  -m $START_PORT -M $END_PORT -d DBUG "$@"
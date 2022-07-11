#!/bin/sh
set -e

MY_IP=`ip addr | grep 'state UP' -A2 | tail -n1 | awk '{print $2}' | cut -f1  -d'/'`
sed -i -e "s/MY_IP/$MY_IP/g" /etc/rtpengine.conf
sed -i -e "s/PUBLIC_IP/$PUBLIC_IP/g" /etc/rtpengine.conf

rtpengine --config-file /etc/rtpengine.conf  "$@"
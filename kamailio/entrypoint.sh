#!/bin/bash

echo "Welcome to kamailio";
sleep 10;
kamdbctl create;
kamailio -DD -E "$@"
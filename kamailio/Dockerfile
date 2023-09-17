FROM kamailio/kamailio-ci:5.5.2-alpine
RUN apk upgrade --no-cache
RUN apk add postgresql-client
COPY ./.pgpass /root/.pgpass
COPY ./kamctlrc /etc/kamailio/kamctlrc
COPY ./kamailio.cfg /etc/kamailio/kamailio.cfg
COPY ./tls.cfg /etc/kamailio/tls.cfg
COPY ./tls/kamailio.crt /etc/kamailio/kamailio.crt
COPY ./tls/kamailio.key /etc/kamailio/kamailio.key
COPY ./entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh
RUN chmod 777 /root/.pgpass
ENTRYPOINT ["/bin/sh", "/entrypoint.sh" ]
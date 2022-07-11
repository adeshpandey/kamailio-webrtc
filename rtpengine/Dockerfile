FROM alpine
RUN apk update
RUN apk add --no-cache rtpengine curl
COPY ./entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh
COPY ./rtpengine.conf /etc
ENTRYPOINT ["/entrypoint.sh"]

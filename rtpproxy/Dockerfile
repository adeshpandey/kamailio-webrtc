FROM alpine
RUN apk update
RUN apk add --no-cache rtpproxy
COPY ./entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh
EXPOSE 8844 7744
ENTRYPOINT ["/entrypoint.sh"]

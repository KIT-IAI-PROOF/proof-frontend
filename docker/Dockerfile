FROM nginx:1.31.0-alpine-slim

ARG TARGETARCH

WORKDIR /etc/nginx/html
RUN rm /etc/nginx/conf.d/default.conf

RUN sed -i -e '/^user /d' -e 's|/var/run/nginx.pid|/tmp/nginx.pid|g' -e 's|/run/nginx.pid|/tmp/nginx.pid|g' /etc/nginx/nginx.conf

COPY docker/nginx.conf /etc/nginx/conf.d
COPY dist /usr/share/nginx/html
COPY docker/.env /
COPY docker/env.sh /
COPY docker/entrypoint.sh /

RUN mkdir -p /var/cache/nginx /var/run /var/log/nginx && \
    chgrp -R 0 /usr/share/nginx/html /var/cache/nginx /var/log/nginx /etc/nginx && \
    chmod -R g=u /usr/share/nginx/html /var/cache/nginx /var/log/nginx /etc/nginx

RUN chmod +x /env.sh /entrypoint.sh && \
    chgrp -R 0 /env.sh /entrypoint.sh && \
    chmod -R g=u /env.sh /entrypoint.sh

EXPOSE 80
ENTRYPOINT ["/entrypoint.sh"]
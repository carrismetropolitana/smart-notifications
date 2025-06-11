# # #

FROM nginx:alpine-slim

WORKDIR /app

# Setup the NGINX_SERVER_NAME variable
ARG NGINX_SERVER_NAME
RUN if [ -z "$NGINX_SERVER_NAME" ]; then echo "NGINX_SERVER_NAME is not set" && exit 1; fi

# Install envsubst for variable substitution
RUN apk add --no-cache gettext

# Copy the template
COPY ./configs/nginx.conf /etc/nginx/nginx.conf.template

# Render the template at build time
RUN envsubst '${NGINX_SERVER_NAME}' < /etc/nginx/nginx.conf.template > /etc/nginx/nginx.conf

# # #
# Run Nginx	with auto-reload every 6 hours

CMD ["/bin/sh", "-c", "while :; do sleep 6h & wait ${!}; nginx -s reload; done & nginx -g 'daemon off;'"]

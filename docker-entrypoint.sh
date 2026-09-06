#!/bin/sh
set -e

export PORT="${NODE_PORT:-3000}"
sed -i "s/listen 8080;/listen ${NGINX_PORT:-8080};/" /etc/nginx/conf.d/default.conf

node index.js &
node_pid="$!"

nginx -g "daemon off;" &
nginx_pid="$!"

trap 'kill "$node_pid" "$nginx_pid" 2>/dev/null || true' INT TERM

status=0
while kill -0 "$node_pid" 2>/dev/null && kill -0 "$nginx_pid" 2>/dev/null; do
  sleep 2
done

if ! kill -0 "$node_pid" 2>/dev/null || ! kill -0 "$nginx_pid" 2>/dev/null; then
  status=1
fi

kill "$node_pid" "$nginx_pid" 2>/dev/null || true
wait "$node_pid" "$nginx_pid" 2>/dev/null || true
exit "$status"

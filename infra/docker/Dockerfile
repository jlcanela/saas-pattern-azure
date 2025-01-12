FROM denoland/deno:alpine-2.1.4

WORKDIR /app

# Create cache directories with proper permissions
RUN mkdir -p /deno-dir/remote/https/jsr.io && \
    chown -R deno:deno /deno-dir && \
    chmod -R 777 /deno-dir && \
    chown -R deno:deno /app

# Switch to deno user after setting up permissions
USER deno

# Copy files with correct ownership
COPY --chown=deno:deno deno-run.json ./deno.json
COPY --chown=deno:deno deno.lock ./
COPY --chown=deno:deno apps/api/ ./apps/api
COPY --chown=deno:deno packages/common/ ./packages/common
COPY --chown=deno:deno apps/web/dist/ ./dist/

# Cache dependencies with proper permissions
RUN DENO_DIR=/deno-dir deno cache --lock=deno.lock apps/api/main.ts

ENV PORT=8000
EXPOSE ${PORT}

CMD ["run", "--allow-env", "--allow-net", "--allow-read", "apps/api/main.ts"]

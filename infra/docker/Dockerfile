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
COPY --chown=deno:deno deno.json deno.lock ./
COPY --chown=deno:deno backend/ ./backend/
COPY --chown=deno:deno dist/ ./dist/

# Cache dependencies with proper permissions
RUN DENO_DIR=/deno-dir deno cache --lock=deno.lock backend/main.ts

ENV PORT=8000
EXPOSE ${PORT}

CMD ["run", "--allow-env", "--allow-net", "--allow-read", "backend/main.ts"]

# ---------- Build ----------
FROM eclipse-temurin:21-jdk AS build

WORKDIR /workspace

COPY backend/pom.xml backend/pom.xml
COPY backend/mvnw backend/mvnw
COPY backend/.mvn backend/.mvn

# Flyway migrations are included as Maven resources
COPY database/migrations database/migrations

WORKDIR /workspace/backend

RUN chmod +x mvnw \
    && ./mvnw --batch-mode dependency:go-offline

COPY backend/src src

RUN ./mvnw --batch-mode package -DskipTests \
    && JAR_FILE="$(find target \
        -maxdepth 1 \
        -type f \
        -name '*jar' \
        ! -name '*.original' \
        | head -n 1)" \
    && test -n "$JAR_FILE" \
    && cp "$JAR_FILE" /workspace/app.jar


# ---------- Runtime ----------
FROM eclipse-temurin:21-jre

WORKDIR /app

RUN useradd \
    --system \
    --uid 10001 \
    --create-home \
    fintrack

COPY --from=build \
    --chown=fintrack:fintrack \
    /workspace/app.jar \
    /app/app.jar

USER fintrack

EXPOSE 8080

ENTRYPOINT ["java", "-jar", "/app/app.jar"]

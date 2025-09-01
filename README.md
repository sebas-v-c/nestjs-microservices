# 🛡️ Prueba de Concepto (PoC) de Micro-servicios con NestJS

Repositorio **políglota** construido con [NestJS 11](https://nestjs.com) que demuestra una arquitectura de micro-servicios lista para producción.

* **API Gateway** – Punto de entrada HTTP que reenvía las peticiones a los servicios internos mediante gRPC.
* **Servicio de Autenticación** – Emite y valida JWT.
* **Servicio de Usuarios** – CRUD básico (pendiente de implementar).
* **Servicio de Financiero** – Endpoints gRPC de ejemplo (Fuentes).

---

## ✨ Características Destacadas

| Área               | Detalles                                                                    |
| ------------------ | ---------------------------------------------------------------------------- |
| Gateway            | Servidor HTTP basado en Express y NestJS.                                    |
| Transporte         | gRPC de `@nestjs/microservices` con soporte para TLS/mTLS.                   |
| Autenticación      | `@nestjs/jwt` con tokens de corta duración.                                  |
| Pruebas            | **Jest** para unitarias y end-to-end; cobertura incluida.                    |
| Tooling            | **Nx** orquesta el monorepo; recarga en caliente (`start:dev`).             |
| Lint/Formateo      | **ESLint 9** + **Prettier 3** (una única fuente de verdad para el formato). |
| Build              | Compilador **SWC** para builds TypeScript ultra-rápidos.                     |


---

## 🗺️ Estructura del Proyecto

## 🚀 Puesta en Marcha


### 1. Requisitos

* Node 18 LTS (o superior)
* npm (incluido en Node)
  > También funcionan Yarn/pnpm; ajusta los comandos según tu gestor.


### 2. Instalación
```sh
bash npm ci # instalacion reproducible
```

### 3. Ejecutar **Todos los servicios** en modo desarrollo
```sh
# api gateway HTTP
npm run start:dev api-gateway
# Microservicios gRPC
npm run start:dev auth-service
npm run start:dev user-service
```

- El gateway escucha en http://localhost:3000
- Documentación OpenAPI/Swagger en http://localhost:3000/api/docs
    - Pulsa “Authorize” y pega: Bearer <tu_JWT> para probar endpoints protegidos.


## ⚙️ Variables de Entorno


Cada app puede tener su propio `.env` cargado con `@nestjs/config`.  
En la PoC algunos valores están hard-coded y deben moverse a variables de entorno en producción:

| Variable                | Ejemplo/Actual              | Descripción                                  |
| ---------------------- | --------------------------- | -------------------------------------------- |
| `JWT_SECRET`           | `"<secret>"`                | Secreto para firmar JWT (mover a entorno).   |
| `AUTH_GRPC_URL`        | `localhost:3001`            | Endpoint gRPC para Auth Service.             |
| `USERS_GRPC_URL`       | `localhost:3002`            | Endpoint gRPC para User Service.             |
| `FINANCIERO_GRPC_URL`  | `localhost:3003`            | Endpoint gRPC para Financiero Service.       |

> En el código del Gateway actualmente se configuran estas URLs y certificados de manera local. Se recomienda externalizarlo.
---


## 🔒 gRPC con TLS/mTLS

El proyecto está preparado para ejecutar gRPC sobre TLS y mTLS:

- Gateway como cliente gRPC usa CA + certificado/llave de cliente.
- Cada microservicio gRPC (Auth, Users, Financiero) expone servidor con CA + certificado/llave de servidor.
- Rechazo estricto de peers no confiables (`rejectUnauthorized: true`).

Consulta los certificados en la carpeta `certs/` y adapta rutas/hostnames mediante variables de entorno.

---


## 🔐 Pasos para generar certificados mTLS (entorno local)

A continuación se muestra un **flujo mínimo** para crear los certificados raíz
(CA) y de servidor/cliente con _OpenSSL_. Ejecuta los comandos desde la raíz del
proyecto:

1. Crear la carpeta donde se almacenarán los ficheros:  
   ```bash
   mkdir certs
   ```

2. Generar la clave privada de la CA (4096 bits):  
   ```bash
   openssl genrsa -out certs/ca.key 4096
   ```

3. Posicionarte dentro de la carpeta:  
   ```bash
   cd certs
   ```

4. Emitir el certificado _self-signed_ de la CA (válido 365 días):  
   ```bash
   openssl req -x509 -new -nodes -key ca.key -sha256 -days 365 \
     -out ca.crt \
     -subj "/CN=FinanciamientoCA"
   ```

5. Generar la **clave privada del servidor**:  
   ```bash
   openssl genrsa -out server.key 4096
   ```

6. Crear la **CSR (Certificate Signing Request)** del servidor:  
   ```bash
   openssl req -new -key server.key -out server.csr -subj "/CN=api.tusitio.com"
   ```
   > Sustituye `api.tusitio.com` por el FQDN real del servicio.

7. Firmar la CSR con la CA para obtener el **certificado del servidor**:  
   ```bash
   openssl x509 -req -in server.csr -CA ca.crt -CAkey ca.key -CAcreateserial \
     -out server.crt -days 365 -sha256
   ```

---

### 🔑 Generar y firmar los certificados de cliente

8. Crear la **clave privada del cliente**:  
   ```bash
   openssl genrsa -out client.key 4096
   ```

9. Generar la **CSR del cliente**:  
   ```bash
   openssl req -new -key client.key -out client.csr -subj "/CN=client"
   ```
   > Puedes usar un `CN` más descriptivo, p. ej. el nombre del micro-servicio o
   > usuario, para facilitar la auditoría.

10. Firmar la CSR del cliente con la CA:  
    ```bash
    openssl x509 -req -in client.csr -CA ca.crt -CAkey ca.key -CAcreateserial \
      -out client.crt -days 365 -sha256
    ```

    Archivos resultantes:  
    * `client.key`   → clave privada  
    * `client.crt`   → certificado público firmado por la CA  

Repite estos pasos para cada entidad cliente que necesite autenticarse ante el
servidor.

Esto generará:
   * `server.crt`  → certificado público del servidor  
   * `ca.srl`      → número de serie utilizado por la CA (creado automáticamente)

Repite el mismo proceso para generar y firmar los certificados de cada cliente
(`client.key`, `client.csr`, `client.crt`) que necesite autenticarse.

### 📌 Buenas prácticas recomendadas

* Incluye **Subject Alternative Name (SAN)** con los dominios/IP que realmente
  usará el servicio (por ejemplo, `DNS:api.tusitio.com,IP:10.0.0.5`).  
  Los navegadores modernos ignoran el `CN` si no hay SAN.
* Protege las claves privadas con _passphrase_ (`openssl genrsa -aes256 ...`).
* Mantén la **CA offline** o en un entorno separado; nunca la empaquetes en
  contenedores ni la subas al VCS.
* Automatiza el proceso mediante **Makefile** o scripts para minimizar errores.
* Programa **rotación de certificados** (p. ej. cada 90 días en producción).
* Almacena los secretos en un gestor dedicado (Vault, AWS Secrets Manager,
  Kubernetes Secrets, etc.).
* En producción usa **ACME** (Let’s Encrypt) o tu **PKI corporativa** para evitar
  certificados autofirmados en los clientes.

Una vez dispongas de los certificados, cambia el transporte a
`Transport.TCP_SECURE` y proporciona las rutas de los ficheros en la
configuración del Gateway y de cada micro-servicio para habilitar mTLS.

### ⚠️ Problema habitual: `ERR_TLS_CERT_ALTNAME_INVALID`

Si firmas tu certificado con `/CN=localhost` pero tu micro-servicio se registra
en el código como `127.0.0.1` (o viceversa), Node.js rechazará la conexión y
mostrará:

Error [ERR_TLS_CERT_ALTNAME_INVALID]: Hostname/IP does not match certificate's altnames
Solución:

1. Incluye **todos** los nombres/IP que vayas a usar en la extensión
   `subjectAltName` cuando generes la CSR, por ejemplo  
   `DNS:localhost,IP:127.0.0.1`.
2. Asegúrate de que la opción `host` en tu configuración Nest (Gateway y
   micro-servicios) coincide con alguno de esos valores.  
   En la PoC se ha establecido `host: 'localhost'` para evitar el error.




---

## 🛠️ Scripts npm Útiles

| Comando                    | Descripción                                                                                 |
| -------------------------- | ------------------------------------------------------------------------------------------- |
| `npm run format`           | Ejecuta Prettier sobre todo el código fuente de apps y libs                                 |
| `npm run lint`             | Ejecuta ESLint con autofix sobre `src`, `apps`, `libs`, `test`                              |
| `npm run build`            | Compila los proyectos Nest                                                                  |
| `npm run start`            | Arranca la app principal (Gateway) en modo producción                                       |
| `npm run start:dev`        | Arranca la app actual en modo desarrollo con recarga                                        |
| `npm run start:debug`      | Arranca en modo debug con recarga                                                           |
| `npm run start:prod`       | Ejecuta el bundle compilado                                                                 |
| `npm test`                 | Corre la suite de tests con Jest                                                            |
| `npm run test:watch`       | Corre Jest en modo watch                                                                    |
| `npm run test:cov`         | Genera el reporte de cobertura de Jest                                                      |
| `npm run test:debug`       | Ejecuta Jest con el inspector de Node                                                       |
| `npm run test:e2e`         | Ejecuta pruebas E2E (configuración dedicada por app)                                        |
| `npm run proto:generate`   | Genera tipos TypeScript y stubs NestJS a partir de los `.proto` hacia `libs/proto-types`   |

Notas sobre `proto:generate`:
- Usa ts-proto para generar clientes/servidores tipados compatibles con Nest (`nestJs=true`).
- Entrada: todos los `.proto` en la carpeta `./proto`.
- Salida: código TypeScript en `./libs/proto-types/src`.

Ejecutar:
```bash
bash npm run proto:generate
```

Importar en el código:
```ts
// ejemplo 
import { AUTH_PACKAGE_NAME, AuthServiceClient } from '@app/proto-types/auth';
```

Estructura generada:
- Un archivo por servicio/mensaje en `libs/proto-types/src`.
- Incluye interfaces de cliente/servidor, tipos de mensajes y constantes de paquete/nombre de servicio.

## 📦 Protobuf: definición y generación

- Define contratos en `./proto/*.proto` (por servicio: auth.proto, users.proto, financiero.proto).
- Genera stubs tipados con:
```bash
npm run proto:generate
```
- Usa los tokens de paquete/servicio generados para registrar los clientes gRPC en el Gateway y para implementar controladores en los microservicios.

Buenas prácticas:
- Mantén los `.proto` como “fuente de verdad”. Cambios aquí deben regenerar y commitear la librería `proto-types`.
- Versiona los contratos si introduces cambios incompatibles (breaking changes).


---

## 📈 Roadmap

1. Integración con **PostgreSQL** usando Prisma para servicios de dominio. ✅
2. Generar **tokens de refresco** y uso de cookies HTTP-only.
3. Endurecer seguridad gRPC con **mTLS** completo y configuración vía variables de entorno.
4. Implementar CRUD completo en **User Service** con patrón CQRS y validación exhaustiva.
5. Ampliar documentación **OpenAPI** en el Gateway y ejemplos de errores estándar.
6. Automatizar generación de tipos a partir de `.proto` en pipelines CI (ver `proto:generate`).
 
---

## 🤝 Contribuir

1. Haz fork y clona el repo.
2. Crea una rama: `git checkout -b <feature|fix>/<nombre>`.
3. Commitea siguiendo [Conventional Commits](https://www.conventionalcommits.org).
4. Haz push y abre un Pull Request.

¡Se agradecen todo tipo de aportaciones: código, documentación, tests, etc.!

---

## 📜 Licencia

`MIT`. Consulta el archivo [LICENSE](LICENSE) para más detalles.
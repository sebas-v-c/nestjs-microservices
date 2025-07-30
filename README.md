# 🛡️ Prueba de Concepto (PoC) de Micro-servicios con NestJS

Repositorio **políglota** construido con [NestJS 11](https://nestjs.com) que demuestra una arquitectura de micro-servicios lista para producción.

* **API Gateway** – Punto de entrada HTTP que reenvía las peticiones a los servicios internos mediante TCP.
* **Servicio de Autenticación** – Emite y valida JWT.
* **Servicio de Usuarios** – CRUD básico (pendiente de implementar).

---

## ✨ Características Destacadas

| Área               | Detalles                                                                    |
| ------------------ | ---------------------------------------------------------------------------- |
| Gateway            | Servidor HTTP basado en Express y NestJS.                                    |
| Transporte         | Driver TCP de `@nestjs/microservices` (binario y eficiente).                 |
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
npm run start:dev api-gateway
npm run start:dev auth-service
npm run start:dev user-service
```

| El gateway escucha en **http://localhost:3000** y reenvía las peticiones a los microservicios por TCP

## ⚙️ Variables de Entorno

Cada app puede tener su propio `.env` cargado con `@nestjs/config` (añádelo si lo necesitas).  
En la PoC las siguientes variables están **hard-codeadas** y **deben cambiarse en producción**:

| Variable         | Valor actual | Descripción                               |
| ---------------- | ------------ | ----------------------------------------- |
| `JWT_SECRET`     | `"<secret>"` | Secreto compartido para firmar JWT.       |
| `AUTH_TCP_PORT`  | `8877`       | Puerto del servicio de autenticación.     |
| `USER_TCP_PORT`  | `8878`       | Puerto del servicio de usuarios.          |

---

## 🔒 Camino hacia mTLS

El código está preparado para sustituir `Transport.TCP` por  
`Transport.TCP_SECURE` (o gRPC) cuando dispongas de certificados de servidor y cliente.  
Consulta el bloque comentado en `api-gateway.module.ts` para orientarte.

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

| Comando                 | Descripción                                   |
| ----------------------- | --------------------------------------------- |
| `npm run format`        | Ejecuta Prettier sobre todo el código fuente  |
| `npm run lint`          | ESLint + auto-fix                             |
| `npm run build`         | Compila **todos** los proyectos con SWC       |
| `npm run start`         | Arranca el gateway (producción)               |
| `npm run start:prod`    | Arranca el bundle ya compilado                |

> Añade `-- workspace=<ruta>` para lanzar un único target dentro del monorepo.

---

## 📈 Roadmap

1. Sustituir la tienda en memoria por **PostgreSQL** usando Typeorm.
2. Generar **tokens de refresco** y cookies HTTP-only.
3. Implementar certificados **mTLS** y asegurar TCP.
4. Implementar CRUD en **User Service** con patrón CQRS.
5. Añadir documentación **OpenAPI** (`@nestjs/swagger`) en el gateway.

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
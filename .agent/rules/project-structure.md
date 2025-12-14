---
trigger: always_on
---

# OpenWYD Project Rules & Architecture Context

You are an expert Senior Software Architect working on "OpenWYD", a modern, high-performance MMORPG emulator for "With Your Destiny" (WYD).

## 1. Tech Stack & Standards

- **Runtime:** Node.js (Latest LTS).
- **Language:** TypeScript (Strict Mode).
- **Monorepo:** Turborepo + pnpm Workspaces.
- **Database:** MongoDB (via Mongoose) for data, Redis for Session/Locking/PubSub.
- **Persistence:** Async "Write-Behind" pattern via AWS SQS + Lambda (Serverless Framework).
- **Observability:** LGTM Stack (Loki, Grafana, Tempo, Prometheus) via `@repo/logger`.

## 2. Directory Structure & Responsibilities

- **`/apps/connect-server` (TCP Gateway):**
  - Handles raw TCP sockets (net.Server).
  - **Responsibilities:** Packet Reassembly (Sticky Packets), Encryption (Legacy XOR), Rate Limiting (Token Bucket), Distributed Tracing initialization.
  - **Forbidden:** No game logic here. Pass clean packets to `timer-server` via gRPC.
- **`/apps/timer-server` (Game Logic):**
  - The authoritative State Machine.
  - **Responsibilities:** Movement, Combat, Drops, Session Management.
  - **Persistence:** NEVER write to MongoDB directly. Serialize state and push to SQS `save-queue`.
  - **Concurrency:** Use Redis Mutex for Login Locking (prevent concurrent logins).
- **`/apps/persistence-service` (Worker):**
  - Serverless functions (AWS Lambda).
  - **Responsibilities:** Consumes SQS `save-queue` -> Writes to MongoDB. Consumes `audit-queue` -> Writes to Audit Logs.
- **`/packages/protocol`:**
  - Shared Binary I/O.
  - **Rules:** Use custom `BinaryReader`/`BinaryWriter`. Strings are `latin1` and Null-Terminated. Enforce Little Endian.
  - **Crypto:** Use `WydCipher` (Legacy XOR).

## 3. Critical Architectural Rules

### A. Persistence Strategy (Write-Behind)

- **Goal:** Zero-latency gameplay.
- **Rule:** The Game Loop must never `await` a database operation.
- **Flow:** Game Event -> Update RAM -> `sqsClient.send(payload)` -> Lambda Worker -> MongoDB.

### B. Inter-Server Communication

- **Client <-> Connect:** TCP Raw (Encrypted).
- **Connect <-> Timer:** gRPC Bidirectional Streaming (Multiplexing sessions).
- **Timer <-> Timer:** Redis Pub/Sub (for Kicks and Global Broadcasts).

### C. Login & Security (Anti-Dupe)

- **Strict Locking:** When User A logs into Server 2:
  1. Check Redis for existing session on Server 1.
  2. If exists: Set `lock:user:{id}`, Publish `KICK` command, Wait for confirmation (Polling).
  3. Only load data from DB after lock is released/expired.
- **Rate Limiting:**
  - **Layer 1 (Local):** Token Bucket for packet flooding.
  - **Layer 2 (Global):** Redis Sliding Window for Login Brute-force.

### D. Coding Conventions

- **Logs:** Always use `logger.info/error` from `@repo/logger`. Never `console.log`.
- **Endianness:** Always use `readUInt*LE` / `writeUInt*LE`.
- **Error Handling:** Never crash the server on packet error. Catch, log with TraceID, and disconnect the specific socket.

## 4. Environment Emulation

- Development uses `docker-compose` to run:
  - MongoDB
  - Redis
  - LocalStack (Emulates SQS for offline dev)
  - Grafana/Loki/Tempo

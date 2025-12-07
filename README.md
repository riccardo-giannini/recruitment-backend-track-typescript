## Getting Started

> 💡 **First-time setup?**  
> If this is your first time running the project, you **must apply database migrations** before starting the app. The application expects tables and enums (like `invoice_status`) to already exist in the database.

1. Clone the repository:
   ```bash
   git clone https://github.com/riccardo-giannini/recruitment-backend-track-typescript
   cd recruitment-backend-track-typescript
   ```

2. Apply database migrations:
   ```bash
   make migrate
   ```

3. Build and start the Docker containers:
   ```bash
   make start
   ```

> ✅ You only need to run `make migrate` once initially — and then again whenever new migrations are added (e.g., after pulling updated code).


Here's a clean addition to your `README.md` that explains how to use the Dev Container in VS Code, including prerequisites and your preferred workflow (develop in container, commit from host):

---

## Using Dev Containers in VS Code (Recommended for Development)

This project includes a **Dev Container configuration** that lets you develop inside a fully isolated, containerized environment with all dependencies pre-installed.

### ✅ Prerequisites

- [Docker](https://www.docker.com/products/docker-desktop) installed and running
- [Visual Studio Code](https://code.visualstudio.com/)
- [Dev Containers extension](https://marketplace.visualstudio.com/items?itemName=ms-vscode-remote.remote-containers) (VS Code will prompt you to install it if missing)

### 🚀 How to Use

1. **Open the project root** in VS Code:
   ```bash
   cd recruitment-backend-track-typescript
   code .
   ```

2. VS Code will detect `.devcontainer/devcontainer.json` and show a notification:
   > “Dev Container configuration found. Reopen in Container?”

   Click **“Reopen in Container”**.

   > 💡 Alternatively, press `F1` → type **“Dev Containers: Reopen in Container”**.

3. VS Code will:
   - Start all services defined in `docker-compose.yml` (`backend`, `db`, `caddy`)
   - Attach your editor to the `backend` container
   - Install recommended extensions (ESLint, Prettier)
   - Mount your local code into `/app` inside the container

4. **You’re now developing inside the container!**  
   - Terminal tabs run inside the container
   - ESLint and Prettier auto-fix on save
   - All tooling uses the exact versions defined in the container

### 🔁 Development Workflow

- ✅ **Code and debug** inside the Dev Container (VS Code terminal = container shell)
- ❌ **Do not commit from the container terminal**
- ✅ **Commit from your host terminal** (outside VS Code or in a local shell)

> Why? Git hooks (like Husky) need access to your host Git identity, GPG keys, and SSH agent. Committing from the host ensures a smooth, secure workflow.

### 🚪 How to Exit the Dev Container

When you’re done developing:

1. Press `F1` → type **“Dev Containers: Reopen Folder Locally”**
2. VS Code will reconnect to your project using your **local (host) environment**

> 💡 Your Docker containers will keep running in the background. To stop them:
> ```bash
> make stop
> ```

### 💡 Notes

- You **do not need Node.js, npm, or PostgreSQL installed on your host** — everything runs in containers.
- The first container build may take a few minutes; subsequent startups are fast.
- If you update `.devcontainer/` files, run **“Dev Containers: Rebuild Container”** to apply changes.

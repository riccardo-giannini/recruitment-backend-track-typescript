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

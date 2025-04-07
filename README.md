# 🚀 Fullstack Interview Project

<p align="center" width="100%">
<img src="https://lnmarkets.com/images/logo-gradient.svg" style="display:block;margin: 0 auto" width=50% height=50% alt="LN Market's logo" />
</p>

Welcome to our Fullstack Interview Project! This is a comprehensive technical assessment designed to evaluate your full-stack development skills using a modern TypeScript-based tech stack.

If you have issues configuring the repo you can send a mail to [@vafanassieff](mailto:victor.afanassieff@ito.am).
We assume you have basic knowledge of git and github, an IDE that can show you typescript errors like [Cursor](https://www.cursor.com/) or [VSCode](https://code.visualstudio.com/).

The repository **must** pass the `pnpm run ci` command.

## ✨ What You'll Build

You will be assigned one of the features to implement.
You are allowed to use any tool you wish to complete the task (Even your best friend Claude 🤖) as long you can explain the code.
You'll be implementing three key features for a crypto trading platform:

1. **Futures Trading Pricer**
   - Create a form to capture trade parameters (side, quantity, leverage, entry price)
   - Implement client-side validation and database storage
   - Build a clean, user-friendly interface with TailwindCSS

2. **Real-time Candle Aggregation**
   - Process and aggregate 1-minute OHLC (Open-High-Low-Close) candles
   - Support multiple timeframes (5m, 15m, 1h, 4h, 1d)
   - Create a live-updating display of candle data
   - Implement real-time data streaming using tRPC subscriptions

3. **Fund Transfer System**
   - Build an interface for transferring funds between users
   - Display real-time balance information
   - Implement validation for transfer amounts and recipient details
   - Handle various error cases (insufficient balance, invalid recipient, etc.)

## 📤 Project Submission

To submit your solution, please follow these steps:

1. Clone this repository to your local machine
2. Create a new private repository on your personal GitHub account named `itoam-ts-fullstack`

With [github cli](https://cli.github.com/)

```bash
# remove existing remote
git remote remove origin
# create new repo
gh repo create itoam-ts-fullstack --private --source .
# push to new repo
git push -u origin --all
```

3. Push your implementation to your personal repository
4. When you're ready to submit:
   - Create a Pull Request (PR) in your repository showing the diff with the main branch
   - Add [@vafanassieff](https://github.com/vafanassieff) as a collaborator on your repository

This approach helps us to clearly see the changes you've made and understand your implementation strategy.

## 🚢 Production Readiness

There is no time constraint for this task.

Production readiness includes but is not limited to:

- **Code Quality**: Clean, well-structured code following best practices
- **Type Safety**: Proper TypeScript typing throughout the application
- **Error Handling**: Comprehensive error handling and graceful degradation
- **Performance**: Optimized for performance with consideration for memory usage
- **Security**: Implementation of security best practices

The definition of "production ready" is ultimately up to you as the developer, and part of the task is demonstrating your understanding of what makes code suitable for a production environment.

## 📦 Package Requirements

### Mandatory Packages

All currently installed packages in the project are mandatory and must be used as part of your implementation.
These packages form the foundation of the application architecture.

### Additional Packages

You may install additional packages if needed, but you must:

- Provide clear justification for why the package is necessary
- Explain how it enhances or enables functionality that can't be achieved with existing packages

## 🛠️ Tech Stack

We are using [TypeScript](https://www.typescriptlang.org/) latest version

- [React 19](https://react.dev/)
- [Vite](https://vitejs.dev/)
- [TailwindCSS 4](https://tailwindcss.com/)
- [Node.js v22](https://nodejs.org/)
- [tRPC](https://trpc.io/)
- [PostgreSQL 16](https://www.postgresql.org/)
- [Drizzle ORM](https://orm.drizzle.team/)
- [Docker](https://www.docker.com/) and [Docker Compose](https://docs.docker.com/compose/)
- [PNPM](https://pnpm.io/)

## 📁 Project Structure

```shell
ts-fullstack/
├── apps/
│   ├── api/               # Backend API service
│   ├── web/               # Frontend React application
├── packages/
│   ├── database/          # Database schemas and client
│   ├── shared/            # Shared functions between back and front
│   ├── ui/                # UI Components
│   ├── trpc-api/          # tRPC API library for type-safe API requests
│   ├── types/             # Shared types between packages
│   └── typescript-config/ # Shared TypeScript configuration
├── compose.yml            # Docker Compose for local development
└── package.json           # Root package.json for workspace with common dependencies
```

## 🚦 Getting Started

### Installation and Setup

1. Clone this repository

   ```shell
   git clone <repository-url>
   cd ts-fullstack
   ```

2. Install dependencies

   ```shell
   pnpm install
   ```

3. Start the development environment

   ```shell
   pnpm start
   ```

   This will start all services using Docker Compose:
   - PostgreSQL database on port 5432
   - API server on port 3000
   - Web frontend on port 5173

4. Access the application at [http://localhost:5173](http://localhost:5173)

### 💻 Development Commands

- `pnpm start` - Start all services in development mode
- `pnpm format` - Format code using Prettier
- `pnpm type-check` - Run type check on all packages
- `pnpm knip` - Run knip to check for unused imports
- `pnpm lint` - Run ESLint on all packages
- `pnpm stop` - Stop all Docker containers
- `pnpm run ci` - Execute what the ci would do

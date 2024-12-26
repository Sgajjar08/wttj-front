# WTTJ Front

## Pre-requisite

### Install PostgreSQL

Install PostgreSQL. Optionally, you can use pgAdmin to have a visual interface for managing data.

---

## Installation Guide

### 1. Install `asdf`

To install `asdf`, refer to the [official asdf documentation](https://asdf-vm.com/guide/getting-started.html) and follow the instructions for your system. `asdf` is required to manage plugins such as Elixir, Erlang, Node.js, and PostgreSQL. These plugins will help set up the database and backend server.

### 2. Add Plugins Using `asdf`

Run the following commands to add the required plugins:

```bash
asdf plugin add elixir
asdf plugin add erlang
asdf plugin add nodejs
```

If you encounter errors with `asdf` commands, try running the following commands before adding the plugins:

```bash
. "$HOME/.asdf/asdf.sh"
export PATH=$PATH:/usr/local/lib/elixir/1.13.2-otp-24/bin
```

### 3. Install Plugins

Run the following command to ensure all plugins are installed with the correct versions:

```bash
asdf install
```

---

## Getting Started

### 1. Set Up the Phoenix Server

Run the following commands to set up and start the Phoenix server:

1. **Install and set up dependencies:**

   ```bash
   mix setup
   ```

   This command will also create a database with two jobs (one of which has many candidates).

2. **Start the Phoenix endpoint:**
   ```bash
   mix phx.server
   ```
   Alternatively, you can start it inside `IEx`:
   ```bash
   iex -S mix phx.server
   ```

### 2. Install and Start Frontend Assets

Navigate to the `assets` directory and run the following commands:

```bash
cd assets
yarn
yarn dev
```

---

## Handling CORS Errors

If you encounter CORS (Cross-Origin Resource Sharing) errors, you need to add a CORS plug in the backend to accept requests from the frontend running on localhost.

1. **Create a CORS plug** in `lib/wttj_web/plugs/cors.ex`:

   ```elixir
   defmodule WttjWeb.Plugs.CORS do
     import Plug.Conn

     def init(opts), do: opts

     def call(conn, _opts) do
       conn
       |> put_resp_header("access-control-allow-origin", "http://localhost:5173") # Adjust the origin as necessary for production
       |> put_resp_header("access-control-allow-methods", "GET, POST, PUT, DELETE, OPTIONS")
       |> put_resp_header("access-control-allow-headers", "content-type, authorization")
     end
   end
   ```

2. **Add the CORS plug to the `api` pipeline** in `lib/wttj_web/router.ex`:

   ```elixir
   pipeline :api do
     plug :accepts, ["json"]
     plug WttjWeb.Plugs.CORS
   end
   ```

3. **Define the Options function** in the PageController `lib/wttj_web/controllers/page_controller.ex` and use it for routers `JobController` and `CandidateController`:

   ```elixir
   def options(conn, _params) do
     conn
     |> send_resp(204, "")
   end
   ```

   in router.ex

   ```elixir
   scope "/api", WttjWeb do
     pipe_through :api

     resources "/jobs", JobController, except: [:new, :edit] do
       resources "/candidates", CandidateController, except: [:new, :edit]

     options "/*path", PageController, :options
     end
   end
   ```

4. **Restart the server**:
   ```bash
   mix phx.server
   ```
   After restarting, the CORS issues should be resolved.

---

## Notes

- Adjust the `access-control-allow-origin` header in production as necessary to ensure proper security.
- For further assistance, consult the project documentation or contact the development team.

---

# Design Patterns and Folder Structure

This project follows a modular and scalable folder structure to ensure maintainability, readability, and ease of development. Below is a breakdown of the folder structure and the design principles followed:

## Folder Structure
```
src/
├── api/                # Handles API requests and integrations
├── components/         # Reusable UI components
│   ├── Candidate/      # Components related to candidate features
│   ├── CandidateColumn/ # Column-specific candidate-related components
│   ├── Layout/         # Layout-related components for the application
├── constants/          # Application-wide constants (e.g., enums, keys, static data)
├── hooks/              # Custom React hooks for shared logic
├── pages/              # Page-level components for routing
│   ├── JobIndex/       # Job index page
│   ├── JobShow/        # Job details page
├── provider/           # Context providers for global state management
├── test/               # Unit and integration tests
├── types/              # TypeScript types and interfaces
```

## Design Principles

### 1. *Component Modularity*
   - All components are grouped by feature or functionality.
   - Ensures that related components are colocated, making the codebase more intuitive and easier to navigate.

### 2. *Separation of Concerns*
   - Pages (⁠ src/pages ⁠) handle routing and high-level rendering logic.
   - Reusable components (⁠ src/components ⁠) focus solely on UI and are unaware of the application's business logic.
   - Business logic is handled via hooks and API calls.

### 3. *Scalability*
   - The folder structure is designed to support new features by simply adding corresponding folders under ⁠ components ⁠, ⁠ pages ⁠, or other appropriate directories.
   - Encourages reusability and ease of scaling.

### 4. *State Management*
   - Global state is managed via React Context or a dedicated provider under ⁠ src/provider ⁠.
   - Local state is encapsulated within individual components or handled via custom hooks.

### 5. *API Layer*
   - All API integrations are centralized in the ⁠ src/api ⁠ folder.
   - This ensures that changes in API structure or external services can be handled in one place.

### 6. *Typescript Integration*
   - All types and interfaces are stored in ⁠ src/types ⁠, promoting type safety across the application.
   - This ensures code clarity and reduces runtime errors.

### 7. *Testing*
   - All tests are colocated in the ⁠ src/test ⁠ folder.
   - Encourages a clear boundary between application logic and test code, while maintaining ease of testing.

## Best Practices

•⁠  ⁠*Consistency:* Adhere to common naming conventions for files and folders. Use PascalCase for components and camelCase for variables and functions.
•⁠  ⁠*Reusability:* Extract shared logic into custom hooks (⁠ src/hooks ⁠) or utility functions.
•⁠  ⁠*Readability:* Keep components small and focused. Break down larger components into smaller, reusable pieces when possible.
•⁠  ⁠*Documentation:* Document the purpose and usage of custom hooks, providers, and reusable components in their respective files.

## Example Component Structure

For a feature like ⁠ Candidate ⁠:

```
src/components/Candidate/ 
├── Candidate.tsx # Main candidate component 
├── Candidate.test.tsx # Test file for the component
├── Candidate.styles.ts # Styled components or CSS modules 
├── Candidate.types.ts # Types and interfaces specific to Candidate
```

## What has been implemented?
### 1. Basic Functionality

- Implement drag-and-drop functionality for cards:
    - Within the same column
    - Between different columns
    - With proper handling of a11y
- Ensure proper handling of card positioning and ordering
- Implement real-time synchronization between users

### 2. Performance Optimization

- Centralized cache with optimistic and atomic updates
- Design for scale (DOM size, minimum re-renders, hours of usage without a reload, …):
    - handle thousands of candidates per column efficiently
    - handle hundreds of operations made by concurrent users

### 3. 🧑‍💻 Code Quality & Architecture

- Maintainable code with the use of appropriate design patterns
- Test suite with high coverage and great balance between unit & integration tests
- Reasonable usage of external libraries
- Clear, atomic commits with meaningful messages

## What is remaining?

- **Edge Case**: When a candidate is dragged and dropped to the same position, there is no visible impact on the UI. However, this could result in an unnecessary API call. While this doesn't affect the user experience, it can be optimized to prevent unnecessary backend usage.
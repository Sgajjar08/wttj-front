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

Enjoy working with the WTTJ Front repository!

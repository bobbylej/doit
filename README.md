# Doit Jira - Server for Slack App

The Slack app acts as a middleware between Slack and Jira software, utilizing the power of OpenAI to facilitate conversational interactions with users. By leveraging natural language processing, the app empowers users to seamlessly manage Jira issues directly from Slack. It serves as a bridge, enabling users to have dynamic conversations, make requests, and perform actions on Jira issues using familiar and intuitive language within the Slack platform.

This app is currently in an **experimental phase** and is not recommended for production use. It may contain limitations, potential issues, or incomplete features that could impact its reliability or security in a production environment. Therefore, it is advised to use this app for experimental or testing purposes only, and not in a live production setting.

This repository contains the server code for a Doit Jira Slack app. The server is responsible for handling incoming requests from Slack and performing various actions based on those requests. It uses Node.js and Express framework for building the server. 

## Demo

Set API Keys and create, delete, move tasks in Jira:

https://github.com/bobbylej/doit/assets/11492703/1490a64f-cf90-4816-931b-ada7da142043

Create epics and tasks in Jira:

https://github.com/bobbylej/doit/assets/11492703/a994b091-b7d2-403b-88b5-4358bae8887f

## Usage notes

1. **It forgets messages** - The app has a limited message storage capacity, so it may eventually „forget” previous messages.
1. **It doesn't know what is inside the Jira Board** - The app is not aware of the content of the Jira Board, except for the issues, tasks, and epics mentioned in previous messages.
1. **It may generate requests in wrong format** - When certain attributes have special formats, the chat may generate content in the wrong format. For example, it may mishandle descriptions until it encounters a training message or any other message with a proper description attribute. The same applies to JQL for search.
1. **Put independent jobs in single message** - The app works best when handling one job at a time or unrelated multiple jobs simultaneously. For instance, if you want to create an epic and tasks within the epic in a single message, you’ll need to modify the requests to include the epic’s key in the tasks. 
1. **Don't put too many jobs at once** - It's important to avoid putting too many jobs in a single message due to the limited number of tokens available. If the message becomes too long, it may get cut off, potentially impacting the desired functionality. To ensure optimal performance, it's recommended to keep each job or task within a reasonable length to avoid token limitations.
1. **For complex jobs use Jira web app** - The Jira API can be complex in many cases, making certain tasks more straightforward to perform using the web app interface. For example, creating custom attributes within the issues of a project is easier to accomplish within the Jira web app.
1. **Clean the chat from time to time** - After changing the context, it is beneficial to utilize the `doit-clear` command for at least two reasons. Firstly, it serves as a reminder to the chat about the training messages, helping to maintain contextual understanding. Secondly, it helps conserve tokens by clearing any unnecessary information from previous requests, optimizing the token usage for each subsequent request.

## Getting Started

To get started with the Doit Slack app server, follow these steps:

1. Clone the repository: `git clone https://github.com/bobbylej/doit.git`
1. Install the dependencies: `npm install`
1. Create a `.env` file in the root directory of the project and add your environment variables. You can refer to the `.env.example` file for the required variables.
1. Start the server: `npm run dev` or `npm start` (check the difference in [Scripts](#scripts) section).
1. The server should now be running on `http://localhost:3000`.
1. To interact with slack app create publicity accessible URL or use development proxy like [ngrok](https://ngrok.com/).

## Environmental Variables

To configure the project, you need to set up the following environmental variables. Follow these steps:

1. Create a `.env` file in the root directory of the project.
1. Add the required environment variables listed below. You can refer to the `.env.example` file for the required variables' format.

### Required Variables

- `OPENAI_API_CHAT_COMPLETION_MODEL` - This is a required variable that specifies the OpenAI model used for chat completion. You can find a list of available models [here](https://platform.openai.com/docs/models/gpt-4). We recommend using the `gpt-3.5-turbo` model.

- `OPENAI_API_TEXT_COMPLETION_MODEL` - This is a required variable that specifies the OpenAI model used for text completion. You can find a list of available models [here](https://platform.openai.com/docs/models/gpt-4). We recommend using the `text-davinci-003` model.

- `OPENAI_API_CHAT_COMPLETION_MAX_TOKENS` - This is a required variable that sets the maximum number of tokens for the chosen model used for chat completion. You can find the appropriate value for your model [here](https://platform.openai.com/docs/models/gpt-4).

- `OPENAI_API_COMPLETION_MAX_TOKENS` - This is a required variable that sets the maximum number of tokens for the chosen model used for text completion. You can find the appropriate value for your model [here](https://platform.openai.com/docs/models/gpt-4).

- `MONGODB_URL` - This is a required variable that specifies the URL to your MongoDB instance. It is necessary for storing API keys and messages for the users.

- `MONGODB_DBNAME` - This is a required variable that defines the name of the MongoDB database.

- `MONGODB_SESSIONS_COLLECTION` - This is a required variable that sets the name of the collection within the MongoDB database.

- `MONGODB_ENCRYPTION_KEY` - This is a required variable used to encrypt data in the database. It should be a 32-byte base64 string.

- `MONGODB_SIGNING_KEY` - This is a required variable used to sign data in the database. It should be a 64-byte base64 string.

### Optional Variables

The following variables are optional, but you can provide them if needed:

- `OPENAI_API_COMPLETION_TYPE` - This is an optional variable that specifies the OpenAI completion type to be used. You can choose between `chat` and `text` completion. We recommend using the `chat` completion and this is the default type.

- `OPENAI_API_KEY` - This is an optional variable that allows you to provide your OpenAI API Key. If you don't provide this value, users will be required to provide their own API Key.

- `OPENAI_API_ORGANIZATION` - This is an optional variable that allows you to provide your OpenAI Organization ID. If you don't provide this value, users will be required to provide their own Organization ID.

- `JIRA_API_TOKEN` - This is an optional variable that specifies the API Token for Jira REST API. If you don't provide this value, users will be required to provide their own API Token.

- `JIRA_HOST` - This is an optional variable that defines the host for the Jira REST API. It should be provided in the format: *your-organization.atlassian.net*. If you don't provide this value, users will be required to provide their own API Token.

- `SENTRY_DSN` - This is an optional variable that defines the Sentry DSN for error reporting. Providing this allows errors to be reported to Sentry automatically. If you don't provide this value, errors will only be logged to the console.

Make sure to set these environmental variables in your `.env` file before running the project.

## Installing and Running MongoDB Locally

The server uses MongoDB as the database. Follow the steps below to install and run MongoDB locally:

1. Download MongoDB Community Server: Visit the [MongoDB Download Center](https://www.mongodb.com/try/download/community) and download the appropriate version for your operating system.
1. Install MongoDB: Run the installer and follow the installation instructions for your operating system.
1. Configure the MongoDB Environment:
   - Create the data directory: By default, MongoDB stores data in the `/data/db` directory. Create this directory in the root of your system drive (e.g., `C:\data\db` on Windows or `/data/db` on macOS/Linux).
   - Add the MongoDB bin directory to your system's PATH environment variable: The bin directory is typically located in the MongoDB installation directory (e.g., `C:\Program Files\MongoDB\Server\{version}\bin` on Windows or `/usr/local/bin` on macOS/Linux). Add this directory to your system's PATH variable to access MongoDB from the command line.
1. Start the MongoDB Server:
   - Open a command prompt or terminal window.
   - Run the following command to start the MongoDB server: `mongod`
1. Verify the MongoDB Installation:
   - Open another command prompt or terminal window.
   - Run the following command to start the MongoDB shell: `mongo`
   - If MongoDB is running successfully, you will see a MongoDB shell prompt (`>`) in the new window.

Now, you have MongoDB installed and running locally. The server will be able to connect to the MongoDB database.

## Creating a Slack App

To use this server with a Slack app, you need to create a Slack app and configure it to interact with the server. Here are the steps to create a Slack app:

1. Go to the [Slack API website](https://api.slack.com/apps) and click on "Create New App".
1. Provide a name and select the workspace where you want to install the app.
1. Under the "Features" section, click on "OAuth & Permissions" to configure the app's OAuth scopes and redirect URLs.
1. Add `channels:read`, `chat:write` and `commands` OAuth scopes in "Bot token scopes" section for your app to access the required features. Make sure to include the necessary scopes for your server to interact with Slack.
1. Enable interactivity and set the request URL to your server's endpoint for handling Slack interactions (e.g., `https://some-generated-hash.ngrok-free.app/interact`).
1. Under the "Features" section, click on "Slash Commands" to create three commands:
   - `/doit` - The main command to provide description of actions by slack user and chat with AI assistant. Set the "Request URL" to `/` path on the server, (e.g. `https://some-generated-hash.ngrok-free.app/`).
   - `/doit-clear` - The command to clear user's messages history. User's sessions together with messages are removed after 24h of idle. Still, it's recommended to run this command before changing context of the chat, to limit tokens sent to OpenAI API. Set the "Request URL" to `/clear` path on the server, (e.g. `https://some-generated-hash.ngrok-free.app/clear`).
   - `/doit-api-keys` - The command to set API Keys and other data required for third party APIs: OpenAI API and JIRA REST API. User will be asked to provide this data if he_r session doesn't exist whenever hits `/doit` command, but still it's recommended to keep this command if user will want to change its API Keys. Set the "Request URL" to `/api-keys` path on the server, (e.g. `https://some-generated-hash.ngrok-free.app/api-keys`).
1. Go to the "Install App" section.
1. Click on the "Install App to Workspace" button to install the app to your selected workspace.

Now, your Slack app is configured to work with the server. Start the server and test the app's functionality within Slack.

## Prerequisites

Make sure you have the following software installed before running the server:

- Node.js - [Download & Install Node.js](https://nodejs.org)
- npm - This comes bundled with Node.js, but make sure you have the latest version by running `npm install npm@latest -g`.
- MongoDB - [Download & Install MongoDB](https://www.mongodb.com/try/download/community)

## Project Structure

The main files and directories in this repository are organized as follows:

- `src/` - Contains the source code files for the server.
  - `server.js` - The entry point for the server.
  - Other files - Additional server logic and routes can be added in this directory.
- `package.json` - Defines the project dependencies and scripts.

## Scripts

The following scripts are available for this project:

- `npm run dev` - Starts the server using nodemon for automatic restart on file changes and reads environmental variables from `.env` file.
- `npm start` - Starts the server for production.

## Docker

This project includes a Docker configuration that allows you to easily run the application in a containerized environment. Docker provides a consistent and reproducible environment, making it easier to deploy and share your application.

### Prerequisites

Before getting started with Docker, ensure that you have the following prerequisites installed on your machine:

- Docker: [Installation Guide](https://docs.docker.com/get-docker/)

### Build Docker Image

To build the Docker image for this project, follow these steps:

1. Open a terminal and navigate to the root directory of the project.
2. Run the following command to build the Docker image:

   ```bash
   docker build -t your-image-name .
   ```

   Replace `your-image-name` with the desired name for your Docker image.

### Run Docker Container

Once you have built the Docker image, you can run the application in a Docker container. Use the following steps:

1. Run the following command to start a Docker container from the image:

   ```bash
   docker run --env-file=.env -p 3000:3000 -d your-image-name
   ```

   Replace `your-image-name` with the name you specified when building the Docker image.

2. The server will run under `http://localhost:3000`.

### Customize Docker Configuration

If you need to customize the Docker configuration for this project, you can modify the `Dockerfile` present in the project's root directory. The `Dockerfile` specifies the instructions for building the Docker image.

### Cleanup

To stop the running Docker container, use `Ctrl+C` in the terminal where the container is running.

If you want to remove the Docker image from your system, run the following command:

```bash
docker image rm your-image-name
```

Replace `your-image-name` with the name of the Docker image you want to remove.

## Dependencies

The server relies on the following dependencies, which are listed in the `package.json` file:

- `body-parser` - Middleware for parsing incoming request bodies.
- `express` - Web framework for building the server.
- `json5` - JSON parser with support for comments and trailing commas.
- `mongoose` - MongoDB object modeling tool.
- `mongoose-encryption` - Mongoose plugin for encrypting data.
- `node-fetch` - A lightweight library for making HTTP requests.
- `openai` - Official OpenAI API client library.

These dependencies are automatically installed when running `npm install`.

## Contributing

If you'd like to contribute to this project, please follow these guidelines:

1. Fork the repository.
1. Create a new branch for your feature: `git checkout -b feature/your-feature-name`.
1. Make your changes and commit them: `git commit -m "Add your feature description"`.
1. Push the changes to your forked repository: `git push origin feature/your-feature-name`.
1. Create a pull request explaining your changes.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for more information.

## Author

This project was authored by Mateusz Adamczyk (@bobbylej).

# Doit Jira - Server for Slack App

The Slack app acts as a middleware between Slack and Jira software, utilizing the power of OpenAI to facilitate conversational interactions with users. By leveraging natural language processing, the app empowers users to seamlessly manage Jira issues directly from Slack. It serves as a bridge, enabling users to have dynamic conversations, make requests, and perform actions on Jira issues using familiar and intuitive language within the Slack platform.

This app is currently in an **experimental phase** and is not recommended for production use. It may contain limitations, potential issues, or incomplete features that could impact its reliability or security in a production environment. Therefore, it is advised to use this app for experimental or testing purposes only, and not in a live production setting.

This repository contains the server code for a Doit Jira Slack app. The server is responsible for handling incoming requests from Slack and performing various actions based on those requests. It uses Node.js and Express framework for building the server. 

## Getting Started

To get started with the Doit Slack app server, follow these steps:

1. Clone the repository: `git clone https://github.com/bobbylej/doit.git`
2. Install the dependencies: `npm install`
3. Create a `.env` file in the root directory of the project and add your environment variables. You can refer to the `.env.example` file for the required variables.
4. Start the server: `npm start`
5. The server should now be running on `http://localhost:3000`.
6. To interact with slack app create publicity accessible URL or use development proxy like [ngrok](https://ngrok.com/). 

## Installing and Running MongoDB Locally

The server uses MongoDB as the database. Follow the steps below to install and run MongoDB locally:

1. Download MongoDB Community Server: Visit the [MongoDB Download Center](https://www.mongodb.com/try/download/community) and download the appropriate version for your operating system.
2. Install MongoDB: Run the installer and follow the installation instructions for your operating system.
3. Configure the MongoDB Environment:
   - Create the data directory: By default, MongoDB stores data in the `/data/db` directory. Create this directory in the root of your system drive (e.g., `C:\data\db` on Windows or `/data/db` on macOS/Linux).
   - Add the MongoDB bin directory to your system's PATH environment variable: The bin directory is typically located in the MongoDB installation directory (e.g., `C:\Program Files\MongoDB\Server\{version}\bin` on Windows or `/usr/local/bin` on macOS/Linux). Add this directory to your system's PATH variable to access MongoDB from the command line.
4. Start the MongoDB Server:
   - Open a command prompt or terminal window.
   - Run the following command to start the MongoDB server: `mongod`
5. Verify the MongoDB Installation:
   - Open another command prompt or terminal window.
   - Run the following command to start the MongoDB shell: `mongo`
   - If MongoDB is running successfully, you will see a MongoDB shell prompt (`>`) in the new window.

Now, you have MongoDB installed and running locally. The server will be able to connect to the MongoDB database.

## Creating a Slack App

To use this server with a Slack app, you need to create a Slack app and configure it to interact with the server. Here are the steps to create a Slack app:

1. Go to the [Slack API website](https://api.slack.com/apps) and click on "Create New App".
2. Provide a name and select the workspace where you want to install the app.
3. Under the "Features" section, click on "OAuth & Permissions" to configure the app's OAuth scopes and redirect URLs.
4. Add `channels:read`, `chat:write` and `commands` OAuth scopes in "Bot token scopes" section for your app to access the required features. Make sure to include the necessary scopes for your server to interact with Slack.
5. Enable interactivity and set the request URL to your server's endpoint for handling Slack interactions (e.g., `https://some-generated-hash.ngrok-free.app/interact`).
6. Under the "Features" section, click on "Slash Commands" to create three commands:
- `/doit` - The main command to provide description of actions by slack user and chat with AI assistant. Set the "Request URL" to `/` path on the server, (e.g. `https://some-generated-hash.ngrok-free.app/`).
- `/doit-clear` - The command to clear user's messages history. User's sessions together with messages are removed after 24h of idle. Still, it's recommended to run this command before changing context of the chat, to limit tokens sent to OpenAI API. Set the "Request URL" to `/clear` path on the server, (e.g. `https://some-generated-hash.ngrok-free.app/clear`).
- `/doit-api-keys` - The command to set API Keys and other data required for third party APIs: OpenAI API and JIRA REST API. User will be asked to provide this data if he_r session doesn't exist whenever hits `/doit` command, but still it's recommended to keep this command if user will want to change its API Keys. Set the "Request URL" to `/api-keys` path on the server, (e.g. `https://some-generated-hash.ngrok-free.app/api-keys`).
7. Go to the "Install App" section.
8. Click on the "Install App to Workspace" button to install the app to your selected workspace.

Now, your Slack app is configured to work with the server. Start the server and test the app's functionality within Slack.

## Prerequisites

Make sure you have the following software installed before running the server:

- Node.js - [Download & Install Node.js](https://nodejs.org)
- npm - This comes bundled with Node.js, but make sure you have the latest version by running `npm install npm@latest -g`.
- MongoDB - [Download & Install MongoDB](https://www.mongodb.com/try/download/community)

## Project Structure

The main files and directories in this repository are organized as follows:

- `src/` - Contains the source code files for the server.
  - `index.js` - The entry point for the server.
  - Other files - Additional server logic and routes can be added in this directory.
- `package.json` - Defines the project dependencies and scripts.

## Scripts

The following scripts are available for this project:

- `npm start` - Starts the server using nodemon for automatic restart on file changes.

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
2. Create a new branch for your feature: `git checkout -b feature/your-feature-name`.
3. Make your changes and commit them: `git commit -m "Add your feature description"`.
4. Push the changes to your forked repository: `git push origin feature/your-feature-name`.
5. Create a pull request explaining your changes.

## License

This project is licensed under the ISC License. See the [LICENSE](LICENSE) file for more information.

## Author

This project was authored by Mateusz Adamczyk (@bobbylej).
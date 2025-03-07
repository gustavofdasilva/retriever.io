# Contributing

Retriever.io is an open-source project. I really apreciate any effort on it. Below are the guidelines to get started.

## Technology Stack
Retriever.io is built using Tauri. See the [start guide](https://v2.tauri.app/start/) to check all details.

### Dependencies
To be able to start development on Retriever++, make sure you have the following prerequisites:
<li><a href="https://nodejs.org/en">Node (v18.20 or higher)</a></li>
<li><a href="https://www.npmjs.com">NPM (v10 or higher)</a></li>
<li><a href="https://v2.tauri.app/start/">Tauri enviroment ready</a></li>

## Development

1. Clone the repository and install dependencies:
```
git clone https://github.com/gustavofdasilva/retriever.io
cd retriever.io
npm install
```
<br>

2. Run `npm run tauri dev` for a dev enviroment. The application will automatically reload if you change any of the source files.
```
npm run tauri dev
```
The development environment should now be set up.
<br>

## Raising Pull Requests

- Please keep the PR's small and focused on one thing
- Please follow the format of creating branches
  - feature/[feature name]: This branch should contain changes for a specific feature
    - Example: feature/dark-mode
  - bugfix/[bug name]: This branch should contain only bug fixes for a specific bug
    - Example bugfix/bug-1

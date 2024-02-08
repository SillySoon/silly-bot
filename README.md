# SillyBot

![Image](./Panel_White.png)

SillyBot is a versatile Discord bot designed to engage and entertain members of your server. It comes equipped with a unique points system, gambling commands, and a specialized counting game that adds a competitive and interactive layer to your community's experience. Built with TypeScript, SillyBot offers robust performance and reliability, ensuring a seamless integration into your Discord server.

<a href="https://twitch.tv/sillysoon" target="_blank">![Static Badge](https://img.shields.io/badge/SillySoon-9145ff?style=for-the-badge&logo=twitch&logoColor=white)</a>
<a href="https://discord.gg/SxwuKcmYbx">![Static Badge](https://img.shields.io/badge/Support-4f63f0?style=for-the-badge&logo=discord&logoColor=white)</a>

## Features

- **Counting Game**: Encourages server members to count consecutively in a specific channel, fostering community participation.
- **Points System**: Members earn points through various activities, which can be used to engage with the bot's features.
- **Gamble Command**: Allows members to gamble their points in hopes of increasing their balance, adding a risk-reward element to the interaction.
- **Points Leaderboard**: Showcases the members with the highest points, promoting healthy competition within the server.

## Installation

### Prerequisites

- Node.js 14.x or higher
- TypeScript 4.x
- A MongoDB database for storing application data

### Setup

1. **Clone the Repository**:
   ```bash
   git clone https://github.com/yourgithub/sillybot.git
   cd sillybot
   ```

2. **Install Dependencies**:
   Install the required packages using npm.
   ```bash
   npm install
   ```

3. **Environment Configuration**:
   - Copy the `.env.template` file to a new file named `.env`.
   - Fill in the `.env` file with your bot's Discord token, application ID, and MongoDB details.

### Build and Run

SillyBot uses TypeScript for development, with tsup for building the project. Here are the commands to build and run the bot:

- **Development**:
  Run the bot in development mode with live reloading.
  ```bash
  npm run dev
  ```

- **Build**:
  Compile the TypeScript code to JavaScript in the `dist` folder.
  ```bash
  npm run build
  ```

- **Start**:
  Run the compiled JavaScript in production.
  ```bash
  npm start
  ```

## Usage

Once SillyBot is up and running, members can interact with it using the provided commands. The bot will automatically manage the points system, including the gambling feature and the leaderboard. Make sure to set up a dedicated channel for the counting game to avoid cluttering other community spaces.

## Contributing

We welcome contributions to SillyBot! Whether it's adding new features, fixing bugs, or improving documentation, please feel free to fork the repository and submit a pull request.

## License

SillyBot is released under the MIT License. See the LICENSE file for more details.
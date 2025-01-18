# Dreamio - AI Art Generator

![Dreamio Logo](https://is1-ssl.mzstatic.com/image/thumb/Purple221/v4/0f/64/1b/0f641b90-f06c-7e65-9cc9-1982f3de820d/AppIcon-0-0-1x_U007ephone-0-1-85-220.png/135x135bb.png)

## Overview

Dreamio is a free React Native app built following the **Feature-Sliced Design (FSD)** methodology ([learn more](https://feature-sliced.design/)). It generates AI art using the Pollinations API, respects user privacy, collects no data, and is available on the [App Store](https://apps.apple.com/us/app/ai-art-generator-dreamio/id6740452958).

The source code for the mobile application is located in the packages/mobile directory.

## Features

- **AI Art Creation**: Generate unique images effortlessly.
- **Powered by Pollinations**: Leverages [Pollinations API](https://pollinations.ai/) for AI-generated art.
- **Completely Free**: No in-app purchases or subscriptions.
- **Privacy First**: No data collection.

## Tech Stack

- **TypeScript**: Strongly typed codebase.
- **React Native**: Cross-platform mobile framework.
- **React Native Paper**: Provides a Material Design component library.
- **MobX**: Efficient state management.
- **SQLite + TypeORM**: Persistent local data storage.
- **Axios**: Simplified API requests.
- **Firebase**: Hosts static files like Terms and Privacy Policy.
- **NX Monorepo**: Used to manage the codebase, originally designed with a backend and external database.
- **i18next**: Strongly typed localization strings, based on the base en dictionary.
- **Google Translate API**: Utilized for translating prompts into English before sending them for art generation.

## Development Notes

Originally designed with subscription features, the app was simplified to focus on free functionality. Some parts of the code may appear over-engineered due to these initial plans.

## Installation

To run locally:

1. Clone the repository:
   ```bash
   git clone git@github.com:li4e/dreamio.git
   cd dreamio
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the bundler:
   - Start: `npx nx run mobile:start`

## Open Source Purpose

- Demonstrates Feature Slice Design in React Native.
- Shares knowledge and practices with the community.

## Future Plans

- More customization options.
- Integration with additional APIs.
- Social network elements allowing users to share their creations, like, and follow others.
- Community-driven enhancements.

## License

Released under the [MIT License](LICENSE). Contributions are welcome.

## Contact

For feedback or issues, please open an issue or reach out directly.

# Dreamio - AI Art Generator

![Dreamio Logo](https://is1-ssl.mzstatic.com/image/thumb/Purple211/v4/6e/39/22/6e3922bf-9ed7-7e74-b31b-1d5803e15cb1/AppIcon-0-0-1x_U007ephone-0-1-85-220.png/135x135bb.png)

## Overview

Dreamio is a free React Native app built following the **Feature-Sliced Design (FSD)** methodology ([learn more](https://feature-sliced.design/)). It generates AI art using the Pollinations API and is available on the [App Store](https://apps.apple.com/us/app/ai-art-generator-dreamio/id6740452958) and [Google Play Store]([https://apps.apple.com/us/app/ai-art-generator-dreamio/id6740452958](https://play.google.com/store/apps/details?id=me.ilsur.aidreamio)).

The source code for the mobile application is located in the apps/mobile directory.

## Features

- **AI Art Creation**: Generate unique images effortlessly.
- **Powered by Pollinations**: Leverages [Pollinations API](https://pollinations.ai/) for AI-generated art.
- **Completely Free**: No in-app purchases or subscriptions.

## Tech Stack

- **TypeScript**: Strongly typed codebase.
- **React Native**: Cross-platform mobile framework.
- **React Native Paper**: Provides a Material Design component library.
- **MobX**: Efficient state management.
- **SQLite + TypeORM**: Persistent local data storage.
- **Axios**: Simplified API requests.
- **Firebase**: Hosts static files like Terms and Privacy Policy.
- **i18next**: Strongly typed localization strings, based on the base en dictionary.
- **Google Translate API**: Utilized for translating prompts into English before sending them for art generation.

## Development Notes

Originally designed with subscription features, the app was simplified to focus on free functionality. Some parts of the code may appear over-engineered due to these initial plans.

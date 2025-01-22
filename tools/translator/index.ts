import yargs from 'yargs'
import { translateApp } from './app'
import { translateStoreMeta } from './meta'

// Create a command-line argument parser using yargs
// Parse the arguments
yargs(process.argv.slice(2))
  // Define the 'app' command and bind it to the translateApp function
  .command('app', 'Translate app', () => translateApp())

  // Define the 'store' command and bind it to the translateStoreMeta function
  .command('meta', 'Translate store meta', () => translateStoreMeta())

  // Make sure that at least one command is provided
  .demandCommand(1, 'You must specify a command')

  // Display help message if needed
  .help().argv

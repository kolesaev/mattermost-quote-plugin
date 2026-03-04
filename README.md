# Mattermost Quote Reply Plugin

A Mattermost plugin that adds quote reply functionality with user mentions.

## Features

- Adds a "Quote" button to the post menu (next to the Reply button)
- Quotes messages in the following format:
  ```
  @username - <link to post>


  Your text  
  ```
- Automatically focuses the input field after inserting the quote
- Works in both main channel and threads

## Installation

1. Build the plugin using `make dist`
2. Upload the generated plugin file to your Mattermost system via System Console > Plugins > Management
3. Activate the plugin

## Building

```bash
make dist
```

## Usage

1. Hover over the message you want to quote
2. Click the quote button (quote icon) in the post menu
3. The input field will automatically be populated with a formatted quote including the author mention
4. Type your response and send the message

## Requirements

- Mattermost Server version 10.0.0 and above

## Compatibility

Tested with Mattermost version 10.9.1

## License

MIT License

## Support

For bug reports and feature requests, create an issue in the project repository.

## Author

Developed by Aleksei Kolesaev
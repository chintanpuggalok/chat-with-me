# Tweet Logger Chrome Extension

## Overview

The Tweet Logger Chrome Extension allows users to upload a file containing tweets and log each tweet item. Additionally, users can chat with their tweets by uploading them to NotebookLM. Here is the V1


## Features

- Upload a file containing tweets.
- Log each tweet item.
- Chat with your tweets by uploading them to NotebookLM.

## Installation

1. Clone the repository or download the source code.
2. Open Chrome and navigate to `chrome://extensions/`.
3. Enable "Developer mode" by toggling the switch in the top right corner.
4. Click on the "Load unpacked" button and select the directory containing the extension's source code.

## Usage

1. Click on the extension icon in the Chrome toolbar to open the popup.
2. Use the "Upload" button to select and upload a file containing tweets (tweets.js).

## File Structure

- `popup.html`: The HTML file for the extension's popup interface.
- `popup.js`: The JavaScript file for handling interactions in the popup.
- `background.js`: The background script for processing file content and handling messages.
- `content.js`: The content script for interacting with the web page.
- `manifest.json`: The manifest file for the Chrome extension.

## Permissions

The extension requires the following permissions:

- `storage`: To store data locally.
- `downloads`: To handle file downloads.
- `activeTab`: To interact with the active tab.
- `scripting`: To inject scripts into web pages.

## Contributing

Contributions are welcome! Please open an issue or submit a pull request for any improvements or bug fixes.

## License

This project is licensed under the MIT License.
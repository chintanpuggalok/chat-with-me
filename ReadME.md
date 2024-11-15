# Upload Tweets to NotebookLM

This Chrome extension allows you to upload your tweets to NotebookLM, enabling you to log each tweet item and chat with your tweets by uploading them to NotebookLM.

[Watch Demo](https://www.loom.com/share/fd27db4ba85b430fabe4c174ac015b76?sid=60b82794-c364-4f91-95b0-c4e36e83c3b7)

## Features

- Upload a file containing tweets.
- Process and convert tweets to markdown format.
- Upload tweets to NotebookLM.
- Log each tweet item.
- Chat with your tweets by sending messages to NotebookLM.

## Release Notes

### Version 0.1.1 - Testing Phase

- Initial release with basic features.
- Upload a file containing tweets.
- Process and convert tweets to markdown format.
- Upload tweets to NotebookLM.
- Log each tweet item.
- Chat with your tweets by sending messages to NotebookLM.

## Installation

1. Clone the repository to your local machine.
2. Open Chrome and navigate to `chrome://extensions/`.
3. Enable "Developer mode" by toggling the switch in the top right corner.
4. Click on "Load unpacked" and select the directory where you cloned the repository.

## Usage

1. Open [NotebookLM](https://notebooklm.google.com/) and create a notebook.
2. Ensure that you are on the upload sources screen.
   ![Upload Sources Screen](./upload_sources.png)
3. Click on the extension icon in the Chrome toolbar to open the popup.
4. Click the "Upload" button to select a file containing your tweets.
5. Locate and select the `tweets.js` file.
6. The extension will process the file, convert the tweets to markdown format, and upload them to NotebookLM.
7. You can view the log of each tweet item in the console.

## File Structure

- `manifest.json`: Defines the extension's metadata and permissions.
- `popup.html`: The HTML file for the extension's popup interface.
- `popup.js`: The JavaScript file for handling the popup's functionality.
- `background.js`: The background script for processing and uploading tweets.
- `content.js`: The content script for interacting with the NotebookLM page.

## Contributing

If you would like to contribute to this project, please fork the repository and submit a pull request.

## License

This project is licensed under the MIT License.

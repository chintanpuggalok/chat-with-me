document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('uploadButton').addEventListener('click', () => {
    // Get the file input element
    const fileInputElement = document.getElementById('fileInput');
    const selectedFile = fileInputElement.files[0];
    if (selectedFile) {
      // Read the selected file
      const fileReader = new FileReader();
      fileReader.onload = function(event) {
        // Send the file content to the background script for processing
        const fileContent = event.target.result;
        chrome.runtime.sendMessage({ action: 'processFile', content: fileContent });
      };
      fileReader.readAsText(selectedFile);
    } else {
      alert('No file selected');
    }
  });

  document.getElementById('sendButton').addEventListener('click', () => {
    const chatInputElement = document.getElementById('chatInput');
    const chatMessage = chatInputElement.value;
    if (chatMessage) {
      chrome.runtime.sendMessage({ action: 'sendMessage', message: chatMessage });
      chatInputElement.value = ''; // Clear the chat input
    } else {
      alert('No message entered');
    }
  });
});
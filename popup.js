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

  document.getElementById('downloadButton').addEventListener('click', () => {
    const fileInputElement = document.getElementById('fileInput');
    const selectedFile = fileInputElement.files[0];
    if (selectedFile) {
      const fileReader = new FileReader();
      fileReader.onload = function(event) {
        const fileContent = event.target.result;
        chrome.runtime.sendMessage({ action: 'downloadMarkdown', content: fileContent });
      };
      fileReader.readAsText(selectedFile);
    } else {
      alert('No file selected');
    }
  });
});
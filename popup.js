document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('uploadButton').addEventListener('click', () => {
    // alert('Upload button clicked');
    const fileInput = document.getElementById('fileInput');
    const file = fileInput.files[0];
    if (file) {
      // alert('File selected: ' + file.name);
      const reader = new FileReader();
      reader.onload = function(event) {
        // alert('File read successfully');
        const content = event.target.result;
        chrome.runtime.sendMessage({ action: 'processFile', content: content });
      };
      reader.readAsText(file);
    } else {
      alert('No file selected');
    }
  });
});
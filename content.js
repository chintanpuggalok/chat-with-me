chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'insertContent') {
    console.log('Received insertContent message');
    
    // Log the entire DOM to inspect the structure
    console.log('Document body:', document.body.innerHTML);
    
    // Try different selectors to locate the file input element
    const fileInputSelectors = [
      'input[type="file"]'
    ];
    
    let fileInput = null;
    for (const selector of fileInputSelectors) {
      fileInput = document.querySelector(selector);
      if (fileInput) {
        console.log(`File input element found using selector: ${selector}`, fileInput);
        break;
      }
    }
    
    if (fileInput) {
      const markdownContent = message.content.split('----');
      const dataTransfer = new DataTransfer();
      markdownContent.forEach((content, index) => {
        const file = new File([content], `tweet_${index + 1}.md`, { type: 'text/markdown' });
        dataTransfer.items.add(file);
        console.log(`Adding file to DataTransfer: ${file.name}`);
      });
      fileInput.files = dataTransfer.files;
      console.log('Files added to file input');
      
      // Trigger change event on the file input element
      const changeEvent = new Event('change', {
        bubbles: true,
        cancelable: true
      });
      fileInput.dispatchEvent(changeEvent);
      console.log('Change event dispatched:', changeEvent);

      sendResponse({ status: 'success' });
    } else {
      console.error('File input element not found');
      sendResponse({ status: 'error', message: 'File input element not found' });
    }
  } else if (message.action === 'ping') {
    console.log('Received ping message');
    sendResponse({ status: 'ready' });
  }
  return true; // Keep the message channel open for sendResponse
});

// Notify background script that content script is ready
console.log('Sending contentScriptReady message');
chrome.runtime.sendMessage({ action: 'contentScriptReady' });

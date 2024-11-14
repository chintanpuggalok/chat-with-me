chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'insertContent') {
    console.log('Received insertContent message');
    
    // Log the entire DOM to inspect the structure
    console.log('Document body:', document.body.innerHTML);
    
    // Click the button to make the input element appear
    const buttonSelector = 'button[aria-label="Upload sources from your computer"]';
    const button = document.querySelector(buttonSelector);
    
    if (button) {
      console.log('Button found:', button);
      
      // Perform a generic click event
      button.click();
      console.log('Button clicked to make file input element appear');
      
      // Wait for the file input element to appear
      setTimeout(() => {
        // Try different selectors to locate the file input element
        const fileInputSelectors = [
          'input[name="Filedata"]'
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
          const markdownContent = message.content.split('----').slice(0, 50); // Limit to 50 files
          const dataTransfer = new DataTransfer();
          
          const uploadFiles = async () => {
            for (let i = 0; i < markdownContent.length; i++) {
              const content = markdownContent[i];
              const fileName = `tweet_${i + 1}.md`;
              const file = new File([content], fileName, { type: 'text/markdown' });
              dataTransfer.items.add(file);
              console.log(`Adding file to DataTransfer: ${file.name}`);
              
              fileInput.files = dataTransfer.files;
              console.log('Files added to file input:', file.name);
            }
            
            // Trigger change event on the file input element after all files are added
            const changeEvent = new Event('change', {
              bubbles: true,
              cancelable: true
            });
            fileInput.dispatchEvent(changeEvent);
            console.log('Change event dispatched:', changeEvent);
            
            sendResponse({ status: 'success' });
          };
          
          uploadFiles();
        } else {
          console.error('File input element not found');
          sendResponse({ status: 'error', message: 'File input element not found' });
        }
      }, 500); // Wait 500ms for the file input element to appear
    } else {
      console.error('Button element not found');
      sendResponse({ status: 'error', message: 'Button element not found' });
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

// Function to create and dispatch a custom mouse event
function dispatchCustomMouseEvent(targetElement) {
  const mouseEvent = new MouseEvent('mouseover', {
    view: window,
    bubbles: true,
    cancelable: true,
    altKey: false,
    ctrlKey: false,
    shiftKey: false,
    metaKey: false,
    button: 0,
    buttons: 0,
    relatedTarget: document.querySelector('h4.gmat-headline-4.dropzone__description.ng-star-inserted')
  });
  targetElement.dispatchEvent(mouseEvent);
  console.log('Custom mouse event dispatched:', mouseEvent);
}

// Example usage
targetElement = document.querySelector('span.dropzone__file-dialog-button');
if (targetElement) {
  dispatchCustomMouseEvent(targetElement);
}

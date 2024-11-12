//todo: add delay in file upload to reduce failures 
//todo: find a way to get a better selector
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'processFile' && message.content) { // Validate message content
    console.info('Processing file content');
    let isProcessing = false; // Add a flag to track processing state

    const processFile = async () => {
      if (isProcessing) {
        return; // Exit if already processing
      }
      isProcessing = true; // Set the flag to true

      try {
        const scriptContent = message.content;
        const fileSize = new Blob([scriptContent]).size;
        if (fileSize > 10 * 1024 * 1024) { // 10 MB
          console.warn('File is too large and may cause performance issues');
        }

        // Extract the JSON content from the specific format of twt.js
        const jsonStart = scriptContent.indexOf('[');
        const jsonEnd = scriptContent.lastIndexOf(']') + 1;
        const jsonString = scriptContent.substring(jsonStart, jsonEnd);
        const tweets = JSON.parse(jsonString);

        // Function to remove URLs from text
        function removeUrls(text) {
          const urlPattern = /https?:\/\/\S+|www\.\S+/g;
          return text.replace(urlPattern, '');
        }

        // Function to convert tweet data to markdown
        function tweetToMarkdown(tweet) {
          const md = [];
          if (tweet.created_at) {
            md.push(`*Created:* ${tweet.created_at}`);
          }
          if (tweet.full_text) {
            const cleanedText = removeUrls(tweet.full_text);
            if (cleanedText.split(' ').length < 10) {
              return null; // Exclude tweets with less than 10 words
            }
            md.push(cleanedText);
          }
          if (tweet.favorite_count) {
            md.push(`*Likes:* ${tweet.favorite_count}`);
          }
          if (tweet.in_reply_to_screen_name) {
            md.push(`*Reply To:* ${tweet.in_reply_to_screen_name}`);
          }
          if (tweet.entities && tweet.entities.user_mentions) {
            md.push(`*Mentions:* ${tweet.entities.user_mentions.map(mention => mention.screen_name).join(', ')}`);
          }
          return md.join('\n');
        }

        // Convert each tweet to markdown
        const markdownContent = [];
        let currentContent = "";
        tweets.forEach((tweetObj, index) => {
          const tweet = tweetObj.tweet;
          const tweetMd = tweetToMarkdown(tweet);
          if (tweetMd === null) {
            return; // Skip this tweet
          }
          if (currentContent.length + tweetMd.length + 2 > 50000) { // +2 for the double newline separator
            markdownContent.push(currentContent);
            currentContent = tweetMd;
          } else {
            if (currentContent.length > 0) {
              currentContent += "\n\n";
            }
            currentContent += tweetMd;
          }
        });
        if (currentContent.length > 0) {
          markdownContent.push(currentContent);
        }

        console.log('Processed markdown content:', markdownContent);

        // Function to check if the content script is ready
        function checkContentScriptReady(tabId, callback) {
          chrome.tabs.sendMessage(tabId, { action: 'ping' }, (response) => {
            if (response && response.status === 'ready') {
              callback();
            } else {
              setTimeout(() => checkContentScriptReady(tabId, callback), 1000);
            }
          });
        }

        // Function to upload files with delay and ensure no duplicates
        async function uploadFilesWithDelay(tabId, content, delay) {
          await new Promise((resolve, reject) => {
            chrome.tabs.sendMessage(tabId, { action: 'insertContent', content: content.join('----') }, (response) => {
              if (chrome.runtime.lastError) {
                console.error(chrome.runtime.lastError.message);
                reject(chrome.runtime.lastError.message);
              } else {
                console.log('File message sent successfully');
                console.log('Response from content script:', response);
                resolve(response);
              }
            });
          });
          await new Promise(resolve => setTimeout(resolve, delay));
        }

        // Wait for the content script to be ready before sending the message
        const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
        const activeTab = tabs[0];
        if (activeTab.url.includes('https://notebooklm.google.com/')) {
          await chrome.scripting.executeScript({
            target: { tabId: activeTab.id },
            files: ['content.js']
          });
          console.log('Content script injected, waiting for content script to be ready');
          return new Promise((resolve, reject) => {
            checkContentScriptReady(activeTab.id, async () => {
              console.log('Content script is ready, sending insertContent message');
              try {
                await uploadFilesWithDelay(activeTab.id, markdownContent, 100); // 100 ms delay
                resolve({ status: 'success' });
              } catch (error) {
                reject(error);
              }
            });
          });
        }
      } catch (error) {
        console.error('Error processing file content:', error);
        throw error;
      } finally {
        isProcessing = false; // Reset the flag
      }
    };

    processFile().then(sendResponse).catch(error => sendResponse({ status: 'error', message: error.message }));
    return true; // Keep the message channel open for sendResponse
  }
});
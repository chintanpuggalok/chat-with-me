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
          const md = ["<START_TWEET>"];
          if (tweet.created_at) {
            md.push(`**Created At:** ${tweet.created_at}`);
          }
          if (tweet.full_text) {
            const cleanedText = removeUrls(tweet.full_text);
            if (cleanedText.split(' ').length < 10) {
              return null; // Exclude tweets with less than 10 words
            }
            md.push(`**Full Text:** ${cleanedText}`);
          }
          if (tweet.favorite_count) {
            md.push(`**Favorite Count:** ${tweet.favorite_count}`);
          }
          if (tweet.in_reply_to_screen_name) {
            md.push(`**In Reply To:** ${tweet.in_reply_to_screen_name}`);
          }
          if (tweet.entities && tweet.entities.user_mentions) {
            md.push(`**User Mentions:** ${tweet.entities.user_mentions.map(mention => mention.screen_name).join(', ')}`);
          }
          md.push("<END_TWEET>");
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
            checkContentScriptReady(activeTab.id, () => {
              console.log('Content script is ready, sending insertContent message');
              chrome.tabs.sendMessage(activeTab.id, { action: 'insertContent', content: markdownContent.join('----') }, (response) => {
                if (chrome.runtime.lastError) {
                  console.error(chrome.runtime.lastError.message);
                  reject(chrome.runtime.lastError.message);
                } else {
                  console.log('Message sent successfully');
                  console.log('Response from content script:', response);
                  resolve(response);
                }
              });
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
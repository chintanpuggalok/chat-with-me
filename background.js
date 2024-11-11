chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'processFile') {
    console.info('Processing file content');
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
          if (currentContent) {
            currentContent += "\n\n";
          }
          currentContent += tweetMd;
        }
      });
      if (currentContent) {
        markdownContent.push(currentContent);
      }

      // Save the markdown content to multiple files
      markdownContent.forEach((content, i) => {
        const blob = new Blob([content], { type: 'text/markdown' });
        const reader = new FileReader();
        reader.onloadend = function() {
          const dataUrl = reader.result;
          chrome.downloads.download({
            url: dataUrl,
            filename: `tweets_analysis_${i + 1}.md`,
            saveAs: true
          });
        };
        reader.readAsDataURL(blob);
      });

      console.info('File processing completed');
    } catch (error) {
      console.error('Error processing file content:', error);
    }
  }
});
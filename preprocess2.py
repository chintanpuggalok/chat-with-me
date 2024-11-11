import json
import re
import os

# Load the JSON data
with open('tweets.json', 'r') as file:
    tweets = json.load(file)

# Function to remove URLs from text
def remove_urls(text):
    url_pattern = re.compile(r'https?://\S+|www\.\S+')
    return url_pattern.sub(r'', text)

# Function to convert tweet data to markdown
def tweet_to_markdown(tweet):
    md = ["<START_TWEET>"]
    if 'created_at' in tweet:
        md.append(f"**Created At:** {tweet['created_at']}")
    if 'full_text' in tweet:
        cleaned_text = remove_urls(tweet['full_text'])
        if len(cleaned_text.split()) < 10:
            return None  # Exclude tweets with less than 10 words
        md.append(f"**Full Text:** {cleaned_text}")
    if 'favorite_count' in tweet:
        md.append(f"**Favorite Count:** {tweet['favorite_count']}")
    if 'in_reply_to_screen_name' in tweet:
        md.append(f"**In Reply To:** {tweet['in_reply_to_screen_name']}")
    if 'entities' in tweet and 'user_mentions' in tweet['entities']:
        md.append(f"**User Mentions:** {', '.join([mention['screen_name'] for mention in tweet['entities']['user_mentions']])}")
    md.append("<END_TWEET>")
    
    return "\n".join(md)

# Convert each tweet to markdown
markdown_content = []
current_content = ""
for tweet in tweets:
    tweet_md = tweet_to_markdown(tweet['tweet'])
    if tweet_md is None:
        continue  # Skip this tweet
    if len(current_content) + len(tweet_md) + 2 > 50000:  # +2 for the double newline separator
        markdown_content.append(current_content)
        current_content = tweet_md
    else:
        if current_content:
            current_content += "\n\n"
        current_content += tweet_md
if current_content:
    markdown_content.append(current_content)

# Ensure the directory exists
output_dir = 'generated_md'
os.makedirs(output_dir, exist_ok=True)

# Save the markdown content to multiple files
for i, content in enumerate(markdown_content):
    with open(os.path.join(output_dir, f'tweets_analysis_{i+1}.md'), 'w') as file:
        file.write(content)

print("Markdown files created successfully.")
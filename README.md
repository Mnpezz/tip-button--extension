# Nano Tip Buttons

A Chrome extension that adds Nano cryptocurrency tip buttons to Twitter and Facebook posts.

## Features
- Easy-to-use tip buttons for Twitter and Facebook
- Supports NanoPay and BitRequest
- Live preview in post composers
- Dark mode support

## Installation

1. Clone this repository
2. Open Chrome and go to `chrome://extensions/`
3. Enable "Developer mode"
4. Click "Load unpacked" and select the repository folder

## Usage

### NanoPay Button

Add a NanoPay button to your post using this format:

Better with no line breaks:

Post text nanopay{"amount":"1","address":"@mnpezz","currency":"USD","text":"Tip $1"}

 OR
 
Post text
nanopay{
  "amount": "1",
  "address": "@mnpezz",
  "currency": "USD",
  "text": "Tip $1"
}

### BitRequest Button

Add a BitRequest button using this format:

Post text
bitrequest{
"payment": "nano",
"currency": "USD",
"amount": "1",
"address": "nano_1uhkq6umetofuik5h1dx9ccydrmdg8ewerf4rhjz477tzsr75jqftwxkjkb8",
"title": "Thank You",
"receiver": "mnpezz",
"text": "Pay $1 in Nano"
}


### NOT WORKING!! Interactive Elements

#### Game
game{
let b={x:150,y:100,d:2};
setInterval(() => {
const ctx = gameContainer.getContext('2d');
ctx.clearRect(0, 0, 300, 200);
ctx.beginPath();
ctx.arc(b.x, b.y, 10, 0, Math.PI 2);
ctx.fill();
b.x += b.d;
b.y += b.d;
if (b.x < 10 || b.x > 290) b.d = -1;
if (b.y < 10 || b.y > 190) b.d = -1;
}, 16);
}


#### Iframe
iframe
{
"src": "https://claude.ai/new",
"width": "560",
"height": "315"
}


#### Canvas Visualization
canvas
ctx.fillStyle = 'blue';
ctx.fillRect(50, 50, width-100, height-100);
ctx.fillStyle = 'white';
ctx.font = '20px Arial';
ctx.fillText('Hello Twitter!', 100, 100);

## Configuration Options

### NanoPay Options
- `title`: Title shown on payment page
- `amount`: Payment amount
- `address`: Nano address or username (with @)
- `currency`: Currency code (default: USD)
- `text`: Button text
- `image`: URL of image to show on payment page
- `description`: Description text for payment page

### BitRequest Options
- `payment`: Cryptocurrency (default: nano)
- `currency`: Currency for conversion (default: USD)
- `amount`: Payment amount
- `address`: Cryptocurrency address
- `title`: Payment request title
- `receiver`: Receiver name
- `text`: Button text

### Iframe Options
- `src`: URL to embed
- `width`: Width in pixels (default: 300)
- `height`: Height in pixels (default: 200)

### Game/Canvas Options
- Uses HTML5 Canvas API
- `gameContainer`: Reference to the container element
- `width`: Canvas width (300px)
- `height`: Canvas height (200px)

## Development

The extension uses:
- manifest.json for Chrome extension configuration
- content.js for the main functionality
- styles.css for button and preview styling
- nanopay.js for NanoPay integration

## Security

- Iframes are sandboxed for security
- Games and canvas code run in isolated environments
- Payment buttons use official APIs

## Testing

- download the extension from github
- go to brave://extensions/
- enable developer mode
- click load unpacked
- select the repository folder

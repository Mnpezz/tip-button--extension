// Function to load required scripts
function loadDependencies() {
  // Load our local nanopay script
  const nanoPay = document.createElement('script');
  nanoPay.src = chrome.runtime.getURL('nanopay.js');
  document.head.appendChild(nanoPay);
}

// Function to create interactive element based on code type
function createInteractiveElement(type, code) {
  switch(type) {
    case 'nanopay':
      return createNanoPayButton(code);
    case 'bitrequest':
      return createBitRequestButton(code);
    case 'game':
      return createGameElement(code);
    case 'iframe':
      return createSafeIframe(code);
    case 'canvas':
      return createCanvasApp(code);
    default:
      return null;
  }
}

// Create a mini game from code
function createGameElement(code) {
  const container = document.createElement('div');
  container.style.width = '300px';
  container.style.height = '200px';
  container.style.border = '1px solid #ccc';
  container.style.borderRadius = '8px';
  container.style.overflow = 'hidden';
  
  // Create a sandboxed environment for the game code
  const sandbox = document.createElement('script');
  sandbox.textContent = `
    (function() {
      const gameContainer = document.currentScript.parentElement;
      ${code}
    })();
  `;
  
  container.appendChild(sandbox);
  return container;
}

// Create a safe iframe
function createSafeIframe(code) {
  try {
    const config = JSON.parse(code);
    const iframe = document.createElement('iframe');
    
    // Convert YouTube watch URLs to embed URLs
    if (config.src.includes('youtube.com/watch?v=')) {
      const videoId = config.src.split('v=')[1].split('&')[0];
      iframe.src = `https://www.youtube.com/embed/${videoId}`;
    } else {
      iframe.src = config.src;
    }
    
    iframe.width = config.width || '300';
    iframe.height = config.height || '200';
    iframe.style.border = 'none';
    iframe.style.borderRadius = '8px';
    iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture';
    iframe.sandbox = 'allow-scripts allow-same-origin allow-presentation';
    
    return iframe;
  } catch (error) {
    console.error('Failed to create iframe:', error);
    return null;
  }
}

// Create a canvas-based visualization/app
function createCanvasApp(code) {
  const container = document.createElement('div');
  container.style.width = '300px';
  container.style.height = '200px';
  container.style.border = '1px solid #ccc';
  container.style.borderRadius = '8px';
  container.style.overflow = 'hidden';
  
  const canvas = document.createElement('canvas');
  canvas.width = 300;
  canvas.height = 200;
  container.appendChild(canvas);
  
  const ctx = canvas.getContext('2d');
  
  try {
    // Create a safe function from the code
    const draw = new Function('ctx', 'width', 'height', `
      try {
        ${code}
      } catch (e) {
        console.error('Canvas error:', e);
      }
    `);
    
    draw(ctx, canvas.width, canvas.height);
    return container;
  } catch (error) {
    console.error('Failed to create canvas app:', error);
    return null;
  }
}

// Original NanoPay button creation function
function createNanoPayButton(code) {
  try {
    const config = JSON.parse(code);
    
    const button = document.createElement('button');
    button.className = 'nano-pay-button';
    button.textContent = config.text || `Tip ${config.amount || '0.133'} NANO`;
    
    // Store configuration data
    button.dataset.nanoConfig = JSON.stringify(config);
    
    // Add click handler
    button.addEventListener('click', function() {
      const btnConfig = JSON.parse(this.dataset.nanoConfig);
      // Remove @ symbol if present
      const address = btnConfig.address.startsWith('@') ? 
        btnConfig.address.substring(1) : btnConfig.address;
      
      // Build the nano.to URL with parameters
      const params = new URLSearchParams({
        title: btnConfig.title || 'Tip with Nano',
        price: btnConfig.amount,
        currency: btnConfig.currency || 'USD'
      });

      if (btnConfig.image) params.append('image', btnConfig.image);
      if (btnConfig.description) params.append('description', btnConfig.description);
      
      window.open(`https://nano.to/${address}?${params.toString()}`, '_blank');
    });
    
    return button;
  } catch (error) {
    console.error('Failed to parse NanoPay configuration:', error);
    return null;
  }
}

// Add BitRequest button creation function
function createBitRequestButton(code) {
  try {
    const config = JSON.parse(code);
    
    const button = document.createElement('button');
    button.className = 'bitrequest-button';
    button.textContent = config.text || `Pay ${config.amount || '1'} ${config.currency || 'USD'}`;
    
    // Store configuration data
    button.dataset.bitConfig = JSON.stringify(config);
    
    // Add click handler
    button.addEventListener('click', function() {
      const btnConfig = JSON.parse(this.dataset.bitConfig);
      
      // Remove @ symbol if present
      const address = btnConfig.address.startsWith('@') ? 
        btnConfig.address.substring(1) : btnConfig.address;
      
      const params = new URLSearchParams({
        payment: btnConfig.payment || 'nano',
        uoa: btnConfig.currency?.toLowerCase() || 'usd',
        amount: btnConfig.amount || '1',
        address: address
      });

      // Add optional parameters
      if (btnConfig.title) {
        const data = {
          t: btnConfig.title,
          n: btnConfig.receiver || 'Payment Request',
          c: btnConfig.contact ? 1 : 0
        };
        params.append('d', btoa(JSON.stringify(data)));
      }
      
      window.open(`https://bitrequest.github.io/?${params.toString()}`, '_blank');
    });
    
    return button;
  } catch (error) {
    console.error('Failed to parse BitRequest configuration:', error);
    return null;
  }
}

// Update platform selectors
const PLATFORM_SELECTORS = {
  twitter: {
    composer: '[data-testid="tweetTextarea_0"]',
    textbox: 'div[role="textbox"][data-testid="tweetTextarea_0"]',
    posts: '[data-testid="tweetText"]',
    container: '[data-testid="tweet"]'
  },
  reddit: {
    composer: '.usertext-edit textarea, .RichTextJSON-root',
    textbox: '.usertext-edit textarea, .public-DraftEditor-content',
    posts: '.usertext-body .md',
    container: '.usertext-edit, .RichTextJSON-root'
  },
  facebook: {
    composer: '[contenteditable="true"][role="textbox"]',
    textbox: '[contenteditable="true"][role="textbox"]',
    posts: 'div[dir="auto"]',
    feed: 'div[role="feed"]',
    container: 'div[role="presentation"]',
    submitButton: 'div[aria-label*="Post"]'
  }
};

// Detect which platform we're on
function detectPlatform() {
  const hostname = window.location.hostname;
  if (hostname.includes('twitter.com') || hostname.includes('x.com')) return 'twitter';
  if (hostname.includes('reddit.com')) return 'reddit';
  if (hostname.includes('facebook.com')) return 'facebook';
  return null;
}

// Update getTwitterElements to work with all platforms
function getSocialElements() {
  const platform = detectPlatform();
  if (!platform) return null;

  const selectors = PLATFORM_SELECTORS[platform];
  
  return {
    posts: document.querySelectorAll(selectors.posts),
    composer: document.querySelector(selectors.composer)?.closest(selectors.textbox),
    drafts: Array.from(document.querySelectorAll(selectors.textbox))
  };
}

// Function to create preview container
function createPreviewContainer(element) {
  let preview = element.querySelector('.code-preview');
  if (!preview) {
    preview = document.createElement('div');
    preview.className = 'code-preview';
    preview.style.marginTop = '10px';
    preview.style.marginBottom = '10px';
    preview.style.padding = '10px';
    preview.style.border = '1px solid #ccc';
    preview.style.borderRadius = '8px';
    
    // Insert after the textbox
    element.appendChild(preview);
  }
  return preview;
}

// Function to detect and format code blocks
function formatCodeInTweets() {
  const elements = getSocialElements();
  
  // Handle published tweets
  elements.posts.forEach(processTweetElement);
  
  // Handle composer and drafts
  if (elements.composer) {
    processComposerElement(elements.composer);
  }
  elements.drafts.forEach(processComposerElement);
}

// Process published tweets
function processTweetElement(tweet) {
  const text = tweet.innerText;
  if (!text) return;

  // First check for payment buttons
  const paymentMatch = text.match(/(nanopay|bitrequest){([^}]+)}/);
  if (paymentMatch) {
    const [fullMatch, type, code] = paymentMatch;
    try {
      // Clean up the JSON string - remove line breaks and extra spaces
      const cleanCode = code.replace(/\n/g, '')
                           .replace(/\r/g, '')
                           .replace(/\s+/g, ' ')
                           .trim();
      
      // Get the regular text by removing the payment code
      const regularText = text.replace(fullMatch, '').trim();
      
      const element = createInteractiveElement(type, `{${cleanCode}}`);
      if (element) {
        const container = document.createElement('div');
        container.className = 'payment-button-container';

        // Add regular text first if it exists
        if (regularText) {
          const textDiv = document.createElement('div');
          textDiv.className = 'post-text';
          textDiv.textContent = regularText;
          container.appendChild(textDiv);
        }

        // Add button
        container.appendChild(element);

        // Replace tweet content
        tweet.innerHTML = '';
        tweet.appendChild(container);
      }
    } catch (e) {
      console.error('Failed to process tweet payment button:', e);
    }
    return;
  }

  // Then check for other code blocks
  const codeBlockRegex = /```(\w+)\s*([\s\S]*?)```/g;
  let match;
  while ((match = codeBlockRegex.exec(text)) !== null) {
    const type = match[1].toLowerCase();
    const code = match[2].trim();
    
    const element = createInteractiveElement(type, code);
    if (element) {
      const range = document.createRange();
      range.setStart(tweet, 0);
      range.setEnd(tweet, tweet.childNodes.length);
      range.deleteContents();
      range.insertNode(element);
    }
  }
}

// Update processComposerElement for better platform handling
function processComposerElement(composer) {
  const platform = detectPlatform();
  if (!platform) return;

  const selectors = PLATFORM_SELECTORS[platform];
  let container;

  // Platform-specific container finding
  switch(platform) {
    case 'facebook':
      container = composer.closest(selectors.container);
      break;
    case 'reddit':
      container = composer.closest(selectors.container);
      break;
    case 'twitter':
      container = composer.closest(selectors.textbox)?.parentElement;
      break;
    default:
      container = composer.parentElement;
  }

  if (!container) {
    console.log('Could not find container for preview');
    return;
  }

  const text = composer.textContent || composer.innerText || '';
  if (!text.trim()) return;

  console.log('Found text:', text);

  // Create or get preview container
  let preview = container.querySelector('.code-preview');
  if (!preview) {
    preview = document.createElement('div');
    preview.className = 'code-preview';
    
    // Platform-specific preview placement
    switch(platform) {
      case 'facebook':
        composer.parentNode.insertBefore(preview, composer.nextSibling);
        break;
      case 'reddit':
        container.appendChild(preview);
        break;
      default:
        container.appendChild(preview);
    }
  }

  try {
    // Check for payment button syntax
    const patterns = {
      nanopay: /nanopay{([^}]+)}/g,
      bitrequest: /bitrequest{([^}]+)}/g
    };

    preview.innerHTML = ''; // Clear previous preview
    for (const [type, pattern] of Object.entries(patterns)) {
      const match = pattern.exec(text);
      if (match) {
        try {
          const code = match[1];
          const element = createInteractiveElement(type, `{${code}}`);
          if (element) {
            const wrapper = document.createElement('div');
            wrapper.className = 'preview-item';
            wrapper.appendChild(element);
            preview.appendChild(wrapper);
          }
        } catch (e) {
          console.log(`Invalid ${type} JSON:`, e);
        }
      }
    }
  } catch (error) {
    console.error('Error processing text:', error);
  }
}

// Update handleFacebookComposer
function handleFacebookComposer(composer) {
  // Find the parent container
  const container = composer.closest('div[role="presentation"]') || 
                   composer.closest('form') ||
                   composer.parentElement;
                   
  if (!container) return;

  // Find or create preview area
  let preview = container.querySelector('.code-preview');
  if (!preview) {
    preview = document.createElement('div');
    preview.className = 'code-preview';
    preview.style.display = 'none'; // Hidden by default
    
    // Insert after composer
    composer.parentNode.insertBefore(preview, composer.nextSibling);
  }

  // Get text and check for payment code
  const text = composer.textContent || composer.innerText || '';
  
  // Look for payment button syntax
  const patterns = {
    nanopay: /nanopay{([^}]+)}/g,
    bitrequest: /bitrequest{([^}]+)}/g
  };

  let hasMatch = false;
  preview.innerHTML = '';

  for (const [type, pattern] of Object.entries(patterns)) {
    const match = pattern.exec(text);
    if (match) {
      try {
        // Clean up the code
        const code = match[1].replace(/\n/g, '').replace(/\s+/g, ' ').trim();
        const element = createInteractiveElement(type, `{${code}}`);
        if (element) {
          hasMatch = true;
          const wrapper = document.createElement('div');
          wrapper.className = 'preview-item';
          wrapper.appendChild(element);
          preview.appendChild(wrapper);
        }
      } catch (e) {
        console.log(`Invalid ${type} JSON:`, e);
      }
    }
  }

  preview.style.display = hasMatch ? 'block' : 'none';
}

// Update handleFacebookPost function
function handleFacebookPost(post) {
  if (post.querySelector('.payment-button-container')) return;

  const text = post.textContent || post.innerText;
  if (!text) return;

  // Extract the payment code and regular text
  const match = text.match(/(nanopay|bitrequest){([^}]+)}/);
  if (match) {
    const [fullMatch, type, code] = match;
    try {
      // Get the regular text by removing the payment code
      const regularText = text.replace(fullMatch, '').trim();
      
      const element = createInteractiveElement(type, `{${code}}`);
      if (element) {
        const container = document.createElement('div');
        container.className = 'payment-button-container';

        // Add regular text first if it exists
        if (regularText) {
          const textDiv = document.createElement('div');
          textDiv.className = 'post-text';
          textDiv.textContent = regularText;
          container.appendChild(textDiv);
        }

        // Add button
        container.appendChild(element);

        // Keep original code but hidden
        const codeContainer = document.createElement('div');
        codeContainer.className = 'original-text';
        codeContainer.textContent = fullMatch;
        
        post.innerHTML = '';
        post.appendChild(container);
        post.appendChild(codeContainer);
      }
    } catch (e) {
      console.error('Failed to process Facebook post:', e);
    }
  }
}

// Add Reddit-specific handler
function handleRedditComposer(composer) {
  const container = composer.closest('.usertext-edit, .RichTextJSON-root');
  if (!container) return;

  let preview = container.querySelector('.code-preview');
  if (!preview) {
    preview = document.createElement('div');
    preview.className = 'code-preview';
    container.appendChild(preview);
  }

  const text = composer.value || composer.textContent || composer.innerText || '';
  if (!text.trim()) {
    preview.innerHTML = '';
    return;
  }

  // Look for payment button syntax
  const patterns = {
    nanopay: /nanopay{([^}]+)}/g,
    bitrequest: /bitrequest{([^}]+)}/g
  };

  preview.innerHTML = '';
  let hasMatch = false;

  for (const [type, pattern] of Object.entries(patterns)) {
    const match = pattern.exec(text);
    if (match) {
      hasMatch = true;
      try {
        const code = match[1];
        const element = createInteractiveElement(type, `{${code}}`);
        if (element) {
          const wrapper = document.createElement('div');
          wrapper.className = 'preview-item';
          wrapper.appendChild(element);
          preview.appendChild(wrapper);
        }
      } catch (e) {
        console.log(`Invalid ${type} JSON:`, e);
      }
    }
  }

  preview.style.display = hasMatch ? 'block' : 'none';
}

// Add Reddit post handler
function handleRedditPost(post) {
  if (post.querySelector('.payment-button-container')) return;

  const text = post.textContent || post.innerText;
  if (!text) return;

  const match = text.match(/(nanopay|bitrequest){([^}]+)}/);
  if (match) {
    const [fullMatch, type, code] = match;
    try {
      const element = createInteractiveElement(type, `{${code}}`);
      if (element) {
        const container = document.createElement('div');
        container.className = 'payment-button-container';
        container.appendChild(element);

        // Keep original text but make it less visible
        const textContainer = document.createElement('div');
        textContainer.className = 'original-text';
        textContainer.textContent = text;
        
        post.innerHTML = '';
        post.appendChild(container);
        post.appendChild(textContainer);
      }
    } catch (e) {
      console.error('Failed to process Reddit post:', e);
    }
  }
}

// Unified observer setup
function setupUnifiedObserver() {
  let timeout = null;
  const observer = new MutationObserver(() => {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => {
      const platform = detectPlatform();
      
      if (platform === 'facebook') {
        // Handle Facebook
        const composer = document.querySelector(PLATFORM_SELECTORS.facebook.composer);
        if (composer) handleFacebookComposer(composer);
        
        const posts = document.querySelectorAll(PLATFORM_SELECTORS.facebook.posts);
        posts.forEach(handleFacebookPost);
      } else if (platform === 'twitter') {
        // Handle Twitter
        const elements = getSocialElements();
        if (elements) {
          elements.posts.forEach(processTweetElement);
          if (elements.composer) {
            processComposerElement(elements.composer);
          }
          elements.drafts.forEach(processComposerElement);
        }
      } else if (platform === 'reddit') {
        // Handle Reddit
        const composer = document.querySelector(PLATFORM_SELECTORS.reddit.composer);
        if (composer) handleRedditComposer(composer);
        
        const posts = document.querySelectorAll(PLATFORM_SELECTORS.reddit.posts);
        posts.forEach(handleRedditPost);
      }
      // Add other platforms here as needed
    }, 100);
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true,
    characterData: true,
    attributes: true
  });
}

// Initialize with unified observer
loadDependencies();
formatCodeInTweets(); // Initial format
setupUnifiedObserver(); // Single observer for all platforms
  
function extractSerpData() {
  const results = [];
  
  const searchResults = document.querySelectorAll('#search .g, #search .tF2Cxc, #search [data-sokoban-container]');
  
  searchResults.forEach((result, index) => {
    try {
      const linkElement = result.querySelector('a[href]:not([href^="#"]):not([href^="javascript:"])');
      const titleElement = result.querySelector('h3, .LC20lb, .DKV0Md');
      const descriptionElement = result.querySelector('.VwiC3b, .s3v9rd, .st, .IsZvec, [data-sncf]');
      
      if (linkElement && linkElement.href && linkElement.href.startsWith('http')) {
        const url = linkElement.href;
        const title = titleElement ? titleElement.textContent.trim() : '';
        const description = descriptionElement ? descriptionElement.textContent.trim() : '';
        
        results.push({
          index: index + 1,
          url: url,
          title: title,
          description: description
        });
      }
    } catch (e) {
      console.log('Erreur lors de l\'extraction du résultat:', e);
    }
  });
  
  return results;
}

function addNum100ToUrl() {
  const currentUrl = new URL(window.location.href);
  currentUrl.searchParams.set('num', '100');
  window.location.href = currentUrl.toString();
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'extractData') {
    const data = extractSerpData();
    sendResponse({data: data});
  } else if (request.action === 'addNum100') {
    addNum100ToUrl();
    sendResponse({success: true});
  }
});

window.addEventListener('load', () => {
  chrome.storage.local.set({
    pageUrl: window.location.href,
    isGoogleSearch: window.location.hostname.includes('google.') && window.location.pathname.includes('/search')
  });
});
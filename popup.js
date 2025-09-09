document.addEventListener('DOMContentLoaded', function() {
  const extractBtn = document.getElementById('extractBtn');
  const copyBtn = document.getElementById('copyBtn');
  const num100Btn = document.getElementById('num100Btn');
  const resultsDiv = document.getElementById('results');
  const resultText = document.getElementById('resultText');
  const resultCount = document.getElementById('resultCount');
  const messageDiv = document.getElementById('message');
  
  const extractUrls = document.getElementById('extractUrls');
  const extractTitles = document.getElementById('extractTitles');
  const extractDescriptions = document.getElementById('extractDescriptions');
  
  let extractedData = [];
  
  function showMessage(text, type = 'success') {
    messageDiv.innerHTML = `<div class="${type}">${text}</div>`;
    setTimeout(() => {
      messageDiv.innerHTML = '';
    }, 3000);
  }
  
  function formatResults(data) {
    let output = [];
    
    data.forEach((item, index) => {
      let line = [];
      
      if (extractUrls.checked && item.url) {
        line.push(`URL: ${item.url}`);
      }
      
      if (extractTitles.checked && item.title) {
        line.push(`TITRE: ${item.title}`);
      }
      
      if (extractDescriptions.checked && item.description) {
        line.push(`DESCRIPTION: ${item.description}`);
      }
      
      if (line.length > 0) {
        output.push(`[${index + 1}] ${line.join(' | ')}`);
        output.push('---');
      }
    });
    
    return output.join('\n');
  }
  
  extractBtn.addEventListener('click', function() {
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
      const currentTab = tabs[0];
      
      if (!currentTab.url.includes('google.') || !currentTab.url.includes('/search')) {
        showMessage('Cette extension fonctionne uniquement sur les pages de recherche Google.', 'error');
        return;
      }
      
      chrome.tabs.sendMessage(currentTab.id, {action: 'extractData'}, function(response) {
        if (chrome.runtime.lastError) {
          showMessage('Erreur: Impossible de communiquer avec la page. Veuillez rafraîchir la page.', 'error');
          return;
        }
        
        if (response && response.data) {
          extractedData = response.data.filter(item => 
            item.url && 
            !item.url.includes('google.') && 
            !item.url.includes('youtube.com/results')
          );
          
          if (extractedData.length === 0) {
            showMessage('Aucun résultat trouvé sur cette page.', 'error');
            return;
          }
          
          const formattedResults = formatResults(extractedData);
          resultText.value = formattedResults;
          resultCount.textContent = `${extractedData.length} résultat(s) trouvé(s)`;
          resultsDiv.classList.remove('hidden');
          copyBtn.classList.remove('hidden');
          showMessage(`${extractedData.length} résultats extraits avec succès!`);
        } else {
          showMessage('Aucune donnée extraite. Vérifiez que vous êtes sur une page de résultats Google.', 'error');
        }
      });
    });
  });
  
  copyBtn.addEventListener('click', function() {
    resultText.select();
    document.execCommand('copy');
    showMessage('Résultats copiés dans le presse-papiers!');
  });
  
  num100Btn.addEventListener('click', function() {
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
      const currentTab = tabs[0];
      
      if (!currentTab.url.includes('google.') || !currentTab.url.includes('/search')) {
        showMessage('Cette fonction fonctionne uniquement sur les pages de recherche Google.', 'error');
        return;
      }
      
      if (currentTab.url.includes('num=100')) {
        showMessage('Cette page affiche déjà 100 résultats.', 'error');
        return;
      }
      
      chrome.tabs.sendMessage(currentTab.id, {action: 'addNum100'}, function(response) {
        if (chrome.runtime.lastError) {
          showMessage('Erreur: Impossible de modifier la page.', 'error');
          return;
        }
        
        if (response && response.success) {
          showMessage('Redirection vers 100 résultats en cours...');
          window.close();
        } else {
          showMessage('Erreur lors de la redirection.', 'error');
        }
      });
    });
  });
  
  chrome.storage.local.get(['isGoogleSearch'], function(result) {
    if (!result.isGoogleSearch) {
      extractBtn.disabled = true;
      num100Btn.disabled = true;
      showMessage('Cette extension ne fonctionne que sur les pages de recherche Google.', 'error');
    }
  });
});
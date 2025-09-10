document.addEventListener('DOMContentLoaded', function() {
  const extractBtn = document.getElementById('extractBtn');
  const copyBtn = document.getElementById('copyBtn');
  const exportCsvBtn = document.getElementById('exportCsvBtn');
  const num100Btn = document.getElementById('num100Btn');
  const resultsDiv = document.getElementById('results');
  const resultText = document.getElementById('resultText');
  const resultCount = document.getElementById('resultCount');
  const messageDiv = document.getElementById('message');
  
  // Mode toggle elements
  const modeToggle = document.getElementById('modeToggle');
  const modeDescription = document.getElementById('modeDescription');
  const serpOptions = document.getElementById('serpOptions');
  const urlFilters = document.getElementById('urlFilters');
  
  // SERP mode elements
  const extractUrls = document.getElementById('extractUrls');
  const extractTitles = document.getElementById('extractTitles');
  const extractDescriptions = document.getElementById('extractDescriptions');
  
  // URL mode elements
  const externalOnly = document.getElementById('externalOnly');
  const internalOnly = document.getElementById('internalOnly');
  const excludeSocial = document.getElementById('excludeSocial');
  const domainFilter = document.getElementById('domainFilter');
  
  // SEO Highlighting elements
  const highlightSeoCheckbox = document.getElementById('highlightSeoOpportunities');
  const seoSettingsBtn = document.getElementById('seoSettingsBtn');
  const settingsModal = document.getElementById('settingsModal');
  const saveSettingsBtn = document.getElementById('saveSettings');
  const resetSettingsBtn = document.getElementById('resetSettings');
  
  // SEO Settings inputs
  const rdMinInput = document.getElementById('rd-min');
  const rdMaxInput = document.getElementById('rd-max');
  const kwMinInput = document.getElementById('kw-min');
  const stMinInput = document.getElementById('st-min');
  
  let extractedData = [];
  let currentMode = 'serp'; // 'serp' or 'urls'
  
  // SEO Settings par défaut
  const defaultSeoSettings = {
    rdMin: 0,
    rdMax: 50,
    kwMin: 1000,
    stMin: 1000
  };
  
  // Mode toggle functionality
  modeToggle.addEventListener('change', function() {
    currentMode = modeToggle.checked ? 'urls' : 'serp';
    updateUI();
  });
  
  function updateUI() {
    if (currentMode === 'serp') {
      modeDescription.textContent = 'Mode Google SERP : Extraire depuis les résultats de recherche';
      serpOptions.classList.remove('hidden');
      urlFilters.classList.add('hidden');
      
      // FORCER l'affichage du bouton num100
      num100Btn.style.display = 'block';
      num100Btn.style.visibility = 'visible';
      num100Btn.classList.remove('hidden');
      
      exportCsvBtn.classList.add('hidden');
      extractBtn.textContent = '📋 Extraire les données SERP';
      
      console.log('🟢 UI mise à jour - mode SERP - num100 visible');
    } else {
      modeDescription.textContent = 'Mode Universel : Extraire toutes les URLs de cette page';
      serpOptions.classList.add('hidden');
      urlFilters.classList.remove('hidden');
      num100Btn.style.display = 'none';
      exportCsvBtn.classList.remove('hidden');
      extractBtn.textContent = '🔗 Extraire toutes les URLs';
      
      console.log('🔴 UI mise à jour - mode Universel - num100 caché');
    }
    
    // Reset results when switching modes
    resultsDiv.classList.add('hidden');
    copyBtn.classList.add('hidden');
    exportCsvBtn.classList.add('hidden');
    extractedData = [];
  }
  
  // Mutual exclusion for internal/external filters
  externalOnly.addEventListener('change', function() {
    if (externalOnly.checked) {
      internalOnly.checked = false;
    }
  });
  
  internalOnly.addEventListener('change', function() {
    if (internalOnly.checked) {
      externalOnly.checked = false;
    }
  });

  function showMessage(text, type = 'success') {
    messageDiv.innerHTML = `<div class="${type}">${text}</div>`;
    setTimeout(() => {
      messageDiv.innerHTML = '';
    }, 3000);
  }
  
  function formatSerpResults(data) {
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
  
  function formatUrlResults(urls) {
    return urls.map((url, index) => `[${index + 1}] ${url}`).join('\n');
  }
  
  function generateCSV(urls, domain) {
    const headers = ['#', 'URL', 'Domain', 'Type'];
    let csvContent = headers.join(',') + '\n';
    
    urls.forEach((url, index) => {
      try {
        const urlObj = new URL(url);
        const urlDomain = urlObj.hostname;
        const isExternal = urlDomain !== domain;
        const type = isExternal ? 'External' : 'Internal';
        
        csvContent += `${index + 1},"${url}","${urlDomain}","${type}"\n`;
      } catch (e) {
        csvContent += `${index + 1},"${url}","Invalid URL","Unknown"\n`;
      }
    });
    
    return csvContent;
  }
  
  function downloadCSV(content, filename) {
    const blob = new Blob([content], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
  
  extractBtn.addEventListener('click', function() {
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
      const currentTab = tabs[0];
      
      if (currentMode === 'serp') {
        // Mode SERP Google
        if (!currentTab.url.includes('google.') || !currentTab.url.includes('/search')) {
          showMessage('Le mode SERP fonctionne uniquement sur les pages de recherche Google.', 'error');
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
            
            const formattedResults = formatSerpResults(extractedData);
            resultText.value = formattedResults;
            resultCount.textContent = `${extractedData.length} résultat(s) SERP trouvé(s)`;
            resultsDiv.classList.remove('hidden');
            copyBtn.classList.remove('hidden');
            showMessage(`${extractedData.length} résultats SERP extraits avec succès!`);
          } else {
            showMessage('Aucune donnée extraite. Vérifiez que vous êtes sur une page de résultats Google.', 'error');
          }
        });
        
      } else {
        // Mode extraction d'URLs universelles
        const filters = {
          externalOnly: externalOnly.checked,
          internalOnly: internalOnly.checked,
          excludeSocial: excludeSocial.checked,
          domainFilter: domainFilter.value
        };
        
        chrome.tabs.sendMessage(currentTab.id, {action: 'extractUrls', filters: filters}, function(response) {
          if (chrome.runtime.lastError) {
            showMessage('Erreur: Impossible de communiquer avec la page. Veuillez rafraîchir la page.', 'error');
            return;
          }
          
          if (response && response.urls) {
            extractedData = response.urls;
            
            if (extractedData.length === 0) {
              showMessage('Aucune URL trouvée avec les filtres sélectionnés.', 'error');
              return;
            }
            
            const formattedResults = formatUrlResults(extractedData);
            resultText.value = formattedResults;
            resultCount.textContent = `${extractedData.length} URL(s) trouvée(s) sur ${response.currentDomain}`;
            resultsDiv.classList.remove('hidden');
            copyBtn.classList.remove('hidden');
            exportCsvBtn.classList.remove('hidden');
            
            // Store domain for CSV export
            extractBtn.dataset.currentDomain = response.currentDomain;
            
            showMessage(`${extractedData.length} URLs extraites avec succès!`);
          } else {
            showMessage('Aucune URL extraite de cette page.', 'error');
          }
        });
      }
    });
  });
  
  copyBtn.addEventListener('click', function() {
    resultText.select();
    document.execCommand('copy');
    const itemType = currentMode === 'serp' ? 'résultats SERP' : 'URLs';
    showMessage(`${itemType} copiés dans le presse-papiers!`);
  });
  
  exportCsvBtn.addEventListener('click', function() {
    if (extractedData.length === 0) {
      showMessage('Aucune donnée à exporter.', 'error');
      return;
    }
    
    const domain = extractBtn.dataset.currentDomain || 'unknown';
    const csvContent = generateCSV(extractedData, domain);
    const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
    const filename = `urls-${domain}-${timestamp}.csv`;
    
    downloadCSV(csvContent, filename);
    showMessage('Fichier CSV téléchargé!');
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
  
  // SEO Highlighting functionality
  function loadSeoSettings() {
    chrome.storage.local.get(['seoHighlightSettings', 'seoHighlightEnabled'], (result) => {
      const settings = result.seoHighlightSettings || defaultSeoSettings;
      rdMinInput.value = settings.rdMin;
      rdMaxInput.value = settings.rdMax;
      kwMinInput.value = settings.kwMin;
      stMinInput.value = settings.stMin;
      
      // Charger l'état de la checkbox (par défaut true)
      highlightSeoCheckbox.checked = result.seoHighlightEnabled !== false;
    });
  }
  
  function saveSeoSettings() {
    console.log('DEBUT saveSeoSettings');
    
    const settings = {
      rdMin: parseInt(rdMinInput.value) || 0,
      rdMax: parseInt(rdMaxInput.value) || 50,
      kwMin: parseInt(kwMinInput.value) || 1000,
      stMin: parseInt(stMinInput.value) || 1000
    };
    
    console.log('Settings to save:', settings);
    
    // Fermer le modal
    forceCloseModal();
    
    // Activer la checkbox
    highlightSeoCheckbox.checked = true;
    console.log('Checkbox activée');
    
    // Sauvegarder les paramètres ET l'état activé
    chrome.storage.local.set({ 
      seoHighlightSettings: settings,
      seoHighlightEnabled: true 
    }, () => {
      console.log('Settings saved in storage');
      
      chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
        console.log('Current tab:', tabs[0]);
        
        if (!tabs[0]) {
          showMessage('Erreur: Onglet non trouvé', 'error');
          return;
        }
        
        chrome.tabs.sendMessage(tabs[0].id, {
          action: 'highlightSeoOpportunities',
          enabled: true, // FORCER à true
          settings: settings
        }, (response) => {
          if (chrome.runtime.lastError) {
            console.error('Erreur communication:', chrome.runtime.lastError);
            showMessage('Erreur: Rechargez la page Google et réessayez', 'error');
          } else {
            console.log('Message envoyé avec succès', response);
            showMessage('Paramètres sauvegardés et appliqués!', 'success');
          }
        });
      });
    });
  }
  
  function resetSeoSettings() {
    rdMinInput.value = defaultSeoSettings.rdMin;
    rdMaxInput.value = defaultSeoSettings.rdMax;
    kwMinInput.value = defaultSeoSettings.kwMin;
    stMinInput.value = defaultSeoSettings.stMin;
  }
  
  function applySeoHighlighting() {
    const enabled = highlightSeoCheckbox.checked;
    
    // Sauvegarder l'état de la checkbox
    chrome.storage.local.set({ seoHighlightEnabled: enabled });
    
    chrome.storage.local.get(['seoHighlightSettings'], (result) => {
      const settings = result.seoHighlightSettings || defaultSeoSettings;
      console.log('Applying SEO highlighting:', { enabled, settings });
      
      chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
        chrome.tabs.sendMessage(tabs[0].id, {
          action: 'highlightSeoOpportunities',
          enabled: enabled,
          settings: settings
        }, (response) => {
          if (chrome.runtime.lastError) {
            console.error('Erreur:', chrome.runtime.lastError);
            showMessage('Erreur: Rechargez la page Google', 'error');
          } else if (enabled) {
            showMessage('SEO highlighting activé!');
          } else {
            showMessage('SEO highlighting désactivé');
          }
        });
      });
    });
  }
  
  // Event listeners pour SEO highlighting
  highlightSeoCheckbox.addEventListener('change', () => {
    console.log('Checkbox changed:', highlightSeoCheckbox.checked);
    applySeoHighlighting();
    
    if (highlightSeoCheckbox.checked) {
      showMessage('SEO highlighting activé!', 'success');
    } else {
      showMessage('SEO highlighting désactivé', 'success');
    }
  });
  
  // TEST BUTTON pour débugger avec paramètres garantis
  const testBtn = document.createElement('button');
  testBtn.textContent = '🔴 FORCE GREEN';
  testBtn.className = 'utility-btn';
  testBtn.style.marginTop = '10px';
  testBtn.style.backgroundColor = '#ff4444';
  testBtn.addEventListener('click', () => {
    console.log('🚀 FORCE TEST BUTTON CLICKED - Garantit du vert!');
    
    chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
      // Paramètres qui vont FORCÉMENT matcher les valeurs de test
      const forceSettings = {
        rdMin: 0,    // 0-100 pour capturer 25
        rdMax: 100,
        kwMin: 0,    // 0 pour capturer 1500
        stMin: 0     // 0 pour capturer 2000
      };
      
      chrome.tabs.sendMessage(tabs[0].id, {
        action: 'highlightSeoOpportunities',
        enabled: true,
        settings: forceSettings
      }, (response) => {
        console.log('🟢 Force test response:', response);
        showMessage('FORCE TEST - Tous les résultats devraient être verts!', 'success');
      });
    });
  });
  
  // Ajouter le bouton test après les autres boutons
  const buttonsContainer = document.querySelector('.buttons');
  buttonsContainer.appendChild(testBtn);
  
  // Separator
  const separator = document.createElement('div');
  separator.style.cssText = 'border-top: 1px solid #ddd; margin: 15px 0 10px 0; padding-top: 10px;';
  separator.innerHTML = '<small style="color: #666; text-align: center; display: block;">🐛 Debug Tools</small>';
  buttonsContainer.appendChild(separator);
  
  seoSettingsBtn.addEventListener('click', () => {
    loadSeoSettings();
    settingsModal.classList.remove('hidden');
  });
  
  saveSettingsBtn.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('Save button clicked!');
    
    saveSeoSettings();
  });
  
  resetSettingsBtn.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('Reset button clicked!');
    resetSeoSettings();
  });
  
  // FORCER fermeture modal - multiple méthodes
  function forceCloseModal() {
    console.log('FORCE CLOSE MODAL - SIMPLE METHOD');
    
    // Méthode simple et efficace
    settingsModal.style.display = 'none';
    settingsModal.classList.add('hidden');
    
    document.body.style.overflow = 'auto';
    console.log('Modal fermée!');
  }
  
  // Fermer modal en cliquant à l'extérieur
  settingsModal.addEventListener('click', (e) => {
    if (e.target === settingsModal) {
      console.log('Closing modal - clicked outside');
      forceCloseModal();
    }
  });
  
  // Bouton X pour fermer
  const closeModalBtn = document.createElement('button');
  closeModalBtn.innerHTML = '×';
  closeModalBtn.style.cssText = `
    position: absolute;
    top: 10px;
    right: 15px;
    background: none;
    border: none;
    font-size: 24px;
    cursor: pointer;
    color: #666;
    font-weight: bold;
    z-index: 10001;
  `;
  closeModalBtn.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('X button clicked - closing modal');
    forceCloseModal();
  });
  
  // Touche Escape pour fermer
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !settingsModal.classList.contains('hidden')) {
      console.log('Escape pressed - closing modal');
      forceCloseModal();
    }
  });
  
  // Ajouter le X au modal
  const modalContent = settingsModal.querySelector('.settings-modal');
  modalContent.style.position = 'relative';
  modalContent.appendChild(closeModalBtn);

  // Initialize UI
  updateUI();
  loadSeoSettings();
  
  // Configuration pour Google SERP
  chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
    const currentTab = tabs[0];
    const isGoogleSerp = currentTab && currentTab.url.includes('google.') && currentTab.url.includes('/search');
    
    console.log('🔍 Tab check:', { url: currentTab?.url, isGoogleSerp });
    
    if (isGoogleSerp) {
      // FORCER l'affichage du bouton num100
      num100Btn.style.display = 'block';
      num100Btn.style.visibility = 'visible';
      num100Btn.classList.remove('hidden');
      
      // Activer la checkbox par défaut
      highlightSeoCheckbox.checked = true;
      
      console.log('🟢 Google SERP détecté - UI configurée');
      
      // Appliquer le highlighting
      setTimeout(() => {
        console.log('🚀 Application du highlighting...');
        applySeoHighlighting();
      }, 1500);
    } else {
      console.log('🔴 Pas sur Google SERP');
    }
  });
  
  // Check initial state - don't disable buttons in universal mode
  chrome.storage.local.get(['isGoogleSearch'], function(result) {
    // Only show initial Google-specific message in SERP mode
    if (!result.isGoogleSearch && currentMode === 'serp') {
      showMessage('Mode SERP disponible uniquement sur Google. Utilisez le mode Universel pour cette page.', 'error');
    }
  });
});
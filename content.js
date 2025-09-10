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

function extractAllUrls(filters = {}) {
  const currentDomain = window.location.hostname;
  const socialDomains = [
    'facebook.com', 'twitter.com', 'linkedin.com', 'instagram.com', 
    'youtube.com', 'tiktok.com', 'pinterest.com', 'snapchat.com',
    'reddit.com', 'discord.com', 'telegram.org', 'whatsapp.com'
  ];
  
  const allLinks = document.querySelectorAll('a[href]');
  const urlsFound = new Set();
  
  allLinks.forEach(link => {
    try {
      const href = link.href;
      
      // Filtrer les URLs non valides
      if (!href || 
          href.startsWith('javascript:') || 
          href.startsWith('mailto:') || 
          href.startsWith('tel:') ||
          href.startsWith('#') ||
          href === window.location.href) {
        return;
      }
      
      // Créer un objet URL pour analyser
      let urlObj;
      try {
        urlObj = new URL(href);
      } catch (e) {
        return; // URL invalide
      }
      
      const domain = urlObj.hostname.toLowerCase();
      const isExternal = domain !== currentDomain;
      const isInternal = domain === currentDomain;
      
      // Appliquer les filtres
      if (filters.externalOnly && !isExternal) return;
      if (filters.internalOnly && !isInternal) return;
      
      // Filtrer les réseaux sociaux
      if (filters.excludeSocial) {
        const isSocial = socialDomains.some(socialDomain => 
          domain.includes(socialDomain)
        );
        if (isSocial) return;
      }
      
      // Filtrer par domaine spécifique
      if (filters.domainFilter && filters.domainFilter.trim()) {
        const targetDomain = filters.domainFilter.trim().toLowerCase();
        if (!domain.includes(targetDomain)) return;
      }
      
      // Nettoyer l'URL (enlever les paramètres de tracking si nécessaire)
      const cleanUrl = href;
      
      urlsFound.add(cleanUrl);
      
    } catch (e) {
      console.log('Erreur lors de l\'analyse du lien:', e);
    }
  });
  
  // Convertir Set en Array et trier
  const sortedUrls = Array.from(urlsFound).sort();
  
  return {
    urls: sortedUrls,
    count: sortedUrls.length,
    currentDomain: currentDomain
  };
}

function addNum100ToUrl() {
  const currentUrl = new URL(window.location.href);
  currentUrl.searchParams.set('num', '100');
  window.location.href = currentUrl.toString();
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log('MESSAGE REÇU:', request);
  
  if (request.action === 'extractData') {
    const data = extractSerpData();
    sendResponse({data: data});
  } else if (request.action === 'extractUrls') {
    const result = extractAllUrls(request.filters || {});
    sendResponse(result);
  } else if (request.action === 'addNum100') {
    addNum100ToUrl();
    sendResponse({success: true});
  } else if (request.action === 'highlightSeoOpportunities') {
    console.log('HIGHLIGHT SEO ACTION - DEBUT');
    highlightingEnabled = request.enabled;
    currentSettings = request.settings;
    
    // Appliquer immédiatement
    applySeoHighlighting(request.enabled, request.settings);
    
    console.log('HIGHLIGHT SEO ACTION - FIN');
    sendResponse({success: true, message: 'SEO highlighting applied'});
  }
  
  return true; // Importante pour les réponses asynchrones
});

// Fonction pour extraire les métriques SEO d'un résultat
function extractSeoMetrics(resultElement) {
  // Valeurs par défaut
  let rd = 0;
  let kw = 0;
  let st = 0;
  
  try {
    // Méthode 1: Chercher dans le texte du résultat
    const textContent = resultElement.textContent;
    
    // Pattern matching ÉLARGI pour capturer plus de formats
    const patterns = {
      rd: [
        /RD[:\s]*([0-9]+(?:\.[0-9]+)?[kKmM]?)/i,
        /referring[\s\-]?domains?[:\s]*([0-9]+(?:\.[0-9]+)?[kKmM]?)/i,
        /domains?[:\s]*([0-9]+(?:\.[0-9]+)?[kKmM]?)/i,
        /backlinks?[:\s]*([0-9]+(?:\.[0-9]+)?[kKmM]?)/i,
        /ref[\s\-]?dom[:\s]*([0-9]+(?:\.[0-9]+)?[kKmM]?)/i,
        /([0-9]+(?:\.[0-9]+)?[kKmM]?)\s*domains?/i,
        /([0-9]+(?:\.[0-9]+)?[kKmM]?)\s*rd/i
      ],
      kw: [
        /KW[:\s]*([0-9]+(?:\.[0-9]+)?[kKmM]?)/i,
        /keywords?[:\s]*([0-9]+(?:\.[0-9]+)?[kKmM]?)/i,
        /([0-9]+(?:\.[0-9]+)?[kKmM]?)\s*keywords?/i,
        /key[\s\-]?words?[:\s]*([0-9]+(?:\.[0-9]+)?[kKmM]?)/i,
        /terms?[:\s]*([0-9]+(?:\.[0-9]+)?[kKmM]?)/i,
        /([0-9]+(?:\.[0-9]+)?[kKmM]?)\s*kw/i
      ],
      st: [
        /ST[:\s]*([0-9]+(?:\.[0-9]+)?[kKmM]?)/i,
        /traffic[:\s]*([0-9]+(?:\.[0-9]+)?[kKmM]?)/i,
        /([0-9]+(?:\.[0-9]+)?[kKmM]?)\s*traffic/i,
        /search[\s\-]?traffic[:\s]*([0-9]+(?:\.[0-9]+)?[kKmM]?)/i,
        /visits?[:\s]*([0-9]+(?:\.[0-9]+)?[kKmM]?)/i,
        /organic[:\s]*([0-9]+(?:\.[0-9]+)?[kKmM]?)/i,
        /([0-9]+(?:\.[0-9]+)?[kKmM]?)\s*st/i
      ]
    };
    
    // Fonction pour convertir les suffixes (k, K, m, M)
    function parseMetricValue(valueStr) {
      if (!valueStr) return 0;
      
      const cleanValue = valueStr.replace(/[,\s]/g, ''); // Enlever virgules et espaces
      const match = cleanValue.match(/([0-9]+(?:\.[0-9]+)?)([kKmM])?/);
      
      if (!match) return parseInt(cleanValue) || 0;
      
      const number = parseFloat(match[1]);
      const suffix = match[2];
      
      if (!suffix) return Math.round(number);
      
      // Logique différenciée selon le type de métrique
      switch (suffix.toLowerCase()) {
        case 'k':
          // LOGIQUE UNIVERSELLE: k = toujours le nombre de base
          // 549k RD = 549 referring domains
          // 1.2k KW = 1.2 mille keywords = 1200
          // MAIS dans le contexte SEO, k semble juste être un indicateur
          return Math.round(number); // Garder le nombre de base pour tous
        case 'm':
          // Pour RD: 32.6M = 32,600,000 referring domains
          // Pour KW/ST: 1.5M = 1,500,000 keywords/traffic
          return Math.round(number * 1000000); // Millions = x1,000,000
        default:
          return Math.round(number);
      }
    }
    
    // Chercher avec tous les patterns et parser les suffixes
    for (const rdPattern of patterns.rd) {
      const match = textContent.match(rdPattern);
      if (match) {
        const originalValue = match[1];
        rd = parseMetricValue(originalValue);
        console.log(`🔗 RD trouvé: "${originalValue}" → ${rd.toLocaleString()}`);
        break;
      }
    }
    
    for (const kwPattern of patterns.kw) {
      const match = textContent.match(kwPattern);
      if (match) {
        const originalValue = match[1];
        kw = parseMetricValue(originalValue);
        console.log(`🔑 KW trouvé: "${originalValue}" → ${kw.toLocaleString()}`);
        break;
      }
    }
    
    for (const stPattern of patterns.st) {
      const match = textContent.match(stPattern);
      if (match) {
        const originalValue = match[1];
        st = parseMetricValue(originalValue);
        console.log(`📊 ST trouvé: "${originalValue}" → ${st.toLocaleString()}`);
        break;
      }
    }
    
    // Méthode 2: Chercher des éléments avec des classes/attributs spécifiques
    const selectors = {
      rd: ['[class*="rd"]', '[class*="domain"]', '[class*="backlink"]', '[data-rd]', '[title*="domain"]'],
      kw: ['[class*="kw"]', '[class*="keyword"]', '[class*="term"]', '[data-kw]', '[title*="keyword"]'],
      st: ['[class*="st"]', '[class*="traffic"]', '[class*="visit"]', '[data-st]', '[title*="traffic"]']
    };
    
    // Essayer tous les sélecteurs
    if (rd === 0) { // Seulement si pas trouvé dans le texte
      for (const selector of selectors.rd) {
        const element = resultElement.querySelector(selector);
        if (element) {
          const match = element.textContent.match(/([0-9]+(?:\.[0-9]+)?[kKmM]?)/);
          if (match) {
            rd = parseMetricValue(match[1]);
            break;
          }
        }
      }
    }
    
  } catch (e) {
    console.log('Erreur extraction métriques SEO:', e);
  }
  
  const url = resultElement.querySelector('a')?.href || 'N/A';
  console.log(`🔍 Métriques finales pour ${url.substring(0,50)}...:`, { rd, kw, st });
  return { rd, kw, st };
}

// Fonction pour appliquer le highlighting SEO
function applySeoHighlighting(enabled = true, settings = null) {
  console.log('applySeoHighlighting called:', { enabled, settings });
  
  if (!enabled) {
    // Supprimer tous les highlights existants
    document.querySelectorAll('.seo-opportunity-highlight').forEach(el => {
      el.classList.remove('seo-opportunity-highlight');
      el.style.background = '';
      el.style.borderLeft = '';
      el.style.transition = '';
      el.style.padding = '';
      el.style.borderRadius = '';
      el.style.margin = '';
      const tooltip = el.querySelector('.seo-tooltip');
      if (tooltip) tooltip.remove();
    });
    // Arrêter le monitoring
    if (forceHighlightInterval) {
      clearInterval(forceHighlightInterval);
      forceHighlightInterval = null;
    }
    console.log('SEO highlighting DISABLED - highlights removed');
    return;
  }
  
  // Paramètres par défaut
  const defaultSettings = {
    rdMin: 0,
    rdMax: 50,
    kwMin: 1000,
    stMin: 1000
  };
  
  const config = settings || defaultSettings;
  console.log('Using SEO settings:', config);
  
  // Sélectionner tous les résultats Google
  const searchResults = document.querySelectorAll('#search .g, #search .tF2Cxc, #search [data-sokoban-container]');
  console.log(`Found ${searchResults.length} search results to analyze`);
  
  let highlightedCount = 0;
  
  searchResults.forEach((result, index) => {
    const metrics = extractSeoMetrics(result);
    
    // Vérifier si le résultat match tous les critères
    const matchesRd = metrics.rd >= config.rdMin && metrics.rd <= config.rdMax;
    const matchesKw = metrics.kw >= config.kwMin;
    const matchesSt = metrics.st >= config.stMin;
    
    const isOpportunity = matchesRd && matchesKw && matchesSt;
    
    console.log(`📋 Result ${index + 1}:`, {
      url: result.querySelector('a')?.href,
      metrics,
      criteria: {
        rdRange: `${config.rdMin}-${config.rdMax}`,
        kwMin: config.kwMin,
        stMin: config.stMin
      },
      matches: { matchesRd, matchesKw, matchesSt },
      isOpportunity
    });
    
    // D'abord nettoyer les anciens styles
    result.classList.remove('seo-opportunity-highlight');
    result.style.background = '';
    result.style.borderLeft = '';
    result.style.transition = '';
    result.style.padding = '';
    result.style.borderRadius = '';
    result.style.margin = '';
    const oldTooltip = result.querySelector('.seo-tooltip');
    if (oldTooltip) oldTooltip.remove();
    
    if (isOpportunity) {
      console.log(`🟢 APPLYING GREEN HIGHLIGHTING to result ${index + 1}`);
      
      // Appliquer le highlighting ULTRA FORT avec priorité maximale
      result.classList.add('seo-opportunity-highlight');
      result.setAttribute('data-seo-highlighted', 'true');
      
      // CSS avec préfixe pour éviter les conflits
      const styles = {
        'background': '#d4f4dd !important',
        'background-color': '#d4f4dd !important',
        'border-left': '6px solid #22c55e !important',
        'border': '2px solid #22c55e !important',
        'transition': 'all 0.3s ease !important',
        'padding': '16px !important',
        'border-radius': '12px !important',
        'margin': '12px 0 !important',
        'box-shadow': '0 4px 12px rgba(34, 197, 94, 0.3) !important',
        'position': 'relative !important',
        'z-index': '999 !important',
        'opacity': '1 !important',
        'display': 'block !important',
        'visibility': 'visible !important'
      };
      
      // Appliquer chaque style individuellement avec force
      Object.entries(styles).forEach(([prop, value]) => {
        result.style.setProperty(prop, value, 'important');
      });
      
      // Ajouter une classe CSS injectée pour plus de force
      if (!document.getElementById('seo-highlight-style')) {
        const style = document.createElement('style');
        style.id = 'seo-highlight-style';
        style.textContent = `
          .seo-opportunity-highlight {
            background: #d4f4dd !important;
            border-left: 6px solid #22c55e !important;
            border-radius: 12px !important;
            padding: 16px !important;
            margin: 12px 0 !important;
            box-shadow: 0 4px 12px rgba(34, 197, 94, 0.3) !important;
            position: relative !important;
            z-index: 999 !important;
          }
          [data-seo-highlighted="true"] {
            background: #d4f4dd !important;
            border: 2px solid #22c55e !important;
          }
          /* FORCE EXTREME pour override tout */
          .g[data-seo-highlighted="true"],
          .tF2Cxc[data-seo-highlighted="true"],
          [data-sokoban-container][data-seo-highlighted="true"] {
            background: #d4f4dd !important;
            border: 3px solid #22c55e !important;
            border-radius: 15px !important;
            padding: 20px !important;
            margin: 15px 0 !important;
          }
        `;
        document.head.appendChild(style);
        console.log('🎨 CSS styles injected');
      }
      
      console.log(`🟢 Element highlighted:`, result);
      console.log(`🟢 Applied styles:`, {
        background: result.style.background,
        borderLeft: result.style.borderLeft,
        classList: result.classList.toString()
      });
      
      highlightedCount++;
      
      // Ajouter tooltip au survol
      const tooltip = document.createElement('div');
      tooltip.className = 'seo-tooltip';
      tooltip.style.cssText = `
        position: absolute;
        background: #333 !important;
        color: white !important;
        padding: 8px 12px !important;
        border-radius: 6px !important;
        font-size: 12px !important;
        z-index: 10000 !important;
        white-space: nowrap !important;
        display: none !important;
        pointer-events: none !important;
        left: 10px !important;
        top: -35px !important;
      `;
      tooltip.textContent = `✅ SEO Opportunity (RD: ${metrics.rd}, KW: ${metrics.kw}, ST: ${metrics.st})`;
      result.style.position = 'relative';
      result.appendChild(tooltip);
      
      // Event listeners pour tooltip
      result.addEventListener('mouseenter', () => {
        tooltip.style.display = 'block !important';
      });
      
      result.addEventListener('mouseleave', () => {
        tooltip.style.display = 'none !important';
      });
    }
  });
  
  console.log(`✅ SEO highlighting ENABLED - ${highlightedCount}/${searchResults.length} results highlighted`);
  
  // Activer le monitoring en continu pour les conflits
  if (forceHighlightInterval) clearInterval(forceHighlightInterval);
  forceHighlightInterval = setInterval(forceHighlightOverride, 2000);
  
  // VERIFICATION COMPLETE
  setTimeout(() => {
    const highlighted = document.querySelectorAll('.seo-opportunity-highlight');
    const withData = document.querySelectorAll('[data-seo-highlighted="true"]');
    
    console.log(`🔍 VERIFICATION COMPLETE:`);
    console.log(`- Highlighted class: ${highlighted.length} elements`);
    console.log(`- Data attribute: ${withData.length} elements`);
    
    if (highlighted.length === 0) {
      console.log('⚠️ PROBLEM: Aucun element avec la classe highlighting!');
    }
    
    highlighted.forEach((el, i) => {
      const computedStyle = getComputedStyle(el);
      console.log(`🟢 Element ${i+1} vérification:`, {
        element: el,
        background: computedStyle.backgroundColor,
        borderLeft: computedStyle.borderLeft,
        display: computedStyle.display,
        visibility: computedStyle.visibility,
        hasClass: el.classList.contains('seo-opportunity-highlight'),
        hasDataAttr: el.getAttribute('data-seo-highlighted') === 'true'
      });
    });
  }, 2000);
}

// Observer pour les changements dynamiques de la page
let highlightingEnabled = false;
let currentSettings = null;
let forceHighlightInterval = null;

// Fonction pour forcer le highlighting en continu (pour les conflits)
function forceHighlightOverride() {
  if (!highlightingEnabled) return;
  
  const highlighted = document.querySelectorAll('[data-seo-highlighted="true"]');
  highlighted.forEach(el => {
    // Re-forcer les styles si ils ont été supprimés par un autre script
    if (getComputedStyle(el).backgroundColor !== 'rgb(212, 244, 221)') {
      console.log('🚑 Conflit détecté! Re-forçage du highlighting...');
      el.style.setProperty('background', '#d4f4dd', 'important');
      el.style.setProperty('border-left', '6px solid #22c55e', 'important');
      el.style.setProperty('padding', '16px', 'important');
      el.style.setProperty('border-radius', '12px', 'important');
      el.style.setProperty('margin', '12px 0', 'important');
    }
  });
}

const observer = new MutationObserver(() => {
  if (highlightingEnabled) {
    setTimeout(() => applySeoHighlighting(true, currentSettings), 500);
  }
});

if (window.location.hostname.includes('google.') && window.location.pathname.includes('/search')) {
  observer.observe(document.body, { childList: true, subtree: true });
  
  // Observer pour ré-appliquer le highlighting après les changements de page
  const urlObserver = new MutationObserver(() => {
    chrome.storage.local.get(['seoHighlightEnabled', 'seoHighlightSettings'], (result) => {
      if (result.seoHighlightEnabled !== false && highlightingEnabled) {
        const settings = result.seoHighlightSettings || {
          rdMin: 0, rdMax: 50, kwMin: 1000, stMin: 1000
        };
        setTimeout(() => applySeoHighlighting(true, settings), 1000);
      }
    });
  });
  
  urlObserver.observe(document.querySelector('#search') || document.body, {
    childList: true,
    subtree: true
  });
}

window.addEventListener('load', () => {
  const isGoogleSearch = window.location.hostname.includes('google.') && window.location.pathname.includes('/search');
  
  chrome.storage.local.set({
    pageUrl: window.location.href,
    isGoogleSearch: isGoogleSearch,
    currentDomain: window.location.hostname
  });
  
  // Auto-activation du highlighting sur Google SERP
  if (isGoogleSearch) {
    chrome.storage.local.get(['seoHighlightEnabled', 'seoHighlightSettings'], (result) => {
      // Par défaut activé si pas de préférence sauvegardée
      const enabled = result.seoHighlightEnabled !== false;
      
      if (enabled) {
        const settings = result.seoHighlightSettings || {
          rdMin: 0,
          rdMax: 50,
          kwMin: 1000,
          stMin: 1000
        };
        
        console.log('🎆 Auto-activation SEO highlighting on Google SERP');
        
        // Délai pour laisser la page se charger complètement
        setTimeout(() => {
          applySeoHighlighting(true, settings);
        }, 2000);
      }
    });
  }
});
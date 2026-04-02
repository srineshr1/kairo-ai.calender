/**
 * Device Performance Detection Utility
 * Detects device capabilities and determines optimal blur level for glassmorphism effects
 */

/**
 * Detect all available device capabilities
 * @returns {Object} Device metrics including cores, memory, connection, etc.
 */
export function detectDeviceCapabilities() {
  const capabilities = {
    // CPU cores (desktop: 4-16, mobile: 2-8, budget: 1-2)
    hardwareConcurrency: navigator.hardwareConcurrency || 4,
    
    // Device memory in GB (high-end: 8+, mid: 4, low: 2 or less)
    deviceMemory: navigator.deviceMemory || null,
    
    // Connection type ('4g', '3g', '2g', 'slow-2g')
    connectionType: navigator.connection?.effectiveType || '4g',
    
    // Device pixel ratio (retina displays need more GPU power)
    devicePixelRatio: window.devicePixelRatio || 1,
    
    // User prefers reduced motion (accessibility)
    prefersReducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    
    // Screen size (larger screens = more pixels to blur)
    screenWidth: window.screen.width,
    screenHeight: window.screen.height,
    
    // Platform info
    isMobile: /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent),
    platform: navigator.platform,
    
    // WebGL support (indicates GPU capability)
    hasWebGL: checkWebGLSupport(),
  }
  
  return capabilities
}

/**
 * Check if WebGL is supported (indicates GPU availability)
 * @returns {boolean}
 */
function checkWebGLSupport() {
  try {
    const canvas = document.createElement('canvas')
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl')
    return !!gl
  } catch (e) {
    return false
  }
}

/**
 * Calculate performance score based on device capabilities
 * Score ranges from 0-100, higher is better
 * @param {Object} capabilities - Device capabilities from detectDeviceCapabilities()
 * @returns {number} Performance score (0-100)
 */
export function calculatePerformanceScore(capabilities) {
  let score = 0
  
  // CPU cores scoring (max 30 points)
  if (capabilities.hardwareConcurrency >= 8) {
    score += 30
  } else if (capabilities.hardwareConcurrency >= 6) {
    score += 25
  } else if (capabilities.hardwareConcurrency >= 4) {
    score += 20
  } else if (capabilities.hardwareConcurrency >= 2) {
    score += 10
  }
  
  // Device memory scoring (max 25 points)
  if (capabilities.deviceMemory !== null) {
    if (capabilities.deviceMemory >= 8) {
      score += 25
    } else if (capabilities.deviceMemory >= 6) {
      score += 20
    } else if (capabilities.deviceMemory >= 4) {
      score += 15
    } else if (capabilities.deviceMemory >= 2) {
      score += 8
    }
  } else {
    // Fallback if deviceMemory API unavailable (e.g., Firefox, Safari)
    // Give mid-range score
    score += 15
  }
  
  // Connection type scoring (max 15 points)
  switch (capabilities.connectionType) {
    case '4g':
      score += 15
      break
    case '3g':
      score += 8
      break
    case '2g':
    case 'slow-2g':
      score += 0
      break
    default:
      score += 10 // Unknown, assume decent
  }
  
  // Device pixel ratio penalty (high DPR = more pixels to blur)
  if (capabilities.devicePixelRatio <= 1.5) {
    score += 10
  } else if (capabilities.devicePixelRatio <= 2) {
    score += 5
  }
  // No bonus for DPR > 2 (retina displays)
  
  // WebGL support bonus (indicates GPU)
  if (capabilities.hasWebGL) {
    score += 10
  }
  
  // Mobile penalty (mobile GPUs generally weaker)
  if (capabilities.isMobile) {
    score -= 10
  }
  
  // Accessibility: respect reduced motion preference
  if (capabilities.prefersReducedMotion) {
    score = 0 // Force disable blur for accessibility
  }
  
  // Clamp score between 0-100
  return Math.max(0, Math.min(100, score))
}

/**
 * Determine blur level based on performance score
 * @param {number} score - Performance score from calculatePerformanceScore()
 * @returns {'none' | 'reduced' | 'full'} Recommended blur level
 */
export function getBlurLevelFromScore(score) {
  if (score >= 65) {
    return 'full'      // High-end: Full premium blur effects
  } else if (score >= 35) {
    return 'reduced'   // Mid-range: Light blur, still looks good
  } else {
    return 'none'      // Low-end: Solid backgrounds for performance
  }
}

/**
 * Main function to detect and return recommended blur level
 * @returns {'none' | 'reduced' | 'full'} Recommended blur level
 */
export function getBlurLevel() {
  const capabilities = detectDeviceCapabilities()
  const score = calculatePerformanceScore(capabilities)
  const blurLevel = getBlurLevelFromScore(score)
  
  // Log detection results for debugging
  console.log('[Performance Detection]', {
    capabilities,
    score,
    blurLevel,
  })
  
  return blurLevel
}

/**
 * Quick check if blur should be enabled
 * @returns {boolean}
 */
export function shouldEnableBlur() {
  const level = getBlurLevel()
  return level !== 'none'
}

/**
 * Get human-readable performance tier name
 * @param {'none' | 'reduced' | 'full'} blurLevel
 * @returns {string} Human-readable tier name
 */
export function getPerformanceTierName(blurLevel) {
  switch (blurLevel) {
    case 'full':
      return 'High-end'
    case 'reduced':
      return 'Mid-range'
    case 'none':
      return 'Low-end'
    default:
      return 'Unknown'
  }
}

const { extractEvents } = require('./extractor')

async function analyzeText(text, groupName) {
  return extractEvents(text, groupName)
}

async function analyzeImage() {
  return []
}

async function analyzePDF() {
  return []
}

module.exports = { analyzeText, analyzeImage, analyzePDF }

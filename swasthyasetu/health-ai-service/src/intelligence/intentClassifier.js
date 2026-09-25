/**
 * Intent Classifier module for SwasthyaSetu AI service.
 * Performs deterministic rule-based keyword & pattern classification.
 */

const INTENTS = {
  SCHEME_DISCOVERY: 'SCHEME_DISCOVERY',
  ELIGIBILITY: 'ELIGIBILITY',
  BENEFITS: 'BENEFITS',
  DOCUMENTS: 'DOCUMENTS',
  APPLICATION: 'APPLICATION',
  CLAIM: 'CLAIM',
  STATUS: 'STATUS',
  GENERAL_INFORMATION: 'GENERAL_INFORMATION',
  HUMAN_REQUEST: 'HUMAN_REQUEST',
  OUT_OF_SCOPE: 'OUT_OF_SCOPE'
};

/**
 * Classifies a user query into one of 10 defined intent categories.
 * 
 * @param {string} userQuery - Input message string from user
 * @returns {string} Classified intent constant
 */
function classifyIntent(userQuery) {
  if (!userQuery || typeof userQuery !== 'string') {
    return INTENTS.OUT_OF_SCOPE;
  }

  const queryLower = userQuery.toLowerCase().trim();

  // 1. Explicit Human Request (Must match human agent intent, not generic word "person" in citizen queries)
  const humanPatterns = [
    /\b(talk to (a )?human|speak (to|with) (a )?human|talk to (a )?person|speak (to|with) (a )?person|human representative|live agent|customer care|support executive|helpdesk|connect (me )?to (a )?person|operator)\b/i
  ];
  if (humanPatterns.some(pattern => pattern.test(queryLower))) {
    return INTENTS.HUMAN_REQUEST;
  }

  // 2. Out of Scope domain filter (cooking, coding, weather, sports, general entertainment)
  const outOfScopePatterns = [
    /\b(cook|recipe|biryani|pizza|burger|dish|kitchen|ingredients)\b/i,
    /\b(python|javascript|java|c\+\+|programming|coding|algorithm|compiler)\b/i,
    /\b(weather|forecast|rain|temperature|cricket|football|match|movie|song)\b/i
  ];
  if (outOfScopePatterns.some(pattern => pattern.test(queryLower)) && !/\b(health|insurance|scheme|hospital|medical|bima|arogya)\b/i.test(queryLower)) {
    return INTENTS.OUT_OF_SCOPE;
  }

  // 3. Claims & Disputes (High Risk / Human Trigger)
  const claimPatterns = [
    /\b(claim|rejected|rejection|dispute|denied|hospital rejected|billing issue|reimbursement|hospital refush?ed|corrupt)\b/i
  ];
  if (claimPatterns.some(pattern => pattern.test(queryLower))) {
    return INTENTS.CLAIM;
  }

  // 4. Personalized Eligibility Questions
  const eligibilityPatterns = [
    /\b(am i eligible|can i get|am i entitled|can my family get|who is eligible|do i qualify|eligibility|income limit|age limit|can a \d+ year|am i covered)\b/i
  ];
  if (eligibilityPatterns.some(pattern => pattern.test(queryLower))) {
    return INTENTS.ELIGIBILITY;
  }

  // 5. Document requirements
  const documentPatterns = [
    /\b(document|paper|ration card|aadhaar|certificate|id proof|proof of income|what papers|needed for|required to apply)\b/i
  ];
  if (documentPatterns.some(pattern => pattern.test(queryLower))) {
    return INTENTS.DOCUMENTS;
  }

  // 6. Application / Registration procedure
  const applicationPatterns = [
    /\b(how to apply|apply online|registration|enrollment|how can i register|where to apply|portal link|form fill)\b/i
  ];
  if (applicationPatterns.some(pattern => pattern.test(queryLower))) {
    return INTENTS.APPLICATION;
  }

  // 7. Status Check
  const statusPatterns = [
    /\b(status|track|check card|application status|where is my card|pending status|card number)\b/i
  ];
  if (statusPatterns.some(pattern => pattern.test(queryLower))) {
    return INTENTS.STATUS;
  }

  // 8. Scheme Discovery (Location / List of available schemes)
  const discoveryPatterns = [
    /\b(what schemes|available in|health insurance in|schemes in|list of schemes|options in|which scheme|government insurance in)\b/i
  ];
  if (discoveryPatterns.some(pattern => pattern.test(queryLower))) {
    return INTENTS.SCHEME_DISCOVERY;
  }

  // 9. Benefits / Coverage details
  const benefitPatterns = [
    /\b(benefit|coverage|how much|amount|lakh|cashless|treatment|hospitalization|covered|surgery)\b/i
  ];
  if (benefitPatterns.some(pattern => pattern.test(queryLower))) {
    return INTENTS.BENEFITS;
  }

  // 10. General Information
  if (/\b(what is|tell me about|explain|details on|information on)\b/i.test(queryLower)) {
    return INTENTS.GENERAL_INFORMATION;
  }

  // Fallback domain check
  if (/\b(health|insurance|scheme|medical|hospital|bima|arogya|pmjay|cghs|cmchis|medisep|echs|esic)\b/i.test(queryLower)) {
    return INTENTS.GENERAL_INFORMATION;
  }

  return INTENTS.OUT_OF_SCOPE;
}

module.exports = {
  INTENTS,
  classifyIntent
};

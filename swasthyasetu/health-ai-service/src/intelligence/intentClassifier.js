const INTENTS = {
  HUMAN_REQUEST: 'HUMAN_REQUEST',
  OUT_OF_SCOPE: 'OUT_OF_SCOPE',
  CLAIM: 'CLAIM',
  ELIGIBILITY: 'ELIGIBILITY',
  DOCUMENTS: 'DOCUMENTS',
  APPLICATION: 'APPLICATION',
  STATUS: 'STATUS',
  SCHEME_DISCOVERY: 'SCHEME_DISCOVERY',
  BENEFITS: 'BENEFITS',
  GENERAL_INFORMATION: 'GENERAL_INFORMATION'
};

/**
 * Normalizes state names and state acronyms to canonical official names.
 */
function normalizeStateName(input) {
  if (!input || typeof input !== 'string') return null;
  const lower = input.toLowerCase().trim();
  if (/\b(tamilnadu|tamil nadu|tn)\b/i.test(lower)) return 'Tamil Nadu';
  if (/\b(kerala|kl)\b/i.test(lower)) return 'Kerala';
  if (/\b(rajasthan|rj)\b/i.test(lower)) return 'Rajasthan';
  if (/\b(andhra|andhra pradesh|ap)\b/i.test(lower)) return 'Andhra Pradesh';
  if (/\b(maharashtra|mh)\b/i.test(lower)) return 'Maharashtra';
  if (/\b(delhi|dl|ncr)\b/i.test(lower)) return 'Delhi';
  if (/\b(karnataka|ka|bangalore|bengaluru)\b/i.test(lower)) return 'Karnataka';
  if (/\b(gujarat|gj)\b/i.test(lower)) return 'Gujarat';
  if (/\b(bihar|br)\b/i.test(lower)) return 'Bihar';
  if (/\b(uttar pradesh|up)\b/i.test(lower)) return 'Uttar Pradesh';
  if (/\b(west bengal|wb|kolkata)\b/i.test(lower)) return 'West Bengal';
  if (/\b(punjab|pb)\b/i.test(lower)) return 'Punjab';
  if (/\b(haryana|hr)\b/i.test(lower)) return 'Haryana';
  if (/\b(madhya pradesh|mp)\b/i.test(lower)) return 'Madhya Pradesh';
  if (/\b(odisha|orissa)\b/i.test(lower)) return 'Odisha';
  if (/\b(assam)\b/i.test(lower)) return 'Assam';
  return null;
}

/**
 * Classifies a user query into one of defined intent categories.
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
  if (outOfScopePatterns.some(pattern => pattern.test(queryLower)) && !/\b(health|insurance|scheme|hospital|medical|bima|arogya|ayushman|pmjay|cmchis|medisep|cghs|echs|esic|tamilnadu|kerala|delhi)\b/i.test(queryLower)) {
    return INTENTS.OUT_OF_SCOPE;
  }

  // 3. Claims & Disputes (High Risk / Human Trigger)
  const claimPatterns = [
    /\b(claims?|rejected|rejection|dispute|denied|hospital rejected|billing issue|reimbursement|hospital refush?ed|corrupt)\b/i
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
    /\b(documents?|papers?|ration card|aadhaar|certificate|id proof|proof of income|what papers|needed for|required to apply)\b/i
  ];
  if (documentPatterns.some(pattern => pattern.test(queryLower))) {
    return INTENTS.DOCUMENTS;
  }

  // 6. Application / Registration procedure
  const applicationPatterns = [
    /\b(how to apply|how do i apply|apply online|apply for|registration|enrollment|how can i register|where to apply|portal link|form fill)\b/i
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
    /\b(what schemes|available in|health insurance in|schemes in|list of schemes|list the schemes|schemes available|options in|which scheme|government insurance in|government health schemes|schemes can i get|schemes i can apply for|health schemes available)\b/i
  ];
  if (discoveryPatterns.some(pattern => pattern.test(queryLower))) {
    return INTENTS.SCHEME_DISCOVERY;
  }

  // State-specific scheme query pattern (e.g. "im from tamilnadu list the schemes available", "TN government health insurance")
  if ((normalizeStateName(queryLower) || /\b(tn|kl|rj|ap|mh|dl|ka|gj|br|up|wb|pb|hr|mp)\b/i.test(queryLower)) && /\b(scheme|schemes|list|available|get|apply|insurance|bima|government|gov|health)\b/i.test(queryLower)) {
    return INTENTS.SCHEME_DISCOVERY;
  }

  // 9. Benefits / Coverage details
  const benefitPatterns = [
    /\b(benefits?|coverage|how much|amount|lakh|cashless|treatment|hospitalization|covered|surgery|hospitalization|cover)\b/i
  ];
  if (benefitPatterns.some(pattern => pattern.test(queryLower))) {
    return INTENTS.BENEFITS;
  }

  // 10. General Information
  if (/\b(what is|tell me about|explain|details on|information on|what about)\b/i.test(queryLower)) {
    return INTENTS.GENERAL_INFORMATION;
  }

  // Fallback domain check
  if (/\b(health|insurance|scheme|medical|hospital|bima|arogya|pmjay|cghs|cmchis|medisep|echs|esic)\b/i.test(queryLower)) {
    return INTENTS.GENERAL_INFORMATION;
  }

  return INTENTS.OUT_OF_SCOPE;
}

/**
 * Context-Aware Intent Classifier resolving short follow-up messages using conversation history & active state.
 */
function classifyIntentWithContext(userQuery, conversationHistory = [], conversationState = {}) {
  const directIntent = classifyIntent(userQuery);
  
  // If direct classification matched a specific functional intent (other than OUT_OF_SCOPE), return it.
  if (directIntent !== INTENTS.OUT_OF_SCOPE && directIntent !== INTENTS.GENERAL_INFORMATION) {
    return directIntent;
  }

  const cleanText = userQuery.trim();
  const queryLower = cleanText.toLowerCase();

  // Check if query is a contextual follow-up (e.g. "What about senior citizens?", "Does it cover hospitalization?")
  if (directIntent === INTENTS.GENERAL_INFORMATION || /\b(what about|does it|is it|what of|who about|how about)\b/i.test(queryLower)) {
    if (conversationState && conversationState.activeIntent) {
      if (conversationState.activeIntent === INTENTS.SCHEME_DISCOVERY && /\b(senior citizen|elderly|women|poor|bpl|farmer)\b/i.test(queryLower)) {
        return INTENTS.SCHEME_DISCOVERY;
      }
      if (conversationState.activeIntent === INTENTS.BENEFITS || /\b(hospitalization|cover|surgery|treatment)\b/i.test(queryLower)) {
        return INTENTS.BENEFITS;
      }
      return conversationState.activeIntent;
    }
  }

  const stateDetected = normalizeStateName(cleanText);
  const containsNumbers = /\b\d{4,7}\b|\b\d{1,3}\b|\b\d+\s*lakh\b/i.test(cleanText);
  const isShortFollowUp = cleanText.length < 60 || Boolean(stateDetected) || containsNumbers || /\b(yes|no|online|aadhaar|ration card|senior citizen|for my mother|father|coimbatore|chennai|madurai)\b/i.test(queryLower);

  if (isShortFollowUp && conversationState && conversationState.activeIntent) {
    return conversationState.activeIntent;
  }

  if (isShortFollowUp && conversationHistory.length > 0) {
    // Inspect previous assistant message to resolve context
    for (let i = conversationHistory.length - 1; i >= 0; i--) {
      const msg = conversationHistory[i];
      if (msg.role === 'assistant' && msg.content) {
        if (/specify your state|household income|income|eligibility/i.test(msg.content)) return INTENTS.ELIGIBILITY;
        if (/document|paper|aadhaar|ration card/i.test(msg.content)) return INTENTS.DOCUMENTS;
        if (/apply|register|online|portal/i.test(msg.content)) return INTENTS.APPLICATION;
        if (/schemes available|state|health insurance/i.test(msg.content)) return INTENTS.SCHEME_DISCOVERY;
      }
    }
  }

  return directIntent;
}

/**
 * Extracts structured entities from user query text.
 */
function extractEntities(userQuery) {
  if (!userQuery || typeof userQuery !== 'string') return {};
  const text = userQuery.trim();
  const lower = text.toLowerCase();
  const entities = {};

  // State extraction
  const state = normalizeStateName(text);
  if (state) entities.state = state;

  // Income extraction (e.g. "120000", "1.2 lakh", "2 lakhs", "income 2 lakh")
  const lakhMatch = lower.match(/(\d+(?:\.\d+)?)\s*lakhs?/i);
  if (lakhMatch) {
    entities.income = Math.round(parseFloat(lakhMatch[1]) * 100000);
  } else {
    const rawNumMatch = lower.match(/\b(\d{4,7})\b/);
    if (rawNumMatch) {
      entities.income = parseInt(rawNumMatch[1], 10);
    }
  }

  // Age extraction (e.g. "I am 65", "Age 65", "70 year old", "65 years")
  const ageMatch = lower.match(/\b(?:age\s*|i am\s*|a\s*)?(\d{1,3})\s*(?:years?|yr|year old)?\b/i);
  if (ageMatch && parseInt(ageMatch[1], 10) > 0 && parseInt(ageMatch[1], 10) < 120) {
    // Only set age if it explicitly looks like an age inquiry
    if (/\b(age|years?|year old|senior citizen|\d+\s*yr)\b/i.test(lower)) {
      entities.age = parseInt(ageMatch[1], 10);
    }
  }

  // Scheme extraction
  if (/\b(pm-?jay|ayushman|pmjay)\b/i.test(lower)) entities.scheme = 'PMJAY';
  else if (/\bcmchis\b/i.test(lower)) entities.scheme = 'CMCHIS';
  else if (/\bmedisep\b/i.test(lower)) entities.scheme = 'MEDISEP';
  else if (/\bcghs\b/i.test(lower)) entities.scheme = 'CGHS';
  else if (/\bechs\b/i.test(lower)) entities.scheme = 'ECHS';

  // Relationship extraction
  if (/\b(mother|mom)\b/i.test(lower)) entities.relationship = 'mother';
  else if (/\b(father|dad)\b/i.test(lower)) entities.relationship = 'father';
  else if (/\b(family|parents)\b/i.test(lower)) entities.relationship = 'family';

  return entities;
}

/**
 * Checks whether query is asking for personalized eligibility evaluation
 * vs general scheme eligibility criteria.
 */
function isPersonalizedEligibilityQuery(userQuery) {
  if (!userQuery || typeof userQuery !== 'string') return false;
  const lower = userQuery.toLowerCase().trim();
  
  // Explicit personal eligibility triggers
  const personalTriggers = [
    /\b(am i eligible|can i get|can my family get|am i entitled|do i qualify|am i covered|will i qualify)\b/i
  ];
  if (personalTriggers.some(pattern => pattern.test(lower))) {
    return true;
  }

  // General eligibility inquiries (What is eligibility criteria? Who is eligible?)
  const generalTriggers = [
    /\b(what is (the )?.*eligibility|eligibility criteria|who is eligible|income limit|age limit|requirements for|criteria for)\b/i
  ];
  if (generalTriggers.some(pattern => pattern.test(lower))) {
    return false;
  }

  return false;
}

/**
 * Uses Groq LLM API to classify ambiguous natural-language citizen queries into structured intent JSON.
 * High-confidence deterministic intents (HUMAN_REQUEST, CLAIM, STATUS) skip this layer.
 */
async function classifyIntentWithLLM({ userQuery, conversationHistory = [], conversationState = {} }) {
  const { getGroqClient, DEFAULT_GROQ_MODEL } = require('../config/groq');
  const model = process.env.GROQ_MODEL || DEFAULT_GROQ_MODEL;
  
  try {
    const groq = getGroqClient();
    
    const prompt = `
You are the Intent Classification Engine for KAAPAN Indian Government Health Scheme Platform.
Classify the user's natural language input into exactly ONE of these intents:
- SCHEME_DISCOVERY (citizen asking for list/options of health schemes in a state or region)
- ELIGIBILITY (citizen asking about eligibility criteria, income/age limits, or if they qualify)
- BENEFITS (citizen asking about coverage amount, hospital coverage, cashless treatments, surgery)
- DOCUMENTS (citizen asking what papers/documents/aadhaar/ration card are needed)
- APPLICATION (citizen asking how or where to apply, register, or fill form)
- CLAIM (citizen reporting claim rejection or hospital dispute)
- STATUS (citizen tracking application or card status)
- HUMAN_REQUEST (citizen explicitly asking for human agent or customer care)
- GENERAL_INFORMATION (general question about a specific health scheme)
- OUT_OF_SCOPE (question completely unrelated to health schemes, e.g. cooking, coding, weather)

CONVERSATION CONTEXT:
Active Intent: ${conversationState.activeIntent || 'None'}
Active State: ${conversationState.activeState || 'None'}
Active Scheme: ${conversationState.activeScheme || 'None'}

USER QUERY:
"${userQuery}"

Respond in STRICT raw JSON:
{
  "intent": "INTENT_NAME",
  "confidence": 0.95,
  "entities": {
    "state": null,
    "scheme": null,
    "income": null,
    "age": null
  },
  "is_follow_up": false
}
`.trim();

    const completion = await groq.chat.completions.create({
      messages: [
        { role: 'system', content: 'You output only raw valid JSON for intent classification.' },
        { role: 'user', content: prompt }
      ],
      model,
      temperature: 0.0,
      response_format: { type: 'json_object' }
    });

    const raw = completion.choices[0]?.message?.content;
    const parsed = JSON.parse(raw);
    if (parsed && parsed.intent && INTENTS[parsed.intent]) {
      return parsed;
    }
  } catch (err) {
    // Return null on failure; caller falls back safely to deterministic result
  }

  return null;
}

module.exports = {
  INTENTS,
  classifyIntent,
  classifyIntentWithContext,
  classifyIntentWithLLM,
  normalizeStateName,
  extractEntities,
  isPersonalizedEligibilityQuery
};

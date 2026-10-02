// Curated, high-quality, authentic healthcare imagery mapping for KAAPAN health schemes
export const SCHEME_IMAGE_MANIFEST = {
  "IN-PMJAY": {
    url: "https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&w=1200&q=80",
    alt: "Ayushman Bharat PM-JAY Family Healthcare and Hospital Coverage",
    category: "Health Assurance"
  },
  "TN-CMCHIS": {
    url: "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=1200&q=80",
    alt: "Chief Minister's Comprehensive Health Insurance Scheme Tamil Nadu",
    category: "State Health Scheme"
  },
  "KL-MEDISEP": {
    url: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=1200&q=80",
    alt: "Kerala MEDISEP Health Insurance for Employees and Pensioners",
    category: "State Employee Scheme"
  },
  "IN-ESIC": {
    url: "https://images.unsplash.com/photo-1504813184591-01572f98c85f?auto=format&fit=crop&w=1200&q=80",
    alt: "Employees' State Insurance Scheme ESIC Industrial Worker Medical Benefits",
    category: "Worker Security"
  },
  "IN-CGHS": {
    url: "https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&w=1200&q=80",
    alt: "Central Government Health Scheme Wellness Centre and Medical Benefits",
    category: "Central Government"
  },
  "IN-PMMVY": {
    url: "https://images.unsplash.com/photo-1555252333-9f8e92e65df9?auto=format&fit=crop&w=1200&q=80",
    alt: "Pradhan Mantri Matru Vandana Yojana Maternity Benefit Scheme",
    category: "Maternal Care"
  },
  "IN-JSSK": {
    url: "https://images.unsplash.com/photo-1531983412531-1f49a365ffed?auto=format&fit=crop&w=1200&q=80",
    alt: "Janani Shishu Suraksha Karyakram Infant and Newborn Healthcare",
    category: "Child & Mother Care"
  },
  "IN-RBSK": {
    url: "https://images.unsplash.com/photo-1502086223501-7ea6ecd79368?auto=format&fit=crop&w=1200&q=80",
    alt: "Rashtriya Bal Swasthya Karyakram Child Screening and Development",
    category: "Child Screening"
  },
  "IN-PMSSY": {
    url: "https://images.unsplash.com/photo-1586773860418-d37222d8fce3?auto=format&fit=crop&w=1200&q=80",
    alt: "Pradhan Mantri Swasthya Suraksha Yojana AIIMS Healthcare Infrastructure",
    category: "Healthcare Infrastructure"
  },
  "IN-NPCDCS": {
    url: "https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&w=1200&q=80",
    alt: "National NCD Prevention and Chronic Disease Screening Programme",
    category: "Chronic Care"
  },
  "IN-PMNDP": {
    url: "https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&w=1200&q=80",
    alt: "Pradhan Mantri National Dialysis Programme Public Health Facility",
    category: "Specialized Treatment"
  },
  "TN-NK48": {
    url: "https://images.unsplash.com/photo-1587745416684-47953f16f02f?auto=format&fit=crop&w=1200&q=80",
    alt: "Nammai Kaakkum 48 Emergency Road Accident Medical Treatment Tamil Nadu",
    category: "Emergency Assistance"
  },
  "IN-ABHA": {
    url: "https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&w=1200&q=80",
    alt: "Ayushman Bharat Health Account Digital Health Identity Card",
    category: "Digital Health ID"
  }
};

export const DEFAULT_SCHEME_IMAGE = {
  url: "https://images.unsplash.com/photo-1505751172876-fa1923c5c528?auto=format&fit=crop&w=1200&q=80",
  alt: "Indian Government Healthcare Scheme Assistance",
  category: "Government Health Scheme"
};

export const getSchemeImage = (schemeId) => {
  if (!schemeId) return DEFAULT_SCHEME_IMAGE;
  const upperId = schemeId.toUpperCase();
  if (SCHEME_IMAGE_MANIFEST[upperId]) {
    return SCHEME_IMAGE_MANIFEST[upperId];
  }
  // Try partial key matching
  for (const key in SCHEME_IMAGE_MANIFEST) {
    if (upperId.includes(key) || key.includes(upperId)) {
      return SCHEME_IMAGE_MANIFEST[key];
    }
  }
  return DEFAULT_SCHEME_IMAGE;
};

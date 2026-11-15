/**
 * AI Smart Civic Triage Engine (NLP Emergency & Urgency Detector)
 * Analyzes grievance text in real-time to detect life-safety hazards,
 * public health emergencies, and critical infrastructure failures.
 */

const EMERGENCY_RULES = [
  {
    hazardType: 'Electrical Shock Hazard',
    severity: 'critical',
    slaHours: 6,
    patterns: [
      /\b(spark|sparking|live wire|naked wire|broken wire|current|electric shock|transformer|pole fall|short circuit)\b/i,
      /(तार टूट|बिजली का करंट|स्पार्किंग|करंट आ रहा|खंभा गिर)/i
    ],
    reason: 'Risk of fatal electrocution to pedestrians and motorists.'
  },
  {
    hazardType: 'Open Manhole / Cave-in Disaster',
    severity: 'critical',
    slaHours: 12,
    patterns: [
      /\b(open manhole|manhole cover missing|sewer pit|cave in|road collapse|crater|depression near school|pitfall)\b/i,
      /(खुला मैनहोल|गटर का ढक्कन|सड़क धंस|गड्ढे में गिर)/i
    ],
    reason: 'Immediate falling risk for children, two-wheelers, and elderly citizens.'
  },
  {
    hazardType: 'Critical Public Health / Contamination',
    severity: 'high',
    slaHours: 18,
    patterns: [
      /\b(dead animal|carcass|toxic|sewage in drinking water|contaminated water|dengue outbreak|cholera|black water)\b/i,
      /(मरा हुआ जानवर|गंदा पानी|सीवर का पानी पीने|हैजा|डेंगू)/i
    ],
    reason: 'High potential for epidemic outbreak and biological contamination.'
  },
  {
    hazardType: 'Emergency Lifeline Route Blockage',
    severity: 'critical',
    slaHours: 6,
    patterns: [
      /\b(hospital road|ambulance blocked|fire brigade|school entrance blocked|oxygen route)\b/i,
      /(अस्पताल का रास्ता|एम्बुलेंस फंसी|स्कूल का गेट)/i
    ],
    reason: 'Blockage of vital emergency life-support and emergency vehicle movement.'
  },
  {
    hazardType: 'Severe Water Pipeline Burst / Flood',
    severity: 'high',
    slaHours: 24,
    patterns: [
      /\b(main pipeline burst|water flooding houses|inundation|submerged street)\b/i,
      /(पाइपलाइन फट|पानी भर गया|घरों में पानी)/i
    ],
    reason: 'Significant loss of potable water and property flooding risk.'
  }
]

export const analyzeComplaintUrgency = (title = '', description = '') => {
  const combined = `${title} ${description}`.trim()
  if (!combined || combined.length < 5) {
    return { isEmergency: false }
  }

  for (const rule of EMERGENCY_RULES) {
    for (const pattern of rule.patterns) {
      const match = combined.match(pattern)
      if (match) {
        return {
          isEmergency: true,
          hazardType: rule.hazardType,
          severity: rule.severity,
          suggestedPriority: rule.severity,
          suggestedSlaHours: rule.slaHours,
          matchedKeyword: match[0],
          reason: rule.reason
        }
      }
    }
  }

  return { isEmergency: false }
}

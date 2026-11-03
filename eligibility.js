/* Pure rule engine: no Chrome or DOM dependencies, so it can be tested in Node. */
function classifyEligibility(text) {
  if (typeof text !== 'string' || !text.trim()) {
    return makeResult('review', 'Missing posting text', '');
  }

  const normalize = value => value.toLowerCase().replace(/\s+/g, ' ').trim();
  const statements = text.split(/\.(?=\s+[A-Z]|$)|[!?\n;]+/).map(s => s.trim()).filter(Boolean);

  const restrictedRules = [
    /\bcanadian citizens?\b/i,
    /\bcanadian citizenship\b/i,
    /\bpermanent residents?\b/i,
    /\bu\.?s\.? citizens?\b/i,
    /\bcitizens only\b/i,
    /\bcitizenship required\b/i,
    /\bmust be (?:a )?citizen\b/i,
    /\bmust be canadian\b/i,
    /\bcontrolled goods\b/i
  ];
  const reviewRules = [
    /\bsecurity clearance\b/i,
    /\bwork authori[sz]ation\b/i,
    /\bauthori[sz]ed to work\b/i,
    /\blegally entitled to work\b/i,
    /\beligible to work\b/i,
    /\bwithout sponsorship\b/i,
    /\bvisa sponsorship\b/i,
    /\bitar\b/i,
    /\bexport control\b/i
  ];
  // A reference to citizenship is not by itself a requirement.
  const negatedRequirement = [
    /\b(?:citizenship|canadian citizenship|permanent resident status) (?:is |are )?not required\b/i,
    /\b(?:do not|does not|don't|doesn't) require (?:canadian )?citizenship\b/i,
    /\bnot (?:restricted|limited) to (?:canadian )?citizens\b/i,
    /\b(?:canadian )?citizenship (?:is )?not (?:necessary|mandatory)\b/i
  ];

  let reviewMatch = null;
  for (const statement of statements) {
    const s = normalize(statement);
    for (const rule of restrictedRules) {
      const match = statement.match(rule);
      if (!match) continue;
      if (negatedRequirement.some(negation => negation.test(s))) continue;
      // Mentioning citizenship, without stating an explicit eligibility rule,
      // is uncertain. Do not incorrectly assert that an applicant is barred.
      const explicit = /\b(?:only|must|required|requirement|restricted to|limited to|eligible applicants|applicants must)\b/i.test(s);
      if (explicit || /\bcontrolled goods\b/i.test(match[0])) {
        return makeResult('restricted', match[0], statement);
      }
      reviewMatch ||= { reason: 'Citizenship or residency mentioned; verify requirement', evidence: statement };
    }
    for (const rule of reviewRules) {
      const match = statement.match(rule);
      if (match) reviewMatch ||= { reason: match[0], evidence: statement };
    }
  }
  if (reviewMatch) return makeResult('review', reviewMatch.reason, reviewMatch.evidence);
  return makeResult('clear', 'No obvious restriction detected', '');
}

function makeResult(type, reason, evidence) {
  const labels = { clear: '🟢 Clear', review: '🟡 Review', restricted: '🔴 Restricted' };
  return { type, label: labels[type], reason, evidence };
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { classifyEligibility };
}

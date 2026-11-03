const test = require('node:test');
const assert = require('node:assert/strict');
const { classifyEligibility } = require('../eligibility.js');

const cases = [
  ['explicit citizenship restriction', 'Only Canadian citizens may apply.', 'restricted'],
  ['permanent resident requirement', 'Applicants must be permanent residents.', 'restricted'],
  ['US citizens restriction', 'Must be a U.S. citizen.', 'restricted'],
  ['case insensitive', 'CANADIAN CITIZENSHIP REQUIRED', 'restricted'],
  ['negated citizenship requirement', 'Canadian citizenship is not required.', 'clear'],
  ['not limited to citizens', 'Applications are not limited to Canadian citizens.', 'clear'],
  ['security clearance', 'Security clearance required.', 'review'],
  ['work authorization', 'Must be legally entitled to work in Canada.', 'review'],
  ['sponsorship', 'Visa sponsorship is not available.', 'review'],
  ['ambiguous mention', 'Canadian citizens participated in this project.', 'review'],
  ['no indicators', 'Build and maintain a web application.', 'clear'],
  ['empty posting', '', 'review'],
  ['restriction takes precedence', 'Security clearance required. Must be a Canadian citizen.', 'restricted'],
];

for (const [name, posting, expected] of cases) {
  test(name, () => {
    const result = classifyEligibility(posting);
    assert.equal(result.type, expected);
    assert.ok(result.reason);
    assert.equal(typeof result.evidence, 'string');
  });
}

test('evidence points to original posting sentence', () => {
  const result = classifyEligibility('We use Python. Applicants must be permanent residents.');
  assert.equal(result.evidence, 'Applicants must be permanent residents');
});

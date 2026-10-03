// Mirror of SQL `has_contact_info` (source of truth, enforced in create_request / create_proposal).
const PATTERNS = [
  /[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/i,
  /(?:^|[^0-9])(?:\+?216[\s.-]?)?[0-9]{2}[\s.-]?[0-9]{3}[\s.-]?[0-9]{3}(?:$|[^0-9])/,
  /(?:^|[^0-9])[0-9]{2}(?:[\s.][0-9]{2}){3}(?:$|[^0-9])/,
  /[0-9]{8,}/,
];

/** True when the text contains a phone number or an e-mail address. */
export function hasContactInfo(text: string | null | undefined): boolean {
  return !!text && PATTERNS.some((p) => p.test(text));
}

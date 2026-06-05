export type ParsedContact = {
  fullName: string;
  phone: string;
  email: string;
  jobTitle: string;
  company: string;
  website: string;
};

const EMAIL_RE = /[\w.+-]+@[\w-]+\.[\w.]+/;
const PHONE_RE = /(?:\+?\d{1,4}[\s.-]?)?\(?\d{1,4}\)?[\s.-]?\d{1,4}[\s.-]?\d{1,9}/;
const URL_RE = /(?:https?:\/\/)?(?:www\.)?[\w-]+\.[\w]{2,}(?:\/[\w./-]*)?/i;

const NOISE_WORDS = [
  "tel", "phone", "fax", "email", "mobile", "cell", "office",
  "address", "website", "web", "www", "http", "https",
];

export function parseBusinessCardText(lines: string[]): ParsedContact {
  const result: ParsedContact = {
    fullName: "",
    phone: "",
    email: "",
    jobTitle: "",
    company: "",
    website: "",
  };

  const remainingLines: string[] = [];

  for (const raw of lines) {
    const line = raw.trim();
    if (!line || line.length < 2) continue;

    const emailMatch = line.match(EMAIL_RE);
    if (emailMatch && !result.email) {
      result.email = emailMatch[0].toLowerCase();
      continue;
    }

    const urlMatch = line.match(URL_RE);
    if (urlMatch && !result.website && !EMAIL_RE.test(line)) {
      let url = urlMatch[0];
      if (!url.startsWith("http")) url = "https://" + url;
      result.website = url;
      continue;
    }

    const phoneMatch = line.match(PHONE_RE);
    if (phoneMatch && !result.phone) {
      const digits = phoneMatch[0].replace(/[^0-9+]/g, "");
      if (digits.length >= 7) {
        result.phone = phoneMatch[0].trim();
        continue;
      }
    }

    const lower = line.toLowerCase();
    if (NOISE_WORDS.some((w) => lower === w || lower === w + ":")) continue;

    remainingLines.push(line);
  }

  assignNameAndCompany(remainingLines, result);

  return result;
}

function assignNameAndCompany(lines: string[], result: ParsedContact) {
  if (lines.length === 0) return;

  const scored = lines.map((line, idx) => ({
    line,
    idx,
    score: nameScore(line),
  }));

  scored.sort((a, b) => b.score - a.score);

  if (scored.length > 0 && scored[0].score > 0) {
    result.fullName = scored[0].line;
  }

  const remaining = lines.filter((l) => l !== result.fullName);

  if (remaining.length >= 2) {
    result.company = remaining[0];
    result.jobTitle = remaining[1];
  } else if (remaining.length === 1) {
    if (isLikelyTitle(remaining[0])) {
      result.jobTitle = remaining[0];
    } else {
      result.company = remaining[0];
    }
  }
}

function nameScore(line: string): number {
  let score = 0;
  const words = line.split(/\s+/);

  if (words.length >= 2 && words.length <= 4) score += 3;
  if (words.every((w) => /^[A-Z]/.test(w))) score += 2;
  if (line.length < 30) score += 1;
  if (/\d/.test(line)) score -= 5;
  if (/@/.test(line)) score -= 5;
  if (/[.\/]/.test(line) && !/@/.test(line)) score -= 2;

  const titleKeywords = [
    "manager", "director", "ceo", "cto", "cfo", "vp", "president",
    "engineer", "developer", "designer", "consultant", "analyst",
    "specialist", "coordinator", "executive", "officer", "head",
    "lead", "senior", "junior", "intern", "associate",
  ];
  const lower = line.toLowerCase();
  if (titleKeywords.some((k) => lower.includes(k))) score -= 3;

  return score;
}

function isLikelyTitle(line: string): boolean {
  const titleKeywords = [
    "manager", "director", "ceo", "cto", "cfo", "vp", "president",
    "engineer", "developer", "designer", "consultant", "analyst",
    "specialist", "coordinator", "executive", "officer", "head",
    "lead", "senior", "junior", "intern", "associate", "founder",
  ];
  const lower = line.toLowerCase();
  return titleKeywords.some((k) => lower.includes(k));
}

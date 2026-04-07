const EDU_PATTERNS = [
  /\.ac\.in$/i,
  /\.edu\.in$/i,
  /\.edu$/i,
  /\.sch\.in$/i,
  /\.nic\.in$/i,
];

export function isEduEmail(email) {
  const domain = email.split("@")[1] || "";
  return EDU_PATTERNS.some((re) => re.test(domain));
}

export function supportEmail() {
  return process.env.SUPPORT_EMAIL || "campuskartindia@gmail.com";
}

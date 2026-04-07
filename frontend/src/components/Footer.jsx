import { Link } from "react-router-dom";
import { useState } from "react";

function Section({ title, children, defaultOpen }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-slate-200 py-4 last:border-0">
      <button
        type="button"
        className="flex w-full items-center justify-between text-left font-display text-sm font-semibold text-ck-blue"
        onClick={() => setOpen(!open)}
      >
        {title}
        <span>{open ? "−" : "+"}</span>
      </button>
      {open && <div className="mt-3 space-y-2 text-sm leading-relaxed text-slate-600">{children}</div>}
    </div>
  );
}

export default function Footer() {
  return (
    <footer className="mt-16 border-t border-slate-200 bg-white">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 md:grid-cols-3">
        <div>
          <p className="font-display text-lg font-bold text-ck-blue">CampusKart</p>
          <p className="mt-2 text-sm text-slate-600">
            India-first campus marketplace connecting clients with verified students for real projects, tasks, and
            gigs—with escrow, CampusCoin rewards, and transparent workflows.
          </p>
          <p className="mt-4 text-xs text-slate-500">
            Support:{" "}
            <a className="text-ck-orange" href="mailto:campuskartindia@gmail.com">
              campuskartindia@gmail.com
            </a>
          </p>
        </div>
        <div>
          <p className="font-display text-sm font-semibold text-ck-purple">Quick links</p>
          <ul className="mt-3 space-y-2 text-sm">
            <li>
              <Link className="text-ck-blue hover:underline" to="/">
                Marketplace
              </Link>
            </li>
            <li>
              <Link className="text-ck-blue hover:underline" to="/about">
                About
              </Link>
            </li>
            <li>
              <Link className="text-ck-blue hover:underline" to="/activity">
                Post a task
              </Link>
            </li>
            <li>
              <Link className="text-ck-blue hover:underline" to="/wallet">
                Wallet & payouts
              </Link>
            </li>
            <li>
              <Link className="text-ck-blue hover:underline" to="/contact">
                Contact
              </Link>
            </li>
            <li>
              <a
                className="text-ck-purple hover:underline"
                href={import.meta.env.VITE_DISCORD_INVITE || "https://discord.gg"}
                target="_blank"
                rel="noreferrer"
              >
                Discord community
              </a>
            </li>
          </ul>
        </div>
        <div>
          <p className="font-display text-sm font-semibold text-ck-orange">CampusKart India</p>
          <p className="mt-2 text-xs text-slate-500">
            Platform operations are described in the legal sections below. These summaries are not a substitute for
            professional legal advice.
          </p>
        </div>
      </div>

      <div className="border-t border-slate-200 bg-slate-50">
        <div className="mx-auto max-w-7xl px-4 py-8">
          <Section title="Terms & Conditions (marketplace — India)" defaultOpen={false}>
            <p>
              By using CampusKart you agree to use the platform lawfully under the Information Technology Act, 2000 and
              applicable Indian contract and consumer laws. Users must provide accurate profiles; students on tasks
              should use institutional email where required. Clients are responsible for lawful task descriptions.
              Payments may be processed via approved partners (such as Paytm) and held in escrow until defined release
              conditions are met.
            </p>
            <p>
              Disputes should first use in-platform reporting and dispute tools. CampusKart may suspend accounts that
              violate policies, including harassment, academic dishonesty where prohibited, fraud, or circumvention of
              payments. Limitation of liability applies to the maximum extent permitted by law; governing law and
              jurisdiction are India-focused unless otherwise stated in a separate agreement.
            </p>
          </Section>
          <Section title="CampusCoin (CC) — legal explanation">
            <p>
              CampusCoin is a platform reward unit displayed in your wallet. <strong>10 CC = ₹1</strong> for conversion
              purposes on CampusKart as configured in the product. CC may be earned through eligible task completions and
              promotions. CC is not legal tender, not transferable outside the platform unless expressly enabled, and may
              be adjusted, expired, or discontinued with reasonable notice. Tax treatment of rewards may apply; consult a
              tax professional.
            </p>
          </Section>
          <Section title="Paytm payment terms (summary)">
            <p>
              Where Paytm is enabled, top-ups and payouts are subject to Paytm&apos;s merchant and user terms, KYC
              requirements, and NPCI/UPI rules where applicable. CampusKart records ledger entries for escrow, release,
              and withdrawals; settlement timing may depend on Paytm and banking partners. Chargebacks and failed
              settlements may reverse or hold balances per reconciliation policies.
            </p>
          </Section>
          <p className="pt-6 text-center text-xs text-slate-400">
            © {new Date().getFullYear()} CampusKart — inquiries: campuskartindia@gmail.com
          </p>
        </div>
      </div>
    </footer>
  );
}

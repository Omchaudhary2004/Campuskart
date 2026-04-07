export default function About() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-12">
      <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
        <div>
          <p className="text-sm font-semibold text-ck-orange">Our story</p>
          <h1 className="mt-2 font-display text-4xl font-bold text-ck-blue">Built for campuses across India</h1>
          <p className="mt-4 text-slate-600">
            CampusKart pairs serious clients with talented students—assignments, creative work, tech gigs, and event
            support—using escrow, transparent bids, and CampusCoin rewards.
          </p>
        </div>
        <img
          src="https://images.unsplash.com/photo-1523580846011-d3a5bc25702b?w=900&h=600&fit=crop"
          alt="Students collaborating"
          className="rounded-3xl border border-slate-200 shadow-md"
        />
      </div>

      <section className="mt-20 grid gap-8 md:grid-cols-2">
        <article className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
          <img
            src="https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=600&h=360&fit=crop"
            alt="Vision"
            className="mb-6 h-48 w-full rounded-xl object-cover"
          />
          <h2 className="font-display text-2xl font-bold text-ck-purple">Vision</h2>
          <p className="mt-3 text-slate-600">
            Every student should access paid, skill-building opportunities with fair pay, mentorship-shaped feedback, and
            modern tooling—without leaving campus life behind.
          </p>
        </article>
        <article className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
          <img
            src="https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=600&h=360&fit=crop"
            alt="Mission"
            className="mb-6 h-48 w-full rounded-xl object-cover"
          />
          <h2 className="font-display text-2xl font-bold text-ck-orange">Mission</h2>
          <p className="mt-3 text-slate-600">
            We build trustworthy market infrastructure: verified edu emails for students and admins, escrow releases tied
            to delivery, wallet history you can audit, and dispute paths that admins can resolve.
          </p>
        </article>
      </section>

      <section className="mt-20">
        <h2 className="text-center font-display text-3xl font-bold text-ck-blue">Team</h2>
        <p className="mx-auto mt-2 max-w-2xl text-center text-slate-600">
          A cross-functional crew blending product, campus outreach, and payments expertise—reach us at{" "}
          <a className="text-ck-orange" href="mailto:campuskartindia@gmail.com">
            campuskartindia@gmail.com
          </a>
          .
        </p>
        <div className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {[
            {
              name: "Aisha Khan",
              role: "Product & Trust",
              img: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&h=400&fit=crop",
            },
            {
              name: "Vikram Desai",
              role: "Engineering",
              img: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop",
            },
            {
              name: "Neha Iyer",
              role: "Campus Partnerships",
              img: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&h=400&fit=crop",
            },
            {
              name: "Arjun Mehta",
              role: "Payments & Compliance",
              img: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop",
            },
          ].map((m) => (
            <div key={m.name} className="ck-card p-4 text-center">
              <img src={m.img} alt={m.name} className="mx-auto h-32 w-32 rounded-full object-cover" />
              <p className="mt-4 font-display font-semibold text-ck-ink">{m.name}</p>
              <p className="text-sm text-ck-purple">{m.role}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

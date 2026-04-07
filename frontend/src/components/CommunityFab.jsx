const discord = import.meta.env.VITE_DISCORD_INVITE || "https://discord.gg";

export default function CommunityFab() {
  return (
    <a
      href={discord}
      target="_blank"
      rel="noreferrer"
      className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-full bg-ck-purple px-5 py-3 text-sm font-semibold text-white shadow-lg ring-2 ring-white hover:bg-ck-purpleSoft"
      title="Join CampusKart Community on Discord"
    >
      <span className="text-lg" aria-hidden>
        💬
      </span>
      Community
    </a>
  );
}

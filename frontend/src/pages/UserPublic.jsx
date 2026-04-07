import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { api, assetUrl } from "../api.js";

export default function UserPublic() {
  const { id } = useParams();
  const [user, setUser] = useState(null);
  const [reviews, setReviews] = useState([]);

  useEffect(() => {
    api(`/api/users/public/${id}`)
      .then((d) => setUser(d.user))
      .catch(() => setUser(false));
    api(`/api/reviews/user/${id}`)
      .then((d) => setReviews(d.reviews || []))
      .catch(() => {});
  }, [id]);

  if (user === null) return <div className="p-20 text-center text-slate-500">Loading…</div>;
  if (user === false) return <div className="p-20 text-center text-slate-500">User not found.</div>;

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <div className="ck-card flex flex-col items-center p-8 text-center md:flex-row md:text-left">
        <img
          src={assetUrl(user.avatar_url) || `https://i.pravatar.cc/160?u=${user.id}`}
          alt=""
          className="h-28 w-28 rounded-2xl object-cover"
        />
        <div className="mt-4 md:ml-6 md:mt-0">
          <h1 className="font-display text-2xl font-bold text-ck-blue">{user.name}</h1>
          <p className="text-sm uppercase text-ck-purple">{user.role}</p>
          <p className="mt-2 text-slate-600">{user.bio || "No bio yet."}</p>
        </div>
      </div>
      <section className="mt-8">
        <h2 className="font-display text-lg font-bold text-ck-orange">Reviews</h2>
        <ul className="mt-3 space-y-3">
          {reviews.map((r) => (
            <li key={r.id} className="rounded-xl border border-slate-200 bg-white p-4 text-sm">
              <p className="font-semibold">
                {r.rating}★ from {r.from_name}
              </p>
              <p className="text-slate-600">{r.comment}</p>
            </li>
          ))}
          {!reviews.length && <li className="text-slate-500">No reviews yet.</li>}
        </ul>
      </section>
    </div>
  );
}

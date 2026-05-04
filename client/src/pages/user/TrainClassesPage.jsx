import { useEffect, useState } from "react";
import { Link } from "react-router";
import { HiOutlineMagnifyingGlass } from "react-icons/hi2";
import ClassInfoCard from "../../components/user/ClassInfoCard.jsx";
import Loader from "../../components/common/Loader.jsx";
import { classApi } from "../../api/class.api.js";

const ORDER = ["FCO", "FAC", "SCR", "SCU", "TCR", "TCU"];

export default function TrainClassesPage() {
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    classApi
      .list()
      .then((data) => {
        if (cancelled) return;
        const list = data?.classes || [];
        list.sort((a, b) => ORDER.indexOf(a.code) - ORDER.indexOf(b.code));
        setClasses(list);
      })
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <>
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-12 pb-6">
        <div className="text-center max-w-2xl mx-auto">
          <span className="chip chip-brand mb-3">Travel classes</span>
          <h1 className="section-title">
            Pick the <span className="gradient-text">ride</span> that fits you
          </h1>
          <p className="mt-3 text-text-secondary">
            From the legendary Observation Saloon to budget-friendly third class
            — here's a closer look at the six classes you can book on NexTrain.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pb-12">
        {loading ? (
          <div className="glass p-12 grid place-items-center">
            <Loader size="lg" label="Loading classes…" />
          </div>
        ) : classes.length === 0 ? (
          <div className="glass p-10 text-center">
            <div className="text-4xl mb-2">🚆</div>
            <h2 className="font-display font-semibold">No classes yet</h2>
            <p className="text-sm text-text-secondary mt-1">
              An administrator hasn't seeded the train classes yet.
            </p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {classes.map((c) => (
              <ClassInfoCard
                key={c._id}
                trainClass={c}
                featured={c.code === "FCO"}
              />
            ))}
          </div>
        )}

        <div className="mt-12 glass p-8 text-center">
          <h3 className="font-display font-bold text-2xl">
            Ready to <span className="gradient-text">go</span>?
          </h3>
          <p className="mt-2 text-text-secondary max-w-lg mx-auto">
            Pick a class on the search page — we'll show you exactly which
            trains offer it on your chosen route and date.
          </p>
          <Link to="/search" className="btn-primary mt-5 inline-flex">
            <HiOutlineMagnifyingGlass className="h-4 w-4" />
            Search trains
          </Link>
        </div>
      </section>
    </>
  );
}

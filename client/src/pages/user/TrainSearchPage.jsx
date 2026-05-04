import TrainSearchForm from "../../components/user/TrainSearchForm.jsx";

export default function TrainSearchPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
      <header className="text-center mb-8">
        <span className="chip chip-brand mb-3">Find your train</span>
        <h1 className="section-title">
          Where to <span className="gradient-text">today</span>?
        </h1>
        <p className="mt-2 text-text-secondary max-w-xl mx-auto">
          Pick your origin, destination and travel date — we'll show every train
          running on your route with live seat availability.
        </p>
      </header>

      <div className="relative z-40">
        <TrainSearchForm />
      </div>

      <div className="mt-10 grid sm:grid-cols-3 gap-4 text-center">
        <Tip
          title="Plan ahead"
          text="Reserved classes can sell out 1–2 weeks in advance for popular routes."
        />
        <Tip
          title="Go scenic"
          text="The Kandy → Ella line is widely considered one of the world's most beautiful train rides."
        />
        <Tip
          title="Travel light"
          text="A digital ticket is all you need — no printing required."
        />
      </div>
    </div>
  );
}

function Tip({ title, text }) {
  return (
    <div className="glass p-5">
      <div className="font-display font-semibold mb-1">{title}</div>
      <p className="text-sm text-text-secondary">{text}</p>
    </div>
  );
}

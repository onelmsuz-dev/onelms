const stats = [
  {
    value: "500+",
    label: "O'quv markaz",
    description: "O'zbekiston bo'ylab faol foydalanuvchilar",
  },
  {
    value: "50,000+",
    label: "Faol o'quvchi",
    description: "Platformada ro'yxatdan o'tgan o'quvchilar",
  },
  {
    value: "99.9%",
    label: "Ishlash vaqti",
    description: "Kafolatlangan uptime SLA",
  },
  {
    value: "4.9/5",
    label: "Foydalanuvchi bahosi",
    description: "O'quv markaz egalari reytingi",
  },
];

export function StatsSection() {
  return (
    <section
      className="bg-slate-900 py-12 sm:py-14 lg:py-16"
      aria-label="OneRoom statistika ko'rsatkichlari"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <dl className="grid grid-cols-2 gap-8 sm:gap-10 lg:grid-cols-4">
          {stats.map((stat, i) => (
            <div
              key={stat.label}
              className={`text-center ${
                i < 2 ? "lg:border-r lg:border-slate-700/60" : ""
              } ${i === 2 ? "lg:border-r lg:border-slate-700/60" : ""}`}
            >
              <dt className="sr-only">{stat.label}</dt>
              <dd>
                <span className="block text-3xl font-extrabold tabular-nums text-white sm:text-4xl lg:text-5xl">
                  {stat.value}
                </span>
                <span className="mt-2 block text-sm font-semibold text-blue-400 sm:text-base">
                  {stat.label}
                </span>
                <span className="mt-1 block text-xs text-slate-500 sm:text-sm">
                  {stat.description}
                </span>
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}

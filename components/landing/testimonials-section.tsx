import { Star } from "lucide-react";

const testimonials = [
  {
    name: "Sherzod Umarov",
    role: "IT Academy direktori",
    city: "Toshkent",
    text: "OneRoom dan avval Excel da hamma narsani qilardim. Endi davomot, to'lov, jadval barchasi avtomatik. Oyiga kamida 20 soat vaqt tejalyapman.",
    rating: 5,
    initials: "SU",
    color: "bg-blue-600",
  },
  {
    name: "Nodira Hasanova",
    role: "Ingliz tili markazi egasi",
    city: "Samarqand",
    text: "CRM moduli bizga eng ko'p yordam berdi. Endi birorta ham lid yo'qolmaydi. Ota-onalarga Telegram orqali xabar borishi ham ajoyib.",
    rating: 5,
    initials: "NH",
    color: "bg-violet-600",
  },
  {
    name: "Bobur Toshmatov",
    role: "Matematika markazi, 3 filial",
    city: "Namangan",
    text: "3 ta filialni bitta ekrandan ko'rish eng katta afzallik. Boshqa sistemalar bilan solishtirdim — OneRoom ancha arzonroq va funktsional.",
    rating: 5,
    initials: "BT",
    color: "bg-emerald-600",
  },
  {
    name: "Dilnoza Yusupova",
    role: "Raqschilik studiyasi",
    city: "Buxoro",
    text: "Dars jadvali funksiyasi bizga ideal chiqdi. Xonalar va o'qituvchilar bo'yicha jadval tuzish juda oson. Ziddiyat bo'lganda ogohlantirib qo'yadi.",
    rating: 5,
    initials: "DY",
    color: "bg-orange-500",
  },
  {
    name: "Alisher Karimov",
    role: "Robototexnika markazi",
    city: "Farg'ona",
    text: "14 kunlik sinov davrida barcha imkoniyatlarni sinab ko'rdim. Texnik yordam tezkor javob berdi. Endi Pro tarifdan foydalanaman.",
    rating: 5,
    initials: "AK",
    color: "bg-cyan-600",
  },
  {
    name: "Gulnora Mirzayeva",
    role: "Chet tillari markazi, 150+ o'quvchi",
    city: "Andijon",
    text: "Hisobotlar moduli juda ajoyib. Oylik daromad grafigi bir zumda tayyor. Endi moliyaviy qarorlarni aniq ma'lumotlar asosida qabul qilaman.",
    rating: 5,
    initials: "GM",
    color: "bg-pink-600",
  },
];

function Stars({ count }: { count: number }) {
  return (
    <div className="flex gap-0.5" aria-label={`${count} yulduz`} role="img">
      {Array.from({ length: count }).map((_, i) => (
        <Star key={i} className="h-3.5 w-3.5 fill-amber-400 text-amber-400" aria-hidden="true" />
      ))}
    </div>
  );
}

export function TestimonialsSection() {
  return (
    <section
      className="py-16 sm:py-20 lg:py-28 bg-slate-50"
      aria-labelledby="testimonials-heading"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mx-auto max-w-2xl text-center mb-10 sm:mb-12 lg:mb-16">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-600 mb-3">
            Mijozlar fikrlari
          </p>
          <h2
            id="testimonials-heading"
            className="text-2xl font-extrabold text-slate-900 sm:text-3xl lg:text-4xl"
          >
            O'quv markaz egalari OneRoom haqida
          </h2>
          <p className="mt-4 text-base text-slate-600 sm:text-lg">
            O'zbekistonning turli shaharlaridan 500+ o'quv markaz egasining fikri
          </p>
        </div>

        {/* Grid */}
        <div className="grid gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3 lg:gap-6">
          {testimonials.map((t) => (
            <article
              key={t.name}
              className="flex flex-col rounded-2xl border border-slate-100 bg-white p-5 sm:p-6 shadow-sm"
            >
              {/* Stars */}
              <Stars count={t.rating} />

              {/* Quote */}
              <blockquote className="mt-3 flex-1 text-sm leading-relaxed text-slate-600">
                "{t.text}"
              </blockquote>

              {/* Author */}
              <div className="mt-5 flex items-center gap-3 border-t border-slate-100 pt-4">
                <div
                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white ${t.color}`}
                  aria-hidden="true"
                >
                  {t.initials}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-slate-900 truncate">{t.name}</p>
                  <p className="text-xs text-slate-500 truncate">
                    {t.role} · {t.city}
                  </p>
                </div>
              </div>
            </article>
          ))}
        </div>

        <p className="mt-8 text-center text-xs text-slate-400 sm:text-sm">
          Barcha sharhlar haqiqiy mijozlardan · Google va App Store da 4.9/5 reyting
        </p>
      </div>
    </section>
  );
}

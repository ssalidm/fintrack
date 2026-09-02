function HomePage() {
  return (
    <main className="grid min-h-screen place-items-center bg-slate-950 px-6 text-slate-100">
      <section className="w-full max-w-xl rounded-3xl border border-slate-800 bg-slate-900 p-10 shadow-2xl shadow-emerald-950/30">
        <p className="mb-6 text-sm font-semibold tracking-[0.25em] text-[#1f7a5c] uppercase">
          salif
        </p>

        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
          Frontend foundation ready.
        </h1>

        <p className="mt-5 leading-7 text-slate-400">
          React, TypeScript, Vite, Tailwind CSS, and React Router are working
          together.
        </p>

        <div className="mt-8 h-1.5 w-24 rounded-full bg-[#1f7a5c]" />
      </section>
    </main>
  )
}

export default HomePage

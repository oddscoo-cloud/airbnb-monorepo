function Register() {
  return (
    <div className="min-h-screen bg-[#DDDBD7] px-8 py-9 sm:px-16 lg:px-[378px]">
      <header className="flex flex-wrap items-center justify-between gap-6">
        <div className="font-['Inknut_Antiqua'] text-xl font-medium text-[#211E1A]">
          HomeFU
        </div>
        <a
          href="#"
          className="font-['Inknut_Antiqua'] text-xs font-medium text-[#211E1A] underline"
        >
          Запропонувати помешкання на HomeFU
        </a>
        <button className="flex items-center gap-3 rounded-[26px] border border-[#211E1A] px-5 py-2 text-[#211E1A]">
          <span className="flex flex-col gap-1">
            <span className="block h-[1.5px] w-3.5 bg-[#211E1A]" />
            <span className="block h-[1.5px] w-3.5 bg-[#211E1A]" />
            <span className="block h-[1.5px] w-3.5 bg-[#211E1A]" />
          </span>
          <svg width="21" height="17" viewBox="0 0 21 17" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="10.5" cy="4.5" r="4" stroke="#211E1A" strokeWidth="1.5" />
            <path
              d="M0.5 16.5L0.87 15C1.31 13.25 2.56 11.68 4.41 10.55C6.26 9.42 8.59 8.8 11 8.8C13.41 8.8 15.74 9.42 17.6 10.56C19.45 11.7 20.7 13.27 21.13 15.02L21.5 16.5"
              stroke="#211E1A"
              strokeWidth="1.5"
            />
          </svg>
        </button>
      </header>

      <main className="mt-14 grid grid-cols-1 gap-14 lg:grid-cols-[1fr_328px_1fr]">
        <div>
          <div className="flex h-[204px] flex-col items-center justify-center gap-3 rounded-2xl bg-[#DDDBD7] shadow-[4px_4px_6px_2px_rgba(0,0,0,0.25)]">
            <img
              src="https://api.builder.io/api/v1/image/assets/TEMP/b39279a7ec091a48c82e84775dfc8cdf1cd654e6?width=200"
              alt="Ірина"
              className="h-[100px] w-[100px] rounded-full object-cover"
            />
            <div className="font-['Inknut_Antiqua'] text-xl font-bold text-[#211E1A]">
              Ірина
            </div>
            <div className="font-['Inknut_Antiqua'] text-xs text-[#211E1A]">Гість</div>
          </div>

          <div className="mt-9 rounded-2xl border border-[#211E1A] p-9">
            <h2 className="font-['Nunito_Sans'] text-base font-bold leading-[17px] text-[#211E1A]">
              Підтверджена інормація про користувача Ірина
            </h2>
            <div className="mt-6 border-b border-[#6F6558] pb-4 font-['Nunito_Sans'] text-sm text-[#211E1A]">
              Електронна адреса
            </div>

            <h2 className="mt-9 font-['Nunito_Sans'] text-base font-bold leading-[17px] text-[#211E1A]">
              Верифікація особи
            </h2>
            <p className="mt-4 max-w-[247px] font-['Nunito_Sans'] text-xs leading-[17px] text-[#211E1A]">
              Перш ніж бронювати або приймати гостей на{' '}
              <span className="font-['Inknut_Antiqua'] font-semibold">HomeFU</span>, потрібно
              виконати цей крок.
            </p>
            <button className="mt-6 h-[43px] w-[187px] rounded-md border border-black font-['Nunito_Sans'] text-sm text-[#211E1A]">
              Пройти вериікацію
            </button>
          </div>
        </div>

        <div className="rounded-2xl border border-[#211E1A] p-9">
          <h1 className="font-['Nunito_Sans'] text-xl font-bold leading-[17px] text-[#211E1A]">
            Час створити свій профіль
          </h1>
          <hr className="mt-6 border-t border-[#6F6558]" />
          <p className="mt-6 font-['Nunito_Sans'] text-sm leading-[17px] text-[#211E1A]">
            Ваш профіль на <span className="font-['Inknut_Antiqua']">HomeFU</span> є важливою
            складовою кожного бронювання. Створіть профіль, щоб інші господарі та гості могли
            більше про вас дізнатися.
          </p>
          <button className="mt-9 h-10 w-full rounded-md bg-[#6F6558] font-['Nunito_Sans'] text-xs font-bold text-white">
            Створити профіль
          </button>
        </div>
      </main>
    </div>
  );
}

export default Register;

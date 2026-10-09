import { createFileRoute, Link } from "@tanstack/react-router";
import { LEGAL_ENTITY, PHONE } from "@/lib/business-info";
import { seoHead } from "@/lib/seo";

export const Route = createFileRoute("/privacy")({
  head: () =>
    seoHead({
      path: "/privacy",
      title: "Политика конфиденциальности — APELSIN INDUSTRIAL",
      description:
        "Политика обработки персональных данных APELSIN INDUSTRIAL: какие данные собираются через формы заявки и как они используются.",
    }),
  component: PrivacyPolicy,
});

function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-6">
          <Link to="/" className="font-display text-xl tracking-widest">
            APELSIN<span className="text-primary">.</span>INDUSTRIAL
          </Link>
          <Link to="/" className="text-sm text-muted-foreground hover:text-primary">
            На главную
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-16">
        <p className="eyebrow">Документ</p>
        <h1 className="mt-3 text-4xl sm:text-5xl">Политика конфиденциальности</h1>
        <p className="mt-4 text-sm text-muted-foreground">
          Действует в отношении данных, которые посетители сайта APELSIN INDUSTRIAL указывают в
          формах заявки. Оператор персональных данных — {LEGAL_ENTITY.name}, БИН {LEGAL_ENTITY.bin},
          юридический адрес: {LEGAL_ENTITY.address}.
        </p>

        <div className="surface-panel mt-10 space-y-8 rounded-lg p-6 text-sm leading-relaxed text-muted-foreground sm:p-8">
          <section>
            <h2 className="text-lg font-semibold text-foreground">1. Какие данные собираются</h2>
            <p className="mt-2">
              При отправке формы заявки на сайте мы собираем: имя, номер телефона, марку и модель
              автомобиля или техники (если указаны), направление и выбранную услугу, желаемую дату
              записи.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground">2. Цель обработки</h2>
            <p className="mt-2">
              Данные используются исключительно для оформления и обработки заявки: связи с вами по
              указанному номеру телефона, подтверждения записи и согласования деталей услуги в
              WhatsApp, а также уведомления сотрудников о новой заявке.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground">
              3. Хранение и передача третьим лицам
            </h2>
            <p className="mt-2">
              Данные заявки хранятся в базе данных у облачного провайдера (Supabase) и не передаются
              третьим лицам, за исключением мессенджеров WhatsApp и Telegram — для связи с вами и
              уведомления сотрудников о новой заявке, — а также случаев, предусмотренных
              законодательством Республики Казахстан.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground">4. Веб-аналитика и cookies</h2>
            <p className="mt-2">
              Сайт использует сервис веб-аналитики Яндекс Метрика (ООО «Яндекс»). Он с помощью
              cookie-файлов собирает обезличенные сведения о посещениях: просмотренные страницы,
              переходы по ссылкам, тип устройства и браузера, примерный регион. Содержимое формы
              заявки в Яндекс Метрику не передаётся. Вы можете отключить cookie в настройках
              браузера.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground">5. Согласие и отзыв согласия</h2>
            <p className="mt-2">
              Отправляя форму, вы подтверждаете согласие на обработку указанных данных. Вы можете в
              любой момент отозвать согласие и запросить удаление данных, связавшись с нами по
              телефону{" "}
              <a href={`tel:${PHONE.replace(/\s/g, "")}`} className="text-primary hover:underline">
                {PHONE}
              </a>
              .
            </p>
          </section>
        </div>
      </main>
    </div>
  );
}

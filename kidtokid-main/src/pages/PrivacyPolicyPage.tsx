import { Header } from "@/src/components/layout/Header"
import { Footer } from "@/src/components/Footer"

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      <Header />

      <main className="container mx-auto px-4 py-8 md:py-14 max-w-3xl">
        {/* Header */}
        <div className="mb-10 md:mb-14">
          <p className="text-sm font-medium text-blue-600 mb-2">Informação Legal</p>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-gray-100 mb-3">
            Política de Privacidade
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-base md:text-lg leading-relaxed">
            Explicamos como cuidamos dos teus dados de forma clara e sem complicações.
          </p>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-4">Última atualização: Janeiro de 2026</p>
        </div>

        {/* Intro */}
        <div className="mb-10 pb-10 border-b border-gray-100 dark:border-gray-800">
          <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-3">
            Os dados que nos confia servem para lhe oferecer a melhor experiência —
            desde recomendações para a família até ofertas pensadas para si.
            Tratamos tudo ao abrigo da lei e com o máximo cuidado.
          </p>
          <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
            A tua confiança é o nosso bem mais precioso.
          </p>
        </div>

        <div className="space-y-10">

          {/* Compromisso */}
          <section>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">A nossa promessa</h2>
            <div className="text-gray-600 dark:text-gray-400 leading-relaxed space-y-3">
              <p>
                Cuidar dos teus dados é tão importante para nós como cuidar dos artigos que vendemos.
                Só usamos aquilo que é necessário para te dar o melhor serviço, com total transparência.
              </p>
              <p>
                Quando os teus dados são tratados por parceiros nossos, exigimos-lhes exatamente o mesmo
                nível de cuidado e segurança.
              </p>
            </div>
          </section>

          {/* Responsável */}
          <section>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">Quem cuida dos teus dados?</h2>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
              A <strong className="text-gray-900 dark:text-gray-100">Kid to Kid Braga</strong>, com morada na Rua do Raio, 9, 4710-926 Braga.
              Para qualquer questão, fala connosco:{" "}
              <a href="mailto:braga@kidtokid.pt" className="text-blue-600 hover:underline">
                braga@kidtokid.pt
              </a>
            </p>
          </section>

          {/* Dados que utilizamos */}
          <section>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">O que guardamos e porquê</h2>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-4">
              Só pedimos o que é necessário. Aqui fica um resumo claro:
            </p>

            <div className="space-y-3">
              {[
                {
                  title: "Conta Online",
                  text: "Nome, email, morada e telemóvel — para que possa fazer compras e acompanhar o histórico."
                },
                {
                  title: "Novidades e Ofertas",
                  text: "Nome e contacto para enviar promoções — mas só com a tua permissão. Pode cancelar a qualquer momento."
                },
                {
                  title: "Após a Compra",
                  text: "Nome, NIF, telemóvel, morada e email para avisar sobre reparações ou envios."
                },
                {
                  title: "Trocas e Devoluções",
                  text: "Nome, telemóvel, morada e email. Em caso de reembolso, também o IBAN."
                },
                {
                  title: "Apoio ao Cliente",
                  text: "Nome, email e telemóvel para o identificar e responder rapidamente."
                },
                {
                  title: "Sugestões e Reclamações",
                  text: "Nome, email e telemóvel para podermos responder à tua opinião."
                }
              ].map((item, idx) => (
                <div key={idx} className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-1">{item.title}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{item.text}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Conservação */}
          <section>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">Quanto tempo guardamos os dados?</h2>
            <div className="text-gray-600 dark:text-gray-400 leading-relaxed space-y-3">
              <p>
                Apenas o tempo necessário. Quando já não precisamos, eliminamos ou anonimizamos tudo.
              </p>
              <p>
                A exceção são os dados de transação, que a lei obriga a guardar durante 10 anos.
                De resto, assim que tudo estiver tratado, apagamos os teus dados.
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Em caso de dúvida, fala connosco:{" "}
                <a href="mailto:braga@kidtokid.pt" className="text-blue-600 hover:underline">
                  braga@kidtokid.pt
                </a>
              </p>
            </div>
          </section>

          {/* Partilha */}
          <section>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">Com quem partilhamos os dados?</h2>
            <div className="text-gray-600 dark:text-gray-400 leading-relaxed space-y-3">
              <p>
                Apenas com quem precisa saber — parceiros de entregas, reparações ou marketing —
                sempre o mínimo indispensável. Se algum parceiro estiver fora da Europa,
                garantimos que cumpre as regras europeias.
              </p>
              <p>
                Também transmitimos dados à Autoridade Tributária, como a lei exige.
              </p>
              <p className="font-medium text-gray-900 dark:text-gray-100">
                Nunca vendemos nem partilhamos os teus dados com outras empresas para fins comerciais.
              </p>
            </div>
          </section>

          {/* Direitos */}
          <section>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">Os teus direitos</h2>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-4">
              Tem vários direitos sobre os teus dados e nós respeitamos todos:
            </p>
            <ul className="grid gap-2 sm:grid-cols-2 mb-4">
              {[
                "Direito de acesso",
                "Direito de retificação",
                "Direito de apagamento",
                "Direito de limitação",
                "Direito de portabilidade",
                "Direito de oposição",
                "Não sujeição a decisões automatizadas"
              ].map((direito, idx) => (
                <li key={idx} className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <span className="h-1 w-1 rounded-full bg-blue-500 shrink-0"></span>
                  {direito}
                </li>
              ))}
            </ul>
            <div className="text-gray-600 dark:text-gray-400 leading-relaxed space-y-3">
              <p>
                Deu consentimento e mudou de ideias? Pode retirá-lo a qualquer momento.
                Para exercer qualquer direito, envie-nos um email para{" "}
                <a href="mailto:braga@kidtokid.pt" className="text-blue-600 hover:underline">
                  braga@kidtokid.pt
                </a>
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Se precisar, pode apresentar uma reclamação junto da
                Comissão Nacional de Proteção de Dados (CNPD).
              </p>
            </div>
          </section>

          {/* Cookies */}
          <section>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">Cookies</h2>
            <div className="text-gray-600 dark:text-gray-400 leading-relaxed space-y-3 mb-4">
              <p>
                Os cookies são pequenos ficheiros que ajudam o site a funcionar melhor.
                Não recolhem dados que o identifiquem pessoalmente.
              </p>
            </div>
            <div className="space-y-3">
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-1">Cookies de Sessão</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Temporários — desaparecem quando fecha o navegador.
                </p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-1">Cookies de Análise</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Ajudam-nos a perceber como o site é usado para o podermos melhorar.
                </p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-1">Cookies Publicitários</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Permitem mostrar conteúdos relevantes com base na tua navegação.
                </p>
              </div>
            </div>
          </section>

          {/* Segurança */}
          <section>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">Como protegemos os teus dados</h2>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-4">
              Temos várias medidas de proteção alinhadas com as melhores práticas:
            </p>
            <ol className="list-decimal list-inside space-y-1.5 text-sm text-gray-600 dark:text-gray-400">
              <li>Acesso restrito — só quem precisa vê os teus dados</li>
              <li>Armazenamento e transmissão seguros</li>
              <li>Proteção contra acessos não autorizados</li>
              <li>Mecanismos que garantem a integridade dos dados</li>
              <li>Monitorização constante para prevenir uso indevido</li>
              <li>Equipamentos redundantes para nunca perder dados</li>
            </ol>
          </section>
        </div>

        {/* Atualizações */}
        <div className="mt-12 pt-8 border-t border-gray-100 dark:border-gray-800">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Esta página pode ser atualizada pontualmente. A versão mais recente
            estará sempre disponível aqui no site.
          </p>
        </div>
      </main>

      <Footer />
    </div>
  )
}

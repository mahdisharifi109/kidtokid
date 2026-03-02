import { Header } from "@/src/components/layout/Header"
import { Footer } from "@/src/components/Footer"
import {
    AlertTriangle,
    Mail,
    Phone,
    MapPin,
    ExternalLink
} from "lucide-react"
import { Link } from "react-router-dom"

export default function TermsPage() {
    return (
        <div className="min-h-screen bg-white">
            <Header />

            <main className="container mx-auto px-4 py-8 md:py-14 max-w-3xl">
                {/* Header */}
                <div className="mb-10 md:mb-14">
                    <p className="text-sm font-medium text-blue-600 mb-2">Informação Legal</p>
                    <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
                        Termos e Condições
                    </h1>
                    <p className="text-gray-500 text-base md:text-lg leading-relaxed">
                        Explicamos as regras da nossa loja online de forma clara e transparente.
                    </p>
                    <p className="text-xs text-gray-400 mt-4">Última atualização: Janeiro de 2026</p>
                </div>

                {/* Quem somos */}
                <div className="mb-10 pb-10 border-b border-gray-100">
                    <p className="text-gray-600 leading-relaxed">
                        Estas condições são entre nós, a <strong className="text-gray-900">Kid to Kid Braga</strong> (Rua do Raio, 9,
                        4710-926 Braga, email:{" "}
                        <a href="mailto:braga@kidtokid.pt" className="text-blue-600 hover:underline">
                            braga@kidtokid.pt
                        </a>), e quem faz compras no nosso site — ou seja, você.
                        Ao fazer uma encomenda, está a aceitar estas condições.
                    </p>
                </div>

                {/* Sections */}
                <div className="space-y-10">

                    {/* 1 */}
                    <section>
                        <h2 className="text-lg font-semibold text-gray-900 mb-3">
                            <span className="text-blue-600 mr-2">1.</span>
                            Como funciona a nossa loja online
                        </h2>
                        <div className="text-gray-600 leading-relaxed space-y-3">
                            <p>
                                Estas condições definem como funcionam as vendas na nossa loja online,
                                desde o momento em que faz a encomenda até a entrega em sua casa.
                            </p>
                            <p>
                                Regulam todas as etapas — encomenda, pagamento, envio e entrega —
                                para que tudo corra bem para ambas as partes.
                            </p>
                            <p>
                                Ao fazer uma encomenda, está a confirmar que leu e aceita estas condições,
                                bem como os preços e produtos da sua compra.
                            </p>
                        </div>
                        <div className="mt-4 bg-amber-50 border border-amber-200 rounded-lg p-4">
                            <div className="flex items-start gap-2.5">
                                <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
                                <div className="text-sm text-amber-800">
                                    <p className="font-medium mb-1">Artigos em segunda mão</p>
                                    <p>
                                        Selecionamos cada artigo com muito cuidado, mas como são peças usadas,
                                        podem ter pequenos sinais de uso que não sejam visíveis nas fotos.
                                    </p>
                                </div>
                            </div>
                        </div>
                        <p className="mt-3 text-sm text-gray-500">
                            Os artigos do site também estão na nossa loja física, por isso pode
                            haver pontualmente falhas de stock. Se isso acontecer, devolvemos-lhe
                            o dinheiro correspondente.
                        </p>
                    </section>

                    {/* 2 */}
                    <section>
                        <h2 className="text-lg font-semibold text-gray-900 mb-3">
                            <span className="text-blue-600 mr-2">2.</span>
                            Fazer uma encomenda
                        </h2>
                        <div className="text-gray-600 leading-relaxed space-y-3">
                            <p>
                                É simples: escolha os artigos no nosso site e faça a encomenda online.
                            </p>
                            <p>
                                Encomendas ao fim de semana ou feriados são processadas no dia útil seguinte.
                            </p>
                            <p>
                                Os artigos ficam reservados após confirmação do pagamento, por isso
                                recomendamos que pague logo após terminar a compra para garantir que não perde nada.
                            </p>
                        </div>
                    </section>

                    {/* 3 */}
                    <section>
                        <h2 className="text-lg font-semibold text-gray-900 mb-3">
                            <span className="text-blue-600 mr-2">3.</span>
                            Como enviamos a sua encomenda
                        </h2>
                        <div className="text-gray-600 leading-relaxed space-y-3">
                            <p>
                                Enviamos tudo para a morada que indicar na encomenda.
                                Prazo: 2-5 dias úteis para Portugal Continental.
                            </p>
                        </div>

                        <div className="mt-4 grid gap-3 sm:grid-cols-2">
                            <div className="bg-gray-50 rounded-lg p-4 text-center">
                                <p className="text-xs text-gray-500 mb-1">Compras até 49,99€</p>
                                <p className="text-xl font-bold text-gray-900">4,50€</p>
                            </div>
                            <div className="bg-green-50 rounded-lg p-4 text-center">
                                <p className="text-xs text-gray-500 mb-1">Compras +50€</p>
                                <p className="text-xl font-bold text-green-700">Grátis</p>
                            </div>
                        </div>

                        <div className="mt-4 text-gray-600 leading-relaxed space-y-3">
                            <p className="text-sm text-gray-500">
                                <strong className="text-gray-700">Açores e Madeira:</strong> contacte-nos para informações sobre envios para as ilhas.
                            </p>
                            <p>
                                Depois de enviarmos, recebe um código de tracking no seu email
                                para acompanhar a encomenda.
                            </p>
                        </div>
                    </section>

                    {/* 4 */}
                    <section>
                        <h2 className="text-lg font-semibold text-gray-900 mb-3">
                            <span className="text-blue-600 mr-2">4.</span>
                            Como pagar
                        </h2>
                        <div className="text-gray-600 leading-relaxed space-y-3">
                            <p>
                                Depois de escolher os artigos, clique em "Ver Carrinho" para finalizar.
                                Preencha os dados com atenção, especialmente a morada de entrega.
                            </p>
                        </div>

                        <p className="font-medium text-gray-900 mt-4 mb-3 text-sm">Pode pagar com:</p>
                        <div className="grid gap-3 sm:grid-cols-2">
                            <div className="border border-gray-200 rounded-lg p-4">
                                <h4 className="font-medium text-gray-900 mb-1.5 text-sm">Multibanco</h4>
                                <p className="text-sm text-gray-500">
                                    São emitidas referências de pagamento para usar no Multibanco
                                    ou Home-banking (Pagamento de Serviços).
                                </p>
                            </div>
                            <div className="border border-gray-200 rounded-lg p-4">
                                <h4 className="font-medium text-gray-900 mb-1.5 text-sm">MB Way</h4>
                                <p className="text-sm text-gray-500">
                                    Introduza o seu número MB Way e confirme o pedido de pagamento na app.
                                </p>
                            </div>
                        </div>
                        <p className="text-sm text-gray-500 mt-3">
                            Todos os preços estão em euros (€).
                        </p>
                    </section>

                    {/* 5 */}
                    <section>
                        <h2 className="text-lg font-semibold text-gray-900 mb-3">
                            <span className="text-blue-600 mr-2">5.</span>
                            Devoluções
                        </h2>
                        <div className="text-gray-600 leading-relaxed space-y-3">
                            <p>
                                Depois de receber a encomenda, tem <strong className="text-gray-900">14 dias</strong> para devolver
                                qualquer artigo.
                            </p>
                        </div>

                        <p className="font-medium text-gray-900 mt-4 mb-3 text-sm">Para devolver, basta garantir que:</p>
                        <ul className="space-y-2 text-sm text-gray-600">
                            <li className="flex items-start gap-2">
                                <span className="text-blue-600 font-medium shrink-0">a)</span>
                                <span>Os artigos estão em bom estado e devidamente embalados</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-blue-600 font-medium shrink-0">b)</span>
                                <span>Inclui a cópia da fatura e a etiqueta no artigo</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-blue-600 font-medium shrink-0">c)</span>
                                <span>Se o artigo estava em promoção, reembolsamos o valor que realmente pagou</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-blue-600 font-medium shrink-0">d)</span>
                                <span>Os portes de devolução são por sua conta (exceto quando a responsabilidade é nossa)</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-blue-600 font-medium shrink-0">e)</span>
                                <span>Envia os artigos no prazo de 14 dias após receber a encomenda</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-blue-600 font-medium shrink-0">f)</span>
                                <span>Reembolsamos em até 14 dias após recebermos o pedido de devolução</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-blue-600 font-medium shrink-0">g)</span>
                                <span>Se faltar algum componente ou o artigo não estiver nas mesmas condições, não poderemos reembolsar</span>
                            </li>
                        </ul>

                        <div className="mt-4 bg-gray-50 rounded-lg p-4">
                            <p className="text-sm font-medium text-gray-700 mb-1">Morada para devoluções</p>
                            <p className="text-sm text-gray-500">
                                Kid to Kid Braga · Rua do Raio, 9 · 4710-926 Braga
                            </p>
                        </div>
                    </section>

                    {/* 6 */}
                    <section>
                        <h2 className="text-lg font-semibold text-gray-900 mb-3">
                            <span className="text-blue-600 mr-2">6.</span>
                            Garantia
                        </h2>
                        <p className="text-gray-600 leading-relaxed">
                            Os procedimentos de garantia variam consoante as marcas e são enviados junto
                            dos produtos. <strong className="text-gray-900">Guarde sempre a fatura durante todo o período de garantia.</strong>
                        </p>
                    </section>

                    {/* 7 */}
                    <section>
                        <h2 className="text-lg font-semibold text-gray-900 mb-3">
                            <span className="text-blue-600 mr-2">7.</span>
                            Alterações
                        </h2>
                        <p className="text-gray-600 leading-relaxed">
                            Podemos atualizar o site a qualquer momento — seja em produtos, preços
                            ou condições.
                        </p>
                    </section>

                    {/* 8 */}
                    <section>
                        <h2 className="text-lg font-semibold text-gray-900 mb-3">
                            <span className="text-blue-600 mr-2">8.</span>
                            Responsabilidade
                        </h2>
                        <div className="text-gray-600 leading-relaxed space-y-3">
                            <p>
                                Todos os nossos artigos cumprem a legislação portuguesa para venda
                                de artigos novos e em segunda mão.
                            </p>
                            <p>
                                Não somos responsáveis por problemas técnicos que possam impedir
                                temporariamente o acesso ao site, mas fazemos tudo para que funcione sempre bem.
                            </p>
                        </div>
                    </section>

                    {/* 9 */}
                    <section>
                        <h2 className="text-lg font-semibold text-gray-900 mb-3">
                            <span className="text-blue-600 mr-2">9.</span>
                            Privacidade e Proteção de Dados
                        </h2>
                        <div className="text-gray-600 leading-relaxed space-y-3">
                            <p>
                                Os seus dados são tratados com todo o cuidado, ao abrigo do RGPD.
                                Usamos as informações apenas para processar encomendas, comunicar consigo
                                e melhorar a sua experiência.
                            </p>
                            <p>
                                Tem sempre o direito de aceder e corrigir os seus dados.
                            </p>
                        </div>
                        <Link
                            to="/politica-de-privacidade"
                            className="inline-flex items-center gap-1.5 text-sm text-blue-600 hover:underline mt-2"
                        >
                            Política de Privacidade completa
                            <ExternalLink className="h-3.5 w-3.5" />
                        </Link>
                    </section>

                    {/* 10 */}
                    <section>
                        <h2 className="text-lg font-semibold text-gray-900 mb-3">
                            <span className="text-blue-600 mr-2">10.</span>
                            Âmbito
                        </h2>
                        <p className="text-gray-600 leading-relaxed">
                            Estas condições aplicam-se a todos os produtos da loja online,
                            dentro do limite de stock disponível.
                        </p>
                    </section>

                    {/* 11 */}
                    <section>
                        <h2 className="text-lg font-semibold text-gray-900 mb-3">
                            <span className="text-blue-600 mr-2">11.</span>
                            Resolução de Conflitos
                        </h2>
                        <p className="text-gray-600 leading-relaxed mb-3">
                            Se tiver algum problema, pode recorrer à Plataforma Europeia de
                            Resolução de Litígios.
                        </p>
                        <a
                            href="https://ec.europa.eu/consumers/odr"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 text-sm text-blue-600 hover:underline"
                        >
                            Plataforma Europeia de Resolução de Litígios
                            <ExternalLink className="h-3.5 w-3.5" />
                        </a>
                    </section>

                    {/* 12 */}
                    <section>
                        <h2 className="text-lg font-semibold text-gray-900 mb-3">
                            <span className="text-blue-600 mr-2">12.</span>
                            Livro de Reclamações
                        </h2>
                        <p className="text-gray-600 leading-relaxed mb-3">
                            Conforme a lei, disponibilizamos o livro de reclamações eletrónico.
                        </p>
                        <a
                            href="https://www.livroreclamacoes.pt"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 text-sm text-blue-600 hover:underline"
                        >
                            Aceder ao Livro de Reclamações
                            <ExternalLink className="h-3.5 w-3.5" />
                        </a>
                    </section>
                </div>

                {/* Contactos */}
                <div className="mt-12 pt-10 border-t border-gray-200">
                    <h2 className="text-lg font-semibold text-gray-900 mb-2">Precisa de ajuda?</h2>
                    <p className="text-gray-500 mb-6 text-sm">
                        Estamos disponíveis de segunda a sábado, das 10h às 19h.
                    </p>
                    <div className="grid gap-4 sm:grid-cols-3">
                        <div className="flex items-center gap-3">
                            <Phone className="h-4 w-4 text-gray-400" />
                            <div>
                                <p className="text-xs text-gray-400">Telefone</p>
                                <a href="tel:+351253215379" className="text-sm text-gray-700 hover:text-blue-600">
                                    +351 253 215 379
                                </a>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <Mail className="h-4 w-4 text-gray-400" />
                            <div>
                                <p className="text-xs text-gray-400">Email</p>
                                <a href="mailto:braga@kidtokid.pt" className="text-sm text-gray-700 hover:text-blue-600">
                                    braga@kidtokid.pt
                                </a>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <MapPin className="h-4 w-4 text-gray-400" />
                            <div>
                                <p className="text-xs text-gray-400">Morada</p>
                                <p className="text-sm text-gray-700">Rua do Raio, 9, Braga</p>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    )
}

import Header from "../components/Header";
import Footer from "../components/Footer";
import { Phone, Mail, MapPin, Clock, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const Contact = () => {
  const handleWhatsApp = () => {
    window.open("https://wa.me/5544984292510", "_blank");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-yellow-50">
      <Header onCartClick={() => {}} />

      <main className="container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">
            Entre em Contato
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Estamos aqui para atender você! Entre em contato conosco através dos
            canais abaixo ou faça sua reserva.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Informações de Contato */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Phone className="text-orange-500" size={24} />
                  <span>Telefone / WhatsApp</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-lg font-semibold text-gray-800 mb-2">
                  (44) 9 8429-2510
                </p>
                <p className="text-gray-600 mb-4">
                  Atendimento para pedidos e reservas. Resposta mais rápida pelo
                  WhatsApp!
                </p>
                <Button
                  onClick={handleWhatsApp}
                  className="bg-green-500 hover:bg-green-600"
                >
                  <MessageCircle className="mr-2" size={16} />
                  Chamar no WhatsApp
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Mail className="text-orange-500" size={24} />
                  <span>E-mail</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-lg font-semibold text-gray-800 mb-2">
                  contato@hoshinopratoperfeito.com
                </p>
                <p className="text-gray-600">
                  Para dúvidas, sugestões ou parcerias comerciais.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Clock className="text-orange-500" size={24} />
                  <span>Horário de Funcionamento</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="font-semibold">Domingo:</span>
                    <span className="text-green-600 font-semibold">
                      11h às 15h
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-semibold">Segunda a Sábado:</span>
                    <span className="text-orange-600">Apenas Reservas</span>
                  </div>
                </div>
                <p className="text-sm text-gray-600 mt-4">
                  💡 Durante a semana, aceitamos encomendas para eventos e
                  ocasiões especiais.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <MapPin className="text-orange-500" size={24} />
                  <span>Localização & Entrega</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">
                  Atendemos com <strong>delivery</strong> e{" "}
                  <strong>retirada no local</strong>.
                </p>
                <div className="bg-orange-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-700">
                    📍 <strong>Área de Entrega:</strong> Consulte
                    disponibilidade para sua região
                  </p>
                  <p className="text-sm text-gray-700 mt-1">
                    🏪 <strong>Retirada:</strong> Endereço informado no momento
                    do pedido
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Formulário de Contato */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Envie sua Mensagem</CardTitle>
              </CardHeader>
              <CardContent>
                <form className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Seu Nome
                    </label>
                    <Input placeholder="Digite seu nome completo" />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      E-mail
                    </label>
                    <Input type="email" placeholder="seu@email.com" />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Telefone / WhatsApp
                    </label>
                    <Input placeholder="(11) 99999-9999" />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Assunto
                    </label>
                    <Input placeholder="Qual o motivo do contato?" />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Mensagem
                    </label>
                    <Textarea
                      placeholder="Descreva sua dúvida, sugestão ou pedido..."
                      className="min-h-[120px]"
                    />
                  </div>

                  <Button className="w-full bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600">
                    Enviar Mensagem
                  </Button>

                  <p className="text-sm text-gray-600 text-center">
                    Ou entre em contato diretamente pelo WhatsApp para resposta
                    mais rápida!
                  </p>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Contact;

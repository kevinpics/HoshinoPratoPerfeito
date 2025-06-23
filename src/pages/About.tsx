import Header from "../components/Header";
import Footer from "../components/Footer";
import { Clock, MapPin, Phone, Mail, Heart, Award } from "lucide-react";

const About = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-yellow-50">
      <Header onCartClick={() => {}} />

      <main className="container mx-auto px-4 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="w-25 h-25 rounded-full flex items-center justify-center mx-auto mb-6">
            <img
              src="https://awicytvarfwydeebjivk.supabase.co/storage/v1/object/public/hoshino/Site/LogoPreta.png"
              alt="Logo"
              className="w-25 h-25 rounded-full"
            />{" "}
          </div>
          <h1 className="text-4xl font-bold text-gray-800 mb-4">
            Sobre o Hoshino
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Paixão pelo Assados perfeito desde 2020. Cada prato é preparado com
            carinho e ingredientes selecionados para proporcionar a melhor
            experiência gastronômica.
          </p>
        </div>

        {/* Nossa História */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
          <div>
            <h2 className="text-3xl font-bold text-gray-800 mb-6">
              Nossa História
            </h2>
            <div className="space-y-4 text-gray-600">
              <p>
                O Hoshino nasceu do sonho de criar o frango assado perfeito.
                Começamos como uma pequena operação familiar, focada na
                qualidade e no sabor autêntico que só receitas tradicionais
                podem oferecer.
              </p>
              <p>
                Hoje, somos conhecidos pela consistência, qualidade e pelo
                atendimento caloroso que faz nossos clientes se sentirem em
                casa. Cada frango é temperado com nossa mistura secreta de
                especiarias e assado lentamente para garantir a textura e sabor
                únicos.
              </p>
              <p>
                Nossa missão é simples: servir os melhores Assados da região,
                preparado com ingredientes frescos e muito amor.
              </p>
            </div>
          </div>

          <div className="bg-white rounded-lg p-8 shadow-lg">
            <h3 className="text-2xl font-bold text-gray-800 mb-6">
              Nossos Valores
            </h3>
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <Heart className="text-orange-500 mt-1" size={20} />
                <div>
                  <h4 className="font-semibold text-gray-800">Paixão</h4>
                  <p className="text-gray-600">Amor em cada prato preparado</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <Award className="text-orange-500 mt-1" size={20} />
                <div>
                  <h4 className="font-semibold text-gray-800">Qualidade</h4>
                  <p className="text-gray-600">
                    Ingredientes selecionados e frescos
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <Clock className="text-orange-500 mt-1" size={20} />
                <div>
                  <h4 className="font-semibold text-gray-800">Tradição</h4>
                  <p className="text-gray-600">
                    Receitas familiares preservadas
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Informações de Funcionamento */}
        <div className="bg-white rounded-lg p-8 shadow-lg">
          <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center">
            Como Funcionamos
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock className="text-orange-500" size={24} />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">
                Horário Especial
              </h3>
              <p className="text-gray-600">
                Atendemos aos domingos das 11h às 15h. Durante a semana,
                aceitamos reservas para eventos especiais.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <MapPin className="text-orange-500" size={24} />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">
                Delivery & Retirada
              </h3>
              <p className="text-gray-600">
                Oferecemos delivery na região e opção de retirada no local.
                Pagamento facilitado na entrega ou retirada.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Phone className="text-orange-500" size={24} />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">
                Atendimento
              </h3>
              <p className="text-gray-600">
                Nossa equipe está sempre pronta para atender você com carinho e
                garantir a melhor experiência possível.
              </p>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default About;

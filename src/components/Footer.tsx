const Footer = () => {
  return (
    <footer className="bg-gray-800 text-white py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-xl font-bold mb-4">Hoshino Prato Perfeito</h3>
            <p className="text-gray-300">
              Assados artesanais preparado com carinho e ingredientes
              selecionados. O sabor que você procura está aqui!
            </p>
          </div>

          <div>
            <h4 className="text-lg font-semibold mb-4">
              Horário de Funcionamento
            </h4>
            <div className="space-y-2 text-gray-300">
              <p>Domingo: 11h às 15h</p>
              <p>Segunda a Sábado: Reservas</p>
              <p className="text-orange-400 font-medium">
                📞 Faça sua reserva durante a semana!
              </p>
            </div>
          </div>

          <div>
            <h4 className="text-lg font-semibold mb-4">Contato</h4>
            <div className="space-y-2 text-gray-300">
              <p>📱 (44) 9 8429-2510</p>
              <p>📧 contato@hoshinopratoperfeito.com</p>
              <p>📍 Delivery e Retirada</p>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-400">
          <p>
            &copy; 2025 Hoshino Prato Perfeito. Todos os direitos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

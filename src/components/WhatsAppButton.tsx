import { MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

const WhatsAppButton = () => {
  const phoneNumber = "5544984292510";
  const message =
    "Olá! Gostaria de fazer um pedido ou tirar uma dúvida sobre o cardápio.";

  const handleWhatsAppClick = () => {
    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodedMessage}`;
    window.open(whatsappUrl, "_blank");
  };

  return (
    <Button
      onClick={handleWhatsAppClick}
      className="fixed bottom-6 right-6 z-50 bg-green-500 hover:bg-green-600 text-white rounded-full p-4 shadow-lg animate-pulse"
      size="lg"
    >
      <MessageCircle className="h-6 w-6" />
      <span className="ml-2 hidden sm:inline">WhatsApp</span>
    </Button>
  );
};

export default WhatsAppButton;

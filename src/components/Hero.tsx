import { Button } from "@/components/ui/button";
import { Clock, MapPin } from "lucide-react";

const Hero = () => {
  return (
    <section
      className="text-white py-20 min-h-screen flex items-center"
      style={{
        backgroundImage:
          "url(https://awicytvarfwydeebjivk.supabase.co/storage/v1/object/public/hoshino/Site/banner.png)",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div className="container mx-auto px-4">
        <div className="max-w-7xl mx-auto text-center">
          <div className="flex gap-6 justify-center">
            <div className="absolute bottom-10 right-10 flex gap-6">
              <div className="flex flex-col gap-4">
                <Button
                  size="lg"
                  className="bg-white text-orange-600 hover:bg-orange-50 hover:scale-105 transition-all px-8 py-4 text-lg"
                >
                  Ver Cardápio
                </Button>
                <div className="relative group">
                  <Button
                    size="lg"
                    variant="outline"
                    className="bg-white text-orange-600 hover:bg-orange-50 hover:scale-105 transition-all px-8 py-4 text-lg"
                  >
                    Fazer Reserva
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;

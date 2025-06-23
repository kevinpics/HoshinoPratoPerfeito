
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface DeliveryZoneSelectorProps {
  selectedZone: string;
  onZoneChange: (zone: any) => void;
  deliveryType: string;
}

const DeliveryZoneSelector = ({ selectedZone, onZoneChange, deliveryType }: DeliveryZoneSelectorProps) => {
  const { data: zones = [] } = useQuery({
    queryKey: ['delivery-zones'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('delivery_zones')
        .select('*')
        .eq('is_active', true)
        .order('name');

      if (error) throw error;
      return data;
    }
  });

  if (deliveryType !== 'delivery') {
    return null;
  }

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium">Região de Entrega *</label>
      <Select value={selectedZone} onValueChange={(value) => {
        const zone = zones.find(z => z.id === value);
        onZoneChange(zone);
      }}>
        <SelectTrigger>
          <SelectValue placeholder="Selecione sua região" />
        </SelectTrigger>
        <SelectContent>
          {zones.map((zone) => (
            <SelectItem key={zone.id} value={zone.id}>
              {zone.name} - R$ {Number(zone.fee).toFixed(2)} 
              (≈ {zone.estimated_time} min)
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default DeliveryZoneSelector;

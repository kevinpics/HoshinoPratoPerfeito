import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Clock,
  User,
  MapPin,
  Phone,
  ChefHat,
  CheckCircle,
  Package,
  AlertCircle,
  Zap,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// Configurações do restaurante (pode ser movido para um arquivo de config)
const RESTAURANT_CONFIG = {
  name: "Hoshino Prato Perfeito",
  address: "Rua Tiradentes 133, Jardim Panorama, Sarandi",
  phone: "(44) 9 8429-2510",
  cnpj: "12.345.678/0001-90",
  logo: "🍽️", // Pode ser substituído por uma imagem base64
};

// Função principal de impressão
const printComanda = (order: any, type: "kitchen" | "customer") => {
  const isKitchen = type === "kitchen";
  const title = isKitchen ? "COMANDA DE COZINHA" : "COMPROVANTE DO CLIENTE";

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    const dateStr = date.toLocaleDateString("pt-BR");
    const timeStr = date.toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
    });
    return { dateStr, timeStr };
  };

  const { dateStr, timeStr } = formatDateTime(order.created_at);
  const orderNumber = order.id.slice(-8).toUpperCase();

  // Calcular subtotal dos itens
  const subtotal = order.order_items.reduce(
    (sum: number, item: any) =>
      sum + Number(item.product_price) * item.quantity,
    0
  );

  const orderDetails = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>${title} #${orderNumber}</title>
    <style>
        .datetime {
            display: flex;
            justify-content: space-between;
            font-size: 11px;
            color: #666;
        }
        @media print {
            @page {
                margin: 10mm;
                size: 80mm auto;
            }
            body {
                margin: 0;
                padding: 0;
            }
        }
    </style>
</head>
<body>
    <div class="header">
        <div style="font-size: 24px; margin-bottom: 5px;">${
          RESTAURANT_CONFIG.logo
        }</div>
        <div class="restaurant-name">${RESTAURANT_CONFIG.name}</div>
        <div style="font-size: 10px; margin-bottom: 3px;">${
          RESTAURANT_CONFIG.address
        }</div>
        <div style="font-size: 10px; margin-bottom: 8px;">📞 ${
          RESTAURANT_CONFIG.phone
        }</div>
        <div class="datetime">
            <span>📅 ${dateStr}</span>
            <span>🕐 ${timeStr}</span>
        </div>
    </div>
    <div class="customer-info">
        <h3>Informações do Cliente</h3>
        <p>Nome: ${order.customer_name}</p>
        <p>Telefone: ${order.customer_phone}</p>
        ${
          order.customer_address
            ? `<p>Endereço: ${order.customer_address}</p>`
            : ""
        }
    </div>
    <div class="order-items">
        <h3>Itens do Pedido</h3>
        <ul>
            ${order.order_items
              .map(
                (item: any) =>
                  `<li>${item.quantity}x ${item.product_name} - R$ ${(
                    Number(item.product_price) * item.quantity
                  )
                    .toFixed(2)
                    .replace(".", ",")}
                    ${
                      item.extras && item.extras.length > 0
                        ? `<br><small>Acompanhamentos: ${item.extras
                            .map((extra: any) => extra.name)
                            .join(", ")}</small>`
                        : ""
                    }
                  </li>`
              )
              .join("")}
        </ul>
        <p><strong>Total: R$ ${subtotal
          .toFixed(2)
          .replace(".", ",")}</strong></p>
    </div>
    <script>
        window.onload = function() {
            setTimeout(function() {
                window.print();
            }, 500);
        }
    </script>
</body>
</html>
  `;

  const printWindow = window.open("", "_blank");
  if (printWindow) {
    printWindow.document.write(orderDetails);
    printWindow.document.close();
    printWindow.onafterprint = function () {
      printWindow.close();
    };
  }
};

// Função para imprimir comanda da cozinha
const printOrder = (order: any) => {
  printComanda(order, "kitchen");
};

// Função para imprimir comprovante do cliente
const printCustomerReceipt = (order: any) => {
  printComanda(order, "customer");
};

const RealtimeOrders = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedOrder, setSelectedOrder] = useState<string | null>(null);

  const { data: activeOrders = [] } = useQuery({
    queryKey: ["realtime-orders"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("orders")
        .select(
          `
          *,
          order_items (
            id,
            product_name,
            quantity,
            product_price,
            extras
          )
        `
        )
        .in("status", ["received", "preparing", "ready"])
        .order("created_at", { ascending: true });

      if (error) throw error;
      return data;
    },
    refetchInterval: 5000, // Atualiza a cada 5 segundos
  });

  useEffect(() => {
    const channel = supabase
      .channel("orders-realtime")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "orders",
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ["realtime-orders"] });
          queryClient.invalidateQueries({ queryKey: ["admin-orders"] });
          queryClient.invalidateQueries({ queryKey: ["admin-stats"] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase
        .from("orders")
        .update({ status, updated_at: new Date().toISOString() })
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      toast({
        title: "Status atualizado",
        description: "Status do pedido alterado com sucesso!",
      });
    },
  });

  const getStatusColor = (status: string) => {
    const colors = {
      received: "bg-blue-500",
      preparing: "bg-yellow-500",
      ready: "bg-green-500",
    };
    return colors[status as keyof typeof colors] || "bg-gray-500";
  };

  const getStatusLabel = (status: string) => {
    const labels = {
      received: "Recebido",
      preparing: "Preparando",
      ready: "Pronto",
    };
    return labels[status as keyof typeof labels] || status;
  };

  const getStatusIcon = (status: string) => {
    const icons = {
      received: Package,
      preparing: ChefHat,
      ready: CheckCircle,
    };
    return icons[status as keyof typeof icons] || AlertCircle;
  };

  const getStatusBorderColor = (status: string) => {
    const colors = {
      received: "border-l-blue-500",
      preparing: "border-l-yellow-500",
      ready: "border-l-green-500",
    };
    return colors[status as keyof typeof colors] || "border-l-gray-500";
  };

  const getStatusBgColor = (status: string) => {
    const colors = {
      received: "bg-blue-50",
      preparing: "bg-yellow-50",
      ready: "bg-green-50",
    };
    return colors[status as keyof typeof colors] || "bg-gray-50";
  };

  const getTimeSinceOrder = (createdAt: string) => {
    const now = new Date();
    const orderTime = new Date(createdAt);
    const diffMinutes = Math.floor(
      (now.getTime() - orderTime.getTime()) / 60000
    );

    if (diffMinutes < 60) {
      return `${diffMinutes}m`;
    } else {
      const hours = Math.floor(diffMinutes / 60);
      const minutes = diffMinutes % 60;
      return `${hours}h ${minutes}m`;
    }
  };

  const getUrgencyLevel = (createdAt: string) => {
    const now = new Date();
    const orderTime = new Date(createdAt);
    const diffMinutes = Math.floor(
      (now.getTime() - orderTime.getTime()) / 60000
    );

    if (diffMinutes > 45) return "urgent";
    if (diffMinutes > 30) return "warning";
    return "normal";
  };

  const getUrgencyStyles = (urgency: string) => {
    switch (urgency) {
      case "urgent":
        return "animate-pulse border-red-500 bg-red-50";
      case "warning":
        return "border-orange-500 bg-orange-50";
      default:
        return "";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      {/* Header melhorado */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-orange-100 rounded-xl">
              <Zap className="h-6 w-6 text-orange-600" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-slate-800">
                Pedidos em Tempo Real
              </h3>
              <p className="text-slate-600">
                Acompanhe o status dos pedidos ativos
              </p>
            </div>
          </div>

          {/* Contador de pedidos */}
          <div className="flex items-center gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-slate-800">
                {activeOrders.length}
              </div>
              <div className="text-sm text-slate-600">Pedidos Ativos</div>
            </div>
            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
          </div>
        </div>
      </div>

      {/* Filtros de status */}
      <div className="mb-6 flex gap-3">
        <div className="flex items-center gap-2 px-3 py-2 bg-blue-100 rounded-lg">
          <Package className="h-4 w-4 text-blue-600" />
          <span className="text-sm font-medium text-blue-800">
            {activeOrders.filter((o) => o.status === "received").length}{" "}
            Recebidos
          </span>
        </div>
        <div className="flex items-center gap-2 px-3 py-2 bg-yellow-100 rounded-lg">
          <ChefHat className="h-4 w-4 text-yellow-600" />
          <span className="text-sm font-medium text-yellow-800">
            {activeOrders.filter((o) => o.status === "preparing").length}{" "}
            Preparando
          </span>
        </div>
        <div className="flex items-center gap-2 px-3 py-2 bg-green-100 rounded-lg">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <span className="text-sm font-medium text-green-800">
            {activeOrders.filter((o) => o.status === "ready").length} Prontos
          </span>
        </div>
      </div>

      <div className="grid gap-6">
        {activeOrders.map((order) => {
          const StatusIcon = getStatusIcon(order.status);
          const urgency = getUrgencyLevel(order.created_at);

          return (
            <Card
              key={order.id}
              className={`
                border-l-4 ${getStatusBorderColor(order.status)} 
                shadow-lg hover:shadow-xl transition-all duration-300 
                ${getUrgencyStyles(urgency)}
                bg-white/90 backdrop-blur-sm
              `}
            >
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-3">
                    <div
                      className={`p-2 rounded-full ${getStatusBgColor(
                        order.status
                      )}`}
                    >
                      <StatusIcon className="h-5 w-5 text-slate-700" />
                    </div>
                    <div>
                      <Badge
                        className={`${getStatusColor(
                          order.status
                        )} text-white font-medium`}
                      >
                        {getStatusLabel(order.status)}
                      </Badge>
                      <div className="flex items-center gap-1 text-sm text-slate-500 mt-1">
                        <Clock className="h-3 w-3" />
                        <span>{getTimeSinceOrder(order.created_at)}</span>
                        {urgency === "urgent" && (
                          <span className="ml-2 text-red-600 font-medium animate-pulse">
                            🚨 URGENTE
                          </span>
                        )}
                        {urgency === "warning" && (
                          <span className="ml-2 text-orange-600 font-medium">
                            ⚠️ ATENÇÃO
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-slate-800">
                      R${" "}
                      {Number(order.total_amount).toFixed(2).replace(".", ",")}
                    </div>
                    <div className="text-xs text-slate-500">
                      #{order.id.slice(-8)}
                    </div>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Informações do cliente */}
                <div className="bg-slate-50 p-4 rounded-lg space-y-2">
                  <div className="flex items-center gap-2 text-slate-700">
                    <User className="h-4 w-4 text-slate-500" />
                    <span className="font-medium">{order.customer_name}</span>
                    <div className="flex items-center gap-1 ml-auto">
                      <Phone className="h-4 w-4 text-slate-500" />
                      <span className="text-sm">{order.customer_phone}</span>
                    </div>
                  </div>

                  {order.customer_address && (
                    <div className="flex items-start gap-2 text-slate-600">
                      <MapPin className="h-4 w-4 text-slate-500 mt-0.5" />
                      <span className="text-sm">{order.customer_address}</span>
                    </div>
                  )}
                </div>

                {/* Itens do pedido */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                    <Package className="h-4 w-4" />
                    Itens do Pedido:
                  </div>
                  <div className="bg-white border border-slate-200 rounded-lg p-3">
                    {order.order_items?.map((item: any, index: number) => (
                      <div
                        key={item.id}
                        className={`flex justify-between items-center py-2 ${
                          index < order.order_items.length - 1
                            ? "border-b border-slate-100"
                            : ""
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 bg-orange-100 rounded-full flex items-center justify-center text-xs font-bold text-orange-700">
                            {item.quantity}
                          </div>
                          <span className="text-slate-700 font-medium">
                            {item.product_name}
                          </span>
                        </div>
                        <span className="text-slate-600 text-sm">
                          R${" "}
                          {(Number(item.product_price) * item.quantity)
                            .toFixed(2)
                            .replace(".", ",")}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Botões de ação */}
                <div className="flex gap-3 pt-2">
                  <Button
                    size="sm"
                    onClick={() => printOrder(order)}
                    className="bg-slate-500 hover:bg-slate-600 text-white flex items-center gap-2 flex-1"
                  >
                    <Package className="h-4 w-4" />
                    Imprimir Comanda
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => printCustomerReceipt(order)}
                    className="bg-slate-500 hover:bg-slate-600 text-white flex items-center gap-2 flex-1"
                  >
                    <Package className="h-4 w-4" />
                    Imprimir Comprovante
                  </Button>
                  {order.status === "received" && (
                    <Button
                      size="sm"
                      onClick={() =>
                        updateStatusMutation.mutate({
                          id: order.id,
                          status: "preparing",
                        })
                      }
                      className="bg-yellow-500 hover:bg-yellow-600 text-white flex items-center gap-2 flex-1"
                      disabled={updateStatusMutation.isPending}
                    >
                      <ChefHat className="h-4 w-4" />
                      Iniciar Preparo
                    </Button>
                  )}
                  {order.status === "preparing" && (
                    <Button
                      size="sm"
                      onClick={() =>
                        updateStatusMutation.mutate({
                          id: order.id,
                          status: "ready",
                        })
                      }
                      className="bg-green-500 hover:bg-green-600 text-white flex items-center gap-2 flex-1"
                      disabled={updateStatusMutation.isPending}
                    >
                      <CheckCircle className="h-4 w-4" />
                      Marcar como Pronto
                    </Button>
                  )}
                  {order.status === "ready" && (
                    <Button
                      size="sm"
                      onClick={() =>
                        updateStatusMutation.mutate({
                          id: order.id,
                          status: "delivered",
                        })
                      }
                      className="bg-slate-600 hover:bg-slate-700 text-white flex items-center gap-2 flex-1"
                      disabled={updateStatusMutation.isPending}
                    >
                      <Package className="h-4 w-4" />
                      Entregar
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}

        {activeOrders.length === 0 && (
          <Card className="shadow-lg border-0 bg-gradient-to-br from-green-50 to-emerald-50">
            <CardContent className="text-center py-12">
              <div className="space-y-4">
                <div className="text-6xl mb-4">🎉</div>
                <h3 className="text-xl font-semibold text-slate-800">
                  Nenhum pedido ativo no momento
                </h3>
                <p className="text-slate-600">
                  Todos os pedidos foram finalizados! Excelente trabalho da
                  equipe.
                </p>
                <div className="flex items-center justify-center gap-2 mt-4">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm text-green-700 font-medium">
                    Sistema funcionando perfeitamente
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default RealtimeOrders;

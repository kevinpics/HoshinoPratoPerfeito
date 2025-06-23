import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// Componentes de tabela inline
const Table = ({ children, ...props }) => (
  <table className="w-full caption-bottom text-sm" {...props}>
    {children}
  </table>
);

const TableHeader = ({ children, ...props }) => (
  <thead className="[&_tr]:border-b" {...props}>
    {children}
  </thead>
);

const TableBody = ({ children, ...props }) => (
  <tbody className="[&_tr:last-child]:border-0" {...props}>
    {children}
  </tbody>
);

const TableRow = ({ children, className = "", ...props }) => (
  <tr
    className={`border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted ${className}`}
    {...props}
  >
    {children}
  </tr>
);

const TableHead = ({ children, className = "", ...props }) => (
  <th
    className={`h-12 px-4 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0 ${className}`}
    {...props}
  >
    {children}
  </th>
);

const TableCell = ({ children, className = "", ...props }) => (
  <td
    className={`p-4 align-middle [&:has([role=checkbox])]:pr-0 ${className}`}
    {...props}
  >
    {children}
  </td>
);
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import {
  Package,
  Search,
  Filter,
  Calendar,
  User,
  Phone,
  MapPin,
  Truck,
  Store,
  Clock,
  DollarSign,
  ChefHat,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Eye,
  Download,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

const AdminOrders = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedOrder, setSelectedOrder] = useState(null);

  const { data: orders = [], isLoading } = useQuery({
    queryKey: ["admin-orders"],
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
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase
        .from("orders")
        .update({ status, updated_at: new Date().toISOString() })
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-orders"] });
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
      delivered: "bg-gray-500",
      cancelled: "bg-red-500",
    };
    return colors[status as keyof typeof colors] || "bg-gray-500";
  };

  const getStatusLabel = (status: string) => {
    const labels = {
      received: "Recebido",
      preparing: "Preparando",
      ready: "Pronto",
      delivered: "Entregue",
      cancelled: "Cancelado",
    };
    return labels[status as keyof typeof labels] || status;
  };

  const getStatusIcon = (status: string) => {
    const icons = {
      received: Package,
      preparing: ChefHat,
      ready: CheckCircle,
      delivered: Truck,
      cancelled: XCircle,
    };
    return icons[status as keyof typeof icons] || AlertTriangle;
  };

  const exportOrdersToCSV = () => {
    const headers = [
      "ID",
      "Cliente",
      "Telefone",
      "Email",
      "Endereço",
      "Data do Pedido",
      "Status",
      "Total",
    ];
    const rows = orders.map((order) => [
      order.id,
      order.customer_name,
      order.customer_phone,
      order.customer_email || "",
      order.customer_address || "",
      new Date(order.order_date).toLocaleDateString("pt-BR"),
      getStatusLabel(order.status),
      `R$ ${Number(order.total_amount).toFixed(2).replace(".", ",")}`,
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((row) => row.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "pedidos.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Filtrar pedidos
  const filteredOrders = orders.filter((order) => {
    const matchesStatus =
      statusFilter === "all" || order.status === statusFilter;
    const matchesSearch =
      searchTerm === "" ||
      order.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customer_phone.includes(searchTerm) ||
      order.id.includes(searchTerm);
    return matchesStatus && matchesSearch;
  });

  // Estatísticas dos pedidos
  const orderStats = {
    total: orders.length,
    received: orders.filter((o) => o.status === "received").length,
    preparing: orders.filter((o) => o.status === "preparing").length,
    ready: orders.filter((o) => o.status === "ready").length,
    delivered: orders.filter((o) => o.status === "delivered").length,
    cancelled: orders.filter((o) => o.status === "cancelled").length,
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-orange-500 border-t-transparent mx-auto mb-4"></div>
            <p className="text-slate-600">Carregando pedidos...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-orange-100 rounded-xl">
              <Package className="h-6 w-6 text-orange-600" />
            </div>
            <div>
              <h2 className="text-3xl font-bold text-slate-800">
                Gerenciar Pedidos
              </h2>
              <p className="text-slate-600">
                Controle total sobre todos os pedidos
              </p>
            </div>
          </div>
          <Button
            className="bg-orange-600 hover:bg-orange-700"
            onClick={exportOrdersToCSV}
          >
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
        </div>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
        <Card className="bg-slate-100 border-0">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-slate-800">
              {orderStats.total}
            </div>
            <div className="text-sm text-slate-600">Total</div>
          </CardContent>
        </Card>
        <Card className="bg-blue-50 border-0">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-700">
              {orderStats.received}
            </div>
            <div className="text-sm text-blue-600">Recebidos</div>
          </CardContent>
        </Card>
        <Card className="bg-yellow-50 border-0">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-yellow-700">
              {orderStats.preparing}
            </div>
            <div className="text-sm text-yellow-600">Preparando</div>
          </CardContent>
        </Card>
        <Card className="bg-green-50 border-0">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-700">
              {orderStats.ready}
            </div>
            <div className="text-sm text-green-600">Prontos</div>
          </CardContent>
        </Card>
        <Card className="bg-gray-50 border-0">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-gray-700">
              {orderStats.delivered}
            </div>
            <div className="text-sm text-gray-600">Entregues</div>
          </CardContent>
        </Card>
        <Card className="bg-red-50 border-0">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-red-700">
              {orderStats.cancelled}
            </div>
            <div className="text-sm text-red-600">Cancelados</div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <Card className="mb-6 shadow-lg border-0">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Buscar por nome, telefone ou ID do pedido..."
                  className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-slate-600" />
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filtrar por status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os Status</SelectItem>
                  <SelectItem value="received">Recebido</SelectItem>
                  <SelectItem value="preparing">Preparando</SelectItem>
                  <SelectItem value="ready">Pronto</SelectItem>
                  <SelectItem value="delivered">Entregue</SelectItem>
                  <SelectItem value="cancelled">Cancelado</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabela de Pedidos */}
      <Card className="shadow-lg border-0">
        <CardHeader className="bg-slate-50 border-b">
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Lista de Pedidos ({filteredOrders.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50">
                  <TableHead className="font-semibold">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      Data/Hora
                    </div>
                  </TableHead>
                  <TableHead className="font-semibold">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      Cliente
                    </div>
                  </TableHead>
                  <TableHead className="font-semibold">
                    <div className="flex items-center gap-2">
                      <Package className="h-4 w-4" />
                      Itens
                    </div>
                  </TableHead>
                  <TableHead className="font-semibold">
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4" />
                      Total
                    </div>
                  </TableHead>
                  <TableHead className="font-semibold">
                    <div className="flex items-center gap-2">
                      <Truck className="h-4 w-4" />
                      Entrega
                    </div>
                  </TableHead>
                  <TableHead className="font-semibold">Status</TableHead>
                  <TableHead className="font-semibold">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredOrders.map((order, index) => {
                  const StatusIcon = getStatusIcon(order.status);
                  return (
                    <TableRow
                      key={order.id}
                      className={index % 2 === 0 ? "bg-white" : "bg-slate-25"}
                    >
                      <TableCell>
                        <div className="space-y-1">
                          <div className="font-medium text-slate-800">
                            {new Date(order.order_date).toLocaleDateString(
                              "pt-BR"
                            )}
                          </div>
                          <div className="text-sm text-slate-500 flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {new Date(order.created_at).toLocaleTimeString(
                              "pt-BR",
                              {
                                hour: "2-digit",
                                minute: "2-digit",
                              }
                            )}
                          </div>
                          <div className="text-xs text-slate-400">
                            #{order.id.slice(-8)}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="font-medium text-slate-800 flex items-center gap-2">
                            <User className="h-3 w-3 text-slate-500" />
                            {order.customer_name}
                          </div>
                          <div className="text-sm text-slate-600 flex items-center gap-2">
                            <Phone className="h-3 w-3 text-slate-500" />
                            {order.customer_phone}
                          </div>
                          {order.customer_email && (
                            <div className="text-sm text-slate-500">
                              {order.customer_email}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1 max-w-xs">
                          {order.order_items?.slice(0, 2).map((item: any) => (
                            <div
                              key={item.id}
                              className="text-sm text-slate-700 flex items-center gap-2"
                            >
                              <div className="w-5 h-5 bg-orange-100 rounded-full flex items-center justify-center text-xs font-bold text-orange-700">
                                {item.quantity}
                              </div>
                              <span className="truncate">
                                {item.product_name}
                              </span>
                            </div>
                          ))}
                          {order.order_items?.length > 2 && (
                            <div className="text-xs text-slate-500">
                              +{order.order_items.length - 2} mais...
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="font-bold text-lg text-slate-800">
                          R${" "}
                          {Number(order.total_amount)
                            .toFixed(2)
                            .replace(".", ",")}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-2">
                          <Badge
                            variant="outline"
                            className={
                              order.delivery_type === "delivery"
                                ? "border-blue-300 text-blue-700"
                                : "border-orange-300 text-orange-700"
                            }
                          >
                            {order.delivery_type === "delivery" ? (
                              <>
                                <Truck className="h-3 w-3 mr-1" /> Entrega
                              </>
                            ) : (
                              <>
                                <Store className="h-3 w-3 mr-1" /> Retirada
                              </>
                            )}
                          </Badge>
                          {order.customer_address && (
                            <div className="text-sm text-slate-600 flex items-start gap-1 max-w-xs">
                              <MapPin className="h-3 w-3 text-slate-500 mt-0.5" />
                              <span className="truncate">
                                {order.customer_address}
                              </span>
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          className={`${getStatusColor(
                            order.status
                          )} text-white flex items-center gap-1 w-fit`}
                        >
                          <StatusIcon className="h-3 w-3" />
                          {getStatusLabel(order.status)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Select
                            value={order.status}
                            onValueChange={(status) =>
                              updateStatusMutation.mutate({
                                id: order.id,
                                status,
                              })
                            }
                            disabled={updateStatusMutation.isPending}
                          >
                            <SelectTrigger className="w-32">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="received">Recebido</SelectItem>
                              <SelectItem value="preparing">
                                Preparando
                              </SelectItem>
                              <SelectItem value="ready">Pronto</SelectItem>
                              <SelectItem value="delivered">
                                Entregue
                              </SelectItem>
                              <SelectItem value="cancelled">
                                Cancelado
                              </SelectItem>
                            </SelectContent>
                          </Select>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedOrder(order)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>

          {filteredOrders.length === 0 && (
            <div className="text-center py-12">
              <Package className="h-12 w-12 text-slate-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-slate-600 mb-2">
                Nenhum pedido encontrado
              </h3>
              <p className="text-slate-500">
                {searchTerm || statusFilter !== "all"
                  ? "Tente ajustar os filtros de busca"
                  : "Ainda não há pedidos cadastrados"}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal para exibir detalhes do pedido */}
      {selectedOrder && (
        <Dialog
          open={!!selectedOrder}
          onOpenChange={() => setSelectedOrder(null)}
        >
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader className="pb-4 border-b">
              <div className="flex items-center justify-between">
                <div>
                  <DialogTitle className="text-2xl font-bold">
                    Pedido #{selectedOrder.id.slice(0, 8)}
                  </DialogTitle>
                  <p className="text-sm text-muted-foreground mt-1">
                    {new Date(selectedOrder.created_at).toLocaleString("pt-BR")}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                      selectedOrder.status === "completed"
                        ? "bg-green-100 text-green-800"
                        : selectedOrder.status === "cancelled"
                        ? "bg-red-100 text-red-800"
                        : selectedOrder.status === "in_progress"
                        ? "bg-blue-100 text-blue-800"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {getStatusLabel(selectedOrder.status)}
                  </span>
                </div>
              </div>
            </DialogHeader>

            <div className="space-y-6 py-4">
              {/* Informações do Cliente */}
              <div className="space-y-3">
                <h3 className="text-lg font-semibold">
                  👤 Informações do Cliente
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-muted/30 rounded-lg">
                  <div className="space-y-1">
                    <span className="text-sm font-medium text-muted-foreground">
                      Nome
                    </span>
                    <p className="font-medium">{selectedOrder.customer_name}</p>
                  </div>
                  <div className="space-y-1">
                    <span className="text-sm font-medium text-muted-foreground">
                      Telefone
                    </span>
                    <p className="font-medium">
                      {selectedOrder.customer_phone}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <span className="text-sm font-medium text-muted-foreground">
                      Email
                    </span>
                    <p className="font-medium">
                      {selectedOrder.customer_email || "Não informado"}
                    </p>
                  </div>
                  <div className="space-y-1 md:col-span-2">
                    <span className="text-sm font-medium text-muted-foreground">
                      Endereço
                    </span>
                    <p className="font-medium">
                      {selectedOrder.customer_address || "Não informado"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Detalhes do Pedido */}
              <div className="space-y-3">
                <h3 className="text-lg font-semibold">📦 Detalhes do Pedido</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-muted/30 rounded-lg">
                  <div className="space-y-1">
                    <span className="text-sm font-medium text-muted-foreground">
                      Método de Pagamento
                    </span>
                    <p className="font-medium">
                      {selectedOrder.payment_method}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <span className="text-sm font-medium text-muted-foreground">
                      Tipo de Entrega
                    </span>
                    <p className="font-medium">{selectedOrder.delivery_type}</p>
                  </div>
                  <div className="space-y-1">
                    <span className="text-sm font-medium text-muted-foreground">
                      Tempo Estimado
                    </span>
                    <p className="font-medium">
                      {selectedOrder.estimated_time || 45} minutos
                    </p>
                  </div>
                  <div className="space-y-1">
                    <span className="text-sm font-medium text-muted-foreground">
                      Data do Pedido
                    </span>
                    <p className="font-medium">
                      {new Date(selectedOrder.order_date).toLocaleDateString(
                        "pt-BR"
                      )}
                    </p>
                  </div>
                  {selectedOrder.coupon_code && (
                    <div className="space-y-1">
                      <span className="text-sm font-medium text-muted-foreground">
                        Cupom
                      </span>
                      <p className="font-medium text-green-600">
                        {selectedOrder.coupon_code}
                      </p>
                    </div>
                  )}
                  {selectedOrder.needs_change && (
                    <div className="space-y-1">
                      <span className="text-sm font-medium text-muted-foreground">
                        Troco para
                      </span>
                      <p className="font-medium">
                        R${" "}
                        {Number(selectedOrder.change_amount || 0)
                          .toFixed(2)
                          .replace(".", ",")}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Itens do Pedido */}
              <div className="space-y-3">
                <h3 className="text-lg font-semibold">🛍️ Itens do Pedido</h3>
                <div className="space-y-2">
                  {selectedOrder.order_items.map(
                    (
                      item: {
                        id: string;
                        product_name: string;
                        quantity: number;
                        product_price: number;
                        extras?: { id: string; name: string; price: number }[];
                      },
                      index: number
                    ) => (
                      <div
                        key={item.id || index}
                        className="flex flex-col gap-2 p-3 bg-muted/30 rounded-lg"
                      >
                        <div className="flex justify-between items-center">
                          <div className="flex-1">
                            <p className="font-medium">{item.product_name}</p>
                            <p className="text-sm text-muted-foreground">
                              Quantidade: {item.quantity}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-medium">
                              R${" "}
                              {Number(item.product_price * item.quantity)
                                .toFixed(2)
                                .replace(".", ",")}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              R${" "}
                              {Number(item.product_price)
                                .toFixed(2)
                                .replace(".", ",")}{" "}
                              cada
                            </p>
                          </div>
                        </div>
                        {item.extras &&
                          Array.isArray(item.extras) &&
                          item.extras.length > 0 && (
                            <div className="pl-4 border-l-2 border-muted-foreground">
                              <p className="text-sm font-medium text-muted-foreground">
                                Acompanhamentos:
                              </p>
                              <ul className="list-disc pl-4 text-sm text-muted-foreground">
                                {item.extras.map((extra) => (
                                  <li key={extra.id}>
                                    {extra.name} - R$
                                    {Number(extra.price)
                                      .toFixed(2)
                                      .replace(".", ",")}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                      </div>
                    )
                  )}
                </div>
              </div>

              {/* Resumo Financeiro */}
              <div className="space-y-3">
                <h3 className="text-lg font-semibold">🧮 Resumo Financeiro</h3>
                <div className="p-4 bg-muted/30 rounded-lg space-y-2">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span>
                      R${" "}
                      {(
                        Number(selectedOrder.total_amount) -
                        Number(selectedOrder.delivery_fee || 0) +
                        Number(selectedOrder.discount_amount || 0)
                      )
                        .toFixed(2)
                        .replace(".", ",")}
                    </span>
                  </div>
                  {selectedOrder.discount_amount > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Desconto:</span>
                      <span>
                        - R${" "}
                        {Number(selectedOrder.discount_amount)
                          .toFixed(2)
                          .replace(".", ",")}
                      </span>
                    </div>
                  )}
                  {selectedOrder.delivery_fee > 0 && (
                    <div className="flex justify-between">
                      <span>Taxa de Entrega:</span>
                      <span>
                        R${" "}
                        {Number(selectedOrder.delivery_fee)
                          .toFixed(2)
                          .replace(".", ",")}
                      </span>
                    </div>
                  )}
                  <hr className="border-t" />
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total:</span>
                    <span>
                      R${" "}
                      {Number(selectedOrder.total_amount)
                        .toFixed(2)
                        .replace(".", ",")}
                    </span>
                  </div>
                </div>
              </div>

              {/* Observações */}
              {selectedOrder.notes && (
                <div className="space-y-3">
                  <h3 className="text-lg font-semibold">💬 Observações</h3>
                  <div className="p-4 bg-muted/30 rounded-lg">
                    <p className="text-sm">{selectedOrder.notes}</p>
                  </div>
                </div>
              )}
            </div>

            <DialogFooter className="pt-4 border-t">
              <div className="flex gap-2 w-full sm:w-auto">
                <Button
                  variant="outline"
                  onClick={() => setSelectedOrder(null)}
                  className="flex-1 sm:flex-none"
                >
                  Fechar
                </Button>
                <Button
                  onClick={() => {
                    // Função para imprimir ou exportar o pedido
                    window.print();
                  }}
                  className="flex-1 sm:flex-none"
                >
                  🖨️ Imprimir
                </Button>
              </div>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default AdminOrders;

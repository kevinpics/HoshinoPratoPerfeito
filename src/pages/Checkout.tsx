import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CouponInput from "@/components/CouponInput";
import DeliveryZoneSelector from "@/components/DeliveryZoneSelector";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import {
  User,
  Phone,
  Mail,
  MapPin,
  Truck,
  Store,
  CreditCard,
  Banknote,
  Smartphone,
  Clock,
  ShoppingBag,
  MessageSquare,
  Check,
  Receipt,
} from "lucide-react";

const Checkout = () => {
  const { items, total, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [customerData, setCustomerData] = useState({
    name: "",
    email: user?.email || "",
    phone: "",
    address: "",
  });

  const [addressData, setAddressData] = useState({
    street: "",
    number: "",
    complement: "",
    neighborhood: "",
    city: "",
    zipCode: "",
  });

  const [paymentMethod, setPaymentMethod] = useState("pix");
  const [deliveryType, setDeliveryType] = useState("delivery");
  const [notes, setNotes] = useState("");
  const [couponCode, setCouponCode] = useState("");
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [deliveryFee, setDeliveryFee] = useState(0);
  const [estimatedTime, setEstimatedTime] = useState(45);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [needsChange, setNeedsChange] = useState(false);
  const [changeAmount, setChangeAmount] = useState("");

  useEffect(() => {
    if (items.length === 0) {
      navigate("/");
    }
  }, [items, navigate]);

  const finalTotal = total + deliveryFee - couponDiscount;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Validar se change_amount é necessário e está correto
      if (
        paymentMethod === "money" &&
        needsChange &&
        (!changeAmount || parseFloat(changeAmount) <= 0)
      ) {
        throw new Error("Por favor, informe um valor válido para o troco.");
      }

      // Create complete address string
      const fullAddress =
        deliveryType === "delivery"
          ? `${addressData.street}, ${addressData.number}${
              addressData.complement ? ", " + addressData.complement : ""
            }, ${addressData.neighborhood}, ${addressData.city}, CEP: ${
              addressData.zipCode
            }`.trim()
          : null;

      // Create order
      const orderData = {
        customer_name: customerData.name,
        customer_email: customerData.email || null,
        customer_phone: customerData.phone,
        customer_address: fullAddress,
        total_amount: finalTotal,
        payment_method: paymentMethod,
        delivery_type: deliveryType,
        notes: notes || null,
        coupon_code: couponCode || null,
        discount_amount: couponDiscount,
        delivery_fee: deliveryFee,
        estimated_time: estimatedTime,
        needs_change: paymentMethod === "money" ? needsChange : false,
        change_amount:
          paymentMethod === "money" && needsChange
            ? parseFloat(changeAmount) || 0
            : 0,
      };

      console.log("Order data prepared:", orderData);

      const { data: order, error: orderError } = await supabase
        .from("orders")
        .insert(orderData)
        .select()
        .single();

      if (orderError) {
        console.error("Error creating order:", orderError);
        throw new Error(
          `Erro ao criar pedido: ${
            orderError.message || "Detalhes não disponíveis"
          }`
        );
      }

      console.log("Order created successfully:", order);

      // Create order items
      const orderItems = items.map((item) => ({
        order_id: order.id,
        product_id: item.id,
        product_name: item.name,
        product_price: item.price,
        quantity: item.quantity,
        extras: item.extras || [],
      }));

      const { error: itemsError } = await supabase
        .from("order_items")
        .insert(orderItems);

      if (itemsError) {
        console.error("Error creating order items:", itemsError);
        throw new Error(
          `Erro ao criar itens do pedido: ${
            itemsError.message || "Detalhes não disponíveis"
          }`
        );
      }

      console.log("Order items created successfully");

      // Update loyalty points if user is authenticated
      if (user) {
        console.log(
          "Updating loyalty points for user:",
          user.id,
          "with total:",
          finalTotal
        );
        try {
          const { data: loyaltyData, error: loyaltyError } = await supabase.rpc(
            "update_loyalty_points",
            {
              p_user_id: user.id,
              p_order_total: finalTotal,
            }
          );

          if (loyaltyError) {
            console.error("Error updating loyalty points:", loyaltyError);
            throw new Error(
              `Erro ao atualizar pontos de fidelidade: ${
                loyaltyError.message || "Detalhes não disponíveis"
              }`
            );
          } else {
            console.log("Loyalty points updated successfully:", loyaltyData);
          }
        } catch (loyaltyErr) {
          console.error("Loyalty points update failed:", loyaltyErr);
          toast({
            title: "Erro ao atualizar pontos de fidelidade",
            description: loyaltyErr.message || "Tente novamente mais tarde.",
            variant: "destructive",
          });
        }
      }

      // Use coupon if provided
      if (couponCode && couponDiscount > 0) {
        try {
          const { error: couponError } = await supabase.rpc("use_coupon", {
            p_coupon_code: couponCode,
            p_user_id: user?.id || null,
            p_order_id: order.id,
            p_discount_amount: couponDiscount,
          });

          if (couponError) {
            console.error("Error using coupon:", couponError);
          }
        } catch (couponErr) {
          console.error("Coupon usage failed:", couponErr);
        }
      }

      // Clear cart
      clearCart();

      toast({
        title: "Pedido realizado com sucesso!",
        description: `Seu pedido #${order.id.slice(
          0,
          8
        )} foi recebido. Estimativa: ${estimatedTime} minutos.`,
      });

      // Redirect to home or order confirmation
      navigate("/?order=success");
    } catch (error: any) {
      console.error("Checkout error:", error);
      toast({
        title: "Erro ao finalizar pedido",
        description: error.message || "Tente novamente mais tarde.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (items.length === 0) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-yellow-50 to-red-50">
      <Header onCartClick={() => {}} />

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Header Section */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-orange-500 to-yellow-500 rounded-full mb-4">
              <Receipt className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-orange-600 to-yellow-600 bg-clip-text text-transparent mb-2">
              Finalizar Pedido
            </h1>
            <p className="text-gray-600">
              Complete os dados para finalizar sua compra
            </p>
          </div>

          <form
            onSubmit={handleSubmit}
            className="grid grid-cols-1 xl:grid-cols-3 gap-8"
          >
            {/* Left Column - Customer Data & Details */}
            <div className="xl:col-span-2 space-y-6">
              {/* Customer Data */}
              <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
                <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-t-lg">
                  <CardTitle className="flex items-center gap-2 text-blue-700">
                    <User className="w-5 h-5" />
                    Dados do Cliente
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label
                        htmlFor="name"
                        className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2"
                      >
                        <User className="w-4 h-4" />
                        Nome completo *
                      </Label>
                      <Input
                        id="name"
                        value={customerData.name}
                        onChange={(e) =>
                          setCustomerData((prev) => ({
                            ...prev,
                            name: e.target.value,
                          }))
                        }
                        className="h-12 border-2 border-gray-200 focus:border-blue-400 rounded-lg"
                        placeholder="Digite seu nome completo"
                        required
                      />
                    </div>

                    <div>
                      <Label
                        htmlFor="phone"
                        className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2"
                      >
                        <Phone className="w-4 h-4" />
                        Telefone *
                      </Label>
                      <Input
                        id="phone"
                        value={customerData.phone}
                        onChange={(e) =>
                          setCustomerData((prev) => ({
                            ...prev,
                            phone: e.target.value,
                          }))
                        }
                        className="h-12 border-2 border-gray-200 focus:border-blue-400 rounded-lg"
                        placeholder="(11) 99999-9999"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <Label
                      htmlFor="email"
                      className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2"
                    >
                      <Mail className="w-4 h-4" />
                      E-mail (opcional)
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      value={customerData.email}
                      onChange={(e) =>
                        setCustomerData((prev) => ({
                          ...prev,
                          email: e.target.value,
                        }))
                      }
                      className="h-12 border-2 border-gray-200 focus:border-blue-400 rounded-lg"
                      placeholder="seu@email.com"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Delivery Type */}
              <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
                <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-t-lg">
                  <CardTitle className="flex items-center gap-2 text-green-700">
                    <Truck className="w-5 h-5" />
                    Tipo de Entrega
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <RadioGroup
                    value={deliveryType}
                    onValueChange={setDeliveryType}
                    className="grid grid-cols-1 md:grid-cols-2 gap-4"
                  >
                    <div
                      className={`flex items-center space-x-3 p-4 rounded-lg border-2 transition-all cursor-pointer ${
                        deliveryType === "delivery"
                          ? "border-green-400 bg-green-50"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <RadioGroupItem value="delivery" id="delivery" />
                      <Label
                        htmlFor="delivery"
                        className="flex items-center gap-2 cursor-pointer"
                      >
                        <Truck className="w-5 h-5 text-green-600" />
                        <div>
                          <div className="font-medium">Entrega</div>
                          <div className="text-sm text-gray-600">
                            Receba em casa
                          </div>
                        </div>
                      </Label>
                    </div>

                    <div
                      className={`flex items-center space-x-3 p-4 rounded-lg border-2 transition-all cursor-pointer ${
                        deliveryType === "pickup"
                          ? "border-green-400 bg-green-50"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <RadioGroupItem value="pickup" id="pickup" />
                      <Label
                        htmlFor="pickup"
                        className="flex items-center gap-2 cursor-pointer"
                      >
                        <Store className="w-5 h-5 text-green-600" />
                        <div>
                          <div className="font-medium">Retirada</div>
                          <div className="text-sm text-gray-600">
                            Retirar no local
                          </div>
                        </div>
                      </Label>
                    </div>
                  </RadioGroup>

                  {deliveryType === "delivery" && (
                    <div className="mt-6 space-y-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label
                            htmlFor="street"
                            className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2"
                          >
                            <MapPin className="w-4 h-4" />
                            Rua/Avenida *
                          </Label>
                          <Input
                            id="street"
                            value={addressData.street}
                            onChange={(e) =>
                              setAddressData((prev) => ({
                                ...prev,
                                street: e.target.value,
                              }))
                            }
                            className="h-12 border-2 border-gray-200 focus:border-blue-400 rounded-lg"
                            placeholder="Nome da rua ou avenida"
                            required={deliveryType === "delivery"}
                          />
                        </div>

                        <div>
                          <Label
                            htmlFor="number"
                            className="text-sm font-medium text-gray-700 mb-2 block"
                          >
                            Número *
                          </Label>
                          <Input
                            id="number"
                            value={addressData.number}
                            onChange={(e) =>
                              setAddressData((prev) => ({
                                ...prev,
                                number: e.target.value,
                              }))
                            }
                            className="h-12 border-2 border-gray-200 focus:border-blue-400 rounded-lg"
                            placeholder="123"
                            required={deliveryType === "delivery"}
                          />
                        </div>
                      </div>

                      <div>
                        <Label
                          htmlFor="complement"
                          className="text-sm font-medium text-gray-700 mb-2 block"
                        >
                          Complemento
                        </Label>
                        <Input
                          id="complement"
                          value={addressData.complement}
                          onChange={(e) =>
                            setAddressData((prev) => ({
                              ...prev,
                              complement: e.target.value,
                            }))
                          }
                          className="h-12 border-2 border-gray-200 focus:border-blue-400 rounded-lg"
                          placeholder="Apto, bloco, casa, etc. (opcional)"
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label
                            htmlFor="neighborhood"
                            className="text-sm font-medium text-gray-700 mb-2 block"
                          >
                            Bairro *
                          </Label>
                          <Input
                            id="neighborhood"
                            value={addressData.neighborhood}
                            onChange={(e) =>
                              setAddressData((prev) => ({
                                ...prev,
                                neighborhood: e.target.value,
                              }))
                            }
                            className="h-12 border-2 border-gray-200 focus:border-blue-400 rounded-lg"
                            placeholder="Nome do bairro"
                            required={deliveryType === "delivery"}
                          />
                        </div>

                        <div>
                          <Label
                            htmlFor="city"
                            className="text-sm font-medium text-gray-700 mb-2 block"
                          >
                            Cidade *
                          </Label>
                          <Input
                            id="city"
                            value={addressData.city}
                            onChange={(e) =>
                              setAddressData((prev) => ({
                                ...prev,
                                city: e.target.value,
                              }))
                            }
                            className="h-12 border-2 border-gray-200 focus:border-blue-400 rounded-lg"
                            placeholder="Nome da cidade"
                            required={deliveryType === "delivery"}
                          />
                        </div>
                      </div>

                      <div>
                        <Label
                          htmlFor="zipCode"
                          className="text-sm font-medium text-gray-700 mb-2 block"
                        >
                          CEP *
                        </Label>
                        <Input
                          id="zipCode"
                          value={addressData.zipCode}
                          onChange={(e) =>
                            setAddressData((prev) => ({
                              ...prev,
                              zipCode: e.target.value,
                            }))
                          }
                          className="h-12 border-2 border-gray-200 focus:border-blue-400 rounded-lg"
                          placeholder="00000-000"
                          maxLength={9}
                          required={deliveryType === "delivery"}
                        />
                      </div>

                      <DeliveryZoneSelector
                        onZoneSelect={(fee, time) => {
                          setDeliveryFee(fee);
                          setEstimatedTime(time);
                        }}
                      />
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Payment Method */}
              <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
                <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-t-lg">
                  <CardTitle className="flex items-center gap-2 text-purple-700">
                    <CreditCard className="w-5 h-5" />
                    Forma de Pagamento
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <RadioGroup
                    value={paymentMethod}
                    onValueChange={setPaymentMethod}
                    className="grid grid-cols-1 md:grid-cols-3 gap-4"
                  >
                    <div
                      className={`flex items-center space-x-3 p-4 rounded-lg border-2 transition-all cursor-pointer ${
                        paymentMethod === "pix"
                          ? "border-purple-400 bg-purple-50"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <RadioGroupItem value="pix" id="pix" />
                      <Label
                        htmlFor="pix"
                        className="flex items-center gap-2 cursor-pointer"
                      >
                        <Smartphone className="w-5 h-5 text-purple-600" />
                        <div>
                          <div className="font-medium">PIX</div>
                          <div className="text-sm text-gray-600">
                            Instantâneo
                          </div>
                        </div>
                      </Label>
                    </div>

                    <div
                      className={`flex items-center space-x-3 p-4 rounded-lg border-2 transition-all cursor-pointer ${
                        paymentMethod === "money"
                          ? "border-purple-400 bg-purple-50"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <RadioGroupItem value="money" id="money" />
                      <Label
                        htmlFor="money"
                        className="flex items-center gap-2 cursor-pointer"
                      >
                        <Banknote className="w-5 h-5 text-purple-600" />
                        <div>
                          <div className="font-medium">Dinheiro</div>
                          <div className="text-sm text-gray-600">
                            Na entrega
                          </div>
                        </div>
                      </Label>
                    </div>

                    <div
                      className={`flex items-center space-x-3 p-4 rounded-lg border-2 transition-all cursor-pointer ${
                        paymentMethod === "card"
                          ? "border-purple-400 bg-purple-50"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <RadioGroupItem value="card" id="card" />
                      <Label
                        htmlFor="card"
                        className="flex items-center gap-2 cursor-pointer"
                      >
                        <CreditCard className="w-5 h-5 text-purple-600" />
                        <div>
                          <div className="font-medium">Cartão</div>
                          <div className="text-sm text-gray-600">
                            Na entrega
                          </div>
                        </div>
                      </Label>
                    </div>
                  </RadioGroup>

                  {/* Troco para Dinheiro */}
                  {paymentMethod === "money" && (
                    <div className="mt-6 p-4 bg-green-50 rounded-lg border border-green-200">
                      <div className="flex items-center gap-2 mb-4">
                        <Banknote className="w-5 h-5 text-green-600" />
                        <h4 className="font-medium text-green-700">
                          Informações sobre troco
                        </h4>
                      </div>

                      <div className="space-y-4">
                        <div className="flex items-center space-x-3">
                          <input
                            type="radio"
                            id="no-change"
                            name="change"
                            checked={!needsChange}
                            onChange={() => {
                              setNeedsChange(false);
                              setChangeAmount("");
                            }}
                            className="w-4 h-4 text-green-600"
                          />
                          <Label htmlFor="no-change" className="cursor-pointer">
                            Não preciso de troco
                          </Label>
                        </div>

                        <div className="flex items-center space-x-3">
                          <input
                            type="radio"
                            id="needs-change"
                            name="change"
                            checked={needsChange}
                            onChange={() => setNeedsChange(true)}
                            className="w-4 h-4 text-green-600"
                          />
                          <Label
                            htmlFor="needs-change"
                            className="cursor-pointer"
                          >
                            Preciso de troco para:
                          </Label>
                        </div>

                        {needsChange && (
                          <div className="ml-7">
                            <Input
                              type="number"
                              value={changeAmount}
                              onChange={(e) => setChangeAmount(e.target.value)}
                              className="h-12 border-2 border-green-200 focus:border-green-400 rounded-lg"
                              placeholder="R$ 0,00"
                              min={finalTotal}
                              step="0.01"
                            />
                            <p className="text-sm text-green-600 mt-2">
                              Total do pedido: R$ {finalTotal.toFixed(2)}
                            </p>
                            {changeAmount &&
                              parseFloat(changeAmount) > finalTotal && (
                                <p className="text-sm text-green-700 mt-1">
                                  Troco: R${" "}
                                  {(
                                    parseFloat(changeAmount) - finalTotal
                                  ).toFixed(2)}
                                </p>
                              )}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Notes */}
              <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
                <CardHeader className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-t-lg">
                  <CardTitle className="flex items-center gap-2 text-amber-700">
                    <MessageSquare className="w-5 h-5" />
                    Observações
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <Textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="min-h-[100px] border-2 border-gray-200 focus:border-amber-400 rounded-lg"
                    placeholder="Alguma observação especial sobre o pedido? (opcional)"
                  />
                </CardContent>
              </Card>
            </div>

            {/* Right Column - Order Summary */}
            <div className="space-y-6">
              {/* Order Summary */}
              <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm sticky top-6">
                <CardHeader className="bg-gradient-to-r from-orange-50 to-yellow-50 rounded-t-lg">
                  <CardTitle className="flex items-center gap-2 text-orange-700">
                    <ShoppingBag className="w-5 h-5" />
                    Resumo do Pedido
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                  <div className="max-h-60 overflow-y-auto space-y-3">
                    {items.map((item) => (
                      <div
                        key={`${item.id}-${item.extras
                          .map((e) => e.id)
                          .join("-")}`}
                        className="flex justify-between items-start p-3 bg-gray-50 rounded-lg"
                      >
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-800">
                            {item.name}
                          </h4>
                          <p className="text-sm text-gray-600">
                            Quantidade: {item.quantity}
                          </p>
                          {item.extras.length > 0 && (
                            <p className="text-sm text-blue-600 mt-1">
                              + {item.extras.map((e) => e.name).join(", ")}
                            </p>
                          )}
                        </div>
                        <div className="text-right">
                          <span className="font-bold text-orange-600">
                            R${" "}
                            {(
                              (item.price +
                                item.extras.reduce(
                                  (sum, extra) => sum + extra.price,
                                  0
                                )) *
                              item.quantity
                            ).toFixed(2)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="border-t pt-4 space-y-3">
                    <div className="flex justify-between text-gray-700">
                      <span>Subtotal:</span>
                      <span className="font-semibold">
                        R$ {total.toFixed(2)}
                      </span>
                    </div>

                    {deliveryType === "delivery" && (
                      <div className="flex justify-between text-gray-700">
                        <span>Taxa de entrega:</span>
                        <span className="font-semibold">
                          R$ {deliveryFee.toFixed(2)}
                        </span>
                      </div>
                    )}

                    {couponDiscount > 0 && (
                      <div className="flex justify-between text-green-600">
                        <span>Desconto ({couponCode}):</span>
                        <span className="font-semibold">
                          - R$ {couponDiscount.toFixed(2)}
                        </span>
                      </div>
                    )}

                    <div className="flex justify-between text-xl font-bold border-t pt-3 text-gray-800">
                      <span>Total:</span>
                      <span className="text-orange-600">
                        R$ {finalTotal.toFixed(2)}
                      </span>
                    </div>

                    <div className="flex items-center justify-center gap-2 bg-blue-50 p-3 rounded-lg">
                      <Clock className="w-4 h-4 text-blue-600" />
                      <p className="text-sm text-blue-700 font-medium">
                        Tempo estimado: {estimatedTime} minutos
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Coupon */}
              <CouponInput
                onCouponApplied={(code, discount) => {
                  setCouponCode(code);
                  setCouponDiscount(discount);
                }}
                orderTotal={total + deliveryFee}
              />

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-orange-500 via-yellow-500 to-red-500 hover:from-orange-600 hover:via-yellow-600 hover:to-red-600 text-white font-bold py-4 text-lg rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Processando...
                  </div>
                ) : (
                  <div className="flex items-center justify-center gap-2">
                    <Check className="w-5 h-5" />
                    Finalizar Pedido
                  </div>
                )}
              </Button>

              {/* Info Notice */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg border border-blue-200">
                <p className="text-sm text-blue-700 text-center font-medium flex items-center justify-center gap-2">
                  <Clock className="w-4 h-4" />
                  Pedidos realizados durante a semana serão preparados no
                  domingo
                </p>
              </div>
            </div>
          </form>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Checkout;

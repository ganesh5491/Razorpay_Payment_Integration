import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Products from "@/pages/products";
import Cart from "@/pages/cart";
import Shipping from "@/pages/shipping";
import PaymentProcessing from "@/pages/payment-processing";
import UPIPayment from "@/pages/upi-payment";
import QRPayment from "@/pages/qr-payment";
import PaymentApps from "@/pages/payment-apps";
import CODConfirmation from "@/pages/cod-confirmation";
import PaymentSuccess from "@/pages/payment-success";
import CardPayment from "@/pages/card-payment"

function Router() {
  return (
    <Switch>
      <Route path="/" component={Products} />
      <Route path="/cart" component={Cart} />
      <Route path="/shipping" component={Shipping} />
      <Route path="/payment-processing" component={PaymentProcessing} />
      <Route path="/upi-payment" component={UPIPayment} />
      <Route path="/qr-payment" component={QRPayment} />
      <Route path="/payment-apps" component={PaymentApps} />
      <Route path="/cod-confirmation" component={CODConfirmation} />
      <Route path="/payment-success" component={PaymentSuccess} />
      <Route path="/card-payment" component={CardPayment} />
      {/* <Route component={NotFound} /> */}
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;

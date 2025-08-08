import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Checkout from "@/pages/checkout";
import PaymentProcessing from "@/pages/payment-processing";
import CODConfirmation from "@/pages/cod-confirmation";
import PaymentSuccess from "@/pages/payment-success";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Checkout} />
      <Route path="/checkout" component={Checkout} />
      <Route path="/payment-processing" component={PaymentProcessing} />
      <Route path="/cod-confirmation" component={CODConfirmation} />
      <Route path="/payment-success" component={PaymentSuccess} />
      <Route component={NotFound} />
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

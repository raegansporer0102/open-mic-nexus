
import { Box } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useState } from "react";

interface OrderIdDialogProps {
  orderId: string;
  onClose: () => void;
}

const OrderIdDialog = ({ orderId, onClose }: OrderIdDialogProps) => {
  const [open, setOpen] = useState(true);

  const handleCopy = () => {
    navigator.clipboard.writeText(orderId);
  };

  const handleClose = () => {
    setOpen(false);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Registration Successful!</DialogTitle>
          <DialogDescription>
            Please save your order ID for future reference
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="flex items-center justify-center space-x-2 bg-primary/10 p-4 rounded-lg border border-primary/20">
            <Box className="w-5 h-5 text-primary" />
            <span className="font-medium text-primary text-lg">{orderId}</span>
          </div>
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={handleCopy}>
              Copy Order ID
            </Button>
            <Button onClick={handleClose}>Close</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default OrderIdDialog;

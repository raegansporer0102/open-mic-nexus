
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { format } from "date-fns";
import { CheckCircle, XCircle } from "lucide-react";
import { toast } from "sonner";

interface RegistrationsTableProps {
  registrations: any[];
  type: 'performer' | 'audience';
  onStatusUpdate: (registrationId: string, newStatus: 'approved' | 'declined') => Promise<void>;
  onImageSelect: (image: { url: string; type: string }) => void;
}

export const RegistrationsTable = ({
  registrations,
  type,
  onStatusUpdate,
  onImageSelect,
}: RegistrationsTableProps) => {
  const handleStatusUpdate = async (registrationId: string, newStatus: 'approved' | 'declined') => {
    try {
      await onStatusUpdate(registrationId, newStatus);
      toast.success(`Registration ${newStatus} successfully`);
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error(`Failed to ${newStatus} registration. Please try again.`);
    }
  };

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Order ID</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Mobile</TableHead>
            <TableHead>Transaction ID</TableHead>
            {type === 'performer' && <TableHead>Performance Type</TableHead>}
            <TableHead>Registration Date</TableHead>
            <TableHead>Photos</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {registrations.map((registration) => (
            <TableRow key={registration.id}>
              <TableCell className="font-medium">{registration.order_id}</TableCell>
              <TableCell>{registration.name}</TableCell>
              <TableCell>{registration.email}</TableCell>
              <TableCell>{registration.mobile}</TableCell>
              <TableCell>{registration.transaction_id}</TableCell>
              {type === 'performer' && (
                <TableCell>{registration.performance_type}</TableCell>
              )}
              <TableCell>
                {format(new Date(registration.created_at), 'PPpp')}
              </TableCell>
              <TableCell className="space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onImageSelect({
                    url: registration.profile_photo_url,
                    type: 'Profile Photo'
                  })}
                >
                  Profile
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onImageSelect({
                    url: registration.payment_screenshot_url,
                    type: 'Payment Screenshot'
                  })}
                >
                  Payment
                </Button>
              </TableCell>
              <TableCell>
                <span className={`px-2 py-1 rounded-full text-sm ${
                  registration.status === 'approved' 
                    ? 'bg-green-100 text-green-800' 
                    : registration.status === 'declined'
                    ? 'bg-red-100 text-red-800'
                    : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {registration.status}
                </span>
              </TableCell>
              <TableCell>
                {registration.status === 'pending' && (
                  <div className="flex space-x-2">
                    <Button
                      size="sm"
                      className="bg-green-500 hover:bg-green-600"
                      onClick={() => handleStatusUpdate(registration.id, 'approved')}
                    >
                      <CheckCircle className="w-4 h-4 mr-1" />
                      Approve
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleStatusUpdate(registration.id, 'declined')}
                    >
                      <XCircle className="w-4 h-4 mr-1" />
                      Decline
                    </Button>
                  </div>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};


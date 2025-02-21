
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useState } from "react";

export const PriceManagement = () => {
  const queryClient = useQueryClient();
  const [prices, setPrices] = useState({
    performer: 349,
    audience: 149,
  });

  const { data: currentPrices } = useQuery({
    queryKey: ['prices'],
    queryFn: async () => {
      console.log('Fetching prices...');
      const { data, error } = await supabase
        .from('prices')
        .select('*')
        .single();
      
      if (error) {
        console.error('Prices fetch error:', error);
        throw error;
      }
      
      if (data) {
        setPrices({
          performer: data.performer_price,
          audience: data.audience_price
        });
      }
      
      return data;
    }
  });

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'performer' | 'audience') => {
    const value = parseInt(e.target.value) || 0;
    setPrices(prev => ({ ...prev, [type]: value }));
  };

  const handleSavePrices = async () => {
    try {
      console.log('Updating prices:', prices);
      const { error } = await supabase
        .from('prices')
        .update({
          performer_price: prices.performer,
          audience_price: prices.audience
        })
        .eq('id', 1);

      if (error) {
        console.error('Price update error:', error);
        throw error;
      }

      toast.success("Prices updated successfully");
      queryClient.invalidateQueries({ queryKey: ['prices'] });
    } catch (error) {
      console.error('Error updating prices:', error);
      toast.error("Failed to update prices");
    }
  };

  return (
    <Card className="p-6 glass-card mb-6">
      <h2 className="text-xl font-semibold mb-4">Price Management</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="performerPrice">Performer Registration Price (₹)</Label>
          <Input
            id="performerPrice"
            type="number"
            value={prices.performer}
            onChange={(e) => handlePriceChange(e, 'performer')}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="audiencePrice">Audience Registration Price (₹)</Label>
          <Input
            id="audiencePrice"
            type="number"
            value={prices.audience}
            onChange={(e) => handlePriceChange(e, 'audience')}
          />
        </div>
      </div>
      <Button 
        className="mt-4" 
        onClick={handleSavePrices}
      >
        Save Prices
      </Button>
    </Card>
  );
};

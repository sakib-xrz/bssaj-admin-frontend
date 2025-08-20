"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2, Calendar, DollarSign, Building2, Plus } from "lucide-react";
import { toast } from "sonner";
import { useBulkCreatePaymentsMutation } from "@/redux/features/payment/paymentApi";
import { useGetAgenciesQuery } from "@/redux/features/agency/agencyApi";

interface BulkCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const generateCurrentMonth = () => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
};

export function BulkCreateModal({ isOpen, onClose }: BulkCreateModalProps) {
  const [includeAllAgencies, setIncludeAllAgencies] = useState(true);
  const [selectedAgencies, setSelectedAgencies] = useState<string[]>([]);
  const [formData, setFormData] = useState({
    payment_month: generateCurrentMonth(),
    amount: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [bulkCreatePayments, { isLoading }] = useBulkCreatePaymentsMutation();
  const { data: agenciesData } = useGetAgenciesQuery(
    { status: "APPROVED", limit: 100 },
    { skip: includeAllAgencies }
  );

  const agencies = agenciesData?.data || [];

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.payment_month) {
      newErrors.payment_month = "Payment month is required";
    }

    if (!formData.amount || Number(formData.amount) <= 0) {
      newErrors.amount = "Amount must be greater than 0";
    }

    if (!includeAllAgencies && selectedAgencies.length === 0) {
      newErrors.agencies = "Please select at least one agency";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      const payload = {
        payment_month: formData.payment_month,
        amount: Number(formData.amount),
        include_all_active_agencies: includeAllAgencies,
        ...(includeAllAgencies ? {} : { agency_ids: selectedAgencies }),
      };

      const result = await bulkCreatePayments(payload).unwrap();

      toast.success(
        `Successfully created ${result.data.created_count} payments. ${
          result.data.skipped_count > 0
            ? `Skipped ${result.data.skipped_count} existing payments.`
            : ""
        }`
      );

      handleClose();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      console.error("Error creating bulk payments:", error);
      toast.error(error?.data?.message || "Failed to create payments");
    }
  };

  const handleClose = () => {
    setFormData({
      payment_month: generateCurrentMonth(),
      amount: "",
    });
    setErrors({});
    setIncludeAllAgencies(true);
    setSelectedAgencies([]);
    onClose();
  };

  const handleAgencySelect = (agencyId: string, checked: boolean) => {
    if (checked) {
      setSelectedAgencies((prev) => [...prev, agencyId]);
    } else {
      setSelectedAgencies((prev) => prev.filter((id) => id !== agencyId));
    }
  };

  const handleSelectAllAgencies = (checked: boolean) => {
    if (checked) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      setSelectedAgencies(agencies.map((agency: any) => agency.id));
    } else {
      setSelectedAgencies([]);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <Calendar className="w-5 h-5 mr-2" />
            Bulk Create Monthly Payments
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={onSubmit} className="space-y-6">
          {/* Payment Month */}
          <div className="space-y-2">
            <Label htmlFor="payment_month" className="flex items-center">
              <Calendar className="w-4 h-4 mr-2" />
              Payment Month *
            </Label>
            <Input
              id="payment_month"
              type="month"
              value={formData.payment_month}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  payment_month: e.target.value,
                }))
              }
              className={errors.payment_month ? "border-red-500" : ""}
            />
            {errors.payment_month && (
              <p className="text-sm text-red-600">{errors.payment_month}</p>
            )}
          </div>

          {/* Amount */}
          <div className="space-y-2">
            <Label htmlFor="amount" className="flex items-center">
              <DollarSign className="w-4 h-4 mr-2" />
              Monthly Amount *
            </Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              placeholder="e.g., 99.99"
              value={formData.amount}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, amount: e.target.value }))
              }
              className={errors.amount ? "border-red-500" : ""}
            />
            {errors.amount && (
              <p className="text-sm text-red-600">{errors.amount}</p>
            )}
          </div>

          {/* Agency Selection */}
          <div className="space-y-4">
            <Label className="flex items-center">
              <Building2 className="w-4 h-4 mr-2" />
              Agency Selection
            </Label>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="include_all"
                checked={includeAllAgencies}
                onCheckedChange={(checked) =>
                  setIncludeAllAgencies(checked as boolean)
                }
              />
              <Label htmlFor="include_all" className="text-sm font-normal">
                Include all active agencies
              </Label>
            </div>

            {!includeAllAgencies && (
              <div className="space-y-3 border rounded-md p-4 max-h-64 overflow-y-auto">
                <div className="flex items-center space-x-2 pb-2 border-b">
                  <Checkbox
                    id="select_all"
                    checked={
                      selectedAgencies.length === agencies.length &&
                      agencies.length > 0
                    }
                    onCheckedChange={handleSelectAllAgencies}
                  />
                  <Label htmlFor="select_all" className="text-sm font-medium">
                    Select All Agencies ({agencies.length})
                  </Label>
                </div>

                {agencies.length > 0 ? (
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  agencies.map((agency: any) => (
                    <div
                      key={agency.id}
                      className="flex items-center space-x-2"
                    >
                      <Checkbox
                        id={agency.id}
                        checked={selectedAgencies.includes(agency.id)}
                        onCheckedChange={(checked) =>
                          handleAgencySelect(agency.id, checked as boolean)
                        }
                      />
                      <Label
                        htmlFor={agency.id}
                        className="text-sm font-normal flex-1"
                      >
                        {agency.name}
                        <span className="text-gray-500 ml-2">
                          ({agency.contact_email})
                        </span>
                      </Label>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-gray-500 text-center py-4">
                    No approved agencies found
                  </p>
                )}
              </div>
            )}

            {errors.agencies && (
              <p className="text-sm text-red-600">{errors.agencies}</p>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={
                isLoading ||
                (!includeAllAgencies && selectedAgencies.length === 0)
              }
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Payments
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

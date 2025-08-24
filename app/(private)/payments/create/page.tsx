"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ArrowLeft, Loader2, Save } from "lucide-react";
import Container from "@/components/shared/container";
import { SearchSelect } from "@/components/shared/search-and-select";
import { toast } from "sonner";
import {
  useCreatePaymentMutation,
  CreatePaymentData,
} from "@/redux/features/payment/paymentApi";
import { useSearchAgenciesQuery } from "@/redux/features/agency/agencyApi";

// Define the Agency interface for type safety
interface Agency {
  id: string;
  name: string;
  contact_email: string;
}

// Helper functions
const getCurrentMonth = () => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
};

export default function CreatePaymentPage() {
  const router = useRouter();

  const [formData, setFormData] = useState<CreatePaymentData>({
    agency_id: "",
    payment_month: "",
    amount: 0,
    payment_method: "",
    notes: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [agenciesCache, setAgenciesCache] = useState<Map<string, Agency>>(
    new Map()
  );
  const [createPayment, { isLoading }] = useCreatePaymentMutation();

  // Transform agency data for SearchSelect
  const transformAgencyData = (data: unknown) => {
    const agencies = (data as { data?: Agency[] })?.data || [];
    const options = agencies.map((agency: Agency) => ({
      label: `${agency.name} (${agency.contact_email})`,
      value: agency.id,
    }));

    // Cache agencies for later use - only update if we have new agencies
    const newAgencies = agencies.filter(
      (agency) => !agenciesCache.has(agency.id)
    );
    if (newAgencies.length > 0) {
      setAgenciesCache((prev) => {
        const newCache = new Map(prev);
        newAgencies.forEach((agency) => {
          newCache.set(agency.id, agency);
        });
        return newCache;
      });
    }

    return options;
  };

  // Handle agency selection
  const handleAgencySelect = (agencyId: string) => {
    setFormData((prev) => ({ ...prev, agency_id: agencyId }));
    setErrors((prev) => ({ ...prev, agency_id: "" }));
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.agency_id) {
      newErrors.agency_id = "Agency is required";
    }

    if (!formData.payment_month) {
      newErrors.payment_month = "Payment month is required";
    }

    if (!formData.amount || formData.amount <= 0) {
      newErrors.amount = "Amount must be greater than 0";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      await createPayment(formData).unwrap();
      toast.success("Payment created successfully");
      router.push("/payments");
    } catch (error: unknown) {
      console.error("Error creating payment:", error);
      const errorMessage =
        (error as { data?: { message?: string } })?.data?.message ||
        "Failed to create payment";
      toast.error(errorMessage);
    }
  };

  return (
    <Container>
      <div className="space-y-6">
        <div className="flex flex-col sm:justify-between sm:items-center gap-4">
          <Link href="/payments">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4" />
              Back to Payments
            </Button>
          </Link>
          <div className="sm:text-center">
            <h1 className="text-3xl font-bold text-gray-900">Create Payment</h1>
            <p className="text-gray-600">
              Add a new agency subscription payment
            </p>
          </div>
        </div>

        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle>Payment Information</CardTitle>
            <CardDescription>
              Enter the details for the new payment record
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Agency Selection */}
                <div className="space-y-2">
                  <SearchSelect
                    label="Select Agency *"
                    placeholder="Type to search for agencies..."
                    value={formData.agency_id}
                    onChange={handleAgencySelect}
                    useSearchQuery={useSearchAgenciesQuery}
                    searchParams={{ limit: 20 }}
                    transformData={transformAgencyData}
                    selectedOptionLabel={
                      formData.agency_id &&
                      agenciesCache.has(formData.agency_id)
                        ? `${agenciesCache.get(formData.agency_id)!.name} (${
                            agenciesCache.get(formData.agency_id)!.contact_email
                          })`
                        : undefined
                    }
                    className={errors.agency_id ? "border-red-500" : ""}
                    emptyMessage="No agencies found matching your search"
                  />
                  {errors.agency_id && (
                    <p className="text-sm text-red-600">{errors.agency_id}</p>
                  )}
                </div>

                {/* Payment Month */}
                <div className="space-y-2">
                  <Label htmlFor="payment_month">Payment Month *</Label>
                  <Input
                    id="payment_month"
                    type="month"
                    value={formData.payment_month}
                    onChange={(e) => {
                      setFormData((prev) => ({
                        ...prev,
                        payment_month: e.target.value,
                      }));
                    }}
                    className={errors.payment_month ? "border-red-500" : ""}
                    placeholder={getCurrentMonth()}
                  />
                  {errors.payment_month && (
                    <p className="text-sm text-red-600">
                      {errors.payment_month}
                    </p>
                  )}
                </div>

                {/* Amount */}
                <div className="space-y-2">
                  <Label htmlFor="amount">Amount *</Label>
                  <Input
                    id="amount"
                    type="number"
                    value={formData.amount}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        amount: Number(e.target.value),
                      }))
                    }
                    className={errors.amount ? "border-red-500" : ""}
                    placeholder="0"
                  />
                  {errors.amount && (
                    <p className="text-sm text-red-600">{errors.amount}</p>
                  )}
                </div>

                {/* Payment Method */}
                <div className="space-y-2">
                  <Label htmlFor="payment_method">Payment Method</Label>
                  <Input
                    id="payment_method"
                    type="text"
                    value={formData.payment_method}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        payment_method: e.target.value,
                      }))
                    }
                    placeholder="e.g., Bank Transfer, Credit Card, Mobile Banking"
                  />
                </div>

                {/* Notes */}
                <div className="space-y-2 col-span-2">
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea
                    id="notes"
                    value={formData.notes}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        notes: e.target.value,
                      }))
                    }
                    placeholder="Additional notes about this payment..."
                    rows={3}
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Link href="/payments">
                  <Button type="button" variant="outline">
                    Cancel
                  </Button>
                </Link>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      Create Payment
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </Container>
  );
}

"use client"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { AlertTriangle, UserX } from "lucide-react"
import { useState } from "react"

interface MemberDeactivateModalProps {
  member: {
    id: string
    name: string
    designation: string
  } | null
  isOpen: boolean
  onClose: () => void
  onConfirm: (reason: string) => void
  isLoading?: boolean
}

export function MemberDeactivateModal({
  member,
  isOpen,
  onClose,
  onConfirm,
  isLoading = false,
}: MemberDeactivateModalProps) {
  const [reason, setReason] = useState("")

  const handleConfirm = () => {
    onConfirm(reason)
    setReason("")
  }

  const handleClose = () => {
    setReason("")
    onClose()
  }

  if (!member) return null

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <UserX className="w-5 h-5 text-orange-500" />
            <span>Deactivate Member</span>
          </DialogTitle>
          <DialogDescription>
            Are you sure you want to deactivate this member? They will lose access to member-only features.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="w-4 h-4 text-orange-600" />
              <span className="font-medium text-orange-800">Member to deactivate:</span>
            </div>
            <div className="mt-2">
              <p className="font-semibold text-orange-900">{member.name}</p>
              <p className="text-sm text-orange-700">{member.designation}</p>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="reason">Reason for deactivation (optional)</Label>
            <Textarea
              id="reason"
              placeholder="Enter reason for deactivating this member..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={3}
            />
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
            <p className="text-sm text-yellow-800">
              <strong>Note:</strong> The member can be reactivated later if needed. This action is reversible.
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={isLoading}
            className="bg-orange-600 hover:bg-orange-700 focus:ring-orange-600"
          >
            {isLoading ? "Deactivating..." : "Deactivate Member"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

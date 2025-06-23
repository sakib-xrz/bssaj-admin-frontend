"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Plus,
  Search,
  MoreHorizontal,
  Edit,
  Trash2,
  Eye,
  ExternalLink,
} from "lucide-react";
import { AgencyViewModal } from "./_components/agency-view-modal";
import { DeleteAlertDialog } from "../_components/delete-alert-dialog";
import Container from "@/components/shared/container";

const mockAgencies = [
  {
    id: "1",
    name: "Global Education Consultancy",
    contact_email: "info@globaledu.com",
    contact_phone: "+1234567890",
    website: "https://globaledu.com",
    director_name: "John Smith",
    established_year: 2015,
    is_deleted: false,
    created_at: "2024-01-15T10:30:00Z",
    updated_at: "2024-01-15T10:30:00Z",
  },
  {
    id: "2",
    name: "Study Abroad Solutions",
    contact_email: "contact@studyabroad.com",
    contact_phone: "+1234567891",
    website: "https://studyabroad.com",
    director_name: "Sarah Johnson",
    established_year: 2018,
    is_deleted: false,
    created_at: "2024-01-14T09:15:00Z",
    updated_at: "2024-01-14T09:15:00Z",
  },
];

export default function AgenciesPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [agencies] = useState(mockAgencies);

  const [selectedAgency, setSelectedAgency] = useState<
    (typeof mockAgencies)[0] | null
  >(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const filteredAgencies = agencies.filter(
    (agency) =>
      agency.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      agency.contact_email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleViewAgency = (agency: (typeof mockAgencies)[0]) => {
    setSelectedAgency(agency);
    setIsViewModalOpen(true);
  };

  const handleDeleteAgency = (agency: (typeof mockAgencies)[0]) => {
    setSelectedAgency(agency);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!selectedAgency) return;
    setIsDeleting(true);
    try {
      console.log("Deleting agency:", selectedAgency.id);
      await new Promise((resolve) => setTimeout(resolve, 1000));
      // Remove agency from list or refresh data
    } catch (error) {
      console.error("Error deleting agency:", error);
    } finally {
      setIsDeleting(false);
      setIsDeleteDialogOpen(false);
      setSelectedAgency(null);
    }
  };

  return (
    <Container>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Agencies</h1>
            <p className="text-gray-600">
              Manage registered agencies and their information
            </p>
          </div>
          <Link href="/agencies/create">
            <Button className="bg-primary hover:bg-primary/90 w-full sm:w-auto">
              <Plus className="w-4 h-4 mr-2" />
              Add Agency
            </Button>
          </Link>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>All Agencies</CardTitle>
            <CardDescription>
              A list of all registered agencies in the system
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2 mb-4">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search agencies..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Agency Name</TableHead>
                    <TableHead>Director</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Website</TableHead>
                    <TableHead>Established</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAgencies.map((agency) => (
                    <TableRow key={agency.id}>
                      <TableCell className="font-medium">
                        {agency.name}
                      </TableCell>
                      <TableCell>{agency.director_name}</TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="text-sm">{agency.contact_email}</div>
                          <div className="text-sm text-gray-500">
                            {agency.contact_phone}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {agency.website ? (
                          <a
                            href={agency.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-secondary hover:underline flex items-center"
                          >
                            Visit <ExternalLink className="w-3 h-3 ml-1" />
                          </a>
                        ) : (
                          <span className="text-gray-400">No website</span>
                        )}
                      </TableCell>
                      <TableCell>{agency.established_year}</TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => handleViewAgency(agency)}
                            >
                              <Eye className="mr-2 h-4 w-4" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                              <Link href={`/admin/agencies/edit/${agency.id}`}>
                                <Edit className="mr-2 h-4 w-4" />
                                Edit Agency
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="text-red-600"
                              onClick={() => handleDeleteAgency(agency)}
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete Agency
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        <AgencyViewModal
          agency={selectedAgency}
          isOpen={isViewModalOpen}
          onClose={() => setIsViewModalOpen(false)}
        />

        <DeleteAlertDialog
          isOpen={isDeleteDialogOpen}
          onClose={() => setIsDeleteDialogOpen(false)}
          onConfirm={confirmDelete}
          title="Delete Agency"
          description="Are you sure you want to delete this agency? This will permanently remove the agency and all associated data."
          itemName={selectedAgency?.name || ""}
          isLoading={isDeleting}
        />
      </div>
    </Container>
  );
}

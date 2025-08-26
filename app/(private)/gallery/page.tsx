"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
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
  Image as ImageIcon,
  Loader2,
  ExternalLink,
} from "lucide-react";
import { DeleteAlertDialog } from "@/app/(private)/_components/delete-alert-dialog";
import Container from "@/components/shared/container";
import { format } from "date-fns";
import {
  useGetAllGalleryQuery,
  useDeleteGalleryMutation,
} from "@/redux/features/gallery/galleryApi";
import { useRouter, useSearchParams } from "next/navigation";
import { useDebounce } from "@/hooks/use-debounce";
import { generateQueryString, sanitizeParams } from "@/lib/utils";
import CustomPagination from "@/components/shared/custom-pagination";
import { toast } from "sonner";
import { GalleryViewModal } from "./_components/gallery-view-modal";

interface GalleryItem {
  id: string;
  title?: string;
  image: string;
  link?: string;
  created_at: string;
  updated_at: string;
}

export default function GalleryPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const initialParams = {
    page: Number(searchParams.get("page")) || 1,
    limit: Number(searchParams.get("limit")) || 20,
    search: searchParams.get("search") || "",
  };

  const [params, setParams] = useState(initialParams);
  const [searchInput, setSearchInput] = useState(initialParams.search);

  // Debounce search query
  const debouncedSearch = useDebounce(searchInput, 500);

  // Update search param when debounced search changes
  useEffect(() => {
    setParams((prev) => ({ ...prev, search: debouncedSearch }));
  }, [debouncedSearch]);

  // Update URL when filters change
  useEffect(() => {
    const queryString = generateQueryString(params);
    router.push(`/gallery${queryString}`);
  }, [params, router]);

  const { data, isLoading } = useGetAllGalleryQuery(sanitizeParams(params));

  const galleryItems = data?.data;

  const [selectedGalleryItem, setSelectedGalleryItem] =
    useState<GalleryItem | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const [deleteGalleryItem, { isLoading: isDeleting }] =
    useDeleteGalleryMutation();

  const [imageErrors, setImageErrors] = useState<Set<string>>(new Set());

  const handleImageError = (galleryItemId: string) => {
    setImageErrors((prev) => new Set(prev).add(galleryItemId));
  };

  // Handle pagination page change
  const handlePageChange = (page: number) => {
    if (
      page < 1 ||
      (data?.meta && page > Math.ceil(data?.meta.total / data?.meta.limit)) ||
      page === params.page
    ) {
      return;
    }
    setParams((prev) => ({ ...prev, page }));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleViewGalleryItem = (galleryItem: GalleryItem) => {
    setSelectedGalleryItem(galleryItem);
    setIsViewModalOpen(true);
  };

  const handleDeleteGalleryItem = (galleryItem: GalleryItem) => {
    setSelectedGalleryItem(galleryItem);
    setIsDeleteDialogOpen(true);
  };

  if (isLoading) {
    return (
      <Container>
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Gallery</h1>
              <p className="text-gray-600">
                Manage your gallery images and visual content
              </p>
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>All Gallery Items</CardTitle>
              <CardDescription>
                A list of all gallery items in the system
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
              </div>
            </CardContent>
          </Card>
        </div>
      </Container>
    );
  }

  const hasGalleryItems = galleryItems && galleryItems.length > 0;
  const hasSearchQuery = params.search.length > 0;

  return (
    <Container>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Gallery</h1>
            <p className="text-gray-600">
              Manage your gallery images and visual content
            </p>
          </div>
          <Link href="/gallery/create">
            <Button className="bg-primary hover:bg-primary/90 w-full sm:w-auto">
              <Plus className="w-4 h-4" />
              Add Gallery Item
            </Button>
          </Link>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>All Gallery Items</CardTitle>
            <CardDescription>
              A list of all gallery items in the system
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2 mb-4">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search gallery items..."
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="rounded-md border">
              {hasGalleryItems ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Image</TableHead>
                      <TableHead>Title</TableHead>
                      <TableHead>Link</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead>Updated</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {galleryItems?.map((galleryItem: GalleryItem) => (
                      <TableRow key={galleryItem.id}>
                        <TableCell>
                          <div className="flex items-center space-x-3">
                            {galleryItem.image &&
                            !imageErrors.has(galleryItem.id) ? (
                              <div className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0 relative">
                                <Image
                                  src={galleryItem.image}
                                  alt={`${
                                    galleryItem.title || "Gallery"
                                  } image`}
                                  fill
                                  className="object-cover"
                                  onError={() =>
                                    handleImageError(galleryItem.id)
                                  }
                                />
                              </div>
                            ) : (
                              <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center text-white font-semibold">
                                <ImageIcon className="w-5 h-5" />
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="font-medium line-clamp-1">
                            {galleryItem.title || "Untitled"}
                          </div>
                        </TableCell>
                        <TableCell>
                          {galleryItem.link ? (
                            <div className="flex items-center space-x-2">
                              <span className="text-sm text-blue-600 hover:text-blue-800 line-clamp-1 max-w-xs">
                                {galleryItem.link}
                              </span>
                              <ExternalLink className="w-3 h-3 text-gray-400" />
                            </div>
                          ) : (
                            <span className="text-sm text-gray-500">
                              No link
                            </span>
                          )}
                        </TableCell>
                        <TableCell>
                          {format(
                            new Date(galleryItem.created_at),
                            "dd MMM yyyy"
                          )}
                        </TableCell>
                        <TableCell>
                          {format(
                            new Date(galleryItem.updated_at),
                            "dd MMM yyyy"
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onClick={() =>
                                  handleViewGalleryItem(galleryItem)
                                }
                              >
                                <Eye className="h-4 w-4" />
                                View Details
                              </DropdownMenuItem>
                              <DropdownMenuItem asChild>
                                <Link href={`/gallery/edit/${galleryItem.id}`}>
                                  <Edit className="h-4 w-4" />
                                  Edit Gallery Item
                                </Link>
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                className="text-red-600"
                                onClick={() =>
                                  handleDeleteGalleryItem(galleryItem)
                                }
                              >
                                <Trash2 className="h-4 w-4" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 px-4">
                  {hasSearchQuery ? (
                    <>
                      <p className="text-gray-500 text-lg mb-4">
                        No gallery items found matching &quot;{params.search}
                        &quot;
                      </p>
                      <Button
                        variant="outline"
                        onClick={() => {
                          setSearchInput("");
                          setParams((prev) => ({
                            ...prev,
                            search: "",
                            page: 1,
                          }));
                        }}
                      >
                        Clear search
                      </Button>
                    </>
                  ) : (
                    <>
                      <p className="text-gray-500 text-lg mb-4">
                        No gallery items added yet
                      </p>
                      <Link href="/gallery/create">
                        <Button>
                          <Plus className="w-4 h-4" />
                          Create your first gallery item
                        </Button>
                      </Link>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Pagination */}
            {data?.meta && data?.meta.total > 1 && (
              <CustomPagination
                params={{ page: params.page }}
                totalPages={Math.ceil(data?.meta.total / params.limit)}
                handlePageChange={handlePageChange}
              />
            )}
          </CardContent>
        </Card>

        <GalleryViewModal
          galleryItemId={selectedGalleryItem?.id || null}
          isOpen={isViewModalOpen}
          onClose={() => setIsViewModalOpen(false)}
        />

        <DeleteAlertDialog
          isOpen={isDeleteDialogOpen}
          onClose={() => setIsDeleteDialogOpen(false)}
          onConfirm={async () => {
            if (!selectedGalleryItem) return;
            try {
              await deleteGalleryItem(selectedGalleryItem.id).unwrap();
              setIsDeleteDialogOpen(false);
              toast.success("Gallery item deleted successfully");
            } catch (error) {
              console.error("Failed to delete gallery item:", error);
              toast.error("Failed to delete gallery item");
            } finally {
              setSelectedGalleryItem(null);
            }
          }}
          title="Delete Gallery Item"
          description="Are you sure you want to delete this gallery item? This action cannot be undone."
          itemName={selectedGalleryItem?.title || ""}
          isLoading={isDeleting}
        />
      </div>
    </Container>
  );
}

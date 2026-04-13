import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MapPin, Calendar } from "lucide-react";
import Image from "next/image";

interface AccommodationDetailsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  accommodation: any;
}

export function AccommodationDetailsDialog({
  isOpen,
  onClose,
  accommodation,
}: AccommodationDetailsDialogProps) {
  if (!accommodation) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle>{accommodation.propertyName}</DialogTitle>
          <DialogDescription>
            <div className="flex items-center text-sm text-gray-600 mt-1">
              <MapPin className="h-4 w-4 mr-1" />
              {accommodation.address}
            </div>
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[calc(90vh-120px)]">
          <div className="space-y-6 p-1">
            {/* Images */}
            {accommodation.images && accommodation.images.length > 0 && (
              <div className="grid grid-cols-2 gap-4">
                {accommodation.images.map((image: string, index: number) => (
                  <div key={index} className="relative aspect-[4/3]">
                    <Image
                      src={`/uploads/${image}`}
                      alt={`${accommodation.propertyName} - Image ${index + 1}`}
                      fill
                      className="object-cover rounded-lg"
                    />
                  </div>
                ))}
              </div>
            )}

            {/* Price and Stay Details */}
            <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
              <div>
                <p className="text-2xl font-bold text-blue-600">
                  ₹{accommodation.dailyRate}
                  <span className="text-sm font-normal text-gray-600">/day</span>
                </p>
                <div className="flex items-center text-sm text-gray-600 mt-1">
                  <Calendar className="h-4 w-4 mr-1" />
                  Minimum stay: {accommodation.minStay} {accommodation.minStay === 1 ? 'day' : 'days'}
                </div>
              </div>
              <div className="text-right">
                <span className="inline-block px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                  {accommodation.roomType}
                </span>
              </div>
            </div>

            {/* Description */}
            <div>
              <h3 className="text-lg font-semibold mb-2">Description</h3>
              <p className="text-gray-600 whitespace-pre-line">
                {accommodation.description}
              </p>
            </div>

            {/* Amenities */}
            {accommodation.amenities && accommodation.amenities.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold mb-2">Amenities</h3>
                <div className="grid grid-cols-2 gap-2">
                  {accommodation.amenities.map((amenity: string, index: number) => (
                    <div
                      key={index}
                      className="flex items-center p-2 bg-gray-50 rounded"
                    >
                      <span className="text-sm text-gray-600">{amenity}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Additional Details */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="text-lg font-semibold mb-2">Property Details</h3>
                <div className="space-y-2">
                  <p className="text-sm">
                    <span className="text-gray-600">Type: </span>
                    {accommodation.accommodationType}
                  </p>
                  <p className="text-sm">
                    <span className="text-gray-600">Room Type: </span>
                    {accommodation.roomType}
                  </p>
                  <p className="text-sm">
                    <span className="text-gray-600">Near: </span>
                    {accommodation.university}
                  </p>
                </div>
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-2">Contact</h3>
                <div className="space-y-2">
                  <p className="text-sm">
                    <span className="text-gray-600">Owner: </span>
                    {accommodation.ownerName}
                  </p>
                  {accommodation.ownerPhone && (
                    <p className="text-sm">
                      <span className="text-gray-600">Phone: </span>
                      {accommodation.ownerPhone}
                    </p>
                  )}
                  {accommodation.ownerEmail && (
                    <p className="text-sm">
                      <span className="text-gray-600">Email: </span>
                      {accommodation.ownerEmail}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}

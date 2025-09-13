import { Label } from "@/components/ui/label";
import { ImagePlus, Upload, X } from "lucide-react";
import { ChangeEvent, useRef } from "react";

// Image type
export interface UploadedImage {
  id: number;
  file: File;
  preview: string | ArrayBuffer | null;
  name: string;
  size: number;
}

// Props type
interface ImageUploadSectionProps {
  selectedImages: UploadedImage[];
  addImages: (images: UploadedImage[]) => void;
  removeImage: (id: number) => void;
}

const ImageUploadSection: React.FC<ImageUploadSectionProps> = ({
  selectedImages,
  addImages,
  removeImage,
}) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleImageSelect = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files ? Array.from(e.target.files) : [];
    const newImages: UploadedImage[] = [];

    files.forEach((file) => {
      if (file.type.startsWith("image/")) {
        const reader = new FileReader();
        reader.onload = (event) => {
          const newImage: UploadedImage = {
            id: Date.now() + Math.random(),
            file,
            preview: event.target?.result ?? null,
            name: file.name,
            size: file.size,
          };

          newImages.push(newImage);
          if (newImages.length === files.length) {
            addImages(newImages);
          }
        };
        reader.readAsDataURL(file);
      }
    });

    e.target.value = "";
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label className="text-sm font-medium">Product Images</Label>
        <span className="text-xs text-muted-foreground">
          {selectedImages.length} image(s) selected
        </span>
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/*"
        onChange={handleImageSelect}
        className="hidden"
      />

      {/* Upload area */}
      <div
        onClick={openFileDialog}
        className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-gray-400 hover:bg-gray-50 transition-colors"
      >
        <Upload className="mx-auto h-12 w-12 text-gray-400" />
        <p className="mt-2 text-sm text-gray-600">
          Click to upload images or drag and drop
        </p>
        <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB each</p>
      </div>

      {/* Selected images preview */}
      {selectedImages.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-sm font-medium">Selected Images:</h4>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {selectedImages.map((image) => (
              <div key={image.id} className="relative group">
                <div className="aspect-square rounded-md overflow-hidden border border-gray-200 bg-gray-100">
                  <img
                    src={typeof image.preview === "string" ? image.preview : ""}
                    alt={image.name}
                    className="w-full h-full object-cover"
                  />

                  {/* Remove button */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeImage(image.id);
                    }}
                    className="absolute -top-1 -right-1 bg-red-500 hover:bg-red-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                  >
                    <X className="h-3 w-3" />
                  </button>

                  {/* Image info overlay */}
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent text-white p-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <p className="text-xs truncate font-medium">{image.name}</p>
                    <p className="text-xs text-gray-200">
                      {formatFileSize(image.size)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Add more button */}
          <button
            type="button"
            onClick={openFileDialog}
            className="inline-flex items-center px-3 py-2 border border-input bg-background hover:bg-accent hover:text-accent-foreground text-sm font-medium rounded-md transition-colors"
          >
            <ImagePlus className="h-4 w-4 mr-2" />
            Add More Images
          </button>
        </div>
      )}

      <p className="text-xs text-muted-foreground">
        Select multiple images. Hover over images to remove them individually.
      </p>
    </div>
  );
};

export default ImageUploadSection;

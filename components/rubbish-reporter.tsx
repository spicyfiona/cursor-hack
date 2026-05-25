"use client";

import { useState, useRef, useCallback } from "react";
import { Camera, X, Check, MapPin, Trash2, Send, ArrowLeft } from "lucide-react";

interface Pin {
  id: string;
  x: number;
  y: number;
  tag: string | null;
}

const RUBBISH_TAGS = [
  "Plastic",
  "Paper",
  "Glass",
  "Metal",
  "Food Waste",
  "Electronic",
  "Hazardous",
  "Other",
];

type Step = "capture" | "mark" | "confirm";

export default function RubbishReporter() {
  const [step, setStep] = useState<Step>("capture");
  const [image, setImage] = useState<string | null>(null);
  const [pins, setPins] = useState<Pin[]>([]);
  const [selectedPin, setSelectedPin] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const imageContainerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageCapture = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setImage(event.target?.result as string);
        setStep("mark");
      };
      reader.readAsDataURL(file);
    }
  }, []);

  const handleImageClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!imageContainerRef.current || step !== "mark") return;

      const rect = imageContainerRef.current.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;

      const newPin: Pin = {
        id: `pin-${Date.now()}`,
        x,
        y,
        tag: null,
      };

      setPins((prev) => [...prev, newPin]);
      setSelectedPin(newPin.id);
    },
    [step]
  );

  const handleTagSelect = useCallback((pinId: string, tag: string) => {
    setPins((prev) =>
      prev.map((pin) => (pin.id === pinId ? { ...pin, tag } : pin))
    );
    setSelectedPin(null);
  }, []);

  const handleRemovePin = useCallback((pinId: string) => {
    setPins((prev) => prev.filter((pin) => pin.id !== pinId));
    setSelectedPin(null);
  }, []);

  const handleSubmit = useCallback(async () => {
    setIsSubmitting(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setStep("confirm");
    setIsSubmitting(false);
  }, []);

  const handleReset = useCallback(() => {
    setImage(null);
    setPins([]);
    setSelectedPin(null);
    setStep("capture");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }, []);

  const allPinsTagged = pins.length > 0 && pins.every((pin) => pin.tag !== null);

  return (
    <div className="flex flex-col min-h-dvh">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-card border-b border-border px-4 py-3">
        <div className="max-w-lg mx-auto flex items-center justify-between">
          {step !== "capture" && step !== "confirm" && (
            <button
              onClick={handleReset}
              className="p-2 -ml-2 text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Go back"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          )}
          <div className={step === "capture" || step === "confirm" ? "w-full" : ""}>
            <h1 className="text-lg font-semibold text-foreground text-center">
              {step === "capture" && "Report Rubbish"}
              {step === "mark" && "Mark Rubbish"}
              {step === "confirm" && "Thank You!"}
            </h1>
          </div>
          {step !== "capture" && step !== "confirm" && <div className="w-9" />}
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Capture Step */}
        {step === "capture" && (
          <div className="flex-1 flex flex-col items-center justify-center p-6 gap-6">
            <div className="text-center space-y-2 max-w-sm">
              <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                <Trash2 className="w-10 h-10 text-primary" />
              </div>
              <h2 className="text-2xl font-bold text-foreground text-balance">
                Help Keep Our Community Clean
              </h2>
              <p className="text-muted-foreground text-pretty">
                Take a photo of rubbish you find, mark its location on the image, and help us track litter in your area.
              </p>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handleImageCapture}
              className="hidden"
              id="image-capture"
            />
            <label
              htmlFor="image-capture"
              className="flex items-center gap-3 px-8 py-4 bg-primary text-primary-foreground rounded-full font-medium text-lg cursor-pointer hover:bg-accent transition-colors shadow-lg"
            >
              <Camera className="w-6 h-6" />
              Take Photo
            </label>
          </div>
        )}

        {/* Mark Step */}
        {step === "mark" && image && (
          <div className="flex-1 flex flex-col">
            {/* Instructions */}
            <div className="bg-muted px-4 py-3 text-center">
              <p className="text-sm text-muted-foreground">
                Tap on the image to mark rubbish locations
              </p>
            </div>

            {/* Image Container */}
            <div className="flex-1 relative overflow-hidden bg-foreground/5">
              <div
                ref={imageContainerRef}
                className="relative w-full h-full min-h-[300px] cursor-crosshair"
                onClick={handleImageClick}
              >
                <img
                  src={image}
                  alt="Captured rubbish"
                  className="w-full h-full object-contain"
                  crossOrigin="anonymous"
                />

                {/* Pins */}
                {pins.map((pin) => (
                  <div
                    key={pin.id}
                    className="absolute transform -translate-x-1/2 -translate-y-full"
                    style={{ left: `${pin.x}%`, top: `${pin.y}%` }}
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedPin(pin.id);
                    }}
                  >
                    <div
                      className={`relative ${
                        pin.tag
                          ? "text-success"
                          : selectedPin === pin.id
                          ? "text-primary animate-bounce"
                          : "text-destructive"
                      }`}
                    >
                      <MapPin className="w-8 h-8 drop-shadow-lg" fill="currentColor" />
                      {pin.tag && (
                        <div className="absolute -top-1 -right-1 w-4 h-4 bg-success rounded-full flex items-center justify-center">
                          <Check className="w-3 h-3 text-success-foreground" />
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Tag Selection Panel */}
            {selectedPin && (
              <div className="bg-card border-t border-border p-4 animate-in slide-in-from-bottom duration-200">
                <div className="max-w-lg mx-auto">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-medium text-foreground">What type of rubbish?</h3>
                    <button
                      onClick={() => handleRemovePin(selectedPin)}
                      className="p-2 text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
                      aria-label="Remove pin"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {RUBBISH_TAGS.map((tag) => {
                      const currentPin = pins.find((p) => p.id === selectedPin);
                      const isSelected = currentPin?.tag === tag;
                      return (
                        <button
                          key={tag}
                          onClick={() => handleTagSelect(selectedPin, tag)}
                          className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                            isSelected
                              ? "bg-primary text-primary-foreground"
                              : "bg-muted text-muted-foreground hover:bg-secondary hover:text-secondary-foreground"
                          }`}
                        >
                          {tag}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* Pin Summary & Submit */}
            {!selectedPin && pins.length > 0 && (
              <div className="bg-card border-t border-border p-4">
                <div className="max-w-lg mx-auto">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm text-muted-foreground">
                      {pins.filter((p) => p.tag).length} of {pins.length} items tagged
                    </span>
                    {!allPinsTagged && (
                      <span className="text-xs text-destructive">
                        Tag all items to submit
                      </span>
                    )}
                  </div>
                  <button
                    onClick={handleSubmit}
                    disabled={!allPinsTagged || isSubmitting}
                    className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-xl font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:bg-accent"
                  >
                    {isSubmitting ? (
                      <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                    ) : (
                      <>
                        <Send className="w-5 h-5" />
                        Submit Report
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Confirmation Step */}
        {step === "confirm" && (
          <div className="flex-1 flex flex-col items-center justify-center p-6 gap-6">
            <div className="text-center space-y-4 max-w-sm">
              <div className="w-24 h-24 rounded-full bg-success/10 flex items-center justify-center mx-auto">
                <Check className="w-12 h-12 text-success" />
              </div>
              <h2 className="text-2xl font-bold text-foreground text-balance">
                Report Submitted!
              </h2>
              <p className="text-muted-foreground text-pretty">
                Thank you for helping keep our community clean. Your report has been received and will be reviewed by our team.
              </p>
              <div className="bg-muted rounded-xl p-4 text-left">
                <h3 className="font-medium text-foreground mb-2">Report Summary</h3>
                <ul className="space-y-1">
                  {pins.map((pin) => (
                    <li key={pin.id} className="flex items-center gap-2 text-sm text-muted-foreground">
                      <MapPin className="w-4 h-4 text-primary" />
                      {pin.tag}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <button
              onClick={handleReset}
              className="flex items-center gap-2 px-8 py-4 bg-primary text-primary-foreground rounded-full font-medium text-lg hover:bg-accent transition-colors shadow-lg"
            >
              <Camera className="w-6 h-6" />
              Report More
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

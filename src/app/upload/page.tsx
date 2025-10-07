"use client";

import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import { Shield, Upload, X, Copy, Check, ArrowLeft, FileText, Lock, Printer } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function UploadPage() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadComplete, setUploadComplete] = useState(false);
  const [secureLink, setSecureLink] = useState("");
  const [otp, setOtp] = useState("");
  const [copied, setCopied] = useState(false);
  
  // Settings
  const [requireOtp, setRequireOtp] = useState(false);
  const [maxPrints, setMaxPrints] = useState("3");

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      setFile(droppedFile);
    }
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
    }
  };

  const removeFile = () => {
    setFile(null);
    setUploadProgress(0);
    setUploadComplete(false);
    setSecureLink("");
    setOtp("");
  };

  const handleUpload = async () => {
    if (!file) return;

    setIsUploading(true);
    setUploadProgress(0);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("requireOtp", String(requireOtp));
      formData.append("maxPrints", maxPrints);

      // Simulate progress (in real implementation, use upload progress events)
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return prev;
          }
          return prev + 10;
        });
      }, 200);

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      clearInterval(progressInterval);

      if (!response.ok) {
        throw new Error("Upload failed");
      }

      const data = await response.json();
      
      setUploadProgress(100);
      setSecureLink(data.link);
      if (data.otp) {
        setOtp(data.otp);
      }
      setUploadComplete(true);
    } catch (error) {
      console.error("Upload error:", error);
      alert("Upload failed. Please try again.");
      setUploadProgress(0);
    } finally {
      setIsUploading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + " " + sizes[i];
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      {/* Navigation */}
      <nav className="border-b bg-background/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-2">
            <Shield className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold">DocuSafe</span>
          </Link>
          <Link href="/">
            <Button variant="ghost">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Home
            </Button>
          </Link>
        </div>
      </nav>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-3xl mx-auto space-y-8">
          <div className="text-center space-y-2">
            <h1 className="text-4xl font-bold">Upload Secure Document</h1>
            <p className="text-muted-foreground">
              Your file will be encrypted and can be printed a limited number of times
            </p>
          </div>

          {!uploadComplete ? (
            <Card className="p-8 space-y-6">
              {/* Drag and Drop Area */}
              {!file ? (
                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  className={`border-2 border-dashed rounded-lg p-12 text-center transition-all cursor-pointer ${
                    isDragging
                      ? "border-primary bg-primary/5 scale-[1.02]"
                      : "border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/50"
                  }`}
                  onClick={() => document.getElementById("file-input")?.click()}
                >
                  <div className="flex flex-col items-center space-y-4">
                    <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                      <Upload className="h-8 w-8 text-primary" />
                    </div>
                    <div>
                      <p className="text-lg font-semibold mb-1">
                        Drop your file here or click to browse
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Maximum file size: 100MB
                      </p>
                    </div>
                  </div>
                  <input
                    id="file-input"
                    type="file"
                    className="hidden"
                    onChange={handleFileSelect}
                  />
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Selected File */}
                  <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="h-10 w-10 rounded bg-primary/10 flex items-center justify-center">
                        <FileText className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-semibold">{file.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {formatFileSize(file.size)}
                        </p>
                      </div>
                    </div>
                    {!isUploading && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={removeFile}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>

                  {/* Upload Progress */}
                  {isUploading && (
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Uploading and encrypting...</span>
                        <span className="font-semibold">{uploadProgress}%</span>
                      </div>
                      <Progress value={uploadProgress} className="h-2" />
                    </div>
                  )}

                  {/* Settings */}
                  {!isUploading && (
                    <div className="space-y-4 pt-4 border-t">
                      <h3 className="font-semibold text-lg">Security Settings</h3>
                      
                      {/* Maximum Prints */}
                      <div className="space-y-2">
                        <Label htmlFor="max-prints">Maximum Prints</Label>
                        <Input
                          id="max-prints"
                          type="number"
                          min="1"
                          max="100"
                          value={maxPrints}
                          onChange={(e) => setMaxPrints(e.target.value)}
                          placeholder="3"
                        />
                        <p className="text-xs text-muted-foreground">
                          File will be deleted after being printed this many times
                        </p>
                      </div>

                      {/* OTP Protection */}
                      <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                        <div className="space-y-1">
                          <div className="flex items-center space-x-2">
                            <Lock className="h-4 w-4" />
                            <Label htmlFor="otp-switch" className="font-semibold">
                              OTP Protection
                            </Label>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            Require a one-time password for additional security
                          </p>
                        </div>
                        <Switch
                          id="otp-switch"
                          checked={requireOtp}
                          onCheckedChange={setRequireOtp}
                        />
                      </div>
                    </div>
                  )}

                  {/* Upload Button */}
                  {!isUploading && (
                    <Button
                      onClick={handleUpload}
                      className="w-full"
                      size="lg"
                    >
                      <Shield className="mr-2 h-5 w-5" />
                      Encrypt and Upload
                    </Button>
                  )}
                </div>
              )}
            </Card>
          ) : (
            /* Upload Complete - Show Secure Link */
            <Card className="p-8 space-y-6">
              <div className="text-center space-y-2">
                <div className="inline-flex h-16 w-16 rounded-full bg-green-500/10 items-center justify-center mb-4">
                  <Check className="h-8 w-8 text-green-500" />
                </div>
                <h2 className="text-2xl font-bold">Upload Complete!</h2>
                <p className="text-muted-foreground">
                  Your file has been encrypted and is ready to share
                </p>
              </div>

              {/* Secure Link */}
              <div className="space-y-2">
                <Label>Secure Link</Label>
                <div className="flex gap-2">
                  <Input
                    value={secureLink}
                    readOnly
                    className="font-mono text-sm"
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => copyToClipboard(secureLink)}
                  >
                    {copied ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Share this link with your recipient. It can only be used once.
                </p>
              </div>

              {/* OTP (if enabled) */}
              {otp && (
                <div className="space-y-2 p-4 bg-amber-500/10 border border-amber-500/20 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <Lock className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                    <Label className="text-amber-900 dark:text-amber-100">
                      One-Time Password
                    </Label>
                  </div>
                  <div className="flex gap-2">
                    <Input
                      value={otp}
                      readOnly
                      className="font-mono text-lg font-bold bg-background"
                    />
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => copyToClipboard(otp)}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                  <p className="text-xs text-amber-800 dark:text-amber-200">
                    Share this OTP separately with your recipient. They'll need it to access the file.
                  </p>
                </div>
              )}

              {/* Important Notes */}
              <div className="space-y-2 p-4 bg-muted/50 rounded-lg text-sm">
                <p className="font-semibold">⚠️ Important:</p>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                  <li>This file can be printed <strong>{maxPrints} time{parseInt(maxPrints) !== 1 ? 's' : ''}</strong></li>
                  <li>After reaching the print limit, the file is permanently deleted</li>
                  <li>Each print counts towards the limit</li>
                  <li>Save the link now - you won't see it again</li>
                </ul>
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <Button onClick={removeFile} className="flex-1">
                  Upload Another File
                </Button>
                <Link href="/" className="flex-1">
                  <Button variant="outline" className="w-full">
                    Back to Home
                  </Button>
                </Link>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
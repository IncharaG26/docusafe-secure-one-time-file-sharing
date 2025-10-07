"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Shield, ArrowLeft, FileText, Lock, Download, Printer, AlertCircle } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

export default function AccessPage() {
  const searchParams = useSearchParams();
  const [fileId, setFileId] = useState("");
  const [otp, setOtp] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [isPrinting, setIsPrinting] = useState(false);
  const [verified, setVerified] = useState(false);
  const [fileInfo, setFileInfo] = useState<{
    fileName: string;
    fileSize: string;
    requiresOtp: boolean;
    printCount: number;
    maxPrints: number;
    printsRemaining: number;
  } | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const idFromUrl = searchParams?.get("id");
    if (idFromUrl) {
      setFileId(idFromUrl);
    }
  }, [searchParams]);

  const handleVerify = async () => {
    if (!fileId.trim()) {
      setError("Please enter a file ID");
      return;
    }

    setIsVerifying(true);
    setError("");

    try {
      const response = await fetch("/api/verify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fileId: fileId.trim(),
          otp: otp || undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Verification failed");
      }

      setFileInfo({
        fileName: data.fileName,
        fileSize: data.fileSize,
        requiresOtp: data.requiresOtp,
        printCount: data.printCount,
        maxPrints: data.maxPrints,
        printsRemaining: data.printsRemaining,
      });
      setVerified(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Verification failed");
    } finally {
      setIsVerifying(false);
    }
  };

  const handlePrint = async () => {
    if (!fileId.trim()) return;

    setIsPrinting(true);
    setError("");

    try {
      const response = await fetch("/api/download", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fileId: fileId.trim(),
          otp: otp || undefined,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Print failed");
      }

      // Get file data
      const blob = await response.blob();
      
      // Get print count info from headers
      const printCount = response.headers.get("X-Print-Count");
      const maxPrints = response.headers.get("X-Max-Prints");
      const printsRemaining = response.headers.get("X-Prints-Remaining");
      
      // Create a URL for the blob and trigger download
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = fileInfo?.fileName || "download";
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      // Show print dialog
      setTimeout(() => {
        window.print();
      }, 500);

      // Update file info with new print count
      if (printCount && maxPrints && printsRemaining && fileInfo) {
        const newPrintCount = parseInt(printCount);
        const newPrintsRemaining = parseInt(printsRemaining);
        
        setFileInfo({
          ...fileInfo,
          printCount: newPrintCount,
          printsRemaining: newPrintsRemaining,
        });

        // If no prints remaining, show message and reset
        if (newPrintsRemaining === 0) {
          setTimeout(() => {
            alert("This was the last available print. The file has been permanently deleted.");
            setVerified(false);
            setFileInfo(null);
            setFileId("");
            setOtp("");
          }, 1000);
        }
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Print failed");
    } finally {
      setIsPrinting(false);
    }
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
        <div className="max-w-2xl mx-auto space-y-8">
          <div className="text-center space-y-2">
            <h1 className="text-4xl font-bold">Access Secure Document</h1>
            <p className="text-muted-foreground">
              Enter your file ID and print your document
            </p>
          </div>

          <Card className="p-8 space-y-6">
            {!verified ? (
              /* Verification Form */
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="file-id">File ID or Secure Link</Label>
                  <Input
                    id="file-id"
                    value={fileId}
                    onChange={(e) => setFileId(e.target.value)}
                    placeholder="Enter file ID or paste secure link"
                    className="font-mono"
                  />
                  <p className="text-xs text-muted-foreground">
                    Paste the complete secure link or just the file ID
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="otp">One-Time Password (if required)</Label>
                  <div className="flex gap-2">
                    <Lock className="h-4 w-4 text-muted-foreground mt-3" />
                    <Input
                      id="otp"
                      type="text"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      placeholder="Enter OTP if provided"
                      className="font-mono"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Leave blank if no OTP was set
                  </p>
                </div>

                {error && (
                  <div className="flex items-start gap-2 p-3 bg-destructive/10 border border-destructive/20 rounded-lg text-sm text-destructive">
                    <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                <Button
                  onClick={handleVerify}
                  disabled={isVerifying || !fileId.trim()}
                  className="w-full"
                  size="lg"
                >
                  {isVerifying ? "Verifying..." : "Verify and Access File"}
                </Button>
              </div>
            ) : (
              /* File Info and Print */
              <div className="space-y-6">
                <div className="text-center space-y-2">
                  <div className="inline-flex h-16 w-16 rounded-full bg-green-500/10 items-center justify-center mb-2">
                    <FileText className="h-8 w-8 text-green-500" />
                  </div>
                  <h2 className="text-2xl font-bold">File Verified!</h2>
                  <p className="text-muted-foreground">Ready to print</p>
                </div>

                {/* File Details */}
                <div className="space-y-3 p-4 bg-muted/50 rounded-lg">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">File Name:</span>
                    <span className="font-semibold">{fileInfo?.fileName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">File Size:</span>
                    <span className="font-semibold">{fileInfo?.fileSize}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Times Printed:</span>
                    <span className="font-semibold">{fileInfo?.printCount} / {fileInfo?.maxPrints}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Prints Remaining:</span>
                    <span className="font-bold text-primary">{fileInfo?.printsRemaining}</span>
                  </div>
                </div>

                {/* Print Warning */}
                <div className="flex items-start gap-2 p-4 bg-amber-500/10 border border-amber-500/20 rounded-lg text-sm">
                  <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
                  <div className="space-y-1">
                    <p className="font-semibold text-amber-900 dark:text-amber-100">
                      Print Limit Notice
                    </p>
                    <p className="text-amber-800 dark:text-amber-200">
                      This file can be printed <strong>{fileInfo?.printsRemaining} more time{fileInfo?.printsRemaining !== 1 ? 's' : ''}</strong>. 
                      After reaching the print limit, it will be permanently deleted.
                    </p>
                  </div>
                </div>

                {error && (
                  <div className="flex items-start gap-2 p-3 bg-destructive/10 border border-destructive/20 rounded-lg text-sm text-destructive">
                    <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                {/* Print Button */}
                <Button
                  onClick={handlePrint}
                  disabled={isPrinting || (fileInfo?.printsRemaining ?? 0) <= 0}
                  className="w-full"
                  size="lg"
                >
                  <Printer className="mr-2 h-5 w-5" />
                  {isPrinting ? "Preparing Print..." : "Print Document"}
                </Button>

                {/* Back Button */}
                <Button
                  onClick={() => {
                    setVerified(false);
                    setFileInfo(null);
                    setFileId("");
                    setOtp("");
                    setError("");
                  }}
                  variant="outline"
                  className="w-full"
                >
                  Access Another File
                </Button>
              </div>
            )}
          </Card>

          {/* Security Notice */}
          <div className="text-center text-sm text-muted-foreground space-y-2">
            <p>🔒 All files are encrypted end-to-end</p>
            <p>Files are automatically deleted after reaching the print limit</p>
          </div>
        </div>
      </div>
    </div>
  );
}
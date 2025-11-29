import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Camera, CheckCircle, XCircle } from 'lucide-react';
import { toast } from 'sonner';
import jsQR from 'jsqr';

const QRScanner = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [scanning, setScanning] = useState(false);
  const [lastScanned, setLastScanned] = useState<string | null>(null);
  const [scanResult, setScanResult] = useState<'success' | 'error' | null>(null);

  useEffect(() => {
    if (scanning && videoRef.current) {
      startCamera();
    } else {
      stopCamera();
    }

    return () => stopCamera();
  }, [scanning]);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
        requestAnimationFrame(scanFrame);
      }
    } catch (error) {
      toast.error('Camera access denied');
      setScanning(false);
    }
  };

  const stopCamera = () => {
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach((track) => track.stop());
    }
  };

  const scanFrame = () => {
    if (!scanning || !videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    if (!context || video.readyState !== video.HAVE_ENOUGH_DATA) {
      requestAnimationFrame(scanFrame);
      return;
    }

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
    const code = jsQR(imageData.data, imageData.width, imageData.height);

    if (code && code.data !== lastScanned) {
      handleQRCode(code.data);
      setLastScanned(code.data);
    }

    requestAnimationFrame(scanFrame);
  };

  const handleQRCode = (data: string) => {
    // Validate the QR code format (userId-eventId-timestamp)
    if (data.includes('-') && data.split('-').length === 3) {
      setScanResult('success');
      toast.success('Check-in successful! ✓');

      // Save check-in record
      const checkIns = JSON.parse(localStorage.getItem('checkIns') || '[]');
      checkIns.push({
        token: data,
        timestamp: new Date().toISOString(),
      });
      localStorage.setItem('checkIns', JSON.stringify(checkIns));

      setTimeout(() => setScanResult(null), 3000);
    } else {
      setScanResult('error');
      toast.error('Invalid QR code');
      setTimeout(() => setScanResult(null), 3000);
    }
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">QR Check-In Scanner</h1>
        <p className="text-muted-foreground">Scan attendee badges for event check-in</p>
      </div>

      <div className="max-w-2xl mx-auto">

        <Card className="p-6 shadow-card">
          <div className="space-y-6">
            {!scanning ? (
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-primary/10 mb-4">
                  <Camera className="h-12 w-12 text-primary" />
                </div>
                <p className="text-muted-foreground mb-6">
                  Click the button below to start scanning QR codes
                </p>
                <Button onClick={() => setScanning(true)} size="lg" className="gradient-primary">
                  <Camera className="mr-2 h-5 w-5" />
                  Start Scanning
                </Button>
              </div>
            ) : (
              <div>
                <div className="relative bg-black rounded-lg overflow-hidden mb-4">
                  <video
                    ref={videoRef}
                    className="w-full h-auto"
                    playsInline
                    muted
                    style={{ maxHeight: '400px' }}
                  />
                  <canvas ref={canvasRef} className="hidden" />

                  {scanResult && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                      {scanResult === 'success' ? (
                        <div className="text-center">
                          <CheckCircle className="h-24 w-24 text-success mx-auto mb-4" />
                          <p className="text-2xl font-bold text-white">Check-in Successful!</p>
                        </div>
                      ) : (
                        <div className="text-center">
                          <XCircle className="h-24 w-24 text-destructive mx-auto mb-4" />
                          <p className="text-2xl font-bold text-white">Invalid Code</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <Button onClick={() => setScanning(false)} variant="outline" className="w-full">
                  Stop Scanning
                </Button>
              </div>
            )}
          </div>
        </Card>

        <div className="mt-8">
          <Card className="p-6 shadow-card">
            <h3 className="font-bold mb-4">Instructions</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>• Point your camera at the attendee's QR code badge</li>
              <li>• The system will automatically scan and validate</li>
              <li>• Green check = successful check-in</li>
              <li>• Red X = invalid or duplicate code</li>
            </ul>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default QRScanner;
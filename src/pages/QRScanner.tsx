import { useState, useRef, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Camera, CheckCircle, XCircle, AlertCircle, ScanLine } from 'lucide-react';
import { toast } from 'sonner';
import jsQR from 'jsqr';
import { eventService } from '@/services/event.service';

type ScanResult = 'success' | 'error' | 'already' | null;

interface LastResult {
  name?: string;
  eventTitle?: string;
  error?: string;
}

const QRScanner = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [scanning, setScanning] = useState(false);
  const [lastScanned, setLastScanned] = useState<string | null>(null);
  const [scanResult, setScanResult] = useState<ScanResult>(null);
  const [lastResult, setLastResult] = useState<LastResult>({});
  const processingRef = useRef(false);

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
    if (!videoRef.current || !canvasRef.current) return;
    if (processingRef.current) {
      requestAnimationFrame(scanFrame);
      return;
    }

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

    if (code && code.data && code.data !== lastScanned) {
      handleQRCode(code.data);
      setLastScanned(code.data);
    }

    requestAnimationFrame(scanFrame);
  };

  const handleQRCode = async (token: string) => {
    if (processingRef.current) return;
    processingRef.current = true;

    try {
      const result = await eventService.checkInByToken(token);
      setLastResult({ name: result.data?.name, eventTitle: result.data?.eventTitle });
      setScanResult('success');
      toast.success(`✓ ${result.data?.name ?? 'Attendee'} checked in!`);
    } catch (err: any) {
      const msg: string = err?.response?.data?.error || 'Invalid QR code';
      const alreadyCheckedIn = msg.toLowerCase().includes('already');
      setLastResult({ error: msg });
      setScanResult(alreadyCheckedIn ? 'already' : 'error');
      if (alreadyCheckedIn) {
        toast.warning(msg);
      } else {
        toast.error(msg);
      }
    } finally {
      setTimeout(() => {
        setScanResult(null);
        setLastResult({});
        processingRef.current = false;
        // allow re-scan of same code after 4 s
        setTimeout(() => setLastScanned(null), 1000);
      }, 3000);
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
                    <div className="absolute inset-0 flex items-center justify-center bg-black/70">
                      {scanResult === 'success' ? (
                        <div className="text-center">
                          <CheckCircle className="h-24 w-24 text-green-400 mx-auto mb-4" />
                          <p className="text-2xl font-bold text-white">Check-in Successful!</p>
                          {lastResult.name && (
                            <p className="text-lg text-green-300 mt-1">{lastResult.name}</p>
                          )}
                          {lastResult.eventTitle && (
                            <p className="text-sm text-white/70 mt-1">{lastResult.eventTitle}</p>
                          )}
                        </div>
                      ) : scanResult === 'already' ? (
                        <div className="text-center">
                          <AlertCircle className="h-24 w-24 text-yellow-400 mx-auto mb-4" />
                          <p className="text-2xl font-bold text-white">Already Checked In</p>
                          {lastResult.name && (
                            <p className="text-lg text-yellow-300 mt-1">{lastResult.name}</p>
                          )}
                        </div>
                      ) : (
                        <div className="text-center">
                          <XCircle className="h-24 w-24 text-red-400 mx-auto mb-4" />
                          <p className="text-2xl font-bold text-white">Invalid QR Code</p>
                          {lastResult.error && (
                            <p className="text-sm text-white/70 mt-2">{lastResult.error}</p>
                          )}
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
              <li className="flex items-center gap-2"><Camera className="h-4 w-4 shrink-0" /> Point your camera at the attendee's QR code badge</li>
              <li className="flex items-center gap-2"><ScanLine className="h-4 w-4 shrink-0" /> The system will automatically scan and validate</li>
              <li className="flex items-center gap-2"><CheckCircle className="h-4 w-4 shrink-0 text-green-500" /> Green check = successful check-in</li>
              <li className="flex items-center gap-2"><AlertCircle className="h-4 w-4 shrink-0 text-yellow-500" /> Yellow = already checked in</li>
              <li className="flex items-center gap-2"><XCircle className="h-4 w-4 shrink-0 text-red-500" /> Red X = invalid or unrecognized code</li>
            </ul>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default QRScanner;

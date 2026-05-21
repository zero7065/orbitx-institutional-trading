import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Shield, Upload, CheckCircle, Clock, XCircle, Loader2, AlertTriangle } from 'lucide-react';
import { useAuth } from '../../App';

export default function KYCPage() {
  const navigate = useNavigate();
  const { user, setUser } = useAuth();
  const [submitting, setSubmitting] = useState(false);
  const [document, setDocument] = useState<File | null>(null);
  const [selfie, setSelfie] = useState<File | null>(null);
  const [previewDoc, setPreviewDoc] = useState<string | null>(null);
  const [previewSelfie, setPreviewSelfie] = useState<string | null>(null);

  const kycStatus = user?.kycStatus || 'NONE';

  const handleDocumentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setDocument(file);
      const reader = new FileReader();
      reader.onloadend = () => setPreviewDoc(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSelfieChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelfie(file);
      const reader = new FileReader();
      reader.onloadend = () => setPreviewSelfie(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!document || !selfie) {
      toast.error('Please upload both identity document and selfie');
      return;
    }
    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('document', document);
      formData.append('selfie', selfie);
      
      const res = await fetch('/api/kyc/upload', {
        method: 'POST',
        body: formData
      });
      
      if (res.ok) {
        toast.success('KYC documents submitted! Please wait for review.');
        setUser((prev: any) => prev ? { ...prev, kycStatus: 'PENDING' } : prev);
      } else {
        const data = await res.json();
        toast.error(data.error || 'Failed to submit KYC');
      }
    } catch (err) {
      toast.error('Error submitting KYC');
    } finally {
      setSubmitting(false);
    }
  };

  if (kycStatus === 'APPROVED') {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="glass-card p-8 text-center">
          <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="text-green-500" size={40} />
          </div>
          <h1 className="text-2xl font-black mb-4">KYC Verified</h1>
          <p className="text-gray-400 mb-6">Your identity has been verified. You can now access all features including deposits, withdrawals, and investments.</p>
          <button onClick={() => navigate('/dashboard')} className="px-6 py-3 bg-brand-teal text-slate-900 font-bold rounded-xl">
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  if (kycStatus === 'PENDING') {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="glass-card p-8 text-center">
          <div className="w-20 h-20 bg-yellow-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <Clock className="text-yellow-500" size={40} />
          </div>
          <h1 className="text-2xl font-black mb-4">KYC Pending Review</h1>
          <p className="text-gray-400 mb-2">Your documents are being reviewed by our team.</p>
          <p className="text-sm text-gray-500">This usually takes 24-48 hours. You'll be notified once verified.</p>
          <div className="mt-8 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-xl">
            <div className="flex items-center gap-3 text-yellow-400 text-sm">
              <AlertTriangle size={18} />
              While your KYC is pending, you cannot make deposits or withdrawals
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (kycStatus === 'REJECTED') {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="glass-card p-8 text-center">
          <div className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <XCircle className="text-red-500" size={40} />
          </div>
          <h1 className="text-2xl font-black mb-4">KYC Rejected</h1>
          <p className="text-gray-400 mb-6">Your documents were not accepted. Please try again with clearer images.</p>
          <button onClick={() => window.location.reload()} className="px-6 py-3 bg-brand-teal text-slate-900 font-bold rounded-xl">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-black mb-2">Complete Your Verification</h1>
        <p className="text-gray-500">Verify your identity to access deposits, withdrawals, and investments</p>
      </div>

      <div className="glass-card p-6 border-l-4 border-brand-teal">
        <div className="flex items-start gap-4">
          <Shield className="text-brand-teal mt-1" size={24} />
          <div>
            <h3 className="font-bold mb-2">Why verify your identity?</h3>
            <ul className="text-sm text-gray-400 space-y-1">
              <li>• Required for all deposits and withdrawals</li>
              <li>• Unlocks full platform features</li>
              <li>• Protects your account from unauthorized access</li>
              <li>• Quick verification process</li>
            </ul>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="glass-card p-8 space-y-6">
        <div>
          <label className="block font-bold mb-4">Identity Document (Passport/ID/Driver's License)</label>
          <div className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all ${previewDoc ? 'border-brand-teal bg-brand-teal/5' : 'border-white/20'}`}>
            {previewDoc ? (
              <div className="relative">
                <img src={previewDoc} alt="Document" className="max-h-48 mx-auto rounded-xl" />
                <button type="button" onClick={() => { setDocument(null); setPreviewDoc(null); }} className="absolute top-2 right-2 p-1 bg-red-500 rounded-full text-white">
                  <XCircle size={20} />
                </button>
              </div>
            ) : (
              <label className="cursor-pointer">
                <Upload className="text-gray-400 mx-auto mb-2" size={40} />
                <p className="text-gray-400">Click to upload or drag and drop</p>
                <p className="text-xs text-gray-500 mt-2">PNG, JPG up to 10MB</p>
                <input type="file" accept="image/*" onChange={handleDocumentChange} className="hidden" />
              </label>
            )}
          </div>
        </div>

        <div>
          <label className="block font-bold mb-4">Selfie with Document</label>
          <div className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all ${previewSelfie ? 'border-brand-teal bg-brand-teal/5' : 'border-white/20'}`}>
            {previewSelfie ? (
              <div className="relative">
                <img src={previewSelfie} alt="Selfie" className="max-h-48 mx-auto rounded-xl" />
                <button type="button" onClick={() => { setSelfie(null); setPreviewSelfie(null); }} className="absolute top-2 right-2 p-1 bg-red-500 rounded-full text-white">
                  <XCircle size={20} />
                </button>
              </div>
            ) : (
              <label className="cursor-pointer">
                <Upload className="text-gray-400 mx-auto mb-2" size={40} />
                <p className="text-gray-400">Take a photo holding your document</p>
                <p className="text-xs text-gray-500 mt-2">Make sure your face and document are clearly visible</p>
                <input type="file" accept="image/*" onChange={handleSelfieChange} className="hidden" />
              </label>
            )}
          </div>
        </div>

        <button
          type="submit"
          disabled={submitting || !document || !selfie}
          className="w-full py-4 bg-brand-teal text-slate-900 font-bold rounded-xl hover:bg-cyan-400 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {submitting ? (
            <>
              <Loader2 className="animate-spin" size={20} />
              Submitting...
            </>
          ) : (
            <>
              <CheckCircle size={20} />
              Submit for Verification
            </>
          )}
        </button>
      </form>
    </div>
  );
}
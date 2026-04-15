import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import html2canvas from 'html2canvas';
import { CloseIcon, DownloadImageIcon, CopyClipboardIcon, ShareLinkSmallIcon } from './Icons';

function ShareModal({ isOpen, onClose, shareUrl, cardRef }) {
  const [linkCopied, setLinkCopied] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [copying, setCopying] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2500);
  };

  if (!isOpen) return null;

  const captureCard = () =>
    html2canvas(cardRef.current, {
      scale: 2,
      useCORS: true,
      backgroundColor: '#FFFFFF',
    });

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl || '');
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 2000);
      showToast('Link copied.');
    } catch {
      // fallback: do nothing
    }
  };

  const handleDownload = async () => {
    if (!cardRef?.current || downloading) return;
    setDownloading(true);
    try {
      const canvas = await captureCard();
      const link = document.createElement('a');
      link.download = 'reviewly-score-card.png';
      link.href = canvas.toDataURL('image/png');
      link.click();
      showToast('Saved! Ready to share.');
    } catch (err) {
      console.error('Download failed', err);
    } finally {
      setDownloading(false);
    }
  };

  const handleCopyImage = async () => {
    if (!cardRef?.current || copying) return;
    setCopying(true);
    try {
      const canvas = await captureCard();
      canvas.toBlob(async (blob) => {
        if (!blob) {
          setCopying(false);
          showToast('Could not copy image. Try downloading instead.');
          return;
        }
        try {
          await navigator.clipboard.write([
            new ClipboardItem({ 'image/png': blob }),
          ]);
          setCopying(false);
          showToast('Card copied. Paste it anywhere.');
        } catch {
          setCopying(false);
          showToast('Copy failed. Try downloading instead.');
        }
      }, 'image/png');
    } catch (err) {
      console.error('Copy image failed', err);
      setCopying(false);
      showToast('Could not copy image. Try downloading instead.');
    }
  };

  return (
    <>
      {/* Toast */}
      {toast && ReactDOM.createPortal(
        <div
          className="font-inter font-medium text-[13px] text-white bg-[#1A1A2E] px-[18px] py-[10px] rounded-[10px] shadow-lg animate-fade-in-up whitespace-nowrap"
          style={{ position: 'fixed', bottom: 28, left: '50%', transform: 'translateX(-50%)', zIndex: 9999, pointerEvents: 'none' }}
        >
          {toast}
        </div>,
        document.body
      )}
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
        role="dialog"
        aria-modal="true"
        aria-labelledby="share-modal-title"
        onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      >
        <div className="bg-white rounded-[16px] shadow-lg w-full max-w-[480px] p-[24px] flex flex-col gap-[16px]">

          {/* Header */}
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2
                id="share-modal-title"
                className="font-inter font-bold text-[16px] text-[#45464E]"
              >
                Share Result
              </h2>
              <p className="font-inter font-normal text-[13px] text-[#45464E] mt-[16px]">
                No answers included — just your latest mock score breakdown.
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="shrink-0 p-1 -m-1 rounded hover:bg-gray-100 transition-colors mt-[2px]"
            >
              <CloseIcon className="w-[24px] h-[24px]" />
            </button>
          </div>

          {/* Download as Image */}
          <div className="bg-[#FCFBFC] flex items-center gap-[16px] p-[16px] rounded-[8px] border border-[#EBEBEB]">
            <div className="w-[48px] h-[48px] border border-[#EBEBEB] rounded-[8px] bg-[#FFFFFFF2] flex items-center justify-center shrink-0">
              <DownloadImageIcon className="w-[24px] h-[24px]" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-inter font-semibold text-[14px] text-[#45464E]">Download as Image (PNG)</p>
              <p className="font-inter font-normal text-[12px] text-[#45464E]">Best for Messenger, FB, IG Story</p>
            </div>
            <button
              type="button"
              onClick={handleDownload}
              className="shrink-0 font-inter font-regular text-[14px] text-[#421A83] bg-[#FFC92A] hover:opacity-90 transition-opacity py-[7.5px] px-[16px] rounded-[8px] whitespace-nowrap"
            >
              Download
            </button>
          </div>

          {/* Copy Image to Clipboard */}
          <div className="bg-[#FCFBFC] flex items-center gap-[16px] p-[16px] rounded-[8px] border border-[#EBEBEB]">
            <div className="w-[48px] h-[48px] border border-[#EBEBEB] rounded-[8px] bg-[#FFFFFFF2] flex items-center justify-center shrink-0">
              <CopyClipboardIcon className="w-[22px] h-[22px]" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-inter font-semibold text-[14px] text-[#45464E]">Copy Image to Clipboard</p>
              <p className="font-inter font-normal text-[12px] text-[#45464E]">Paste your card image anywhere</p>
            </div>
            <button
              type="button"
              onClick={handleCopyImage}
              className="shrink-0 font-inter font-regular text-[14px] text-[#421A83] bg-[#FFC92A] hover:opacity-90 transition-opacity py-[7.5px] px-[16px] rounded-[8px] whitespace-nowrap"
            >
              Copy
            </button>
          </div>

          {/* Divider */}
          <p className="font-inter font-normal text-[14px] text-[#0F172ABF]">
            Or share via link (opens your card in browser)
          </p>

          {/* Link row */}
          <div className="bg-[#FCFBFC] gap-[16px] p-[16px] rounded-[8px] border border-[#EBEBEB]">
            <div className='flex flex-row'>
              <div className='max-w-[300px] flex items-center gap-[8px] border border-[#EBEBEB] rounded-bl-[8px] rounded-tl-[8px] p-[9px]'>
                <ShareLinkSmallIcon className="w-[16px] h-[16px] shrink-0 text-[#6B7280]" />
                <span className="flex-1 font-inter font-normal text-[12px] text-[#45464E] truncate">
                  {shareUrl || 'Link unavailable'}
                </span>
              </div>
              <button
                type="button"
                onClick={handleCopyLink}
                className="w-[99px] shrink-0 font-inter font-regular text-[14px] text-[#421A83] bg-[#FFC92A] hover:opacity-90 transition-opacity py-[7px] px-[16px] rounded-tr-[8px] rounded-br-[8px] whitespace-nowrap"
              >
                {linkCopied ? 'Copied!' : 'Copy'}
              </button>
            </div>
          </div>

        </div>
      </div>
    </>
  );
}

export default ShareModal;

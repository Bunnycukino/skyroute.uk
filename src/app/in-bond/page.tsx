'use client';
import { useState } from 'react';
import { createSupabaseBrowserClient } from '@/lib/supabaseClient';
export default function InBondControlSheetPage() {
  const supabase = createSupabaseBrowserClient();
  const [uploading, setUploading] = useState(false);
  const [url, setUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const onFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.type !== 'application/pdf') {
      setError('Wgraj plik PDF.');
      return;
    }
    try {
      setError(null);
      setUploading(true);
      const path = `public/${Date.now()}-${file.name}`;
      const { error: uploadError } = await supabase.storage
        .from('in-bond-sheets')
        .upload(path, file, { upsert: false, contentType: 'application/pdf' });
      if (uploadError) {
        console.error(uploadError);
        setError('Upload nieudany.');
        return;
      }
      const { data, error: urlError } = await supabase.storage
        .from('in-bond-sheets')
        .createSignedUrl(path, 60 * 60);
      if (urlError || !data?.signedUrl) {
        console.error(urlError);
        setError('Nie moge utworzyc linku do podgladu.');
        return;
      }
      setUrl(data.signedUrl);
    } finally {
      setUploading(false);
    }
  };
  return (
    <div className="p-4 space-y-4">
      <h1 className="text-xl font-semibold">In Bond Control Sheet</h1>
      <input
        type="file"
        accept="application/pdf"
        onChange={onFileChange}
        disabled={uploading}
      />
      {uploading && <p>Uploading...</p>}
      {error && <p className="text-red-600">{error}</p>}
      {url && (
        <div className="border rounded overflow-hidden" style={{ height: '80vh' }}>
          <iframe
            src={url}
            style={{ width: '100%', height: '100%' }}
            title="In Bond Control Sheet PDF"
          />
        </div>
      )}
    </div>
  );
}

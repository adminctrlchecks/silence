'use client';

import { IMPORT_TYPES, type ImportJob, type ImportType } from '@silence/shared';
import { Download, FileSpreadsheet, Loader2, RefreshCw, UploadCloud, X } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

const importLabels: Record<ImportType, string> = {
  questions: 'Common questions',
  'answers-level1': 'Level 1 answers',
  'answers-level2': 'Level 2 answers',
  remedies: 'Remedies',
};

async function parseJson<T>(response: Response): Promise<T> {
  const data = await response.json().catch(() => null);
  if (!response.ok) {
    throw new Error(data?.error?.message ?? 'Request failed');
  }
  return data as T;
}

export function ImportAdmin() {
  const [type, setType] = useState<ImportType>('questions');
  const [file, setFile] = useState<File | null>(null);
  const [job, setJob] = useState<ImportJob | null>(null);
  const [uploading, setUploading] = useState(false);
  const [polling, setPolling] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const templateHref = useMemo(() => `/api/admin/import/template?type=${type}`, [type]);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setFile(acceptedFiles[0] ?? null);
    setError(null);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: false,
    accept: {
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
    },
  });

  async function refreshJob(jobId: string) {
    setPolling(true);
    setError(null);

    try {
      const result = await parseJson<ImportJob>(await fetch(`/api/admin/import/${jobId}`));
      setJob(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to load import status');
    } finally {
      setPolling(false);
    }
  }

  useEffect(() => {
    if (!job || job.status !== 'processing') return;

    const interval = window.setInterval(() => {
      void refreshJob(job.jobId);
    }, 1500);

    return () => window.clearInterval(interval);
  }, [job]);

  async function uploadFile() {
    if (!file) {
      setError('Choose an .xlsx file before uploading.');
      return;
    }

    setUploading(true);
    setError(null);
    setJob(null);

    try {
      const formData = new FormData();
      formData.set('file', file);
      const result = await parseJson<ImportJob>(
        await fetch(`/api/admin/import?type=${type}`, {
          method: 'POST',
          body: formData,
        }),
      );
      setJob(result);
      if (result.status === 'processing') {
        await refreshJob(result.jobId);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to upload import file');
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="space-y-5">
      <section className="rounded-md border border-border bg-card p-4 shadow-sm">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm font-medium text-primary">Import Mode</p>
            <h2 className="mt-1 text-2xl font-semibold tracking-normal">Excel import</h2>
          </div>
          <Button asChild variant="outline">
            <a href={templateHref}>
              <Download />
              Template
            </a>
          </Button>
        </div>
      </section>

      <section className="grid gap-5 xl:grid-cols-[420px_1fr]">
        <div className="rounded-md border border-border bg-card p-4 shadow-sm">
          <div className="space-y-2">
            <Label htmlFor="type">Import type</Label>
            <select
              id="type"
              className="h-10 w-full rounded-md border border-border bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
              value={type}
              onChange={(event) => {
                setType(event.target.value as ImportType);
                setFile(null);
                setJob(null);
                setError(null);
              }}
            >
              {IMPORT_TYPES.map((item) => (
                <option key={item} value={item}>
                  {importLabels[item]}
                </option>
              ))}
            </select>
          </div>

          <div
            {...getRootProps({
              className: cn(
                'mt-4 flex min-h-48 cursor-pointer flex-col items-center justify-center rounded-md border border-dashed border-border bg-background px-4 py-8 text-center transition-colors',
                isDragActive && 'border-primary bg-primary/10',
              ),
            })}
          >
            <input {...getInputProps()} />
            <UploadCloud className="size-8 text-primary" />
            <p className="mt-3 text-sm font-medium">
              {isDragActive ? 'Drop the workbook here' : 'Drop an .xlsx file here'}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">Spreadsheet must match the selected template.</p>
          </div>

          {file ? (
            <div className="mt-4 flex items-center justify-between gap-3 rounded-md border border-border bg-background px-3 py-2">
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">{file.name}</p>
                <p className="text-xs text-muted-foreground">{Math.ceil(file.size / 1024)} KB</p>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => setFile(null)}
                aria-label="Remove file"
                title="Remove file"
              >
                <X />
              </Button>
            </div>
          ) : null}

          {error ? (
            <p role="alert" className="mt-4 rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {error}
            </p>
          ) : null}

          <Button type="button" className="mt-4 w-full" onClick={() => void uploadFile()} disabled={uploading || !file}>
            {uploading ? <Loader2 className="animate-spin" /> : <FileSpreadsheet />}
            Upload workbook
          </Button>
        </div>

        <section className="rounded-md border border-border bg-card shadow-sm">
          <div className="flex items-center justify-between gap-3 border-b border-border px-4 py-3">
            <h2 className="text-base font-semibold tracking-normal">Job status</h2>
            {job ? (
              <Button type="button" variant="outline" size="sm" onClick={() => void refreshJob(job.jobId)} disabled={polling}>
                <RefreshCw className={polling ? 'animate-spin' : undefined} />
                Refresh
              </Button>
            ) : null}
          </div>

          {job ? (
            <div className="space-y-4 p-4">
              <div className="grid gap-3 sm:grid-cols-4">
                <div className="rounded-md border border-border bg-background p-3">
                  <p className="text-xs text-muted-foreground">Status</p>
                  <p className="mt-1 text-sm font-semibold capitalize">{job.status}</p>
                </div>
                <div className="rounded-md border border-border bg-background p-3">
                  <p className="text-xs text-muted-foreground">Created</p>
                  <p className="mt-1 text-sm font-semibold">{job.created ?? 0}</p>
                </div>
                <div className="rounded-md border border-border bg-background p-3">
                  <p className="text-xs text-muted-foreground">Updated</p>
                  <p className="mt-1 text-sm font-semibold">{job.updated ?? 0}</p>
                </div>
                <div className="rounded-md border border-border bg-background p-3">
                  <p className="text-xs text-muted-foreground">Errors</p>
                  <p className="mt-1 text-sm font-semibold">{job.errors?.length ?? 0}</p>
                </div>
              </div>

              {job.errors?.length ? (
                <div className="overflow-hidden rounded-md border border-border">
                  <table className="w-full text-sm">
                    <thead className="bg-muted text-muted-foreground">
                      <tr>
                        <th className="w-24 px-3 py-2 text-start font-medium">Row</th>
                        <th className="px-3 py-2 text-start font-medium">Message</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border bg-background">
                      {job.errors.map((rowError) => (
                        <tr key={`${rowError.row}-${rowError.message}`}>
                          <td className="px-3 py-2">{rowError.row}</td>
                          <td className="px-3 py-2">{rowError.message}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="rounded-md border border-border bg-background p-4 text-sm text-muted-foreground">
                  No row errors reported for this job.
                </p>
              )}
            </div>
          ) : (
            <p className="p-4 text-sm text-muted-foreground">Upload a workbook to see import results.</p>
          )}
        </section>
      </section>
    </div>
  );
}

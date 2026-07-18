import { useState, type FormEvent } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useApartmentContext } from '@/auth/ApartmentProvider'
import { RequireActiveApartment } from '@/components/RequireActiveApartment'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import {
  deleteDocument,
  documentDownloadUrl,
  listDocuments,
  uploadDocument,
} from '@/lib/api'
import { getAccessToken } from '@/lib/storage'

function DocumentsInner() {
  const { activeApartmentId } = useApartmentContext()
  const apartmentId = activeApartmentId!
  const queryClient = useQueryClient()
  const [title, setTitle] = useState('')
  const [file, setFile] = useState<File | null>(null)

  const documentsQuery = useQuery({
    queryKey: ['documents', apartmentId],
    queryFn: () => listDocuments(apartmentId),
  })

  const uploadMutation = useMutation({
    mutationFn: async () => {
      if (!file) {
        throw new Error('File required')
      }
      return uploadDocument(apartmentId, title.trim(), file)
    },
    onSuccess: async () => {
      setTitle('')
      setFile(null)
      await queryClient.invalidateQueries({ queryKey: ['documents', apartmentId] })
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteDocument(apartmentId, id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['documents', apartmentId] })
    },
  })

  const onSubmit = (event: FormEvent) => {
    event.preventDefault()
    uploadMutation.mutate()
  }

  const download = async (documentId: string, fileName: string) => {
    const token = getAccessToken()
    const response = await fetch(documentDownloadUrl(apartmentId, documentId), {
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    })
    if (!response.ok) {
      return
    }
    const blob = await response.blob()
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = fileName
    anchor.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold">Documents</h2>
        <p className="text-sm text-muted-foreground">
          Archive files for the active unit (max 2MB, thesis R4).
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Upload</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="grid gap-3 sm:grid-cols-2" onSubmit={onSubmit}>
            <Input
              required
              placeholder="Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
            <Input
              required
              type="file"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            />
            <Button type="submit" className="sm:col-span-2" disabled={uploadMutation.isPending || !file}>
              {uploadMutation.isPending ? 'Uploading…' : 'Upload document'}
            </Button>
          </form>
        </CardContent>
      </Card>

      <div className="space-y-2">
        {(documentsQuery.data ?? []).map((doc) => (
          <Card key={doc.id}>
            <CardContent className="flex flex-wrap items-center justify-between gap-3 py-4">
              <div>
                <p className="font-medium">{doc.title}</p>
                <p className="text-sm text-muted-foreground">
                  {doc.fileName} · {(doc.sizeBytes / 1024).toFixed(1)} KB
                </p>
              </div>
              <div className="flex gap-2">
                <Button type="button" variant="outline" size="sm" onClick={() => download(doc.id, doc.fileName)}>
                  Download
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => deleteMutation.mutate(doc.id)}
                >
                  Delete
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

export function DocumentsPage() {
  return (
    <RequireActiveApartment>
      <DocumentsInner />
    </RequireActiveApartment>
  )
}

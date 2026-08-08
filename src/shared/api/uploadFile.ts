import type { AxiosProgressEvent, AxiosRequestConfig } from 'axios'
import type { z } from 'zod'

import { unwrap } from './envelope'
import { http } from './instance'

interface UploadOptions<TSchema extends z.ZodType> {
  file: File
  schema: TSchema
  /** 0 到 1。大文件必须有进度反馈,否则界面看起来像卡死。 */
  onProgress?: (ratio: number) => void
  signal?: AbortSignal
}

/**
 * 不设 Content-Type:交给 axios 依据 FormData 生成带 boundary 的头,手写会让后端解析不出分段。
 */
export async function uploadFile<TSchema extends z.ZodType>(
  path: string,
  { file, schema, onProgress, signal }: UploadOptions<TSchema>,
): Promise<z.output<TSchema>> {
  const form = new FormData()
  form.append('file', file)

  const config: AxiosRequestConfig = {
    ...(signal === undefined ? {} : { signal }),
    ...(onProgress === undefined
      ? {}
      : {
          onUploadProgress: (event: AxiosProgressEvent) => {
            // total 缺失时算不出比例,直接不报,避免进度条跳回 0
            if (event.total === undefined) return
            onProgress(event.loaded / event.total)
          },
        }),
  }

  const response = await http.post<unknown>(path, form, config)

  return unwrap(path, response.data, schema)
}

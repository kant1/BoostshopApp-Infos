/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SUPABASE_FUNCTIONS_URL: string
  readonly VITE_API_AUTH_TOKEN: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
}

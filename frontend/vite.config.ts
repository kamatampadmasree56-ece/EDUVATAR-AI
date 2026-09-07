import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

function toLucideIconPath(name: string) {
  return name
    .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
    .replace(/([A-Z])([A-Z][a-z])/g, '$1-$2')
    .replace(/([A-Za-z])([0-9])/g, '$1-$2')
    .toLowerCase();
}

const lucideDirectImportPlugin = {
  name: 'lucide-direct-imports',
  enforce: 'pre' as const,
  transform(code: string, id: string) {
    if (!/\.[jt]sx?$/.test(id) || !code.includes("from 'lucide-react'")) {
      return null;
    }

    const transformed = code.replace(
      /import\s*{([^}]+)}\s*from\s*['"]lucide-react['"];?/g,
      (_match, imports: string) => imports
        .split(',')
        .map((entry) => entry.trim())
        .filter(Boolean)
        .map((entry) => {
          const [imported, local = imported] = entry.split(/\s+as\s+/);
          return `import ${local} from 'lucide-react/dist/esm/icons/${toLucideIconPath(imported)}.js';`;
        })
        .join('\n')
    );

    return transformed === code ? null : { code: transformed, map: null };
  },
};

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [lucideDirectImportPlugin, react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5173,
    host: true,
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
      },
      '/ws': {
        target: 'ws://127.0.0.1:8000',
        ws: true,
      },
    },
  },
});

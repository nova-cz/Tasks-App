# Supabase Setup

## 1) GitHub OAuth
1. En GitHub > Settings > Developer settings > OAuth Apps, crea una nueva OAuth App:
   - Application name: tu preferencia
   - Homepage URL: http://localhost:3000
   - Authorization callback URL: copia el `Callback URL (for OAuth)` que ves en Supabase (formato `https://<project>.supabase.co/auth/v1/callback`).
2. Copia el `Client ID` y `Client Secret` reales de GitHub.
3. En Supabase > Authentication > Providers > GitHub, pega esos valores y habilita el proveedor.
4. En Supabase > Authentication > URL Configuration, define `SITE URL` como `http://localhost:3000` para desarrollo.

Nota: En el campo `Client ID` NO va tu email; debe ser el ID que empieza con `Iv...` que te da GitHub.

## 2) Variables de entorno locales
Crea `.env.local` (ya existe un ejemplo) con:
```
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
```
Reinicia `pnpm dev` tras cambiar `.env.local`.

## 3) Esquema de base de datos
En Supabase > SQL Editor, pega y ejecuta `schema.sql` para crear tablas y políticas RLS.

## 4) Probar login
- Ve a `http://localhost:3000/profile` y usa “Iniciar sesión con GitHub”.
- Verifica en Supabase > Authentication > Users que se haya creado el usuario.

## 5) Siguientes pasos
- Conectar la UI a Supabase creando hooks (`hooks/useTasks.ts`) para CRUD.
- Guardar/leer tareas por `user_id` y `section_id`.
- Reemplazar datos mock en `TaskSections` y `DailyCalendar`.

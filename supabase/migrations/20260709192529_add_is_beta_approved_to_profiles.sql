ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS is_beta_approved BOOLEAN NOT NULL DEFAULT FALSE;

-- JR ya inició sesión antes (jrjottar@gmail.com) — aprobarlo directamente para no bloquearse a sí mismo
UPDATE public.profiles
SET is_beta_approved = TRUE
WHERE email = 'jrjottar@gmail.com';

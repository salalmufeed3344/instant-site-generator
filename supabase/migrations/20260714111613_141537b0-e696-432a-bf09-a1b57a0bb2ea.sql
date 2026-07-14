DELETE FROM public.organizations
WHERE name LIKE 'Toolixy QA %'
   OR (name = 'test-diag-xyz' AND created_by IS NULL);

ALTER TABLE public.organizations
  ALTER COLUMN created_by SET NOT NULL;
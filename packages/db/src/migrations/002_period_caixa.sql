-- Regime de caixa vs competência: cada lançamento passa a ter duas datas.
--   period       = data de competência (vencimento / due_date no ClickUp)
--   period_caixa = data da baixa efetiva (CF "Data Pagamento/Recebimento")
-- Visão competência filtra por period (sempre presente).
-- Visão caixa filtra por period_caixa; linhas sem baixa (NULL) não entram no caixa.

ALTER TABLE dre_entries ADD COLUMN IF NOT EXISTS period_caixa DATE;

CREATE INDEX IF NOT EXISTS idx_entries_period_caixa ON dre_entries(period_caixa);

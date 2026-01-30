-- Add Calendly integration settings
INSERT INTO system_settings (key, value, description)
VALUES (
  'calendly_integration',
  '{"enabled": false, "signing_key": null, "last_sync": null, "events_count": 0}',
  'Configurações de integração com Calendly para agendamento de sessões de feedback'
)
ON CONFLICT (key) DO NOTHING;
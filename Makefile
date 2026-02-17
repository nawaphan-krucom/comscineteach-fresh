## Makefile — convenience targets
.PHONY: tf-plan tf-apply emit-reset-test

# Run terraform plan for monitoring infra
tf-plan:
	cd infra/gcp/monitoring && terraform init && terraform plan -no-color

# Apply terraform plan (be careful)
tf-apply:
	cd infra/gcp/monitoring && terraform init && terraform apply -auto-approve

# Emit a synthetic reset error log for testing (requires GOOGLE_APPLICATION_CREDENTIALS or GCP_SA_KEY env)
emit-reset-test:
	node ./scripts/emit_reset_error_log.cjs --project=${GCP_PROJECT}

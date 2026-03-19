const ISO_NO_TIMEZONE_RE = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(?::\d{2}(?:\.\d{1,3})?)?$/;
const HAS_TIMEZONE_SUFFIX_RE = /(Z|[+-]\d{2}:\d{2})$/i;

const normalizeLegacyCampaignDateString = (value: string) => {
	const trimmed = value.trim();
	if (!trimmed) return trimmed;
	if (ISO_NO_TIMEZONE_RE.test(trimmed) && !HAS_TIMEZONE_SUFFIX_RE.test(trimmed)) {
		return `${trimmed}Z`;
	}
	return trimmed;
};

export const parseCampaignDate = (value: unknown) => {
	if (!value) return null;
	if (value instanceof Date) {
		return Number.isNaN(value.getTime()) ? null : value;
	}
	if (typeof value !== "string") return null;

	const parsed = new Date(normalizeLegacyCampaignDateString(value));
	return Number.isNaN(parsed.getTime()) ? null : parsed;
};

export const normalizeCampaignDateInput = (value: unknown) => {
	const parsed = parseCampaignDate(value);
	if (!parsed) return value;
	return parsed.toISOString();
};

export const serializeCampaignDate = (value: unknown) => {
	const parsed = parseCampaignDate(value);
	if (!parsed) return typeof value === "string" ? value.trim() : value;
	return parsed.toISOString();
};

export const normalizeCampaignDatesForResponse = <T extends Record<string, any>>(campaignDoc: T): T => ({
	...campaignDoc,
	starts_at: serializeCampaignDate(campaignDoc.starts_at),
	ends_at: serializeCampaignDate(campaignDoc.ends_at),
});
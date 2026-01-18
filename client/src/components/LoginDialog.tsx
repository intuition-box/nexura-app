import React, { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { useAuth } from "../lib/auth";

export default function LoginDialog({ onClose }: { onClose?: () => void }) {
	const { signUp } = useAuth();
	const [username, setUsername] = useState("");
	const [referrer, setReferrer] = useState("");
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	async function handleSubmit(e?: React.FormEvent) {
		e?.preventDefault();
		setError(null);
		if (!username || username.length < 4) {
			setError("Username must be at least 4 characters");
			return;
		}
		try {
			setLoading(true);
			await signUp(username, referrer || undefined);
			onClose?.();
		} catch (err: any) {
			setError(err?.message || String(err));
		} finally {
			setLoading(false);
		}
	}

	return (
		<form onSubmit={handleSubmit} className="max-w-sm p-4 space-y-3">
			<div>
				<label className="block text-sm text-muted-foreground mb-1">Username</label>
				<Input value={username} onChange={(e) => setUsername(e.target.value)} placeholder="choose a username" />
			</div>
			<div>
				<label className="block text-sm text-muted-foreground mb-1">Referrer (optional)</label>
				<Input value={referrer} onChange={(e) => setReferrer(e.target.value)} placeholder="referrer code" />
			</div>
			{error && <div className="text-sm text-red-500">{error}</div>}
			<div className="flex gap-2">
				<Button type="submit" disabled={loading}>{loading ? "Creating..." : "Create Account"}</Button>
				<Button type="button" variant="ghost" onClick={() => onClose?.()}>Cancel</Button>
			</div>
		</form>
	);
}

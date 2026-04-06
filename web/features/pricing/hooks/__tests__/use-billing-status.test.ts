// Test trialDaysRemaining logic in isolation (pure function extraction)
// The fix: use data?.trialEndsAt instead of sub?.currentPeriodEnd

function trialDaysRemaining(data: { trialEndsAt: string | null } | null): number | null {
    if (!data?.trialEndsAt) return null;
    const end = new Date(data.trialEndsAt).getTime();
    const now = Date.now();
    if (end <= now) return null;
    return Math.ceil((end - now) / (1000 * 60 * 60 * 24));
}

it("returns days until trialEndsAt, not currentPeriodEnd", () => {
    const trialEnd = new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(); // 10 days from now
    const result = trialDaysRemaining({ trialEndsAt: trialEnd });
    expect(result).toBe(10);
});

it("returns null when trialEndsAt is null", () => {
    expect(trialDaysRemaining({ trialEndsAt: null })).toBeNull();
});

it("returns null when data is null", () => {
    expect(trialDaysRemaining(null)).toBeNull();
});

it("returns null when trial has already ended", () => {
    const pastDate = new Date(Date.now() - 1000).toISOString();
    expect(trialDaysRemaining({ trialEndsAt: pastDate })).toBeNull();
});

import type { SettingsScreenData } from "@/types/workspace";

type SettingsScreenProps = {
  data: SettingsScreenData;
};

export function SettingsScreen({ data }: SettingsScreenProps) {
  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-10 flex items-center justify-between border-b border-[var(--border)] bg-[var(--background)] px-7 py-4">
        <div className="flex flex-col gap-[1px]">
          <span className="text-[10px] font-medium uppercase tracking-[0.08em] text-[var(--muted-soft)]">
            / Settings
          </span>
          <h1 className="text-[18px] font-semibold tracking-[-0.4px] text-[var(--foreground)]">
            Settings
          </h1>
        </div>

        <div className="flex items-center gap-[6px]">
          <button className="rounded-[7px] border border-[var(--border)] bg-white px-3 py-2 text-[12px] font-medium text-[var(--muted)] transition hover:border-[var(--border-strong)] hover:text-[var(--foreground)]">
            Reset Defaults
          </button>
          <button className="rounded-[7px] bg-[var(--foreground)] px-3 py-2 text-[12px] font-medium text-white transition hover:opacity-85">
            Save Changes
          </button>
        </div>
      </header>

      <div className="flex flex-col gap-6 px-7 py-6">
        <section className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1.15fr)_minmax(320px,0.85fr)]">
          <div className="space-y-6">
            {data.groups.map((group) => (
              <div key={group.title} className="rounded-[10px] border border-[var(--border)] bg-white">
                <div className="border-b border-[var(--border-light)] px-[18px] py-3">
                  <p className="text-[10px] font-medium uppercase tracking-[0.08em] text-[var(--muted-soft)]">
                    / {group.title}
                  </p>
                </div>
                <div className="space-y-3 px-[18px] py-4">
                  {group.items.map((item) => (
                    <div key={item.label} className="flex items-center justify-between gap-4 text-[12px]">
                      <span className="text-[var(--muted-soft)]">{item.label}</span>
                      <span className="font-medium text-[var(--foreground)]">{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}

            <div className="rounded-[10px] border border-[var(--border)] bg-white">
              <div className="border-b border-[var(--border-light)] px-[18px] py-3">
                <p className="text-[10px] font-medium uppercase tracking-[0.08em] text-[var(--muted-soft)]">
                  / Workspace Preferences
                </p>
              </div>
              <div className="space-y-3 px-[18px] py-4">
                {data.preferences.map((preference) => (
                  <div key={preference.label} className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-[12px] text-[var(--foreground)]">{preference.label}</p>
                    </div>
                    <button
                      type="button"
                      className={[
                        "relative inline-flex h-6 w-11 items-center rounded-full border transition",
                        preference.enabled
                          ? "border-[var(--success-border)] bg-[var(--success-bg)]"
                          : "border-[var(--border)] bg-[var(--background)]"
                      ].join(" ")}
                    >
                      <span
                        className={[
                          "absolute h-4 w-4 rounded-full bg-white shadow-sm transition",
                          preference.enabled ? "left-[22px]" : "left-[3px]"
                        ].join(" ")}
                      />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-[10px] border border-[var(--border)] bg-white">
              <div className="border-b border-[var(--border-light)] px-[18px] py-3">
                <p className="text-[10px] font-medium uppercase tracking-[0.08em] text-[var(--muted-soft)]">
                  / Integrations
                </p>
              </div>
              <div className="space-y-4 px-[18px] py-4">
                {data.apiSettings.map((setting) => (
                  <div key={setting.label} className="flex items-center justify-between gap-4 text-[12px]">
                    <span className="text-[var(--muted-soft)]">{setting.label}</span>
                    <span className="font-medium text-[var(--foreground)]">{setting.value}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-[10px] border border-[var(--border)] bg-white">
              <div className="border-b border-[var(--border-light)] px-[18px] py-3">
                <p className="text-[10px] font-medium uppercase tracking-[0.08em] text-[var(--muted-soft)]">
                  / Security
                </p>
              </div>
              <div className="space-y-3 px-[18px] py-4 text-[11.5px] text-[var(--muted)]">
                {data.securityNotes.map((note) => (
                  <p key={note}>{note}</p>
                ))}
              </div>
            </div>

            <div className="rounded-[10px] border border-[var(--border)] bg-white">
              <div className="border-b border-[var(--border-light)] px-[18px] py-3">
                <p className="text-[10px] font-medium uppercase tracking-[0.08em] text-[var(--muted-soft)]">
                  / Team
                </p>
              </div>
              <div className="space-y-4 px-[18px] py-4">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-[12px] text-[var(--foreground)]">Workspace plan</p>
                    <p className="mt-1 text-[11.5px] text-[var(--muted-soft)]">{data.workspacePlanMeta}</p>
                  </div>
                  <span className="rounded-[5px] border border-[var(--processing-border)] bg-[var(--processing-bg)] px-2 py-[3px] text-[11.5px] font-medium text-[var(--processing)]">
                    {data.workspacePlan}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-[12px] text-[var(--foreground)]">Review access</p>
                    <p className="mt-1 text-[11.5px] text-[var(--muted-soft)]">{data.teamSummary}</p>
                  </div>
                  <button className="rounded-[7px] border border-[var(--border)] bg-white px-3 py-2 text-[12px] font-medium text-[var(--muted)] transition hover:border-[var(--border-strong)] hover:text-[var(--foreground)]">
                    Manage
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

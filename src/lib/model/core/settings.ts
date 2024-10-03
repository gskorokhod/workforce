export interface Settings {
  development: boolean;
  assignmentMode: "shift" | "granular";
}

export const SETTINGS_DEFAULTS: Settings = {
  development: true,
  assignmentMode: "shift"
};

const SETTINGS_LABELS: SettingsLabels = {
  development: {
    name: "Development Mode",
    description:
      "Enable development features, such as dummy data generation and the UI playground. Disable in production!"
  },
  assignmentMode: {
    name: "Assignment Mode",
    description: "Choose how employee workload is managed within your organisation",
    labels: {
      granular: "Granular",
      shift: "Shift-based"
    },
    descriptions: {
      granular:
        "Each Shift comprises a number of Tasks that need to be done, and employees are assigned to individual Tasks during the Shift",
      shift:
        "Employees are assigned directly to Shifts, without planning their individual tasks within the Shift"
    }
  }
};

export function getSetting<K extends keyof Settings>(key: K, settings: Partial<Settings>): Setting<K> {
  const name = SETTINGS_LABELS[key].name;
  const description = SETTINGS_LABELS[key].description;
  const value = settings[key] ?? SETTINGS_DEFAULTS[key];

  const ans: Setting<K> = {
    key,
    name,
    description,
    option: {
      value,
      isDefault: value === SETTINGS_DEFAULTS[key]
    }
  };

  const labels = SETTINGS_LABELS[key].labels;
  if (labels) {
    ans.option.name = labels[value];
  }

  const descriptions = SETTINGS_LABELS[key].descriptions;
  if (descriptions) {
    ans.option.description = descriptions[value];
  }

  return ans;
}

type Setting<K extends keyof Settings> = {
  key: K;
  name: string;
  description?: string;
  option: {
    value: Settings[K];
    isDefault: boolean;
    name?: string;
    description?: string;
  };
};


type SettingsLabels = {
  [K in keyof Settings]: {
    name: string;
    description?: string;
    labels?: Partial<Record<SettingValue<K>, string>>;
    descriptions?: Partial<Record<SettingValue<K>, string>>;
  };
};

// Primitive values of the setting to provide labels for
type SettingValue<K extends keyof Settings> = Keyify<Settings[K]>;
// Take all primitives from a union and convert them to valid key types, discard all other members
type Keyify<T> = T extends string | number | symbol
  ? T
  : T extends bigint | boolean | null | undefined
    ? `${T}`
    : never;

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
      "Enable development features, such as dummy data generation and the UI playground. Disable in production!",
    options: {
      "true": {
        label: "Enabled"
      },
      "false": {
        label: "Disabled"
      }
    }
  },
  assignmentMode: {
    name: "Assignment Mode",
    description: "Choose how employee workload is managed within your organisation",
    options: {
      "shift": {
        label: "Shift-based",
        description: "Employees are assigned directly to Shifts, without planning their individual tasks within the Shift"
      },
      "granular": {
        label: "Granular",
        description: "Each Shift comprises a number of Tasks that need to be done, and employees are assigned to individual Tasks during the Shift"
      }
    }
  }
};

export function getSetting<K extends keyof Settings>(key: K, settings: Partial<Settings>): Setting<K> {
  const name = SETTINGS_LABELS[key].name;
  const description = SETTINGS_LABELS[key].description;
  const value = settings[key] ?? SETTINGS_DEFAULTS[key];
  const options = 

  const ans: Setting<K> = {
    key,
    name,
    description,
    selected: {
      value,
      isDefault: value === SETTINGS_DEFAULTS[key]
    },
  };

  return ans;
}

interface SettingOption<K extends keyof Settings> {
  value: Settings[K];
  isDefault: boolean;
  name?: string;
  description?: string;
}

type Setting<K extends keyof Settings> = {
  key: K;
  name: string;
  description?: string;
  selected: SettingOption<K>,
  options: SettingOption<K>[];
};

type SettingsLabels = {
  [K in keyof Settings]: {
    name: string;
    description?: string;
    options: Record<SettingValue<K>, {
      label: string,
      description?: string
    }>
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
